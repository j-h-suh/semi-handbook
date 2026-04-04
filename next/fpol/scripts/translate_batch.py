#!/usr/bin/env python3
"""
FPOL Ch1 batch translator — called by Queen via cron.
Reads state file, translates next 5 pages, updates state.
"""

import base64, json, os, sys, time, urllib.request, re

PDF_OFFSET = 14
PAGES_DIR = "/Users/jenghun.suh/.openclaw/TheBoard/fpol/pages/ch01"
OUTPUT_DIR = "/Users/jenghun.suh/.openclaw/TheBoard/fpol/chapters/ch01_raw"
STATE_FILE = "/Users/jenghun.suh/.openclaw/TheBoard/fpol/translation_state.json"

# Load API key
with open(os.path.expanduser("~/.openclaw/openclaw.json")) as f:
    config = json.load(f)
API_KEY = config["skills"]["entries"]["nano-banana-pro"]["apiKey"]
API_URL = "http://127.0.0.1:8045/v1/chat/completions"
MODEL = "gemini-3-pro-high"

SYSTEM_PROMPT = '''당신은 반도체 광 리소그래피 전문 기술 번역가입니다. 영어 교과서 페이지 이미지를 한국어 마크다운으로 번역합니다.

## 반드시 제거할 것
- 페이지 헤더/푸터 (책 제목, 페이지 번호 등). 완전히 무시하세요.
- 저작권 표시

## 페이지 경계 처리 (매우 중요)
- 이전 페이지에서 이어지는 문장이 있으면, 해당 문장의 나머지 부분부터 바로 시작하세요.
- 이전 페이지에서 이미 번역된 내용은 절대 반복하지 마세요.
- 현재 페이지 하단에서 문장이 중간에 잘리면, 보이는 텍스트까지만 번역하고 그대로 끝내세요. "..."를 붙이지 마세요. 문장을 임의로 완성하지 마세요.

## 문체
- 교과서 평서체: "~이다", "~한다", "~된다"
- 경어체(~합니다) 절대 사용 금지

## 마크다운 포맷팅
- bold 사용 금지
- 외국어 원어(라틴어, 그리스어 등)는 italic 허용
- 그 외 일반 텍스트에 italic 사용 금지
- 제목/헤딩(##, ###)만 마크다운 문법 사용

## 기술 용어
- 첫 등장 시: 한국어(영어) 병기
- 이후: 한국어만

## 수식
- 인라인: $...$, 블록: $$...$$
- 수식 번호: $$ ... \\\\tag{X.X} $$
- 수식 누락 금지

## 그림/표
- [Figure X.X] 한국어 캡션
- 그림 내부 레이블은 캡션 아래 간단히 설명 (bold 없이)
'''


def translate_page(chapter_num, page_num, prev_context=""):
    img_path = os.path.join(PAGES_DIR, f"p{page_num:04d}.png")
    if not os.path.exists(img_path):
        return f"<!-- ERROR: {img_path} not found -->"

    with open(img_path, "rb") as f:
        header = f.read(4)
    media_type = "image/png" if header[:4] == b'\x89PNG' else "image/jpeg"

    with open(img_path, "rb") as f:
        img_data = base64.b64encode(f.read()).decode("utf-8")

    user_text = f"이 교과서 페이지(p.{page_num}, Chapter {chapter_num})를 한국어 마크다운으로 번역하세요."

    if prev_context:
        user_text += f"""

[중요: 이전 페이지 번역의 마지막 부분]
\"\"\"{prev_context}\"\"\"

위 내용은 이미 번역 완료되었습니다. 현재 페이지가 위 문장의 연속이라면, 이어지는 부분부터 시작하세요. 위에서 이미 번역된 내용을 반복하지 마세요."""

    payload = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": [
                {"type": "text", "text": user_text},
                {"type": "image_url", "image_url": {"url": f"data:{media_type};base64,{img_data}"}}
            ]}
        ],
        "max_tokens": 4096,
        "temperature": 0.1
    }

    for attempt in range(3):
        try:
            req = urllib.request.Request(
                API_URL,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json", "Authorization": f"Bearer {API_KEY}"}
            )
            with urllib.request.urlopen(req, timeout=120) as resp:
                result = json.loads(resp.read().decode("utf-8"))
                return result["choices"][0]["message"]["content"].strip()
        except Exception as e:
            print(f"  Attempt {attempt+1}/3 failed: {e}")
            if attempt < 2:
                time.sleep(5 * (attempt + 1))

    return f"<!-- ERROR: Translation failed for p.{page_num} -->"


def get_last_context(text, max_chars=400):
    """Extract last meaningful paragraph for context passing."""
    paragraphs = [p.strip() for p in text.split("\n\n")
                  if p.strip() and not p.strip().startswith("[Figure")
                  and not p.strip().startswith("<!--")]
    if not paragraphs:
        return ""
    last_p = paragraphs[-1]
    sentences = re.split(r'(?<=[.다])\s', last_p)
    ctx = " ".join(sentences[-2:]) if len(sentences) > 1 else last_p
    return ctx[-max_chars:] if len(ctx) > max_chars else ctx


def run_batch():
    # Load state
    with open(STATE_FILE) as f:
        state = json.load(f)

    if state["status"] == "done":
        print("Ch1 translation already complete.")
        return "done"

    next_page = state["next_page"]
    end_page = min(next_page + state["batch_size"] - 1, state["page_end"])

    if next_page > state["page_end"]:
        state["status"] = "done"
        with open(STATE_FILE, "w") as f:
            json.dump(state, f, indent=2, ensure_ascii=False)
        print("Ch1 translation complete!")
        return "done"

    print(f"Batch: p.{next_page}-{end_page}")

    # Load previous context if exists
    prev_context = ""
    if next_page > state["page_start"]:
        prev_file = os.path.join(OUTPUT_DIR, f"p{next_page-1:04d}.md")
        if os.path.exists(prev_file):
            with open(prev_file) as f:
                prev_context = get_last_context(f.read())

    batch_results = []
    for page_num in range(next_page, end_page + 1):
        print(f"  Translating p.{page_num}...", end=" ", flush=True)
        t0 = time.time()
        content = translate_page(1, page_num, prev_context)
        elapsed = time.time() - t0
        print(f"done ({elapsed:.1f}s, {len(content)} chars)")

        # Save individual page
        out_file = os.path.join(OUTPUT_DIR, f"p{page_num:04d}.md")
        with open(out_file, "w", encoding="utf-8") as f:
            f.write(content)

        batch_results.append(page_num)
        prev_context = get_last_context(content)

        if page_num < end_page:
            time.sleep(2)

    # Update state
    state["completed_pages"].extend(batch_results)
    state["next_page"] = end_page + 1
    state["batches"].append({
        "pages": f"{next_page}-{end_page}",
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "count": len(batch_results)
    })
    if state["next_page"] > state["page_end"]:
        state["status"] = "done"

    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2, ensure_ascii=False)

    status = state["status"]
    done = len(state["completed_pages"])
    total = state["total_pages"]
    print(f"Batch complete. Progress: {done}/{total} ({status})")
    return status


if __name__ == "__main__":
    run_batch()

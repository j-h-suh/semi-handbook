---
name: resolve-post
description: 게시판 수정요청/질문 게시글을 처리하고 완료 표시
allowed-tools: Bash(git *), Read, Edit, Write, Glob, Grep, mcp__supabase__execute_sql, Agent
---

## Context

- Supabase project ID: `oozudujkoybuhnrmxuin`
- 현재 git 상태: !`git status --short`
- 현재 브랜치: !`git branch --show-current`

## Your task

게시판의 수정요청 또는 질문 게시글을 처리하는 워크플로우를 수행합니다.

### 1단계: 대기 중인 게시글 조회
- Supabase에서 `status = '대기'`인 `수정요청` 및 `질문` 게시글을 조회합니다.
- 사용자에게 목록을 보여주고 처리할 게시글을 선택하게 합니다.

### 2단계: 관련 콘텐츠 분석
- 게시글의 제목/내용을 기반으로 관련 콘텐츠 파일을 찾아 읽습니다.
- `content/` 디렉토리의 `.md` 파일, `src/components/diagrams/` 의 관련 컴포넌트, `public/content/semi/images/` 의 이미지를 확인합니다.

### 3단계: 수정 방향 제안
- 게시글 요청 내용을 분석하여 구체적인 수정 계획을 사용자에게 제안합니다.
- 본문, 그래프/다이어그램, 이미지 스펙 등 수정이 필요한 모든 파일을 명시합니다.
- **반드시 사용자 승인을 받은 후** 다음 단계로 진행합니다.

### 4단계: 수정 작업
- 승인된 계획에 따라 파일을 수정합니다.
- 빌드가 필요한 경우 `npx next build` 로 검증합니다.

### 5단계: 마무리 (커밋 + 댓글 + 완료 처리 + push)
- 변경 파일을 git commit 합니다. (커밋 메시지는 CLAUDE.md의 컨벤션을 따릅니다)
- 해당 게시글에 처리 내용을 요약한 댓글을 추가합니다. (닉네임: '관리자', password_hash: '')
- 게시글 status를 '완료'로 업데이트합니다.
- `git push` 합니다.

### 주의사항
- 각 단계에서 사용자 확인이 필요한 경우 반드시 물어봅니다.
- 이미지 파일이 필요한 요청은 사용자에게 알립니다.
- 하나의 게시글 = 하나의 커밋 원칙을 지킵니다.

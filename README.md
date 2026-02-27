# 반도체를 여행하는 세미에이아이를 위한 안내서

> AI 엔지니어가 반도체 제조 공정을 이해하기 위한 인터랙티브 핸드북

## 소개

반도체 산업에 진입하는 AI/ML 엔지니어를 위해, 웨이퍼부터 칩까지의 제조 공정을 **소프트웨어 엔지니어의 관점**으로 설명하는 온라인 교재입니다. 인터랙티브 다이어그램, 수식 렌더링, AI 어시스턴트가 내장되어 있습니다.

## 목차

| Part | 내용 | 챕터 수 |
|------|------|---------|
| 들어가며 | 이 책의 목적과 독자 | 1 |
| Part 1 | 반도체 제조 기초 | 10 |
| Part 2 | 포토리소그래피 심화 | 10 |
| Part 3 | 수율 공학과 결함 분석 | — |
| Part 4 | AI와 반도체 제조 | — |
| Part 5 | 실무 레퍼런스 | — |

## 기술 스택

- **프레임워크**: Next.js 16 (Turbopack)
- **차트**: Recharts
- **애니메이션**: Framer Motion
- **수식**: KaTeX
- **다이어그램**: Mermaid + 커스텀 React SVG 컴포넌트
- **AI 채팅**: Gemini API (사이드바 내장)
- **배포**: Vercel

## 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인할 수 있습니다.

## 프로젝트 구조

```
semi-handbook/
├── content/              # 마크다운 챕터 파일
├── src/
│   ├── app/              # Next.js App Router 페이지
│   ├── components/
│   │   ├── diagrams/     # 인터랙티브 다이어그램 컴포넌트
│   │   ├── MarkdownViewer.tsx
│   │   ├── QnAPanel.tsx  # AI 사이드바
│   │   └── Sidebar.tsx
│   └── lib/
│       └── markdown.ts   # 마크다운 파싱 유틸
└── public/
    └── content/images/   # 정적 이미지
```

## 인터랙티브 다이어그램

마크다운에서 이미지 경로를 참조하면, `diagramRegistry.ts`에 등록된 React 컴포넌트로 자동 교체됩니다. 모든 다이어그램은 `diagramTokens.ts`의 공통 디자인 토큰(폰트, 색상)을 사용합니다.

## 라이선스

MIT

import type { ComponentType } from 'react';

// Agent SDK 핸드북 다이어그램 레지스트리.
// 다이어그램 컴포넌트 추가 시:
//   1. src/components/diagrams/ 에 컴포넌트 파일 생성
//   2. dynamic import 추가
//   3. 아래 registry 에 경로 → 컴포넌트 매핑 추가
export const agentSdkDiagramRegistry: Record<string, ComponentType> = {};

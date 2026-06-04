// 전 페이지 게이트 — 미인증 사용자는 Entra 로그인으로 리다이렉트한다.
// (Next 16: 기존 middleware 규약이 proxy 로 이름이 바뀜)
export { auth as proxy } from '@/auth';

export const config = {
    // 인증 엔드포인트(/api/auth/*)와 Next 정적 자산만 예외, 나머지는 전부 로그인 뒤로.
    matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};

import NextAuth from 'next-auth';
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id';

// 전사 SSO — Microsoft Entra ID (회사 MS 계정).
//  - JWT 세션(DB 어댑터 없음) → Edge 미들웨어에서 그대로 동작하고 DB 가 필요 없다.
//  - 단일 테넌트 issuer 로 회사 디렉터리 사용자만 로그인 허용.
//  - AUTH_* 환경변수가 비어도 빌드/구동은 통과하고, 실제 로그인 시점에만 필요하다.
export const { handlers, auth, signIn, signOut } = NextAuth({
    // Cloud Run 등 비-localhost 호스트 뒤에서 호스트 헤더를 신뢰 (콜백 URL 생성에 필요)
    trustHost: true,
    providers: [
        MicrosoftEntraID({
            clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
            clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
            issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER,
        }),
    ],
    callbacks: {
        // 매칭된 모든 경로에서 로그인 필수 — 미인증이면 Entra 로그인으로 리다이렉트
        authorized: ({ auth }) => Boolean(auth),
    },
});

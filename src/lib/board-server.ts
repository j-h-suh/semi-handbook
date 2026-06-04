import { createHash } from 'crypto';

// 클라이언트가 쓰던 WebCrypto SHA-256(hex) 과 동일 방식 — 기존 해시와 호환.
// 비번 검증은 이제 전적으로 서버에서 수행한다(password_hash 는 클라이언트로 안 내려감).
export function hashPassword(pw: string): string {
    return createHash('sha256').update(pw, 'utf8').digest('hex');
}

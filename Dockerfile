# syntax=docker/dockerfile:1
#
# semi-handbook 단일 컨테이너 이미지 (Next.js standalone)
#
# 빌드 주의:
#  - builder 스테이지는 인터넷이 필요하다 (next/font/google 폰트 다운로드).
#    폐쇄망 빌드 서버면 next/font/local 로 전환할 것.
#  - 챕터 "마지막 수정일/이력" 을 쓰려면 (1) .git 을 빌드 컨텍스트에 포함하고
#    (2) builder 에 git 바이너리를 설치해야 한다. 기본은 생략(이력은 비워짐, 앱은 정상).
#  - 런타임 이미지엔 비밀값이 하나도 안 박힌다 — 전부 런타임 env 주입.

# ---- deps: 의존성 설치 ----
FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- builder: 빌드 (.next/standalone 생성) ----
FROM node:20-slim AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- runner: 최소 런타임 이미지 ----
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid nodejs nextjs

# standalone 서버 + 정적 자산 (semi 이미지는 public/ 에 포함됨)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000

# standalone 모드는 .next/standalone/server.js 를 진입점으로 띄운다
CMD ["node", "server.js"]

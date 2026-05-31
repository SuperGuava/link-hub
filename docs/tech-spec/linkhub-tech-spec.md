# LinkHub - Technical Specification

## Source Tree Structure

```
/ (Next.js 단일 리포지토리)
├─ docs/                         # PRD, Tech Spec 등 문서
├─ app/
│  ├─ (public)/
│  │  ├─ login/page.tsx          # 소셜 로그인 진입
│  │  ├─ pricing/page.tsx        # Free/Pro 플랜 비교
│  │  └─ redirect/[slug]/page.tsx # 단축 URL 리다이렉션 (Server Component)
│  ├─ dashboard/
│  │  ├─ page.tsx                # 링크 목록 및 관리 (Server Component)
│  │  ├─ actions.ts              # 링크 생성/수정/삭제 Server Actions
│  │  └─ links/[id]/
│  │      ├─ page.tsx            # 링크 상세·편집 (Server Component)
│  │      └─ actions.ts          # 링크별 Server Actions
│  ├─ api/                       # 외부 API/웹훅 전용 Route Handlers
│  │  ├─ redirects/[slug]/route.ts # 리다이렉션 조회 API (Edge Runtime)
│  │  ├─ auth/[...nextauth]/route.ts # Better Auth 핸들러
│  │  └─ billing/toss/route.ts   # Toss Payments 웹훅 처리
│  └─ layout.tsx                 # Root Layout
├─ components/
│  ├─ ui/                         # ShadCN CLI가 생성한 원자 컴포넌트(Button, Dialog 등)
│  └─ shared/                     # 공유 컴포넌트 (Server/Client 명시)
├─ features/                     # 도메인별 기능 모듈
│  ├─ auth/
│  │  ├─ components/             # 인증 관련 컴포넌트
│  │  └─ hooks/                  # 세션 훅 등
│  ├─ billing/
│  │  ├─ components/             # 결제 관련 컴포넌트
│  │  └─ actions.ts             # 결제 Server Actions (필요시)
│  ├─ links/
│  │  ├─ components/             # 링크 관련 컴포넌트 (Client Components)
│  │  └─ utils.ts               # 링크 도메인 유틸리티
│  └─ settings/
│      └─ utils.ts               # 환경 변수 검증 로직
├─ db/
│  ├─ schema/
│  │  ├─ index.ts                 # 스키마 export 집계
│  │  ├─ user.ts                  # Drizzle 테이블 정의
│  │  ├─ link.ts                  # Drizzle 테이블 정의
│  │  └─ subscription.ts          # Drizzle 테이블 정의
│  ├─ client.ts                   # Drizzle 인스턴스 및 Neon 연결
│  └─ seeds/                      # 초기 데이터/테스트 시드
├─ lib/
│  ├─ utils.ts                    # ShadCN 유틸 (cn 함수 등)
│  ├─ slug.ts                     # 슬러그 생성 유틸
│  ├─ plan.ts                     # 플랜 제한 계산 유틸
│  └─ logger.ts                   # 서버 로깅 도우미
├─ server/                        # 서버 전용 비즈니스 로직 (재사용 가능한 서비스 계층)
│  ├─ auth/                       # Better Auth 어댑터, 세션 미들웨어
│  ├─ billing/                    # Toss 결제/구독 서비스
│  ├─ links/                      # 링크 서비스 계층 (Server Actions에서 호출)
│  └─ webhooks/                   # Toss 웹훅 시그니처 검증
├─ styles/                        # 전역 스타일, 테마 토큰
├─ types/                         # 공유 TypeScript 타입 정의
├─ components.json                # ShadCN 컴포넌트 설정 메타
├─ drizzle/                      # drizzle-kit 마이그레이션 스냅샷 (자동 생성)
│  └─ migrations/
├─ drizzle.config.ts             # Drizzle Kit 설정 (schema: ./db/schema/index.ts, out: ./drizzle)
├─ scripts/                      # 배포 전 준비 스크립트 (예: 환경 변수 검사)
├─ package.json
├─ pnpm-lock.yaml                 # pnpm lockfile
├─ .env.example                   # 환경 변수 템플릿
└─ next.config.ts                 # Next.js 설정 (Next.js 16 이상, TypeScript)
```

---

## Technical Approach

- 단일 Next.js 16(App Router 기반) 애플리케이션으로 프런트와 백엔드를 통합해 MVP 개발 속도를 높인다.
- **Server Actions 우선**: 폼 제출, 데이터 변경(생성/수정/삭제)은 Server Actions(`app/dashboard/actions.ts`)를 사용해 타입 안전성과 간단한 에러 처리를 보장한다. Route Handlers(`app/api/`)는 외부 API 호출, 웹훅, OAuth 콜백 등 외부 통신 전용으로 제한한다.
- **Server Components 기본**: 페이지 컴포넌트는 기본적으로 Server Components로 작성하고, 인터랙티브가 필요한 경우에만 `'use client'`를 사용한다.
- UI는 ShadCN UI 컴포넌트를 기본으로 활용하고 Tailwind 테마 토큰을 브랜드 컬러에 맞게 재정의한다.
- 단축 URL 리다이렉션은 `redirect/[slug]/page.tsx`(Server Component) 또는 `app/api/redirects/[slug]/route.ts`(Edge Runtime)로 처리해 지연 시간을 최소화한다.
- 인증은 Better Auth를 Next.js Route Handler(`app/api/auth/[...nextauth]/route.ts`)에 연결하고, 세션 정보를 서버 컴포넌트에서 직접 조회해 클라이언트 상태 관리를 단순화한다.
- 데이터 저장은 Neon Postgres를 사용하고 Drizzle ORM + drizzle-kit으로 스키마·마이그레이션을 관리해 타입 안전성과 빠른 반복을 보장한다.
- 결제는 Toss Payments 결제창 기반 REST 연동을 채택하고, 결제 완료 및 구독 상태 동기화는 웹훅(`app/api/billing/toss/route.ts`)으로 처리한다.
- Free/Pro 플랜 정책은 서버 유틸(`lib/plan.ts`)로 캡슐화하여 Server Actions와 Route Handlers에서 일관된 검증을 수행한다.
- 서버 비즈니스 로직은 `server/` 폴더에 서비스 계층으로 분리해 Server Actions와 Route Handlers에서 재사용한다.
- 운영자는 환경 변수와 배포 상태를 `scripts/verify-env.ts` 같은 사전 점검 스크립트로 확인할 수 있게 한다.

---

## Implementation Stack

- 프런트엔드: Next.js 16 이상(App Router, Turbopack 기본 빌드), React Server Components, Server Actions, TypeScript, Tailwind CSS, ShadCN UI
- 백엔드: Next.js Server Actions(데이터 변경), Route Handlers(외부 API/웹훅), Edge Runtime(리다이렉션), Drizzle ORM
- 데이터베이스: Neon Postgres (Serverless), drizzle-orm + drizzle-kit
- 인증: Better Auth with Kakao OAuth
- 결제: Toss Payments (결제 페이지 + 웹훅)
- 인프라/배포: Vercel (Next.js), Neon (DB), Vercel Edge Functions
- 기타: Zod(입력 검증), Axios(외부 결제 API 호출), pino(서버 로깅), Prettier(코드 포맷팅), Playwright(E2E), Jest+Testing Library

---

## Technical Details

### 1. 링크 생성 및 전달 (FR001~FR003)

- **데이터 모델**
  - `Link`: `id`, `userId`, `originalUrl`, `slug`, `expiresAt`, `clickLimit`, `clickCount`, `status`, `createdAt`, `updatedAt`
  - `LinkEvent`: `id`, `linkId`, `eventType('CLICK')`, `origin`, `userAgent`, `createdAt` (추후 분석 확장 여지를 두지만 MVP에서는 clickCount 증가용으로만 사용)
- **생성 흐름**
  1. 사용자가 대시보드 폼을 제출하면 Server Action(`app/dashboard/actions.ts`의 `createLink`)이 호출된다.
  2. Server Action에서 입력을 Zod로 검증하고 `slug` 미입력 시 `crypto.randomUUID()` 기반 8자 문자열로 생성한다.
  3. `server/links/` 서비스 계층을 호출해 Drizzle 트랜잭션(`db.transaction`)으로 `Link`를 생성하고, Free 플랜인 경우 하루 생성 한도를 초과하지 않는지 `lib/plan.ts`에서 검증한다.
  4. Server Action이 성공하면 단축 URL(`https://brand.do/{slug}`)을 반환하고, 클라이언트 컴포넌트에서 `useActionState` 또는 `useFormState`로 결과를 처리해 Copy 버튼을 활성화한다.
- **리다이렉션**
  - `app/(public)/redirect/[slug]/page.tsx`(Server Component)에서 `db.query.links.findFirst`로 유효성 검사 후 `redirect(originalUrl)`.
  - 또는 `app/api/redirects/[slug]/route.ts`(Edge Runtime)를 사용해 더 빠른 응답을 제공할 수 있다.
  - `clickLimit` 초과, 만료된 링크는 410 상태 페이지로 응답.
  - clickCount 증가는 리다이렉션 후 비동기로 처리하거나, Server Action(`app/api/redirects/[slug]/route.ts` 내부)에서 처리한다.

### 2. 회원 및 구독 운영 (FR004~FR006)

- **인증**
  - Better Auth에 카카오 OAuth 클라이언트 등록.
  - 로그인 성공 시 `User` 테이블(`id`, `email`, `provider`, `planType`, `planExpiresAt`, `createdAt`)에 upsert(`db.insert(users).onConflictDoUpdate`) 처리.
  - 세션은 Better Auth의 JWT 세션을 사용하되, 서버 컴포넌트에서 `getSession()` 헬퍼로 호출.
- **플랜 및 구독**
  - `Subscription`: `id`, `userId`, `planType('FREE'|'PRO')`, `status`, `currentPeriodEnd`, `billingKey`, `createdAt`.
  - Free 플랜 기본 한도: 하루 생성 10개, 활성화된 링크 50개 (MVP 기준). Pro 플랜은 제한 없음.
  - 대시보드 진입 시 서버에서 `plan.evaluate(userId)`를 호출해 남은 할당량을 계산하고 UI에 노출.
- **결제(Toss Payments)**
  - 프런트에서 Toss Payments SDK를 통해 결제 요청 생성. 결제 승인 이후 Toss에서 웹훅 호출.
  - `/api/billing/toss/route.ts`에서 시그니처 검증 후 `Subscription` 상태 갱신, `planType`을 `PRO`로 업데이트 (`db.update(subscriptions)`).
  - 결제 실패 또는 취소 이벤트도 동일 웹훅에서 처리.
- **운영자의 환경 변수 검증**
  - `scripts/verify-env.ts`에서 `process.env`에 필수 값(도메인, PG 키, OAuth 키)이 존재하는지 체크.
  - 배포 파이프라인(Vercel)에서 프리 데플로이 훅으로 스크립트 실행.

### 3. 비기능 요구사항 대응

- **NFR001 (리다이렉션 지연 최소화)**: Edge 함수 사용, 슬러그 인덱스(`CREATE UNIQUE INDEX idx_links_slug`) 적용, 가능한 캐시 사용.
- **NFR002 (일관된 경험)**: Tailwind 기반 반응형 레이아웃, Better Auth의 커스텀 로그인 UI, Toss 결제창 모바일 대응 확인.
- **NFR003 (운영 가시성)**: 대시보드에 활성 링크, 만료 임박 링크, 구독 상태 요약 카드 제공. 서버 로깅은 pino + Vercel Log Drain, 결제 웹훅 이벤트는 Neon 테이블에 기록(`db.insert(linkEvents)`).

---

## Development Setup

1. **사전 요구사항**: Node.js 20.9 이상, pnpm, PostgreSQL 클라이언트(psql), Vercel CLI.
2. `pnpm install` 후 `cp .env.example .env.local`로 환경 변수 템플릿 복사.
3. Better Auth용 카카오 OAuth 클라이언트 키, Toss Payments API 키, Neon 접속 정보 입력.
4. `pnpm dlx shadcn@latest init`으로 ShadCN 기반 컴포넌트 세트 초기화 후, 필요한 컴포넌트를 `pnpm dlx shadcn@latest add form button dialog`처럼 추가.
5. Prettier 설정 파일(`.prettierrc`, `.prettierignore`) 생성 및 `package.json`에 포맷팅 스크립트 추가(`pnpm format`, `pnpm format:check`).
6. `pnpm db:generate`로 마이그레이션 생성 후 `pnpm db:push`로 로컬 DB 스키마 반영 (또는 `pnpm db:migrate`로 마이그레이션 적용).
7. `pnpm dev`로 개발 서버 실행, `http://localhost:3000` 접속.
8. Stripe CLI 유사하게 Toss 웹훅 테스트를 위해 `pnpm toss:webhook` 스크립트에서 msw 또는 테스트 서버로 시뮬레이션.
9. `scripts/verify-env.ts`을 prepush 훅에 연결해 환경 변수 누락을 방지.

---

## Implementation Guide

1. **Epic 1: 프로젝트 초기화 및 기본 인프라**
   - Next.js + TypeScript 프로젝트 초기화, Tailwind 및 ShadCN 설정, ESLint/Prettier 정비.
   - `db/schema/`에 Drizzle 스키마(`user.ts`, `link.ts`, `subscription.ts`) 작성하고 `db/schema/index.ts`에서 export, `db/client.ts`에서 Neon 연결 확인.
   - Better Auth 설정 및 카카오 OAuth 테스트.
2. **Epic 2: 사용자 인증 및 계정 운영**
   - 로그인/로그아웃 UI, 세션 보호 라우팅, 대시보드 접근 제어.
   - Free/Pro 플랜 로직(`plan.ts`) 구현, 플랜 제한 안내 컴포넌트 개발.
3. **Epic 3: 링크 생성·리다이렉션·구독**
   - 링크 생성 폼, 서버 액션, 링크 목록/편집 화면 구현.
   - Edge 기반 리다이렉션 및 클릭 추적 API 구현.
   - Toss 결제 연동, 구독 상태, 결제 내역 확인 화면 구축.
   - 운영자용 환경 점검 스크립트 및 기본 모니터링(로깅, 에러 리포트) 설정.

각 단계 완료 시 연관 테스트(유닛/통합/E2E)를 작성해 회귀를 방지한다.

---

## Testing Approach

- **유닛 테스트**: `plan.ts`, `slug.ts`, Drizzle 서비스 계층에 대해 Jest로 검증.
- **API 통합 테스트**: Next.js Route Handler를 `@testing-library/react`와 `supertest` 조합으로 검증, 결제 웹훅 가짜 페이로드 테스트 포함.
- **E2E 테스트**: Playwright로 로그인 → 링크 생성 → 링크 클릭 → 플랜 업그레이드 흐름 자동화. 모바일 뷰포트 시나리오 포함.
- **보안 테스트**: 슬러그 충돌, 권한 확인(타 사용자 링크 접근 차단), 환경 변수 누락 시 처리.
- **성능 확인**: Lighthouse, WebPageTest로 핵심 페이지 LCP/TTFB 검증, Edge 리다이렉션 평균 응답 시간 측정.

---

## Deployment Strategy

- **배포 대상**: Vercel Production(Project: `linkhub`), Preview 환경은 브랜치마다 자동 생성.
- **파이프라인**
  1. 메인 브랜치 머지 시 Vercel이 빌드 및 Edge 함수 배포.
  2. `scripts/verify-env.ts` prebuild 단계 실행, 실패 시 배포 중단.
  3. Drizzle 마이그레이션은 `pnpm drizzle-kit push`로 Neon에 적용.
- **환경 변수 관리**: Vercel Project Settings와 Neon dashboard 동기화, Toss 및 OAuth 키는 Secret Storage 사용.
- **모니터링**: Vercel Analytics(리다이렉션 응답 시간), Neon 쿼리 대시보드, Toss 웹훅 실패 로그 이메일 알림.
- **롤백 전략**: Vercel Deployments에서 이전 빌드로 재배포, Drizzle 마이그레이션 실패 시 `drizzle-kit push --force` 이전 버전으로 재적용 후 수동 롤백(SQL 백업 사용).

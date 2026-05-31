# LinkHub Product Requirements Document (PRD)

## 목표 및 배경 컨텍스트

### 목표

- 브랜드 도메인 기반으로 신뢰도 높은 URL 단축 경험을 제공한다.
- Free/Pro 구독 플랜을 도입해 국내 결제를 통한 수익화를 실현한다.
- 소셜 로그인과 배포 자동화를 결합해 확장 가능한 SaaS 운영 흐름을 구축한다.

### 배경 컨텍스트

마케팅·커머스 팀은 여러 캠페인을 빠르게 실행해야 하지만, 외부 단축 링크 서비스는 도메인 일관성과 국내 결제 연동 측면에서 제약이 있다. 또한 국내 사용자는 익숙한 소셜 계정을 활용한 간편 로그인과 원화 결제를 선호한다. 자체 링크 단축 SaaS 서비스인 LinkHub를 구축해 브랜드 도메인, 국내 주요 소셜 로그인 연동, 국내 결제 기반 구독 모델, 클라우드 자동 배포 환경을 통합함으로써 고객 신뢰와 반복 수익을 동시에 확보하고자 한다.

---

## 요구사항

### 기능 요구사항 (Functional Requirements)

#### 링크 생성 및 전달

- **FR001**: 사용자는 URL 입력 후 즉시 단축 링크를 발급받고 복사할 수 있어야 한다.
- **FR002**: 사용자는 커스텀 슬러그와 만료·클릭 제한을 쉽게 설정하거나 수정할 수 있어야 한다.
- **FR003**: 사용자는 생성된 링크의 상태와 사용 가능 조건을 한 화면에서 확인할 수 있어야 한다.

#### 회원 및 수익화 운영

- **FR004**: 신규 사용자는 국내 사용자가 익숙한 소셜 로그인 방식을 통해 간편하게 가입·로그인할 수 있어야 한다.
- **FR005**: Free/Pro 플랜의 혜택과 제한을 비교하고, Pro 구독 시 Toss Payments **자동결제(빌링)** 로 카드를 등록·최초 결제를 완료할 수 있어야 한다.
- **FR006**: 운영자는 서비스 배포 이후 환경 변수와 도메인 설정을 점검하며 안정적인 서비스 상태를 유지할 수 있어야 한다.
- **FR007**: 로그인한 사용자는 **대시보드**에서 현재 구독 상태, 구독 만료일을 확인하고 **구독 관리 페이지**로 이동할 수 있어야 한다.
- **FR008**: Pro 구독자는 **구독 관리 페이지**에서 현재 플랜, 구독 시작일, 구독 만료일, 마지막 결제일, 결제 이력, 구독 취소·재구독을 처리할 수 있어야 한다.
- **FR009**: 구독 취소 시 **만료일(`currentPeriodEnd`)까지 Pro 혜택을 유지**하고, 이후 자동 갱신 결제가 발생하지 않아야 한다.
- **FR010**: 시스템은 **매일 03:00 (Asia/Seoul)** 에 만료 대상 활성 구독에 대해 자동 갱신 결제를 시도해야 한다. (Toss는 스케줄링을 제공하지 않으므로 **Vercel Cron**으로 구현)

### 비기능 요구사항 (Non-Functional Requirements)

- **NFR001**: 사용자는 단축 URL을 통해 원본 페이지로 이동할 때 체감 지연을 느끼지 않아야 한다.
- **NFR002**: 로그인과 결제 흐름은 데스크톱·모바일 환경 모두에서 일관된 경험을 제공해야 한다.
- **NFR003**: 서비스 운영자는 링크 사용 현황과 구독 상태를 쉽게 파악해 고객 문의와 운영 이슈에 대응할 수 있어야 한다.

---

## 사용자 여정 (User Journeys)

### 여정 1: 신규 사용자의 링크 생성 경험

1.  사용자가 서비스 메인 화면에서 소셜 로그인을 진행한다.
2.  로그인 직후 URL 입력 폼에 원본 주소를 입력하고 옵션(커스텀 코드, 만료일, 클릭 제한)을 설정한다.
3.  생성 결과 화면에서 짧은 링크와 활용 가이드를 확인한다.
4.  링크를 복사해 원하는 채널에 공유한다.
5.  링크 목록 화면에서 생성한 링크를 다시 확인하며 필요 시 설정을 수정한다.

### 여정 2: Pro 구독 전환과 서비스 활용

1.  사용자가 Free 플랜 생성 한도에 도달해 업그레이드 안내 메시지를 확인한다.
2.  요금제 비교 화면(`/pricing`)에서 Pro 혜택과 월 구독 가격을 검토한다.
3.  「Pro 구독하기」 클릭 → Toss Payments **자동결제 등록창**(`requestBillingAuth`)에서 카드 본인인증·등록을 완료한다.
4.  서버가 `authKey`로 **빌링키 발급** 후 **최초 결제 승인** → `user.planType = PRO`, `subscription`·`payment` 레코드 저장.
5.  대시보드에서 **구독 상태·만료일**을 확인하고, 「구독 관리」로 이동해 결제 이력을 조회한다.
6.  (선택) 구독 취소 → 만료일까지 Pro 이용 → 만료 후 Free 전환 → 「다시 구독하기」로 재가입.

### 여정 3: 월간 자동 갱신 (시스템)

1.  **매일 03:00 KST** Vercel Cron이 `/api/cron/billing-renewal`을 호출한다.
2.  `status = ACTIVE` 이고 `cancelAtPeriodEnd = false` 이며 `currentPeriodEnd`가 당일 이전인 구독을 조회한다.
3.  저장된 `billingKey`·`customerKey`로 Toss **카드 자동결제 승인 API**를 호출한다.
4.  성공 시 `currentPeriodEnd`·`planExpiresAt`을 +1개월 연장, `payment` 이력 저장.
5.  실패 시 `status = PAST_DUE`, 사용자 알림(배너) 및 재시도 정책 적용(MVP: 1회 실패 후 만료일까지 유예 optional).

---

## UX 디자인 원칙

### 핵심 원칙

- ** 즉시성**: 로그인, 링크 생성, 결제 등 핵심 행동은 최소 단계로 완료되어야 한다.
- ** 명료성**: Free/Pro 혜택과 제한이 명확히 비교되어 의사결정을 돕는다.
- ** 피드백**: 링크 생성, 결제, 플랜 전환 결과를 실시간 피드백으로 확인할 수 있어야 한다.
- ** 접근성**: 다양한 디바이스와 환경에서 동일한 사용성을 제공해야 한다.

### 플랫폼 및 화면

- **플랫폼**: 웹(데스크톱, 태블릿), 모바일 웹
- **핵심 화면**:
  - 로그인 및 온보딩 화면
  - 링크 생성·결과 화면
  - 링크 목록 및 관리 화면
  - 요금제·결제 화면
  - 구독 관리 화면 (`/dashboard/subscription`)

### 디자인 제약사항

- 브랜드 컬러와 컴포넌트 가이드를 준수해 강의 전반의 일관성을 유지해야 한다.
- 1280px 미만 화면에서도 주요 입력 필드와 액션 버튼이 접히지 않도록 반응형으로 구성해야 한다.
- 결제 화면에는 이용자가 신뢰할 수 있는 결제 대행사 정보를 명확히 노출해야 한다.

---

## UI 디자인 목표

### 주요 UI 요소

1. ** 링크 생성 입력 폼**
   - URL 입력과 옵션 설정을 단계별 안내로 구성한다.
   - 생성 결과와 복사 버튼을 동일 화면에 배치한다.
   - 플랜 제한에 따른 안내 메시지를 함께 노출한다.

2. ** 링크 목록 카드/테이블**
   - 링크 상태, 만료일, 복사 버튼을 직관적으로 배치한다.
   - 즐겨찾기 표시와 검색 필터를 제공한다.
   - 플랜별 생성 가능 수량을 시각적으로 안내한다.

3. ** 요금제 및 결제 패널**
   - Free와 Pro 혜택을 비교형 카드로 제공한다.
   - 「카드 등록 및 구독 시작」 버튼과 Toss 자동결제 등록 진행 상태를 명확히 표시한다.
   - 월간 자동 갱신·취소 시 만료일까지 이용 가능 안내를 포함한다.

4. ** 대시보드 구독 요약 카드**
   - 현재 플랜(Free/Pro), 구독 상태(`ACTIVE`/`CANCELED`/`PAST_DUE`), **구독 만료일** 표시.
   - 「구독 관리」 버튼 → `/dashboard/subscription` 이동.

5. ** 구독 관리 페이지**
   - **구독 정보**: 현재 플랜, 구독 시작일, 구독 만료일, 마지막 결제일.
   - **액션**: 「구독 취소」(만료일까지 이용 안내), 「다시 구독하기」(취소·만료 사용자).
   - **결제 이력 테이블**: 결제 수단(카드사·마스킹 번호), 결제 금액, 주문 번호(`orderId`), 결제일, 상태(`DONE`/`FAILED`/`CANCELED`).

### 인터랙션 패턴

- 주요 액션(로그인, 결제, 링크 생성)은 화면 전환 없이 모달 또는 슬라이드 패널에서 처리한다.
- 결제·구독 진행 상태는 단계별 진행 표시를 통해 사용자 불안을 줄인다.
- 위험 작업(삭제, 비활성화)은 2단계 확인과 이유 입력을 요구한다.
- URL 복사, 플랜 전환 등 주요 액션은 토스트 메시지로 결과를 안내한다.

---

## Epic 목록

### Epic 1: 프로젝트 초기화 및 기본 인프라 구축 ✅ 완료

**상태**: 완료 (2026-05-31)

**목표**: 기술 스택을 확정하고 프론트엔드 프레임워크 프로젝트 초기화, 기본 라이브러리, 데이터베이스 ORM 설정까지 완료한다.

**완료 요약**

- Next.js 16(App Router) + TypeScript + Tailwind CSS 4 프로젝트 초기화
- ShadCN UI 기본 설정 및 Prettier/ESLint 정비
- Drizzle ORM + drizzle-kit + Neon 연동 설정(`drizzle.config.ts`, DB 스크립트)
- 개발 환경 변수 템플릿 및 로컬 `.env.local` 준비

**예상 스토리 수**: 6-7개

---

### Epic 2: 사용자 인증 및 계정 기반 운영 준비

**상태**: 구현 완료 (로컬 검증: `pnpm install` → `pnpm db:push` → `pnpm dev` 후 수동 테스트)

**목표**: 국내 주요 소셜 로그인과 세션 관리를 구축해 사용자별 접근 제어와 플랜 적용 기반을 마련한다.

**관련 요구사항**: FR004, NFR002  
**Tech Spec 참고**: `server/auth/`, `app/(public)/login/`, `lib/plan.ts`, `db/schema/auth.ts`, `db/schema/subscription.ts`

**예상 스토리 수**: 7개

#### Story 2.1 — Better Auth 서버 설정 및 API 라우트

**As a** 개발자  
**I want** Better Auth를 Next.js에 연결한 인증 API  
**So that** 카카오 OAuth와 세션 발급이 안정적으로 동작한다

**체크리스트**

- [x] `better-auth` 및 필요한 어댑터 패키지 설치
- [x] `server/auth/index.ts`(또는 동등 경로)에 Better Auth 인스턴스 정의
- [x] Drizzle 어댑터로 Neon Postgres와 연결
- [x] `app/api/auth/[...all]/route.ts`에 Better Auth 핸들러 마운트
- [x] `.env.example`에 `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, 카카오 OAuth 키 항목 문서화
- [ ] 로컬에서 `/api/auth/*` 엔드포인트가 404 없이 응답하는지 확인

**완료 기준**: 개발 서버 기동 후 인증 API 라우트가 정상 등록되고, 환경 변수 누락 시 명확한 오류가 표시된다.

---

#### Story 2.2 — 사용자·구독 DB 스키마 및 마이그레이션

**As a** 시스템  
**I want** 사용자와 플랜 정보를 저장하는 타입 안전 스키마  
**So that** 로그인 upsert와 이후 Epic 3 링크·결제 기능이 같은 DB를 사용한다

**체크리스트**

- [x] `db/schema/auth.ts`: Better Auth `user` + `planType`(기본 `FREE`), `planExpiresAt`, 타임스탬프
- [x] Better Auth 필수 테이블(세션, 계정 등) 스키마 반영 또는 공식 스키마 적용
- [x] `db/schema/subscription.ts`: `id`, `userId`, `planType`, `status`, `currentPeriodEnd`, `billingKey`, `createdAt`
- [x] Epic 3 Story 3.9에서 확장: `customerKey`, `cancelAtPeriodEnd`, `currentPeriodStart`, `lastPaymentAt`
- [x] Epic 3 Story 3.9에서 `db/schema/payment.ts` 신규 추가
- [x] `db/schema/index.ts`에서 스키마 export 집계
- [x] `db/client.ts` Neon serverless 클라이언트 및 Drizzle 인스턴스 구현
- [x] `pnpm db:generate` → `pnpm db:push`(또는 migrate)로 로컬/개발 DB 반영
- [x] `pnpm db:studio`로 테이블 생성 여부 확인

**완료 기준**: Neon에 `user`·`subscription`(및 인증 관련) 테이블이 존재하고, Drizzle Studio에서 조회 가능하다.

---

#### Story 2.3 — 카카오 소셜 로그인 UI

**As a** 신규 사용자  
**I want** 익숙한 카카오 계정으로 간편 로그인  
**So that** FR004를 충족하고 링크 생성 여정(여정 1) 1단계를 시작할 수 있다

**체크리스트**

- [x] `app/(public)/login/page.tsx` 로그인 진입 화면 구현(Server Component 기본)
- [x] `features/auth/components/`에 카카오 로그인 버튼(Client Component)
- [x] Better Auth `signIn.social({ provider: "kakao" })` (또는 문서 기준 동등 API) 연동
- [x] 로그인 성공 시 기본 리다이렉트: `/dashboard`(또는 `callbackUrl` 쿼리 지원)
- [x] 로그인 실패·취소 시 사용자에게 토스트/인라인 오류 메시지 표시
- [x] 1280px 미만에서도 버튼·안내 문구가 깨지지 않는 반응형 레이아웃(NFR002)
- [x] 브랜드 컬러·ShadCN `Button` 등 디자인 가이드 준수

**완료 기준**: 카카오 개발자 콘솔에 등록된 앱으로 로컬 로그인 → 대시보드(또는 콜백 URL) 이동이 한 번에 성공한다.

---

#### Story 2.4 — 로그인 후 사용자 upsert 및 기본 플랜 부여

**As a** 시스템  
**I want** 최초 로그인 시 사용자 레코드를 생성·갱신하고 Free 플랜을 부여  
**So that** 이후 플랜 제한 로직이 `userId` 기준으로 동작한다

**체크리스트**

- [x] 카카오 로그인 성공 시 Better Auth가 `user`/`account` upsert 처리
- [x] 신규 사용자 `planType = 'FREE'`, `planExpiresAt = null`(또는 정책에 맞는 기본값)
- [x] 동일 계정 재로그인 시 `databaseHooks.user.update.before`로 `planType` 유지
- [x] OAuth provider는 Better Auth `account.providerId = kakao`로 저장
- [ ] 로그인 직후 세션의 `user.id`와 DB `User.id` 일치 확인

**완료 기준**: 첫 로그인 후 DB에 Free 사용자 1건 생성, 재로그인 시 중복 행 없이 동일 `id` 유지.

---

#### Story 2.5 — 세션 조회 헬퍼·로그아웃·보호 라우팅

**As a** 로그인한 사용자  
**I want** 대시보드만 내 세션으로 접근하고 로그아웃할 수 있음  
**So that** 타인의 링크 관리 화면에 접근되지 않는다

**체크리스트**

- [x] `server/auth/session.ts`(또는 동등)에 `getSession()` 서버 헬퍼 구현
- [x] `proxy.ts` + `app/dashboard/layout.tsx`에서 미인증 시 `/login` 리다이렉트
- [x] 이미 로그인된 사용자가 `/login` 접근 시 `/dashboard`로 리다이렉트(선택)
- [x] 공통 헤더/네비에 로그아웃 버튼 및 `signOut` 연동
- [x] `app/dashboard/page.tsx` 최소 플레이스홀더(「링크 목록 준비 중」 등)로 보호 라우트 검증
- [ ] 로그아웃 후 `/login` 이동 및 보호 URL 직접 접근 시 차단 확인

**완료 기준**: 시크릿/쿠키 없이 `/dashboard` 접근 불가, 로그인·로그아웃 사이클이 브라우저 새로고침 후에도 유지된다.

---

#### Story 2.6 — Free/Pro 플랜 정책 유틸(`lib/plan.ts`)

**As a** 서버 로직  
**I want** 플랜별 한도를 한곳에서 계산  
**So that** Epic 3 링크 생성·업그레이드 안내가 동일 규칙을 따른다

**체크리스트**

- [x] `lib/plan.ts`에 플랜 상수 정의: Free — 일일 생성 10개, 활성 링크 50개; Pro — 제한 없음(MVP)
- [x] `evaluatePlanLimits(userId)` (또는 동등) 함수: 남은 일일 생성 수, 활성 링크 수, `planType` 반환
- [x] `canCreateLink(userId)` 등 링크 생성 전 검증 함수 스텁(Epic 3에서 호출 예정)
- [x] Pro이지만 `planExpiresAt`이 과거인 경우 Free로 간주하는 만료 처리(선택, Tech Spec 정합)
- [x] Zod 또는 TypeScript 타입으로 `PlanType = 'FREE' | 'PRO'` 공유(`types/`)

**완료 기준**: 유닛 테스트 또는 `pnpm` 스크립트로 Free 사용자 한도 계산 결과가 Tech Spec 수치와 일치한다.

---

#### Story 2.7 — 플랜 배지·한도 안내 UI(대시보드 골격)

**As a** Free 사용자  
**I want** 현재 플랜과 남은 생성 한도를 화면에서 확인  
**So that** 한도 도달 전에 업그레이드(여정 2)를 인지할 수 있다

**체크리스트**

- [x] `features/auth/components/plan-badge.tsx`: Free/Pro 표시
- [x] `features/auth/components/plan-quota-card.tsx`(또는 동등): 남은 일일 생성·활성 링크 수 표시
- [x] 대시보드 Server Component에서 `getSession()` + `evaluatePlanLimits()` 호출 후 props 전달
- [x] Free 한도 80% 이상일 때 부드러운 안내 문구(업그레이드 CTA는 `/pricing` 링크만, 결제는 Epic 3)
- [x] 모바일·데스크톱에서 카드 레이아웃 일관(NFR002)

**완료 기준**: 로그인 후 대시보드에 플랜 배지와 숫자 기반 한도 안내가 보이며, Pro 사용자는 「제한 없음」 등으로 표시된다.

---

#### Epic 2 통합 검증 체크리스트 (Epic 완료 시)

- [ ] 카카오 로그인 → 대시보드 → 새로고침 → 세션 유지 → 로그아웃 전체 흐름 수동 테스트
- [ ] 미로그인 상태에서 `/dashboard`, `/dashboard/links/*` 접근 차단
- [ ] DB에 사용자 1명 생성·`planType=FREE`·subscription 기본 행(필요 시) 확인
- [x] `.env.example`과 Tech Spec의 필수 인증 변수 목록 일치
- [ ] (선택) Playwright 또는 간단 E2E: 로그인 스모크 1케이스

**Epic 2 완료 정의**: FR004 충족, 대시보드 보호 라우팅 동작, `lib/plan.ts`가 Epic 3 링크 생성 Server Action에서 import 가능한 상태.

### Epic 3: 링크 생성, 수익화, 배포 운영

**상태**: 진행 중 — **트랙 C(구독 결제) 완료** (2026-05-31). 트랙 A/B(링크·리다이렉션), 트랙 D(배포) 잔여.

**목표**: 링크 생성·리다이렉션, 구독 결제, 클라우드 배포를 연계해 **실제로 쓸 수 있는 SaaS MVP**를 완성한다.

**관련 요구사항**: FR001~FR003, FR005~FR010, NFR001~NFR003  
**Tech Spec 참고**: `db/schema/link.ts`, `db/schema/subscription.ts`, `db/schema/payment.ts`, `server/links/`, `lib/plan.ts`, `app/(public)/r/[slug]/`, `server/billing/`, `app/api/billing/toss/`, `app/api/cron/billing-renewal/`, `vercel.json`

---

## 구독 결제 & 플랜 정책 (Epic 3 확정)

### 플랜 혜택

| 항목 | Free | Pro |
|------|------|-----|
| 일일 링크 생성 | **5개/일** | **무제한** |
| 활성 링크 수 | **최대 30개** | **무제한** |
| 커스텀 슬러그 | ❌ (자동 생성만) | ✅ |
| 만료일 설정 | ❌ | ✅ |
| 클릭 제한 설정 | ❌ | ✅ |
| 월 구독 요금 | 무료 | **상수/env 관리** (예: ₩9,900/월) |

### 구독 모델

- **결제 방식**: Toss Payments **자동결제(빌링)** — 카드 등록 후 매월 자동 청구.
- **연동 방식**: Toss SDK v2 **결제창 방식** (`requestBillingAuth`) — 토스가 본인인증 제공.
- **빌링 주기**: **월간** — 구독 시작일 기준 1개월 단위(`currentPeriodEnd` = 시작일 + 1개월, KST 23:59:59). **갱신**: `currentPeriodEnd` 경과 구독을 **매일 03:00 KST** Cron에서 일괄 처리.
- **최초 구독**: 카드 등록(빌링키 발급) + **즉시 1회 결제 승인** → Pro 활성화, `currentPeriodEnd` = 구독 시작일 + 1개월 (KST 해당일 23:59:59).

### 구독 상태 (`subscription.status`)

| 상태 | 설명 | Pro 혜택 | 자동 갱신 |
|------|------|----------|-----------|
| `ACTIVE` | 정상 구독 | ✅ | ✅ (취소 예약 없을 때) |
| `CANCELED` | **기간 말 취소 예약** (`cancelAtPeriodEnd = true`) | ✅ **만료일까지** | ❌ |
| `PAST_DUE` | 갱신 결제 실패 | ✅ **유예 기간**(MVP: 만료일까지) | 재시도 optional |
| (만료) | `currentPeriodEnd` 경과 + Free 전환 | ❌ Free | ❌ |

> **구독 취소 정책**: 사용자가 「구독 취소」 시 `cancelAtPeriodEnd = true`, `status = CANCELED`로 설정. **만료일(`currentPeriodEnd`)까지 Pro 기능 유지**. Cron은 취소 예약 구독에 대해 자동결제 API를 **호출하지 않음**. 만료 후 `user.planType = FREE`, `planExpiresAt = null`.

> **재구독**: 만료 또는 취소 완료 후 「다시 구독하기」 → 새 빌링키 등록(또는 기존 키 재사용) + 최초 결제 플로우.

### Toss Payments 연동 흐름 (기술)

> 구현 시 **Toss MCP**(`tosspayments-integration-guide`)로 API·SDK 문서를 상세 검토 후 반영.

#### 1단계 — 카드 등록 (클라이언트)

```
/pricing → 「Pro 구독하기」
  → @tosspayments/tosspayments-sdk loadTossPayments(clientKey)
  → payment.requestBillingAuth({ method: "CARD", successUrl, failUrl, customerEmail, customerName })
  → Toss 자동결제 등록창 (본인인증 포함)
```

- `customerKey`: 사용자별 **UUID** (유추 불가). `user.id`와 1:1 매핑 저장.
- `successUrl`: `/dashboard/billing/success` (또는 `/api/billing/toss/callback/success`)
- `failUrl`: `/dashboard/billing/fail`

#### 2단계 — 빌링키 발급 (서버)

```
successUrl 쿼리: ?customerKey={}&authKey={}
  → POST /v1/billing/authorizations/issue  (authKey + customerKey)
  → 응답: billingKey, card(마스킹), cardCompany
  → subscription.billingKey, subscription.customerKey 저장 (billingKey는 재조회 불가 — 반드시 DB 저장)
```

#### 3단계 — 최초·갱신 결제 승인 (서버)

```
POST /v1/billing/{billingKey}
  Body: { customerKey, amount, orderId, orderName }
  → Payment 객체 (type: "BILLING", status: "DONE")
  → payment 테이블 insert, subscription.currentPeriodEnd 갱신, user.planType = PRO
```

- `orderId`: 매 결제마다 **고유값** (예: `lh_{userId}_{timestamp}`).
- 금액(`amount`)은 **서버에서만** 결정 — 클라이언트 금액 신뢰 금지.

#### 4단계 — 구독 취소 (서버, PG 호출 없음)

- DB만 갱신: `cancelAtPeriodEnd = true`, `status = CANCELED`.
- (선택) 빌링키 삭제: `DELETE /v1/billing/{billingKey}` — **재구독 시 카드 재등록 필요**. MVP는 빌링키 유지 + Cron 스킵 권장.

#### 환경 변수

| 변수 | 용도 |
|------|------|
| `TOSS_CLIENT_KEY` | SDK 클라이언트 키 (자동결제 계약 MID) |
| `TOSS_SECRET_KEY` | 서버 API Basic 인증 (`base64(secretKey + ":")`) |
| `CRON_SECRET` | Vercel Cron 호출 Bearer 검증 |
| `PRO_MONTHLY_PRICE` | Pro 월 요금 (원, 정수) |

### 자동 갱신 스케줄 (Vercel Cron)

- **실행 시각**: **매일 03:00 Asia/Seoul**
- **Vercel Cron 표현식 (UTC)**: `0 18 * * *` — UTC 18:00 = KST 03:00
- **엔드포인트**: `GET /api/cron/billing-renewal`
- **인증**: `Authorization: Bearer ${CRON_SECRET}` 헤더 검증
- **처리 대상**: `status = ACTIVE` AND `cancelAtPeriodEnd = false` AND `billingKey IS NOT NULL` AND `currentPeriodEnd <= now()`
- **로컬 테스트**: `scripts/run-cron-billing-renewal.ts` + `package.json` `"cron:billing": "tsx scripts/run-cron-billing-renewal.ts"`

### 데이터 모델 (구독·결제)

#### `subscription` (기존 확장)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | text PK | UUID |
| `userId` | text FK | user.id |
| `planType` | enum | `FREE` \| `PRO` |
| `status` | enum | `ACTIVE` \| `CANCELED` \| `PAST_DUE` |
| `customerKey` | text | Toss customerKey (UUID) |
| `billingKey` | text | Toss 빌링키 (암호화 저장 권장) |
| `cancelAtPeriodEnd` | boolean | 기간 말 취소 예약 (default false) |
| `currentPeriodStart` | timestamp | 현재 구독 기간 시작일 |
| `currentPeriodEnd` | timestamp | **구독 만료일** |
| `lastPaymentAt` | timestamp | 마지막 결제일 |
| `createdAt` | timestamp | **구독 시작일**(최초 Pro 전환 시점) |

#### `payment` (신규)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | text PK | UUID |
| `userId` | text FK | user.id |
| `subscriptionId` | text FK | subscription.id |
| `orderId` | text unique | Toss orderId (주문 번호) |
| `paymentKey` | text | Toss paymentKey |
| `amount` | integer | 결제 금액 (원) |
| `method` | text | 결제 수단 (예: `카드`, `현대 433012******123*`) |
| `status` | enum | `DONE` \| `FAILED` \| `CANCELED` |
| `paidAt` | timestamp | 결제일 (`approvedAt`) |
| `failureMessage` | text nullable | 실패 사유 |
| `createdAt` | timestamp | 레코드 생성 시각 |

**예상 스토리 수**: 15개 (4개 트랙 + Cron, Edge 리다이렉션 API 제외)

---

## 트랙 A — 메인 대시보드 & 링크 생성

### Story 3.1 — 플랜 정책 상수 갱신 및 한도 계산

**As a** 서버 로직  
**I want** Free 5/30 · Pro 무제한 정책이 한곳에서 계산되도록  
**So that** 대시보드·생성·결제 전환 안내가 동일한 숫자를 사용한다

**체크리스트**

- [ ] `lib/plan.ts`의 `PLAN_LIMITS`를 Free **일 5개 / 활성 30개**로 변경 (기존 10/50 제거)
- [ ] Pro: `dailyCreateLimit: null`, `activeLinkLimit: null` 유지
- [ ] `canCreateLink()` 거부 메시지에 **5개 / 30개** 문구 반영
- [ ] `evaluatePlanLimits()` 반환값: `dailyCreated`, `activeLinks`, `remainingDailyCreates`, `remainingActiveLinks`
- [ ] Pro 만료(`planExpiresAt` 경과) 시 Free로 간주하는 `getEffectivePlanType()` 동작 유지
- [ ] `types/plan.ts` 타입과 Tech Spec·PRD 수치 일치 확인

**완료 기준**: Free 사용자 기준 `evaluatePlanLimits()` 결과가 「오늘 0/5, 활성 0/30」 형태로 정확히 계산된다.

---

### Story 3.2 — Link DB 스키마 및 마이그레이션

**As a** 시스템  
**I want** 링크·클릭 이벤트를 저장하는 타입 안전 스키마  
**So that** 생성·리다이렉션·한도 집계가 같은 테이블을 사용한다

**체크리스트**

- [ ] `db/schema/link.ts`: `id`, `userId`, `originalUrl`, `slug`(unique), `expiresAt`, `clickLimit`, `clickCount`, `status`(`active`|`inactive`|`expired`), `createdAt`, `updatedAt`
- [ ] `slug` 컬럼에 unique index (`idx_links_slug`)
- [ ] `userId` + `status` 복합 조건으로 활성 링크 count 쿼리 가능
- [ ] `createdAt` 기준 일일 생성 count 쿼리 가능 (UTC 자정 또는 KST 정책 문서화)
- [ ] (선택) `LinkEvent` 테이블: `linkId`, `eventType`, `createdAt` — MVP는 `clickCount`만 증가해도 됨
- [ ] `pnpm db:push`로 Neon 반영 및 Drizzle Studio에서 `link` 테이블 확인

**완료 기준**: `link` 테이블이 Neon에 존재하고, slug unique 제약이 동작한다.

---

### Story 3.3 — 메인 대시보드 (한도 요약 + 링크 생성 진입)

**As a** 로그인한 사용자  
**I want** 메인 대시보드에서 한도와 링크 생성을 한 화면에서 시작  
**So that** FR003·NFR003을 충족하고 여정 1의 허브가 된다

**체크리스트**

- [ ] `app/dashboard/page.tsx`를 **메인 대시보드**로 구성 (플레이스홀더 제거)
- [x] **구독 요약 카드** (FR007): 플랜명, 구독 상태, **구독 만료일**(`currentPeriodEnd` 또는 Free 시 「—」)
- [x] 「구독 관리」 버튼 → `/dashboard/subscription`
- [ ] 상단: 환영 문구 + `PlanBadge` + 로그아웃 (기존 Epic 2 재사용)
- [ ] **일일 생성 한도 카드**: `오늘 생성 N / 5` (Free) 또는 「무제한」(Pro)
- [ ] **활성 링크 한도 카드**: `활성 N / 30` (Free) 또는 「무제한」(Pro)
- [ ] 한도 80% 이상 시 업그레이드 CTA → `/pricing` 링크
- [ ] 한도 도달 시 생성 폼 비활성 + 안내 문구 + `/pricing` CTA
- [ ] **링크 생성 폼** 영역: URL 입력 + (Pro 전용) 슬러그·만료일·클릭 제한 필드 placeholder 또는 조건부 노출
- [ ] 1280px 미만 반응형: 카드·폼·버튼이 세로 스택으로 깨지지 않음
- [ ] Server Component에서 `getSession()` + `evaluatePlanLimits()` 호출

**완료 기준**: 로그인 후 대시보드에 **사용량/전체 한도** 숫자가 보이고, 링크 생성 폼이 노출된다.

---

### Story 3.4 — 링크 생성 Server Action 및 결과 UI

**As a** 사용자  
**I want** URL 입력 후 단축 링크를 발급·복사  
**So that** FR001을 충족한다

**체크리스트**

- [ ] `server/links/create-link.ts`(또는 `server/links/index.ts`) 서비스 계층 구현
- [ ] `app/dashboard/actions.ts` — `createLink` Server Action + Zod 검증 (`originalUrl` URL 형식)
- [ ] 생성 전 `canCreateLink(userId)` 호출 — 한도 초과 시 Action 오류 반환
- [ ] Free: `slug` 자동 생성 (`lib/slug.ts`, 8자 영숫자 등), 커스텀 슬러그 입력 거부
- [ ] Pro: 커스텀 `slug` 입력 허용, 중복 시 「이미 사용 중인 슬러그」 오류
- [ ] Pro: `expiresAt`, `clickLimit` optional 저장
- [ ] 트랜잭션으로 `link` insert + slug unique 충돌 처리
- [ ] 성공 시 단축 URL 반환: `{SITE_URL}/r/{slug}`
- [ ] `features/links/components/create-link-form.tsx`: `useActionState` 또는 동등 패턴, 로딩·오류·성공 토스트
- [ ] 성공 UI: 단축 URL 표시 + **복사 버튼** (클립보드 API)
- [ ] 생성 후 대시보드 한도 숫자 갱신 (`revalidatePath`)

**완료 기준**: Free 사용자가 URL 1개 입력 → 단축 링크 발급 → 복사 가능. 6번째 생성 시도는 차단된다.

---

### Story 3.5 — 생성된 링크 목록

**As a** 사용자  
**I want** 내가 만든 링크 목록을 대시보드에서 확인  
**So that** FR003과 여정 1 5단계를 충족한다

**체크리스트**

- [ ] `server/links/list-links.ts`: `userId` 기준 링크 목록 (최신순, 페이지네이션 optional — MVP는 전체 또는 상위 50건)
- [ ] `features/links/components/link-list.tsx`: 테이블 또는 카드 리스트
- [ ] 컬럼/항목: **단축 URL**, 원본 URL(ellipsis), **상태**, **클릭 수**, **만료일**(Pro), 생성일
- [ ] 행 액션: **복사**, **비활성화/삭제**(2단계 확인), (Pro) **편집** 링크 → `/dashboard/links/[id]`
- [ ] 빈 상태: 「아직 생성된 링크가 없습니다」 + 생성 폼으로 스크롤/포커스 CTA
- [ ] 타 사용자 링크는 Server Action·쿼리 모두 `userId` 필터로 차단
- [ ] 검색/필터(상태별) — MVP는 상태 필터만 optional

**완료 기준**: 생성한 링크가 목록에 즉시 표시되고, 복사·비활성화가 동작한다.

---

### Story 3.6 — Pro 전용 링크 편집

**As a** Pro 사용자  
**I want** 커스텀 슬러그·만료일·클릭 제한을 수정  
**So that** FR002를 충족한다

**체크리스트**

- [ ] `app/dashboard/links/[id]/page.tsx` — 링크 상세·편집 (Server Component)
- [ ] Free 사용자 접근 시 「Pro 전용」 안내 + `/pricing` CTA
- [ ] `updateLink` Server Action: `expiresAt`, `clickLimit`, `slug`(변경 시 unique 검증)
- [ ] 만료일 과거 설정 시 저장 거부 또는 저장 즉시 `expired` 상태
- [ ] `clickLimit` 도달 시 리다이렉션에서 410 처리 (Story 3.7과 연동)
- [ ] 편집 성공 토스트 + 목록/상세 갱신

**완료 기준**: Pro 사용자만 슬러그·만료·클릭 제한을 저장·수정할 수 있다.

---

## 트랙 B — 리다이렉션 (Server Component 페이지 전용)

> **구현 방침**: Edge Route Handler(`app/api/redirects/`)는 **구현하지 않는다**.
> 단축 URL은 **`app/(public)/r/[slug]/page.tsx`** Server Component에서 DB 조회 후 `redirect()`로 처리한다.

### Story 3.7 — 단축 URL 페이지 리다이렉션

**As a** 링크를 받은 방문자  
**I want** 단축 URL 클릭 시 원본 페이지로 이동  
**So that** FR001·NFR001을 충족한다 (MVP는 단순 페이지 방식)

**체크리스트**

- [ ] `app/(public)/r/[slug]/page.tsx` — **Server Component** ( `'use client'` 없음)
- [ ] `server/links/resolve-link.ts`(또는 동등): slug → `link` 조회 + 유효성 판정 헬퍼
- [ ] slug 없음 → `notFound()` (404)
- [ ] `status !== 'active'` → `app/(public)/r/[slug]/unavailable` 또는 동일 페이지에서 410 UI
- [ ] `expiresAt` 경과 → 410 + (optional) DB `status = 'expired'` 갱신
- [ ] `clickLimit` 존재 && `clickCount >= clickLimit` → 410
- [ ] 유효한 링크: `clickCount` increment 후 `redirect(originalUrl)` (Next.js `redirect()`)
- [ ] 로그인 불필요 — `(public)` 라우트 그룹, `proxy.ts` matcher 제외
- [ ] 단축 URL 형식 통일: `{SITE_URL}/r/{slug}` (생성 Action·목록 UI와 동일)
- [ ] 로컬: `http://localhost:3002/r/{slug}` 동작 확인

**완료 기준**: 생성한 단축 URL 클릭 → 원본 URL 이동. 만료/비활성/클릭 한도 초과 → 410.

**범위 외 (Epic 3)**

- `app/api/redirects/[slug]/route.ts` Edge Runtime API
- `next.config.ts` rewrite로 API 우회
- Edge Functions / KV 캐시 레이어

---

## 트랙 C — 구독 결제 (Toss 빌링 + Vercel Cron) ✅ 완료

**상태**: 완료 (2026-05-31)  
**검증**: Toss 테스트 결제 성공, Pro 전환·구독 관리·결제 이력·만료일(구독 시작일 + 1개월) UI 확인

**완료 요약**

- FR005, FR007, FR008, FR009, FR010 충족
- Toss 빌링키 발급 → 최초 결제 → Pro 활성화 E2E
- 대시보드 구독 요약 카드, `/dashboard/subscription` 구독 관리·결제 이력
- Vercel Cron 매일 03:00 KST 자동 갱신, 로컬 `pnpm cron:billing` 스크립트
- `scripts/verify-env.ts` 환경 변수 검증

---

### Story 3.8 — 요금제 비교 페이지 (`/pricing`) ✅

**As a** Free 사용자  
**I want** Free vs Pro 혜택을 비교하고 월간 구독을 시작  
**So that** FR005·여정 2 2단계를 충족한다

**체크리스트**

- [x] `app/(public)/pricing/page.tsx` — Free / Pro 비교 카드
- [x] Free: 일 5개 생성, 활성 30개, 자동 슬러그
- [x] Pro: 무제한 생성·활성, 커스텀 슬러그, 만료일, 클릭 제한
- [x] Pro **월 구독 가격** 표시 (`PRO_MONTHLY_PRICE` env 또는 상수)
- [x] 「월간 자동 갱신 · 언제든 취소 가능 · 취소 시 만료일까지 이용」 안내 문구
- [x] 로그인 전: 「카카오로 시작하기」→ `/login?callbackUrl=/pricing`
- [x] 로그인 + Free: 「Pro 구독 시작」 → 빌링키 등록 플로우 (Story 3.9)
- [x] 로그인 + Pro(`ACTIVE`): 「현재 Pro 이용 중」 + 만료일 표시 + 「구독 관리」 링크
- [x] Toss Payments 로고·자동결제(빌링) 안내 (NFR002)

**완료 기준**: 한도 도달 CTA → pricing → 혜택·가격·자동갱신 안내가 한 흐름으로 이어진다.

---

### Story 3.9 — Toss Payments 자동결제(빌링) 연동 ✅

**As a** Free 사용자  
**I want** 카드 등록과 최초 Pro 구독 결제를 한 번에 완료  
**So that** FR005·FR010 기반 월간 자동 갱신이 가능해진다

> **구현 전 필수**: Toss MCP로 `자동결제(빌링) 결제창 연동하기`, `빌링키 발급`, `카드 자동결제 승인 API` 문서 검토.

**체크리스트**

**환경·스키마**

- [x] `.env.example`: `TOSS_CLIENT_KEY`, `TOSS_SECRET_KEY`, `PRO_MONTHLY_PRICE`, `CRON_SECRET`
- [x] `db/schema/subscription.ts` 확장: `customerKey`, `cancelAtPeriodEnd`, `currentPeriodStart`, `lastPaymentAt`
- [x] `db/schema/payment.ts` 신규: `orderId`, `paymentKey`, `amount`, `method`, `status`, `paidAt`, `failureMessage`
- [x] `pnpm db:push` 반영

**서버 — Toss API 클라이언트**

- [x] `server/billing/toss.ts`:
  - [x] `issueBillingKey(authKey, customerKey)` → `POST /v1/billing/authorizations/issue`
  - [x] `chargeBilling(billingKey, { customerKey, amount, orderId, orderName })` → `POST /v1/billing/{billingKey}`
  - [x] Basic 인증: `Authorization: Basic base64(secretKey + ":")`
  - [x] 고유 `orderId` 생성 헬퍼

**클라이언트 — 카드 등록**

- [x] `@tosspayments/tosspayments-sdk` 설치
- [x] `features/billing/components/subscribe-button.tsx`:
  - [x] `loadTossPayments(TOSS_CLIENT_KEY)` + `payment({ customerKey })`
  - [x] `requestBillingAuth({ method: "CARD", successUrl, failUrl, customerEmail, customerName })`
  - [x] `customerKey`: 서버에서 발급한 UUID (`/api/billing/customer-key` 또는 세션 기반)

**서버 — 구독 시작 플로우**

- [x] `app/dashboard/billing/success/page.tsx` (또는 Route Handler):
  - [x] `customerKey`, `authKey` 쿼리 수신·검증 (세션 user와 customerKey 매칭)
  - [x] 빌링키 발급 → `subscription` upsert (`billingKey`, `customerKey`, `status=ACTIVE`)
  - [x] 즉시 `chargeBilling()` 최초 결제 → `payment` insert
  - [x] `user.planType = PRO`, `planExpiresAt = currentPeriodEnd`, `currentPeriodStart`, `lastPaymentAt` 설정
- [x] `app/dashboard/billing/fail/page.tsx` — 오류 코드·메시지 표시

**완료 기준**: 테스트 키로 카드 등록 → 최초 결제 성공 → DB `planType=PRO`, `billingKey` 저장 → 대시보드 「무제한」 표시.

---

### Story 3.10 — 대시보드 구독 요약 & 구독 관리 페이지 ✅

**As a** Pro/Free 사용자  
**I want** 대시보드에서 구독 상태를 보고 구독 관리 페이지에서 상세 정보·취소·이력을 확인  
**So that** FR007·FR008·FR009·NFR003을 충족한다

**체크리스트**

**대시보드 구독 요약 (FR007)**

- [x] `features/billing/components/subscription-summary-card.tsx`
- [x] 표시: 플랜명, 구독 상태(`ACTIVE`/`CANCELED`/`PAST_DUE`), **구독 만료일**
- [x] `CANCELED` 상태: 「{만료일}까지 Pro 이용 가능」 배지
- [x] 「구독 관리」 버튼 → `/dashboard/subscription`

**구독 관리 페이지 (FR008)**

- [x] `app/dashboard/subscription/page.tsx` (Server Component)
- [x] **구독 정보 섹션**:
  - [x] 현재 플랜 (Free / Pro)
  - [x] 구독 시작일 (`subscription.createdAt` 또는 `currentPeriodStart`)
  - [x] 구독 만료일 (`currentPeriodEnd`)
  - [x] 마지막 결제일 (`lastPaymentAt`)
  - [x] 구독 상태
- [x] **액션 버튼**:
  - [x] `ACTIVE` + Pro: 「구독 취소」→ 확인 모달 → `cancelSubscription` Server Action
  - [x] `CANCELED`(기간 내): 「취소 예약됨 · {만료일}까지 이용」+ (optional) 「취소 철회」
  - [x] Free 또는 만료: 「다시 구독하기」→ `/pricing`
- [x] **결제 이력 테이블** (`server/billing/list-payments.ts`):
  - [x] 컬럼: **결제 수단**, **결제 금액**, **주문 번호**(`orderId`), **결제일**, **상태**
  - [x] 최신순 정렬, 페이지네이션 optional (MVP: 최근 20건)
- [x] Free 사용자: 한도 요약 + 「Pro 업그레이드」 CTA

**구독 취소 (FR009)**

- [x] `cancelSubscription` Server Action:
  - [x] `cancelAtPeriodEnd = true`, `status = CANCELED`
  - [x] **즉시 Free 전환하지 않음** — `currentPeriodEnd`까지 Pro 유지
  - [x] 성공 토스트: 「{만료일}까지 Pro를 이용할 수 있습니다」
- [x] Cron은 `cancelAtPeriodEnd = true` 구독에 자동결제 **스킵**

**완료 기준**: Pro 전환 후 대시보드·구독 관리에서 상태·만료일·결제 이력 확인. 취소 후 만료일까지 Pro 기능 유지.

---

### Story 3.11 — Vercel Cron 자동 갱신 ✅

**As a** 시스템  
**I want** 매일 03:00 KST에 만료 대상 활성 구독을 자동 결제  
**So that** FR010을 충족하고 Toss 빌링 기반 구독이 지속된다

**체크리스트**

**Cron 엔드포인트**

- [x] `app/api/cron/billing-renewal/route.ts`:
  - [x] `Authorization: Bearer ${CRON_SECRET}` 검증 (401 on mismatch)
  - [x] KST 기준 **매일 03:00 ±30분 윈도우** 검증 (`shouldRunBillingCron`, `--force`로 스킵 가능)
  - [x] 대상 조회: `status=ACTIVE`, `cancelAtPeriodEnd=false`, `billingKey NOT NULL`, `currentPeriodEnd <= now()`
  - [x] 각 구독에 `chargeBilling()` 호출
  - [x] 성공: `currentPeriodEnd` +1개월, `lastPaymentAt`, `payment` insert, `user.planExpiresAt` 갱신
  - [x] 실패: `status=PAST_DUE`, `payment` insert(FAILED), `failureMessage` 저장
  - [x] 멱등성: 동일 `orderId` 중복 결제 방지

**Vercel 설정**

- [x] `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/billing-renewal",
    "schedule": "0 18 * * *"
  }]
}
```

**로컬 Cron 테스트**

- [x] `scripts/run-cron-billing-renewal.ts`:
  - [x] `CRON_SECRET`을 헤더에 담아 `fetch('http://localhost:3002/api/cron/billing-renewal')` 호출
  - [x] (optional) `--force` 플래그로 KST 윈도우 검증 스킵 (로컬 테스트용)
- [x] `package.json`: `"cron:billing": "tsx scripts/run-cron-billing-renewal.ts"`

**완료 기준**: 로컬 `pnpm cron:billing --force` 실행 시 대상 구독 1건 갱신·`payment` 레코드 생성. Vercel Cron 설정 문서화.

---

## 트랙 D — 배포 운영

### Story 3.12 — 환경 변수 검증 스크립트 ✅

**As a** 운영자  
**I want** 배포 전 필수 env 누락을 자동 검출  
**So that** FR006를 충족한다

**체크리스트**

- [x] `scripts/verify-env.ts` — 필수 변수: `DATABASE_URL`, `BETTER_AUTH_*`, `KAKAO_*`, `TOSS_*`, `CRON_SECRET`, `PRO_MONTHLY_PRICE`, `NEXT_PUBLIC_*`
- [x] `package.json` — `"prebuild": "tsx scripts/verify-env.ts"` 또는 `verify:env` 스크립트
- [x] 누락 시 non-zero exit + 어떤 키가 빠졌는지 출력
- [x] `.env.example`과 검증 목록 동기화

**완료 기준**: env 1개 제거 후 스크립트 실행 → 실패 메시지 확인.

---

### Story 3.13 — Vercel 프로덕션 배포

**As a** 운영자  
**I want** main 브랜치 머지 시 자동 배포  
**So that** 실사용 URL에서 서비스 제공

**체크리스트**

- [ ] Vercel 프로젝트 연결 + Production 브랜치 설정
- [ ] Production env: Neon `DATABASE_URL`, Auth, Kakao, Toss 키, `CRON_SECRET`, `PRO_MONTHLY_PRICE` 등록
- [ ] `BETTER_AUTH_URL`, `NEXT_PUBLIC_BETTER_AUTH_URL` → 프로덕션 도메인
- [ ] Kakao Redirect URI: `https://{domain}/api/auth/callback/kakao`
- [ ] Vercel Cron: `vercel.json`의 `billing-renewal` 스케줄 Production 적용 확인
- [ ] Toss `successUrl`/`failUrl`: `https://{domain}/dashboard/billing/success|fail`
- [ ] 커스텀 도메인(optional): `linkhub.example.com` + 단축 URL base URL 설정
- [ ] `pnpm db:push` 또는 migrate를 Production Neon에 적용
- [ ] Preview 배포에서 OAuth/결제 테스트 제한 사항 문서화

**완료 기준**: Production URL에서 카카오 로그인 → 링크 생성 → 단축 URL 리다이렉션 E2E 성공.

---

### Story 3.14 — 배포 후 스모크 테스트 & 모니터링 기본

**As a** 운영자  
**I want** 배포 직후 핵심 흐름과 로그를 확인  
**So that** NFR003·운영 안정성 확보

**체크리스트**

- [ ] 배포 후 체크리스트: 로그인, 링크 생성, 리다이렉션, pricing, **빌링 구독·취소·Cron dry-run**
- [ ] Vercel Analytics 또는 로그에서 5xx·Cron 실패·결제 실패 확인 방법
- [ ] (선택) Playwright 스모크: 로그인 → 링크 1개 생성 → `/r/{slug}` 클릭
- [ ] Epic 3 완료 시 PRD Epic 3 상태 「완료」로 갱신

**완료 기준**: Production 스모크 5항목 통과 기록.

---

#### Epic 3 통합 검증 체크리스트 (Epic 완료 시)

**메인 대시보드 & 한도**

- [ ] Free: 일일 생성 **N/5**, 활성 **N/30** 표시
- [ ] Pro: 「무제한」 표시, Pro 전용 옵션 필드 노출
- [ ] 6번째 일일 생성 · 31번째 활성 링크 시도 차단 + `/pricing` CTA

**링크 생성 & 목록**

- [ ] URL 입력 → 단축 링크 발급 → 복사
- [ ] 목록에 slug, 원본 URL, 클릭 수, 상태 표시
- [ ] 비활성화/삭제 후 활성 count 감소

**리다이렉션**

- [ ] 활성 링크 → 원본 URL 이동 + clickCount 증가
- [ ] 만료/비활성/클릭 한도 초과 → 410

**구독 (Toss 빌링)**

- [x] `/pricing` Free vs Pro 비교 + 월간 자동갱신 안내
- [x] Toss 테스트 키: 카드 등록 → 빌링키 발급 → 최초 결제 → Pro 전환
- [x] 대시보드: 구독 상태·만료일·「구독 관리」 버튼
- [x] `/dashboard/subscription`: 플랜·시작일·만료일·마지막 결제일·결제 이력
- [x] 구독 취소 → 만료일까지 Pro 유지 → Cron 갱신 스킵
- [x] `pnpm cron:billing --force` 로컬 갱신 테스트 (스크립트·엔드포인트 구현 완료)
- [ ] Pro 전환 후 커스텀 슬러그 생성 가능

**배포**

- [x] `verify-env` 스크립트 구현 완료 (`pnpm verify:env`)
- [ ] Vercel Production 배포
- [ ] Production에서 OAuth + 링크 + 리다이렉션 E2E

**Epic 3 완료 정의**: FR001~FR003, FR005~FR010 충족. Free **5/30**, Pro **무제한 + 고급 옵션** 정책이 코드·UI·Toss 빌링·Vercel Cron·배포 전 구간에서 일치.

---

## 범위 외 (Out of Scope)

### 현재 버전에서 제외되는 기능

- ** 모바일 네이티브 앱**: 웹 우선 전략으로 초기 릴리스에서는 제외한다.
- ** 고급 분석 대시보드**: 향후 확장 주제로 남기고 초기 릴리스에서는 다루지 않는다.
- ** 외부 마케팅 자동화 연동**: 초기 운영 범위를 넘어서므로 제외한다.
- ** AI 기반 추천 슬러그**: 서비스 고도화 이후 단계에서 검토한다.
- ** Edge 리다이렉션 API**: 단축 URL은 `app/(public)/r/[slug]/page.tsx` Server Component만 사용한다. `app/api/redirects/` Edge Route Handler는 MVP에서 제외한다.
- ** 일반결제(1회성 결제창)**: Pro 구독은 **자동결제(빌링)** 만 사용한다. Toss 결제위젯·일반결제 API는 MVP 범위 외.
- ** Toss 자체 스케줄링**: 토스페이먼츠는 갱신 스케줄을 제공하지 않는다. **Vercel Cron**으로 자체 구현.

### 지원하지 않는 플랫폼

- iOS 네이티브 앱
- Android 네이티브 앱
- 데스크톱 전용 클라이언트

### 기술적 제약

- 도입 기술은 현재 조직에서 표준으로 사용하는 프론트엔드/백엔드 프레임워크, 소셜 로그인, 결제 대행사, 배포 플랫폼을 우선 고려한다.
- 향후 교체 가능성을 염두에 두고 외부 서비스 의존도를 최소화하며, 고급 커스터마이징은 롤아웃 이후 단계적으로 적용한다.

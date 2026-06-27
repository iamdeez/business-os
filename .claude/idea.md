# 비즈니스 운영 자동화 시스템 — 전략 기획서

> 작성일: 2026-06-28
> 작성자: 크리스탈
> 목적: 크몽 판매용 비즈니스 운영 자동화 솔루션 기획

---

## 목차

- [1. 서비스 컨셉 정리](#1-서비스-컨셉-정리)
- [2. 크몽 상품 구조 설계](#2-크몽-상품-구조-설계)
- [3. 포트폴리오 5개 기획](#3-포트폴리오-5개-기획)
- [4. 모듈형 템플릿 아키텍처 설계](#4-모듈형-템플릿-아키텍처-설계)
- [5. MVP 개발 범위 제안](#5-mvp-개발-범위-제안)
- [6. 실제 개발 계획](#6-실제-개발-계획)
- [7. 프로젝트 폴더 구조](#7-프로젝트-폴더-구조)
- [8. Claude Code 작업용 문서 구조](#8-claude-code-작업용-문서-구조)
- [9. 실행 가능한 태스크 목록](#9-실행-가능한-태스크-목록)
- [10. 브랜딩 전략](#10-브랜딩-전략)

---

## 1. 서비스 컨셉 정리

### 이 서비스가 무엇인지

고객의 반복 업무를 분석해, 사람이 직접 하던 일을 시스템이 자동으로 처리하도록 구축해주는 맞춤형 웹 시스템 제작 서비스다. 단순 홈페이지나 챗봇이 아니라, 고객 관리·예약·견적·파일 공유·알림·대시보드가 하나로 연결된 "운영 시스템"을 만들어준다.

### 누구를 위한 서비스인지

| 고객군 | 구체적 예시 |
|---|---|
| 1인 사업자 / 소상공인 | 스튜디오, 개인 클리닉, 프리랜서 에이전시 |
| 직원 5~30명 규모 SMB | 교육원, 중소 제조업, B2B 서비스업 |
| 디지털 전환이 느린 업종 | 카카오톡 + 엑셀로 운영 중인 모든 업체 |

### 고객이 느끼는 문제

- 문의가 카카오톡으로 오면 일일이 답변하고, 엑셀에 따로 기록한다
- 견적서를 매번 새로 만들고, 파일을 이메일로 주고받는다
- 예약 일정이 머릿속이나 종이에 있어 놓치는 일이 생긴다
- 직원이 퇴근하면 고객 응대가 멈춘다
- 통계나 현황을 보려면 엑셀을 열어 직접 집계해야 한다
- 뭔가 자동화하고 싶은데 어디서부터 시작해야 할지 모른다

### 핵심 가치

> **"카카오톡 + 엑셀로 운영하던 비즈니스를, 시스템이 알아서 돌아가게 만듭니다."**

1. **시간 절약**: 반복 업무를 자동화해 하루 2~4시간 이상 회수
2. **실수 제거**: 수작업에서 오는 누락·오기재·분실 차단
3. **24시간 운영**: 사람이 없어도 문의 접수·예약·파일 전달 가능
4. **현황 파악**: 대시보드 하나로 매출·고객·진행 상태 즉시 확인

---

## 2. 크몽 상품 구조 설계

### 상품명 후보 10개

1. **비즈니스 운영 자동화 시스템 구축** ← 추천
2. AI 업무 자동화 웹 시스템 제작
3. 중소기업 맞춤 운영 관리 시스템 개발
4. 업무 자동화 올인원 시스템 구축
5. 카카오톡·엑셀 탈출 — 운영 자동화 시스템 제작
6. 고객 관리 + 견적 + 예약 자동화 시스템
7. 소상공인 비즈니스 OS 구축 서비스
8. 반복 업무 제거 — 맞춤 운영 시스템 개발
9. 업종별 운영 자동화 솔루션 구축
10. AI 연동 고객 관리 시스템 제작

### 상세페이지 제목

> **카카오톡·엑셀로 운영하던 비즈니스를, 이제 시스템이 알아서 돌아가게 만듭니다**
> — 고객 관리·예약·견적·파일·알림을 하나의 시스템으로 통합

### 고객에게 보여줄 핵심 문구

```
✅ "문의가 오면 자동으로 접수되고, 담당자에게 알림이 갑니다"
✅ "견적서를 매번 새로 만들 필요가 없어집니다"
✅ "예약이 들어오면 자동으로 일정이 잡히고 확인 메시지가 나갑니다"
✅ "직원이 퇴근해도 고객 응대가 멈추지 않습니다"
✅ "모든 현황을 대시보드 하나로 실시간 확인합니다"
```

### 패키지 구성

| 구분 | 기본형 | 표준형 | 고급형 |
|---|---|---|---|
| **이름** | Starter | Standard | Business OS |
| **가격** | 150만 원 | 350만 원 | 700만 원~ |
| **제작 기간** | 2주 | 3~4주 | 6~8주 |
| **포함 모듈 수** | 3~4개 | 6~8개 | 전체 맞춤 |
| **관리자 계정** | 1개 | 3개 | 무제한 |
| **AI 연동** | ✗ | 기본 챗봇 | 풀 AI 자동화 |
| **모바일 대응** | 기본 | 최적화 | 완전 최적화 |
| **유지보수** | 1개월 | 2개월 | 3개월 |
| **운영 매뉴얼** | ✗ | ✅ | ✅ + 영상 |
| **배포 포함** | ✅ | ✅ | ✅ |

#### 기본형 (150만 원) 포함 범위

- 고객 문의 접수 + 관리자 확인 화면
- 파일 업로드/다운로드 (견적서, 계약서)
- 기본 대시보드 (문의 현황, 최근 고객)
- 관리자 로그인

#### 표준형 (350만 원) 포함 범위

- 기본형 전체 +
- 예약/일정 관리
- 고객 CRM (이력, 메모, 상태)
- 알림 자동화 (이메일 or 카카오)
- 견적 자동 생성 (템플릿)
- 진행 상태 관리 (칸반)
- 권한 관리 (관리자/담당자)

#### 고급형 (700만 원~) 포함 범위

- 표준형 전체 +
- AI 상담 자동화 (챗봇)
- 결제/계약 관리
- 작업자 배정 시스템
- 통계/리포트 대시보드
- 운영 매뉴얼 자동 생성
- QA 체크리스트
- 슬랙/노션 연동

### 상담 전 고객 질문 리스트

```
1. 현재 업종과 주요 서비스/상품은 무엇인가요?
2. 지금 어떤 방식으로 고객 관리를 하고 계신가요? (카카오톡/엑셀/전화 등)
3. 하루 또는 주간 평균 문의/고객 수는 얼마나 되나요?
4. 가장 시간이 많이 걸리고 반복되는 업무가 무엇인가요?
5. 현재 직원은 몇 명인가요? 시스템을 사용할 사람은 누구누구인가요?
6. 고객에게 보내는 문서가 있나요? (견적서, 계약서, 안내문 등)
7. 예약이나 일정 관리가 필요하신가요?
8. 모바일에서도 사용해야 하나요?
9. 완성 후 유지보수를 직접 하실 건가요, 맡기실 건가요?
10. 원하시는 오픈 일정과 예산 범위가 있으신가요?
```

---

## 3. 포트폴리오 5개 기획

### 포트폴리오 1 — 사진/영상 스튜디오

**업종**: 웨딩/돌/상업 사진 스튜디오

**고객 문제**:
예약 확인을 카카오로 하다 보니 더블 부킹이 생기고, 촬영 후 사진 파일을 USB나 네이버 클라우드로 전달해야 한다. 결제는 계좌이체를 확인해야 하고, 촬영 일정은 종이 달력에 적는다.

**기존 업무 방식**:
`고객 문의(카카오) → 일정 확인(종이 달력) → 예약 확정(카카오) → 촬영 → 편집 → USB 전달 또는 파일 공유(카카오/이메일) → 입금 확인(통장)`

**개선 후 업무 흐름**:
`고객 예약 신청(웹폼) → 자동 가능 일정 표시 → 예약 확정 알림 자동 발송 → 촬영 완료 후 파일 업로드 → 고객 전용 다운로드 링크 자동 발송 → 결제 상태 자동 업데이트`

**포함 모듈**: 예약/일정 관리, 파일 업로드/다운로드, 고객 CRM, 알림 자동화, 결제 상태 관리, 관리자 대시보드

**주요 화면**:
- 고객용: 예약 신청 페이지, 파일 다운로드 페이지
- 관리자용: 월간 예약 달력, 고객 목록, 파일 관리, 결제 현황

**기술 스택**: Next.js 15, PostgreSQL, Prisma, AWS S3, Vercel, 카카오 알림톡 API

**기대 효과**: 더블 부킹 0건, 파일 전달 시간 90% 단축, 관리자 1명이 월 50건 이상 처리 가능

**데모 시나리오**:
1. 고객이 예약 페이지에서 날짜 선택 → 자동 예약 완료 문자 수신
2. 관리자가 촬영 완료 후 파일 업로드 → 고객에게 다운로드 링크 자동 발송
3. 관리자 대시보드에서 이번 달 예약 현황 및 미결제 고객 목록 확인

**포트폴리오 설명 문구**:
> "예약부터 파일 전달까지 모든 과정이 자동화된 스튜디오 운영 시스템입니다. 카카오톡으로 주고받던 예약 확인과 파일 전달이 사라지고, 고객은 온라인으로 예약하고 파일을 다운받습니다."

---

### 포트폴리오 2 — 병원/의원 예약·상담 자동화

**업종**: 피부과, 한의원, 치과, 정신건강의학과 등 중소 의원

**고객 문제**:
전화 예약이 집중되어 진료 중 응대 불가, 예약 취소 통보를 못 받아 공석 발생, 재진 환자 관리가 안 됨, 진료 후 안내문을 매번 수기로 발송.

**기존 업무 방식**:
`전화 예약 → 수기 기록 → 당일 예약 확인 전화 → 진료 → 수납 → 재방문 안내(구두)`

**개선 후 업무 흐름**:
`온라인 예약 신청 → 자동 확인 문자 → 전날 자동 리마인드 → 당일 체크인 → 진료 후 주의사항 자동 발송 → 재방문 시기 자동 알림`

**포함 모듈**: 예약/일정 관리, 고객 CRM(환자 이력), 알림 자동화, 관리자 대시보드, 상담 내용 기록

**주요 화면**:
- 고객용: 진료 예약 페이지(증상 선택, 날짜 선택), 예약 확인 페이지
- 관리자용: 오늘의 예약 목록, 환자 이력 조회, 알림 발송 현황

**기술 스택**: Next.js 15, PostgreSQL, Prisma, Vercel, 카카오 알림톡 API, 캘린더 통합

**기대 효과**: 전화 예약 70% 감소, 노쇼율 50% 감소, 직원 1명이 예약 업무 전담 불필요

**데모 시나리오**:
1. 환자가 스마트폰으로 증상 선택 → 원하는 날짜 선택 → 예약 완료 문자 수신
2. 전날 오후 6시 자동으로 리마인드 문자 발송
3. 관리자 화면에서 오늘 예약 10명 목록 확인, 1명 노쇼 처리

**포트폴리오 설명 문구**:
> "진료 중에도 예약이 자동으로 접수됩니다. 전화 응대 없이 온라인으로 예약받고, 리마인드 문자로 노쇼를 줄이고, 환자 이력은 시스템이 자동으로 쌓습니다."

---

### 포트폴리오 3 — 쇼핑몰 CS·반품·주문 관리 자동화

**업종**: 의류/잡화/식품 쇼핑몰 (스마트스토어 병행 운영)

**고객 문제**:
문의가 스마트스토어, 카카오톡, 인스타그램 DM에 분산되어 누락 발생. 반품 처리를 엑셀로 관리하다가 실수. 동일 문의에 매번 같은 답변을 타이핑.

**기존 업무 방식**:
`문의 접수(여러 채널) → 개별 확인 → 수기 답변 → 반품/교환 엑셀 기록 → 물류팀 카카오 전달`

**개선 후 업무 흐름**:
`문의 통합 수신(시스템) → AI 1차 자동 답변 → 담당자 검토/발송 → 반품 접수 자동 처리 → 물류팀 자동 알림 → 상태 자동 추적`

**포함 모듈**: 문의 관리, AI 상담 자동화, 반품/교환 상태 관리, 알림 자동화, 담당자 배정, 대시보드

**주요 화면**:
- 고객용: 문의 접수 폼, 반품 신청 폼, 처리 현황 확인 페이지
- 관리자용: 통합 문의 인박스, 반품 관리 목록, CS 통계

**기술 스택**: Next.js 15, PostgreSQL, Prisma, Claude API (AI 답변), 카카오 알림톡, Vercel

**기대 효과**: CS 처리 시간 60% 단축, 문의 누락 0건, 반품 처리 오류 80% 감소

**데모 시나리오**:
1. 고객이 반품 신청 → 접수 확인 문자 자동 발송 → 담당자에게 슬랙 알림
2. 자주 묻는 질문(배송 조회)에 AI가 자동으로 1차 답변
3. 관리자 화면에서 이번 주 반품 현황 및 처리 완료율 확인

**포트폴리오 설명 문구**:
> "카카오, 인스타, 스마트스토어에 흩어진 문의가 하나의 화면에 모입니다. AI가 반복 문의에 자동으로 답하고, 반품·교환 상태는 시스템이 추적합니다."

---

### 포트폴리오 4 — 교육기관 상담·등록·출결 관리

**업종**: 학원, 교습소, 온라인 강의 플랫폼

**고객 문제**:
신규 상담 연락이 오면 일정 잡기가 번거롭고, 등록 후 수강료 미납 추적이 힘들다. 출결은 종이 명부나 카카오톡으로 관리하고, 퇴원 위기 학생을 놓친다.

**기존 업무 방식**:
`상담 문의(전화/카카오) → 상담 일정 협의 → 등록 수기 → 수강료 수기 관리 → 출결 종이 기록 → 미납 독촉(개인 연락)`

**개선 후 업무 흐름**:
`온라인 상담 신청 → 상담 일정 자동 확정 → 등록 시스템 입력 → 수강료 자동 청구 알림 → 출결 QR 체크인 → 미납/결석 자동 알림`

**포함 모듈**: 상담 예약, 고객 CRM(수강생 이력), 결제/수강료 관리, 출결 관리, 알림 자동화, 대시보드

**주요 화면**:
- 수강생/학부모용: 상담 신청, 수강 현황, 출결 이력
- 관리자용: 수강생 목록, 출결 현황, 수납 현황, 이탈 위험 학생 알림

**기술 스택**: Next.js 15, PostgreSQL, Prisma, QR 코드 생성, 카카오 알림톡, Vercel

**기대 효과**: 상담 전환율 30% 향상, 미납률 50% 감소, 원장/선생님 행정 시간 하루 2시간 절약

**데모 시나리오**:
1. 학부모가 온라인으로 상담 신청 → 원하는 시간 선택 → 확인 문자 수신
2. 매달 1일 수강료 납부 안내 문자 자동 발송
3. 관리자가 이번 달 결석 3회 이상 학생 리스트 확인 → 관리 알림

**포트폴리오 설명 문구**:
> "원장 선생님이 행정에 쏟던 시간을 수업에 쓸 수 있게 됩니다. 상담 예약부터 출결, 수납 관리까지 시스템이 알아서 처리하고, 이탈 위험 학생은 미리 알려줍니다."

---

### 포트폴리오 5 — B2B 견적·계약·프로젝트 관리

**업종**: 인테리어, 인쇄·제작, IT 에이전시, 설비 업체

**고객 문제**:
견적서를 매번 워드로 만들고 이메일로 보낸다. 계약서는 스캔해서 보관하고, 프로젝트 진행 상황을 고객과 카카오로 공유한다. 납품 후 대금 청구 타이밍을 놓친다.

**기존 업무 방식**:
`고객 문의 → 미팅 → 수기 견적 작성 → 이메일 발송 → 계약서 수기 → 프로젝트 진행(카카오 공유) → 납품 → 대금 청구`

**개선 후 업무 흐름**:
`문의 접수(시스템) → 견적 템플릿 자동 생성 → 온라인 승인 → 계약서 디지털 서명 → 진행 상태 고객 포털 공개 → 단계별 자동 청구 알림`

**포함 모듈**: 문의 관리, 견적 자동화, 계약 관리(파일), 프로젝트 진행 상태, 고객 포털, 결제/청구 관리, 알림

**주요 화면**:
- 고객용: 견적 확인 및 승인, 진행 상황 포털, 파일 다운로드
- 관리자용: 프로젝트 목록(칸반), 견적 관리, 계약서 보관함, 청구 현황

**기술 스택**: Next.js 15, PostgreSQL, Prisma, AWS S3, PDF 생성(React PDF), 이메일(Resend), Vercel

**기대 효과**: 견적 작성 시간 80% 단축, 프로젝트 관련 카카오 문의 70% 감소, 대금 미청구 0건

**데모 시나리오**:
1. 관리자가 고객 선택 + 항목 입력 → 견적서 PDF 자동 생성 → 고객 링크 발송
2. 고객이 링크 열어 견적 확인 후 "승인" 버튼 클릭 → 계약 단계 자동 전환
3. 고객이 고객 포털에서 "현재 진행 단계: 시공 중 (3/5)" 실시간 확인

**포트폴리오 설명 문구**:
> "견적서 만드는 데 1시간 걸리던 게 5분이 됩니다. 고객은 링크 하나로 견적 확인, 승인, 진행 상황 체크를 합니다. 담당자는 카카오 대신 시스템에서 모든 걸 관리합니다."

---

## 4. 모듈형 템플릿 아키텍처 설계

### 공통 Core 모듈

```
core/
├── auth/           — 로그인, 세션, JWT, 역할 기반 권한
├── user/           — 관리자 계정, 프로필 관리
├── notification/   — 이메일/카카오/슬랙 발송 공통 인터페이스
├── file/           — S3 업로드/다운로드 공통 처리
├── dashboard/      — 위젯 기반 대시보드 공통 레이아웃
└── audit/          — 활동 로그, 변경 이력
```

### 업종별 확장 모듈

```
modules/
├── crm/            — 고객 관리 (공통)
├── inquiry/        — 문의/상담 관리 (공통)
├── reservation/    — 예약/일정 관리
├── quotation/      — 견적 자동화
├── contract/       — 계약서 관리
├── project/        — 프로젝트 진행 상태
├── file-vault/     — 고객별 파일 전달
├── payment/        — 결제/청구 관리
├── attendance/     — 출결 관리
├── ai-chat/        — AI 상담 자동화
└── report/         — 통계/리포트
```

### 프론트엔드 구조 (Next.js 15 App Router)

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── layout.tsx
│   ├── (admin)/                  — 관리자 영역
│   │   ├── layout.tsx            — 사이드바, 헤더 포함
│   │   ├── dashboard/
│   │   ├── customers/
│   │   ├── inquiries/
│   │   ├── reservations/
│   │   ├── projects/
│   │   ├── files/
│   │   ├── notifications/
│   │   └── settings/
│   ├── (portal)/                 — 고객 포털 영역
│   │   ├── layout.tsx
│   │   └── [token]/              — 토큰 기반 접근
│   │       ├── status/           — 진행 상태 확인
│   │       ├── files/            — 파일 다운로드
│   │       └── quote/            — 견적 확인/승인
│   └── api/
│       ├── auth/
│       ├── files/
│       ├── notifications/
│       └── webhooks/
├── components/
│   ├── ui/                       — shadcn/ui 기반 공통 컴포넌트
│   ├── layout/                   — Sidebar, Header, PageHeader
│   ├── dashboard/                — 위젯 컴포넌트
│   ├── data-table/               — 공통 테이블
│   └── forms/                    — 공통 폼 컴포넌트
├── modules/                      — 도메인별 컴포넌트/훅/액션
│   ├── crm/
│   ├── inquiry/
│   ├── reservation/
│   └── ...
├── lib/
│   ├── auth.ts                   — auth.js 설정
│   ├── prisma.ts                 — Prisma 클라이언트 싱글톤
│   ├── s3.ts                     — AWS S3 유틸
│   ├── notification.ts           — 알림 발송 통합 유틸
│   └── pdf.ts                    — PDF 생성 유틸
└── types/                        — 공통 타입 정의
```

### 백엔드/API 구조

Next.js App Router + Server Actions 기반.

```
패턴:
- 읽기: Server Component에서 직접 Prisma 조회
- 쓰기: Server Action (form action 또는 useTransition)
- 외부 웹훅 수신: Route Handler (/api/webhooks/)
- 파일 업로드: Route Handler → S3 presigned URL
- AI 스트리밍: Route Handler (/api/ai/chat) → Vercel AI SDK
```

### DB 모델 초안 (Prisma)

```prisma
model Tenant {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  plan      Plan     @default(BASIC)
  settings  Json?
  createdAt DateTime @default(now())
  users     User[]
  customers Customer[]
  inquiries Inquiry[]
}

model User {
  id        String   @id @default(cuid())
  tenantId  String
  tenant    Tenant   @relation(fields: [tenantId], references: [id])
  email     String   @unique
  name      String
  role      Role     @default(STAFF)
  createdAt DateTime @default(now())
}

model Customer {
  id           String         @id @default(cuid())
  tenantId     String
  tenant       Tenant         @relation(fields: [tenantId], references: [id])
  name         String
  phone        String?
  email        String?
  memo         String?
  status       CustomerStatus @default(ACTIVE)
  source       String?
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt
  inquiries    Inquiry[]
  reservations Reservation[]
  files        FileItem[]
  projects     Project[]
}

model Inquiry {
  id         String        @id @default(cuid())
  tenantId   String
  customerId String?
  customer   Customer?     @relation(fields: [customerId], references: [id])
  channel    Channel       @default(WEB)
  title      String
  content    String
  status     InquiryStatus @default(NEW)
  assigneeId String?
  createdAt  DateTime      @default(now())
  updatedAt  DateTime      @updatedAt
}

model Reservation {
  id         String            @id @default(cuid())
  tenantId   String
  customerId String
  customer   Customer          @relation(fields: [customerId], references: [id])
  startAt    DateTime
  endAt      DateTime
  status     ReservationStatus @default(PENDING)
  memo       String?
  createdAt  DateTime          @default(now())
}

model Project {
  id          String        @id @default(cuid())
  tenantId    String
  customerId  String
  customer    Customer      @relation(fields: [customerId], references: [id])
  title       String
  status      ProjectStatus @default(PLANNING)
  steps       Json?
  portalToken String        @unique @default(cuid())
  dueDate     DateTime?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  files       FileItem[]
}

model FileItem {
  id           String    @id @default(cuid())
  tenantId     String
  customerId   String?
  projectId    String?
  customer     Customer? @relation(fields: [customerId], references: [id])
  project      Project?  @relation(fields: [projectId], references: [id])
  name         String
  s3Key        String
  size         Int
  mimeType     String
  uploadedById String?
  createdAt    DateTime  @default(now())
}

model NotificationLog {
  id        String           @id @default(cuid())
  tenantId  String
  type      NotificationType
  recipient String
  subject   String?
  body      String
  status    SendStatus       @default(PENDING)
  sentAt    DateTime?
  createdAt DateTime         @default(now())
}

enum Role            { OWNER ADMIN STAFF VIEWER }
enum Plan            { BASIC STANDARD ENTERPRISE }
enum CustomerStatus  { ACTIVE INACTIVE BLOCKED }
enum InquiryStatus   { NEW INPROGRESS RESOLVED CLOSED }
enum ReservationStatus { PENDING CONFIRMED COMPLETED CANCELLED }
enum ProjectStatus   { PLANNING INPROGRESS REVIEW COMPLETED CANCELLED }
enum Channel         { WEB KAKAO PHONE INSTAGRAM }
enum NotificationType { EMAIL KAKAO SLACK }
enum SendStatus      { PENDING SENT FAILED }
```

### 파일 저장 구조 (S3)

```
/{tenantId}/
  /customers/{customerId}/
    /{year}/{month}/
      {fileId}-{originalName}
  /projects/{projectId}/
    {fileId}-{originalName}
  /templates/
  /exports/

업로드: presigned URL (5분 유효) — 클라이언트에서 직접 S3 업로드
다운로드: presigned URL (1시간 유효) — 서버에서 생성 후 클라이언트 전달
고객 포털: 토큰 검증 후 presigned URL 발급
```

### 알림 구조

```typescript
// lib/notification.ts — 단일 진입점
type NotificationPayload = {
  to: string
  templateKey: string    // 'reservation_confirm', 'file_ready', 등
  data: Record<string, string>
  channels: ('email' | 'kakao' | 'slack')[]
}

await sendNotification({
  to: customer.phone,
  templateKey: 'reservation_confirm',
  data: { name: customer.name, date: '7월 5일 오후 2시' },
  channels: ['kakao', 'email']
})
```

### AI 연동 구조

```
1단계 (MVP): AI 없음
2단계 (표준형): Claude API — 문의 자동 분류 + 1차 답변 초안
3단계 (고급형): 실시간 AI 챗봇 (Vercel AI SDK + Claude)

AI 사용 포인트:
- 문의 내용 → 카테고리 자동 분류
- 문의 내용 → 1차 답변 초안 생성
- 고객 데이터 → 이탈 위험 점수 산정
- 문서 업로드 → 내용 요약 생성
```

### 관리자 권한 구조

```
OWNER   — 전체 설정, 사용자 초대/삭제, 결제, 모든 데이터
ADMIN   — 모든 기능 사용, 설정 변경 (결제 제외)
STAFF   — 담당 고객/프로젝트만 접근, 설정 불가
VIEWER  — 읽기 전용 (통계, 현황 조회)
```

### 배포 구조

```
프론트/API: Vercel (자동 배포, PR 프리뷰)
DB:         Supabase PostgreSQL
파일:       AWS S3 + CloudFront
이메일:     Resend
알림:       카카오 알림톡 API
AI:         Anthropic Claude API

월 인프라 비용 (고객 1개 프로젝트 기준): 약 3~7만 원
- Vercel Pro: $20
- Supabase Pro: $25
- AWS S3: $1~5
- Resend: 무료~$20
```

---

## 5. MVP 개발 범위 제안

### 우선순위 매트릭스

| 모듈 | 판매 가능성 | 포트폴리오 임팩트 | 재사용성 | 개발 난이도 | 우선순위 |
|---|---|---|---|---|---|
| 관리자 로그인/권한 | 필수 | 중 | ★★★ | 낮 | **1** |
| 고객 CRM | 높음 | 높음 | ★★★ | 낮 | **1** |
| 문의 접수/관리 | 높음 | 높음 | ★★★ | 낮 | **1** |
| 파일 업로드/다운로드 | 높음 | 높음 | ★★★ | 중 | **1** |
| 이메일 알림 | 필수 | 중 | ★★★ | 낮 | **1** |
| 대시보드 | 높음 | 높음 | ★★★ | 중 | **2** |
| 예약/일정 | 높음 | 높음 | ★★ | 중 | **2** |
| 프로젝트 상태 관리 | 높음 | 높음 | ★★ | 중 | **2** |
| 견적 자동화 | 중 | 높음 | ★★ | 높음 | **3** |
| AI 챗봇 | 중 | 높음 | ★ | 높음 | **3** |

### 2주 MVP 포함 기능

```
✅ 관리자 로그인 (이메일+비밀번호)
✅ 고객 목록 / 등록 / 상세
✅ 문의 접수 폼 (공개) + 관리자 인박스
✅ 파일 업로드 (관리자) + 고객 다운로드 링크
✅ 이메일 알림 (Resend)
✅ 기본 대시보드 (오늘 문의 수, 고객 수, 파일 수)
```

이것만으로도 스튜디오·B2B 에이전시 포트폴리오 데모 가능, 크몽 기본형 판매 가능.

---

## 6. 실제 개발 계획

### 주차별 로드맵

**1주차 — Core 기반 구축**
- Next.js 15 프로젝트 세팅 (TypeScript, Tailwind, shadcn/ui)
- Prisma + Supabase 연결
- auth.js 로그인/세션
- 기본 레이아웃 (사이드바, 헤더)
- 고객 CRUD (목록, 등록, 상세, 수정)
- 문의 접수 공개 폼

**2주차 — 핵심 기능**
- 관리자 문의 인박스 (목록, 필터, 상태 변경)
- 파일 업로드 (S3 presigned URL)
- 파일 고객 공유 (토큰 기반 다운로드 페이지)
- 이메일 알림 (Resend)
- 기본 대시보드 위젯

**3주차 — 확장 기능 (표준형)**
- 예약 달력 (React Big Calendar)
- 예약 확인/거절 + 알림
- 프로젝트 생성 + 진행 단계 관리
- 고객 포털 (토큰 기반 진행 상태 확인)
- 카카오 알림톡 연동

**4주차 — 포트폴리오 완성**
- 데모 데이터 시드 (각 업종별)
- UI 디테일 개선 (반응형, 빈 상태 화면)
- 크몽 상세페이지 초안 작성
- 포트폴리오 스크린샷/데모 영상 촬영
- README + 운영 매뉴얼 초안

### 먼저 만들 DB 테이블

```
1순위: Tenant, User, Customer, Inquiry, FileItem, NotificationLog
2순위: Reservation, Project
3순위: Quotation, Payment, Attendance
```

### 먼저 만들 화면

```
1. /login                    — 관리자 로그인
2. /admin/dashboard          — 메인 대시보드
3. /admin/customers          — 고객 목록
4. /admin/customers/[id]     — 고객 상세
5. /admin/inquiries          — 문의 인박스
6. /admin/files              — 파일 관리
7. /inquiry                  — 공개 문의 접수 폼
8. /portal/[token]           — 고객 파일 다운로드 / 상태 확인
```

### 먼저 만들 Server Actions

```
auth.ts          — signIn, signOut
customers.ts     — createCustomer, updateCustomer, getCustomers
inquiries.ts     — createInquiry (public), updateInquiryStatus
files.ts         — getUploadUrl, createFileRecord, getDownloadUrl
notifications.ts — sendEmail
```

### 우선순위 낮은 기능 (나중에)

- AI 챗봇 연동
- 견적서 PDF 생성
- 카카오 알림톡 (이메일 먼저)
- 결제/청구 관리
- 출결 관리
- QA 체크리스트
- 운영 매뉴얼 자동 생성
- 슬랙 연동

---

## 7. 프로젝트 폴더 구조

```
kmong-biz-os/
├── .claude/
│   ├── idea.md                   — 이 파일
│   ├── project-overview.md
│   ├── product-strategy.md
│   ├── architecture.md
│   ├── module-spec.md
│   ├── database-design.md
│   ├── api-spec.md
│   ├── ui-guidelines.md
│   ├── qa-checklist.md
│   ├── deployment-guide.md
│   ├── kmong-product-page.md
│   └── portfolio-scenarios.md
├── docs/
│   ├── specs/
│   │   └── v1.0.0/
│   └── portfolio/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── public/
├── src/
│   ├── app/
│   │   ├── (auth)/login/
│   │   ├── (admin)/
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   ├── customers/
│   │   │   ├── inquiries/
│   │   │   ├── reservations/
│   │   │   ├── projects/
│   │   │   ├── files/
│   │   │   └── settings/
│   │   ├── (portal)/[token]/
│   │   ├── inquiry/
│   │   └── api/
│   │       ├── auth/
│   │       ├── files/upload-url/
│   │       └── webhooks/
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── data-table/
│   │   ├── dashboard/
│   │   └── forms/
│   ├── modules/
│   │   ├── crm/
│   │   ├── inquiry/
│   │   ├── reservation/
│   │   ├── project/
│   │   └── file/
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── prisma.ts
│   │   ├── s3.ts
│   │   ├── notification.ts
│   │   └── utils.ts
│   └── types/
├── .env.example
├── package.json
├── tsconfig.json
└── next.config.ts
```

---

## 8. Claude Code 작업용 문서 구조

각 `.claude/` 문서의 역할과 포함 내용.

| 파일 | 역할 | 주요 내용 |
|---|---|---|
| `idea.md` | 전체 기획서 (이 파일) | 컨셉, 상품 구조, 포트폴리오, 아키텍처 전체 |
| `project-overview.md` | 프로젝트 현재 상태 | 기술 스택, 외부 서비스, 진행 단계 |
| `product-strategy.md` | 판매 전략 | 크몽 포지셔닝, 패키지 가격, 타겟 고객 |
| `architecture.md` | 기술 아키텍처 | 기술 선택 이유, 데이터 흐름, 인증, 멀티테넌트 |
| `module-spec.md` | 모듈 상세 명세 | 각 모듈의 기능 범위, 모델, UI |
| `database-design.md` | DB 설계 | 설계 원칙, 인덱스, 시드 데이터 |
| `api-spec.md` | API 명세 | Server Actions 목록, Route Handler 목록 |
| `ui-guidelines.md` | UI 가이드 | 디자인 원칙, 컴포넌트 규칙, 색상 체계 |
| `qa-checklist.md` | QA 체크리스트 | 기능별 검증 항목, 배포 전 확인 사항 |
| `deployment-guide.md` | 배포 가이드 | Vercel 설정, 환경변수, 도메인 연결 |
| `kmong-product-page.md` | 크몽 상품 페이지 초안 | 제목, 소개 문구, 패키지, FAQ |
| `portfolio-scenarios.md` | 포트폴리오 데모 시나리오 | 업종별 데모 계정, 데모 스크립트 |

---

## 9. 실행 가능한 태스크 목록

### 프로젝트 초기 세팅

- [ ] Next.js 15 프로젝트 생성 (TypeScript, Tailwind, App Router)
- [ ] shadcn/ui 초기화 및 기본 컴포넌트 설치
- [ ] Prisma 설치 + Supabase 연결
- [ ] .env.local 설정 (DB URL, S3, Resend)
- [ ] ESLint, Prettier 설정
- [ ] .claude/ 문서 폴더 초기화

### 인증 구조

- [ ] auth.js v5 설치 및 설정
- [ ] 로그인 페이지 (/login)
- [ ] 세션 미들웨어 (tenantId, role 검증)
- [ ] 역할별 라우트 보호

### 레이아웃

- [ ] 관리자 사이드바 컴포넌트
- [ ] 관리자 헤더 컴포넌트
- [ ] 반응형 레이아웃 (모바일 사이드바 토글)
- [ ] PageHeader 컴포넌트 (제목, 액션 버튼)

### 고객 관리 모듈 (CRM)

- [ ] Customer Prisma 모델 + 마이그레이션
- [ ] 고객 목록 페이지 (검색, 필터, 페이지네이션)
- [ ] 고객 등록 폼 (이름, 연락처, 이메일, 유입 경로)
- [ ] 고객 상세 페이지 (이력 탭: 문의/파일/예약)
- [ ] 고객 수정/비활성화 기능

### 문의 관리 모듈

- [ ] Inquiry Prisma 모델 + 마이그레이션
- [ ] 공개 문의 접수 폼 페이지 (/inquiry)
- [ ] 관리자 문의 인박스 (NEW → INPROGRESS → RESOLVED)
- [ ] 문의 상세 + 답변 발송 (이메일)
- [ ] 담당자 배정 기능

### 파일 업로드/다운로드 모듈

- [ ] FileItem Prisma 모델 + 마이그레이션
- [ ] AWS S3 버킷 생성 + IAM 설정
- [ ] Presigned URL 발급 API Route
- [ ] 파일 업로드 UI (드래그앤드롭)
- [ ] 고객 공유 링크 생성 (포털 토큰)
- [ ] 고객 파일 다운로드 페이지 (/portal/[token])

### 알림 자동화

- [ ] Resend 이메일 연동
- [ ] 알림 템플릿 작성 (문의 접수, 파일 공유, 예약 확인)
- [ ] NotificationLog Prisma 모델
- [ ] 알림 발송 유틸 (notification.ts)

### 예약/일정 관리

- [ ] Reservation Prisma 모델 + 마이그레이션
- [ ] 예약 달력 UI (React Big Calendar)
- [ ] 예약 신청 공개 폼
- [ ] 예약 확인/거절 + 알림
- [ ] 시간대 중복 체크 로직

### 프로젝트 상태 관리

- [ ] Project Prisma 모델 + 마이그레이션
- [ ] 프로젝트 목록 (칸반 보드)
- [ ] 프로젝트 생성 + 단계 설정
- [ ] 고객 포털 진행 상태 페이지
- [ ] 단계별 자동 알림

### 관리자 대시보드

- [ ] 오늘 문의 수, 신규 고객 수 위젯
- [ ] 최근 문의 목록 위젯
- [ ] 이번 주 예약 달력 미리보기
- [ ] 처리 필요 항목 알림 위젯

### 포트폴리오 데모 데이터

- [ ] prisma/seed.ts 작성 (업종별 샘플 데이터)
- [ ] 스튜디오 데모 시나리오 데이터
- [ ] 쇼핑몰 CS 데모 시나리오 데이터
- [ ] B2B 에이전시 데모 시나리오 데이터
- [ ] 데모 계정 생성 (업종별)

### 크몽 상세페이지

- [ ] 상품명 확정
- [ ] 서비스 소개 문구 작성
- [ ] 패키지 구성 표 작성
- [ ] 포트폴리오 스크린샷 촬영
- [ ] 데모 영상 녹화 (Loom 또는 화면 캡처)
- [ ] FAQ 작성
- [ ] 크몽 등록

---

## 10. 브랜딩 전략

### 언어 전환 (가장 중요)

| 개발자 언어 (피해야 할) | 고객 언어 (써야 할) |
|---|---|
| "웹 개발해드립니다" | "업무 자동화 시스템 구축해드립니다" |
| "CRUD 구현" | "고객 정보를 한 곳에서 관리" |
| "API 연동" | "카카오 알림 자동 발송" |
| "DB 설계" | "데이터가 자동으로 쌓이고 분석됩니다" |
| "반응형 웹" | "스마트폰에서도 동일하게 사용 가능" |
| "관리자 페이지" | "사장님 전용 운영 화면" |

### 포지셔닝 메시지

```
❌ "Next.js + AWS로 웹 시스템 개발해드립니다"
✅ "반복 업무를 없애고 하루 3시간을 돌려드립니다"

❌ "고객 관리 웹 애플리케이션 제작"
✅ "엑셀에 흩어진 고객 정보를 시스템 하나로 통합"
```

### 크몽 차별화 전략 5가지

1. **과정 말고 결과를 판다** — "납품 산출물"이 아닌 "도입 후 변화" 앞에 내세우기
2. **업종 특화 포트폴리오** — 동일 업종 고객이 "우리 얘기네" 느끼게 수치 포함
3. **상담 자체를 서비스화** — 사전 질문지 → "업무 분석 보고서" 형태로 제공
4. **유지보수 명시** — 납품 후 1~3개월 무상 유지보수, 비개발자 불안감 해소
5. **운영 매뉴얼 포함** — Notion 또는 영상 매뉴얼, "제대로 된 서비스" 인식

### 장기 브랜딩 로드맵

```
Phase 1 (0~3개월): 크몽 판매 + 포트폴리오 축적
  → "업종별 전문 시스템 구축 전문가" 포지셔닝

Phase 2 (3~6개월): 반복 수요 발견 + 템플릿 완성도 향상
  → 특정 업종에서 "이 분야는 이 사람"으로 알려지기
  → 후기 5개 이상 → 자연 유입 시작

Phase 3 (6개월~): 독립 브랜드 론칭
  → "비즈니스 OS" 브랜드로 별도 홈페이지
  → 구독형 유지보수 요금제 도입 (월 10~30만 원)
  → 지속 수익 구조로 전환
```

---

## 다음 액션

1. **이번 주**: Next.js 15 프로젝트 초기 세팅 + `.claude/` 문서 폴더 완성
2. **내일 당장**: 크몽 상담 전 질문 리스트를 카카오 자동응답에 등록
3. **2주 후**: MVP 완성 → 스튜디오 포트폴리오 데모로 크몽 상품 등록

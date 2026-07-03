import Link from "next/link";
import { MessageSquare, Users, FolderKanban, LayoutDashboard, ArrowRight } from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "문의 자동 접수",
    desc: "공개 폼으로 들어온 문의를 인박스에서 상태별로 처리하고 고객사와 연결합니다.",
  },
  {
    icon: Users,
    title: "고객 CRM",
    desc: "고객사 정보·상태·이력을 한곳에서 관리하고 빠르게 검색합니다.",
  },
  {
    icon: FolderKanban,
    title: "파일 공유",
    desc: "고객사별 파일을 업로드하고 만료·폐기 가능한 안전한 링크로 전달합니다.",
  },
  {
    icon: LayoutDashboard,
    title: "현황 대시보드",
    desc: "고객·신규 문의·파일 현황을 한눈에 보고 최근 활동을 추적합니다.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-[#1d1b20]">
      {/* Header */}
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#4f378a] to-[#7c3aed] text-sm font-bold text-white">
            B
          </div>
          <span className="text-lg font-semibold">Business OS</span>
        </div>
        <Link
          href="/login"
          className="rounded-lg border border-[#cbc4d2] px-4 py-2 text-sm font-medium text-[#494551] transition-colors hover:bg-[#f2ecf4]"
        >
          로그인
        </Link>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-5 pb-16 pt-14 text-center sm:pt-20">
        <p className="mb-4 inline-block rounded-full border border-[#4f378a]/20 bg-[#f8f2fa] px-3 py-1 text-xs font-medium text-[#4f378a]">
          B2B 에이전시를 위한 업무 자동화
        </p>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          고객 문의부터 파일 공유까지,
          <br />
          <span className="bg-gradient-to-r from-[#4f378a] to-[#7c3aed] bg-clip-text text-transparent">
            하나의 운영 시스템
          </span>
          으로
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-[#7a7582] sm:text-lg">
          반복되는 고객 관리·문의 응대·파일 전달·현황 확인을 통합해, 팀이 진짜 일에 집중하게 합니다.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/login"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#4f378a] to-[#7c3aed] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02] sm:w-auto"
          >
            시작하기
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/inquiry/demo-agency"
            className="flex w-full items-center justify-center rounded-xl border border-[#cbc4d2] px-6 py-3.5 text-sm font-semibold text-[#494551] transition-colors hover:bg-[#f2ecf4] sm:w-auto"
          >
            데모 문의 폼 보기
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-[#f8f2fa] py-16">
        <div className="mx-auto max-w-5xl px-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-[#cbc4d2]/60 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#4f378a]/10">
                  <f.icon className="h-5 w-5 text-[#4f378a]" />
                </div>
                <h3 className="mb-1.5 text-base font-semibold">{f.title}</h3>
                <p className="text-sm leading-relaxed text-[#7a7582]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto max-w-5xl px-5 py-8 text-center text-xs text-[#7a7582]">
        © 2026 Business OS · 크몽 판매용 비즈니스 운영 자동화 솔루션
      </footer>
    </main>
  );
}

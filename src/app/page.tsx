const foundations = [
  {
    label: "문의 접수",
    description: "흩어진 프로젝트 문의를 한 곳에서 놓치지 않고 확인합니다.",
  },
  {
    label: "고객사 관리",
    description: "회사와 담당자 정보를 업무 맥락과 함께 축적합니다.",
  },
  {
    label: "안전한 파일 전달",
    description: "고객별 전달 파일과 공유 이력을 명확하게 관리합니다.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--surface)] text-[var(--ink)]">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-between px-6 py-8 sm:px-10 sm:py-12 lg:px-16">
        <header className="flex items-center justify-between border-b border-[var(--line)] pb-5">
          <p className="text-sm font-semibold tracking-[0.2em] text-[var(--accent)]">
            BUSINESS OS
          </p>
          <span className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs font-medium text-[var(--muted)]">
            B2B Agency MVP
          </span>
        </header>

        <div className="grid gap-12 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <p className="mb-5 text-sm font-semibold text-[var(--accent)]">
              운영의 흐름을 하나로
            </p>
            <h1
              aria-label="B2B 에이전시의 일을 덜 흩어지게 만듭니다."
              className="max-w-3xl text-4xl font-semibold leading-[1.08] tracking-[-0.045em] sm:text-6xl lg:text-7xl"
            >
              B2B 에이전시의 일을
              <br />
              덜 흩어지게 만듭니다.
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-lg">
              문의부터 고객사 관리, 파일 전달까지. 메신저와 스프레드시트에
              나뉜 운영 업무를 하나의 분명한 흐름으로 연결합니다.
            </p>
          </div>

          <aside className="rounded-3xl border border-[var(--line)] bg-white p-6 shadow-[0_24px_70px_rgba(32,50,43,0.08)] sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Current milestone
            </p>
            <p className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
              Core foundation
            </p>
            <div className="mt-6 h-2 overflow-hidden rounded-full bg-[var(--soft)]">
              <div className="h-full w-1/5 rounded-full bg-[var(--accent)]" />
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              애플리케이션 기반을 세우고, 다음 단계에서 인증과 tenant 경계를
              연결합니다.
            </p>
          </aside>
        </div>

        <section aria-labelledby="foundation-title">
          <div className="mb-5 flex items-end justify-between gap-4">
            <h2 id="foundation-title" className="text-xl font-semibold">
              MVP가 연결할 세 가지
            </h2>
            <span className="text-sm text-[var(--muted)]">v0.1 foundation</span>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {foundations.map((foundation, index) => (
              <article
                key={foundation.label}
                className="rounded-2xl border border-[var(--line)] bg-white p-6"
              >
                <span className="text-xs font-semibold text-[var(--accent)]">
                  0{index + 1}
                </span>
                <h3 className="mt-8 text-lg font-semibold">{foundation.label}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  {foundation.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <footer className="mt-14 flex flex-col gap-2 border-t border-[var(--line)] pt-5 text-xs text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
          <span>Business OS · B2B Agency</span>
          <span>Next.js foundation ready</span>
        </footer>
      </section>
    </main>
  );
}

"use client";

import { useState } from "react";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const features = [
  "문의 자동 접수 및 고객 등록",
  "예약·일정 관리 자동화",
  "운영 현황 통합 대시보드",
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn.email({ email, password });
      if (result.error) {
        setError("이메일 또는 비밀번호가 올바르지 않습니다.");
        setLoading(false);
      } else {
        // 전체 페이지 네비게이션으로 세션 쿠키가 서버 렌더에 확실히 전달되게 한다.
        // router.push(soft nav)는 쿠키 커밋과의 race 로 /login 으로 되돌아갈 수 있다.
        window.location.href = "/dashboard";
      }
    } catch {
      setError("로그인 중 오류가 발생했습니다. 다시 시도해주세요.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left — Brand */}
      <div
        className="hidden md:flex md:w-[480px] lg:w-[560px] flex-col justify-center px-12 py-16"
        style={{ background: "linear-gradient(160deg, #4f46e5 0%, #7c3aed 100%)" }}
      >
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
            <span className="text-[13px] font-bold text-[#4F46E5]">B</span>
          </div>
          <span className="text-[28px] font-bold tracking-tight text-white">Business OS</span>
        </div>

        <h1 className="mb-4 text-[32px] font-semibold leading-[1.3] text-white">
          반복 업무를 없애고
          <br />
          하루 3시간을 돌려드립니다
        </h1>
        <p className="mb-10 text-base text-white/70">
          에이전시의 고객 관리, 문의 처리, 파일 공유를 하나의 플랫폼으로 자동화합니다.
        </p>

        <ul className="flex flex-col gap-4">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-white/80" />
              <span className="text-sm text-white/90">{f}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Right — Login form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 bg-white">
        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-2 md:hidden">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)" }}
          >
            <span className="text-sm font-bold text-white">B</span>
          </div>
          <span className="text-base font-semibold text-[var(--text)]">Business OS</span>
        </div>

        <div className="w-full max-w-[360px]">
          <div className="mb-8 flex flex-col gap-2">
            <h2 className="text-2xl font-semibold text-[#111827]">관리자 로그인</h2>
            <p className="text-sm text-[#6b7280]">
              업무 자동화 시스템에 오신 것을 환영합니다
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="owner@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">비밀번호</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--outline)] hover:text-[var(--text)]"
                  aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-[var(--error)]" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "로그인 중..." : "로그인"}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-[var(--outline)]">
            계정 문의는 관리자에게 연락하세요
          </p>
        </div>
      </div>
    </div>
  );
}

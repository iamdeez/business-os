"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";
import { signUp } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const features = [
  "가입 즉시 내 워크스페이스 생성",
  "문의 접수·고객 관리·파일 공유 통합",
  "운영 현황 통합 대시보드",
];

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    setLoading(true);
    try {
      const result = await signUp.email({ email, password, name });
      if (result.error) {
        setError(
          result.error.message?.includes("exist")
            ? "이미 가입된 이메일입니다."
            : "가입에 실패했습니다. 입력값을 확인해주세요."
        );
        setLoading(false);
      } else {
        // 워크스페이스 프로비저닝 후 전체 네비게이션으로 진입.
        window.location.href = "/dashboard";
      }
    } catch {
      setError("가입 중 오류가 발생했습니다. 다시 시도해주세요.");
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
          지금 시작하고
          <br />
          운영 업무를 자동화하세요
        </h1>
        <p className="mb-10 text-base text-white/70">
          가입하면 바로 내 팀 전용 워크스페이스가 생성됩니다.
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

      {/* Right — Signup form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 bg-white">
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
            <h2 className="text-2xl font-semibold text-[#111827]">회원가입</h2>
            <p className="text-sm text-[#6b7280]">몇 초면 워크스페이스가 준비됩니다</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">이름 / 회사명</Label>
              <Input
                id="name"
                type="text"
                placeholder="(주)예시 또는 홍길동"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="organization"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
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
                  placeholder="8자 이상"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--outline)] hover:text-[var(--text)]"
                  aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-[var(--error)]" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "가입 중..." : "가입하고 시작하기"}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-[var(--outline)]">
            이미 계정이 있으신가요?{" "}
            <Link href="/login" className="font-medium text-[#4f46e5] hover:underline">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

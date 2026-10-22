"use client";

import { Suspense } from "react";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function GoogleCallbackInner() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const token = params.get("token");
    const profileComplete = params.get("profileComplete");

    if (token) {
      localStorage.setItem("token", token);
      if (profileComplete === "false") {
        router.replace("/auth/profile");
      } else {
        router.replace("/personal/diagnostico");
      }
    } else {
      router.replace("/login?error=google");
    }
  }, [router, params]);

  return (
    <div className="flex items-center justify-center min-h-screen"
      style={{ background: 'var(--bg-space)' }}>
      <div className="text-center">
        <div className="w-8 h-8 border-2 rounded-full animate-spin mx-auto mb-4"
          style={{ borderColor: 'var(--gold-dim)', borderTopColor: 'var(--gold)' }} />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Iniciando sesión con Google...
        </p>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen"
        style={{ background: 'var(--bg-space)' }}>
        <div className="w-8 h-8 border-2 rounded-full animate-spin mx-auto"
          style={{ borderColor: 'var(--gold-dim)', borderTopColor: 'var(--gold)' }} />
      </div>
    }>
      <GoogleCallbackInner />
    </Suspense>
  );
}

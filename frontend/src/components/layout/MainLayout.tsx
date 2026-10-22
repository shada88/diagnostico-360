"use client";

import React, { Suspense } from "react";
import GlobalHeader from "../shared/GlobalHeader";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg-space)] flex flex-col">
      <Suspense fallback={<div className="h-16" />}>
        <GlobalHeader />
      </Suspense>
      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  );
}

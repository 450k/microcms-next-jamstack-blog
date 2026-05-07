"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="border-b">
      <div className="container mx-auto flex items-center justify-between px-2 py-1.5">
        <div className="flex items-center">
          <Link href="/" className="text-2xl font-bold">
            <img className="logo" src="/img/ttc_type3.png" alt="ttc" />
          </Link>
          <p className="font-medium ml-1">練習会スケジュール</p>
        </div>
        
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 hover:bg-slate-100 rounded-md transition-colors"
          aria-label="メニュー"
        >
          {isMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {isMenuOpen && (
        <div className="border-t bg-white shadow-md">
          <div className="container mx-auto px-2 py-2">
            <div className="flex flex-col gap-1">
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-2 font-medium text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
              >
                TOP
              </Link>
              <Link
                href="/usage"
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-2 font-medium text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
              >
                サイトの利用方法
              </Link>
              <Link
                href="/h2h"
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-2 font-medium text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
              >
                H2H (pb100 vs k450)
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

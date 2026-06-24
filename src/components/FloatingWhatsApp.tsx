"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";

const WA_NUMBER = process.env.NEXT_PUBLIC_ADMIN_WA_NUMBER ?? "6281234567890";
const WA_MESSAGE = "Halo DonasiKebaikan, saya ingin bertanya tentang program donasi.";

export default function FloatingWhatsApp() {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_MESSAGE)}`;

  return (
    <div className="fixed bottom-6 right-5 z-50 flex flex-col items-end gap-2">
      {isTooltipVisible && (
        <div className="bg-white rounded-xl shadow-xl border border-slate-100 p-3 w-56 mb-1">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="text-sm font-semibold text-slate-900">Chat Admin</p>
            <button
              onClick={() => setIsTooltipVisible(false)}
              className="text-slate-400 hover:text-slate-600 shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-slate-500 mb-2">
            Ada pertanyaan? Tim kami siap membantu kamu.
          </p>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-[#25D366] hover:bg-[#1ebe5c] text-white text-xs font-semibold text-center py-1.5 rounded-lg transition-colors"
          >
            Mulai Chat
          </a>
        </div>
      )}

      <button
        onClick={() => setIsTooltipVisible(!isTooltipVisible)}
        className="w-14 h-14 bg-[#25D366] hover:bg-[#1ebe5c] text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        aria-label="Chat WhatsApp"
      >
        <MessageCircle className="w-7 h-7 fill-white" />
      </button>
    </div>
  );
}

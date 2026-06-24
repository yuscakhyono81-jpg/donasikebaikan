"use client";

import { useState } from "react";
import { Link2, Check, MessageCircle, Share2 } from "lucide-react";

interface ShareButtonsProps {
  url: string;
  title: string;
}

export default function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(`${title} | DonasiKebaikan`);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareNative = async () => {
    if (navigator.share) {
      await navigator.share({ title, url });
    }
  };

  const SHARE_LINKS = [
    {
      label: "WhatsApp",
      icon: <MessageCircle className="w-4 h-4" />,
      href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
      color: "bg-[#25D366] hover:bg-[#1ebe5c] text-white",
    },
    {
      label: "Instagram",
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      ),
      href: `https://www.instagram.com/`,
      color: "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white",
    },
  ];

  return (
    <div>
      <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-3">
        <Share2 className="w-5 h-5 text-primary-600" />
        Bagikan Campaign Ini
      </h3>
      <p className="text-xs text-slate-500 mb-4">
        Bantu sebarkan kebaikan dengan membagikan campaign ini!
      </p>

      <div className="flex flex-wrap gap-2">
        {SHARE_LINKS.map((share) => (
          <a
            key={share.label}
            href={share.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${share.color}`}
          >
            {share.icon}
            {share.label}
          </a>
        ))}

        {"share" in navigator && (
          <button
            onClick={shareNative}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Bagikan
          </button>
        )}

        <button
          onClick={copyLink}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-primary-600" /> : <Link2 className="w-4 h-4" />}
          {copied ? "Tersalin!" : "Salin Link"}
        </button>
      </div>
    </div>
  );
}

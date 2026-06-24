"use client";

import { useEffect } from "react";
import Script from "next/script";

interface MidtransPaymentProps {
  snapToken: string;
  onSuccess?: (donationId: string) => void;
  onPending?: (donationId: string) => void;
  onError?: (donationId: string) => void;
  donationId: string;
}

type SnapWindow = {
  snap?: {
    pay: (token: string, options: {
      onSuccess?: () => void;
      onPending?: () => void;
      onError?: () => void;
      onClose?: () => void;
    }) => void;
  };
};

export default function MidtransPayment({ snapToken, donationId, onSuccess, onPending, onError }: MidtransPaymentProps) {
  const snapSrc = process.env.NEXT_PUBLIC_MIDTRANS_ENV === "production"
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";

  useEffect(() => {
    const win = window as unknown as SnapWindow;
    if (snapToken && win.snap) {
      win.snap.pay(snapToken, {
        onSuccess: () => onSuccess?.(donationId),
        onPending: () => onPending?.(donationId),
        onError: () => onError?.(donationId),
        onClose: () => {},
      });
    }
  }, [snapToken, donationId, onSuccess, onPending, onError]);

  return (
    <Script
      src={snapSrc}
      data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
      strategy="lazyOnload"
    />
  );
}

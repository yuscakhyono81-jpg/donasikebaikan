const FONNTE_URL = "https://api.fonnte.com/send";

async function sendMessage(phone: string, message: string): Promise<boolean> {
  const token = process.env.FONNTE_API_KEY;
  if (!token) {
    console.warn("[WA] FONNTE_API_KEY not set, skipping notification");
    return false;
  }

  try {
    const res = await fetch(FONNTE_URL, {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ target: phone, message }),
    });
    const json = await res.json() as { status: boolean; reason?: string };
    if (!json.status) {
      console.error("[WA] Send failed:", json.reason);
    }
    return json.status;
  } catch (err) {
    console.error("[WA] Error sending message:", err);
    return false;
  }
}

export async function notifyDonationSuccess(params: {
  phone: string;
  donorName: string;
  campaignTitle: string;
  amount: number;
  donationId: string;
}): Promise<boolean> {
  const rupiah = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(params.amount);

  const message =
    `Assalamu'alaikum ${params.donorName},\n\n` +
    `Alhamdulillah, donasi Anda telah berhasil diterima! 🤲\n\n` +
    `📌 Campaign: ${params.campaignTitle}\n` +
    `💰 Nominal: ${rupiah}\n` +
    `🔖 ID Donasi: ${params.donationId}\n\n` +
    `Semoga Allah SWT membalas kebaikan Anda berlipat ganda. Aamiin.\n\n` +
    `— Tim DonasiKebaikan LAZIS NUR`;

  return sendMessage(params.phone, message);
}

export async function notifyManualTransferReceived(params: {
  phone: string;
  donorName: string;
  campaignTitle: string;
  amount: number;
}): Promise<boolean> {
  const rupiah = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(params.amount);

  const message =
    `Assalamu'alaikum ${params.donorName},\n\n` +
    `Bukti transfer Anda telah kami terima dan sedang diverifikasi.\n\n` +
    `📌 Campaign: ${params.campaignTitle}\n` +
    `💰 Nominal: ${rupiah}\n\n` +
    `Proses verifikasi biasanya selesai dalam 1×24 jam. Kami akan menghubungi Anda kembali setelah terverifikasi.\n\n` +
    `Jazakumullahu khairan.\n\n` +
    `— Tim DonasiKebaikan LAZIS NUR`;

  return sendMessage(params.phone, message);
}

export async function notifyManualTransferVerified(params: {
  phone: string;
  donorName: string;
  campaignTitle: string;
  amount: number;
  approved: boolean;
}): Promise<boolean> {
  const rupiah = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(params.amount);

  const message = params.approved
    ? `Assalamu'alaikum ${params.donorName},\n\n` +
      `✅ Transfer Anda telah *terverifikasi*!\n\n` +
      `📌 Campaign: ${params.campaignTitle}\n` +
      `💰 Nominal: ${rupiah}\n\n` +
      `Alhamdulillah, semoga menjadi amal jariyah yang terus mengalir. Aamiin.\n\n` +
      `— Tim DonasiKebaikan LAZIS NUR`
    : `Assalamu'alaikum ${params.donorName},\n\n` +
      `❌ Maaf, bukti transfer Anda untuk campaign *${params.campaignTitle}* tidak dapat diverifikasi.\n\n` +
      `Silakan hubungi kami melalui WhatsApp admin atau coba kembali dengan bukti yang valid.\n\n` +
      `— Tim DonasiKebaikan LAZIS NUR`;

  return sendMessage(params.phone, message);
}

export async function notifyStaffNewTransfer(params: {
  phone: string;
  donorName: string;
  campaignTitle: string;
  amount: number;
  donationId: string;
}): Promise<boolean> {
  const rupiah = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(params.amount);

  const message =
    `[NOTIFIKASI STAF] Transfer manual baru masuk!\n\n` +
    `👤 Donatur: ${params.donorName}\n` +
    `📌 Campaign: ${params.campaignTitle}\n` +
    `💰 Nominal: ${rupiah}\n` +
    `🔖 ID: ${params.donationId}\n\n` +
    `Silakan verifikasi di dashboard.`;

  return sendMessage(params.phone, message);
}

export async function notifyAffiliateNewDonation(params: {
  phone: string;
  affiliateName: string;
  campaignTitle: string;
  amount: number;
  feeAmount: number;
}): Promise<boolean> {
  const rupiah = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(params.amount);
  const fee = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(params.feeAmount);

  const message =
    `Assalamu'alaikum ${params.affiliateName},\n\n` +
    `🎉 Ada donasi baru melalui link referral Anda!\n\n` +
    `📌 Campaign: ${params.campaignTitle}\n` +
    `💰 Nominal Donasi: ${rupiah}\n` +
    `✨ Estimasi Fee Anda: ${fee}\n\n` +
    `Terima kasih atas kontribusi Anda dalam menyebarkan kebaikan!\n\n` +
    `— Tim DonasiKebaikan LAZIS NUR`;

  return sendMessage(params.phone, message);
}

export async function notifyProposalStatusUpdate(params: {
  phone: string;
  proposerName: string;
  beneficiaryName: string;
  status: string;
  notes?: string;
}): Promise<boolean> {
  const statusLabel: Record<string, string> = {
    masuk: "Diterima & dalam antrian",
    diproses: "Sedang diproses",
    disurvei: "Sedang disurvei lapangan",
    dibantu: "✅ Telah dibantu",
    ditolak: "❌ Tidak dapat diproses",
  };

  const label = statusLabel[params.status] ?? params.status;

  const message =
    `Assalamu'alaikum ${params.proposerName},\n\n` +
    `Usulan Penerima Manfaat atas nama *${params.beneficiaryName}* telah diperbarui.\n\n` +
    `📋 Status: ${label}\n` +
    (params.notes ? `📝 Catatan: ${params.notes}\n\n` : "\n") +
    `Jazakumullahu khairan atas kepedulian Anda.\n\n` +
    `— Tim DonasiKebaikan LAZIS NUR`;

  return sendMessage(params.phone, message);
}

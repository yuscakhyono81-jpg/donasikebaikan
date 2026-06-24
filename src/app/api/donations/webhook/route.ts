import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";
import { notifyDonationSuccess } from "@/lib/wa";
import { syncDonationWithLog } from "@/lib/crm";

function verifySignature(orderId: string, statusCode: string, grossAmount: string, serverKey: string, signatureKey: string): boolean {
  const hash = crypto
    .createHash("sha512")
    .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
    .digest("hex");
  return hash === signatureKey;
}

export async function POST(req: NextRequest) {
  try {
    const notification = await req.json() as {
      order_id: string;
      transaction_status: string;
      fraud_status?: string;
      status_code: string;
      gross_amount: string;
      signature_key: string;
    };

    const serverKey = process.env.MIDTRANS_SERVER_KEY ?? "";

    // Verify signature
    const isValid = verifySignature(
      notification.order_id,
      notification.status_code,
      notification.gross_amount,
      serverKey,
      notification.signature_key
    );

    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const { transaction_status, fraud_status, order_id } = notification;

    // Determine donation status
    let donationStatus: "pending" | "success" | "failed" = "pending";

    if (transaction_status === "capture" || transaction_status === "settlement") {
      if (!fraud_status || fraud_status === "accept") {
        donationStatus = "success";
      } else {
        donationStatus = "failed";
      }
    } else if (
      transaction_status === "cancel" ||
      transaction_status === "deny" ||
      transaction_status === "expire"
    ) {
      donationStatus = "failed";
    }

    const supabase = await createClient();

    // Update donation status
    const { data: donation, error } = await supabase
      .from("donations")
      .update({ status: donationStatus })
      .eq("transaction_id", order_id)
      .select("id, campaign_id, amount, donor_email, donor_name, is_anonymous")
      .single();

    if (error || !donation) {
      console.error("Webhook update error:", error);
      return NextResponse.json({ error: "Donation not found" }, { status: 404 });
    }

    // Post-success integrations (fire-and-forget — don't block the response)
    if (donationStatus === "success") {
      const fullDonation = await supabase
        .from("donations")
        .select("donor_phone, donor_name, donor_email, amount, is_anonymous, campaigns(title)")
        .eq("id", donation.id)
        .single();

      if (fullDonation.data) {
        const d = fullDonation.data;
        const camp = d.campaigns as unknown as { title: string } | null;

        if (d.donor_phone && !d.is_anonymous) {
          notifyDonationSuccess({
            phone: d.donor_phone as string,
            donorName: d.donor_name as string,
            campaignTitle: camp?.title ?? "",
            amount: d.amount as number,
            donationId: donation.id,
          }).catch((e) => console.error("[WA] webhook notify error:", e));
        }

        syncDonationWithLog(supabase, donation.id, "realtime").catch((e) =>
          console.error("[CRM] webhook sync error:", e)
        );
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

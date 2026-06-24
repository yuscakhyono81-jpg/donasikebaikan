import type { SupabaseClient } from "@supabase/supabase-js";

interface CrmDonorPayload {
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
}

interface CrmDonationPayload {
  donor_email: string;
  donor_name: string;
  campaign_title: string;
  amount: number;
  payment_method: string;
  donated_at: string;
  donation_id: string;
}

interface CrmSyncResult {
  success: boolean;
  crm_id?: string;
  error?: string;
}

function crmApiUrl(): string {
  return (process.env.CRM_API_URL ?? "").replace(/\/$/, "");
}

async function crmPost(
  path: string,
  payload: unknown,
  attempt = 1
): Promise<CrmSyncResult> {
  const base = crmApiUrl();
  const key = process.env.CRM_API_KEY;

  if (!base || !key) {
    console.warn("[CRM] CRM_API_URL or CRM_API_KEY not set, skipping sync");
    return { success: false, error: "CRM not configured" };
  }

  try {
    const res = await fetch(`${base}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const json = (await res.json()) as { id?: string; donation_id?: string };
      return { success: true, crm_id: json.id ?? json.donation_id };
    }

    const errorText = await res.text();
    console.error(`[CRM] POST ${path} failed (${res.status}):`, errorText);

    // Retry on 5xx with exponential backoff
    if (res.status >= 500 && attempt < 3) {
      await new Promise((r) => setTimeout(r, 1000 * attempt));
      return crmPost(path, payload, attempt + 1);
    }

    return { success: false, error: `HTTP ${res.status}: ${errorText.slice(0, 200)}` };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[CRM] POST ${path} network error:`, msg);

    if (attempt < 3) {
      await new Promise((r) => setTimeout(r, 1000 * attempt));
      return crmPost(path, payload, attempt + 1);
    }

    return { success: false, error: msg };
  }
}

export async function syncDonorToCrm(
  donor: CrmDonorPayload
): Promise<CrmSyncResult> {
  return crmPost("/api/donors", donor);
}

export async function syncDonationToCrm(
  donation: CrmDonationPayload
): Promise<CrmSyncResult> {
  return crmPost("/api/donations", donation);
}

export async function syncDonationWithLog(
  supabase: SupabaseClient,
  donationId: string,
  syncType: "realtime" | "cron"
): Promise<boolean> {
  // Fetch donation + campaign data
  const { data: donation, error } = await supabase
    .from("donations")
    .select(`
      id, donor_name, donor_email, donor_phone, amount, payment_method, created_at, crm_synced, crm_donation_id,
      campaigns ( title )
    `)
    .eq("id", donationId)
    .single();

  if (error || !donation) {
    console.error("[CRM] Donation not found:", donationId);
    return false;
  }

  if (donation.crm_synced && donation.crm_donation_id) {
    return true;
  }

  const camp = donation.campaigns as unknown as { title: string } | null;

  const result = await syncDonationToCrm({
    donor_email: donation.donor_email as string,
    donor_name: donation.donor_name as string,
    campaign_title: camp?.title ?? "",
    amount: donation.amount as number,
    payment_method: donation.payment_method as string,
    donated_at: donation.created_at as string,
    donation_id: donation.id as string,
  });

  // Log the sync attempt
  await supabase.from("crm_sync_logs").insert({
    donation_id: donationId,
    sync_type: syncType,
    status: result.success ? "success" : "failed",
    error_message: result.error ?? null,
    crm_donation_id: result.crm_id ?? null,
  });

  if (result.success) {
    await supabase
      .from("donations")
      .update({ crm_synced: true, crm_donation_id: result.crm_id ?? null })
      .eq("id", donationId);
  }

  return result.success;
}

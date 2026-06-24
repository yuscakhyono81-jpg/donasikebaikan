import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncDonationWithLog } from "@/lib/crm";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = await createClient();

    // Find all successful donations not yet synced to CRM
    const { data: donations, error } = await supabase
      .from("donations")
      .select("id")
      .eq("status", "success")
      .eq("crm_synced", false)
      .order("created_at", { ascending: true })
      .limit(100);

    if (error || !donations?.length) {
      return NextResponse.json({
        processed: 0,
        failed: 0,
        timestamp: new Date().toISOString(),
        message: "No unsynced donations",
      });
    }

    const processed: string[] = [];
    const failed: string[] = [];

    for (const { id } of donations) {
      const success = await syncDonationWithLog(supabase, id, "cron");
      if (success) {
        processed.push(id);
      } else {
        failed.push(id);
      }
    }

    return NextResponse.json({
      processed: processed.length,
      failed: failed.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[CRM Cron] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

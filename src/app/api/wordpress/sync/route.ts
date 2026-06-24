import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncCampaignUpdatesFromWp } from "@/lib/wordpress";

export async function POST(req: NextRequest) {
  // Optional: restrict to admin or cron secret
  const authHeader = req.headers.get("authorization");
  const isFromCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;

  if (!isFromCron) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role !== "admin" && profile?.role !== "staff") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const supabase = await createClient();

  // Get all active campaigns that have wp_post_id or are linked to WP
  const { data: campaigns, error } = await supabase
    .from("campaigns")
    .select("id, title, wp_post_id")
    .eq("status", "active");

  if (error || !campaigns?.length) {
    return NextResponse.json({ synced: 0, message: "No active campaigns" });
  }

  let synced = 0;
  let failed = 0;

  for (const campaign of campaigns) {
    try {
      const posts = await syncCampaignUpdatesFromWp(campaign.id as string);

      for (const post of posts) {
        // Upsert: use wp_post_id as unique key to avoid duplicates
        const { error: upsertError } = await supabase
          .from("campaign_updates")
          .upsert(
            {
              campaign_id: campaign.id,
              wp_post_id: String(post.id),
              title: post.title,
              content: post.content,
              image_url: post.featured_image_url,
              published_at: post.published_at,
            },
            { onConflict: "wp_post_id" }
          );

        if (upsertError) {
          console.error("[WP Sync] upsert error:", upsertError.message);
          failed++;
        } else {
          synced++;
        }
      }
    } catch (err) {
      console.error("[WP Sync] campaign error:", err);
      failed++;
    }
  }

  return NextResponse.json({ synced, failed, timestamp: new Date().toISOString() });
}

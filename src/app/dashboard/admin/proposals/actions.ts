"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { notifyProposalStatusUpdate } from "@/lib/wa";

export async function updateProposalStatus(id: string, status: string, notes?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch proposal + proposer phone before updating
  const { data: proposal } = await supabase
    .from("beneficiary_proposals")
    .select("name, proposer_id, profiles(full_name, phone)")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("beneficiary_proposals")
    .update({ status, notes: notes ?? null, handler_id: user.id })
    .eq("id", id);

  if (error) throw new Error(error.message);

  // Send WA notification to proposer
  if (proposal) {
    const proposer = proposal.profiles as unknown as { full_name: string; phone: string | null } | null;
    if (proposer?.phone) {
      await notifyProposalStatusUpdate({
        phone: proposer.phone,
        proposerName: proposer.full_name,
        beneficiaryName: proposal.name as string,
        status,
        notes,
      }).catch((err) => console.error("[WA] Proposal status notify failed:", err));
    }
  }

  revalidatePath("/dashboard/admin/proposals");
}

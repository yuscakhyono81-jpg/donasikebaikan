export type UserRole = "admin" | "staff" | "donor" | "affiliate";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  role: UserRole;
  birth_date?: string;
  address?: string;
  is_approved: boolean;
  created_at: string;
}

export type CampaignCategory =
  | "zakat"
  | "infaq"
  | "qurban"
  | "pendidikan"
  | "kesehatan"
  | "kemanusiaan"
  | "dakwah"
  | "yatim_dhuafa"
  | "pemberdayaan";

export type CampaignStatus = "draft" | "active" | "completed" | "rejected";

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Campaign {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  description_wp_id?: string;
  category_id: string;
  category?: Category;
  cover_image: string;
  target_amount: number;
  collected_amount: number;
  donor_count: number;
  creator_id: string;
  creator?: Profile;
  status: CampaignStatus;
  is_featured: boolean;
  is_urgent: boolean;
  deadline: string;
  wp_post_id?: string;
  created_at: string;
  updated_at: string;
}

export type DonationStatus = "pending" | "success" | "failed";
export type PaymentMethod = "midtrans" | "transfer_manual" | "recurring";

export interface Donation {
  id: string;
  campaign_id: string;
  campaign?: Campaign;
  donor_id?: string;
  donor?: Profile;
  donor_name: string;
  donor_email: string;
  donor_phone?: string;
  amount: number;
  message?: string;
  is_anonymous: boolean;
  status: DonationStatus;
  payment_method: PaymentMethod;
  transaction_id?: string;
  proof_url?: string;
  is_recurring: boolean;
  recurring_interval?: "monthly";
  crm_synced: boolean;
  crm_donation_id?: string;
  created_at: string;
}

export interface DonationPrayer {
  id: string;
  donation_id: string;
  campaign_id: string;
  donor_name: string;
  message: string;
  reply?: string;
  replied_by?: string;
  replied_at?: string;
  is_visible: boolean;
  created_at: string;
}

export interface Affiliate {
  id: string;
  profile_id: string;
  profile?: Profile;
  organization_name: string;
  phone: string;
  bank_name?: string;
  account_number?: string;
  account_holder?: string;
  is_approved: boolean;
  approved_at?: string;
  approved_by?: string;
  created_at: string;
}

export interface AffiliateCampaign {
  id: string;
  affiliate_id: string;
  affiliate?: Affiliate;
  campaign_id: string;
  campaign?: Campaign;
  referral_code: string;
  fee_percentage: number;
  target_amount?: number;
  created_at: string;
}

export interface AffiliateFeePayment {
  id: string;
  affiliate_id: string;
  affiliate?: Affiliate;
  campaign_id: string;
  campaign?: Campaign;
  period_start: string;
  period_end: string;
  total_donation: number;
  fee_amount: number;
  status: "pending" | "paid";
  paid_at?: string;
  paid_by?: string;
  notes?: string;
  created_at: string;
}

export interface CampaignUpdate {
  id: string;
  campaign_id: string;
  wp_post_id?: string;
  title: string;
  content: string;
  image_url?: string;
  published_at: string;
}

export type ProposalStatus = "masuk" | "diproses" | "disurvei" | "dibantu" | "ditolak";

export interface BeneficiaryProposal {
  id: string;
  proposer_id: string;
  proposer?: Profile;
  name: string;
  phone: string;
  address: string;
  category_id: string;
  category?: Category;
  description: string;
  photo_urls: string[];
  status: ProposalStatus;
  handler_id?: string;
  handler?: Profile;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface LegalityDocument {
  id: string;
  title: string;
  document_type: string;
  file_url: string;
  issued_by?: string;
  issued_at?: string;
  is_active: boolean;
  created_at: string;
}

export interface AffiliateStats {
  total_donations: number;
  total_collected: number;
  total_donors: number;
  fee_pending: number;
  fee_paid: number;
}

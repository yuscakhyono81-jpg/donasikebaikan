export interface WpPost {
  id: number;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  featured_image_url: string | null;
  published_at: string;
  campaign_id: string | null;
}

interface WpApiPost {
  id: number;
  slug: string;
  date: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  _embedded?: {
    "wp:featuredmedia"?: Array<{ source_url: string }>;
    "wp:term"?: unknown[][];
  };
  meta?: { campaign_id?: string };
  acf?: { campaign_id?: string };
}

function baseUrl(): string {
  return (process.env.WORDPRESS_URL ?? "").replace(/\/$/, "");
}

function parsePost(raw: WpApiPost): WpPost {
  const media = raw._embedded?.["wp:featuredmedia"];
  const featuredImage = media?.[0]?.source_url ?? null;
  const campaignId = raw.acf?.campaign_id ?? raw.meta?.campaign_id ?? null;

  return {
    id: raw.id,
    slug: raw.slug,
    title: raw.title.rendered,
    content: raw.content.rendered,
    excerpt: raw.excerpt.rendered,
    featured_image_url: featuredImage,
    published_at: raw.date,
    campaign_id: campaignId ?? null,
  };
}

export async function getPosts(params?: {
  perPage?: number;
  page?: number;
  search?: string;
}): Promise<WpPost[]> {
  const base = baseUrl();
  if (!base) {
    console.warn("[WP] WORDPRESS_URL not set");
    return [];
  }

  const qs = new URLSearchParams({
    _embed: "1",
    per_page: String(params?.perPage ?? 10),
    page: String(params?.page ?? 1),
    ...(params?.search ? { search: params.search } : {}),
  });

  try {
    const res = await fetch(`${base}/wp-json/wp/v2/posts?${qs}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as WpApiPost[];
    return data.map(parsePost);
  } catch (err) {
    console.error("[WP] getPosts error:", err);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<WpPost | null> {
  const base = baseUrl();
  if (!base) return null;

  try {
    const res = await fetch(
      `${base}/wp-json/wp/v2/posts?slug=${encodeURIComponent(slug)}&_embed=1`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as WpApiPost[];
    return data[0] ? parsePost(data[0]) : null;
  } catch (err) {
    console.error("[WP] getPostBySlug error:", err);
    return null;
  }
}

export async function getPostsByCampaign(campaignId: string): Promise<WpPost[]> {
  const base = baseUrl();
  if (!base) return [];

  // WP needs ACF or custom meta endpoint to filter by campaign_id.
  // Try ACF filter first, fall back to fetching recent posts and filtering client-side.
  try {
    const res = await fetch(
      `${base}/wp-json/wp/v2/posts?_embed=1&meta_key=campaign_id&meta_value=${encodeURIComponent(campaignId)}&per_page=10`,
      { next: { revalidate: 300 } }
    );
    if (res.ok) {
      const data = (await res.json()) as WpApiPost[];
      const posts = data.map(parsePost).filter((p) => p.campaign_id === campaignId);
      if (posts.length > 0) return posts;
    }
  } catch {
    // fallthrough to client-side filter
  }

  // Fallback: fetch last 50 posts and filter
  try {
    const res = await fetch(
      `${base}/wp-json/wp/v2/posts?_embed=1&per_page=50`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return [];
    const data = (await res.json()) as WpApiPost[];
    return data.map(parsePost).filter((p) => p.campaign_id === campaignId);
  } catch (err) {
    console.error("[WP] getPostsByCampaign error:", err);
    return [];
  }
}

export async function syncCampaignUpdatesFromWp(campaignId: string): Promise<WpPost[]> {
  return getPostsByCampaign(campaignId);
}

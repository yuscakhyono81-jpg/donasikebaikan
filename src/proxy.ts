import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PUBLIC_ROUTES = ["/", "/login", "/register", "/forgot-password", "/auth"];
const DASHBOARD_ROUTES = ["/dashboard"];

function isPublicRoute(pathname: string) {
  return (
    PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/")) ||
    pathname.startsWith("/campaign/") ||
    pathname.startsWith("/kalkulator-zakat") ||
    pathname.startsWith("/tentang") ||
    pathname.startsWith("/api/donations/webhook") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/manifest")
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next({ request });

  // Referral cookie tracking
  const ref = request.nextUrl.searchParams.get("ref");
  if (ref && /^[A-Z0-9]{6,16}$/.test(ref)) {
    response.cookies.set("dk_ref", ref, {
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: false,
      sameSite: "lax",
      path: "/",
    });
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Redirect login page jika sudah authenticated
  if (user && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Proteksi dashboard routes
  if (DASHBOARD_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!user) {
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    // Validasi akses role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_approved")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const role = profile.role as string;

    if (pathname.startsWith("/dashboard/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard/" + role, request.url));
    }

    if (pathname.startsWith("/dashboard/staff") && !["admin", "staff"].includes(role)) {
      return NextResponse.redirect(new URL("/dashboard/" + role, request.url));
    }

    if (pathname.startsWith("/dashboard/affiliate") && role === "affiliate" && !profile.is_approved) {
      return NextResponse.redirect(new URL("/pending-approval", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

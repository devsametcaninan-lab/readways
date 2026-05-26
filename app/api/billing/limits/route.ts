import { getBillingUsageSnapshot } from "@/lib/billing";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const snapshot = await getBillingUsageSnapshot({
      supabase,
      userId: user.id
    });

    return NextResponse.json({
      plan: snapshot.subscription.plan,
      tier: snapshot.subscription.tier,
      subscriptionStatus: snapshot.subscription.subscriptionStatus,
      isPro: snapshot.subscription.tier === "pro" || snapshot.subscription.tier === "admin",
      ai: snapshot.ai,
      pdf: snapshot.pdf
    });
  } catch {
    return NextResponse.json(
      { error: "Could not load billing limits." },
      { status: 500 }
    );
  }
}

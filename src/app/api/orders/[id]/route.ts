import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { mapOrderRow, type OrderRow } from "@/lib/supabase/order-mapping";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ ok: false, authenticated: false, order: null });
  }

  const { data, error } = await supabase
    .from("orders")
    .select("*, story_pages(*), approvals(*)")
    .eq("serial_code", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { ok: false, order: null, error: error.message },
      { status: 500 }
    );
  }

  if (data) {
    return NextResponse.json({ ok: true, order: mapOrderRow(data as OrderRow) });
  }

  const byPublicCode = await supabase
    .from("orders")
    .select("*, story_pages(*), approvals(*)")
    .eq("public_code", id)
    .maybeSingle();

  if (byPublicCode.error) {
    return NextResponse.json(
      { ok: false, order: null, error: byPublicCode.error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: Boolean(byPublicCode.data),
    order: byPublicCode.data ? mapOrderRow(byPublicCode.data as OrderRow) : null,
  });
}

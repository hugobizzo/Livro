import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRole) {
    return NextResponse.json({
      configured: false,
      schema: false,
      message: "Variaveis do Supabase ainda nao configuradas no servidor.",
    });
  }

  const supabase = createClient(url, serviceRole, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { error } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true });

  return NextResponse.json({
    configured: true,
    schema: !error,
    message: error ? "Schema inicial ainda nao respondeu." : "Supabase conectado.",
    error: error?.message,
  });
}

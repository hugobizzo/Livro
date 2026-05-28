"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function loginRedirect(message: string): never {
  redirect(`/login?message=${encodeURIComponent(message)}`);
}

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    loginRedirect("Informe e-mail e senha.");
  }

  let supabase;
  try {
    supabase = await createClient();
  } catch {
    loginRedirect("Login ainda nao esta configurado neste ambiente.");
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    loginRedirect("Nao consegui entrar com esses dados.");
  }

  revalidatePath("/", "layout");
  redirect("/cliente");
}

export async function signup(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_APP_URL;

  if (!email || !password) {
    loginRedirect("Informe e-mail e senha para criar a conta.");
  }

  if (password.length < 8) {
    loginRedirect("Use uma senha com pelo menos 8 caracteres.");
  }

  let supabase;
  try {
    supabase = await createClient();
  } catch {
    loginRedirect("Cadastro ainda nao esta configurado neste ambiente.");
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/confirm`,
    },
  });

  if (error) {
    loginRedirect("Nao consegui criar a conta. Verifique os dados ou tente outro e-mail.");
  }

  revalidatePath("/", "layout");
  loginRedirect("Conta criada. Se o Supabase pedir confirmacao, confira seu e-mail.");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

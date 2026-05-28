export function requiredServerEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Variavel de ambiente ausente: ${name}`);
  return value;
}

export function optionalServerEnv(name: string) {
  return process.env[name]?.trim() || "";
}

export function getAppUrl() {
  return (
    optionalServerEnv("NEXT_PUBLIC_APP_URL") ||
    optionalServerEnv("VERCEL_PROJECT_PRODUCTION_URL") && `https://${optionalServerEnv("VERCEL_PROJECT_PRODUCTION_URL")}` ||
    optionalServerEnv("VERCEL_URL") && `https://${optionalServerEnv("VERCEL_URL")}` ||
    "http://localhost:3000"
  );
}

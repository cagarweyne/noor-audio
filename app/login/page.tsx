import LoginForm from "@/components/LoginForm";

export const metadata = { title: "Sign in — Noor" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  return <LoginForm callbackUrl={callbackUrl ?? "/"} />;
}

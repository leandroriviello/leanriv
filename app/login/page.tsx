import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import LoginForm from "./LoginForm";

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export const metadata = {
  title: "Iniciar sesión | LeanRiv",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextUrl = params?.next && params.next.startsWith("/") ? params.next : "/dashboard";

  const session = await getSession();
  if (session) {
    redirect(nextUrl);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#050505] px-6 py-12 text-foreground">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold text-accent sm:text-4xl">
          LeanRiv
        </h1>
        <p className="mt-2 text-sm text-muted">
          Accedé a tu panel privado de enlaces.
        </p>
      </div>
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card/70 p-8 shadow-[0_0_50px_-20px_rgba(166,255,0,0.3)]">
        <LoginForm redirectTo={nextUrl} />
      </div>
    </div>
  );
}

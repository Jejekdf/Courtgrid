import { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { User, Key, ShieldCheck } from "lucide-react";
import ProfileForm from "@/components/dashboard/ProfileForm";
import PasswordForm from "@/components/dashboard/PasswordForm";
import PageHeader from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Profil & Keamanan | CourtGrid",
  description: "Kelola profil pengguna dan keamanan kata sandi akun Anda.",
};

export default async function CustomerSettingsPage() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, image: true, accounts: true },
  });

  if (!user) {
    redirect("/login");
  }

  const isOAuth = user.accounts.length > 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-zinc-950">
      {/* Clean Shared PageHeader */}
      <PageHeader
        title="Pengaturan Profil & Keamanan"
        description="Perbarui identitas akun pengguna, foto profil, dan kata sandi Anda."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Profile Card */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 border-b border-zinc-100 pb-4">
            <div className="w-8 h-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center font-bold text-xs">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-zinc-950">Informasi Pengguna</h2>
              <p className="text-sm text-zinc-400 font-sans">Identitas & Foto Profil</p>
            </div>
          </div>
          <ProfileForm user={{ name: user.name || "", email: user.email || "", image: user.image || "" }} />
        </div>

        {/* Password / OAuth Security Card */}
        {!isOAuth ? (
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 border-b border-zinc-100 pb-4">
              <div className="w-8 h-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center font-bold text-xs">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-zinc-950">Keamanan Kata Sandi</h2>
                <p className="text-sm text-zinc-400 font-sans">Pembaruan Password Berkala</p>
              </div>
            </div>
            <PasswordForm />
          </div>
        ) : (
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-zinc-100 pb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-zinc-950">Penyedia Otentikasi (OAuth)</h2>
                <p className="text-sm text-zinc-400 font-mono">Google / Facebook Single Sign-On</p>
              </div>
            </div>
            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2">
              <span className="text-xs font-bold text-zinc-950 block">Google / Facebook Connected</span>
              <p className="text-sm text-zinc-500 leading-relaxed font-mono">
                Anda terhubung melalui akun SSO. Keamanan kata sandi dikelola langsung oleh penyedia autentikasi eksternal Anda.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

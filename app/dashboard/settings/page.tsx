import { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, Key, ShieldCheck } from "lucide-react";
import ProfileForm from "@/components/dashboard/ProfileForm";
import PasswordForm from "@/components/dashboard/PasswordForm";

export const metadata: Metadata = {
  title: "Profil & Keamanan | CourtGrid User Portal",
  description: "Kelola profil dan kata sandi akun Anda.",
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
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-950 flex items-center gap-2.5">
          Pengaturan Profil & Keamanan
        </h1>
        <p className="text-zinc-500 mt-1 text-sm">
          Perbarui identitas diri dan kata sandi akun Anda secara berkala.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Card */}
        <Card className="border-zinc-200 shadow-xs bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-600" />
              Informasi Akun
            </CardTitle>
            <CardDescription className="text-xs">
              Ubah nama lengkap pengguna yang akan ditampilkan pada bukti sewa.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm user={{ name: user.name || "", email: user.email || "", image: user.image || "" }} />
          </CardContent>
        </Card>

        {/* Password Card */}
        {!isOAuth ? (
          <Card className="border-zinc-200 shadow-xs bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-600" />
                Ubah Kata Sandi
              </CardTitle>
              <CardDescription className="text-xs">
                Masukkan password lama dan password baru untuk meningkatkan keamanan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PasswordForm />
            </CardContent>
          </Card>
        ) : (
          <Card className="border-zinc-200 shadow-xs bg-zinc-50 flex flex-col justify-center">
            <CardContent className="pt-6">
              <div className="flex gap-3 text-sm text-zinc-600">
                <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                <div className="space-y-1">
                  <h4 className="font-bold text-zinc-950 text-sm">Autentikasi OAuth Aktif</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Anda masuk menggunakan penyedia akun sosial Google/Facebook. Kata sandi dikelola secara langsung oleh penyedia tersebut demi keamanan Anda.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

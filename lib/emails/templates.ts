import { formatRupiah } from "@/lib/utils";
import { SITE_URL } from "@/lib/constants";

const appUrl = SITE_URL;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "CourtGrid <onboarding@resend.dev>";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export const forgotPasswordEmail = (name: string | null | undefined, resetUrl: string) => {
  const safeName = escapeHtml(name || "Pelanggan");
  const safeResetUrl = escapeHtml(resetUrl);

  return {
    from: RESEND_FROM_EMAIL,
    to: [] as string[],
    subject: "Reset Password CourtGrid Anda",
    html: `
    <div style="font-family: Arial, sans-serif; max-w-xl; margin: 0 auto; padding: 20px; color: #333;">
      <h2 style="color: #059669; text-align: center;">CourtGrid</h2>
      <div style="background-color: #fafafa; padding: 30px; border-radius: 8px; border: 1px solid #eaeaea;">
        <h3 style="margin-top: 0;">Permintaan Reset Password</h3>
        <p>Halo ${safeName},</p>
        <p>Kami menerima permintaan untuk mengatur ulang kata sandi Anda. Jika Anda tidak melakukan permintaan ini, abaikan saja email ini.</p>
        <p>Untuk mengatur ulang kata sandi, klik tombol aman di bawah ini. Tautan ini berlaku selama 15 menit.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${safeResetUrl}" style="background-color: #09090b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Atur Ulang Password</a>
        </div>
        <p style="font-size: 14px; color: #666; margin-top: 30px;">
          Atau salin dan tempel URL ini ke browser Anda:<br>
          <a href="${safeResetUrl}" style="color: #059669; word-break: break-all;">${safeResetUrl}</a>
        </p>
      </div>
      <p style="text-align: center; font-size: 12px; color: #999; margin-top: 20px;">
        &copy; ${new Date().getFullYear()} CourtGrid. Hak cipta dilindungi.
      </p>
    </div>
  `,
  };
};

export const bookingConfirmationEmail = (data: {
  userName: string | null | undefined;
  userEmail: string | null | undefined;
  courtName: string;
  dateStr: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  dpAmount: number;
  reservationId: string;
}) => {
  const safeUserName = escapeHtml(data.userName || "Customer");
  const safeCourtName = escapeHtml(data.courtName);
  const safeDateStr = escapeHtml(data.dateStr);
  const safeStartTime = escapeHtml(data.startTime);
  const safeEndTime = escapeHtml(data.endTime);
  const safeReservationId = escapeHtml(data.reservationId);

  return {
    from: RESEND_FROM_EMAIL,
    to: data.userEmail ? [data.userEmail] : [],
    subject: "Booking Lapangan Berhasil — CourtGrid",
    html: `
    <div style="font-family: Arial, sans-serif; max-w-xl; margin: 0 auto; padding: 20px; color: #333;">
      <h2 style="color: #059669; text-align: center;">CourtGrid</h2>
      <div style="background-color: #fafafa; padding: 30px; border-radius: 8px; border: 1px solid #eaeaea;">
        <h3 style="margin-top: 0;">Booking Berhasil</h3>
        <p>Hello ${safeUserName},</p>
        <p>Pesanan lapangan Anda telah berhasil dibuat. Berikut detail pesanan:</p>
        <ul style="line-height: 1.8;">
          <li><strong>Lapangan:</strong> ${safeCourtName}</li>
          <li><strong>Tanggal:</strong> ${safeDateStr}</li>
          <li><strong>Jam:</strong> ${safeStartTime} - ${safeEndTime}</li>
          <li><strong>Total:</strong> ${formatRupiah(data.totalPrice)}</li>
          <li><strong>DP:</strong> ${formatRupiah(data.dpAmount)}</li>
          <li><strong>ID Reservasi:</strong> ${safeReservationId}</li>
        </ul>
        <p>Silakan selesaikan pembayaran DP untuk mengamankan jadwal.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${appUrl}/dashboard/reservations" style="background-color: #09090b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Lihat Reservasi</a>
        </div>
      </div>
      <p style="text-align: center; font-size: 12px; color: #999; margin-top: 20px;">
        &copy; ${new Date().getFullYear()} CourtGrid. All rights reserved.
      </p>
    </div>
  `,
  };
};

export const paymentSuccessEmail = (data: {
  userName: string | null | undefined;
  userEmail: string | null | undefined;
  courtName: string;
  dateStr: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  dpAmount: number;
  reservationId: string;
}) => {
  const safeUserName = escapeHtml(data.userName || "Customer");
  const safeCourtName = escapeHtml(data.courtName);
  const safeDateStr = escapeHtml(data.dateStr);
  const safeStartTime = escapeHtml(data.startTime);
  const safeEndTime = escapeHtml(data.endTime);
  const safeReservationId = escapeHtml(data.reservationId);

  return {
    from: RESEND_FROM_EMAIL,
    to: data.userEmail ? [data.userEmail] : [],
    subject: "Pembayaran DP Berhasil Diterima — CourtGrid",
    html: `
    <div style="font-family: Arial, sans-serif; max-w-xl; margin: 0 auto; padding: 20px; color: #333;">
      <h2 style="color: #059669; text-align: center;">CourtGrid</h2>
      <div style="background-color: #fafafa; padding: 30px; border-radius: 8px; border: 1px solid #eaeaea;">
        <h3 style="margin-top: 0;">Pembayaran DP Diterima</h3>
        <p>Hello ${safeUserName},</p>
        <p>Pembayaran DP untuk booking Anda telah kami terima dan diverifikasi. Berikut detail:</p>
        <ul style="line-height: 1.8;">
          <li><strong>Lapangan:</strong> ${safeCourtName}</li>
          <li><strong>Tanggal:</strong> ${safeDateStr}</li>
          <li><strong>Jam:</strong> ${safeStartTime} - ${safeEndTime}</li>
          <li><strong>Total:</strong> ${formatRupiah(data.totalPrice)}</li>
          <li><strong>DP:</strong> ${formatRupiah(data.dpAmount)}</li>
          <li><strong>ID Reservasi:</strong> ${safeReservationId}</li>
        </ul>
        <p>Booking Anda sekarang sudah terjamin. Sampai jumpa di lapangan!</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${appUrl}/dashboard/reservations" style="background-color: #09090b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Lihat Reservasi</a>
        </div>
      </div>
      <p style="text-align: center; font-size: 12px; color: #999; margin-top: 20px;">
        &copy; ${new Date().getFullYear()} CourtGrid. All rights reserved.
      </p>
    </div>
  `,
  };
};

export const registerOtpEmail = (name: string | null | undefined, otp: string) => {
  const safeName = escapeHtml(name || "Pelanggan");
  const safeOtp = escapeHtml(otp);

  return {
    from: RESEND_FROM_EMAIL,
    to: [] as string[],
    subject: "Kode Verifikasi Pendaftaran CourtGrid",
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <h2 style="color: #059669; text-align: center;">CourtGrid</h2>
      <div style="background-color: #fafafa; padding: 30px; border-radius: 8px; border: 1px solid #eaeaea;">
        <h3 style="margin-top: 0;">Verifikasi Akun Baru</h3>
        <p>Halo ${safeName},</p>
        <p>Terima kasih telah mendaftar di CourtGrid. Gunakan kode verifikasi 6 digit di bawah ini untuk mengaktifkan akun Anda:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #09090b; background: #e4e4e7; padding: 12px 24px; border-radius: 8px; font-family: monospace;">${safeOtp}</span>
        </div>
        <p style="font-size: 14px; color: #666;">Kode ini berlaku selama 10 menit. Jangan berikan kode ini kepada siapa pun.</p>
      </div>
      <p style="text-align: center; font-size: 12px; color: #999; margin-top: 20px;">
        &copy; ${new Date().getFullYear()} CourtGrid. Hak cipta dilindungi.
      </p>
    </div>
  `,
  };
};

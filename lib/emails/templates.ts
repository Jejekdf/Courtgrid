const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const forgotPasswordEmail = (name: string | null | undefined, resetUrl: string) => ({
  from: process.env.RESEND_FROM_EMAIL || "CourtGrid <onboarding@resend.dev>",
  to: [] as string[],
  subject: "Reset Password CourtGrid Anda",
  html: `
    <div style="font-family: Arial, sans-serif; max-w-xl; margin: 0 auto; padding: 20px; color: #333;">
      <h2 style="color: #059669; text-align: center;">CourtGrid</h2>
      <div style="background-color: #fafafa; padding: 30px; border-radius: 8px; border: 1px solid #eaeaea;">
        <h3 style="margin-top: 0;">Permintaan Reset Password</h3>
        <p>Halo ${name || "Pelanggan"},</p>
        <p>Kami menerima permintaan untuk mengatur ulang kata sandi Anda. Jika Anda tidak melakukan permintaan ini, abaikan saja email ini.</p>
        <p>Untuk mengatur ulang kata sandi, klik tombol aman di bawah ini. Tautan ini berlaku selama 1 jam.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #09090b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Atur Ulang Password</a>
        </div>
        <p style="font-size: 14px; color: #666; margin-top: 30px;">
          Atau salin dan tempel URL ini ke browser Anda:<br>
          <a href="${resetUrl}" style="color: #059669; word-break: break-all;">${resetUrl}</a>
        </p>
      </div>
      <p style="text-align: center; font-size: 12px; color: #999; margin-top: 20px;">
        &copy; ${new Date().getFullYear()} CourtGrid. Hak cipta dilindungi.
      </p>
    </div>
  `,
});

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
}) => ({
  from: process.env.RESEND_FROM_EMAIL || "CourtGrid <onboarding@resend.dev>",
  to: data.userEmail ? [data.userEmail] : [],
  subject: "Booking Lapangan Berhasil — CourtGrid",
  html: `
    <div style="font-family: Arial, sans-serif; max-w-xl; margin: 0 auto; padding: 20px; color: #333;">
      <h2 style="color: #059669; text-align: center;">CourtGrid</h2>
      <div style="background-color: #fafafa; padding: 30px; border-radius: 8px; border: 1px solid #eaeaea;">
        <h3 style="margin-top: 0;">Booking Berhasil</h3>
        <p>Hello ${data.userName || "Customer"},</p>
        <p>Pesanan lapangan Anda telah berhasil dibuat. Berikut detail pesanan:</p>
        <ul style="line-height: 1.8;">
          <li><strong>Lapangan:</strong> ${data.courtName}</li>
          <li><strong>Tanggal:</strong> ${data.dateStr}</li>
          <li><strong>Jam:</strong> ${data.startTime} - ${data.endTime}</li>
          <li><strong>Total:</strong> Rp ${data.totalPrice.toLocaleString("id-ID")}</li>
          <li><strong>DP:</strong> Rp ${data.dpAmount.toLocaleString("id-ID")}</li>
          <li><strong>ID Reservasi:</strong> ${data.reservationId}</li>
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
});

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
}) => ({
  from: process.env.RESEND_FROM_EMAIL || "CourtGrid <onboarding@resend.dev>",
  to: data.userEmail ? [data.userEmail] : [],
  subject: "Pembayaran DP Berhasil Diterima — CourtGrid",
  html: `
    <div style="font-family: Arial, sans-serif; max-w-xl; margin: 0 auto; padding: 20px; color: #333;">
      <h2 style="color: #059669; text-align: center;">CourtGrid</h2>
      <div style="background-color: #fafafa; padding: 30px; border-radius: 8px; border: 1px solid #eaeaea;">
        <h3 style="margin-top: 0;">Pembayaran DP Diterima</h3>
        <p>Hello ${data.userName || "Customer"},</p>
        <p>Pembayaran DP untuk booking Anda telah kami terima dan diverifikasi. Berikut detail:</p>
        <ul style="line-height: 1.8;">
          <li><strong>Lapangan:</strong> ${data.courtName}</li>
          <li><strong>Tanggal:</strong> ${data.dateStr}</li>
          <li><strong>Jam:</strong> ${data.startTime} - ${data.endTime}</li>
          <li><strong>Total:</strong> Rp ${data.totalPrice.toLocaleString("id-ID")}</li>
          <li><strong>DP:</strong> Rp ${data.dpAmount.toLocaleString("id-ID")}</li>
          <li><strong>ID Reservasi:</strong> ${data.reservationId}</li>
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
});

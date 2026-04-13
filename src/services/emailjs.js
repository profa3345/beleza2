/**
 * services/emailjs.js
 *
 * Integração com EmailJS para envio de OTP por e-mail.
 * Configure as variáveis no .env:
 *   VITE_EMAILJS_SVC  → Service ID
 *   VITE_EMAILJS_TPL  → Template ID (deve ter {{otp}} e {{to_email}})
 *   VITE_EMAILJS_KEY  → Public Key
 */

import { EMAILJS_SVC, EMAILJS_TPL, EMAILJS_KEY } from "../constants/index.js";

export async function sendEmailOTP(toEmail, otp) {
  if (!EMAILJS_SVC || !EMAILJS_TPL || !EMAILJS_KEY) {
    throw new Error("EmailJS não configurado — defina as variáveis VITE_EMAILJS_* no .env");
  }

  const { default: emailjs } = await import("@emailjs/browser");

  return emailjs.send(
    EMAILJS_SVC,
    EMAILJS_TPL,
    { to_email: toEmail, otp, app_name: "beleza.hub" },
    EMAILJS_KEY
  );
}

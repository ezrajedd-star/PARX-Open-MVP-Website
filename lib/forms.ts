/** Form endpoints (set in Vercel env). Each form can have its own endpoint; all fall back to NEXT_PUBLIC_FORM_ENDPOINT. */
const base = process.env.NEXT_PUBLIC_FORM_ENDPOINT ?? "";
export const FORM_ENDPOINTS = {
  sponsor: process.env.NEXT_PUBLIC_SPONSOR_FORM_ENDPOINT || base,
  driver: process.env.NEXT_PUBLIC_DRIVER_FORM_ENDPOINT || base,
  host: process.env.NEXT_PUBLIC_HOST_FORM_ENDPOINT || base,
};

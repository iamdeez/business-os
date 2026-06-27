import "server-only";
import { Resend } from "resend";
import { env } from "./env";

let _client: Resend | null = null;

export function getResendClient(): Resend {
  if (!_client) {
    _client = new Resend(env.RESEND_API_KEY);
  }
  return _client;
}

export const EMAIL_FROM = env.EMAIL_FROM;

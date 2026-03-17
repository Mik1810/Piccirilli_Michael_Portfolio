import { Resend } from 'resend'

import { getContactEmailConfig } from '../config/env.js'
import { HttpError } from '../http/apiUtils.js'
import type { SupportedLocale } from '../../src/types/app.js'

export interface ContactMessageInput {
  name: string
  email: string
  message: string
  locale: SupportedLocale
}

const CONTACT_SEND_TIMEOUT_MS = 12000

let resendClient: Resend | null = null

const getResendClient = () => {
  if (!resendClient) {
    const { resendApiKey } = getContactEmailConfig()
    resendClient = new Resend(resendApiKey)
  }

  return resendClient
}

const buildSubject = (locale: SupportedLocale, name: string) =>
  locale === 'it'
    ? `Nuovo contatto dal portfolio: ${name}`
    : `New portfolio contact: ${name}`

const buildTextBody = ({ name, email, message, locale }: ContactMessageInput) => {
  const intro =
    locale === 'it'
      ? 'Hai ricevuto un nuovo messaggio dal form contatti del portfolio.'
      : 'You received a new message from the portfolio contact form.'

  return [
    intro,
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    '',
    'Message:',
    message,
  ].join('\n')
}

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

const buildHtmlBody = ({ name, email, message, locale }: ContactMessageInput) => {
  const intro =
    locale === 'it'
      ? 'Hai ricevuto un nuovo messaggio dal form contatti del portfolio.'
      : 'You received a new message from the portfolio contact form.'
  const labelName = locale === 'it' ? 'Nome' : 'Name'
  const labelEmail = 'Email'
  const labelMessage = locale === 'it' ? 'Messaggio' : 'Message'
  const replyHint =
    locale === 'it'
      ? 'Puoi rispondere direttamente a questa email per contattare il mittente.'
      : 'You can reply directly to this email to contact the sender.'

  return `
    <div style="background:#0f172a;padding:24px;font-family:Inter,Segoe UI,Arial,sans-serif;color:#e2e8f0;">
      <div style="max-width:680px;margin:0 auto;background:#111c34;border:1px solid #26344f;border-radius:18px;overflow:hidden;">
        <div style="padding:24px 28px;border-bottom:1px solid #26344f;background:linear-gradient(135deg,#111c34 0%,#17284a 100%);">
          <div style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#7dd3fc;margin-bottom:10px;">Portfolio Contact</div>
          <h1 style="margin:0;font-size:24px;line-height:1.2;color:#f8fafc;">${escapeHtml(
            intro
          )}</h1>
        </div>
        <div style="padding:24px 28px;">
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
            <tr>
              <td style="padding:0 0 14px;vertical-align:top;width:120px;font-weight:700;color:#cbd5e1;">${labelName}</td>
              <td style="padding:0 0 14px;color:#f8fafc;">${escapeHtml(name)}</td>
            </tr>
            <tr>
              <td style="padding:0 0 18px;vertical-align:top;width:120px;font-weight:700;color:#cbd5e1;">${labelEmail}</td>
              <td style="padding:0 0 18px;"><a href="mailto:${escapeHtml(
                email
              )}" style="color:#7dd3fc;text-decoration:none;">${escapeHtml(email)}</a></td>
            </tr>
          </table>
          <div style="padding:18px 20px;border-radius:14px;background:#0b1326;border:1px solid #1e293b;">
            <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#94a3b8;margin-bottom:10px;">${labelMessage}</div>
            <div style="white-space:pre-wrap;line-height:1.7;color:#f8fafc;">${escapeHtml(
              message
            )}</div>
          </div>
        </div>
        <div style="padding:18px 28px;border-top:1px solid #26344f;color:#94a3b8;font-size:14px;line-height:1.6;">
          ${escapeHtml(replyHint)}
        </div>
      </div>
    </div>
  `.trim()
}

const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number) => {
  let timeoutHandle: NodeJS.Timeout | undefined

  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeoutHandle = setTimeout(() => {
          reject(
            new HttpError(504, 'Contact delivery timed out', {
              code: 'contact_timeout',
            })
          )
        }, timeoutMs)
      }),
    ])
  } finally {
    if (timeoutHandle) clearTimeout(timeoutHandle)
  }
}

export const sendContactMessage = async (payload: ContactMessageInput) => {
  let contactFromEmail: string
  let contactToEmail: string

  try {
    const config = getContactEmailConfig()
    contactFromEmail = config.contactFromEmail
    contactToEmail = config.contactToEmail
  } catch {
    throw new HttpError(503, 'Contact service is not configured right now', {
      code: 'contact_unavailable',
    })
  }

  const { data, error } = await withTimeout(
    getResendClient().emails.send({
      from: contactFromEmail,
      to: [contactToEmail],
      replyTo: payload.email,
      subject: buildSubject(payload.locale, payload.name),
      text: buildTextBody(payload),
      html: buildHtmlBody(payload),
    }),
    CONTACT_SEND_TIMEOUT_MS
  )

  if (error) {
    throw new HttpError(502, 'Unable to deliver message right now', {
      code: 'contact_delivery_failed',
    })
  }

  return {
    id: data?.id ?? null,
  }
}

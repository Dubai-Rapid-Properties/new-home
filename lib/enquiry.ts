'use client';

import { useCallback, useState } from 'react';
import { turnstileToken } from './turnstile';

export type EnquiryData = Record<string, unknown>;

/**
 * Sends a form's fields (and an optional file, e.g. a CV) to /api/enquiry,
 * which emails them to DRP. Throws when the message could not be sent.
 */
export async function sendEnquiry(data: EnquiryData, file?: File | null) {
  const body = new FormData();
  body.append('data', JSON.stringify({ ...data, page: window.location.pathname }));
  if (file) body.append('file', file);
  const token = await turnstileToken();
  if (token) body.append('cf-turnstile-response', token);
  const res = await fetch('/api/enquiry', { method: 'POST', body });
  if (!res.ok) throw new Error(`Enquiry failed: ${res.status}`);
}

/** Sending state for a form: `send` resolves true once DRP has the message. */
export function useEnquiry() {
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);

  const send = useCallback(async (data: EnquiryData, file?: File | null) => {
    setSending(true);
    setFailed(false);
    try {
      await sendEnquiry(data, file);
      return true;
    } catch {
      setFailed(true);
      return false;
    } finally {
      setSending(false);
    }
  }, []);

  return { sending, failed, send };
}

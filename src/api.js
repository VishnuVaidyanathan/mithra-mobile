const BASE_URL = 'https://mithra-app-production.up.railway.app';

export async function sendMessage({ text, sessionId, apiKey, imageBase64 = null, imageMimeType = 'image/jpeg' }) {
  const res = await fetch(`${BASE_URL}/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text:             text || '',
      session_id:       sessionId,
      api_key:          apiKey || '',
      image_base64:     imageBase64,
      image_mime_type:  imageMimeType,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function resetSession(sessionId) {
  const res = await fetch(`${BASE_URL}/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId }),
  });
  return res.json();
}

export async function tickDecay(sessionId) {
  const res = await fetch(`${BASE_URL}/tick`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, dt_seconds: 1.0 }),
  });
  return res.json();
}

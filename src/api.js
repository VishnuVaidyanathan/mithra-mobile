const BASE_URL = 'https://api.edgi.in';
const TIMEOUT_MS = 30_000; // 30 seconds

function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timer))
    .catch(err => {
      if (err.name === 'AbortError') {
        throw new Error('Request timed out — please try again.');
      }
      throw new Error('Cannot reach Mithra. Check your connection.');
    });
}

export async function sendMessage({ text, sessionId, apiKey, imageBase64 = null, imageMimeType = 'image/jpeg' }) {
  const res = await fetchWithTimeout(`${BASE_URL}/process`, {
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
    throw new Error(err.detail || `Server error (HTTP ${res.status})`);
  }
  return res.json();
}

export async function resetSession(sessionId) {
  const res = await fetchWithTimeout(`${BASE_URL}/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId }),
  });
  return res.json();
}

export async function tickDecay(sessionId) {
  const res = await fetchWithTimeout(`${BASE_URL}/tick`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, dt_seconds: 1.0 }),
  });
  return res.json();
}

export async function ping() {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/health`, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}

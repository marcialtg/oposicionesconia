import { KB } from './kb.mjs';

const DIM = KB[0].embedding.length;
const CF_ACCOUNT = '629b082a962f1f40d968279f6ad57714';
const EMBED_URL = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/ai/run/@cf/baai/bge-base-en-v1.5`;

function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < DIM; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export async function search(query, token) {
  const resp = await fetch(EMBED_URL, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: [query] })
  });
  if (!resp.ok) return [];
  const data = await resp.json();
  if (!data.success || !data.result?.data?.[0]) return [];
  const qv = data.result.data[0];

  const scored = KB.map(c => ({ ...c, score: cosine(qv, c.embedding) }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 5).filter(c => c.score > 0.1);
}

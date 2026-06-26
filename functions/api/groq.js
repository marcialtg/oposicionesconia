// Cloudflare Pages Function: Workers AI via REST API
// Necesita CF_ACCOUNT_ID y CF_API_TOKEN en Variables de Entorno

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }
    });
  }
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const ACCOUNT = env.CF_ACCOUNT_ID;
  const TOKEN = env.CF_API_TOKEN;
  if (!ACCOUNT || !TOKEN) {
    return new Response(JSON.stringify({ error: 'CF_ACCOUNT_ID y CF_API_TOKEN no configurados' }), {
      status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  try {
    const { messages, system, max_tokens, temperature } = await request.json();
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'messages es requerido' }), {
        status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
    const aiMessages = [];
    if (system) aiMessages.push({ role: 'system', content: system });
    aiMessages.push(...messages);

    const resp = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}/ai/run/@cf/meta/llama-3.2-11b-instruct`,
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: aiMessages, max_tokens: max_tokens || 1024 })
      }
    );

    if (!resp.ok) {
      const err = await resp.text();
      return new Response(JSON.stringify({ error: 'Workers AI error', detail: err }), {
        status: resp.status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const data = await resp.json();
    return new Response(JSON.stringify({ content: data.result.response }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}

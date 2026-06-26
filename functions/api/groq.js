// Cloudflare Pages Function: Workers AI (Llama 3.2 11B)
// No necesita API key — usa Workers AI (500k req/mes gratis)

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

    const resp = await env.AI.run('@cf/meta/llama-3.2-11b-instruct', {
      messages: aiMessages,
      temperature: temperature ?? 0.7,
      max_tokens: max_tokens || 1024
    });

    return new Response(JSON.stringify({ content: resp.response }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}

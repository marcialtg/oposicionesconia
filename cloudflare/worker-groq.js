// Cloudflare Worker: Groq Proxy
// Añade GROQ_API_KEY en Variables de Entorno

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }
      });
    }
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }
    const GROQ_KEY = typeof GROQ_API_KEY !== 'undefined' ? GROQ_API_KEY : '';
    if (!GROQ_KEY) {
      return new Response(JSON.stringify({ error: 'GROQ_API_KEY no configurada' }), {
        status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
    try {
      const { messages, system, model, max_tokens, temperature } = await request.json();
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return new Response(JSON.stringify({ error: 'messages es requerido' }), {
          status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
      const groqMessages = [];
      if (system) groqMessages.push({ role: 'system', content: system });
      groqMessages.push(...messages);

      const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model || 'llama-3.3-70b-versatile',
          messages: groqMessages,
          temperature: temperature || 0.7,
          max_tokens: max_tokens || 1024
        })
      });
      if (!resp.ok) {
        const err = await resp.text();
        return new Response(JSON.stringify({ error: 'Groq API error' }), {
          status: resp.status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
      const data = await resp.json();
      return new Response(JSON.stringify({ content: data.choices[0].message.content }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
  }
}

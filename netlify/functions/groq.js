const GROQ_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = 'gemma2-9b-it';

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { messages, system, model, max_tokens, temperature } = JSON.parse(event.body);

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'messages es requerido' }) };
    }

    const groqMessages = [];
    if (system) groqMessages.push({ role: 'system', content: system });
    groqMessages.push(...messages.map(m => ({ role: m.role, content: m.content })));

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model || GROQ_MODEL,
        messages: groqMessages,
        temperature: temperature || 0.7,
        max_tokens: max_tokens || 1024
      })
    });

    if (!response.ok) {
      return { statusCode: response.status, headers, body: JSON.stringify({ error: 'Groq API error' }) };
    }

    const data = await response.json();
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ content: data.choices[0].message.content })
    };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};

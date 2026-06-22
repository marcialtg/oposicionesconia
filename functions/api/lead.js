const RESOURCE_CONTENT = {
  'calculadora-baremo': `<h2>🧮 Calculadora de méritos (RD 276/2007)</h2>
<table style="width:100%;border-collapse:collapse;"><tr style="background:#b8860b;color:#fff;"><th style="padding:10px;text-align:left;">Concepto</th><th style="padding:10px;text-align:center;">Máx</th></tr><tr><td style="padding:8px;">Experiencia pública (misma especialidad)</td><td style="text-align:center;">2,50</td></tr><tr><td style="padding:8px;">Experiencia pública (otra especialidad)</td><td style="text-align:center;">1,00</td></tr><tr><td style="padding:8px;">Experiencia privada/concertada</td><td style="text-align:center;">1,50</td></tr><tr><td style="padding:8px;">Nota media expediente</td><td style="text-align:center;">1,50</td></tr><tr><td style="padding:8px;">Doctorado</td><td style="text-align:center;">1,00</td></tr><tr><td style="padding:8px;">Máster oficial</td><td style="text-align:center;">0,50</td></tr><tr><td style="padding:8px;">Idiomas C1/C2</td><td style="text-align:center;">0,50</td></tr><tr><td style="padding:8px;">Cursos homologados</td><td style="text-align:center;">1,00</td></tr><tr style="background:#f0e6d3;font-weight:bold;"><td style="padding:10px;">TOTAL</td><td style="text-align:center;">10,00</td></tr></table><p>Según Real Decreto 276/2007.</p>`,
  'plantilla-programacion': `<h2>📄 Plantilla Programación Didáctica LOMLOE</h2>
<ol><li><b>Introducción y contextualización</b></li><li><b>Marco normativo</b> — LOMLOE, RD 217/2022, 243/2022</li><li><b>Competencias clave</b> — 8 competencias</li><li><b>Competencias específicas</b></li><li><b>Saberes básicos</b></li><li><b>Metodología</b> — DUA, ABP</li><li><b>Situaciones de aprendizaje</b> — 10-15</li><li><b>Evaluación</b> — Rúbricas</li><li><b>Calificación</b></li><li><b>Atención diversidad</b></li><li><b>Materiales</b></li><li><b>Evaluación programación</b></li></ol><p><b>Extensión: 40-70 páginas</b></p>`,
  'checklist-preparacion': `<h2>📋 Checklist de preparación (47 tareas)</h2>
<h3>Fase 1: Fundamentos (Mes 1)</h3><ul><li>Analizar convocatoria</li><li>Descargar temario</li><li>Calendario de estudio</li></ul>
<h3>Fase 2: Temario (Meses 2-4)</h3><ul><li>Resumir 72 temas</li><li>Esquemas</li><li>3 temas/semana</li></ul>
<h3>Fase 3: Legislación (Meses 3-5)</h3><ul><li>LOMLOE</li><li>RD 217/2022, 243/2022</li></ul>
<h3>Fase 4: Programación (Meses 4-6)</h3><ul><li>Programación didáctica</li><li>10-15 SA</li><li>Defensa oral</li></ul>
<h3>Fase 5: Simulacros (Meses 5-7)</h3><ul><li>Simulacros semanales</li><li>Cronometrar</li></ul>`,
  'legislacion': `<h2>⚖️ Resumen legislación LOMLOE</h2>
<h3>Leyes Orgánicas</h3><ul><li><b>LOMLOE (Ley 3/2020)</b></li><li><b>LOE (Ley 2/2006)</b></li></ul>
<h3>Reales Decretos</h3><ul><li><b>RD 217/2022</b> — Currículo ESO</li><li><b>RD 243/2022</b> — Bachillerato</li><li><b>RD 157/2022</b> — Primaria</li><li><b>RD 984/2021</b> — Evaluación</li></ul>
<h3>Acceso Docente</h3><ul><li><b>RD 276/2007</b> — Baremo (5+3+2 pts)</li></ul>`
};

const WRAP = (c) => '<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#333;"><div style="text-align:center;margin-bottom:24px;"><h2 style="color:#7a173c;">OposicionesConIA</h2></div>' + c + '<hr><p style="font-size:.78rem;color:#999;text-align:center;"><a href="https://oposicionesconia.com">oposicionesconia.com</a></p></div>';

const SHEET_URL = 'https://script.google.com/macros/s/AKfycbwAyZ33xDmHgVsOXDtMD2tksKwTI_h71vVzVOOiDfZjJ5g9UDsVEPIU-47R_KXxHGv6/exec';

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
  }
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const RESEND_KEY = env.RESEND_KEY;
  if (!RESEND_KEY) {
    return new Response(JSON.stringify({ error: 'RESEND_KEY no configurada' }), {
      status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  try {
    const data = await request.json();
    const r = (data.resource || '').toLowerCase();
    const { name = 'opositor', email, phone = '', oposicion = '', ccaa = '' } = data;

    // Notify owner
    const send = (to, subj, html) =>
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: 'OposicionesConIA <onboarding@resend.dev>', to, subject: subj, html })
      });

    await send('marcialtg@gmail.com', `📥 ${name} solicitó: ${r || 'recursos'}`,
      `<h2>Nuevo registro</h2><p><b>Nombre:</b> ${name}</p><p><b>Email:</b> ${email}</p><p><b>Teléfono:</b> ${phone}</p><p><b>Oposición:</b> ${oposicion}</p><p><b>CCAA:</b> ${ccaa}</p>`
    );

    // Send resource to lead
    if (email) {
      let content, subj;
      if (r === 'test-diagnostico') {
        subj = 'Tu plan personalizado';
        content = data.planContent || '<p>Revisa tu plan en la web.</p>';
      } else if (['recurso_calc', 'calculadora-baremo'].includes(r)) {
        subj = '🧮 Calculadora de méritos'; content = RESOURCE_CONTENT['calculadora-baremo'];
      } else if (['recurso_plantilla', 'plantilla-programacion'].includes(r)) {
        subj = '📄 Plantilla Programación'; content = RESOURCE_CONTENT['plantilla-programacion'];
      } else if (['recurso_legislacion', 'legislacion'].includes(r)) {
        subj = '⚖️ Resumen legislación'; content = RESOURCE_CONTENT['legislacion'];
      } else if (r === 'checklist-preparacion') {
        subj = '📋 Checklist'; content = RESOURCE_CONTENT['checklist-preparacion'];
      } else {
        subj = 'Tus recursos gratuitos';
        content = '<h2>¡Gracias!</h2><p>Accede a todos los recursos: <a href="https://oposicionesconia.com/#recursos">oposicionesconia.com/recursos</a></p>';
      }
      await send(email, subj + ' - OposicionesConIA', WRAP(content));
    }

    // Save to sheet (fire-and-forget)
    try {
      await fetch(SHEET_URL, {
        method: 'POST',
        body: JSON.stringify({ date: new Date().toISOString(), name, email, phone, oposicion, ccaa, resource: r, source: data.source || 'web' })
      });
    } catch(e) {}

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: e.message }), {
      status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}

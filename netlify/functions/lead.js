const RESEND_KEY = process.env.RESEND_KEY;

const RESOURCE_CONTENT = {
  'calculadora-baremo': `<h2>🧮 Calculadora de méritos (RD 276/2007)</h2>
<table style="width:100%;border-collapse:collapse;"><tr style="background:#b8860b;color:#fff;"><th style="padding:10px;text-align:left;">Concepto</th><th style="padding:10px;text-align:center;">Máx</th></tr><tr><td style="padding:8px;border-bottom:1px solid #ddd;">Experiencia pública (misma especialidad)</td><td style="padding:8px;text-align:center;">2,50</td></tr><tr><td style="padding:8px;border-bottom:1px solid #ddd;">Experiencia pública (otra especialidad)</td><td style="padding:8px;text-align:center;">1,00</td></tr><tr><td style="padding:8px;border-bottom:1px solid #ddd;">Experiencia privada/concertada</td><td style="padding:8px;text-align:center;">1,50</td></tr><tr><td style="padding:8px;border-bottom:1px solid #ddd;">Nota media expediente</td><td style="padding:8px;text-align:center;">1,50</td></tr><tr><td style="padding:8px;border-bottom:1px solid #ddd;">Doctorado</td><td style="padding:8px;text-align:center;">1,00</td></tr><tr><td style="padding:8px;border-bottom:1px solid #ddd;">Máster oficial</td><td style="padding:8px;text-align:center;">0,50</td></tr><tr><td style="padding:8px;border-bottom:1px solid #ddd;">Idiomas C1/C2</td><td style="padding:8px;text-align:center;">0,50</td></tr><tr><td style="padding:8px;border-bottom:1px solid #ddd;">Cursos homologados</td><td style="padding:8px;text-align:center;">1,00</td></tr><tr style="background:#f0e6d3;font-weight:bold;"><td style="padding:10px;">TOTAL</td><td style="padding:10px;text-align:center;">10,00</td></tr></table><p style="color:#666;font-size:.85rem;">Según Real Decreto 276/2007.</p>`,

  'plantilla-programacion': `<h2>📄 Plantilla Programación Didáctica LOMLOE</h2>
<ol><li><b>Introducción y contextualización</b> — Centro, alumnado, entorno</li><li><b>Marco normativo</b> — LOMLOE, RD 217/2022, RD 243/2022</li><li><b>Competencias clave</b> — 8 competencias, descriptores operativos</li><li><b>Competencias específicas</b> — Relación competencia-criterio-saber</li><li><b>Saberes básicos</b> — Bloques, secuenciación en UD</li><li><b>Metodología</b> — DUA, ABP, gamificación</li><li><b>Situaciones de aprendizaje</b> — 10-15 SA</li><li><b>Evaluación</b> — Rúbricas, portafolios, pruebas</li><li><b>Calificación</b> — Ponderación</li><li><b>Atención diversidad</b> — Medidas ordinarias/extraordinarias</li><li><b>Materiales</b> — Libros, TIC</li><li><b>Evaluación programación</b> — Mejora continua</li></ol><p><b>Extensión: 40-70 páginas</b></p>`,

  'checklist-preparacion': `<h2>📋 Checklist de preparación (47 tareas)</h2>
<h3>Fase 1: Fundamentos (Mes 1)</h3><ul><li>Analizar convocatoria oficial</li><li>Descargar temario completo</li><li>Crear calendario de estudio</li><li>Identificar fortalezas/debilidades</li></ul>
<h3>Fase 2: Temario (Meses 2-4)</h3><ul><li>Resumir 72 temas</li><li>Esquemas y mapas mentales</li><li>3 temas/semana en profundidad</li><li>Repetición espaciada (Anki)</li></ul>
<h3>Fase 3: Legislación (Meses 3-5)</h3><ul><li>Estudiar LOMLOE</li><li>RD 217/2022 y 243/2022</li><li>Fichas resumen</li></ul>
<h3>Fase 4: Programación (Meses 4-6)</h3><ul><li>Diseñar programación</li><li>10-15 situaciones de aprendizaje</li><li>Preparar defensa oral</li></ul>
<h3>Fase 5: Simulacros (Meses 5-7)</h3><ul><li>Simulacros semanales</li><li>Cronometrar tiempos</li><li>Grabar defensa</li></ul>`,

  'legislacion': `<h2>⚖️ Resumen legislación LOMLOE</h2>
<h3>Leyes Orgánicas</h3><ul><li><b>LOMLOE (Ley 3/2020)</b> — Currículo competencial, DUA, SA</li><li><b>LOE (Ley 2/2006)</b> — Ley base del sistema</li></ul>
<h3>Reales Decretos</h3><ul><li><b>RD 217/2022</b> — Currículo ESO</li><li><b>RD 243/2022</b> — Currículo Bachillerato</li><li><b>RD 157/2022</b> — Primaria</li><li><b>RD 984/2021</b> — Evaluación</li></ul>
<h3>Acceso Docente</h3><ul><li><b>RD 276/2007</b> — Baremo (5+3+2 pts)</li><li><b>RD 270/2022</b> — Acceso función docente</li></ul>`
};

const EMAIL_WRAPPER = (content) => `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#333;">
<div style="text-align:center;margin-bottom:24px;"><div style="font-size:2rem;margin-bottom:4px;">📚</div><h2 style="color:#7a173c;margin:0;">OposicionesConIA</h2><p style="color:#C5A059;font-size:.85rem;">Tu preparadora IA</p></div>
${content}
<hr style="border:none;border-top:1px solid #eee;margin:24px 0;"><p style="font-size:.78rem;color:#999;text-align:center;">OposicionesConIA — <a href="https://oposicionesconia.com" style="color:#C5A059;">oposicionesconia.com</a></p></div>`;

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: 'Method not allowed' };

  try {
    const data = JSON.parse(event.body);
    const r = (data.resource || '').toLowerCase();
    const { name = 'opositor', email, phone = '', oposicion = '', ccaa = '' } = data;

    // Notification to owner
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'OposicionesConIA <onboarding@resend.dev>',
        to: 'marcialtg@gmail.com',
        subject: `📥 ${name} solicitó: ${r || 'recursos'}`,
        html: `<h2>Nuevo registro</h2><p><b>Nombre:</b> ${name}</p><p><b>Email:</b> ${email}</p><p><b>Teléfono:</b> ${phone}</p><p><b>Oposición:</b> ${oposicion}</p><p><b>CCAA:</b> ${ccaa}</p><p><b>Recurso:</b> ${r || 'General'}</p>`
      })
    });

    // Send resource to lead
    if (email) {
      let content, subj;
      if (r === 'test-diagnostico') {
        subj = 'Tu plan personalizado';
        content = data.planContent || '<p>Revisa tu plan en la web.</p>';
      } else if (['recurso_calc', 'calculadora-baremo'].includes(r)) {
        subj = '🧮 Calculadora de méritos';
        content = RESOURCE_CONTENT['calculadora-baremo'];
      } else if (['recurso_plantilla', 'plantilla-programacion'].includes(r)) {
        subj = '📄 Plantilla Programación';
        content = RESOURCE_CONTENT['plantilla-programacion'];
      } else if (['recurso_legislacion', 'legislacion'].includes(r)) {
        subj = '⚖️ Resumen legislación';
        content = RESOURCE_CONTENT['legislacion'];
      } else if (r === 'checklist-preparacion') {
        subj = '📋 Checklist de preparación';
        content = RESOURCE_CONTENT['checklist-preparacion'];
      } else {
        subj = 'Tus recursos gratuitos';
        content = '<h2>¡Gracias!</h2><p>Todos los recursos:</p><ul><li>🧮 Calculadora de méritos</li><li>📄 Plantilla Programación</li><li>📋 Checklist</li><li>⚖️ Resumen legislación</li></ul><p><a href="https://oposicionesconia.com/#recursos">oposicionesconia.com/recursos</a></p>';
      }

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'OposicionesConIA <onboarding@resend.dev>',
          to: email,
          subject: subj + ' - OposicionesConIA',
          html: EMAIL_WRAPPER(content)
        })
      });
    }

    // Save to sheet (fire & forget)
    try {
      fetch('https://script.google.com/macros/s/AKfycbwAyZ33xDmHgVsOXDtMD2tksKwTI_h71vVzVOOiDfZjJ5g9UDsVEPIU-47R_KXxHGv6/exec', {
        method: 'POST', mode: 'no-cors',
        body: JSON.stringify({
          date: new Date().toISOString(), name, email, phone, oposicion, ccaa,
          resource: r, source: data.source || 'web'
        })
      }).catch(() => {});
    } catch(e) {}

    return { statusCode: 200, headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ success: true }) };

  } catch (err) {
    return { statusCode: 500, headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ success: false, error: err.message }) };
  }
};

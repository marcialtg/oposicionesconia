require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const { Resend } = require('resend');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const TO_EMAIL = process.env.TO_EMAIL || 'marcialtg@gmail.com';
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';

app.use(cors());
app.use(express.json());

// ─── Health check para Railway ───
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// ─── Base de datos SQLite ───
const db = new Database(path.join(__dirname, 'leads.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    oposicion TEXT NOT NULL,
    ccaa TEXT,
    exam_date TEXT,
    resource TEXT,
    source TEXT,
    created_at TEXT
  )
`);
try { db.exec(`ALTER TABLE leads ADD COLUMN resource TEXT`); } catch(e) {}
try { db.exec(`ALTER TABLE leads ADD COLUMN source TEXT`); } catch(e) {}

db.exec(`
  CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT
  )
`);
try { db.exec(`ALTER TABLE chat_messages ADD COLUMN created_at TEXT`); } catch(e) {}

// ─── Resend ───
let resend = null;
if (RESEND_API_KEY && RESEND_API_KEY.startsWith('re_')) {
  resend = new Resend(RESEND_API_KEY);
  console.log('✓ Resend configurado');
} else {
  console.log('⚠ Resend no configurado — edita server/.env con tu API Key');
}

// ─── POST /api/lead ───
const RESOURCE_NAMES = {
  'checklist-preparacion': 'Checklist de preparación (47 tareas)',
  'plantilla-programacion': 'Plantilla Programación Didáctica LOMLOE',
  'calculadora-baremo': 'Calculadora de baremo de méritos',
  'recurso_calc': 'Calculadora interactiva de méritos',
  'recurso_plantilla': 'Plantilla interactiva Programación Didáctica',
  'recurso_legislacion': 'Resumen legislación LOMLOE',
};

app.post('/api/lead', async (req, res) => {
  try {
    const { name, email, phone, oposicion, ccaa, examDate, resource, source } = req.body;
    const resourceName = RESOURCE_NAMES[resource] || resource || 'Recurso general';

    if (!name || !email || !oposicion) {
      return res.status(400).json({ error: 'Nombre, email y oposición son obligatorios' });
    }

    // Guardar en base de datos
    const stmt = db.prepare(
      'INSERT INTO leads (name, email, phone, oposicion, ccaa, exam_date, resource, source, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    const now = new Date().toLocaleString('es-ES');
    const result = stmt.run(name, email, phone || null, oposicion, ccaa || null, examDate || null, resource || null, source || null, now);

    console.log(`✓ Lead guardado en DB (id: ${result.lastInsertRowid}): ${name} <${email}> → ${resourceName}`);

    // Enviar email vía Resend
    if (resend) {
      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: TO_EMAIL,
          subject: `📥 ${name} descargó: ${resourceName} (${oposicion})`,
          html: `
            <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;">
              <h2 style="color:#C5A059;">📥 Nuevo lead — Recurso descargado</h2>
              <div style="background:#fffbf2;border:2px solid #C5A059;border-radius:8px;padding:14px 18px;margin:16px 0;text-align:center;">
                <strong style="font-size:1.1rem;color:#a58039;">📦 ${resourceName}</strong>
              </div>
              <table style="width:100%;border-collapse:collapse;margin:16px 0;">
                <tr><td style="padding:8px 12px;background:#f4f4f8;font-weight:600;">Nombre</td><td style="padding:8px 12px;">${name}</td></tr>
                <tr><td style="padding:8px 12px;background:#f4f4f8;font-weight:600;">Email</td><td style="padding:8px 12px;">${email}</td></tr>
                <tr><td style="padding:8px 12px;background:#f4f4f8;font-weight:600;">Teléfono</td><td style="padding:8px 12px;">${phone || '—'}</td></tr>
                <tr><td style="padding:8px 12px;background:#f4f4f8;font-weight:600;">Oposición</td><td style="padding:8px 12px;">${oposicion}</td></tr>
                <tr><td style="padding:8px 12px;background:#f4f4f8;font-weight:600;">CCAA</td><td style="padding:8px 12px;">${ccaa || '—'}</td></tr>
                <tr><td style="padding:8px 12px;background:#f4f4f8;font-weight:600;">Origen</td><td style="padding:8px 12px;">${source || '—'}</td></tr>
                <tr><td style="padding:8px 12px;background:#f4f4f8;font-weight:600;">Registrado</td><td style="padding:8px 12px;">${new Date().toLocaleString('es-ES')}</td></tr>
              </table>
              <p style="color:#6b6b80;font-size:0.85rem;">Lead #${result.lastInsertRowid} · OpoAI</p>
            </div>
          `
        });
        console.log('✓ Email enviado a', TO_EMAIL);
      } catch (emailErr) {
        console.error('× Error al enviar email:', emailErr.message, JSON.stringify(emailErr));
      }
    }

    res.json({
      success: true,
      id: result.lastInsertRowid,
      message: 'Lead registrado correctamente'
    });

  } catch (err) {
    console.error('× Error en /api/lead:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── POST /api/chat — guardar mensajes del chat ───
app.post('/api/chat', (req, res) => {
  try {
    const { session, role, content, date } = req.body;
    if (!session || !role || !content) {
      return res.status(400).json({ error: 'session, role y content son obligatorios' });
    }
    const now = date || new Date().toISOString();
    const stmt = db.prepare('INSERT INTO chat_messages (session, role, content, created_at) VALUES (?, ?, ?, ?)');
    const result = stmt.run(session, role, content, now);
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    console.error('× Error en /api/chat:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── GET /api/chat — listar chats ───
app.get('/api/chat', (req, res) => {
  if (req.query.key !== 'admin123') {
    return res.status(401).json({ error: 'No autorizado' });
  }
  const messages = db.prepare('SELECT * FROM chat_messages ORDER BY id DESC').all();
  res.json(messages);
});

// ─── GET /api/test-email — prueba de envío ───
app.get('/api/test-email', async (req, res) => {
  if (!resend) return res.json({ ok: false, error: 'Resend no configurado' });
  try {
    const r = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      subject: '🔔 Prueba OpoAI — Email funcionando',
      html: `<div style="font-family:system-ui,sans-serif;padding:24px;">
        <h2 style="color:#C5A059;">¡Email configurado correctamente!</h2>
        <p style="color:#444;">Los leads de OpoAI llegarán a esta dirección.</p>
        <p style="color:#999;font-size:.85rem;">Configuraci&oacute;n: FROM=${FROM_EMAIL} | TO=${TO_EMAIL}</p>
      </div>`
    });
    console.log('✓ Email de prueba enviado:', r.data?.id);
    res.json({ ok: true, id: r.data?.id, from: FROM_EMAIL, to: TO_EMAIL });
  } catch (e) {
    console.error('× Error test email:', e.message);
    res.json({ ok: false, error: e.message });
  }
});

// ─── GET /api/leads — listar leads ───
app.get('/api/leads', (req, res) => {
  if (req.query.key !== 'admin123') {
    return res.status(401).json({ error: 'No autorizado' });
  }
  const leads = db.prepare('SELECT * FROM leads ORDER BY id DESC').all();
  res.json(leads);
});

// ─── Servir el frontend ───
app.use(express.static(path.join(__dirname, '..')));

// ─── Iniciar ───
app.listen(PORT, () => {
  console.log(`\n  🚀 OpoAI server corriendo en http://localhost:${PORT}`);
  console.log(`  📋 POST /api/lead   — registrar lead`);
  console.log(`  📋 GET  /api/leads  — listar leads (/?key=admin123)`);
  console.log(`  💬 POST /api/chat  — guardar mensaje del chat`);
  console.log(`  💬 GET  /api/chat  — ver mensajes del chat (/?key=admin123)`);
  console.log(`  📧 Email: ${resend ? '✓ activado → ' + TO_EMAIL : '⚠ no configurado'}\n`);
});

const express = require('express');
const { createClient } = require('@libsql/client');
const bcrypt = require('bcryptjs');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

/* ─── REGISTRO ─── */
app.post('/api/auth/register', async (req, res) => {
  const { nombre, correo, pass } = req.body;
  if (!nombre || !correo || !pass)
    return res.status(400).json({ error: 'Faltan campos' });

  const hash = await bcrypt.hash(pass, 10);

  try {
    await turso.execute({
      sql: 'INSERT INTO usuarios (nombre, pass, fecha_registro, Correo) VALUES (?, ?, datetime(), ?)',
      args: [nombre, hash, correo],
    });
    res.json({ ok: true, msg: 'Usuario creado' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ─── LOGIN ─── */
app.post('/api/auth/login', async (req, res) => {
  const { correo, pass } = req.body;
  if (!correo || !pass)
    return res.status(400).json({ error: 'Faltan credenciales' });

  const result = await turso.execute({
    sql: 'SELECT * FROM usuarios WHERE Correo = ?',
    args: [correo],
  });

  if (result.rows.length === 0)
    return res.status(401).json({ error: 'Credenciales inválidas' });

  const user = result.rows[0];
  const valid = await bcrypt.compare(pass, user.pass);

  if (!valid)
    return res.status(401).json({ error: 'Credenciales inválidas' });

  res.json({
    ok: true,
    user: { id: user.id, nombre: user.nombre, correo: user.Correo },
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🔥 Login server http://localhost:${PORT}`));
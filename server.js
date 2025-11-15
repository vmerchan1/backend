import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const app = express();

// Configuración CORS (ajusta ALLOWED_ORIGIN si usas otro dominio para el frontend)
const allowedOrigin = process.env.ALLOWED_ORIGIN || "*";
app.use(cors({ origin: allowedOrigin }));
app.use(express.json());

// Conexión a Supabase
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Faltan variables SUPABASE_URL o SUPABASE_ANON_KEY");
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Endpoint de salud
app.get("/health", (req, res) => res.json({ ok: true, service: "p_prueba_api" }));

// ----------------------
// 🔐 Autenticación básica
// ----------------------

// Registro de usuario con email/contraseña
app.post("/auth/register", async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Login de usuario
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// ----------------------
// 👥 Gestión de usuarios
// ----------------------

// Listar usuarios
app.get("/users", async (req, res) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("id", { ascending: true });

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Crear usuario (requiere token válido)
app.post("/users", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "No autorizado" });

  const { data: user, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: "Token inválido" });

  const { name, email, phone, role } = req.body;
  if (!name || !email) return res.status(400).json({ error: "Faltan campos obligatorios" });

  const { data, error } = await supabase
    .from("users")
    .insert([{ name, email, phone, role }])
    .select("*");

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API p_prueba corriendo en puerto ${port}`));

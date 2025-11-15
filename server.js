import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const app = express();

// Configuración CORS: cambia ALLOWED_ORIGIN si usas otro dominio
const allowedOrigin = process.env.ALLOWED_ORIGIN || "*";
app.use(cors({ origin: allowedOrigin, credentials: false }));
app.use(express.json());

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Faltan variables SUPABASE_URL o SUPABASE_ANON_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

app.get("/health", (req, res) => res.json({ ok: true, service: "p_prueba_api" }));

app.get("/users", async (req, res) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("id", { ascending: true });

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

app.post("/users", async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ error: "Faltan campos: name, email" });

  const { data, error } = await supabase
    .from("users")
    .insert([{ name, email }])
    .select("*");

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API p_prueba corriendo en puerto ${port}`));

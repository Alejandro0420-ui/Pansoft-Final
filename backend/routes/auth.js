import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "tu_secret_key_segura_aqui";

export default function authRoutes(pool) {
  const router = express.Router();

  // LOGIN CON VALIDACIÓN DE CONTRASEÑA Y JWT
  router.post("/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      // Validar que los datos requeridos existan
      if (!username || !password) {
        return res
          .status(400)
          .json({ error: "Usuario y contraseña requeridos" });
      }

      // Validar longitud mínima
      if (password.length < 6) {
        return res
          .status(400)
          .json({ error: "Contraseña debe tener al menos 6 caracteres" });
      }

      // Buscar usuario en la base de datos
      const [users] = await pool.query(
        "SELECT * FROM users WHERE username = ?",
        [username],
      );


      if (users.length === 0) {
        return res
          .status(401)
          .json({ error: "Usuario o contraseña incorrectos" });
      }

      const user = users[0];

      // Validar contraseña con bcrypt
      let passwordIsValid = await bcrypt.compare(password, user.password);

      // 🔄 MIGRACIÓN: Si falla bcrypt, intentar con texto plano (usuarios antiguos)
      if (!passwordIsValid && user.password === password) {
        passwordIsValid = true;
        // Hashear y actualizar la contraseña en la BD
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query("UPDATE users SET password = ? WHERE id = ?", [
          hashedPassword,
          user.id,
        ]);
        console.log(`Contraseña migrada para usuario: ${user.username}`);
      }

      if (!passwordIsValid) {
        return res
          .status(401)
          .json({ error: "Usuario o contraseña incorrectos" });
      }

      // Generar JWT real con información segura
      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        JWT_SECRET,
        { expiresIn: "24h" }, // Token expira en 24 horas
      );

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Error en login:", error);
      res.status(500).json({ error: "Error en el servidor" });
    }
  });

  // REGISTER CON VALIDACIÓN DE USUARIO EXISTENTE Y HASH DE CONTRASEÑA
  router.post("/register", async (req, res) => {
    try {
      const { username, email, password, full_name } = req.body;

      // Validar datos requeridos
      if (!username || !email || !password || !full_name) {
        return res
          .status(400)
          .json({ error: "Todos los campos son requeridos" });
      }

      // Validar longitud de contraseña
      if (password.length < 6) {
        return res
          .status(400)
          .json({ error: "Contraseña debe tener al menos 6 caracteres" });
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Email inválido" });
      }

      // Validar si el usuario ya existe
      const [existingUsers] = await pool.query(
        "SELECT id FROM users WHERE username = ? OR email = ?",
        [username, email],
      );

      if (existingUsers.length > 0) {
        return res
          .status(409)
          .json({ error: "El usuario o email ya está registrado" });
      }

      // Hash de la contraseña con bcrypt
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Insertar usuario con rol por defecto 'employee'
      const [result] = await pool.query(
        "INSERT INTO users (username, email, password, full_name, role) VALUES (?, ?, ?, ?, ?)",
        [username, email, hashedPassword, full_name, "employee"],
      );

      // Generar token JWT para login automático
      const token = jwt.sign(
        {
          id: result.insertId,
          username,
          email,
          role: "employee",
        },
        JWT_SECRET,
        { expiresIn: "24h" },
      );

      res.json({
        success: true,
        token,
        user: {
          id: result.insertId,
          username,
          email,
          role: "employee",
        },
      });
    } catch (error) {
      console.error("Error en registro:", error);
      res.status(500).json({ error: "Error al registrar usuario" });
    }
  });

  return router;
}

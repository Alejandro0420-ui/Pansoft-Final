import express from "express";

export default function authRoutes(pool) {
  const router = express.Router();

  // Login
  router.post("/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      // Validar credenciales (para demo, acepta cualquier usuario)
      if (!username || !password) {
        return res
          .status(400)
          .json({ error: "Usuario y contraseña requeridos" });
      }

      // Check if user exists
      const [result] = await pool.query(
        "SELECT * FROM users WHERE username = ?",
        [username],
      );

      if (result.length === 0) {
        return res
          .status(401)
          .json({ error: "Usuario o contraseña incorrectos" });
      }

      const token = "token_" + Date.now(); // Token simple para demo

      res.json({
        success: true,
        token,
        user: {
          id: result[0].id,
          username: result[0].username,
          email: result[0].email,
          role: result[0].role,
        },
      });
    } catch (error) {
      console.error("Error en login:", error);
      res.status(500).json({ error: "Error en el servidor" });
    }
  });

  // Register
  router.post("/register", async (req, res) => {
    try {
      const { username, email, password, full_name } = req.body;

      const [result] = await pool.query(
        "INSERT INTO users (username, email, password, full_name) VALUES (?, ?, ?, ?)",
        [username, email, password, full_name],
      );

      res.json({
        success: true,
        user: { id: result.insertId, username, email },
      });
    } catch (error) {
      console.error("Error en registro:", error);
      res.status(500).json({ error: "Error al registrar usuario" });
    }
  });

  return router;
}

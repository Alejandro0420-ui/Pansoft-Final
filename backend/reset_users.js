import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "pansoft_db",
});

try {
  console.log("🔧 Reconfigurando usuarios...\n");

  // Eliminar usuarios antiguos
  await connection.query("DELETE FROM users");
  console.log("✅ Usuarios antiguos eliminados");

  // Crear nuevos usuarios con contraseñas válidas
  const users = [
    {
      username: "admin",
      email: "admin@pansoft.com",
      password: "password123",
      full_name: "Administrador",
      role: "admin",
    },
    {
      username: "user",
      email: "user@pansoft.com",
      password: "password123",
      full_name: "Usuario Test",
      role: "user",
    },
    {
      username: "vendedor",
      email: "vendedor@pansoft.com",
      password: "password123",
      full_name: "Juan Vendedor",
      role: "user",
    },
  ];

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);

    await connection.query(
      "INSERT INTO users (username, email, password, full_name, role) VALUES (?, ?, ?, ?, ?)",
      [user.username, user.email, hashedPassword, user.full_name, user.role],
    );

    console.log(`Usuario creado: ${user.username}`);
  }

  console.log("\nUsuarios reconfigured exitosamente");
  console.log("\nCredenciales para login:");
  console.log("- Usuario: admin | Contraseña: password123");
  console.log("- Usuario: user | Contraseña: password123");
  console.log("- Usuario: vendedor | Contraseña: password123");
} catch (error) {
  console.error("❌ Error:", error.message);
} finally {
  await connection.end();
}

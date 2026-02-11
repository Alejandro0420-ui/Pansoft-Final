import mysql from "mysql2/promise";

async function addCategoryField() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "1234",
    database: "pansoft_db",
    charset: "utf8mb4",
  });

  try {
    const query = `ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'Sin categoría'`;
    await connection.execute(query);
    console.log("✅ Campo category agregado exitosamente a suppliers");
  } catch (error) {
    if (error.code === "ER_DUP_FIELDNAME") {
      console.log("✅ Campo category ya existe en suppliers");
    } else {
      console.error("❌ Error:", error.message);
    }
  } finally {
    await connection.end();
  }
}

addCategoryField();

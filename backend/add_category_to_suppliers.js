import mysql from "mysql2/promise";

async function addCategoryColumn() {
  try {
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "Pansoft@2026",
      database: "pansoft_db",
    });

    console.log("🔧 Agregando columna category a la tabla suppliers...\n");

    const [result] = await connection.query(
      "ALTER TABLE suppliers ADD COLUMN category VARCHAR(100) DEFAULT 'Sin categoría'",
    );

    console.log("✅ Columna agregada exitosamente\n");

    // Verificar estructura
    const [columns] = await connection.query("DESCRIBE suppliers");
    console.log("Estructura actualizada de la tabla suppliers:");
    columns.forEach((col) => {
      console.log(
        `  - ${col.Field}: ${col.Type} ${col.Null === "NO" ? "NOT NULL" : "NULL"} ${col.Default ? `[DEFAULT: ${col.Default}]` : ""}`,
      );
    });

    await connection.end();
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

addCategoryColumn();

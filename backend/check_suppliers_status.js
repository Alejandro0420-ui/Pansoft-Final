import mysql from "mysql2/promise";

async function checkSupplierTable() {
  try {
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "Pansoft@2026",
      database: "pansoft_db",
    });

    console.log("🔍 Verificando estructura de la tabla suppliers\n");

    // Obtener descripción de la tabla
    const [columns] = await connection.query("DESCRIBE suppliers");
    console.log("Columnas actuales en la tabla:");
    columns.forEach((col) => {
      console.log(
        `  - ${col.Field}: ${col.Type} ${col.Null === "NO" ? "NOT NULL" : "NULL"} ${col.Key ? `[${col.Key}]` : ""}`,
      );
    });

    // Ver un proveedor actual
    const [suppliers] = await connection.query(
      "SELECT * FROM suppliers LIMIT 1",
    );
    if (suppliers.length > 0) {
      console.log("\nEjemplo de proveedor actual:");
      console.log(JSON.stringify(suppliers[0], null, 2));
    }

    await connection.end();
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

checkSupplierTable();

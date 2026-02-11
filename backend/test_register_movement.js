import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

async function testRegisterMovement() {
  let connection;
  try {
    console.log("📝 Test: Registrando movimiento de inventario...\n");

    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "pansoft_db",
    });

    // Get a product ID from the database
    const [[product]] = await connection.query(
      "SELECT id, name FROM products LIMIT 1",
    );

    if (!product) {
      console.error("❌ No hay productos en la base de datos");
      return;
    }

    console.log(`✅ Usando producto: ID ${product.id} - ${product.name}\n`);

    // Check current inventory
    console.log("1️⃣  Verificando inventario actual...");
    const [[currentInv]] = await connection.query(
      "SELECT quantity FROM inventory WHERE product_id = ?",
      [product.id],
    );

    const currentQuantity = currentInv?.quantity || 0;
    console.log(`Cantidad actual: ${currentQuantity} unidades\n`);

    // Register a movement using the API
    console.log("2️⃣  Registrando movimiento en el API...");
    const response = await fetch(
      "http://localhost:5000/api/inventory/" + product.id,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quantity: currentQuantity + 10,
          movementType: "entrada",
          reason: "Test - Compra de efectivo",
          notes: "Movimiento de prueba",
          userId: 1,
        }),
      },
    );

    const result = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(JSON.stringify(result, null, 2));

    if (!response.ok) {
      console.error("❌ Error al registrar movimiento");
      return;
    }

    console.log("✅ Movimiento registrado exitosamente\n");

    // Check if movement was recorded
    console.log("3️⃣  Verificando si el movimiento fue registrado...");
    const [[count]] = await connection.query(
      "SELECT COUNT(*) as total FROM inventory_movements WHERE product_id = ?",
      [product.id],
    );
    console.log(`Total movimientos para este producto: ${count.total}\n`);

    // Get the movement from the API
    console.log("4️⃣  Obteniendo movimientos del API...");
    const historyResponse = await fetch(
      "http://localhost:5000/api/inventory/history/all/movements",
    );
    const history = await historyResponse.json();
    console.log(`Total movimientos en BD: ${history.total}`);
    console.log(`Movimientos en respuesta: ${history.data.length}\n`);

    if (history.data.length > 0) {
      console.log("Últimos movimientos:");
      history.data.slice(0, 3).forEach((m, idx) => {
        console.log(
          `  ${idx + 1}. ${m.product_name}: ${m.quantity_change} unidades (${m.movement_type})`,
        );
      });
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testRegisterMovement();

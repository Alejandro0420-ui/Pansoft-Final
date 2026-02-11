import fetch from "node-fetch";

const BASE_URL = "http://localhost:5000";

async function testSupplyMovement() {
  try {
    console.log("🧪 Iniciando prueba de movimiento de supplies...\n");

    // 1. Obtener un supply
    console.log("1️⃣  Obteniendo supplies...");
    const suppliesRes = await fetch(`${BASE_URL}/api/supplies`);
    const supplies = await suppliesRes.json();
    
    if (supplies.length === 0) {
      console.log("❌ No hay supplies en la BD");
      return;
    }

    const supply = supplies[0];
    console.log(`   ✅ Supply encontrado: ${supply.name} (ID: ${supply.id}, Stock: ${supply.stock_quantity})\n`);

    // 2. Registrar un movimiento
    console.log("2️⃣  Registrando movimiento de entrada...");
    const newStock = supply.stock_quantity + 5;

    const updateRes = await fetch(`${BASE_URL}/api/supplies/${supply.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: supply.name,
        sku: supply.sku,
        category: supply.category,
        price: supply.price,
        quantity: newStock,  // ✨ Enviando el nuevo stock
        min_stock_level: supply.min_stock_level,
        unit: supply.unit,
        movementType: "entrada",
        reason: "Prueba de movimiento desde test",
        userId: 1,
      }),
    });

    if (!updateRes.ok) {
      const error = await updateRes.json();
      console.log(`   ❌ Error: ${error.error}`);
      return;
    }

    const updateData = await updateRes.json();
    console.log(`   ✅ Movimiento registrado`);
    console.log(`   📊 ${supply.stock_quantity} → ${newStock} (+5)`);
    console.log(`   Response:`, JSON.stringify(updateData.data?.movement || updateData.movement, null, 2));
    console.log();

    // 3. Obtener historial de movimientos
    console.log("3️⃣  Obteniendo historial de supplies...");
    const historyRes = await fetch(
      `${BASE_URL}/api/supplies/history/all/movements?limit=10`
    );
    const historyData = await historyRes.json();

    if (historyData.data && historyData.data.length > 0) {
      console.log(`   ✅ Historial cargado (${historyData.data.length} movimientos):`);
      historyData.data.slice(0, 3).forEach((m) => {
        console.log(
          `      • ${m.supply_name}: ${m.quantity_change > 0 ? "+" : ""}${m.quantity_change} ` +
          `(${m.previous_quantity} → ${m.new_quantity}) - ${m.movement_type}`
        );
      });
    } else {
      console.log(`   ⚠️  No hay historial disponible`);
    }

    console.log("\n✅ Prueba completada exitosamente");
  } catch (error) {
    console.error("❌ Error en prueba:", error.message);
  }
}

// Esperar a que el servidor esté listo
setTimeout(testSupplyMovement, 1000);

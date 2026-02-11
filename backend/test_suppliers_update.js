import fetch from "node-fetch";

async function testSuppliersUpdate() {
  try {
    console.log("🧪 Testando actualización de proveedor\n");

    // Primero obtener todos los proveedores
    console.log("1️⃣ GET /api/suppliers");
    const getRes = await fetch("http://localhost:5000/api/suppliers");
    if (!getRes.ok) {
      console.error(`   ❌ Error: ${getRes.status}`);
      process.exit(1);
    }
    const suppliers = await getRes.json();
    console.log(`   ✅ Proveedores encontrados: ${suppliers.length}`);

    if (suppliers.length === 0) {
      console.error("   ❌ No hay proveedores para probar");
      process.exit(1);
    }

    const supplier = suppliers[0];
    console.log(`   Proveedor seleccionado: ${supplier.company_name}`);
    console.log(`   ID: ${supplier.id}`);
    console.log(
      `   Category actual: ${supplier.category || "NULL/undefined"}\n`,
    );

    // Preparar datos para update (similar a como lo hace el frontend)
    const updateData = {
      company_name: supplier.company_name,
      contact_person: supplier.contact_person || "",
      email: supplier.email || "",
      phone: supplier.phone || "",
      address: supplier.address || "",
      city: supplier.city || "",
      country: supplier.country || "",
      payment_terms: supplier.payment_terms || "",
      category: supplier.category || "", // Esto podría ser vacío
    };

    console.log("2️⃣ PUT /api/suppliers/" + supplier.id + " con datos:");
    console.log(JSON.stringify(updateData, null, 2));
    console.log();

    // Hacer el PUT
    const putRes = await fetch(
      `http://localhost:5000/api/suppliers/${supplier.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      },
    );

    console.log(`   Status: ${putRes.status}`);

    if (!putRes.ok) {
      const error = await putRes.text();
      console.error(`   ❌ Error en respuesta:`);
      console.error(error);
      process.exit(1);
    }

    const result = await putRes.json();
    console.log(`   ✅ Actualización exitosa:`);
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

testSuppliersUpdate();

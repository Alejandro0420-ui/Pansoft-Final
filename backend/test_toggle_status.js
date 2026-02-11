import fetch from "node-fetch";

async function testToggleStatus() {
  try {
    console.log("🧪 Testando toggle status de empleado\n");

    // Primero obtener un empleado
    console.log("1️⃣ GET /api/employees/3");
    const getRes = await fetch("http://localhost:5000/api/employees/3");
    if (!getRes.ok) {
      console.error(`   ❌ Error: ${getRes.status}`);
      process.exit(1);
    }
    const emp = await getRes.json();
    console.log(
      `   ✅ Empleado encontrado: ${emp.first_name} ${emp.last_name}`,
    );
    console.log(`   Estado actual: ${emp.status}\n`);

    // Preparar datos para update
    const newStatus = emp.status === "active" ? "inactive" : "active";
    const updateData = {
      first_name: emp.first_name,
      last_name: emp.last_name,
      email: emp.email,
      phone: emp.phone,
      position: emp.position,
      department: emp.department,
      hire_date:
        emp.hire_date && emp.hire_date.includes("T")
          ? emp.hire_date.split("T")[0]
          : emp.hire_date,
      salary: emp.salary || 0,
      status: newStatus,
    };

    console.log("2️⃣ PUT /api/employees/3 con datos:");
    console.log(JSON.stringify(updateData, null, 2));
    console.log();

    // Hacer el PUT
    const putRes = await fetch("http://localhost:5000/api/employees/3", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData),
    });

    console.log(`   Status: ${putRes.status}`);

    if (!putRes.ok) {
      const error = await putRes.text();
      console.error(`   ❌ Error en respuesta:`);
      console.error(error);
      process.exit(1);
    }

    const result = await putRes.json();
    console.log(`   ✅ Actualizado exitosamente`);
    console.log(`   Nuevo estado: ${result.status}\n`);

    console.log("✨ Toggle status funcionando correctamente!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }

  process.exit(0);
}

testToggleStatus();

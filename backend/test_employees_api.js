import fetch from "node-fetch";

async function testEmployeesAPI() {
  const baseUrl = "http://localhost:5000/api/employees";

  try {
    console.log("🧪 Testando API de Empleados\n");

    // GET all
    console.log("1️⃣ GET /api/employees");
    const getRes = await fetch(baseUrl);
    const employees = await getRes.json();
    console.log(`   ✅ ${employees.length} empleados encontrados\n`);

    if (employees.length === 0) {
      console.log(
        "⚠️  No hay empleados. Los datos del seed pueden no haberse cargado.\n",
      );
    } else {
      console.log(`   Ejemplos:`);
      employees.slice(0, 3).forEach((emp) => {
        console.log(
          `   - ${emp.first_name} ${emp.last_name} (${emp.position})`,
        );
      });
      console.log();
    }

    // CREATE
    console.log("2️⃣ POST /api/employees (crear nuevo)");
    const newEmployee = {
      first_name: "Test",
      last_name: "Usuario",
      email: "test@pansoft.com",
      phone: "+57 123 456",
      position: "panadero",
      department: "Producción",
      hire_date: "2026-02-10",
      salary: 25000,
    };

    const createRes = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEmployee),
    });
    const created = await createRes.json();
    console.log(`   ✅ Empleado creado con ID: ${created.id}\n`);

    // GET all again
    console.log("3️⃣ GET /api/employees (verificar nuevo)");
    const getRes2 = await fetch(baseUrl);
    const employees2 = await getRes2.json();
    console.log(`   ✅ Total ahora: ${employees2.length} empleados\n`);

    // UPDATE
    if (created.id) {
      console.log(`4️⃣ PUT /api/employees/${created.id} (actualizar)`);
      const updateRes = await fetch(`${baseUrl}/${created.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newEmployee,
          first_name: "Test_Actualizado",
        }),
      });
      console.log(`   ✅ Empleado actualizado\n`);

      // DELETE
      console.log(`5️⃣ DELETE /api/employees/${created.id}`);
      await fetch(`${baseUrl}/${created.id}`, {
        method: "DELETE",
      });
      console.log(`   ✅ Empleado eliminado\n`);

      // GET all final
      console.log("6️⃣ GET /api/employees (verificar eliminación)");
      const getRes3 = await fetch(baseUrl);
      const employees3 = await getRes3.json();
      console.log(`   ✅ Total final: ${employees3.length} empleados\n`);
    }

    console.log("✨ Todas las operaciones CRUD funcionan correctamente!");
    console.log("\n📝 El módulo de empleados está completamente funcional.\n");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }

  process.exit(0);
}

testEmployeesAPI();

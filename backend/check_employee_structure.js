import fetch from "node-fetch";

async function checkEmployeeStructure() {
  try {
    console.log("🔍 Verificando estructura de empleados desde API\n");

    const res = await fetch("http://localhost:5000/api/employees");
    const employees = await res.json();

    if (employees.length > 0) {
      console.log("📋 Estructura del primer empleado:");
      console.log(JSON.stringify(employees[0], null, 2));
    } else {
      console.log("⚠️ No hay empleados");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
  process.exit(0);
}

checkEmployeeStructure();

const API_BASE_URL = "http://localhost:5000/api";

async function apiCall(endpoint, method = "GET", body = null) {
  const url = `${API_BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body) options.body = JSON.stringify(body);

  console.log(`\n📤 ${method} ${url}`);
  console.log("Payload:", body);

  const res = await fetch(url, options);
  const data = await res.json();

  console.log(`📥 Status: ${res.status}`);
  console.log("Response:", data);

  if (!res.ok) {
    throw new Error(data.error || `Error ${res.status}`);
  }
  return data;
}

async function testProductionOrder() {
  try {
    console.log("\n🧪 TEST DETALLADO: CREAR ORDEN DE PRODUCCIÓN");

    // Obtener productos
    const products = await apiCall("/products");
    const product = products[0];
    console.log(
      `\n✅ Producto seleccionado: ${product.name} (ID: ${product.id})`,
    );

    // Obtener empleados
    const employees = await apiCall("/employees");
    const employee = employees[0];
    console.log(
      `✅ Empleado seleccionado: ${employee.first_name} ${employee.last_name} (ID: ${employee.id})`,
    );

    // Crear orden de producción
    console.log("\n📦 CREANDO ORDEN DE PRODUCCIÓN...");
    const payload = {
      product_id: product.id,
      quantity: 50,
      responsible_employee_id: employee.id,
      due_date: null,
      notes: "Prueba desde script",
      insumos: [],
    };

    const result = await apiCall("/production-orders", "POST", payload);

    console.log("\n✅ ORDEN CREADA EXITOSAMENTE");
    console.log(`Order Number: ${result.order_number}`);
    console.log(`Status: ${result.status}`);

    // Verificar que se guardó
    console.log("\n🔍 VERIFICANDO QUE SE GUARDÓ EN LA BD...");
    const orders = await apiCall("/production-orders");
    const newOrder = orders.find((o) => o.order_number === result.order_number);

    if (newOrder) {
      console.log("✅ ORDEN ENCONTRADA EN LA BD");
      console.log("Datos:", newOrder);
    } else {
      console.log("❌ ORDEN NO ENCONTRADA EN LA BD");
    }
  } catch (error) {
    console.error("\n❌ ERROR:", error.message);
  }
}

testProductionOrder();

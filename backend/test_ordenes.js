const API_BASE_URL = "http://localhost:5000/api";

async function apiCall(endpoint, method = "GET", body = null) {
  const url = `${API_BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(url, options);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Error ${res.status}`);
  }
  return data;
}

async function testAordenes() {
  try {
    console.log("\n🧪 PRUEBA 1: Verificar que las APIs respondan");

    // Verificar que el backend está corriendo
    const health = await api.get("/health");
    console.log("✅ Backend respondiendo:", health.status === 200);

    console.log("\n🧪 PRUEBA 2: Obtener productos");
    const productsRes = await api.get("/products");
    console.log(
      `✅ Productos cargados: ${productsRes.data.length} encontrados`,
    );
    console.log("Ejemplo:", productsRes.data[0]);

    console.log("\n🧪 PRUEBA 3: Obtener empleados");
    const employeesRes = await api.get("/employees");
    console.log(
      `✅ Empleados cargados: ${employeesRes.data.length} encontrados`,
    );
    console.log("Ejemplo:", employeesRes.data[0]);

    console.log("\n🧪 PRUEBA 4: Obtener órdenes de venta existentes");
    const salesRes = await api.get("/sales-orders");
    console.log(`✅ Órdenes de venta: ${salesRes.data.length} encontradas`);

    console.log("\n🧪 PRUEBA 5: Obtener órdenes de producción existentes");
    const prodRes = await api.get("/production-orders");
    console.log(`✅ Órdenes de producción: ${prodRes.data.length} encontradas`);
    if (prodRes.data.length > 0) {
      console.log("Ejemplo:", prodRes.data[0]);
    }

    console.log("\n🧪 PRUEBA 6: Crear orden de VENTA");
    const salePayload = {
      customer_name: "Cliente Test 001",
      delivery_date: null,
      total_amount: 0,
      items: [
        {
          product_id: productsRes.data[0].id,
          quantity: 5,
          product_name: productsRes.data[0].name,
        },
      ],
      supplies: [],
    };

    const newSale = await api.post("/sales-orders", salePayload);
    console.log("✅ Orden de venta creada:", newSale.data.order_number);

    console.log("\n🧪 PRUEBA 7: Crear orden de PRODUCCIÓN");
    const prodPayload = {
      product_id: productsRes.data[0].id,
      quantity: 100,
      responsible_employee_id: employeesRes.data[0].id,
      due_date: null,
      notes: "Prueba automática",
      insumos: [],
    };

    const newProd = await api.post("/production-orders", prodPayload);
    console.log("✅ Orden de producción creada:", newProd.data.order_number);

    console.log("\n✅ ¡TODAS LAS PRUEBAS PASARON!");
    console.log(
      "Las órdenes de venta y producción están funcionando correctamente.",
    );
  } catch (error) {
    console.error("\n❌ ERROR:", error.response?.data?.error || error.message);
    console.error("Detalles:", error.response?.data);
  }
}

testAordenes();

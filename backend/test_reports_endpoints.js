import fetch from "node-fetch";

const baseUrl = "http://localhost:5000/api";

async function testReports() {
  try {
    console.log("🧪 Testando endpoints de reportes...\n");

    // Test Summary
    console.log("📊 GET /reports/summary");
    const summaryRes = await fetch(`${baseUrl}/reports/summary`);
    const summaryData = await summaryRes.json();
    console.log(JSON.stringify(summaryData, null, 2), "\n");

    // Test Sales
    console.log("📈 GET /reports/sales");
    const salesRes = await fetch(`${baseUrl}/reports/sales`);
    const salesData = await salesRes.json();
    console.log(
      `Registros: ${Array.isArray(salesData) ? salesData.length : "N/A"}\n`,
    );

    // Test Sales Orders
    console.log("💼 GET /reports/sales-orders");
    const ordersRes = await fetch(`${baseUrl}/reports/sales-orders`);
    const ordersData = await ordersRes.json();
    console.log(
      `Registros: ${Array.isArray(ordersData) ? ordersData.length : "N/A"}\n`,
    );

    // Test Production Orders
    console.log("⚙️ GET /reports/production-orders");
    const prodRes = await fetch(`${baseUrl}/reports/production-orders`);
    const prodData = await prodRes.json();
    console.log(
      `Registros: ${Array.isArray(prodData) ? prodData.length : "N/A"}\n`,
    );

    // Test Products
    console.log("📦 GET /reports/products");
    const productsRes = await fetch(`${baseUrl}/reports/products`);
    const productsData = await productsRes.json();
    console.log(
      `Registros: ${Array.isArray(productsData) ? productsData.length : "N/A"}\n`,
    );

    // Test Inventory
    console.log("🏪 GET /reports/inventory");
    const invRes = await fetch(`${baseUrl}/reports/inventory`);
    const invData = await invRes.json();
    console.log(
      `Registros: ${Array.isArray(invData) ? invData.length : "N/A"}\n`,
    );

    console.log("✅ Todos los endpoints están respondiendo!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
  process.exit(0);
}

testReports();

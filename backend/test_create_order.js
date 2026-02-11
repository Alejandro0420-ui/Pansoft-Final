async function testCreateOrder() {
  try {
    console.log("Testing POST /sales-orders...");
    const response = await fetch("http://localhost:5000/api/sales-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_name: "Panadería Test",
        total_amount: 150000,
        delivery_date: "2026-02-15",
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✓ Success:", data);
    } else {
      console.error("✗ Error:", data);
    }
  } catch (error) {
    console.error("✗ Error:", error.message);
  }
}

testCreateOrder();

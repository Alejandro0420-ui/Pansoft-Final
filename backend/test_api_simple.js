async function testAPI() {
  try {
    console.log("Testing GET /sales-orders...");
    const response = await fetch("http://localhost:5000/api/sales-orders");
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

testAPI();

const testData = {
  product_name: "Donas Glaseadas",
  quantity: 20,
  responsible_employee_id: 1,
};

console.log("📤 Enviando petición POST a /api/production-orders");
console.log("📋 Datos:", JSON.stringify(testData, null, 2));

try {
  const response = await fetch("http://localhost:3000/api/production-orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(testData),
  });

  const data = await response.json();
  console.log("Status:", response.status);
  if (response.status === 201 || response.status === 200) {
    console.log("✅ Éxito");
    console.log("📦 Response:", JSON.stringify(data, null, 2));
  } else {
    console.log("❌ Error");
    console.log("❌ Error Message:", data.error);
    console.log("❌ Full Response:", JSON.stringify(data, null, 2));
  }
} catch (error) {
  console.log("❌ Network Error:", error.message);
}

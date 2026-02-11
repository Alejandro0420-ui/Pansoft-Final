import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

async function checkData() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "pansoft_db",
  });

  try {
    console.log("📊 Verificando datos en la base de datos:\n");

    // Clientes
    const [customers] = await connection.query(
      "SELECT id, name FROM customers ORDER BY id",
    );
    console.log(`\n👥 CLIENTES (${customers.length}):`);
    customers.forEach((c) => console.log(`  [${c.id}] ${c.name}`));

    // Empleados
    const [employees] = await connection.query(
      "SELECT id, first_name, last_name FROM employees ORDER BY id",
    );
    console.log(`\n👷 EMPLEADOS (${employees.length}):`);
    employees.forEach((e) =>
      console.log(`  [${e.id}] ${e.first_name} ${e.last_name}`),
    );

    // Productos
    const [products] = await connection.query(
      "SELECT id, name FROM products ORDER BY id",
    );
    console.log(`\n📦 PRODUCTOS (${products.length}):`);
    products.forEach((p) => console.log(`  [${p.id}] ${p.name}`));

    // Sales Orders
    const [salesOrders] = await connection.query(
      "SELECT id, order_number, customer_id FROM sales_orders ORDER BY id",
    );
    console.log(`\n💼 ÓRDENES DE VENTA (${salesOrders.length}):`);
    salesOrders.forEach((so) =>
      console.log(
        `  [${so.id}] ${so.order_number} - Customer: ${so.customer_id}`,
      ),
    );

    // Production Orders
    const [prodOrders] = await connection.query(
      "SELECT id, order_number, product_id FROM production_orders ORDER BY id",
    );
    console.log(`\n⚙️ ÓRDENES DE PRODUCCIÓN (${prodOrders.length}):`);
    prodOrders.forEach((po) =>
      console.log(
        `  [${po.id}] ${po.order_number} - Product: ${po.product_id}`,
      ),
    );

    // Supplies
    const [supplies] = await connection.query(
      "SELECT id, name FROM supplies ORDER BY id",
    );
    console.log(`\n🛠️ INSUMOS (${supplies.length}):`);
    supplies.forEach((s) => console.log(`  [${s.id}] ${s.name}`));
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await connection.end();
  }
}

checkData();

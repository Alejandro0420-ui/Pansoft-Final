import express from "express";

export default function employeesRoutes(pool) {
  const router = express.Router();

  // Get all employees
  router.get("/", async (req, res) => {
    try {
      const [result] = await pool.query(
        "SELECT * FROM employees ORDER BY last_name, first_name",
      );
      res.json(result);
    } catch (error) {
      console.error("Error al obtener empleados:", error);
      res.status(500).json({ error: "Error al obtener empleados" });
    }
  });

  // Get employee by ID
  router.get("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const [result] = await pool.query(
        "SELECT * FROM employees WHERE id = ?",
        [id],
      );
      res.json(result[0] || {});
    } catch (error) {
      console.error("Error al obtener empleado:", error);
      res.status(500).json({ error: "Error al obtener empleado" });
    }
  });

  // Create employee
  router.post("/", async (req, res) => {
    try {
      const {
        first_name,
        last_name,
        email,
        phone,
        position,
        department,
        hire_date,
        salary,
      } = req.body;
      const [result] = await pool.query(
        "INSERT INTO employees (first_name, last_name, email, phone, position, department, hire_date, salary) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          first_name,
          last_name,
          email,
          phone,
          position,
          department,
          hire_date,
          salary,
        ],
      );
      res.status(201).json({
        id: result.insertId,
        first_name,
        last_name,
        email,
        phone,
        position,
        department,
        hire_date,
        salary,
      });
    } catch (error) {
      console.error("Error al crear empleado:", error);
      res.status(500).json({ error: "Error al crear empleado" });
    }
  });

  // Update employee
  router.put("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const {
        first_name,
        last_name,
        email,
        phone,
        position,
        department,
        hire_date,
        salary,
        status,
      } = req.body;

      // Usar "active" como valor por defecto si no viene status
      const employeeStatus = status || "active";

      await pool.query(
        "UPDATE employees SET first_name=?, last_name=?, email=?, phone=?, position=?, department=?, hire_date=?, salary=?, status=?, updated_at=NOW() WHERE id=?",
        [
          first_name,
          last_name,
          email,
          phone,
          position,
          department,
          hire_date,
          salary,
          employeeStatus,
          id,
        ],
      );
      res.json({
        id,
        first_name,
        last_name,
        email,
        phone,
        position,
        department,
        hire_date,
        salary,
        status: employeeStatus,
      });
    } catch (error) {
      console.error("Error al actualizar empleado:", error);
      res.status(500).json({ error: "Error al actualizar empleado" });
    }
  });

  // Delete employee
  router.delete("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query("DELETE FROM employees WHERE id = ?", [id]);
      res.json({ success: true });
    } catch (error) {
      console.error("Error al eliminar empleado:", error);
      res.status(500).json({ error: "Error al eliminar empleado" });
    }
  });

  return router;
}

import { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, User, Loader } from "lucide-react";
import { toast } from "sonner";
import { employeesAPI } from "../services/api";
import "bootstrap/dist/css/bootstrap.min.css";

const POSITIONS = [
  { value: "administrador", label: "Administrador General" },
  { value: "encargado_ventas", label: "Encargado de Ventas" },
  { value: "supervisor_stock", label: "Supervisor de Stock" },
  { value: "panadero", label: "Panadero" },
];

const DEPARTMENTS = ["Administración", "Ventas", "Inventario", "Producción"];

const POSITION_COLORS = {
  administrador: "#EA7028",
  encargado_ventas: "#EBA94D",
  supervisor_stock: "#EBCC83",
  panadero: "#EBB583",
};

export function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    hire_date: "",
    salary: 0,
    password: "",
  });

  // Cargar empleados al montar
  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeesAPI.getAll();
      // Normalizar posiciones a minúsculas y fechas
      const normalizedData = (response.data || []).map((emp) => ({
        ...emp,
        position: emp.position ? emp.position.toLowerCase() : "",
        hire_date: emp.hire_date ? emp.hire_date.split("T")[0] : "",
      }));
      setEmployees(normalizedData);
    } catch (error) {
      console.error("Error al cargar empleados:", error);
      toast.error("Error al cargar empleados");
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    // Filtrar por estado (activo/inactivo)
    if (!showInactive && emp.status !== "active") return false;
    if (showInactive && emp.status !== "inactive") return false;

    const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase();
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.position?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      position: "",
      department: "",
      hire_date: "",
      salary: 0,
      password: "",
    });
    setEditingEmployee(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (emp) => {
    setEditingEmployee(emp);
    setFormData({
      first_name: emp.first_name,
      last_name: emp.last_name,
      email: emp.email,
      phone: emp.phone,
      position: emp.position || "",
      department: emp.department,
      hire_date: emp.hire_date || "",
      salary: emp.salary || 0,
      password: "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (
      !formData.first_name ||
      !formData.last_name ||
      !formData.email ||
      !formData.position ||
      !formData.department ||
      !formData.hire_date
    ) {
      toast.error("Complete todos los campos requeridos");
      return;
    }

    try {
      if (editingEmployee) {
        // Actualizar
        const updateData = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
          position: formData.position,
          department: formData.department,
          hire_date: formData.hire_date,
          salary: formData.salary,
        };
        await employeesAPI.update(editingEmployee.id, updateData);
        toast.success("Empleado actualizado");
      } else {
        // Crear
        const createData = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
          position: formData.position,
          department: formData.department,
          hire_date: formData.hire_date,
          salary: formData.salary,
        };
        await employeesAPI.create(createData);
        toast.success("Empleado creado exitosamente");
      }

      await loadEmployees();
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error("Error al guardar:", error);
      toast.error("Error al guardar el empleado");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Está seguro de que desea eliminar este empleado?")) {
      try {
        await employeesAPI.delete(id);
        toast.success("Empleado eliminado");
        await loadEmployees();
      } catch (error) {
        console.error("Error al eliminar:", error);
        toast.error("Error al eliminar el empleado");
      }
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const emp = employees.find((e) => e.id === id);
      if (!emp) {
        toast.error("Empleado no encontrado");
        return;
      }

      const newStatus = currentStatus === "active" ? "inactive" : "active";
      const updateData = {
        first_name: emp.first_name,
        last_name: emp.last_name,
        email: emp.email,
        phone: emp.phone,
        position: emp.position,
        department: emp.department,
        hire_date: emp.hire_date,
        salary: emp.salary || 0,
        status: newStatus,
      };

      await employeesAPI.update(id, updateData);
      toast.success(
        `Empleado ${newStatus === "active" ? "activado" : "desactivado"}`,
      );
      await loadEmployees();
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      toast.error("Error al cambiar el estado");
    }
  };

  const getStats = () => ({
    total: employees.filter((e) => e.status === "active").length,
    active: employees.filter((e) => e.status === "active").length,
    byPosition: POSITIONS.reduce(
      (acc, p) => ({
        ...acc,
        [p.value]: employees.filter(
          (e) => e.position === p.value && e.status === "active",
        ).length,
      }),
      {},
    ),
  });

  const stats = getStats();

  if (loading) {
    return (
      <div
        className="p-4 d-flex justify-content-center align-items-center"
        style={{ height: "80vh" }}
      >
        <div className="text-center">
          <Loader
            size={48}
            className="mb-3"
            style={{ animation: "spin 1s linear infinite" }}
          />
          <p className="text-muted">Cargando empleados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="mb-1">Gestión de Empleados</h1>
          <p className="text-muted">Administre empleados, roles y permisos</p>
        </div>
        <button
          onClick={openAddModal}
          className="btn"
          style={{ backgroundColor: "#EA7028", color: "white" }}
        >
          <Plus size={18} className="me-2" style={{ display: "inline" }} />
          Nuevo Empleado
        </button>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4 g-3">
        <div className="col-md-3 col-sm-6">
          <div
            className="card border-0 shadow-sm"
            style={{ borderTop: `4px solid #EA7028` }}
          >
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <small className="text-muted d-block">Total Empleados</small>
                <h4 className="mb-0">{stats.total}</h4>
              </div>
              <User size={32} color="#EA7028" />
            </div>
          </div>
        </div>
        {POSITIONS.map((p) => (
          <div key={p.value} className="col-md-3 col-sm-6">
            <div
              className="card border-0 shadow-sm"
              style={{ borderTop: `4px solid ${POSITION_COLORS[p.value]}` }}
            >
              <div className="card-body d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted d-block">{p.label}</small>
                  <h4 className="mb-0">{stats.byPosition[p.value]}</h4>
                </div>
                <User size={28} color={POSITION_COLORS[p.value]} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <div className="mb-4">
            <div className="d-flex gap-2 align-items-center mb-3">
              <div className="input-group flex-grow-1">
                <span className="input-group-text bg-white border-end-0">
                  <Search size={18} color="#999" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Buscar por nombre, email o rol..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                className={`btn ${showInactive ? "btn-danger" : "btn-outline-secondary"}`}
                onClick={() => setShowInactive(!showInactive)}
                title={
                  showInactive ? "Mostrando inactivos" : "Mostrar inactivos"
                }
              >
                {showInactive ? "Inactivos" : "Activos"}
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead style={{ backgroundColor: "#EBB583" }}>
                <tr>
                  <th>Empleado</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Posición</th>
                  <th>Departamento</th>
                  <th>Ingreso</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center text-muted py-4">
                      No hay empleados registrados
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="align-middle">
                      <td>
                        <div className="d-flex align-items-center">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center me-2"
                            style={{
                              width: "40px",
                              height: "40px",
                              backgroundColor:
                                POSITION_COLORS[emp.position] || "#ccc",
                            }}
                          >
                            <span className="text-white fw-bold">
                              {`${emp.first_name.charAt(0)}${emp.last_name.charAt(0)}`.toUpperCase()}
                            </span>
                          </div>
                          {emp.first_name} {emp.last_name}
                        </div>
                      </td>
                      <td>{emp.email}</td>
                      <td>{emp.phone || "—"}</td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            backgroundColor:
                              POSITION_COLORS[emp.position] || "#ccc",
                            color: "white",
                          }}
                        >
                          {POSITIONS.find((p) => p.value === emp.position)
                            ?.label || emp.position}
                        </span>
                      </td>
                      <td>{emp.department}</td>
                      <td>
                        {emp.hire_date
                          ? new Date(emp.hire_date).toLocaleDateString("es-ES")
                          : "—"}
                      </td>
                      <td>
                        <span
                          className={`badge ${emp.status === "active" ? "bg-success" : "bg-secondary"}`}
                        >
                          {emp.status === "active" ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => openEditModal(emp)}
                          className="btn btn-sm btn-outline-primary me-2"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => toggleStatus(emp.id, emp.status)}
                          className={`btn btn-sm me-2 ${emp.status === "active" ? "btn-outline-danger" : "btn-outline-success"}`}
                        >
                          {emp.status === "active" ? "Desactivar" : "Activar"}
                        </button>
                        <button
                          onClick={() => handleDelete(emp.id)}
                          className="btn btn-sm btn-outline-danger"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          role="dialog"
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            role="document"
          >
            <div className="modal-content">
              <div className="modal-header border-bottom-0">
                <h5 className="modal-title">
                  {editingEmployee ? "Editar Empleado" : "Agregar Empleado"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Nombre *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.first_name}
                      onChange={(e) =>
                        setFormData({ ...formData, first_name: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Apellido *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.last_name}
                      onChange={(e) =>
                        setFormData({ ...formData, last_name: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Teléfono</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Salario</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.salary}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          salary: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Fecha de Ingreso *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.hire_date}
                      onChange={(e) =>
                        setFormData({ ...formData, hire_date: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Posición *</label>
                    <select
                      className="form-select"
                      value={formData.position}
                      onChange={(e) =>
                        setFormData({ ...formData, position: e.target.value })
                      }
                    >
                      <option value="">Seleccione posición</option>
                      {POSITIONS.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Departamento *</label>
                    <select
                      className="form-select"
                      value={formData.department}
                      onChange={(e) =>
                        setFormData({ ...formData, department: e.target.value })
                      }
                    >
                      <option value="">Seleccione departamento</option>
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  {!editingEmployee && (
                    <div className="col-12">
                      <label className="form-label">Contraseña Inicial *</label>
                      <input
                        type="password"
                        className="form-control"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                      />
                      <small className="text-muted">
                        El empleado deberá cambiarla en su primer acceso
                      </small>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer border-top-0">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn"
                  style={{ backgroundColor: "#EA7028", color: "white" }}
                  onClick={handleSave}
                >
                  {editingEmployee ? "Guardar Cambios" : "Crear Empleado"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

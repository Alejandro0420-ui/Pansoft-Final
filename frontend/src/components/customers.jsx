import { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { customersAPI } from "../services/api";

// Fallback a un mock si no existe la API
const mockCustomers = [
  {
    id: 1,
    name: "Panadería La Mansión",
    email: "contact@lamansion.com",
    phone: "+57 (1) 2345-6789",
    city: "Bogotá",
    country: "Colombia",
    status: "active",
  },
  {
    id: 2,
    name: "Pastelería Artesanal",
    email: "info@pasteleria.com",
    phone: "+57 300 456 7890",
    city: "Medellín",
    country: "Colombia",
    status: "active",
  },
  {
    id: 3,
    name: "Panadería Central",
    email: "hello@panacentral.com",
    phone: "+57 (2) 3456-7890",
    city: "Cali",
    country: "Colombia",
    status: "active",
  },
];

export function Customers() {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    customer_type: "B2B",
    status: "active",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      try {
        const response = await customersAPI.getAll();
        setCustomers(response.data || mockCustomers);
      } catch {
        setCustomers(mockCustomers);
      }
    } catch (error) {
      console.error("Error cargando clientes:", error);
      setError("Error al cargar clientes");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (customer = null) => {
    if (customer) {
      setEditingId(customer.id);
      setFormData(customer);
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        country: "",
        customer_type: "B2B",
        status: "active",
      });
    }
    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setError("");
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Nombre es requerido");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email es requerido");
      return false;
    }
    return true;
  };

  const handleSaveCustomer = async () => {
    if (!validateForm()) return;

    try {
      if (editingId) {
        // Actualizar localmente si no existe API
        setCustomers(
          customers.map((c) =>
            c.id === editingId ? { ...formData, id: editingId } : c,
          ),
        );
        try {
          await customersAPI.update(editingId, formData);
        } catch {
          // API no disponible, usar estado local
        }
      } else {
        // Crear localmente
        const newCustomer = { ...formData, id: Date.now() };
        setCustomers([...customers, newCustomer]);
        try {
          await customersAPI.create(formData);
          loadCustomers();
        } catch {
          // API no disponible
        }
      }
      closeModal();
    } catch (error) {
      console.error("Error guardando cliente:", error);
      setError("Error al guardar cliente");
    }
  };

  const handleDeleteCustomer = async (id) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este cliente?")) return;
    try {
      setCustomers(customers.filter((c) => c.id !== id));
      try {
        await customersAPI.delete(id);
      } catch {
        // API no disponible
      }
    } catch (error) {
      console.error("Error eliminando cliente:", error);
      setError("Error al eliminar cliente");
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      (customer.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.email || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>Clientes</h1>
          <p className="text-muted">Gestiona la base de datos de clientes</p>
        </div>
        <button
          className="btn btn-danger d-flex align-items-center gap-2"
          onClick={() => openModal()}
        >
          <Plus size={20} />
          Nuevo Cliente
        </button>
      </div>

      {error && (
        <div
          className="alert alert-warning alert-dismissible fade show"
          role="alert"
        >
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError("")}
          ></button>
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Buscar cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Ciudad</th>
                <th>País</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-3">
                    Cargando...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center text-muted py-3">
                    No hay clientes disponibles
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <strong>{customer.name}</strong>
                    </td>
                    <td>{customer.email}</td>
                    <td>{customer.phone}</td>
                    <td>{customer.city}</td>
                    <td>{customer.country}</td>
                    <td>
                      <span className="badge bg-info">
                        {customer.customer_type}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge bg-${customer.status === "active" ? "success" : "secondary"}`}
                      >
                        {customer.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => openModal(customer)}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteCustomer(customer.id)}
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

      {/* Modal */}
      {showModal && (
        <div
          className="modal d-block"
          onClick={closeModal}
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div
            className="modal-dialog modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingId ? "Editar Cliente" : "Nuevo Cliente"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Nombre *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
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
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Teléfono</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={formData.phone || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Dirección</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.address || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Ciudad</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.city || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">País</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.country || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, country: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Tipo de Cliente</label>
                      <select
                        className="form-control"
                        value={formData.customer_type}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            customer_type: e.target.value,
                          })
                        }
                      >
                        <option value="B2B">B2B</option>
                        <option value="B2C">B2C</option>
                        <option value="Mayorista">Mayorista</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Estado</label>
                      <select
                        className="form-control"
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({ ...formData, status: e.target.value })
                        }
                      >
                        <option value="active">Activo</option>
                        <option value="inactive">Inactivo</option>
                        <option value="suspended">Suspendido</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleSaveCustomer}
                >
                  {editingId ? "Actualizar" : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

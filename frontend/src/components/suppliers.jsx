import { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Mail,
  Phone,
  MapPin,
  Truck,
  UserCheck,
  DollarSign,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";
const suppliersAPI = {
  getAll: () => axios.get(`${API_URL}/suppliers`),
  create: (data) => axios.post(`${API_URL}/suppliers`, data),
  update: (id, data) => axios.put(`${API_URL}/suppliers/${id}`, data),
  delete: (id) => axios.delete(`${API_URL}/suppliers/${id}`),
};

export function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    company_name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    payment_terms: "",
    category: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const response = await suppliersAPI.getAll();
      setSuppliers(response.data || []);
    } catch (error) {
      console.error("Error cargando proveedores:", error);
      setError("Error al cargar proveedores");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (supplier = null) => {
    if (supplier) {
      setEditingId(supplier.id);
      setFormData(supplier);
    } else {
      setEditingId(null);
      setFormData({
        company_name: "",
        contact_person: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        country: "",
        payment_terms: "",
        category: "",
      });
    }
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setError("");
    setSuccess("");
  };

  const validateForm = () => {
    if (!formData.company_name.trim()) {
      setError("Nombre de empresa es requerido");
      return false;
    }
    if (!formData.contact_person.trim()) {
      setError("Persona de contacto es requerida");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Correo electrónico es requerido");
      return false;
    }
    if (!formData.phone.trim()) {
      setError("Teléfono es requerido");
      return false;
    }
    return true;
  };

  const handleSaveSupplier = async () => {
    if (!validateForm()) {
      window.scrollTo(0, 0);
      return;
    }

    try {
      if (editingId) {
        await suppliersAPI.update(editingId, formData);
        setSuccess("Proveedor actualizado exitosamente");
      } else {
        await suppliersAPI.create(formData);
        setSuccess("Proveedor agregado exitosamente");
      }
      setTimeout(() => {
        closeModal();
        loadSuppliers();
      }, 1000);
    } catch (error) {
      console.error("Error guardando proveedor:", error);
      setError("Error al guardar proveedor");
    }
  };

  const handleDeleteSupplier = async (id, name) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar a ${name}?`))
      return;
    try {
      await suppliersAPI.delete(id);
      setSuccess("Proveedor eliminado exitosamente");
      setTimeout(() => {
        loadSuppliers();
        setSuccess("");
      }, 1000);
    } catch (error) {
      console.error("Error eliminando proveedor:", error);
      setError("Error al eliminar proveedor");
    }
  };

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      (supplier.company_name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (supplier.contact_person || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (supplier.category || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  const totalSuppliers = suppliers.length;
  const totalPurchases = suppliers.reduce(
    (sum, s) => sum + (parseFloat(s.total_purchases) || 0),
    0,
  );

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h1
            className="mb-2"
            style={{ fontFamily: "Open Sans, sans-serif", fontWeight: 600 }}
          >
            Gestión de Proveedores
          </h1>
          <p
            className="text-muted mb-0"
            style={{ fontFamily: "Roboto, sans-serif" }}
          >
            Administre proveedores y contactos comerciales
          </p>
        </div>
        <button
          className="btn d-flex align-items-center gap-2"
          onClick={() => openModal()}
          style={{
            backgroundColor: "#EA7028",
            color: "white",
            borderColor: "#EA7028",
          }}
        >
          <Plus size={18} />
          Nuevo Proveedor
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show"
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
      {success && (
        <div
          className="alert alert-success alert-dismissible fade show"
          role="alert"
        >
          {success}
          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccess("")}
          ></button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div
            className="card h-100 border-0"
            style={{
              background:
                "linear-gradient(to bottom right, white, rgba(235, 181, 131, 0.1))",
            }}
          >
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <p
                  className="text-muted mb-1"
                  style={{ fontFamily: "Roboto, sans-serif" }}
                >
                  Total Proveedores
                </p>
                <h3
                  className="mb-0"
                  style={{ fontFamily: "Open Sans, sans-serif" }}
                >
                  {totalSuppliers}
                </h3>
              </div>
              <Truck size={40} color="#EA7028" />
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div
            className="card h-100 border-0"
            style={{
              background:
                "linear-gradient(to bottom right, white, rgba(40, 167, 69, 0.1))",
            }}
          >
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <p
                  className="text-success mb-1"
                  style={{ fontFamily: "Roboto, sans-serif" }}
                >
                  Proveedores Activos
                </p>
                <h3
                  className="text-success mb-0"
                  style={{ fontFamily: "Open Sans, sans-serif" }}
                >
                  {totalSuppliers}
                </h3>
              </div>
              <UserCheck size={40} color="#28a745" />
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div
            className="card h-100 border-0"
            style={{
              background:
                "linear-gradient(to bottom right, white, rgba(0, 123, 255, 0.1))",
            }}
          >
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <p
                  className="text-info mb-1"
                  style={{ fontFamily: "Roboto, sans-serif" }}
                >
                  Compras Totales
                </p>
                <h3
                  className="text-info mb-0"
                  style={{ fontFamily: "Open Sans, sans-serif" }}
                >
                  ${totalPurchases.toFixed(2)}
                </h3>
              </div>
              <DollarSign size={40} color="#0d6efd" />
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card mb-4 border-0 shadow-sm">
        <div className="card-body">
          <div className="d-flex gap-3">
            <div className="flex-grow-1 position-relative">
              <Search
                size={20}
                className="position-absolute"
                style={{
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#999",
                }}
              />
              <input
                type="text"
                className="form-control ps-5"
                placeholder="Buscar proveedores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ borderColor: "#EBB583", outline: "none" }}
                onFocus={(e) => (e.target.style.borderColor = "#EA7028")}
                onBlur={(e) => (e.target.style.borderColor = "#EBB583")}
              />
            </div>
            <button
              className="btn border-2"
              style={{ borderColor: "#EBA94D", color: "#EA7028" }}
              onClick={() => alert("Funcionalidad de filtros próximamente")}
            >
              Filtros
            </button>
            <button
              className="btn border-2"
              style={{ borderColor: "#EBA94D", color: "#EA7028" }}
              onClick={() => alert("Exportando proveedores...")}
            >
              Exportar
            </button>
          </div>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <h5 style={{ fontFamily: "Open Sans, sans-serif" }} className="mb-4">
            Lista de Proveedores
          </h5>

          {loading ? (
            <div className="text-center py-4">
              <div
                className="spinner-border"
                role="status"
                style={{ color: "#EA7028" }}
              >
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="text-muted mt-2">Cargando proveedores...</p>
            </div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">No hay proveedores disponibles</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead style={{ backgroundColor: "#EBB583" }}>
                  <tr>
                    <th
                      style={{
                        fontFamily: "Open Sans, sans-serif",
                        color: "#333",
                      }}
                    >
                      Empresa
                    </th>
                    <th
                      style={{
                        fontFamily: "Open Sans, sans-serif",
                        color: "#333",
                      }}
                    >
                      Contacto
                    </th>
                    <th
                      style={{
                        fontFamily: "Open Sans, sans-serif",
                        color: "#333",
                      }}
                    >
                      Información
                    </th>
                    <th
                      style={{
                        fontFamily: "Open Sans, sans-serif",
                        color: "#333",
                      }}
                    >
                      Categoría
                    </th>
                    <th
                      style={{
                        fontFamily: "Open Sans, sans-serif",
                        color: "#333",
                      }}
                    >
                      Ciudad
                    </th>
                    <th
                      style={{
                        fontFamily: "Open Sans, sans-serif",
                        color: "#333",
                      }}
                    >
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSuppliers.map((supplier) => (
                    <tr
                      key={supplier.id}
                      style={{ borderBottom: "1px solid #eee" }}
                      className="align-middle"
                    >
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{
                              width: "40px",
                              height: "40px",
                              background:
                                "linear-gradient(to bottom right, #EA7028, #EBA94D)",
                            }}
                          >
                            <Truck size={20} color="white" />
                          </div>
                          <div>
                            <p
                              className="mb-0 fw-bold"
                              style={{ fontFamily: "Roboto, sans-serif" }}
                            >
                              {supplier.company_name}
                            </p>
                            <p
                              className="mb-0 small text-muted"
                              style={{ fontFamily: "Roboto, sans-serif" }}
                            >
                              {supplier.contact_person}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="space-y-2">
                          <div className="d-flex align-items-center gap-2 small text-muted">
                            <Mail size={14} color="#EBA94D" />
                            <span style={{ fontFamily: "Roboto, sans-serif" }}>
                              {supplier.email}
                            </span>
                          </div>
                          <div className="d-flex align-items-center gap-2 small text-muted">
                            <Phone size={14} color="#EBA94D" />
                            <span style={{ fontFamily: "Roboto, sans-serif" }}>
                              {supplier.phone}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div
                          className="d-flex gap-2 small text-muted align-items-start"
                          style={{ maxWidth: "200px" }}
                        >
                          <MapPin
                            size={14}
                            color="#EBA94D"
                            className="flex-shrink-0 mt-1"
                          />
                          <span style={{ fontFamily: "Roboto, sans-serif" }}>
                            {supplier.address || "-"}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={{ backgroundColor: "#EBCC83", color: "#333" }}
                        >
                          {supplier.category || "Sin categoría"}
                        </span>
                      </td>
                      <td style={{ fontFamily: "Roboto, sans-serif" }}>
                        {supplier.city || "-"}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm"
                            style={{ color: "#EA7028", border: "none" }}
                            onClick={() => openModal(supplier)}
                            title="Editar"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            className="btn btn-sm"
                            style={{ color: "#dc3545", border: "none" }}
                            onClick={() =>
                              handleDeleteSupplier(
                                supplier.id,
                                supplier.company_name,
                              )
                            }
                            title="Eliminar"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="modal d-block"
          onClick={closeModal}
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
        >
          <div
            className="modal-dialog modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 shadow-lg">
              <div
                className="modal-header border-bottom"
                style={{ borderColor: "#EBB583" }}
              >
                <h5
                  className="modal-title"
                  style={{
                    fontFamily: "Open Sans, sans-serif",
                    fontWeight: 600,
                  }}
                >
                  {editingId ? "Editar Proveedor" : "Agregar Nuevo Proveedor"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                ></button>
              </div>
              <div className="modal-body">
                {error && (
                  <div
                    className="alert alert-danger alert-dismissible fade show mb-3"
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
                {success && (
                  <div
                    className="alert alert-success alert-dismissible fade show mb-3"
                    role="alert"
                  >
                    {success}
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setSuccess("")}
                    ></button>
                  </div>
                )}

                <div className="mb-3">
                  <label
                    className="form-label"
                    style={{
                      fontFamily: "Roboto, sans-serif",
                      fontWeight: 500,
                    }}
                  >
                    Nombre de la Empresa *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    style={{ borderColor: "#EBB583" }}
                    placeholder="Ej: Molinos XYZ"
                    value={formData.company_name}
                    onChange={(e) =>
                      setFormData({ ...formData, company_name: e.target.value })
                    }
                  />
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label
                        className="form-label"
                        style={{
                          fontFamily: "Roboto, sans-serif",
                          fontWeight: 500,
                        }}
                      >
                        Persona de Contacto *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        style={{ borderColor: "#EBB583" }}
                        placeholder="Ej: Juan Pérez"
                        value={formData.contact_person || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contact_person: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label
                        className="form-label"
                        style={{
                          fontFamily: "Roboto, sans-serif",
                          fontWeight: 500,
                        }}
                      >
                        Correo Electrónico *
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        style={{ borderColor: "#EBB583" }}
                        placeholder="contacto@empresa.com"
                        value={formData.email || ""}
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
                      <label
                        className="form-label"
                        style={{
                          fontFamily: "Roboto, sans-serif",
                          fontWeight: 500,
                        }}
                      >
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        style={{ borderColor: "#EBB583" }}
                        placeholder="+1 234-567-8900"
                        value={formData.phone || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label
                        className="form-label"
                        style={{
                          fontFamily: "Roboto, sans-serif",
                          fontWeight: 500,
                        }}
                      >
                        Categoría de Productos
                      </label>
                      <select
                        className="form-select"
                        style={{ borderColor: "#EBB583" }}
                        value={formData.category || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                      >
                        <option value="">Seleccione categoría</option>
                        <option value="Harinas y Granos">
                          Harinas y Granos
                        </option>
                        <option value="Lácteos">Lácteos</option>
                        <option value="Esencias y Sabores">
                          Esencias y Sabores
                        </option>
                        <option value="Frutas y Conservas">
                          Frutas y Conservas
                        </option>
                        <option value="Grasas y Aceites">
                          Grasas y Aceites
                        </option>
                        <option value="Huevos">Huevos</option>
                        <option value="Azúcares y Endulzantes">
                          Azúcares y Endulzantes
                        </option>
                        <option value="Empaques">Empaques</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label
                    className="form-label"
                    style={{
                      fontFamily: "Roboto, sans-serif",
                      fontWeight: 500,
                    }}
                  >
                    Dirección
                  </label>
                  <textarea
                    className="form-control"
                    style={{ borderColor: "#EBB583", resize: "none" }}
                    placeholder="Dirección completa"
                    rows="3"
                    value={formData.address || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  ></textarea>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label
                        className="form-label"
                        style={{
                          fontFamily: "Roboto, sans-serif",
                          fontWeight: 500,
                        }}
                      >
                        Ciudad
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        style={{ borderColor: "#EBB583" }}
                        value={formData.city || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label
                        className="form-label"
                        style={{
                          fontFamily: "Roboto, sans-serif",
                          fontWeight: 500,
                        }}
                      >
                        País
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        style={{ borderColor: "#EBB583" }}
                        value={formData.country || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, country: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label
                    className="form-label"
                    style={{
                      fontFamily: "Roboto, sans-serif",
                      fontWeight: 500,
                    }}
                  >
                    Términos de Pago
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    style={{ borderColor: "#EBB583" }}
                    placeholder="Ej: Net 30"
                    value={formData.payment_terms || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        payment_terms: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div
                className="modal-footer border-top"
                style={{ borderColor: "#EBB583" }}
              >
                <button
                  type="button"
                  className="btn border-2"
                  style={{ borderColor: "#EBB583", color: "#333" }}
                  onClick={closeModal}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn text-white"
                  style={{ backgroundColor: "#EA7028", borderColor: "#EA7028" }}
                  onClick={handleSaveSupplier}
                >
                  {editingId ? "Guardar Cambios" : "Guardar Proveedor"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

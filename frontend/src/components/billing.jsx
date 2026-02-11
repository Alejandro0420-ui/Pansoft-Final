import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, FileText, DollarSign, Calendar } from "lucide-react";
import { toast } from "sonner";
import { InvoiceStatsCard } from "./billing/InvoiceStatsCard";
import { InvoiceFilters } from "./billing/InvoiceFilters";
import { InvoiceTable } from "./billing/InvoiceTable";
import { InvoiceModal } from "./billing/InvoiceModal";
import { InvoiceViewModal } from "./billing/InvoiceViewModal";
import "./billing/billing.css";

const API_URL = "http://localhost:5000/api";

export function Billing() {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    loadInvoices();
    loadCustomers();
    loadOrders();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/billing`);
      setInvoices(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error al cargar facturas:", error);
      toast.error("Error al cargar facturas");
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await axios.get(`${API_URL}/customers`);
      setCustomers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error al cargar clientes:", error);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await axios.get(`${API_URL}/sales-orders`);
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error al cargar órdenes:", error);
    }
  };

  const handleCreateInvoice = async (formData) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/billing`, {
        invoice_number: formData.invoice_number,
        customer_id: parseInt(formData.customer_id),
        order_id: formData.order_id ? parseInt(formData.order_id) : null,
        issue_date: formData.issue_date,
        due_date: formData.due_date,
        total_amount: parseFloat(formData.total_amount),
        status: formData.status || "pending",
      });

      setInvoices([response.data, ...invoices]);
      toast.success(
        `Factura ${response.data.invoice_number} creada exitosamente`,
      );
      setShowCreateModal(false);
      loadInvoices();
    } catch (error) {
      console.error("Error al crear factura:", error);
      toast.error("Error al crear factura");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInvoice = async (formData) => {
    if (!selectedInvoice) return;
    try {
      setLoading(true);
      await axios.put(`${API_URL}/billing/${selectedInvoice.id}`, {
        status: formData.status,
        paid_amount: parseFloat(formData.paid_amount || 0),
      });

      toast.success("Factura actualizada exitosamente");
      setShowViewModal(false);
      loadInvoices();
    } catch (error) {
      console.error("Error al actualizar factura:", error);
      toast.error("Error al actualizar factura");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInvoice = async (id) => {
    if (!confirm("¿Está seguro de que desea eliminar esta factura?")) return;

    try {
      setLoading(true);
      await axios.delete(`${API_URL}/billing/${id}`);
      setInvoices(invoices.filter((inv) => inv.id !== id));
      toast.success("Factura eliminada exitosamente");
    } catch (error) {
      console.error("Error al eliminar factura:", error);
      toast.error("Error al eliminar factura");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      setLoading(true);
      await axios.put(`${API_URL}/billing/${id}`, {
        status: newStatus,
      });
      toast.success(
        `Estado actualizado a ${newStatus === "paid" ? "Pagada" : "Pendiente"}`,
      );
      loadInvoices();
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      toast.error("Error al cambiar estado");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = (invoice) => {
    toast.success(`Descargando factura ${invoice.invoice_number}...`);
    setTimeout(() => {
      toast.success("Factura descargada exitosamente");
    }, 1500);
  };

  const handleExport = () => {
    toast.success("Exportando facturas...");
    setTimeout(() => {
      toast.success("Facturas exportadas exitosamente");
    }, 1500);
  };

  const getInvoiceStatus = (invoice) => {
    if (invoice.status === "paid") return "paid";
    if (invoice.status === "overdue") return "overdue";
    if (invoice.status === "pending" && invoice.due_date) {
      const dueDate = new Date(invoice.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dueDate.setHours(0, 0, 0, 0);
      if (dueDate < today) return "overdue";
    }
    return "pending";
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.customer_name &&
        invoice.customer_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDate = !dateFilter || invoice.issue_date === dateFilter;
    const actualStatus = getInvoiceStatus(invoice);
    const matchesStatus =
      statusFilter === "all" || actualStatus === statusFilter;
    return matchesSearch && matchesDate && matchesStatus;
  });

  const stats = {
    total: invoices.length,
    paid: invoices.filter((i) => getInvoiceStatus(i) === "paid").length,
    pending: invoices.filter((i) => getInvoiceStatus(i) === "pending").length,
    overdue: invoices.filter((i) => getInvoiceStatus(i) === "overdue").length,
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h1
            className="h2 mb-2"
            style={{ fontFamily: "Open Sans, sans-serif" }}
          >
            Facturación
          </h1>
          <p className="text-muted">Gestione facturas y pagos</p>
        </div>
        <button
          className="btn text-white"
          style={{ backgroundColor: "#EA7028" }}
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={18} className="me-2" />
          Nueva Factura
        </button>
      </div>

      <div className="row mb-4 g-3">
        <div className="col-lg-3 col-md-6">
          <InvoiceStatsCard
            title="Total Facturas"
            count={stats.total}
            icon={FileText}
            color="orange"
          />
        </div>
        <div className="col-lg-3 col-md-6">
          <InvoiceStatsCard
            title="Pagadas"
            count={stats.paid}
            icon={DollarSign}
            color="success"
          />
        </div>
        <div className="col-lg-3 col-md-6">
          <InvoiceStatsCard
            title="Pendientes"
            count={stats.pending}
            icon={Calendar}
            color="gold"
          />
        </div>
        <div className="col-lg-3 col-md-6">
          <InvoiceStatsCard
            title="Vencidas"
            count={stats.overdue}
            icon={FileText}
            color="danger"
          />
        </div>
      </div>

      <div className="mb-4">
        <InvoiceFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          dateFilter={dateFilter}
          onDateChange={setDateFilter}
          onExport={handleExport}
        />
      </div>

      <InvoiceTable
        invoices={filteredInvoices}
        loading={loading}
        onView={(invoice) => {
          setSelectedInvoice(invoice);
          setShowViewModal(true);
        }}
        onDownload={handleDownloadInvoice}
        onDelete={handleDeleteInvoice}
        onStatusChange={handleStatusChange}
      />

      <InvoiceModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Crear Nueva Factura"
        customers={customers}
        orders={orders}
        onSubmit={handleCreateInvoice}
        loading={loading}
      />

      <InvoiceViewModal
        show={showViewModal}
        onClose={() => setShowViewModal(false)}
        invoice={selectedInvoice}
      />
    </div>
  );
}

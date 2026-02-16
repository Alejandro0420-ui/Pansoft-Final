import { useState, useEffect } from "react";
import axios from "axios";
import { Trash2, Plus, Minus, Printer, X } from "lucide-react";
import { toast } from "sonner";
import "bootstrap/dist/css/bootstrap.min.css";

const API_URL = "http://localhost:5000/api";

export function SalesPoint() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toLocaleDateString(),
  );

  useEffect(() => {
    loadProducts();
    generateInvoiceNumber();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/products`);
      const activeProducts = (response.data || []).filter(
        (p) => p.is_active !== 0,
      );
      setProducts(activeProducts);
    } catch (error) {
      console.error("Error cargando productos:", error);
      toast.error("Error al cargar productos");
    } finally {
      setLoading(false);
    }
  };

  const generateInvoiceNumber = () => {
    const date = new Date();
    const timestamp = `${date.getFullYear()}${String(
      date.getMonth() + 1,
    ).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}${String(
      date.getHours(),
    ).padStart(2, "0")}${String(date.getMinutes()).padStart(2, "0")}`;
    setInvoiceNumber(`FAC-${timestamp}`);
  };

  const addToCart = (product) => {
    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
    } else {
      setCart([
        ...cart,
        {
          id: product.id,
          name: product.name,
          price: parseFloat(product.price),
          quantity: 1,
          sku: product.sku,
        },
      ]);
    }
    toast.success(`${product.name} añadido al carrito`);
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(
      cart.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item,
      ),
    );
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handlePrint = () => {
    window.print();
  };

  const handleNewSale = async () => {
    try {
      console.log("🔄 Iniciando proceso de venta...", {
        cartItems: cart.length,
        cart: cart,
        invoiceNumber: invoiceNumber,
        invoiceDate: invoiceDate,
      });

      if (!cart || cart.length === 0) {
        toast.error("El carrito está vacío");
        return;
      }

      // Procesar la venta en el backend (crear factura + actualizar inventario)
      console.log("📤 Enviando POST a /inventory/process-sale...");
      const response = await axios.post(`${API_URL}/inventory/process-sale`, {
        cart: cart,
        invoiceNumber: invoiceNumber,
        invoiceDate: invoiceDate,
      });

      console.log("✅ Respuesta del servidor:", response.data);

      if (response.data.success) {
        toast.success("✅ Venta completada - Inventario actualizado");
        console.log("Productos actualizados:", response.data.updatedProducts);

        // Limpiar carrito y generar nueva factura
        setCart([]);
        setShowInvoice(false);
        generateInvoiceNumber();
        toast.success("Nueva venta iniciada");
      } else {
        toast.error(
          "Error al procesar la venta: " +
            (response.data.error || "Error desconocido"),
        );
      }
    } catch (error) {
      console.error("❌ Error procesando venta:", error);
      const errorMsg =
        error.response?.data?.details ||
        error.response?.data?.error ||
        error.message;
      toast.error(`Error: ${errorMsg}`);
    }
  };

  const handleFinalizeSale = () => {
    if (cart.length === 0) {
      toast.error("Añade productos al carrito");
      return;
    }
    setShowInvoice(true);
  };

  const total = calculateTotal();

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="spinner-border text-warning"></div>
        <p className="mt-3">Cargando productos...</p>
      </div>
    );
  }

  return (
    <div style={{ height: "100%", display: "flex", overflow: "hidden" }}>
      {/* Main Layout */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ padding: "1rem", backgroundColor: "#f8f9fa" }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h2 className="mb-1">Punto de Venta</h2>
              <p className="text-muted">Factura sin cliente</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p className="mb-0">
                <strong>Factura:</strong> {invoiceNumber}
              </p>
              <p className="mb-0 text-muted">
                <small>{invoiceDate}</small>
              </p>
            </div>
          </div>

          {/* Search Products */}
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar producto por nombre o SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Products and Cart Container */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* Products List */}
          <div
            style={{
              flex: 2,
              overflow: "auto",
              padding: "1rem",
              borderRight: "1px solid #dee2e6",
            }}
          >
            <div className="row g-2">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <div key={product.id} className="col-md-6 col-lg-4">
                    <div
                      className="card h-100 border-0 shadow-sm"
                      style={{
                        cursor: "pointer",
                        transition: "all 0.3s",
                        opacity: product.is_active !== 0 ? 1 : 0.5,
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.boxShadow =
                          "0 4px 12px rgba(234, 112, 40, 0.2)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.boxShadow =
                          "0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)")
                      }
                    >
                      {product.image_url && (
                        <img
                          src={`http://localhost:5000${product.image_url}`}
                          alt={product.name}
                          style={{
                            height: "120px",
                            objectFit: "cover",
                          }}
                        />
                      )}
                      <div className="card-body p-2">
                        <h6
                          className="card-title"
                          style={{ fontSize: "0.9rem" }}
                        >
                          {product.name}
                        </h6>
                        <p
                          className="text-muted"
                          style={{ fontSize: "0.8rem" }}
                        >
                          {product.sku}
                        </p>
                        <div className="d-flex justify-content-between align-items-center">
                          <strong style={{ color: "#EA7028" }}>
                            $
                            {Number(product.price).toLocaleString("es-CO", {
                              minimumFractionDigits: 0,
                            })}
                          </strong>
                          <button
                            onClick={() => addToCart(product)}
                            className="btn btn-sm btn-warning"
                            disabled={product.is_active === 0}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12">
                  <div className="alert alert-info">
                    No hay productos disponibles
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cart */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#f8f9fa",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "1rem", borderBottom: "1px solid #dee2e6" }}>
              <h5 className="mb-0">Carrito ({cart.length} items)</h5>
            </div>

            {/* Cart Items */}
            <div style={{ flex: 1, overflow: "auto", padding: "1rem" }}>
              {cart.length > 0 ? (
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="card border-0 shadow-sm p-2"
                      style={{ marginBottom: "0.5rem" }}
                    >
                      <div className="row g-0 align-items-center">
                        <div className="col-7">
                          <p className="mb-1" style={{ fontSize: "0.85rem" }}>
                            <strong>{item.name}</strong>
                          </p>
                          <p
                            className="mb-0 text-muted"
                            style={{ fontSize: "0.75rem" }}
                          >
                            $
                            {Number(item.price).toLocaleString("es-CO", {
                              minimumFractionDigits: 0,
                            })}
                          </p>
                        </div>
                        <div className="col-3">
                          <div
                            className="btn-group btn-group-sm d-flex"
                            role="group"
                          >
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              className="btn btn-outline-secondary"
                            >
                              <Minus size={12} />
                            </button>
                            <button
                              className="btn btn-outline-secondary"
                              disabled
                              style={{ cursor: "default" }}
                            >
                              {item.quantity}
                            </button>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              className="btn btn-outline-secondary"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                        <div className="col-2 text-end">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="btn btn-sm btn-outline-danger"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      <div
                        style={{
                          marginTop: "0.25rem",
                          paddingTop: "0.5rem",
                          borderTop: "1px solid #dee2e6",
                          textAlign: "right",
                        }}
                      >
                        <strong
                          style={{ fontSize: "0.85rem", color: "#EA7028" }}
                        >
                          $
                          {Number(item.price * item.quantity).toLocaleString(
                            "es-CO",
                            { minimumFractionDigits: 0 },
                          )}
                        </strong>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted">
                  <p>Carrito vacío</p>
                  <small>Selecciona productos para empezar</small>
                </div>
              )}
            </div>

            {/* Totals and Actions */}
            <div style={{ padding: "1rem", borderTop: "2px solid #EA7028" }}>
              <div className="mb-3">
                <div
                  className="d-flex justify-content-between mb-2"
                  style={{ fontSize: "0.9rem" }}
                >
                  <span>Subtotal:</span>
                  <span>
                    $
                    {Number(total).toLocaleString("es-CO", {
                      minimumFractionDigits: 0,
                    })}
                  </span>
                </div>
                <div
                  className="d-flex justify-content-between"
                  style={{ fontSize: "1.2rem", fontWeight: "bold" }}
                >
                  <span>Total:</span>
                  <span style={{ color: "#EA7028" }}>
                    $
                    {Number(total).toLocaleString("es-CO", {
                      minimumFractionDigits: 0,
                    })}
                  </span>
                </div>
              </div>

              <div className="d-grid gap-2">
                <button
                  onClick={handleFinalizeSale}
                  className="btn btn-lg"
                  style={{ backgroundColor: "#EA7028", color: "white" }}
                  disabled={cart.length === 0}
                >
                  Finalizar Venta
                </button>
                <button
                  onClick={handleNewSale}
                  className="btn btn-outline-secondary"
                  disabled={cart.length === 0}
                >
                  Limpiar Carrito
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Modal */}
      {showInvoice && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
          role="dialog"
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            role="document"
          >
            <div className="modal-content">
              <div className="modal-header border-bottom-0">
                <h5 className="modal-title">Factura de Venta</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowInvoice(false)}
                ></button>
              </div>

              <div className="modal-body" id="invoice-print">
                <div style={{ padding: "2rem", backgroundColor: "white" }}>
                  {/* Invoice Header */}
                  <div className="text-center mb-4">
                    <h2>FACTURA DE VENTA</h2>
                    <p className="text-muted mb-0">Factura #{invoiceNumber}</p>
                    <p className="text-muted">{invoiceDate}</p>
                  </div>

                  <hr />

                  {/* Invoice Items */}
                  <table className="table table-sm">
                    <thead>
                      <tr style={{ borderBottom: "2px solid #EA7028" }}>
                        <th>Producto</th>
                        <th className="text-center">Cantidad</th>
                        <th className="text-end">Precio</th>
                        <th className="text-end">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <div>
                              <strong>{item.name}</strong>
                              <br />
                              <small className="text-muted">{item.sku}</small>
                            </div>
                          </td>
                          <td className="text-center">{item.quantity}</td>
                          <td className="text-end">
                            $
                            {Number(item.price).toLocaleString("es-CO", {
                              minimumFractionDigits: 0,
                            })}
                          </td>
                          <td className="text-end">
                            <strong>
                              $
                              {Number(
                                item.price * item.quantity,
                              ).toLocaleString("es-CO", {
                                minimumFractionDigits: 0,
                              })}
                            </strong>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <hr />

                  {/* Totals */}
                  <div style={{ marginBottom: "2rem" }}>
                    <div
                      className="d-flex justify-content-end mb-2"
                      style={{ fontSize: "1.1rem" }}
                    >
                      <span style={{ width: "150px", textAlign: "right" }}>
                        <strong>TOTAL:</strong>
                      </span>
                      <span
                        style={{
                          width: "150px",
                          textAlign: "right",
                          fontSize: "1.3rem",
                          color: "#EA7028",
                          fontWeight: "bold",
                        }}
                      >
                        $
                        {Number(total).toLocaleString("es-CO", {
                          minimumFractionDigits: 0,
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="text-center">
                    <p className="text-muted" style={{ fontSize: "0.8rem" }}>
                      Gracias por su compra
                    </p>
                    <p className="text-muted" style={{ fontSize: "0.75rem" }}>
                      Esta factura fue generada el {invoiceDate}
                    </p>
                  </div>
                </div>
              </div>

              <div className="modal-footer border-top-0">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowInvoice(false)}
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  className="btn btn-warning"
                  onClick={handlePrint}
                >
                  <Printer
                    size={16}
                    className="me-2"
                    style={{ display: "inline" }}
                  />
                  Imprimir
                </button>
                <button
                  type="button"
                  className="btn"
                  style={{ backgroundColor: "#EA7028", color: "white" }}
                  onClick={handleNewSale}
                >
                  Nueva Venta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

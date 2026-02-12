import { useState, useEffect } from "react";
import {
  Trash2,
  CheckCircle,
  AlertCircle,
  Info,
  Bell,
  AlertTriangle,
  ShoppingCart,
} from "lucide-react";

export function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, unread
  const [unreadCount, setUnreadCount] = useState(0);

  const notificationIcons = {
    inventory: AlertCircle,
    order: ShoppingCart,
    success: CheckCircle,
    warning: AlertTriangle,
    info: Info,
    default: Bell,
  };

  const notificationColors = {
    inventory: "#FFD93D",
    order: "#4ECDC4",
    success: "#51CF66",
    warning: "#FF6B6B",
    info: "#6C5CE7",
    default: "#95A5A6",
  };

  // Cargar notificaciones
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const queryParam = filter === "unread" ? "?unreadOnly=true" : "";
      const response = await fetch(
        `http://localhost:5000/api/notifications${queryParam}`,
      );
      const data = await response.json();
      setNotifications(data.notifications || []);

      // Cargar conteo de no leídas
      const countResponse = await fetch(
        "http://localhost:5000/api/notifications/unread/count",
      );
      const countData = await countResponse.json();
      setUnreadCount(countData.unreadCount || 0);
    } catch (error) {
      console.error("Error cargando notificaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Polls cada 10 segundos para nuevas notificaciones
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [filter]);

  // Marcar como leída
  const markAsRead = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: "PATCH",
      });
      fetchNotifications();
    } catch (error) {
      console.error("Error marcando como leída:", error);
    }
  };

  // Marcar todas como leídas
  const markAllAsRead = async () => {
    try {
      await fetch("http://localhost:5000/api/notifications/read/all", {
        method: "PATCH",
      });
      fetchNotifications();
    } catch (error) {
      console.error("Error marcando todas como leídas:", error);
    }
  };

  // Eliminar notificación
  const deleteNotification = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/notifications/${id}`, {
        method: "DELETE",
      });
      fetchNotifications();
    } catch (error) {
      console.error("Error eliminando notificación:", error);
    }
  };

  // Eliminar todas las leídas
  const deleteAllRead = async () => {
    try {
      await fetch("http://localhost:5000/api/notifications/read/all", {
        method: "DELETE",
      });
      fetchNotifications();
    } catch (error) {
      console.error("Error eliminando notificaciones leídas:", error);
    }
  };

  const getIcon = (type) => {
    const Icon = notificationIcons[type] || notificationIcons.default;
    return Icon;
  };

  const getColor = (type) => {
    return notificationColors[type] || notificationColors.default;
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          flexShrink: 0,
          padding: "1rem",
          borderBottom: "1px solid #dee2e6",
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h3 className="mb-0">Notificaciones</h3>
            {unreadCount > 0 && (
              <small className="text-muted">{unreadCount} sin leer</small>
            )}
          </div>
          <div className="btn-group" role="group">
            <button
              className={`btn btn-sm ${filter === "all" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setFilter("all")}
            >
              Todas
            </button>
            <button
              className={`btn btn-sm ${filter === "unread" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setFilter("unread")}
            >
              Sin leer
            </button>
          </div>
        </div>

        {notifications.length > 0 && (
          <div className="d-flex gap-2">
            {unreadCount > 0 && (
              <button
                className="btn btn-sm btn-outline-success"
                onClick={markAllAsRead}
              >
                <CheckCircle size={16} className="me-1" />
                Marcar todas como leída
              </button>
            )}
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={deleteAllRead}
            >
              <Trash2 size={16} className="me-1" />
              Eliminar leídas
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          padding: "1rem",
        }}
      >
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="alert alert-info">
            <Bell className="me-2" size={20} />
            {filter === "unread"
              ? "No hay notificaciones sin leer"
              : "No hay notificaciones"}
          </div>
        ) : (
          <div style={{ display: "grid", gap: "1rem" }}>
            {notifications.map((notification) => {
              const Icon = getIcon(notification.type);
              const color = getColor(notification.type);
              const isUnread = !notification.is_read;

              return (
                <div
                  key={notification.id}
                  style={{
                    padding: "1rem",
                    border: `1px solid ${color}33`,
                    borderLeft: `4px solid ${color}`,
                    borderRadius: "8px",
                    backgroundColor: isUnread ? "rgba(0,0,0,0.02)" : "#fff",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "1rem",
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        backgroundColor: color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        color: "white",
                      }}
                    >
                      <Icon size={20} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          gap: "0.5rem",
                          alignItems: "center",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <h6 style={{ margin: 0 }}>{notification.title}</h6>
                        {isUnread && (
                          <span
                            style={{
                              padding: "0.25rem 0.5rem",
                              backgroundColor: "#007bff",
                              color: "white",
                              borderRadius: "4px",
                              fontSize: "0.75rem",
                            }}
                          >
                            Nuevo
                          </span>
                        )}
                      </div>
                      <p
                        style={{
                          margin: "0.5rem 0",
                          color: "#666",
                          fontSize: "0.95rem",
                        }}
                      >
                        {notification.message}
                      </p>
                      <small style={{ color: "#999" }}>
                        {new Date(notification.created_at).toLocaleString(
                          "es-ES",
                          {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </small>
                    </div>

                    <div
                      style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}
                    >
                      {isUnread && (
                        <button
                          className="btn btn-sm btn-outline-success"
                          onClick={() => markAsRead(notification.id)}
                          style={{ padding: "0.25rem 0.5rem" }}
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => deleteNotification(notification.id)}
                        style={{ padding: "0.25rem 0.5rem" }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

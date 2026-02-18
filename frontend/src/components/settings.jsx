import { useState } from "react";
import { Save, AlertCircle } from "lucide-react";

export function Settings() {
  const [settings, setSettings] = useState({
    company_name: "Pansoft",
    email: "info@pansoft.com",
    phone: "+57 3135445977",
    address: "Calle 123, Bogotá, Colombia",
    timezone: "America/Bogota",
    currency: "COP",
    language: "es",
    notifications_email: true,
    notifications_sms: false,
    two_factor_auth: false,
  });

  const handleSave = () => {
    alert("Configuración guardada correctamente");
  };

  return (
    <div className="p-4">
      <div>
        <h1>Configuración</h1>
        <p className="text-muted">
          Administra la configuración de la aplicación
        </p>
      </div>

      <div className="row mt-4">
        <div className="col-lg-8">
          {/* Company Settings */}
          <div className="card mb-4">
            <div className="card-header bg-light">
              <h5 className="card-title mb-0">Información de la Empresa</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Nombre de la Empresa</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.company_name}
                  onChange={(e) =>
                    setSettings({ ...settings, company_name: e.target.value })
                  }
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Correo Electrónico</label>
                <input
                  type="email"
                  className="form-control"
                  value={settings.email}
                  onChange={(e) =>
                    setSettings({ ...settings, email: e.target.value })
                  }
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Teléfono</label>
                <input
                  type="tel"
                  className="form-control"
                  value={settings.phone}
                  onChange={(e) =>
                    setSettings({ ...settings, phone: e.target.value })
                  }
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Dirección</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.address}
                  onChange={(e) =>
                    setSettings({ ...settings, address: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* Regional Settings */}
          <div className="card mb-4">
            <div className="card-header bg-light">
              <h5 className="card-title mb-0">Configuración Regional</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Zona Horaria</label>
                  <select
                    className="form-select"
                    value={settings.timezone}
                    onChange={(e) =>
                      setSettings({ ...settings, timezone: e.target.value })
                    }
                  >
                    <option>America/New_York</option>
                    <option>America/Chicago</option>
                    <option>America/Denver</option>
                    <option>America/Los_Angeles</option>
                    <option>Europe/London</option>
                    <option>Europe/Madrid</option>
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Moneda</label>
                  <select
                    className="form-select"
                    value={settings.currency}
                    onChange={(e) =>
                      setSettings({ ...settings, currency: e.target.value })
                    }
                  >
                    <option>USD</option>
                    <option>EUR</option>
                    <option>MXN</option>
                    <option>COP</option>
                  </select>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Idioma</label>
                <select
                  className="form-select"
                  value={settings.language}
                  onChange={(e) =>
                    setSettings({ ...settings, language: e.target.value })
                  }
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="pt">Português</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="card mb-4">
            <div className="card-header bg-light">
              <h5 className="card-title mb-0">Notificaciones</h5>
            </div>
            <div className="card-body">
              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="emailNotif"
                  checked={settings.notifications_email}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      notifications_email: e.target.checked,
                    })
                  }
                />
                <label className="form-check-label" htmlFor="emailNotif">
                  Recibir notificaciones por correo electrónico
                </label>
              </div>
              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="smsNotif"
                  checked={settings.notifications_sms}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      notifications_sms: e.target.checked,
                    })
                  }
                />
                <label className="form-check-label" htmlFor="smsNotif">
                  Recibir notificaciones por SMS
                </label>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="card mb-4">
            <div className="card-header bg-light">
              <h5 className="card-title mb-0">Seguridad</h5>
            </div>
            <div className="card-body">
              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="tfa"
                  checked={settings.two_factor_auth}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      two_factor_auth: e.target.checked,
                    })
                  }
                />
                <label className="form-check-label" htmlFor="tfa">
                  Habilitar autenticación de dos factores
                </label>
              </div>
              <button className="btn btn-outline-danger">
                Cambiar Contraseña
              </button>
            </div>
          </div>

          {/* Save Button */}
          <button
            className="btn btn-danger w-100 d-flex align-items-center justify-content-center gap-2"
            onClick={handleSave}
            style={{ padding: "10px" }}
          >
            <Save size={20} />
            Guardar Cambios
          </button>
        </div>

        {/* Info Panel */}
        <div className="col-lg-4">
          <div className="alert alert-info d-flex gap-2">
            <AlertCircle size={20} className="flex-shrink-0 mt-1" />
            <div>
              <strong>Información</strong>
              <p className="mb-0 small mt-2">
                Los cambios en la configuración se aplicarán inmediatamente.
                Asegúrate de guardar los cambios antes de cerrar esta página.
              </p>
            </div>
          </div>

          <div className="card">
            <div className="card-body small">
              <h6 className="card-title">Versión de la Aplicación</h6>
              <p className="mb-0">1.0.0</p>
              <hr />
              <h6 className="card-title">Última Actualización</h6>
              <p className="mb-0">{new Date().toLocaleDateString("es-ES")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { authAPI } from '../services/api';
import { User, Lock } from 'lucide-react';
import '../styles/Login.css';
import logo from '../images/Logo-Pansoft.png';

export function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(username, password);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      onLogin();
    } catch (err) {
      setError('Usuario o contraseña incorrectos');
      console.error('Error en login:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #EBB583 0%, #EBCC83 100%)' }}>
      <div className="card shadow-lg border-0" style={{ width: '100%', maxWidth: '500px' }}>
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <div className="d-flex justify-content-center mb-3">
              <img src={logo} id="pansoft-logo" alt="Pansoft Logo" />
            </div>
            <p className="text-muted" style={{ fontFamily: 'Roboto, sans-serif' }}>Sistema de Gestión para Panaderías</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <div className="mb-3">
              <label className="form-label d-flex align-items-center gap-2">
                <User className="text-danger" size={18} />
                Usuario
              </label>
              <input
                type="text"
                className="form-control border-2"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingrese su usuario"
                required
                style={{ borderColor: '#EBB583' }}
              />
            </div>

            <div className="mb-3">
              <label className="form-label d-flex align-items-center gap-2">
                <Lock className="text-danger" size={18} />
                Contraseña
              </label>
              <input
                type="password"
                className="form-control border-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingrese su contraseña"
                required
                style={{ borderColor: '#EBB583' }}
              />
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="remember" />
                <label className="form-check-label" htmlFor="remember" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Recordarme
                </label>
              </div>
              <a href="#" style={{ color: '#EA7028', textDecoration: 'none', fontFamily: 'Roboto, sans-serif' }}>
                ¿Olvidó su contraseña?
              </a>
            </div>

            <button
              type="submit"
              className="btn w-100 text-white"
              style={{ backgroundColor: '#EA7028' }}
              disabled={loading}
            >
              {loading ? 'Iniciando...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-muted small" style={{ fontFamily: 'Roboto, sans-serif' }}>
              © 2026 Pansoft. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

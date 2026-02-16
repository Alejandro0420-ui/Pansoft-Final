import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "tu_secret_key_segura_aqui";

/**
 * Middleware para verificar JWT
 * Valida el token en el header Authorization
 */
export const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>

    if (!token) {
      return res.status(401).json({ error: "Token no proporcionado" });
    }

    // Verificar y decodificar JWT
    const decoded = jwt.verify(token, JWT_SECRET);

    // Guardar información del usuario en req
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expirado" });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Token inválido" });
    }
    res.status(403).json({ error: "No autorizado" });
  }
};

/**
 * Middleware para verificar rol específíco
 * @param {string|string[]} allowedRoles - Rol o array de roles permitidos
 */
export const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    // Asegurarse de que el usuario esté autenticado
    if (!req.user) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Acceso denegado. Roles requeridos: ${roles.join(", ")}`,
      });
    }

    next();
  };
};

/**
 * Middleware combinado: verificar token y rol
 * @param {string|string[]} allowedRoles - Rol o array de roles
 */
export const authenticate = (allowedRoles = null) => {
  return [verifyToken, ...(allowedRoles ? [checkRole(allowedRoles)] : [])];
};

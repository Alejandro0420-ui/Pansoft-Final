# 🔧 SOLUCIÓN RÁPIDA - Error 500 en Historial

## El Problema

```
❌ Failed to load resource: the server responded with a status of 500
❌ Error fetching movement history
```

## Las Causas Posibles

1. ✓ Las tablas `inventory_movements` y `supplies_movements` no existen
2. ✓ Error en la sintaxis de transacciones
3. ✓ Falta de variables de entorno de BD

## Solución (3 pasos)

### Paso 1: Crear las tablas

```bash
cd backend
node ensure_tables.js
```

**Deberías ver:**

```
✅ Tabla inventory_movements ya existe (o creada)
✅ Tabla supplies_movements ya existe (o creada)
✨ Todas las tablas están listas
```

Si ves error de conexión, verifica tus variables:

```bash
echo DB_HOST=$DB_HOST
echo DB_USER=$DB_USER
echo DB_NAME=$DB_NAME
```

### Paso 2: Reiniciar el servidor

```bash
# Mata el proceso Node si está corriendo
npm start
```

### Paso 3: Probar

```bash
# En la interfaz:
1. Abre Inventario
2. Haz clic en "Registrar Movimiento"
3. Llena los datos y registra
4. El historial debe aparecer abajo
```

---

## Si Sigue Fallando

### Verificar que la BD está corriendo

```bash
mysql -u root -p
# Luego usa el password
# Si entra, la BD funciona
```

### Revisar los logs del servidor

```bash
# En el terminal del backend, busca:
# Error al obtener movimientos: ...
# Error al actualizar inventario: ...
```

### Ejecutar migración completa

```bash
cd backend
node create_inventory_history.js
```

---

## Checklist de Verificación

- [ ] BD está corriendo
- [ ] Tablas inventory_movements existen (`node ensure_tables.js`)
- [ ] Servidor reiniciado después de cambios
- [ ] Sin errores en los logs del backend
- [ ] Frontend sin errores en consola

---

## Resultado Esperado

Cuando registres un movimiento verás:

```
✅ Movimiento registrado: entrada de 50 unidades
✓ Historial se actualiza automáticamente
✓ Datos persisten si cambias de módulo
```

#!/usr/bin/env node
/**
 * Script de prueba simple para verificar que el módulo de notificaciones
 * se importa correctamente
 */

import {
  notificationService,
  createNotification,
} from "./routes/notificationService.js";

console.log("✅ Módulo de notificaciones importado correctamente\n");

console.log("📋 Tipos de notificaciones disponibles:\n");

const examples = [
  {
    name: "Bajo inventario",
    notification: notificationService.lowStock("Harina", 5, 10),
  },
  {
    name: "Orden completada",
    notification: notificationService.orderCompleted(101, "Juan Pérez"),
  },
  {
    name: "Orden pendiente",
    notification: notificationService.orderPending(102, "María García"),
  },
  {
    name: "Orden cancelada",
    notification: notificationService.orderCancelled(103, "Falta de stock"),
  },
  {
    name: "Pago recibido",
    notification: notificationService.paymentReceived(104, "500.00"),
  },
  {
    name: "Producto sin stock",
    notification: notificationService.outOfStock("Azúcar"),
  },
  {
    name: "Nuevo proveedor",
    notification: notificationService.newSupplier("Distribuidora Central"),
  },
  {
    name: "Empleado agregado",
    notification: notificationService.employeeAdded("Carlos López"),
  },
];

examples.forEach((example, index) => {
  console.log(`${index + 1}. ${example.name}`);
  console.log(`   Tipo: ${example.notification.type}`);
  console.log(`   Título: ${example.notification.title}`);
  console.log(`   Mensaje: ${example.notification.message}`);
  console.log(`   Color: ${example.notification.color}\n`);
});

console.log("✅ Todos los tipos de notificaciones funcionan correctamente!\n");
console.log("📖 Ver NOTIFICACIONES_README.md para más información");

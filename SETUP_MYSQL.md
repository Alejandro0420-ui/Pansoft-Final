# 📋 Instrucciones para Configurar MySQL - Pansoft

## Paso 1: Verificar instalación de MySQL

Asegúrate de tener MySQL instalado. Si no, descárgalo desde: https://www.mysql.com/downloads/mysql/

### En Windows (PowerShell):
```powershell
mysql --version
```

---

## Paso 2: Conectarse a MySQL

Abre MySQL Command Line Client o PowerShell:

```powershell
mysql -u root -p
```

**Nota**: Si MySQL no tiene contraseña (por defecto), presiona Enter cuando pida la contraseña.

---

## Paso 3: Crear la base de datos y tablas

Copia y pega el siguiente comando para ejecutar el script de schema:

```sql
source C:/Users/aleja/OneDrive/Desktop/Pansoft\ con\ typescript/backend/db/mysql_init.sql;
```

O alternativamente, desde PowerShell:

```powershell
mysql -u root < "C:\Users\aleja\OneDrive\Desktop\Pansoft con typescript\backend\db\mysql_init.sql"
```

---

## Paso 4: Insertar datos de prueba

Ejecuta los datos de prueba:

```sql
source C:/Users/aleja/OneDrive/Desktop/Pansoft\ con\ typescript/backend/db/mysql_seed.sql;
```

O desde PowerShell:

```powershell
mysql -u root < "C:\Users\aleja\OneDrive\Desktop\Pansoft con typescript\backend\db\mysql_seed.sql"
```

---

## Paso 5: Verificar la instalación

Conectate a la base de datos y verifica:

```sql
USE pansoft_db;
SHOW TABLES;
SELECT * FROM users;
```

Si ves las tablas y los usuarios, ¡listo! 🎉

---

## Paso 6: Iniciar el backend

En PowerShell, navega a la carpeta backend:

```powershell
cd "C:\Users\aleja\OneDrive\Desktop\Pansoft con typescript\backend"
npm run dev
```

Deberías ver:
```
✓ Conectado a MySQL
Server running on port 5000
```

---

## Credenciales de prueba

**Usuario**: admin  
**Contraseña**: password123

**Usuario**: user  
**Contraseña**: password123

**Usuario**: vendedor  
**Contraseña**: password123

---

## Solución de problemas

### Error: "Access denied for user 'root'@'localhost'"
- MySQL requiere una contraseña. En el archivo `.env` en `backend/`, actualiza:
  ```
  DB_PASSWORD=tuContraseñaAqui
  ```

### Error: "Database already exists"
- Puedes eliminar la base de datos con:
  ```sql
  DROP DATABASE pansoft_db;
  ```
  Luego ejecuta `mysql_init.sql` de nuevo.

### Error: "Port 3306 is already in use"
- Otro servicio está usando MySQL. Reinicia MySQL:
  ```powershell
  Restart-Service MySQL80
  ```
  (Cambia MySQL80 según tu versión)

---

## Siguientes pasos

1. ✅ MySQL instalado y configurado
2. ✅ Base de datos creada
3. ✅ Datos de prueba insertados
4. ⏳ **Iniciar el backend** (npm run dev)
5. ⏳ Iniciar el frontend en otra terminal

---

**Creado**: 2024  
**Proyecto**: Pansoft - Sistema de Gestión

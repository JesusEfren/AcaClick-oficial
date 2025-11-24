# Microservicio de Negocios (ms_negocios)

Microservicio Django REST Framework para gestionar negocios en AcaClick.

## 🚀 Configuración Inicial

### 1. Crear entorno virtual

```bash
cd backend/ms_negocios
python -m venv .venv
```

### 2. Activar entorno virtual

**Windows:**
```bash
.\.venv\Scripts\activate
```

**Linux/Mac:**
```bash
source .venv/bin/activate
```

### 3. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 4. Levantar la base de datos

```bash
cd ../../infra
docker compose up -d db_negocios
```

Verifica que esté corriendo:
```bash
docker ps
```

Debe aparecer:
```
acaclick_db_negocios   postgres:16   0.0.0.0:5434->5432/tcp
```

### 5. Ejecutar migraciones

```bash
cd ../backend/ms_negocios
python manage.py migrate
```

### 6. Ejecutar el servidor

```bash
python manage.py runserver 8002
```

El servidor estará disponible en: `http://127.0.0.1:8002`

## 📡 Endpoints API

Base URL: `http://127.0.0.1:8002/api/negocios/`

- `GET /` - Listar todos los negocios
- `POST /crear/` - Crear un nuevo negocio
- `GET /<id_negocio>/` - Obtener un negocio por ID
- `PUT /<id_negocio>/actualizar/` - Actualizar un negocio
- `DELETE /<id_negocio>/eliminar/` - Eliminar (desactivar) un negocio
- `GET /usuario/<id_usuario>/` - Listar negocios de un usuario

## 🗄️ Base de Datos

- **Nombre:** `acaclick_negocios`
- **Puerto:** `5434`
- **Usuario:** `acaclick_user`
- **Contraseña:** `acaclick_password`

## 📝 Modelo Negocio

El modelo incluye:
- Información básica (nombre, tipo, descripción)
- Contacto (correo, teléfono, dirección)
- Ubicación (latitud, longitud)
- Horario (apertura, cierre)
- Web y redes sociales
- Logo
- Metadata (usuario propietario, tenant_id, fechas)


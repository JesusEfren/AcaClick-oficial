## 📁 Estructura del Proyecto
AcaClick-oficial/
│
├── acaclick/
│   ├── backend/
│   │   ├── ms_usuarios/
│   │   ├── ms_negocios/
│   │   ├── ms_productos/
│   │   ├── ms_pagos/
│   │   ├── ms_pedidos/
│   │   └── ... otros microservicios
│   │
│   ├── frontend/
│   │   └── web-admin/
│   │
│   └── infra/
│       └── docker-compose.yml
│
├── README.md  ← estás aquí
└── docs/

## 🐳 1. Levantar la Base de Datos con Docker
El archivo de infraestructura está en:
acaclick/infra/docker-compose.yml

Abre una terminal y ejecuta:
cd acaclick/infra --- tienes que estar dentro de esta dirreción y luego ejecuta 
docker compose up -d db_usuarios

Verifica que está corriendo:
docker ps
debe de salir 
acaclick_db_usuarios   postgres:16   0.0.0.0:5433->5432/tcp


## ⚙ 2. Configurar el Backend (Django REST)
Microservicio: ms_usuarios
Es el microservicio que maneja:
Registro
Login
JWT Tokens
Gestión de usuarios

▶ Configuración inicial

crea el entorno virtual
cd acaclick/backend/ms_usuarios
python -m venv .venv 

activa el entorno
.\.venv\Scripts\activate

instala los requerimientos 
pip install -r requirements.txt

ejectua las migraciones
python manage.py migrate

ejectua el servidor 

python manage.py runserver 8001


## 🖥 3. Levantar el Frontend (React – Web Admin)

cd acaclick/frontend/web-admin
npm install

ejecuta 
npm run dev

la app se abrira en 
http://localhost:5173/


Si todo esta bien ahora pasa a crear tu microservicio 

Para que todo sea consistente:

Cada microservicio backend vive en:
acaclick/backend/ms_<nombre>/

Cada base de datos en Postgres se llama:
acaclick_<nombre>

Los contenedores de BD se nombran:
acaclick_db_<nombre>

Todas las APIs se exponen bajo el prefijo:
/api/<nombre>/...

El frontend admin vive en:
acaclick/frontend/web-admin

Recomendación: usar como plantilla el microservicio ms_usuarios que ya está funcionando.
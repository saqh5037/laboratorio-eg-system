# Results Service - Laboratorio Elizabeth Gutiérrez

Servicio de consulta de resultados de laboratorio para pacientes.

## 📋 Descripción

API REST que permite a los pacientes consultar sus resultados de laboratorio de forma segura utilizando su código de lealtad (CI) y fecha de nacimiento.

## 🚀 Características

- ✅ Autenticación con código de lealtad + fecha de nacimiento
- ✅ Consulta de órdenes de laboratorio
- ✅ Visualización de resultados con valores referenciales
- ✅ Interpretación automática (normal/alto/bajo)
- ✅ Rate limiting para seguridad
- ✅ Logs detallados
- ✅ Tokens JWT con expiración

## 🛠️ Tecnologías

- Node.js 18+
- Express.js
- PostgreSQL (conexión a labsisEG)
- JWT para autenticación
- Winston para logging

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Iniciar en desarrollo
npm run dev

# Iniciar en producción
npm start
```

## 🔌 Endpoints

### Autenticación

**POST** `/api/auth/verify`
```json
{
  "codigo_lealtad": "17063454",
  "fecha_nacimiento": "1986-02-05"
}
```

Respuesta:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "paciente": {
      "nombre": "SAMUEL QUIROZ",
      "ci_paciente": "17063454"
    }
  }
}
```

### Consultar Órdenes

**GET** `/api/resultados/ordenes`

Headers:
```
Authorization: Bearer <token>
```

Respuesta:
```json
{
  "success": true,
  "data": {
    "total": 3,
    "ordenes": [
      {
        "id": 123,
        "numero": "2510210001",
        "fecha": "2025-10-21T14:05:54.787Z",
        "paciente_nombre": "SAMUEL QUIROZ",
        "estado": "Validada",
        "total_pruebas": 5,
        "pruebas_con_resultado": 5
      }
    ]
  }
}
```

### Ver Resultados de una Orden

**GET** `/api/resultados/orden/:numero`

Headers:
```
Authorization: Bearer <token>
```

Respuesta:
```json
{
  "success": true,
  "data": {
    "orden": {
      "numero": "2510170004",
      "fecha": "2025-10-17...",
      "nombre": "SIMON",
      "apellido": "RAMIREZ"
    },
    "resultados": [
      {
        "prueba_nombre": "Glucosa",
        "resultado_numerico": 6.0,
        "unidad": "mg/dL",
        "valor_desde": 70.0,
        "valor_hasta": 110.0,
        "interpretacion_valor": "bajo"
      }
    ],
    "estadisticas": {
      "total_pruebas": 1,
      "con_resultado": 1,
      "validados": 1,
      "criticos": 0
    }
  }
}
```

## 🔐 Seguridad

- Rate limiting: 5 intentos por hora por código
- Tokens JWT con expiración de 15 minutos
- Validación de propiedad de órdenes
- CORS configurado

## 🏗️ Estructura del Proyecto

```
results-service/
├── src/
│   ├── index.js              # Servidor principal
│   ├── config/
│   │   ├── database.js       # Pool de PostgreSQL
│   │   └── logger.js         # Winston logger
│   ├── models/
│   │   ├── orden.js          # Modelo de órdenes
│   │   └── resultado.js      # Modelo de resultados
│   ├── services/
│   │   └── auth.js           # Servicio de autenticación
│   └── routes/
│       └── results.js        # Rutas de la API
├── logs/                     # Logs generados
├── .env                      # Variables de entorno
├── package.json
└── README.md
```

## 📝 Variables de Entorno

```env
# Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=labsisEG
DB_USER=labsis
DB_PASSWORD=labsis

# Servidor
PORT=3003
NODE_ENV=development

# Seguridad
JWT_SECRET=your_secret_here
JWT_EXPIRATION=15m

# CORS
CORS_ORIGIN=http://localhost:5173
```

## 🧪 Testing

Puedes probar el servicio con datos reales de la base de datos:

```bash
# Orden de prueba
Número: 2510170004
Paciente: SIMON RAMIREZ
CI: V-17371453
Fecha Nacimiento: 1998-10-16
```

## 📊 Logs

Los logs se guardan en:
- `logs/combined.log` - Todos los logs
- `logs/error.log` - Solo errores

## 🔄 Deployment

### On-Premise (Servidor Local)
```bash
npm install
npm start
```

### AWS (Cloud)
```bash
# Configurar variables de entorno en AWS
# Usar PM2 o similar para gestión de procesos
pm2 start src/index.js --name results-service
```

## 📞 Soporte

Para reportar problemas o sugerencias, contactar al equipo de desarrollo.

## 📄 Licencia

MIT - Laboratorio Elizabeth Gutiérrez

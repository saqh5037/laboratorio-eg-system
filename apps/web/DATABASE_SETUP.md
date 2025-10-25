# 📊 Configuración de Base de Datos PostgreSQL - Laboratorio EG

## 🚀 Setup Rápido

### 1. Prerequisitos

- PostgreSQL 14+ instalado
- Node.js 18+ instalado
- NPM o Yarn

### 2. Instalación de PostgreSQL

#### macOS
```bash
# Con Homebrew
brew install postgresql@14
brew services start postgresql@14

# Crear usuario y base de datos
createuser -s labsis_user
createdb labsis_dev
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql

# Crear usuario y base de datos
sudo -u postgres createuser labsis_user
sudo -u postgres createdb labsis_dev
```

#### Windows
- Descargar instalador desde https://www.postgresql.org/download/windows/
- Seguir el wizard de instalación
- Usar pgAdmin para crear usuario y base de datos

### 3. Configuración de Variables de Entorno

1. Copiar archivo de ejemplo:
```bash
cp .env.example .env
```

2. Editar `.env` con tus credenciales:
```env
# PostgreSQL Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=labsis_dev
DB_USER=labsis_user
DB_PASSWORD=tu_password_seguro
DB_SSL=false
```

### 4. Estructura de Base de Datos Labsis

#### Tablas Principales

```sql
-- Tabla de pruebas (estudios individuales)
CREATE TABLE prueba (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    sinonimos TEXT,
    area_id INTEGER,
    tipo_muestra_id INTEGER,
    tipo_contenedor_id INTEGER,
    precio_base DECIMAL(10,2),
    dias_entrega INTEGER DEFAULT 1,
    preparacion TEXT,
    indicaciones TEXT,
    valores_referencia TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de grupos de pruebas (perfiles/paquetes)
CREATE TABLE grupo_prueba (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    precio_base DECIMAL(10,2),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Relación muchos a muchos entre grupos y pruebas
CREATE TABLE gp_has_prueba (
    id SERIAL PRIMARY KEY,
    grupo_prueba_id INTEGER REFERENCES grupo_prueba(id),
    prueba_id INTEGER REFERENCES prueba(id),
    UNIQUE(grupo_prueba_id, prueba_id)
);

-- Listas de precios (tarifarios)
CREATE TABLE lista_precios (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    factor_multiplicador DECIMAL(5,2) DEFAULT 1.00,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Precios específicos por prueba y lista
CREATE TABLE lista_precios_has_prueba (
    id SERIAL PRIMARY KEY,
    lista_precios_id INTEGER REFERENCES lista_precios(id),
    prueba_id INTEGER REFERENCES prueba(id),
    precio DECIMAL(10,2) NOT NULL,
    descuento DECIMAL(5,2) DEFAULT 0,
    UNIQUE(lista_precios_id, prueba_id)
);

-- Precios específicos por grupo y lista
CREATE TABLE lista_precios_has_gprueba (
    id SERIAL PRIMARY KEY,
    lista_precios_id INTEGER REFERENCES lista_precios(id),
    grupo_prueba_id INTEGER REFERENCES grupo_prueba(id),
    precio DECIMAL(10,2) NOT NULL,
    descuento DECIMAL(5,2) DEFAULT 0,
    UNIQUE(lista_precios_id, grupo_prueba_id)
);

-- Tablas de contexto
CREATE TABLE area (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true
);

CREATE TABLE tipo_muestra (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true
);

CREATE TABLE tipo_contenedor (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    color VARCHAR(50),
    descripcion TEXT,
    activo BOOLEAN DEFAULT true
);

-- Índices para optimización
CREATE INDEX idx_prueba_area ON prueba(area_id);
CREATE INDEX idx_prueba_codigo ON prueba(codigo);
CREATE INDEX idx_prueba_nombre ON prueba(nombre);
CREATE INDEX idx_grupo_codigo ON grupo_prueba(codigo);
CREATE INDEX idx_grupo_nombre ON grupo_prueba(nombre);
CREATE INDEX idx_lista_precios_prueba ON lista_precios_has_prueba(lista_precios_id, prueba_id);
CREATE INDEX idx_lista_precios_grupo ON lista_precios_has_gprueba(lista_precios_id, grupo_prueba_id);
```

### 5. Datos de Ejemplo

```sql
-- Insertar áreas
INSERT INTO area (codigo, nombre) VALUES
('HEM', 'Hematología'),
('QC', 'Química Clínica'),
('MIC', 'Microbiología'),
('INM', 'Inmunología'),
('HOR', 'Hormonas');

-- Insertar tipos de muestra
INSERT INTO tipo_muestra (codigo, nombre) VALUES
('SANG', 'Sangre'),
('ORI', 'Orina'),
('HEC', 'Heces'),
('ESP', 'Esputo'),
('SEC', 'Secreciones');

-- Insertar tipos de contenedor
INSERT INTO tipo_contenedor (codigo, nombre, color) VALUES
('ROJO', 'Tubo Rojo', '#FF0000'),
('LILA', 'Tubo Lila/EDTA', '#800080'),
('AZUL', 'Tubo Azul/Citrato', '#0000FF'),
('VERDE', 'Tubo Verde/Heparina', '#00FF00'),
('GRIS', 'Tubo Gris/Fluoruro', '#808080');

-- Insertar lista de precios base
INSERT INTO lista_precios (codigo, nombre, descripcion) VALUES
('GENERAL', 'Lista General', 'Precios generales al público'),
('CONVENIO', 'Convenio Empresas', 'Precios especiales para empresas'),
('SEGURO', 'Aseguradoras', 'Precios para compañías de seguros');

-- Insertar pruebas de ejemplo
INSERT INTO prueba (codigo, nombre, descripcion, area_id, tipo_muestra_id, tipo_contenedor_id, precio_base, dias_entrega) VALUES
('HEM001', 'Hemograma Completo', 'Conteo completo de células sanguíneas', 1, 1, 2, 150.00, 1),
('QC001', 'Glucosa', 'Medición de glucosa en sangre', 2, 1, 1, 80.00, 1),
('QC002', 'Perfil Lipídico', 'Colesterol total, HDL, LDL, Triglicéridos', 2, 1, 1, 250.00, 1),
('HOR001', 'TSH', 'Hormona Estimulante de Tiroides', 5, 1, 1, 180.00, 2),
('MIC001', 'Urocultivo', 'Cultivo de orina para bacterias', 3, 2, NULL, 200.00, 3);

-- Insertar grupo de pruebas
INSERT INTO grupo_prueba (codigo, nombre, descripcion, precio_base) VALUES
('PERFIL001', 'Perfil Básico', 'Estudios básicos de rutina', 400.00),
('CHECK001', 'Check-up Ejecutivo', 'Evaluación completa de salud', 1500.00);

-- Relacionar pruebas con grupos
INSERT INTO gp_has_prueba (grupo_prueba_id, prueba_id) VALUES
(1, 1), -- Perfil Básico incluye Hemograma
(1, 2), -- Perfil Básico incluye Glucosa
(2, 1), -- Check-up incluye Hemograma
(2, 2), -- Check-up incluye Glucosa
(2, 3), -- Check-up incluye Perfil Lipídico
(2, 4); -- Check-up incluye TSH

-- Insertar precios específicos
INSERT INTO lista_precios_has_prueba (lista_precios_id, prueba_id, precio) VALUES
(1, 1, 150.00),
(1, 2, 80.00),
(1, 3, 250.00),
(1, 4, 180.00),
(1, 5, 200.00);

INSERT INTO lista_precios_has_gprueba (lista_precios_id, grupo_prueba_id, precio) VALUES
(1, 1, 400.00),
(1, 2, 1500.00);
```

## 🔧 Comandos Útiles

### Iniciar el Servidor

```bash
# Solo el servidor API
npm run dev:server

# Solo el frontend
npm run dev

# Ambos en paralelo
npm run dev:all
```

### Probar Conexión a Base de Datos

```bash
npm run db:test
```

### Verificar Estado del Servidor

```bash
# Health check
curl http://localhost:3001/api/health

# Estadísticas del caché
curl http://localhost:3001/api/cache/stats

# Estadísticas generales
curl http://localhost:3001/api/statistics
```

## 🔍 Troubleshooting

### Error: ECONNREFUSED

**Problema:** No se puede conectar a PostgreSQL

**Soluciones:**
1. Verificar que PostgreSQL esté corriendo:
   ```bash
   # macOS
   brew services list | grep postgresql
   
   # Linux
   sudo systemctl status postgresql
   
   # Windows
   # Verificar en Servicios de Windows
   ```

2. Verificar puerto y host en `.env`

3. Verificar credenciales de usuario:
   ```bash
   psql -U labsis_user -d labsis_dev -h localhost
   ```

### Error: Database does not exist

**Solución:**
```bash
createdb labsis_dev
```

### Error: Permission denied

**Solución:**
```sql
-- Conectar como superusuario
psql -U postgres

-- Dar permisos
GRANT ALL PRIVILEGES ON DATABASE labsis_dev TO labsis_user;
```

### Error: Table does not exist

**Solución:** Ejecutar el script de creación de tablas (sección 4)

### Modo Fallback

Si la base de datos no está disponible, el servidor iniciará en **modo fallback**:
- Usa datos cacheados en memoria
- Sirve archivos JSON estáticos
- Permite operaciones de solo lectura

## 🚀 Optimizaciones

### Pool de Conexiones

El sistema usa un pool optimizado:
- **Desarrollo:** 20 conexiones máximo
- **Producción:** 50 conexiones máximo
- Timeout de idle: 30 segundos
- Reconexión automática con retry logic

### Sistema de Caché

- **NodeCache** en memoria
- TTL configurable por endpoint
- Fallback a archivos JSON
- Pre-calentamiento al iniciar

### Retry Logic

- 5 reintentos por defecto
- Exponential backoff
- Fallback automático si falla

## 📈 Monitoreo

### Métricas Disponibles

```javascript
// En el frontend
import { useHealthCheck, useCacheManagement } from './hooks/useLabDatabase';

// Health check cada 30 segundos
const { health, isHealthy } = useHealthCheck(30000);

// Gestión de caché
const { stats, invalidateCache, flushCache } = useCacheManagement();
```

### Logs del Servidor

El servidor registra:
- Todas las queries en desarrollo
- Errores de conexión
- Estadísticas de caché
- Uso de memoria cada minuto

## 🔒 Seguridad

### Configuraciones Implementadas

1. **Helmet.js** para headers de seguridad
2. **CORS** configurado para origenes específicos
3. **Rate limiting** (100 req/min por IP)
4. **Validación de inputs**
5. **SQL injection prevention** con queries parametrizadas
6. **Compression** de respuestas

### Variables de Entorno

**NUNCA** subir `.env` a control de versiones. Usar:
- `.env.example` para plantilla
- Variables de entorno del sistema en producción
- Secrets management service (AWS Secrets, etc.)

## 📝 API Endpoints

### Pruebas
- `GET /api/pruebas` - Listar pruebas
- `GET /api/pruebas/:id` - Obtener prueba por ID
- `GET /api/pruebas/codigo/:codigo` - Buscar por código

### Grupos
- `GET /api/grupos` - Listar grupos
- `GET /api/grupos/:id` - Obtener grupo con pruebas

### Búsqueda
- `GET /api/search?q=termino` - Búsqueda global

### Áreas y Tipos
- `GET /api/areas` - Listar áreas
- `GET /api/tipos-muestra` - Tipos de muestra
- `GET /api/tipos-contenedor` - Tipos de contenedor

### Listas de Precios
- `GET /api/listas-precios` - Listar tarifarios
- `GET /api/listas-precios/:id/items` - Items con precios

### Administración
- `GET /api/health` - Health check
- `GET /api/cache/stats` - Estadísticas de caché
- `POST /api/cache/invalidate` - Invalidar caché
- `POST /api/cache/warm-up` - Pre-calentar caché

## 🤝 Soporte

Para problemas específicos con la base de datos Labsis, contactar:
- Administrador de Base de Datos
- Equipo de Desarrollo
- Documentación interna de Labsis

---

**Última actualización:** Agosto 2025  
**Versión:** 1.0.0
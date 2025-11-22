# Backup Pre-Migración Multi-Laboratorio

**Fecha:** 2025-11-19
**Propósito:** Backup completo ANTES de implementar arquitectura multi-laboratorio con DBs separadas

## Contexto

Este backup se creó como medida de seguridad antes de migrar a una arquitectura multi-laboratorio donde cada laboratorio tendrá sus propias bases de datos completamente aisladas.

**Situación actual:**
- 1 base de datos compartida: `labsisEG` (datos operacionales)
- 1 base de datos de configuración: `lis_bot_comunicacion`
- Sistema de "cambio de configuración" (no verdadero multi-tenant)

**Objetivo de migración:**
- 3 pares de bases de datos separadas (1 por laboratorio)
- Aislamiento total de datos
- Sistema de cambio de contexto (cambiar entre laboratorios)

---

## Contenido del Backup

### 📦 Bases de Datos SQL

| Archivo | Tamaño | Descripción |
|---------|--------|-------------|
| `sql/labsisEG_full.backup` | 761 MB | Base de datos operacional completa (200+ tablas) |
| `sql/lis_bot_comunicacion_full.backup` | 255 KB | Base de datos de configuración (33 tablas) |

**Formato:** PostgreSQL custom format (pg_dump -Fc)
**Compresión:** Incluida en formato custom
**Restauración:** Usar `pg_restore`

### 📄 Configuraciones JSON

| Archivo | Tamaño | Descripción |
|---------|--------|-------------|
| `json/elizabeth-gutierrez-complete.json` | 43 KB | Config completa Lab EG (Venezuela, 1981) |
| `json/microtec-complete.json` | 45 KB | Config completa MICRO-TEC (1995) |
| `json/dimogen-v13-final.json` | 62 KB | Config completa DIMOGEN (México, 2015) - Versión V13 FINAL |
| `json/dimogen-current.json` | 44 KB | Configuración actualmente activa (DIMOGEN) |

**Formato:** JSON (versión 2.0.0 del sistema de backups)
**Contenido:** 11 tablas de configuración (company_info, theme_config, navigation, carousel, landing_*)

---

## Laboratorios Incluidos

### 1. Elizabeth Gutiérrez (Venezuela)

**Datos:**
- País: Venezuela
- Ciudad: Caracas, Distrito Capital
- Fundación: 1981 (43 años)
- Teléfono: +58 212 762.0561
- WhatsApp: +58 414 901.9327
- Email: info@laboratorioeg.com

**Backup ID en BD:** 11 (`elizabeth-gutierrez-complete`)

### 2. MICRO-TEC (Venezuela)

**Datos:**
- País: Venezuela
- Ciudad: Caracas
- Fundación: 1995 (30 años)
- Teléfono: +58 212 555.1234
- WhatsApp: +58 414 555.7890
- Email: info@microtec.com.ve

**Backup ID en BD:** 12 (`microtec-complete`)

### 3. DIMOGEN (México) ⭐ ACTIVO

**Datos:**
- País: México
- Ciudad: Ciudad de México, Roma Sur
- Fundación: 2015 (10 años)
- Teléfono: 56 1033 5124
- WhatsApp: +52 56 1045 4458
- Email: hola@dimogen.com.mx
- Instagram: @dimogenmx

**Backup ID en BD:** 24 (`dimogen-profesional-completo-v13-final`)

---

## Cómo Usar Este Backup

### Escenario 1: Rollback Completo (si la migración falla)

Si la migración a multi-laboratorio falla y necesitas volver al estado original:

\`\`\`bash
# 1. Ir al directorio de backups
cd /Users/samuelquiroz/Documents/proyectos/laboratorio-eg-system/backups/2025-11-19-pre-migration

# 2. Restaurar ambas bases de datos
./scripts/RESTORE.sh both

# 3. Reiniciar servicios
cd ../..
npm run dev
\`\`\`

### Escenario 2: Restaurar Solo Configuración

Si solo necesitas restaurar la configuración de un laboratorio:

\`\`\`bash
# Opción A: Via Panel Admin
# 1. Ve a http://localhost:5173/admin/backups
# 2. Click "Importar configuración"
# 3. Selecciona dimogen-v13-final.json (o el que necesites)

# Opción B: Via API
TOKEN=$(curl -s -X POST http://localhost:3005/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"username":"admin","password":"admin123"}' \\
  | jq -r '.token')

curl -X POST http://localhost:3005/api/backup/import \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d @json/dimogen-v13-final.json
\`\`\`

### Escenario 3: Clonar Base de Datos para Pruebas

Si quieres crear una copia de la DB para pruebas sin afectar producción:

\`\`\`bash
# Crear DB de pruebas
createdb labsisEG_test

# Restaurar backup en DB de pruebas
PGPASSWORD='labsis' pg_restore \\
  -h localhost \\
  -U labsis \\
  -d labsisEG_test \\
  --verbose \\
  sql/labsisEG_full.backup
\`\`\`

---

## Migración Planeada (Post-Backup)

### Arquitectura Nueva

\`\`\`
ANTES (actual):
┌─────────────────────────────────┐
│ labsisEG (compartida)           │  ❌ No hay aislamiento
│ lis_bot_comunicacion (config)  │
└─────────────────────────────────┘

DESPUÉS (objetivo):
┌─────────────────────────────────┐
│ labsisEG_elizabeth_gutierrez    │  ✅ Aislamiento total
│ lis_bot_comunicacion_eg         │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ labsisEG_microtec               │
│ lis_bot_comunicacion_microtec   │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ labsisEG_dimogen                │
│ lis_bot_comunicacion_dimogen    │
└─────────────────────────────────┘
\`\`\`

### Pasos de Migración (FASE 2)

1. Crear 6 bases de datos nuevas (2 por laboratorio)
2. Clonar estructura de `labsisEG` a las 3 DBs operacionales
3. Restaurar configuraciones JSON en DBs separadas
4. Modificar código para soportar multi-DB
5. Testing exhaustivo
6. Switch gradual a nueva arquitectura

---

## Verificación de Integridad

### Verificar Backups SQL

\`\`\`bash
# Listar contenido del backup (sin restaurar)
PGPASSWORD='labsis' pg_restore --list sql/labsisEG_full.backup | head -20

# Verificar tamaño
du -h sql/*.backup
\`\`\`

### Verificar Configuraciones JSON

\`\`\`bash
# Verificar que sean JSON válidos
for file in json/*.json; do
    echo "Verificando $file..."
    jq empty "$file" && echo "✓ Válido" || echo "✗ Inválido"
done

# Ver configuración de un laboratorio
jq '.data.company_info[0].name' json/dimogen-v13-final.json
\`\`\`

### Contar Tablas en Backups

\`\`\`bash
# Contar tablas en labsisEG
PGPASSWORD='labsis' pg_restore --list sql/labsisEG_full.backup | grep "TABLE DATA" | wc -l

# Debería ser ~200 tablas
\`\`\`

---

## Información Técnica

### Sistema

- **PostgreSQL:** 14.18 on x86_64-apple-darwin23.6.0
- **Monorepo:** Turborepo
- **Aplicaciones:** 5 (web, results-api, sync-service, messaging-bot, config-api)

### Tablas Críticas en labsisEG

- `paciente` - Datos de pacientes
- `orden_trabajo` - Órdenes de trabajo
- `resultado` - Resultados de análisis
- `lista_precios` - Precios de estudios
- `articulo` - Catálogo de estudios

### Tablas de Configuración en lis_bot_comunicacion

- `company_info` - Info de empresa (1 registro único)
- `theme_config` - Configuración de tema
- `navigation_items` - Menús dinámicos
- `carousel_slides` - Carrusel landing
- `landing_*` (8 tablas) - Contenido de landing page
- `configuration_backups` - Historial de backups

---

## Troubleshooting

### Error: "database already exists"

\`\`\`bash
# Solución: Drop y recrear
PGPASSWORD='labsis' psql -h localhost -U labsis -d postgres \\
  -c "DROP DATABASE IF EXISTS labsisEG;"

PGPASSWORD='labsis' psql -h localhost -U labsis -d postgres \\
  -c "CREATE DATABASE labsisEG;"

# Luego restore normalmente
\`\`\`

### Error: "role does not exist"

\`\`\`bash
# Crear role si no existe
PGPASSWORD='labsis' psql -h localhost -U labsis -d postgres \\
  -c "CREATE ROLE labsis LOGIN PASSWORD 'labsis';"
\`\`\`

### JSON "token inválido" al importar

\`\`\`bash
# Obtener nuevo token (expiran en 24h)
TOKEN=$(curl -s -X POST http://localhost:3005/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"username":"admin","password":"admin123"}' \\
  | jq -r '.token')

echo "Nuevo token: $TOKEN"
\`\`\`

---

## Seguridad

⚠️ **ADVERTENCIAS:**

1. Este backup contiene datos sensibles de pacientes
2. No compartir ni subir a repositorios públicos
3. Almacenar en ubicación segura con encriptación
4. Cumplir con regulaciones de privacidad (HIPAA, etc.)

🔐 **RECOMENDACIONES:**

1. Encriptar backups si se almacenan fuera del servidor
2. Rotar backups regularmente (retención 30 días)
3. Probar restore periódicamente
4. Mantener backups en múltiples ubicaciones
5. Documentar procedimientos de disaster recovery

---

## Metadata

**Creado por:** Script `scripts/backup-complete.sh`
**Timestamp:** 2025-11-19
**Formato de backup:** PostgreSQL custom format + JSON
**Versión sistema:** 1.0.0
**Ambiente:** development

**Checksums:**

\`\`\`bash
# Generar checksums para verificación
md5 sql/*.backup json/*.json > checksums.txt
\`\`\`

---

## Contacto

Para soporte o dudas sobre este backup, contactar al administrador del sistema.

**Última actualización:** 2025-11-19

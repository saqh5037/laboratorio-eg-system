# Multi-Laboratory Deployment System

Este directorio contiene las herramientas para desplegar instancias independientes del sistema de laboratorio para múltiples clientes.

## Arquitectura Multi-Tenant

```
┌─────────────────────────────────────────────────────────────────┐
│                        GitHub Repository                         │
│                     (Código fuente único)                        │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GitHub Actions CI/CD                          │
│              (Build de imágenes Docker genéricas)                │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                  GitHub Container Registry                       │
│                   (ghcr.io/your-org/lab-*)                       │
└───────────────────────────┬─────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            ▼               ▼               ▼
    ┌───────────┐   ┌───────────┐   ┌───────────┐
    │  Lab EG   │   │  Dimogen  │   │  Microtec │
    │ Instance  │   │ Instance  │   │ Instance  │
    └───────────┘   └───────────┘   └───────────┘
         │               │               │
         ▼               ▼               ▼
    ┌─────────┐   ┌─────────┐   ┌─────────┐
    │labsisEG │   │labsisDim│   │labsisMic│
    │lis_bot  │   │lis_bot  │   │lis_bot  │
    └─────────┘   └─────────┘   └─────────┘
```

## Estructura de Archivos

```
deployment/
├── README.md                    # Esta documentación
├── setup-new-instance.sh        # Script interactivo para crear nueva instancia
├── templates/
│   ├── .env.template            # Template de variables de entorno
│   └── docker-compose.template.yml  # Template de Docker Compose
└── instances/                   # Configuraciones generadas (gitignored)
    ├── eg/
    │   ├── .env
    │   ├── docker-compose.yml
    │   ├── init-database.sql
    │   └── README.md
    ├── dimogen/
    └── microtec/
```

## Crear Nueva Instancia

### 1. Ejecutar el Script de Setup

```bash
cd deployment
./setup-new-instance.sh
```

El script te guiará para configurar:
- **Código de laboratorio** (ej: `eg`, `dimogen`, `microtec`)
- **Nombre completo** (ej: "Laboratorio Elizabeth Gutiérrez")
- **Base de datos** (nombres y credenciales)
- **URL pública** (dominio o IP)
- **Tokens de servicios** (Telegram, Twilio, Gemini)
- **Puertos** (si necesitas usar puertos diferentes al default)

### 2. Revisar Configuración

```bash
cd instances/<lab-code>
cat .env                    # Variables de entorno
cat docker-compose.yml      # Servicios Docker
cat README.md               # Instrucciones específicas
```

### 3. Copiar al Servidor

```bash
scp -r instances/<lab-code> user@server:/opt/labs/
```

### 4. Inicializar en el Servidor

```bash
ssh user@server
cd /opt/labs/<lab-code>

# Crear bases de datos
sudo -u postgres psql -f init-database.sql

# Iniciar servicios
./start.sh

# Ejecutar migraciones
docker exec -it lab-<code>-config-api npm run migrate

# Ver logs
./logs.sh
```

## Configuración Post-Deployment

### Acceder al Panel de Administración

1. Abrir `http://<PUBLIC_URL>:3005/` (Config API)
2. Login con credenciales default: `admin` / `admin123`
3. **IMPORTANTE:** Cambiar contraseña inmediatamente

### Configurar Branding del Laboratorio

En el panel de admin, configurar:

1. **Información de Empresa** (`/api/company`)
   - Nombre, slogan, RIF
   - Teléfonos, email, WhatsApp
   - Dirección y horarios
   - Redes sociales

2. **Tema Visual** (`/api/theme`)
   - Colores primario y secundario
   - Colores de fondo
   - Fuentes

3. **PWA** (se configura automáticamente desde company_info)
   - Nombre de la app
   - Íconos
   - Colores del manifest

4. **Logos**
   - Subir logo principal
   - Subir ícono (para PWA)
   - Favicon

## Imágenes Docker

Las imágenes se construyen automáticamente via GitHub Actions cuando hay cambios en `main`:

| Imagen | Descripción |
|--------|-------------|
| `ghcr.io/your-org/lab-web` | Frontend PWA (Nginx) |
| `ghcr.io/your-org/lab-config-api` | API de configuración |
| `ghcr.io/your-org/lab-results-api` | API de resultados |
| `ghcr.io/your-org/lab-messaging-bot` | Bot de mensajería |
| `ghcr.io/your-org/lab-sync-service` | Servicio de sincronización |

### Tags Disponibles

- `latest` - Última versión de main
- `v1.0.0` - Versiones específicas (semver)
- `sha-abc1234` - Commits específicos

## Puertos por Defecto

| Servicio | Puerto |
|----------|--------|
| Web (Nginx) | 80 |
| Sync Service | 3002 |
| Results API | 3003 |
| Messaging Bot | 3004 |
| Config API | 3005 |
| Config WebSocket | 3006 |

Para múltiples instancias en el mismo servidor, usar puertos diferentes:

```
Lab EG:      80, 3002-3006
Dimogen:    8080, 3012-3016
Microtec:   8081, 3022-3026
```

## Bases de Datos

Cada instancia requiere 2 bases de datos PostgreSQL:

1. **labsisXX** - Datos del laboratorio (estudios, pacientes, resultados)
   - Se conecta al sistema existente LABSIS
   - Read-only para algunos servicios

2. **lis_bot_comunicacionXX** - Configuración y bot
   - Información de empresa
   - Tema visual
   - Configuración de navegación
   - Datos del bot de mensajería

## Actualizaciones

Para actualizar una instancia:

```bash
cd /opt/labs/<lab-code>
./update.sh
```

Esto:
1. Descarga las últimas imágenes
2. Reinicia los contenedores
3. Mantiene los volúmenes de datos

## Troubleshooting

### Ver logs de todos los servicios
```bash
./logs.sh
```

### Ver logs de un servicio específico
```bash
./logs.sh config-api
./logs.sh web
```

### Reiniciar un servicio
```bash
docker compose restart config-api
```

### Verificar salud de servicios
```bash
docker compose ps
curl http://localhost:3005/health
```

### Reconstruir desde cero
```bash
docker compose down -v  # CUIDADO: borra volúmenes
docker compose up -d
```

## Seguridad

1. **NUNCA** subir archivos `.env` a Git
2. Usar secretos diferentes para cada instancia
3. Configurar firewall para exponer solo puertos necesarios
4. Usar HTTPS en producción (configurar Nginx/proxy)
5. Cambiar credenciales default inmediatamente

## Soporte

Para problemas o preguntas:
- Revisar logs: `./logs.sh`
- Verificar health: `curl localhost:3005/health`
- Contactar al equipo de desarrollo

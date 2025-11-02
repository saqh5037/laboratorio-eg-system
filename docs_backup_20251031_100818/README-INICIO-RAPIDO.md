# Laboratorio EG - Guía de Inicio Rápido

## Iniciar el Sistema Completo

### 1. Iniciar Backend + Frontend

```bash
cd /Users/samuelquiroz/Documents/proyectos/Test-Directory-EG/laboratorio-eg
npm run dev:all
```

Esto inicia:
- ✅ Frontend en http://localhost:5173
- ✅ Backend API en http://localhost:3001

### 2. Iniciar Sync Service (en otra terminal)

```bash
cd /Users/samuelquiroz/Documents/proyectos/Test-Directory-EG/sync-service
npm run dev
```

Esto inicia:
- ✅ Sync Service en http://localhost:3002
- ✅ Listener automático de cambios de precios
- ✅ Generación automática de JSON

### 3. Verificar que todo funciona

```bash
# Verificar servicios
curl http://localhost:5173
curl http://localhost:3001/api/statistics
curl http://localhost:3002
```

---

## URLs Principales

- 🌐 **Aplicación Web:** http://localhost:5173
- 🔧 **API Backend:** http://localhost:3001/api
- 🔄 **Sync Service:** http://localhost:3002
- 📊 **Estudios:** http://localhost:5173/estudios

---

## Flujo de Trabajo Diario

### Hacer cambios de precio en Labsis:

1. **Abre Labsis** y modifica precios en la lista ID 27
2. **Espera 2-3 segundos** (sincronización automática)
3. **Refresca el navegador:** Cmd+Shift+R (Mac) o Ctrl+Shift+R (Windows)
4. **Verifica los cambios** en http://localhost:5173/estudios

**¡Eso es todo!** El sistema hace el resto automáticamente.

---

## Comandos Útiles

### Sincronización manual (si es necesario):

```bash
cd /Users/samuelquiroz/Documents/proyectos/Test-Directory-EG/sync-service
node scripts/manual-sync.js
```

### Limpiar cache del backend:

```bash
curl -X POST http://localhost:3001/api/cache/flush
```

### Ver logs del sync-service:

Los logs se muestran automáticamente en la terminal donde lo iniciaste.
Busca estos mensajes:

```
🔔 Notificación recibida        # Cambio detectado
⏱️ Debounce completado          # Iniciando sincronización
📋 JSON copiado a proyecto web  # Éxito
✅ Sincronización completada    # Todo OK
```

### Matar procesos si hay problemas:

```bash
# Matar todos los servicios
lsof -ti:3001 | xargs kill -9  # Backend
lsof -ti:3002 | xargs kill -9  # Sync Service
lsof -ti:5173 | xargs kill -9  # Frontend

# Reiniciar todo
cd /Users/samuelquiroz/Documents/proyectos/Test-Directory-EG/laboratorio-eg
npm run dev:all

# En otra terminal
cd /Users/samuelquiroz/Documents/proyectos/Test-Directory-EG/sync-service
npm run dev
```

---

## Troubleshooting Rápido

### Problema: "No veo cambios de precio"

**Solución:**
1. Hard refresh: **Cmd+Shift+R** (Mac) o **Ctrl+Shift+R** (Windows)
2. Verifica que sync-service esté corriendo
3. Mira los logs del sync-service

### Problema: "Error EADDRINUSE"

**Solución:** Un servicio ya está corriendo en ese puerto
```bash
# Matar proceso en el puerto
lsof -ti:3001 | xargs kill -9
# O reiniciar el servicio
```

### Problema: "JSON no se actualiza"

**Solución:**
1. Verifica que sync-service esté corriendo
2. Mira los logs para errores
3. Sincronización manual:
   ```bash
   cd sync-service
   node scripts/manual-sync.js
   ```

---

## Estructura de Directorios

```
Test-Directory-EG/
├── laboratorio-eg/              # Aplicación principal
│   ├── server/                  # Backend API (puerto 3001)
│   ├── src/                     # Frontend React (puerto 5173)
│   └── public/data/             # JSON de precios (auto-generado)
│       └── precios.json         # ⬅️ Este archivo se actualiza automáticamente
│
├── sync-service/                # Servicio de sincronización (puerto 3002)
│   ├── src/                     # Código del servicio
│   ├── scripts/                 # Scripts manuales
│   └── output/                  # JSON generado
│       └── precios.json         # Se copia a laboratorio-eg/public/data/
│
├── SINCRONIZACION-AUTOMATICA.md # Documentación completa
└── README-INICIO-RAPIDO.md      # Esta guía
```

---

## Configuración Importante

### Base de datos:
- **Host:** localhost
- **Puerto:** 5432
- **Database:** labsisEG
- **User:** labsis
- **Password:** labsis

### Lista de precios:
- **ID:** 27
- **Nombre:** Ambulatorio_Abril_2025
- **Total estudios:** 513 (349 pruebas + 164 grupos)

### Debounce:
- **Tiempo:** 2 segundos
- **Por qué:** Agrupa múltiples cambios en una sola sincronización

---

## Contacto Rápido

**Problema con el sistema?**
1. Lee los logs en la terminal del sync-service
2. Revisa [SINCRONIZACION-AUTOMATICA.md](./SINCRONIZACION-AUTOMATICA.md) para más detalles
3. Verifica que PostgreSQL esté corriendo

**Servicios corriendo?**
```bash
lsof -ti:5173 -ti:3001 -ti:3002
# Si devuelve números = servicios corriendo ✅
# Si está vacío = servicios apagados ❌
```

---

## Última actualización

**Fecha:** 22 de Octubre, 2025
**Sistema:** Sincronización automática de precios implementado y funcionando ✅

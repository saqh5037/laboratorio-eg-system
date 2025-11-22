# 🧪 Guía de Testing Manual - Landing CMS

**URL del CMS:** http://localhost:5173/admin/landing-content

---

## 📋 Checklist de Testing

### ✅ Fase 1: Navegación y Carga Inicial

- [ ] La página carga sin errores en consola
- [ ] El sidebar muestra "Contenido Landing"
- [ ] Se muestran 7 tabs: Valores, Certificaciones, Testimonios, Contacto, Contenido, Estadísticas, Vista Previa
- [ ] El tab "Valores" está activo por defecto
- [ ] Se cargan 5 valores corporativos desde la API
- [ ] Los iconos se renderizan correctamente (FaBullseye, FaHeart, etc.)
- [ ] Las tarjetas muestran: título, descripción, toggle activo, botones editar/eliminar

---

### ✅ Fase 2: Tab "Valores" - CRUD Completo

#### Crear Nuevo Valor
- [ ] Hacer clic en botón "+ Agregar Valor"
- [ ] Modal se abre con título "Agregar Valor"
- [ ] Hacer clic en "Seleccionar Icono"
- [ ] Grid de iconos se muestra con búsqueda
- [ ] Buscar "star" en el buscador
- [ ] Seleccionar icono "FaStar"
- [ ] Icono seleccionado se muestra en preview
- [ ] Llenar formulario:
  - **Título:** "Innovación"
  - **Descripción:** "Tecnología de punta en diagnóstico médico para resultados más precisos"
  - **Orden:** 6
  - **Activo:** ✓ (checked)
- [ ] Hacer clic en "Guardar"
- [ ] Toast de éxito aparece: "Valor creado exitosamente"
- [ ] Nuevo valor aparece en la lista
- [ ] Contador muestra "6 Valores activos"

#### Editar Valor Existente
- [ ] Hacer clic en botón "Editar" del valor "Innovación"
- [ ] Modal se abre con título "Editar Valor"
- [ ] Formulario pre-cargado con datos existentes
- [ ] Cambiar descripción a: "Innovación constante en procesos de laboratorio"
- [ ] Hacer clic en "Guardar"
- [ ] Toast de éxito: "Valor actualizado exitosamente"
- [ ] Cambio reflejado en la tarjeta

#### Toggle Activo/Inactivo
- [ ] Hacer clic en toggle del valor "Innovación"
- [ ] Toast: "Valor desactivado"
- [ ] Valor se muestra con opacidad reducida
- [ ] Hacer clic en toggle nuevamente
- [ ] Toast: "Valor activado"
- [ ] Valor vuelve a opacidad normal

#### Drag & Drop Reordenamiento
- [ ] Arrastrar el valor "Innovación" (posición 6) hacia arriba
- [ ] Soltar entre "Calidad" (posición 1) y otro valor
- [ ] Toast: "Orden actualizado exitosamente"
- [ ] Los números de orden se actualizan automáticamente
- [ ] Refrescar página (F5)
- [ ] El nuevo orden persiste

#### Eliminar Valor
- [ ] Hacer clic en botón "Eliminar" del valor "Innovación"
- [ ] Aparece confirmación: "¿Estás seguro de que deseas eliminar este valor?"
- [ ] Hacer clic en "Eliminar"
- [ ] Toast: "Valor eliminado exitosamente"
- [ ] Valor desaparece de la lista
- [ ] Contador muestra "5 Valores activos"

---

### ✅ Fase 3: Tab "Certificaciones"

- [ ] Hacer clic en tab "Certificaciones"
- [ ] Se cargan 3 certificaciones
- [ ] Botón "+ Agregar Certificación" visible

#### Crear Nueva Certificación
- [ ] Hacer clic en "+ Agregar Certificación"
- [ ] Modal se abre
- [ ] Seleccionar icono "FaCertificate"
- [ ] Llenar:
  - **Título:** "Certificación ISO 15189"
  - **Descripción:** "Norma internacional para laboratorios médicos"
  - **Orden:** 4
- [ ] Guardar
- [ ] Toast de éxito
- [ ] Nueva certificación aparece

#### Validaciones
- [ ] Abrir modal para crear certificación
- [ ] Dejar título vacío y hacer clic en Guardar
- [ ] Debe aparecer error: "El título es requerido"
- [ ] Ingresar título con 200 caracteres
- [ ] Debe aparecer error: "El título no puede exceder 150 caracteres"
- [ ] Contador de caracteres debe mostrar 200/150 en rojo

---

### ✅ Fase 4: Tab "Testimonios"

- [ ] Hacer clic en tab "Testimonios"
- [ ] Se cargan 3 testimonios
- [ ] Tarjetas muestran: nombre, rol, texto, estrellas de rating

#### Crear Nuevo Testimonio
- [ ] Hacer clic en "+ Agregar Testimonio"
- [ ] Llenar:
  - **Nombre:** "María González"
  - **Rol:** "Paciente"
  - **Testimonio:** "Excelente atención y resultados rápidos. Muy recomendado."
  - **Rating:** Hacer clic en 5 estrellas
  - **Tipo de Avatar:** "initials"
- [ ] Las estrellas se pintan de amarillo al hacer hover
- [ ] Guardar
- [ ] Toast de éxito
- [ ] Nuevo testimonio aparece con avatar de iniciales "MG"
- [ ] 5 estrellas doradas visibles

#### Editar Rating
- [ ] Editar testimonio de "María González"
- [ ] Cambiar rating a 4 estrellas
- [ ] Guardar
- [ ] Tarjeta muestra 4 estrellas llenas y 1 vacía

---

### ✅ Fase 5: Tab "Información de Contacto"

- [ ] Hacer clic en tab "Información de Contacto"
- [ ] Se cargan 11 items de contacto
- [ ] Items agrupados por tipo (teléfono, email, dirección, etc.)

#### Crear Nuevo Contacto (Email)
- [ ] Hacer clic en "+ Agregar Información de Contacto"
- [ ] Seleccionar tipo: "Email"
- [ ] Llenar:
  - **Etiqueta:** "Email Ventas"
  - **Valor:** "ventas@laboratorioeg.com"
  - **Icono:** FaEnvelope
  - **Categoría:** "contact"
- [ ] Guardar
- [ ] Toast de éxito

#### Validación de Email
- [ ] Crear nuevo contacto tipo "Email"
- [ ] Ingresar valor: "correo-invalido"
- [ ] Hacer clic en Guardar
- [ ] Debe aparecer error: "Ingrese un email válido"
- [ ] Corregir a: "valido@email.com"
- [ ] Debe permitir guardar

#### Crear Contacto (WhatsApp)
- [ ] Tipo: "WhatsApp"
- [ ] Llenar:
  - **Etiqueta:** "WhatsApp Consultas"
  - **Valor:** "+58 424 1234567"
  - **Icono:** FaWhatsapp
- [ ] Guardar exitosamente

---

### ✅ Fase 6: Tab "Bloques de Contenido"

- [ ] Hacer clic en tab "Bloques de Contenido"
- [ ] Se cargan 25 bloques
- [ ] Bloques agrupados por sección

#### Crear Nuevo Bloque
- [ ] Hacer clic en "+ Agregar Bloque de Contenido"
- [ ] Llenar:
  - **Sección:** "nosotros-header"
  - **Tipo de Bloque:** "title"
  - **Contenido:** "Laboratorio de Excelencia"
  - **Orden:** 1
- [ ] Guardar
- [ ] Toast de éxito

#### Editar Bloque con Metadata
- [ ] Crear bloque tipo "image"
- [ ] En campo "Metadata (JSON):" ingresar:
  ```json
  {"width": 800, "height": 600, "alt": "Laboratorio moderno"}
  ```
- [ ] Guardar
- [ ] Editar el mismo bloque
- [ ] JSON debe estar pre-cargado correctamente
- [ ] Modificar metadata
- [ ] Guardar exitosamente

#### Validación de JSON
- [ ] Crear bloque
- [ ] En metadata ingresar: `{esto no es JSON válido`
- [ ] Hacer clic en Guardar
- [ ] Debe aparecer error: "La metadata debe ser un JSON válido"

---

### ✅ Fase 7: Tab "Estadísticas"

- [ ] Hacer clic en tab "Estadísticas"
- [ ] Se cargan 3 estadísticas
- [ ] Tarjetas muestran: valor destacado, etiqueta, descripción

#### Crear Nueva Estadística
- [ ] Hacer clic en "+ Agregar Estadística"
- [ ] Llenar:
  - **Valor:** "15,000+"
  - **Etiqueta:** "Pacientes Satisfechos"
  - **Descripción:** "Clientes atendidos en el último año"
  - **Icono:** FaUsers
- [ ] Guardar
- [ ] Toast de éxito
- [ ] Tarjeta muestra el valor "15,000+" en grande

---

### ✅ Fase 8: Tab "Vista Previa"

- [ ] Hacer clic en tab "Vista Previa"
- [ ] Se muestra iframe con la landing page
- [ ] El iframe carga: http://localhost:5173/
- [ ] Se ven los valores corporativos con sus iconos
- [ ] Se ven las certificaciones
- [ ] Se ven los testimonios con estrellas
- [ ] Botón "Abrir en nueva pestaña" visible
- [ ] Hacer clic en "Abrir en nueva pestaña"
- [ ] Landing page se abre en nueva pestaña del navegador

---

### ✅ Fase 9: Persistencia de Datos

#### Verificar en Base de Datos
- [ ] Abrir terminal y ejecutar:
  ```bash
  PGPASSWORD='labsis' psql -h localhost -U labsis -d labsisEG -c "SELECT id, title, icon_name, sort_order FROM landing_values ORDER BY sort_order;"
  ```
- [ ] Verificar que los cambios realizados en el CMS aparecen en la BD
- [ ] Los valores de sort_order deben coincidir con el orden visual

#### Verificar Refresco de Datos
- [ ] Hacer un cambio en el CMS (editar un valor)
- [ ] Abrir consola de desarrollador (F12)
- [ ] Verificar que se hace petición a: `PATCH /api/admin/landing/values/:id`
- [ ] Verificar respuesta 200 OK
- [ ] Los datos se actualizan sin recargar página completa

---

### ✅ Fase 10: Manejo de Errores

#### Error de Red (API Caída)
- [ ] Detener el servicio config-api temporalmente
- [ ] Intentar crear un nuevo valor en el CMS
- [ ] Debe aparecer toast de error: "Error al crear valor"
- [ ] No debe crashear la aplicación
- [ ] Reiniciar config-api
- [ ] Intentar nuevamente crear valor
- [ ] Debe funcionar correctamente

#### Validaciones de Formulario
- [ ] Abrir modal de crear valor
- [ ] Hacer clic en "Guardar" sin llenar nada
- [ ] Deben aparecer errores:
  - "El título es requerido"
  - "La descripción es requerida"
- [ ] Los campos con error deben tener borde rojo
- [ ] Llenar todos los campos
- [ ] Errores desaparecen
- [ ] Guardar exitosamente

---

## 🔍 Checklist de Consola del Navegador

Abrir DevTools (F12) y verificar:

### Console Tab
- [ ] No hay errores (texto rojo)
- [ ] No hay warnings críticos
- [ ] Las peticiones a `/api/landing/*` responden 200 OK

### Network Tab
- [ ] GET /api/landing/values responde con JSON válido
- [ ] POST /api/admin/landing/values crea recurso (201 Created)
- [ ] PATCH /api/admin/landing/values/:id actualiza (200 OK)
- [ ] PUT /api/admin/landing/values/reorder actualiza orden (200 OK)
- [ ] DELETE /api/admin/landing/values/:id elimina (200 OK)

### Performance
- [ ] La página carga en menos de 2 segundos
- [ ] Los modales se abren instantáneamente
- [ ] El drag & drop es fluido sin lag
- [ ] Los toasts aparecen y desaparecen suavemente

---

## 📊 Métricas de Éxito

| Criterio | Objetivo | Estado |
|----------|----------|--------|
| **Carga inicial** | < 2 segundos | ⏳ |
| **CRUD Valores** | 100% funcional | ⏳ |
| **CRUD Certificaciones** | 100% funcional | ⏳ |
| **CRUD Testimonios** | 100% funcional | ⏳ |
| **CRUD Contacto** | 100% funcional | ⏳ |
| **CRUD Contenido** | 100% funcional | ⏳ |
| **CRUD Estadísticas** | 100% funcional | ⏳ |
| **Drag & Drop** | Funcionando | ⏳ |
| **Validaciones** | Todas activas | ⏳ |
| **Persistencia** | Datos en BD | ⏳ |
| **Sin errores consola** | 0 errores | ⏳ |

---

## 🐛 Registro de Bugs Encontrados

Si encuentras algún error durante el testing, documéntalo aquí:

### Bug #1
- **Fecha:**
- **Área:** (Ej: Tab Valores, Modal de editar)
- **Descripción:**
- **Pasos para reproducir:**
  1.
  2.
  3.
- **Error en consola:**
- **Severidad:** (Crítico / Alto / Medio / Bajo)
- **Estado:** (Pendiente / En progreso / Resuelto)

---

## ✅ Conclusión del Testing Manual

Una vez completados todos los checkboxes, llenar:

- **Fecha de testing:** _____________
- **Tests completados:** _____ / 100
- **Bugs encontrados:** _____
- **Bugs críticos:** _____
- **Estado general:** 🟢 Aprobado / 🟡 Con observaciones / 🔴 Requiere correcciones

---

**Siguiente paso:** Si se encuentran errores, documentarlos, corregirlos, y ejecutar segundo round de testing.

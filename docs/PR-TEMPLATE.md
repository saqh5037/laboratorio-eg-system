# Pull Request Template

**Tipo de cambio:** (marca con `x`)
- [ ] Bugfix (fix de bug sin breaking changes)
- [ ] Feature (nueva funcionalidad sin breaking changes)
- [ ] Breaking Change (cambio que afecta compatibilidad)
- [ ] Hotfix (fix crítico que debe ir directo a producción)
- [ ] Refactor (cambio de código sin afectar funcionalidad)
- [ ] Documentation (solo cambios en documentación)
- [ ] DevOps/CI (cambios en workflows, deployment, configuración)

---

## 📋 Descripción

**¿Qué hace este PR?**

(Describe brevemente los cambios implementados)

**¿Por qué es necesario este cambio?**

(Explica el problema que resuelve o la mejora que aporta)

**Issue relacionado:**

Closes #ISSUE_NUMBER (si aplica)

---

## 🔄 Cambios Realizados

### Frontend
- (Lista los cambios en apps/web, si aplica)
- Ejemplo: Agregado componente HistoricoCell para tooltips
- Ejemplo: Mejorado diseño del toggle histórico

### Backend
- (Lista los cambios en apps/results-api, apps/messaging-bot, etc., si aplica)
- Ejemplo: Agregado endpoint /api/health/db
- Ejemplo: Optimizado query de últimos 3 resultados

### Database
- [ ] ¿Incluye migraciones de base de datos?
  - Si marcaste ✅, especifica: `migrations/NOMBRE_ARCHIVO.sql`

### Infraestructura/DevOps
- (Lista cambios en workflows, Docker, deployment scripts, si aplica)
- Ejemplo: Agregado workflow 06-create-release.yml

---

## 🧪 Testing

### Probado en:
- [ ] Local (desarrollo)
- [ ] Staging (pre-producción)
- [ ] Producción (si aplica para hotfix)

### Casos de prueba ejecutados:

1. **(Describe el caso de prueba)**
   - **Entrada:** (qué hiciste)
   - **Resultado esperado:** (qué debería pasar)
   - **Resultado obtenido:** (qué pasó realmente)
   - **Status:** ✅ Pasó / ❌ Falló

2. **(Otro caso de prueba)**
   - **Entrada:**
   - **Resultado esperado:**
   - **Resultado obtenido:**
   - **Status:**

### Tests automatizados:
- [ ] Unit tests agregados/actualizados
- [ ] Integration tests agregados/actualizados
- [ ] E2E tests agregados/actualizados
- [ ] ❌ No se agregaron tests (justificar abajo si aplica)

**Justificación si no hay tests:**
(Explicar por qué no se agregaron tests, si aplica)

---

## 📸 Screenshots / Videos

**Antes:**

(Screenshot o descripción del estado anterior, si aplica)

**Después:**

(Screenshot o descripción del estado nuevo, si aplica)

**Demo:**

(Link a video demo o GIF si aplica, especialmente para features visuales)

---

## 🔒 Seguridad

- [ ] ¿Este PR maneja datos sensibles? (passwords, tokens, PII)
  - Si ✅: ¿Están protegidos correctamente? (hashing, encryption, secrets)

- [ ] ¿Este PR expone nuevos endpoints?
  - Si ✅: ¿Tienen autenticación/autorización?

- [ ] ¿Este PR modifica queries SQL?
  - Si ✅: ¿Están protegidos contra SQL injection? (prepared statements, parameterized queries)

- [ ] ¿Este PR acepta input de usuarios?
  - Si ✅: ¿Está validado y sanitizado?

---

## 🚀 Deployment

### ¿Requiere cambios manuales en deployment?
- [ ] Sí (especificar abajo)
- [ ] No

**Cambios manuales necesarios:**
(Ejemplo: agregar nueva variable de entorno, ejecutar migración, reiniciar servicio específico)

### ¿Requiere coordinación con otros equipos?
- [ ] Sí (especificar abajo)
- [ ] No

**Coordinación necesaria:**
(Ejemplo: notificar a usuarios, coordinar downtime, etc.)

### ¿Es un Breaking Change?
- [ ] Sí (especificar abajo)
- [ ] No

**Breaking changes:**
(Describe qué compatibilidad se rompe y cómo migrar)

---

## 📊 Performance

### Impacto en performance:
- [ ] Mejora performance
- [ ] Sin impacto en performance
- [ ] Puede afectar performance negativamente (justificar abajo)

**Justificación:**
(Si afecta performance, explica por qué es aceptable o cómo se mitigó)

### Métricas:
- **Bundle size:** (si aplica para frontend)
  - Antes: XXX KB
  - Después: XXX KB
  - Diferencia: +/- XXX KB

- **Response time:** (si aplica para backend)
  - Antes: XXX ms
  - Después: XXX ms
  - Diferencia: +/- XXX ms

---

## ✅ Checklist Pre-Merge

Antes de marcar como "Ready for Review":

- [ ] El código compila sin errores
- [ ] Los tests pasan localmente
- [ ] El código sigue las convenciones del proyecto (linting, formateo)
- [ ] Actualicé la documentación (README, docs, JSDoc, comentarios)
- [ ] Revisé mi propio código antes de pedir review
- [ ] Agregué tests para los nuevos cambios
- [ ] Verifiqué que no hay console.log o debuggers olvidados
- [ ] Verifiqué que no hay secrets o credenciales hardcodeadas
- [ ] Agregué comentarios explicativos en código complejo
- [ ] Actualicé package.json si agregué nuevas dependencias
- [ ] CI/CD pasa sin errores

---

## 🔗 Links Relacionados

- **Issue:** #ISSUE_NUMBER
- **Documentación:** [Link a docs relevantes]
- **Design/Mockups:** [Link a Figma/diseño si aplica]
- **Related PRs:** #PR_NUMBER (si hay PRs dependientes)

---

## 👥 Reviewers Sugeridos

**Required reviewers:**
- @username (para review de backend)
- @username (para review de frontend)

**Optional reviewers:**
- @username (para review de DevOps)
- @username (para review de QA)

---

## 💬 Notas Adicionales

(Cualquier otra información relevante para los reviewers)

(Menciona áreas específicas donde necesitas feedback)

(Explica decisiones de diseño o trade-offs que tomaste)

---

## 🤖 Auto-Generated Information

**Branch:** `feature/FEATURE_NAME` → `develop` (o `main`)

**Commits incluidos:** X commits

**Files changed:** X files (+XXX, -XXX)

**Deployment target:**
- [ ] Staging (auto-deploy cuando merge a develop)
- [ ] Production (requiere tag y workflow manual)

---

**Creado por:** @username
**Fecha:** YYYY-MM-DD
**Estimated review time:** (corto: 15 min, medio: 30 min, largo: 1 hora+)

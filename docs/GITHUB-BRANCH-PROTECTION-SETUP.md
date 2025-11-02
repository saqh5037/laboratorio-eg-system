# Guía de Configuración: Branch Protection en GitHub

**Última actualización:** 1 de Noviembre, 2025
**Tiempo estimado:** 15 minutos

---

## ℹ️ ¿Por qué Branch Protection?

Branch Protection en `main` es **crítico** para prevenir:
- ❌ Push directo a producción sin review
- ❌ Código no probado llegando a main
- ❌ Deployments accidentales
- ❌ Pérdida de historial (force push)

**Con Branch Protection:**
- ✅ Todo cambio requiere Pull Request
- ✅ CI tests deben pasar antes de merge
- ✅ Code review obligatorio
- ✅ Historial protegido

---

## 📋 Pre-requisitos

### Para Repositorios PRIVADOS:

**GitHub Free:**
- ❌ Branch protection NO disponible
- Necesitas GitHub Pro ($4/mes)

**GitHub Pro:**
- ✅ Branch protection disponible
- ✅ Required reviewers
- ✅ Environment protection

### Para Repositorios PÚBLICOS:

**GitHub Free:**
- ✅ Branch protection disponible (GRATIS)
- ✅ Todas las features

---

## 🚀 Paso a Paso: Configurar Branch Protection

### Paso 1: Acceder a Branch Protection Rules

1. Ve a tu repositorio en GitHub.com:
   ```
   https://github.com/saqh5037/laboratorio-eg-system
   ```

2. Click en **Settings** (⚙️ en la barra superior)

3. En el menú lateral izquierdo, click en **Branches**

4. En la sección **Branch protection rules**, click en **Add rule** o **Add branch protection rule**

---

### Paso 2: Configurar Branch Name Pattern

En el campo **Branch name pattern**, escribe:
```
main
```

Esto protegerá la rama `main`.

---

### Paso 3: Configurar Protections

Marca las siguientes opciones:

#### ✅ **Require a pull request before merging**

Esta es la opción MÁS IMPORTANTE.

- ✅ Marcar esta opción
- Dentro de esta opción, configura:
  - **Required approvals**: `1`
    - (Puedes cambiar a `2` si trabajas en equipo)
  - ✅ **Dismiss stale pull request approvals when new commits are pushed**
    - Esto asegura que si alguien hace cambios después de la aprobación, se requiere nueva review
  - ✅ **Require review from Code Owners** (opcional, si tienes CODEOWNERS file)

#### ✅ **Require status checks to pass before merging**

Protege contra código que falla tests.

- ✅ Marcar esta opción
- ✅ **Require branches to be up to date before merging**
  - Esto asegura que el código está sincronizado con main antes de merge
- En **Status checks that are required**, busca y selecciona:
  - `CI Tests` (del workflow 01-ci-tests.yml)
  - `build` (si tienes build check en CI)

  **Nota:** Estos status checks aparecerán después de que corran por primera vez. Si no los ves, haz un PR primero y luego vuelve a configurar.

#### ✅ **Require conversation resolution before merging**

- ✅ Marcar esta opción
- Asegura que todos los comentarios en el PR sean resueltos antes de merge

#### ✅ **Do not allow bypassing the above settings**

- ✅ Marcar esta opción
- **MUY IMPORTANTE:** Esto aplica las reglas incluso a administradores
- Sin esto, tú mismo podrías saltarte las protecciones accidentalmente

#### ✅ **Require linear history** (opcional pero recomendado)

- ✅ Marcar si quieres forzar squash merges o rebase
- Mantiene el historial de git limpio

---

### Paso 4: Configurar Restricciones de Push

#### ❌ **Do not allow force pushes**

- ✅ Dejar ACTIVADO (el toggle debe estar a la derecha/verde)
- Protege contra `git push --force` que puede destruir historial

#### ❌ **Do not allow deletions**

- ✅ Dejar ACTIVADO
- Protege contra borrado accidental de la rama `main`

---

### Paso 5: Guardar Configuración

1. Scroll hacia abajo

2. Click en **Create** (si es nueva regla) o **Save changes** (si estás editando)

3. ✅ Verás un mensaje de confirmación: "Branch protection rule created"

---

## 🎯 Configuración Final Recomendada

Tu configuración debería verse así:

```
Branch protection rule for: main

✅ Require a pull request before merging
   ├─ Required approvals: 1
   ├─ ✅ Dismiss stale pull request approvals
   └─ ✅ Require review from Code Owners (si aplica)

✅ Require status checks to pass before merging
   ├─ ✅ Require branches to be up to date
   └─ Status checks: CI Tests, build

✅ Require conversation resolution before merging

✅ Do not allow bypassing the above settings

✅ Require linear history (opcional)

✅ Do not allow force pushes (activado por defecto)

✅ Do not allow deletions (activado por defecto)
```

---

## ✅ Verificación: ¿Funciona?

### Test 1: Intentar Push Directo

```bash
# En local
git checkout main
git pull origin main
echo "test" >> test.txt
git add test.txt
git commit -m "test direct push"
git push origin main
```

**Resultado esperado:**
```
remote: error: GH006: Protected branch update failed for refs/heads/main.
remote: error: Changes must be made through a pull request.
```

✅ Si ves este error, ¡la protección funciona!

### Test 2: Crear Pull Request

```bash
# Crear rama
git checkout -b test/branch-protection
git push origin test/branch-protection

# En GitHub, crear PR de test/branch-protection → main
```

**Resultado esperado:**
- No puedes hacer merge hasta que:
  - ✅ Pase CI
  - ✅ Tengas 1 aprobación
  - ✅ Todos los comentarios estén resueltos

---

## 🔄 Workflow con Branch Protection

### Workflow Normal (Develop → Main)

```bash
# PASO 1: Asegurarse de estar en develop actualizado
git checkout develop
git pull origin develop

# PASO 2: Crear PR en GitHub.com
# Ve a: https://github.com/saqh5037/laboratorio-eg-system/compare
# - base: main
# - compare: develop
# - Click: "Create Pull Request"

# PASO 3: Esperar a que pasen checks
# GitHub Actions correrá:
# - 01-ci-tests.yml (linting, testing)
# - build validation

# PASO 4: Review (tú mismo o colega)
# - Revisar cambios
# - Aprobar PR
# - Resolver comentarios si hay

# PASO 5: Merge
# - Click en "Squash and merge" o "Merge pull request"
# - Confirmar merge

# PASO 6: Crear Tag
git checkout main
git pull origin main
git tag -a v1.1.0 -m "Release v1.1.0: Descripción"
git push origin v1.1.0

# PASO 7: Deploy a producción
# GitHub Actions → 03-Deploy to Production → Run workflow
```

---

## 🐛 Troubleshooting

### Problema: "No puedo hacer merge aunque todo esté verde"

**Causa:** Probablemente falta la aprobación del PR.

**Solución:**
1. Ve al PR
2. Click en "Files changed"
3. Click en "Review changes"
4. Selecciona "Approve"
5. Click "Submit review"

### Problema: "Status checks no aparecen en la configuración"

**Causa:** Los workflows no han corrido aún.

**Solución:**
1. Crea un PR de prueba primero
2. Espera a que corran los workflows
3. Vuelve a Settings → Branches
4. Edita la regla
5. Ahora verás los status checks disponibles

### Problema: "Necesito hacer un push urgente a main"

**Opción 1 (Recomendada):**
1. Crea PR rápido
2. Self-approve
3. Merge

**Opción 2 (Emergencia):**
1. Settings → Branches
2. Edit rule for main
3. Desmarcar temporalmente "Do not allow bypassing"
4. Hacer push
5. **IMPORTANTE:** Volver a marcar la opción inmediatamente

**Opción 3 (Mejor):**
1. Agrégat e a ti mismo como admin bypass
2. Settings → Branches → Edit rule
3. "Allow specified actors to bypass required pull requests"
4. Agrega tu usuario
5. Solo úsalo en emergencias

---

## 📚 Recursos Adicionales

- [GitHub Docs: Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [Best Practices for Branch Protection](https://github.blog/2020-12-08-new-from-github-universe-2020-dark-mode-github-sponsors-for-companies-and-more/#protected-branches)

---

## 🎉 ¡Listo!

Con Branch Protection configurado, tu rama `main` ahora está protegida contra cambios accidentales.

**Próximos pasos:**
1. Probar el workflow creando un PR
2. Configurar UptimeRobot (ver `MONITORING-SETUP.md`)
3. Hacer tu primer deployment profesional con el nuevo workflow

---

**¿Problemas?** Revisa la sección de Troubleshooting o abre un issue en el repositorio.

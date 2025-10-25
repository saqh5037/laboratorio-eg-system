# Guía de Contribución - Laboratorio EG PWA

¡Gracias por tu interés en contribuir al proyecto PWA del Laboratorio Elizabeth Gutiérrez! Esta guía te ayudará a entender cómo puedes colaborar de manera efectiva.

## 🚀 Cómo Empezar

### Prerrequisitos
- Node.js 18+ instalado
- Git configurado
- Editor de código (recomendamos VS Code)

### Configuración del Entorno

1. **Fork del repositorio**
   ```bash
   # Haz fork del repo en GitHub, luego clona tu fork
   git clone https://github.com/TU-USERNAME/laboratorio-eg-pwa.git
   cd laboratorio-eg-pwa
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   # Edita .env con tus configuraciones locales
   ```

4. **Iniciar servidor de desarrollo**
   ```bash
   npm run dev
   ```

## 📋 Tipos de Contribuciones

### 🐛 Reportar Bugs
- Usar el template de issues para bugs
- Incluir pasos para reproducir
- Agregar screenshots si es apropiado
- Especificar navegador y versión

### ✨ Sugerir Nuevas Funcionalidades
- Usar el template de feature request
- Explicar el caso de uso
- Considerar el impacto en usuarios médicos
- Proponer implementación si es posible

### 🔧 Contribuir Código
- Seguir las convenciones de código establecidas
- Escribir tests para nuevas funcionalidades
- Documentar cambios significativos
- Mantener compatibilidad PWA

## 🛠️ Proceso de Desarrollo

### Branching Strategy
```bash
# Crear rama para nueva funcionalidad
git checkout -b feature/nueva-funcionalidad

# Crear rama para bug fix
git checkout -b fix/descripcion-del-bug

# Crear rama para mejoras de performance
git checkout -b perf/descripcion-mejora
```

### Convenciones de Commits
Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Ejemplos
feat: agregar búsqueda por código de estudio
fix: corregir error en cache offline
docs: actualizar documentación de PWA
style: mejorar espaciado en StudyCard
refactor: optimizar componente FavoritesList
perf: implementar lazy loading en imágenes
test: agregar tests para useFavorites hook
```

### Estándares de Código

#### React/JavaScript
- Usar hooks funcionales sobre class components
- Implementar PropTypes o TypeScript
- Manejar estados de loading y error
- Optimizar re-renderizados con memo/callback

#### CSS/Styling
- Usar Tailwind CSS classes
- Seguir convenciones de responsive design
- Mantener consistencia con tema médico
- Optimizar para dispositivos móviles

#### PWA Específico
- Mantener compatibilidad offline
- Optimizar Core Web Vitals
- Seguir estándares de accesibilidad
- Considerar uso de batería en móviles

## 🧪 Testing

### Ejecutar Tests
```bash
# Tests unitarios
npm run test

# Tests de componentes
npm run test:components

# Tests de PWA
npm run test:pwa

# Lighthouse audit
npm run audit
```

### Escribir Tests
- Tests unitarios para utilities
- Tests de integración para hooks
- Tests de accesibilidad
- Tests de performance PWA

## 📱 Consideraciones Médicas

### UX para Profesionales Médicos
- Diseño limpio y profesional
- Navegación intuitiva
- Terminología médica correcta
- Flujos de trabajo optimizados

### Privacidad y Seguridad
- No incluir datos reales de pacientes
- Validar todas las entradas
- Seguir estándares de seguridad web
- Considerar regulaciones médicas

### Performance Crítica
- Carga rápida en conexiones lentas
- Funcionalidad offline completa
- Optimización para dispositivos médicos
- Bajo consumo de batería

## 🔍 Code Review

### Antes de Enviar PR
- [ ] Código sigue estándares establecidos
- [ ] Tests pasan correctamente
- [ ] PWA audit score > 90
- [ ] Funciona offline
- [ ] Responsive en todos los dispositivos
- [ ] Sin errores de consola
- [ ] Documentación actualizada

### Checklist de PR
```markdown
## Descripción
Breve descripción de los cambios

## Tipo de cambio
- [ ] Bug fix
- [ ] Nueva funcionalidad
- [ ] Mejora de performance
- [ ] Refactor
- [ ] Documentación

## PWA Checklist
- [ ] Funciona offline
- [ ] Service Worker actualizado
- [ ] Core Web Vitals optimizados
- [ ] Manifest.json válido

## Testing
- [ ] Tests unitarios agregados/actualizados
- [ ] Probado en dispositivos móviles
- [ ] Probado offline
- [ ] Lighthouse audit > 90

## Screenshots
[Agregar screenshots si es apropiado]
```

## 🏥 Contexto del Laboratorio

### Flujos de Trabajo Típicos
1. **Búsqueda de estudios**: Por nombre, código, categoría
2. **Información detallada**: Precios, preparación, tiempo
3. **Gestión de favoritos**: Organización y notas
4. **Acceso offline**: Consulta sin conexión

### Usuarios Objetivo
- **Médicos**: Consulta rápida de estudios
- **Personal administrativo**: Gestión de información
- **Pacientes**: Información de estudios solicitados
- **Técnicos**: Acceso móvil en laboratorio

## 🤝 Comunicación

### Canales
- **Issues**: Bugs y feature requests
- **Discussions**: Preguntas generales
- **PR Comments**: Revisión de código específica

### Etiqueta
- Ser respetuoso y constructivo
- Enfocarse en el código, no en la persona
- Explicar el "por qué" de los cambios
- Agradecer el tiempo de los reviewers

## 📚 Recursos Útiles

### Documentación Técnica
- [React Documentation](https://react.dev/)
- [PWA Guidelines](https://web.dev/progressive-web-apps/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Web Vitals](https://web.dev/vitals/)

### Herramientas de Desarrollo
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [PWA Builder](https://www.pwabuilder.com/)

### Estándares Médicos
- [HL7 FHIR](https://hl7.org/fhir/) (para futuras integraciones)
- [HIPAA Guidelines](https://www.hhs.gov/hipaa/) (privacidad)

## 🎯 Roadmap

### Próximas Versiones
- **v1.1**: API integration
- **v1.2**: Push notifications
- **v1.3**: User authentication
- **v1.4**: Payment integration
- **v1.5**: Telemedicine features

### Cómo Contribuir al Roadmap
1. Revisar issues etiquetados como "roadmap"
2. Proponer nuevas funcionalidades alineadas
3. Participar en discussions sobre arquitectura
4. Contribuir con research de UX médico

---

## ✨ Reconocimientos

Todos los contribuidores serán reconocidos en:
- README.md del proyecto
- CHANGELOG.md en releases
- About page de la aplicación

¡Gracias por ayudar a mejorar la atención médica con tecnología! 🏥💻

---

**¿Preguntas?** 
Abre un issue con la etiqueta "question" o inicia una discussion.
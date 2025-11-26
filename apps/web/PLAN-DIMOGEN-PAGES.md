# Plan de Estructura de Páginas - DIMOGEN

## Resumen de Servicios Identificados

**DIMOGEN** es una marca de **Grupo MICRO-TEC** (Laboratorio Clínico de Referencia) que ofrece 3 líneas de negocio principales:

---

## 1. BIOLOGÍA MOLECULAR
Laboratorio especializado en diagnóstico molecular con PCR en tiempo real.

### Categorías de Estudios:

#### 1.1 ITS (Infecciones de Transmisión Sexual)
- VPH (16 genotipos de alto y bajo riesgo)
- Chlamydia trachomatis
- Neisseria gonorrhoeae
- Trichomonas vaginalis
- Mycoplasma genitalium / hominis
- Ureaplasma urealyticum / parvum
- Herpes simplex 1/2
- Panel ITS Completo (12 patógenos)
- Panel ITS Masculino / Femenino

#### 1.2 Respiratorio
- COVID-19 SARS-CoV-2
- Influenza A/B
- Virus Sincicial Respiratorio (RSV)
- Panel Respiratorio (22 patógenos)
- Panel Neumonía (urgencia 4 hrs)

#### 1.3 Virología
- VIH-1/2 (detección y carga viral)
- Hepatitis B (HBV DNA)
- Hepatitis C (HCV RNA)
- Citomegalovirus (CMV)
- Epstein-Barr (EBV)

#### 1.4 Gastrointestinal
- Helicobacter pylori
- Panel Gastrointestinal (22 patógenos - urgencia 4 hrs)

#### 1.5 Tuberculosis
- Mycobacterium tuberculosis
- Resistencia a rifampicina

#### 1.6 Oncología Molecular
- BCR/ABL1 (Leucemia Mieloide Crónica)
- Panel de 113 Oncogenes
- Biomarcadores tumorales

#### 1.7 Trombofilia / Hematología
- Factor V Leiden
- Protrombina G20210A
- MTHFR C677T

---

## 2. UNIDAD DE SALUD INTEGRAL
Servicios médicos orientados a la salud integral del paciente.

### Servicios:

#### 2.1 Consulta General
- Diagnóstico y tratamiento de enfermedades
- Valoración integral de salud
- Certificados médicos

#### 2.2 Consultas de Especialidad
- Ultrasonografía
- Medicina Interna (bajo disponibilidad)
- Ginecología (bajo disponibilidad)
- Traumatología (bajo disponibilidad)
- Neurología (bajo disponibilidad)

#### 2.3 Toma de Muestras
- Personal capacitado
- Toma a domicilio disponible
- Procesamiento y entrega de resultados

---

## 3. MICROBIOLOGÍA DE ALIMENTOS
Análisis de microorganismos en agua, hielo, superficies y alimentos.
**Certificación:** ISO 9001:2015 (Global Standards)

### Clientes objetivo:
- Industria alimentaria
- Hoteles
- Hospitales
- Fábricas
- Plazas comerciales
- Escuelas

### Estudios Individuales:

| Estudio | Código | Precio | Entrega |
|---------|--------|--------|---------|
| Organismos Mesofílicos Aerobios | OMA01 | $363.66 | 5 días |
| Hongos y Levaduras | HOL02 | $363.66 | 8 días |
| Coliformes Totales (placa) | COL03 | $363.66 | 3 días |
| Salmonella Spp | SAL04 | $818.23 | 10 días |
| Staphylococcus aureus | SAU05 | $1,054.61 | 10 días |
| Coliformes Totales/Fecales/E.coli (NMP) | NMP06 | $606.00 | 10 días |

### Paquetes:

| Paquete | Incluye | Código | Precio | Entrega |
|---------|---------|--------|--------|---------|
| Paquete I | OMA + Hongos + Coliformes | PAQ01 | $969.76 | 8 días |
| Paquete II | OMA + Hongos + Coliformes + Salmonella + S. aureus | PAQ02 | $2,303.18 | 10 días |

---

## Estructura de Páginas Propuesta

```
/dimogen                              → Landing principal (actual)
│
├── /servicios                        → Overview de los 3 servicios
│   │
│   ├── /biologia-molecular           → Página dedicada BioMol
│   │   ├── Hero con DNA animation
│   │   ├── Categorías de estudios (tabs)
│   │   ├── Catálogo completo con precios
│   │   ├── Proceso de toma de muestra
│   │   ├── Tiempos de entrega
│   │   └── CTA WhatsApp/Agendar
│   │
│   ├── /salud-integral               → Página dedicada Unidad Salud
│   │   ├── Hero con imágenes de clínica
│   │   ├── Consulta General (card)
│   │   ├── Especialidades disponibles
│   │   ├── Toma de Muestras
│   │   ├── Instalaciones (galería)
│   │   └── CTA Agendar cita
│   │
│   └── /microbiologia-alimentos      → Página dedicada Alimentos
│       ├── Hero con imágenes de lab
│       ├── ¿Por qué es importante?
│       ├── Sectores que atendemos
│       ├── Catálogo de estudios
│       ├── Paquetes promocionales
│       ├── Proceso y tiempos
│       └── CTA Cotización empresarial
│
├── /nosotros                         → Sobre Dimogen
│   ├── Historia y filosofía
│   ├── Grupo Micro-Tec
│   ├── Certificaciones (ISO 9001, COFEPRIS)
│   └── Equipo profesional
│
├── /contacto                         → Contacto unificado
│   ├── Formulario general
│   ├── Ubicaciones (mapa)
│   ├── Teléfonos y WhatsApp
│   └── Horarios
│
└── /faq                              → Preguntas frecuentes
```

---

## Archivos a Crear

### Páginas principales:
1. `src/pages/dimogen/ServiciosBiologiaMolecular.jsx`
2. `src/pages/dimogen/ServiciosSaludIntegral.jsx`
3. `src/pages/dimogen/ServiciosMicrobiologiaAlimentos.jsx`
4. `src/pages/dimogen/Nosotros.jsx`
5. `src/pages/dimogen/Contacto.jsx`
6. `src/pages/dimogen/FAQ.jsx`

### Componentes compartidos:
1. `src/components/landing/dimogen/ServiceHero.jsx` - Hero reutilizable
2. `src/components/landing/dimogen/StudyCatalog.jsx` - Catálogo de estudios
3. `src/components/landing/dimogen/PricingTable.jsx` - Tabla de precios
4. `src/components/landing/dimogen/ProcessSteps.jsx` - Pasos del proceso
5. `src/components/landing/dimogen/CTASection.jsx` - Sección de llamada a acción

### Datos:
1. `src/data/dimogen/estudios-molecular.js` - Data de estudios moleculares
2. `src/data/dimogen/estudios-alimentos.js` - Data de estudios de alimentos
3. `src/data/dimogen/servicios-salud.js` - Data de servicios de salud

---

## Rutas a Configurar

```jsx
// En App.jsx o router
{
  path: '/dimogen',
  children: [
    { index: true, element: <LandingDimogen /> },
    { path: 'servicios/biologia-molecular', element: <ServiciosBiologiaMolecular /> },
    { path: 'servicios/salud-integral', element: <ServiciosSaludIntegral /> },
    { path: 'servicios/microbiologia-alimentos', element: <ServiciosMicrobiologiaAlimentos /> },
    { path: 'nosotros', element: <NosotrosDimogen /> },
    { path: 'contacto', element: <ContactoDimogen /> },
    { path: 'faq', element: <FAQDimogen /> },
  ]
}
```

---

## Navegación Actualizada

```jsx
const navLinks = [
  { name: 'Inicio', href: '/dimogen' },
  {
    name: 'Servicios',
    href: '#servicios',
    submenu: [
      { name: 'Biología Molecular', href: '/dimogen/servicios/biologia-molecular' },
      { name: 'Unidad de Salud', href: '/dimogen/servicios/salud-integral' },
      { name: 'Microbiología Alimentos', href: '/dimogen/servicios/microbiologia-alimentos' },
    ]
  },
  { name: 'Nosotros', href: '/dimogen/nosotros' },
  { name: 'FAQ', href: '/dimogen/faq' },
  { name: 'Contacto', href: '/dimogen/contacto' }
];
```

---

## Información de Contacto

**Dimogen Biología Molecular (Ventas):**
- Dirección: Medellín 338, Roma Sur, Cuauhtémoc, 06760 CDMX
- Email: msanchez@dimogen.com.mx
- Teléfono: 56 1045 4458
- Horario: 09:00 - 18:00

**Unidad de Salud Integral:**
- Dirección: Calle Quintana Roo 78, Roma Sur, Cuauhtémoc, 06760 CDMX
- Email: saludintegral@dimogen.com.mx
- Horario: 07:30 - 19:00

**General:**
- Teléfonos: 56 1033 5124, 56 1045 4458
- Email: hola@dimogen.com.mx
- Web: www.dimogen.com.mx
- Aviso COFEPRIS: 2409152002A00328

---

## Redes Sociales

- Facebook: dimogenlaboratorio
- Instagram: dimogenlab
- TikTok: @dimogen.lab

---

## Colores de Marca

- Azul DIMOGEN: #0052CC
- Azul claro: #00A3E0
- Verde éxito: #00875A
- Blanco: #FFFFFF
- Gris texto: #4A5568

---

## Próximos Pasos

1. [ ] Crear archivos de datos con estudios y precios
2. [ ] Crear página de Biología Molecular con catálogo completo
3. [ ] Crear página de Unidad de Salud Integral
4. [ ] Crear página de Microbiología de Alimentos
5. [ ] Actualizar NavbarDimogen con submenú
6. [ ] Configurar rutas en App.jsx
7. [ ] Actualizar landing para linkear a páginas dedicadas
8. [ ] Testing y responsive design

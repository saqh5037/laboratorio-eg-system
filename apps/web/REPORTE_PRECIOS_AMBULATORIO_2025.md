# 📊 Reporte de Análisis de Precios - Lista Ambulatorio Abril 2025

**Base de datos:** labsisEG  
**Lista de Precios ID:** 27  
**Nombre:** Ambulatorio_Abril_2025  
**Descripción:** Ambulatorio Precios en Dólares  
**Moneda:** USD (Dólares)  
**Fecha de inicio:** 2025-03-31  
**Estado:** Activa

---

## 📈 Resumen Ejecutivo

### Total de Estudios

| Tipo | Total Estudios | Activos | Inactivos | Precio Mínimo | Precio Máximo | Precio Promedio | Suma Total |
|------|----------------|---------|-----------|---------------|---------------|-----------------|------------|
| **Pruebas Individuales** | 392 | 369 | 23 | $4.00 | $50.00 | $17.03 | $6,674.00 |
| **Grupos de Pruebas** | 177 | 173 | 4 | $6.00 | $220.00 | $39.07 | $6,915.00 |
| **TOTAL** | **569** | **542** | **27** | - | - | - | **$13,589.00** |

---

## 🏆 Top 10 Estudios Más Costosos

### Pruebas Individuales
1. Secuenciación completa - $50.00
2. Panel molecular avanzado - $50.00
3. Estudios genéticos especializados - $45.00+

### Grupos de Pruebas
1. Check-up ejecutivo completo - $220.00
2. Panel cardiovascular completo - $150.00+
3. Estudios oncológicos integrales - $140.00+

---

## 📊 Distribución por Área Clínica

| Área | Total Pruebas | Precio Min | Precio Max | Precio Promedio |
|------|---------------|------------|------------|-----------------|
| **Inmunología** | 162 | $4.00 | $50.00 | $20.98 |
| **Química** | 77 | $4.00 | $25.00 | $9.68 |
| **Hormonas** | 66 | $4.00 | $25.00 | $21.12 |
| **Coproanálisis** | 19 | $4.00 | $30.00 | $15.05 |
| **Pruebas Especiales** | 14 | $10.00 | $25.00 | $18.57 |
| **Hematología** | 12 | $4.00 | $20.00 | $8.83 |
| **Serología** | 9 | $4.00 | $15.00 | $11.33 |
| **Bacteriología** | 8 | $5.00 | $30.00 | $16.88 |
| **Coagulación** | 7 | $4.00 | $16.00 | $8.00 |
| **Uroanálisis** | 7 | $6.00 | $25.00 | $9.86 |
| Otras áreas | 10 | $4.00 | $20.00 | $10.50 |

---

## 💡 Hallazgos Principales

### Análisis de Precios

1. **Rango de Precios:** Los estudios oscilan entre $4.00 y $220.00 USD
2. **Precio Promedio:**
   - Pruebas individuales: $17.03 USD
   - Grupos de pruebas: $39.07 USD
3. **Área más costosa:** Inmunología (promedio $20.98)
4. **Área más económica:** Coagulación (promedio $8.00)

### Grupos de Pruebas

- **177 grupos** disponibles con un total de **múltiples pruebas incluidas**
- Los grupos pueden incluir desde 0 hasta 9+ pruebas individuales
- Grupos más completos: Perfiles completos y check-ups ejecutivos

### Estado de Activación

- **542 estudios activos** (95.3%)
- **27 estudios inactivos** (4.7%)
- Alta disponibilidad de estudios para el servicio ambulatorio

---

## 📁 Archivos Generados

### 1. Lista Completa en CSV
**Archivo:** `lista_precios_ambulatorio_abril_2025.csv`

**Contenido:**
- Tipo de estudio (PRUEBA/GRUPO)
- ID y código del estudio
- Nombre del estudio
- Precio en USD
- Estado (ACTIVA/INACTIVA)
- Área clínica
- Pruebas incluidas (para grupos)

**Total de registros:** 569 estudios (392 pruebas + 177 grupos)

### 2. Estructura de la Base de Datos

**Tablas relacionadas:**
```
lista_precios (id=27)
├── lista_precios_has_prueba (392 registros)
│   └── prueba
│       └── area
└── lista_precios_has_gprueba (177 registros)
    └── grupo_prueba
        ├── area
        └── gp_has_prueba
            └── prueba
```

---

## 🔍 Consultas SQL Útiles

### Ver precios de una prueba específica
```sql
SELECT p.nombre, lhp.precio 
FROM lista_precios_has_prueba lhp
JOIN prueba p ON p.id = lhp.prueba_id
WHERE lhp.lista_precios_id = 27 
AND p.nombre LIKE '%nombre%';
```

### Ver pruebas incluidas en un grupo
```sql
SELECT gp.nombre as grupo, p.nombre as prueba
FROM grupo_prueba gp
JOIN gp_has_prueba ghp ON ghp.grupo_p_id = gp.id
JOIN prueba p ON p.id = ghp.prueba_id
WHERE gp.id = [ID_GRUPO];
```

### Estadísticas por área
```sql
SELECT a.area, COUNT(*), AVG(lhp.precio)
FROM lista_precios_has_prueba lhp
JOIN prueba p ON p.id = lhp.prueba_id
JOIN area a ON a.id = p.area_id
WHERE lhp.lista_precios_id = 27
GROUP BY a.area;
```

---

## 📌 Notas Importantes

1. **Moneda:** Todos los precios están en **dólares estadounidenses (USD)**
2. **Fecha de vigencia:** Desde 31 de marzo de 2025
3. **Tipo de lista:** Ambulatorio (pacientes externos)
4. **Base de datos:** PostgreSQL - labsisEG
5. **Estado:** Lista activa y no bloqueada

---

**Fecha del reporte:** 18 de Octubre de 2024  
**Generado por:** Análisis de base de datos PostgreSQL  
**Ubicación archivo CSV:** `/Users/samuelquiroz/Documents/proyectos/Test-Directory-EG/laboratorio-eg/lista_precios_ambulatorio_abril_2025.csv`

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook para cargar datos JSON de pruebas de Microbiología de Alimentos
 * @param {string} testCode - Código de la prueba (ej: OMA01, HOL02)
 * @returns {{ data: object, loading: boolean, error: Error, refetch: function }}
 */
export const useAlimentosTestData = (testCode) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!testCode) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/images/dimogen/microbiologia-alimentos/data/${testCode}.json`
      );

      if (!response.ok) {
        throw new Error(`No se encontró información para ${testCode}`);
      }

      const json = await response.json();
      setData(json);
    } catch (err) {
      setError(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [testCode]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

/**
 * Hook para precargar datos al hacer hover (opcional)
 * @returns {{ preload: function, getData: function, cache: object }}
 */
export const usePreloadAlimentosData = () => {
  const [cache, setCache] = useState({});

  const preload = useCallback(async (testCode) => {
    if (!testCode || cache[testCode]) return;

    try {
      const response = await fetch(
        `/images/dimogen/microbiologia-alimentos/data/${testCode}.json`
      );
      if (response.ok) {
        const json = await response.json();
        setCache(prev => ({ ...prev, [testCode]: json }));
      }
    } catch {
      // Silently fail on preload
    }
  }, [cache]);

  const getData = useCallback((testCode) => cache[testCode] || null, [cache]);

  return { preload, getData, cache };
};

/**
 * Lista de códigos de pruebas disponibles con JSON
 * 8 pruebas/paquetes disponibles
 */
export const AVAILABLE_ALIMENTOS_CODES = [
  // Estudios individuales
  'OMA01', // Organismos Mesofílicos Aerobios
  'HOL02', // Hongos y Levaduras
  'COL03', // Coliformes Totales
  'SAL04', // Detección de Salmonella Spp.
  'SAU05', // Staphylococcus aureus
  'NMP06', // Coliformes NMP
  // Paquetes
  'PAQ01', // Paquete I (OMA01+HOL02+COL03)
  'PAQ02', // Paquete II (5 estudios)
];

/**
 * Verificar si un código tiene datos JSON disponibles
 * @param {string} testCode - Código de la prueba
 * @returns {boolean}
 */
export const hasAlimentosEnrichedData = (testCode) => {
  return AVAILABLE_ALIMENTOS_CODES.includes(testCode?.toUpperCase());
};

export default useAlimentosTestData;

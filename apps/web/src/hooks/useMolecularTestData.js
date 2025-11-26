import { useState, useEffect, useCallback } from 'react';

/**
 * Hook para cargar datos JSON de pruebas moleculares
 * @param {string} testCode - Código de la prueba (ej: COV06, FLU07)
 * @returns {{ data: object, loading: boolean, error: Error, refetch: function }}
 */
export const useMolecularTestData = (testCode) => {
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
        `/images/dimogen/biologia-molecular/data/${testCode}.json`
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
 * @param {string} testCode - Código de la prueba
 * @returns {{ preload: function, data: object }}
 */
export const usePreloadTestData = () => {
  const [cache, setCache] = useState({});

  const preload = useCallback(async (testCode) => {
    if (!testCode || cache[testCode]) return;

    try {
      const response = await fetch(
        `/images/dimogen/biologia-molecular/data/${testCode}.json`
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
 * 38 pruebas disponibles - Actualizado automáticamente
 */
export const AVAILABLE_TEST_CODES = [
  // Respiratorias
  'COV06', 'FLU07', 'VSR08', 'TVR11', 'PVR26',
  // Tuberculosis
  'MTB09', 'RTB10', 'TBN17',
  // VIH
  'VIH03', 'VIH23',
  // VPH
  'VPH01', 'VPH02',
  // Hepatitis
  'VHB07', 'VHB08', 'VHC05', 'VHC06',
  // Herpes/CMV/EBV
  'CMV20', 'CMV21', 'EBV21', 'HPL22', 'HLA12',
  // Gastrointestinales
  'PGI15', 'PRC16', 'PME17',
  // ITS (Infecciones de Transmisión Sexual)
  'ITS03', 'ITS04', 'ITS05', 'ITS06', 'ITS07', 'ITS08', 'ITS09',
  // Genética/Oncología
  'BCR25', 'BCR26',
  // Otros paneles
  'NSG14', 'PNE18', 'PSE19', 'PTR24', 'SPL13'
];

/**
 * Verificar si un código tiene datos JSON disponibles
 * @param {string} testCode - Código de la prueba
 * @returns {boolean}
 */
export const hasEnrichedData = (testCode) => {
  return AVAILABLE_TEST_CODES.includes(testCode?.toUpperCase());
};

export default useMolecularTestData;

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  requestAuthCode,
  verifyAuthCode,
  validateVenezuelanPhone,
  formatPhone,
} from '../../services/messagingBotApi';

export default function TelegramAuthModal({ isOpen, onClose, onSuccess }) {
  // Refs para los inputs del código
  const codeInputsRef = useRef([]);

  // Estados
  const [step, setStep] = useState(() => {
    // Restaurar estado desde sessionStorage al inicializar
    const saved = sessionStorage.getItem('telegram_auth_state');
    if (saved) {
      try {
        const { step } = JSON.parse(saved);
        return step || 1;
      } catch (e) {
        return 1;
      }
    }
    return 1;
  });

  const [phone, setPhone] = useState(() => {
    const saved = sessionStorage.getItem('telegram_auth_state');
    if (saved) {
      try {
        const { phone } = JSON.parse(saved);
        return phone || '';
      } catch (e) {
        return '';
      }
    }
    return '';
  });

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const [expiryTimer, setExpiryTimer] = useState(() => {
    const saved = sessionStorage.getItem('telegram_auth_state');
    if (saved) {
      try {
        const { expiryTimer, savedAt } = JSON.parse(saved);
        if (expiryTimer && savedAt) {
          // Calcular tiempo transcurrido desde que se guardó
          const elapsed = Math.floor((Date.now() - savedAt) / 1000);
          const remaining = expiryTimer - elapsed;
          return remaining > 0 ? remaining : 600;
        }
      } catch (e) {
        return 600;
      }
    }
    return 600;
  });

  // Efecto para persistir estado en sessionStorage
  useEffect(() => {
    if (step === 2 && phone) {
      // Guardar estado solo cuando estamos en el paso de código
      const state = {
        step,
        phone,
        expiryTimer,
        savedAt: Date.now()
      };
      sessionStorage.setItem('telegram_auth_state', JSON.stringify(state));
    }
  }, [step, phone, expiryTimer]);

  // Efecto para restaurar focus al volver al modal en paso 2
  useEffect(() => {
    if (isOpen && step === 2) {
      // Si hay un código pendiente, hacer focus en el primer input
      setTimeout(() => {
        if (codeInputsRef.current[0]) {
          codeInputsRef.current[0].focus();
        }
      }, 100);
    }
  }, [isOpen, step]);

  // Efecto para countdown del resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Efecto para countdown de expiración del código
  useEffect(() => {
    if (step === 2 && expiryTimer > 0) {
      const timer = setTimeout(() => setExpiryTimer(expiryTimer - 1), 1000);
      return () => clearTimeout(timer);
    }

    if (expiryTimer === 0 && step === 2) {
      toast.error('El código ha expirado. Solicite uno nuevo.');
      handleBackToPhone();
    }
  }, [step, expiryTimer]);

  // Formatear tiempo en MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Limpiar formulario
  const resetForm = () => {
    setStep(1);
    setPhone('');
    setCode(['', '', '', '', '', '']);
    setResendTimer(0);
    setExpiryTimer(600);
    // Limpiar estado persistido
    sessionStorage.removeItem('telegram_auth_state');
  };

  // Volver al paso de teléfono
  const handleBackToPhone = () => {
    setStep(1);
    setCode(['', '', '', '', '', '']);
    setExpiryTimer(600);
    // Limpiar estado persistido
    sessionStorage.removeItem('telegram_auth_state');
  };

  // Manejar submit del teléfono
  const handlePhoneSubmit = async (e) => {
    e.preventDefault();

    // Validar teléfono
    const validation = validateVenezuelanPhone(phone);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setLoading(true);

    try {
      const formattedPhone = formatPhone(phone);
      await requestAuthCode(formattedPhone);

      toast.success('Código enviado por Telegram. Revise su chat.');
      setStep(2);
      setResendTimer(60); // 60 segundos antes de permitir reenvío
      setExpiryTimer(600); // Reset expiry timer

      // Auto-focus en primer input del código
      setTimeout(() => {
        if (codeInputsRef.current[0]) {
          codeInputsRef.current[0].focus();
        }
      }, 100);
    } catch (error) {
      console.error('Error al solicitar código:', error);

      if (error.code === 'PATIENT_NOT_FOUND') {
        toast.error('No se encontró un paciente con este teléfono');
      } else if (error.code === 'RATE_LIMIT_EXCEEDED') {
        toast.error('Demasiados intentos. Intente más tarde.');
      } else if (error.code === 'NETWORK_ERROR') {
        toast.error('Error de conexión. Verifique su internet.');
      } else {
        toast.error('Error al enviar código. Intente nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambio en input de código
  const handleCodeChange = (index, value) => {
    // Solo permitir números
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus al siguiente input
    if (value && index < 5) {
      codeInputsRef.current[index + 1]?.focus();
    }

    // Auto-submit cuando todos los dígitos están completos
    if (index === 5 && value) {
      const fullCode = newCode.join('');
      if (fullCode.length === 6) {
        handleCodeSubmit(fullCode);
      }
    }
  };

  // Manejar tecla en input de código
  const handleCodeKeyDown = (index, e) => {
    // Backspace en campo vacío → ir al anterior
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      codeInputsRef.current[index - 1]?.focus();
    }

    // Arrow left
    if (e.key === 'ArrowLeft' && index > 0) {
      codeInputsRef.current[index - 1]?.focus();
    }

    // Arrow right
    if (e.key === 'ArrowRight' && index < 5) {
      codeInputsRef.current[index + 1]?.focus();
    }
  };

  // Función mejorada para extraer código de cualquier texto
  const extractCodeFromText = (text) => {
    if (!text || typeof text !== 'string') {
      return null;
    }

    // Buscar patrón de 6 dígitos consecutivos (con límites de palabra)
    const match = text.match(/\b(\d{6})\b/);
    if (match) {
      return match[1];
    }

    // Fallback: extraer solo dígitos
    const digitsOnly = text.replace(/\D/g, '');

    // Si hay exactamente 6 dígitos en total, usarlos
    if (digitsOnly.length === 6) {
      return digitsOnly;
    }

    // Si hay más de 6 dígitos, tomar los primeros 6
    if (digitsOnly.length > 6) {
      return digitsOnly.substring(0, 6);
    }

    return null;
  };

  // Manejar paste de código (mejorado)
  const handleCodePaste = (e, index = 0) => {
    e.preventDefault();

    try {
      const pastedData = e.clipboardData.getData('text');

      if (!pastedData || pastedData.trim() === '') {
        toast.error('No se detectó texto pegado');
        return;
      }

      // Intentar extraer el código del texto pegado
      const extractedCode = extractCodeFromText(pastedData);

      if (extractedCode) {
        const digits = extractedCode.split('');
        setCode(digits);

        // Mostrar feedback visual
        toast.success('Código detectado. Verificando...');

        // Auto-submit después de un delay breve para mejor UX
        setTimeout(() => {
          handleCodeSubmit(extractedCode);
        }, 400);
      } else {
        toast.error(
          `No se encontró un código de 6 dígitos. Texto pegado: "${pastedData.substring(0, 50)}${pastedData.length > 50 ? '...' : ''}"`,
          { duration: 4000 }
        );
      }
    } catch (error) {
      console.error('Error al procesar pegado:', error);
      toast.error('Error al procesar el texto pegado');
    }
  };

  // Función para pegar desde el portapapeles usando la API
  const handlePasteFromClipboard = async () => {
    // Verificar si el API de portapapeles está disponible
    if (!navigator.clipboard || !navigator.clipboard.readText) {
      toast.error(
        'Tu navegador no soporta acceso al portapapeles. Por favor pega manualmente con Ctrl+V (Cmd+V en Mac)',
        { duration: 5000 }
      );
      // Hacer focus en el primer input para facilitar pegado manual
      setTimeout(() => {
        if (codeInputsRef.current[0]) {
          codeInputsRef.current[0].focus();
        }
      }, 100);
      return;
    }

    try {
      const text = await navigator.clipboard.readText();

      if (!text || text.trim() === '') {
        toast.error('El portapapeles está vacío. Copia el código de Telegram primero.');
        return;
      }

      const extractedCode = extractCodeFromText(text);

      if (extractedCode) {
        const digits = extractedCode.split('');
        setCode(digits);

        // Auto-submit después de un pequeño delay para que el usuario vea el código
        setTimeout(() => {
          handleCodeSubmit(extractedCode);
        }, 300);

        toast.success('Código pegado correctamente');
      } else {
        toast.error(
          'No se encontró un código de 6 dígitos válido. Verifica el texto copiado.',
          { duration: 4000 }
        );
      }
    } catch (error) {
      console.error('Error al acceder al portapapeles:', error);

      if (error.name === 'NotAllowedError') {
        toast.error(
          'Permiso denegado. Por favor permite el acceso al portapapeles o pega manualmente con Ctrl+V (Cmd+V en Mac)',
          { duration: 5000 }
        );
      } else {
        toast.error(
          'No se pudo acceder al portapapeles. Intenta pegar manualmente con Ctrl+V (Cmd+V en Mac)',
          { duration: 4000 }
        );
      }

      // Hacer focus en el primer input para facilitar pegado manual
      setTimeout(() => {
        if (codeInputsRef.current[0]) {
          codeInputsRef.current[0].focus();
        }
      }, 100);
    }
  };

  // Verificar código
  const handleCodeSubmit = async (codeToVerify = null) => {
    const fullCode = codeToVerify || code.join('');

    if (fullCode.length !== 6) {
      toast.error('Ingrese los 6 dígitos del código');
      return;
    }

    setLoading(true);

    try {
      const formattedPhone = formatPhone(phone);
      const result = await verifyAuthCode(formattedPhone, fullCode);

      toast.success('Autenticación exitosa');

      // Llamar callback de éxito
      if (onSuccess) {
        onSuccess({
          token: result.token,
          pacienteId: result.pacienteId,
          expiresAt: result.expiresAt,
        });
      }

      // Cerrar modal
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error al verificar código:', error);

      if (error.code === 'INVALID_CODE') {
        toast.error('Código incorrecto. Intente nuevamente.');
        // Limpiar código para reintentar
        setCode(['', '', '', '', '', '']);
        codeInputsRef.current[0]?.focus();
      } else if (error.code === 'CODE_EXPIRED') {
        toast.error('El código ha expirado. Solicite uno nuevo.');
        handleBackToPhone();
      } else if (error.code === 'MAX_ATTEMPTS_EXCEEDED') {
        toast.error('Demasiados intentos. Solicite un nuevo código.');
        handleBackToPhone();
      } else {
        toast.error('Error al verificar. Intente nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Reenviar código
  const handleResendCode = async () => {
    if (resendTimer > 0) {
      return;
    }

    setLoading(true);

    try {
      const formattedPhone = formatPhone(phone);
      await requestAuthCode(formattedPhone);

      toast.success('Nuevo código enviado');
      setCode(['', '', '', '', '', '']);
      setResendTimer(60);
      setExpiryTimer(600);
      codeInputsRef.current[0]?.focus();
    } catch (error) {
      toast.error('Error al reenviar código');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-eg-purple to-eg-pink p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold">Autenticación Telegram</h2>
                <button
                  onClick={() => {
                    resetForm();
                    onClose();
                  }}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-white/90">
                {step === 1 ? 'Ingrese su número de teléfono' : 'Ingrese el código enviado por Telegram'}
              </p>
            </div>

            {/* Body */}
            <div className="p-6">
              {/* Paso 1: Teléfono */}
              {step === 1 && (
                <motion.form
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handlePhoneSubmit}
                  className="space-y-4"
                >
                  <div>
                    <label htmlFor="phone" className="block text-base text-gray-900 mb-2 font-medium">
                      Número de Teléfono
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0412-1234567"
                      className="w-full px-4 py-3 text-base text-gray-900 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-eg-purple/50 focus:border-eg-purple hover:border-eg-purple/50 placeholder:text-gray-400 transition-all duration-200"
                      disabled={loading}
                      autoFocus
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      Debe ser un número venezolano (0412, 0414, 0424, 0416, 0426)
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !phone}
                    className="w-full bg-gradient-to-r from-eg-purple to-eg-pink text-white py-3 px-6 rounded-lg font-medium shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-eg-purple/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Enviando...
                      </span>
                    ) : (
                      'Enviar Código'
                    )}
                  </button>
                </motion.form>
              )}

              {/* Paso 2: Código */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Timer de expiración */}
                  <div className="flex items-center justify-center gap-2 p-3 bg-eg-purple/10 rounded-lg">
                    <svg className="w-5 h-5 text-eg-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">
                      Código expira en: <span className="text-eg-purple font-bold">{formatTime(expiryTimer)}</span>
                    </span>
                  </div>

                  {/* Inputs de código */}
                  <div>
                    <label className="block text-base text-gray-900 mb-3 font-medium text-center">
                      Código de 6 dígitos
                    </label>
                    <div className="flex justify-center gap-2 mb-4">
                      {code.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => (codeInputsRef.current[index] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleCodeChange(index, e.target.value)}
                          onKeyDown={(e) => handleCodeKeyDown(index, e)}
                          onPaste={(e) => handleCodePaste(e, index)}
                          className="w-12 h-14 text-center text-2xl font-bold text-gray-900 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-eg-purple/50 focus:border-eg-purple hover:border-eg-purple/50 transition-all duration-200"
                          disabled={loading}
                        />
                      ))}
                    </div>

                    {/* Botón para pegar código desde portapapeles */}
                    <button
                      type="button"
                      onClick={handlePasteFromClipboard}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 py-2 px-4 text-sm text-eg-purple hover:text-eg-purple/80 font-medium border-2 border-eg-purple/20 hover:border-eg-purple/40 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Pegar código del portapapeles
                    </button>
                  </div>

                  {/* Botones de acción */}
                  <div className="space-y-3">
                    <button
                      onClick={() => handleCodeSubmit()}
                      disabled={loading || code.join('').length !== 6}
                      className="w-full bg-gradient-to-r from-eg-purple to-eg-pink text-white py-3 px-6 rounded-lg font-medium shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-eg-purple/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Verificando...' : 'Verificar Código'}
                    </button>

                    <div className="flex justify-between items-center">
                      <button
                        onClick={handleBackToPhone}
                        disabled={loading}
                        className="text-sm text-eg-purple hover:text-eg-purple/80 font-medium transition-colors disabled:opacity-50"
                      >
                        ← Cambiar teléfono
                      </button>

                      <button
                        onClick={handleResendCode}
                        disabled={loading || resendTimer > 0}
                        className="text-sm text-eg-purple hover:text-eg-purple/80 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {resendTimer > 0 ? `Reenviar (${resendTimer}s)` : 'Reenviar código'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

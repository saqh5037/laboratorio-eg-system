import { forwardRef, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

// Screen Reader Only content
export const ScreenReaderOnly = ({ children, as: Component = 'span' }) => (
  <Component className="sr-only">
    {children}
  </Component>
);

// Skip Link para navegación por teclado
export const SkipLink = ({ href = "#main-content", children = "Saltar al contenido principal" }) => (
  <a 
    href={href}
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
  >
    {children}
  </a>
);

// Live Region para anuncios dinámicos
export const LiveRegion = ({ 
  children, 
  polite = true, 
  atomic = false,
  relevant = "all" 
}) => (
  <div 
    aria-live={polite ? "polite" : "assertive"}
    aria-atomic={atomic}
    aria-relevant={relevant}
    className="sr-only"
  >
    {children}
  </div>
);

// Contenedor con roles ARIA apropiados
export const LandmarkRegion = ({ 
  children, 
  role = "region", 
  label,
  labelledBy,
  className = "" 
}) => (
  <div 
    role={role}
    aria-label={label}
    aria-labelledby={labelledBy}
    className={className}
  >
    {children}
  </div>
);

// Botón accesible con estados ARIA
export const AccessibleButton = forwardRef(({ 
  children,
  onClick,
  disabled = false,
  pressed,
  expanded,
  controls,
  describedBy,
  label,
  className = "",
  variant = "primary",
  ...props 
}, ref) => {
  const buttonRef = useRef(null);
  const finalRef = ref || buttonRef;

  const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500",
    ghost: "text-gray-600 hover:bg-gray-100 focus:ring-gray-500"
  };

  return (
    <motion.button
      ref={finalRef}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={pressed}
      aria-expanded={expanded}
      aria-controls={controls}
      aria-describedby={describedBy}
      aria-label={label}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      {...props}
    >
      {children}
    </motion.button>
  );
});

AccessibleButton.displayName = 'AccessibleButton';

// Input accesible con labels y descripciones
export const AccessibleInput = forwardRef(({ 
  label,
  description,
  error,
  required = false,
  type = "text",
  className = "",
  ...props 
}, ref) => {
  const inputId = useRef(`input-${Math.random().toString(36).substr(2, 9)}`);
  const descriptionId = useRef(`desc-${Math.random().toString(36).substr(2, 9)}`);
  const errorId = useRef(`error-${Math.random().toString(36).substr(2, 9)}`);

  const describedBy = [
    description ? descriptionId.current : null,
    error ? errorId.current : null
  ].filter(Boolean).join(' ');

  return (
    <div className="space-y-1">
      {label && (
        <label 
          htmlFor={inputId.current}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="requerido">*</span>
          )}
        </label>
      )}
      
      {description && (
        <p id={descriptionId.current} className="text-sm text-gray-600">
          {description}
        </p>
      )}
      
      <input
        ref={ref}
        id={inputId.current}
        type={type}
        required={required}
        aria-describedby={describedBy || undefined}
        aria-invalid={error ? 'true' : 'false'}
        className={`
          block w-full px-3 py-2 border rounded-md shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${error ? 'border-red-300' : 'border-gray-300'}
          ${className}
        `}
        {...props}
      />
      
      {error && (
        <p id={errorId.current} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

AccessibleInput.displayName = 'AccessibleInput';

// Combobox accesible para búsquedas
export const AccessibleCombobox = ({ 
  label,
  options = [],
  value,
  onChange,
  placeholder = "Buscar...",
  noResultsText = "No se encontraron resultados",
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  
  const comboboxId = useRef(`combobox-${Math.random().toString(36).substr(2, 9)}`);
  const listboxId = useRef(`listbox-${Math.random().toString(36).substr(2, 9)}`);
  const inputRef = useRef(null);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setActiveIndex(-1);
  }, [query]);

  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setIsOpen(true);
        setActiveIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && filteredOptions[activeIndex]) {
          onChange(filteredOptions[activeIndex]);
          setIsOpen(false);
          setQuery('');
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setActiveIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label 
          htmlFor={comboboxId.current}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={inputRef}
          id={comboboxId.current}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={listboxId.current}
          aria-activedescendant={
            activeIndex >= 0 ? `option-${activeIndex}` : undefined
          }
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        
        {isOpen && (
          <motion.ul
            id={listboxId.current}
            role="listbox"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
          >
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-2 text-gray-500 text-sm">
                {noResultsText}
              </li>
            ) : (
              filteredOptions.map((option, index) => (
                <li
                  key={option.value}
                  id={`option-${index}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                    setQuery('');
                  }}
                  className={`
                    px-3 py-2 cursor-pointer text-sm
                    ${index === activeIndex 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-900 hover:bg-gray-100'
                    }
                  `}
                >
                  {option.label}
                </li>
              ))
            )}
          </motion.ul>
        )}
      </div>
    </div>
  );
};

// Modal accesible con trap de foco
export const AccessibleModal = ({ 
  isOpen,
  onClose,
  title,
  description,
  children,
  className = "" 
}) => {
  const modalRef = useRef(null);
  const titleId = useRef(`modal-title-${Math.random().toString(36).substr(2, 9)}`);
  const descId = useRef(`modal-desc-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    if (isOpen) {
      // Trap focus within modal
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements?.length > 0) {
        focusableElements[0].focus();
      }

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
        
        if (e.key === 'Tab') {
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];
          
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby={titleId.current}
      aria-describedby={descId.current}
      role="dialog"
      aria-modal="true"
    >
      <div className="min-h-screen px-4 text-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-25"
          onClick={onClose}
        />

        {/* Center modal */}
        <span className="inline-block h-screen align-middle" aria-hidden="true">
          &#8203;
        </span>

        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`
            inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left 
            align-middle transition-all transform bg-white shadow-xl rounded-2xl
            ${className}
          `}
        >
          {title && (
            <h3 
              id={titleId.current}
              className="text-lg font-medium leading-6 text-gray-900 mb-2"
            >
              {title}
            </h3>
          )}
          
          {description && (
            <p id={descId.current} className="text-sm text-gray-500 mb-4">
              {description}
            </p>
          )}
          
          {children}
        </motion.div>
      </div>
    </div>
  );
};

// Progress indicator accesible
export const AccessibleProgress = ({ 
  value,
  max = 100,
  label,
  description,
  className = "" 
}) => {
  const progressId = useRef(`progress-${Math.random().toString(36).substr(2, 9)}`);
  const percentage = Math.round((value / max) * 100);

  return (
    <div className={className}>
      {label && (
        <label htmlFor={progressId.current} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <div className="flex items-center space-x-3">
        <progress
          id={progressId.current}
          value={value}
          max={max}
          aria-describedby={description ? `${progressId.current}-desc` : undefined}
          className="flex-1 h-2"
        >
          {percentage}%
        </progress>
        
        <span aria-live="polite" className="text-sm text-gray-600 font-medium">
          {percentage}%
        </span>
      </div>
      
      {description && (
        <p id={`${progressId.current}-desc`} className="text-sm text-gray-500 mt-1">
          {description}
        </p>
      )}
    </div>
  );
};

// Tabs accesibles
export const AccessibleTabs = ({ 
  tabs,
  activeTab,
  onChange,
  className = "" 
}) => {
  const tablistId = useRef(`tablist-${Math.random().toString(36).substr(2, 9)}`);

  const handleKeyDown = (e, index) => {
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        const nextIndex = index < tabs.length - 1 ? index + 1 : 0;
        onChange(tabs[nextIndex].id);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        const prevIndex = index > 0 ? index - 1 : tabs.length - 1;
        onChange(tabs[prevIndex].id);
        break;
      case 'Home':
        e.preventDefault();
        onChange(tabs[0].id);
        break;
      case 'End':
        e.preventDefault();
        onChange(tabs[tabs.length - 1].id);
        break;
    }
  };

  return (
    <div className={className}>
      <div 
        role="tablist" 
        id={tablistId.current}
        className="flex border-b border-gray-200"
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`
              px-4 py-2 text-sm font-medium border-b-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              ${activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={activeTab !== tab.id}
          className="mt-4"
        >
          {activeTab === tab.id && tab.content}
        </div>
      ))}
    </div>
  );
};

export default {
  ScreenReaderOnly,
  SkipLink,
  LiveRegion,
  LandmarkRegion,
  AccessibleButton,
  AccessibleInput,
  AccessibleCombobox,
  AccessibleModal,
  AccessibleProgress,
  AccessibleTabs
};
import { useEffect, useRef, useCallback, useState } from 'react';

// Hook para navegación completa por teclado
export const useKeyboardNavigation = (options = {}) => {
  const {
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onEnter,
    onEscape,
    onTab,
    onSpace,
    preventDefault = true,
    enabled = true,
    shortcuts = {}
  } = options;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event) => {
      const { key, ctrlKey, metaKey, altKey, shiftKey } = event;

      // Construir string de combinación de teclas
      const combo = [
        ctrlKey && 'ctrl',
        metaKey && 'meta', 
        altKey && 'alt',
        shiftKey && 'shift',
        key.toLowerCase()
      ].filter(Boolean).join('+');

      // Verificar shortcuts personalizados
      if (shortcuts[combo]) {
        if (preventDefault) event.preventDefault();
        shortcuts[combo](event);
        return;
      }

      // Navegación básica
      switch (key) {
        case 'ArrowUp':
          if (preventDefault) event.preventDefault();
          onArrowUp?.(event);
          break;
        case 'ArrowDown':
          if (preventDefault) event.preventDefault();
          onArrowDown?.(event);
          break;
        case 'ArrowLeft':
          if (preventDefault) event.preventDefault();
          onArrowLeft?.(event);
          break;
        case 'ArrowRight':
          if (preventDefault) event.preventDefault();
          onArrowRight?.(event);
          break;
        case 'Enter':
          onEnter?.(event);
          break;
        case 'Escape':
          onEscape?.(event);
          break;
        case 'Tab':
          onTab?.(event);
          break;
        case ' ':
          if (preventDefault) event.preventDefault();
          onSpace?.(event);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    onArrowUp, onArrowDown, onArrowLeft, onArrowRight,
    onEnter, onEscape, onTab, onSpace,
    preventDefault, enabled, shortcuts
  ]);
};

// Hook para navegación en listas
export const useListNavigation = (items, options = {}) => {
  const {
    onSelect,
    onActivate,
    loop = true,
    autoFocus = true,
    enabled = true
  } = options;

  const [selectedIndex, setSelectedIndex] = useState(-1);
  const listRef = useRef(null);
  const itemRefs = useRef([]);

  // Configurar refs para items
  const setItemRef = useCallback((index) => (ref) => {
    itemRefs.current[index] = ref;
  }, []);

  // Auto focus en el primer item
  useEffect(() => {
    if (autoFocus && enabled && items.length > 0) {
      setSelectedIndex(0);
    }
  }, [autoFocus, enabled, items.length]);

  // Manejar selección
  useEffect(() => {
    if (selectedIndex >= 0 && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex].focus();
      onSelect?.(items[selectedIndex], selectedIndex);
    }
  }, [selectedIndex, items, onSelect]);

  const moveUp = useCallback(() => {
    setSelectedIndex(prev => {
      if (prev <= 0) {
        return loop ? items.length - 1 : 0;
      }
      return prev - 1;
    });
  }, [items.length, loop]);

  const moveDown = useCallback(() => {
    setSelectedIndex(prev => {
      if (prev >= items.length - 1) {
        return loop ? 0 : items.length - 1;
      }
      return prev + 1;
    });
  }, [items.length, loop]);

  const activate = useCallback(() => {
    if (selectedIndex >= 0) {
      onActivate?.(items[selectedIndex], selectedIndex);
    }
  }, [selectedIndex, items, onActivate]);

  useKeyboardNavigation({
    onArrowUp: moveUp,
    onArrowDown: moveDown,
    onEnter: activate,
    onSpace: activate,
    enabled,
    shortcuts: {
      'home': () => setSelectedIndex(0),
      'end': () => setSelectedIndex(items.length - 1)
    }
  });

  return {
    selectedIndex,
    setSelectedIndex,
    listRef,
    setItemRef,
    moveUp,
    moveDown,
    activate
  };
};

// Hook para navegación en grids
export const useGridNavigation = (items, columns, options = {}) => {
  const {
    onSelect,
    onActivate,
    loop = false,
    enabled = true
  } = options;

  const [selectedIndex, setSelectedIndex] = useState(0);
  const itemRefs = useRef([]);

  const setItemRef = useCallback((index) => (ref) => {
    itemRefs.current[index] = ref;
  }, []);

  const rows = Math.ceil(items.length / columns);

  const moveUp = useCallback(() => {
    setSelectedIndex(prev => {
      const newRow = Math.floor(prev / columns) - 1;
      if (newRow < 0) {
        return loop ? prev + (rows - 1) * columns : prev;
      }
      return newRow * columns + (prev % columns);
    });
  }, [columns, rows, loop]);

  const moveDown = useCallback(() => {
    setSelectedIndex(prev => {
      const currentRow = Math.floor(prev / columns);
      const newRow = currentRow + 1;
      if (newRow >= rows) {
        return loop ? prev % columns : prev;
      }
      const newIndex = newRow * columns + (prev % columns);
      return Math.min(newIndex, items.length - 1);
    });
  }, [columns, rows, items.length, loop]);

  const moveLeft = useCallback(() => {
    setSelectedIndex(prev => {
      if (prev % columns === 0) {
        return loop ? prev + columns - 1 : prev;
      }
      return prev - 1;
    });
  }, [columns, loop]);

  const moveRight = useCallback(() => {
    setSelectedIndex(prev => {
      if ((prev + 1) % columns === 0 || prev === items.length - 1) {
        return loop ? Math.floor(prev / columns) * columns : prev;
      }
      return prev + 1;
    });
  }, [columns, items.length, loop]);

  const activate = useCallback(() => {
    onActivate?.(items[selectedIndex], selectedIndex);
  }, [selectedIndex, items, onActivate]);

  useEffect(() => {
    if (selectedIndex >= 0 && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex].focus();
      onSelect?.(items[selectedIndex], selectedIndex);
    }
  }, [selectedIndex, items, onSelect]);

  useKeyboardNavigation({
    onArrowUp: moveUp,
    onArrowDown: moveDown,
    onArrowLeft: moveLeft,
    onArrowRight: moveRight,
    onEnter: activate,
    onSpace: activate,
    enabled
  });

  return {
    selectedIndex,
    setSelectedIndex,
    setItemRef,
    moveUp,
    moveDown,
    moveLeft,
    moveRight,
    activate
  };
};

// Hook para modal navigation
export const useModalNavigation = (isOpen, options = {}) => {
  const {
    onClose,
    trapFocus = true,
    returnFocus = true,
    enabled = true
  } = options;

  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  // Elementos focusables
  const getFocusableElements = useCallback(() => {
    if (!modalRef.current) return [];
    
    const selectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'textarea:not([disabled])',
      'select:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');

    return Array.from(modalRef.current.querySelectorAll(selectors));
  }, []);

  // Trap focus dentro del modal
  const trapFocusInModal = useCallback((event) => {
    if (!trapFocus || !isOpen) return;

    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.key === 'Tab') {
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  }, [trapFocus, isOpen, getFocusableElements]);

  // Manejar apertura del modal
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      
      // Focus en el primer elemento focusable
      setTimeout(() => {
        const focusableElements = getFocusableElements();
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        }
      }, 100);
    }

    return () => {
      if (returnFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, returnFocus, getFocusableElements]);

  useKeyboardNavigation({
    onEscape: onClose,
    enabled: enabled && isOpen,
    preventDefault: false
  });

  useEffect(() => {
    if (isOpen && enabled) {
      document.addEventListener('keydown', trapFocusInModal);
      return () => document.removeEventListener('keydown', trapFocusInModal);
    }
  }, [isOpen, enabled, trapFocusInModal]);

  return { modalRef };
};

// Hook para search/filter navigation
export const useSearchNavigation = (searchResults, options = {}) => {
  const {
    onSelect,
    onSearch,
    enabled = true,
    searchDelay = 300
  } = options;

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchTimeout = useRef(null);

  // Debounced search
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      onSearch?.(query);
    }, searchDelay);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [query, onSearch, searchDelay]);

  const handleCharacter = useCallback((char) => {
    if (char.length === 1 && char.match(/[a-zA-Z0-9\s]/)) {
      setQuery(prev => prev + char);
      setSelectedIndex(0);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    setSelectedIndex(-1);
  }, []);

  const selectResult = useCallback(() => {
    if (selectedIndex >= 0 && searchResults[selectedIndex]) {
      onSelect?.(searchResults[selectedIndex], selectedIndex);
    }
  }, [selectedIndex, searchResults, onSelect]);

  useKeyboardNavigation({
    onArrowUp: () => {
      setSelectedIndex(prev => 
        prev <= 0 ? searchResults.length - 1 : prev - 1
      );
    },
    onArrowDown: () => {
      setSelectedIndex(prev => 
        prev >= searchResults.length - 1 ? 0 : prev + 1
      );
    },
    onEnter: selectResult,
    onEscape: clearSearch,
    enabled,
    shortcuts: {
      'backspace': () => setQuery(prev => prev.slice(0, -1))
    }
  });

  return {
    query,
    selectedIndex,
    setQuery,
    setSelectedIndex,
    clearSearch,
    selectResult,
    handleCharacter
  };
};

// Hook para shortcuts médicos específicos
export const useMedicalShortcuts = (actions, enabled = true) => {
  const medicalShortcuts = {
    'ctrl+n': actions.newPatient,
    'ctrl+s': actions.saveRecord,
    'ctrl+f': actions.findPatient,
    'ctrl+p': actions.printReport,
    'f1': actions.showHelp,
    'f2': actions.quickSearch,
    'f3': actions.viewResults,
    'f4': actions.addNote,
    'f5': actions.refresh,
    'esc': actions.closeModal,
    'ctrl+z': actions.undo,
    'ctrl+y': actions.redo,
    'ctrl+shift+s': actions.saveAs,
    'alt+f4': actions.closeApp
  };

  useKeyboardNavigation({
    shortcuts: medicalShortcuts,
    enabled,
    preventDefault: true
  });
};

export default {
  useKeyboardNavigation,
  useListNavigation,
  useGridNavigation,
  useModalNavigation,
  useSearchNavigation,
  useMedicalShortcuts
};
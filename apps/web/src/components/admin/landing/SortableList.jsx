import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

/**
 * SortableItem Component
 * Wrapper individual para cada item draggable
 */
const SortableItem = ({ id, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10
                 opacity-0 group-hover:opacity-100 transition-opacity
                 cursor-grab active:cursor-grabbing
                 bg-white rounded-lg p-1 shadow-md border border-gray-200"
        title="Arrastrar para reordenar"
      >
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>

      {/* Content */}
      <div className={`transition-all ${isDragging ? 'shadow-2xl scale-105' : ''}`}>
        {children}
      </div>
    </div>
  );
};

/**
 * SortableList Component
 * Lista genérica con drag & drop para reordenar items
 *
 * @param {Array} items - Array de items a mostrar
 * @param {function} onReorder - Callback cuando cambia el orden: (newItems) => void
 * @param {function} renderItem - Función para renderizar cada item: (item, index) => JSX
 * @param {function} keyExtractor - Función para obtener la key única: (item) => string|number
 * @param {string} className - Clases CSS adicionales para el contenedor
 * @param {string} emptyMessage - Mensaje cuando no hay items
 *
 * @example
 * <SortableList
 *   items={values}
 *   onReorder={(newValues) => setValues(newValues)}
 *   renderItem={(value) => <ValueCard value={value} />}
 *   keyExtractor={(value) => value.id}
 *   emptyMessage="No hay valores corporativos"
 * />
 */
const SortableList = ({
  items = [],
  onReorder,
  renderItem,
  keyExtractor = (item) => item.id,
  className = '',
  emptyMessage = 'No hay items para mostrar'
}) => {
  // Configurar sensores para drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px de movimiento antes de iniciar drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  /**
   * Handler cuando termina el drag
   */
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    // Encontrar índices
    const oldIndex = items.findIndex(item => keyExtractor(item) === active.id);
    const newIndex = items.findIndex(item => keyExtractor(item) === over.id);

    // Reordenar array
    const newItems = arrayMove(items, oldIndex, newIndex);

    // Actualizar sort_order si los items lo tienen
    const itemsWithUpdatedOrder = newItems.map((item, index) => ({
      ...item,
      sort_order: index
    }));

    // Llamar callback
    onReorder(itemsWithUpdatedOrder);
  };

  // Si no hay items, mostrar mensaje
  if (!items || items.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-gray-400 mb-2">
          <svg
            className="mx-auto h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
        <p className="text-gray-500 text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map(keyExtractor)}
        strategy={verticalListSortingStrategy}
      >
        <div className={`space-y-3 ${className}`}>
          {items.map((item, index) => (
            <SortableItem key={keyExtractor(item)} id={keyExtractor(item)}>
              {renderItem(item, index)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default SortableList;

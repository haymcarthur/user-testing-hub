/**
 * Component Tree
 *
 * Hierarchical tree view showing the component structure.
 * Supports selection, deletion, reordering (drag-and-drop), and adding child components.
 */

import { useState, useEffect } from 'react';
import { getComponentMetadata } from '../../lib/componentMetadata';

export function ComponentTree({
  components,
  selectedComponentId,
  onSelectComponent,
  onDeleteComponent,
  onDuplicateComponent,
  onAddRootComponent,
  onAddComponentAsChild,
  onReorderComponents,
}) {
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [draggedId, setDraggedId] = useState(null);
  const [dropTargetId, setDropTargetId] = useState(null);
  const [dropPosition, setDropPosition] = useState(null); // 'before' | 'after' | 'inside'
  const [previousComponentIds, setPreviousComponentIds] = useState(new Set());

  const toggleExpanded = (id) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Auto-expand only NEW nodes that have children (preserve manual collapse states)
  useEffect(() => {
    const currentComponentIds = new Set();
    const nodesWithChildren = new Set();

    const findNodesWithChildren = (components) => {
      components.forEach(component => {
        currentComponentIds.add(component.id);

        const hasRegularChildren = component.children && component.children.length > 0;
        const hasSlotChildren = component.slotChildren && Object.values(component.slotChildren).some(slot => slot && slot.length > 0);

        if (hasRegularChildren || hasSlotChildren) {
          nodesWithChildren.add(component.id);
        }

        // Recursively check children
        if (hasRegularChildren) {
          findNodesWithChildren(component.children);
        }

        // Recursively check slot children
        if (hasSlotChildren) {
          Object.values(component.slotChildren).forEach(slotChildren => {
            if (slotChildren && slotChildren.length > 0) {
              findNodesWithChildren(slotChildren);
            }
          });
        }
      });
    };

    findNodesWithChildren(components);

    // Only auto-expand NEW nodes with children (nodes that weren't in the previous tree)
    setExpandedNodes(prev => {
      const next = new Set(prev);
      nodesWithChildren.forEach(id => {
        // Only add if this is a NEW node (wasn't in previous component tree)
        if (!previousComponentIds.has(id)) {
          next.add(id);
        }
      });
      return next;
    });

    // Update the previous component IDs
    setPreviousComponentIds(currentComponentIds);
  }, [components]);

  // Helper to find component and its parent
  const findComponentAndParent = (components, targetId, parent = null) => {
    for (let i = 0; i < components.length; i++) {
      const component = components[i];
      if (component.id === targetId) {
        return { component, parent, index: i, siblings: components };
      }
      // Search regular children
      if (component.children && component.children.length > 0) {
        const result = findComponentAndParent(component.children, targetId, component);
        if (result) return result;
      }
      // Search slot children
      if (component.slotChildren) {
        for (const slotChildren of Object.values(component.slotChildren)) {
          if (slotChildren && slotChildren.length > 0) {
            const result = findComponentAndParent(slotChildren, targetId, component);
            if (result) return result;
          }
        }
      }
    }
    return null;
  };

  // Helper to remove component from array
  const removeComponent = (components, targetId) => {
    return components.filter(c => {
      if (c.id === targetId) return false;
      // Remove from regular children
      if (c.children && c.children.length > 0) {
        c.children = removeComponent(c.children, targetId);
      }
      // Remove from slot children
      if (c.slotChildren) {
        for (const slotName of Object.keys(c.slotChildren)) {
          if (c.slotChildren[slotName] && c.slotChildren[slotName].length > 0) {
            c.slotChildren[slotName] = removeComponent(c.slotChildren[slotName], targetId);
          }
        }
      }
      return true;
    });
  };

  // Helper to insert component at position
  const insertComponent = (components, component, targetId, position) => {
    const result = [];
    for (let i = 0; i < components.length; i++) {
      const current = components[i];

      if (current.id === targetId) {
        if (position === 'before') {
          result.push(component);
          result.push(current);
        } else {
          result.push(current);
          result.push(component);
        }
      } else {
        // Check if we need to insert in children
        if (current.children && current.children.length > 0) {
          current.children = insertComponent(current.children, component, targetId, position);
        }
        result.push(current);
      }
    }
    return result;
  };

  const handleDragStart = (e, componentId) => {
    setDraggedId(componentId);
    e.dataTransfer.effectAllowed = 'move';
    // Make the drag image slightly transparent
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
    setDraggedId(null);
    setDropTargetId(null);
    setDropPosition(null);
  };

  const handleDragOver = (e, componentId, canHaveChildren) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedId === componentId) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    const height = rect.height;

    let position;

    if (canHaveChildren) {
      // For parent components, divide into 3 zones:
      // Top 25% = before, Middle 50% = inside, Bottom 25% = after
      if (relativeY < height * 0.25) {
        position = 'before';
      } else if (relativeY > height * 0.75) {
        position = 'after';
      } else {
        position = 'inside';
      }
    } else {
      // For leaf components, divide into 2 zones:
      // Top 50% = before, Bottom 50% = after
      position = relativeY < height * 0.5 ? 'before' : 'after';
    }

    setDropTargetId(componentId);
    setDropPosition(position);
  };

  const handleDragLeave = () => {
    setDropTargetId(null);
    setDropPosition(null);
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDropTargetId(null);
      setDropPosition(null);
      return;
    }

    // Find the dragged component
    const draggedResult = findComponentAndParent(components, draggedId);
    if (!draggedResult) return;

    // Find the target component
    const targetResult = findComponentAndParent(components, targetId);
    if (!targetResult) return;

    // Remove the dragged component first
    let newComponents = removeComponent(JSON.parse(JSON.stringify(components)), draggedId);

    if (dropPosition === 'inside') {
      // Add as child of target
      const addAsChild = (components, targetId, newChild) => {
        return components.map(c => {
          if (c.id === targetId) {
            return {
              ...c,
              children: [...(c.children || []), newChild]
            };
          }
          if (c.children && c.children.length > 0) {
            return {
              ...c,
              children: addAsChild(c.children, targetId, newChild)
            };
          }
          return c;
        });
      };

      newComponents = addAsChild(newComponents, targetId, draggedResult.component);
    } else {
      // Insert at same level (before or after)
      // But only if they're at the same level
      if (draggedResult.parent?.id !== targetResult.parent?.id) {
        // Different levels - cancel
        setDraggedId(null);
        setDropTargetId(null);
        setDropPosition(null);
        return;
      }

      newComponents = insertComponent(newComponents, draggedResult.component, targetId, dropPosition);
    }

    onReorderComponents(newComponents);

    setDraggedId(null);
    setDropTargetId(null);
    setDropPosition(null);
  };

  const renderComponent = (component, depth = 0) => {
    const metadata = getComponentMetadata(component.type);
    const isSelected = component.id === selectedComponentId;

    // Check for both regular children and slot children
    const hasRegularChildren = component.children && component.children.length > 0;
    const hasSlotChildren = component.slotChildren && Object.values(component.slotChildren).some(slot => slot && slot.length > 0);
    const hasChildren = hasRegularChildren || hasSlotChildren;

    const isExpanded = expandedNodes.has(component.id);
    const isDragging = draggedId === component.id;
    const isDropTarget = dropTargetId === component.id;
    const canHaveChildren = metadata?.hasChildren || false;

    return (
      <div key={component.id} className="select-none">
        {/* Drop indicator before */}
        {isDropTarget && dropPosition === 'before' && (
          <div className="h-0.5 bg-blue-500 mx-2" style={{ marginLeft: `${depth * 20 + 8}px` }} />
        )}

        {/* Component Node */}
        <div
          draggable
          onDragStart={(e) => handleDragStart(e, component.id)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => handleDragOver(e, component.id, canHaveChildren)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, component.id)}
          className={`group flex items-center gap-2 px-2 py-1.5 rounded transition-colors cursor-move ${
            isSelected
              ? 'bg-blue-100 border border-blue-300'
              : 'hover:bg-gray-100 border border-transparent'
          } ${isDragging ? 'opacity-50' : ''} ${
            isDropTarget && dropPosition === 'inside' ? 'ring-2 ring-blue-400 bg-blue-50' : ''
          }`}
          style={{ marginLeft: `${depth * 20}px` }}
        >
          {/* Expand/Collapse Button */}
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(component.id);
              }}
              className="flex-shrink-0 w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-700"
            >
              <svg
                className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <div className="w-4" />
          )}

          {/* Component Icon - Folder for parents, Document for leaf nodes */}
          <div
            className={`flex-shrink-0 text-xs ${
              isSelected ? 'text-blue-700' : 'text-gray-600'
            }`}
          >
            {metadata?.hasChildren ? '📁' : '📄'}
          </div>

          {/* Component Name */}
          <div
            onClick={() => onSelectComponent(component.id)}
            className="flex-1 min-w-0 cursor-pointer"
          >
            <p className={`text-sm font-medium truncate ${
              isSelected ? 'text-blue-900' : 'text-gray-900'
            }`}>
              {/* For parent components, use title. For others, use label if available */}
              {metadata?.hasChildren
                ? (component.props?.title || component.type)
                : (component.props?.label || component.props?.title || component.type)
              }
            </p>
            {/* Show component type as subtitle if we're showing a custom name */}
            {((metadata?.hasChildren && component.props?.title) || (!metadata?.hasChildren && component.props?.label)) && (
              <p className="text-xs text-gray-500 truncate">{component.type}</p>
            )}
            {/* Show child count for parents without custom title */}
            {hasChildren && !component.props?.title && (() => {
              // Count both regular and slot children
              const regularCount = component.children?.length || 0;
              const slotCount = component.slotChildren
                ? Object.values(component.slotChildren).reduce((sum, slot) => sum + (slot?.length || 0), 0)
                : 0;
              const totalCount = regularCount + slotCount;
              return (
                <p className="text-xs text-gray-500">
                  {totalCount} child{totalCount !== 1 ? 'ren' : ''}
                </p>
              );
            })()}
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Only show add child button for components that accept regular children (not slot-only components) */}
            {metadata?.hasChildren && !metadata?.slots && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddComponentAsChild(component.id);
                }}
                className="p-1 text-green-600 hover:bg-green-50 rounded"
                title="Add child"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicateComponent(component.id);
              }}
              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
              title="Duplicate"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteComponent(component.id);
              }}
              className="p-1 text-red-600 hover:bg-red-50 rounded"
              title="Delete"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Drop indicator after */}
        {isDropTarget && dropPosition === 'after' && (
          <div className="h-0.5 bg-blue-500 mx-2" style={{ marginLeft: `${depth * 20 + 8}px` }} />
        )}

        {/* Children */}
        {hasChildren && isExpanded && (
          <div>
            {/* Slot Children - with labels */}
            {hasSlotChildren && component.slotChildren && Object.entries(component.slotChildren).map(([slotName, slotChildren]) => {
              if (!slotChildren || slotChildren.length === 0) return null;
              return (
                <div key={slotName}>
                  <div className="text-xs text-gray-500 font-medium uppercase px-2 py-1" style={{ marginLeft: `${(depth + 1) * 20}px` }}>
                    {slotName}
                  </div>
                  {slotChildren.map(child => renderComponent(child, depth + 1))}
                </div>
              );
            })}

            {/* Regular Children */}
            {hasRegularChildren && component.children.map(child => renderComponent(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Component Tree</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              {components.length} component{components.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={onAddRootComponent}
              className="px-2 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded flex items-center gap-1"
              title="Add component"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Tree Content */}
      <div className="flex-1 overflow-y-auto p-2">
        {components.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <svg className="w-16 h-16 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <p className="text-sm font-medium">No components yet</p>
            <p className="text-xs mt-1">Click "Add" button above to add your first component</p>
          </div>
        ) : (
          <div className="space-y-1">
            {components.map(component => renderComponent(component, 0))}
          </div>
        )}
      </div>

      {/* Footer Hint */}
      <div className="flex-shrink-0 px-4 py-3 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          💡 <strong>Tip:</strong> Drag to reorder • Use + buttons to add children • Click to edit →
        </p>
      </div>
    </div>
  );
}

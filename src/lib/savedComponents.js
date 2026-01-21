/**
 * Saved Components Library
 *
 * Manages user-saved custom component compositions.
 * Saved components are stored in localStorage and can be reused across prototypes.
 */

const STORAGE_KEY = 'zion-saved-components';

/**
 * Get all saved components
 */
export function getSavedComponents() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading saved components:', error);
    return [];
  }
}

/**
 * Save a new component composition
 */
export function saveComponent(component, name, description) {
  const savedComponents = getSavedComponents();

  const newSavedComponent = {
    id: `saved-${Date.now()}`,
    name,
    description: description || 'Custom saved component',
    component: JSON.parse(JSON.stringify(component)), // Deep clone
    createdAt: new Date().toISOString(),
  };

  savedComponents.push(newSavedComponent);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(savedComponents));

  return newSavedComponent;
}

/**
 * Delete a saved component
 */
export function deleteSavedComponent(id) {
  const savedComponents = getSavedComponents();
  const filtered = savedComponents.filter(comp => comp.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return filtered;
}

/**
 * Get a saved component by ID
 */
export function getSavedComponentById(id) {
  const savedComponents = getSavedComponents();
  return savedComponents.find(comp => comp.id === id);
}

/**
 * Update a saved component
 */
export function updateSavedComponent(id, updates) {
  const savedComponents = getSavedComponents();
  const updated = savedComponents.map(comp =>
    comp.id === id ? { ...comp, ...updates } : comp
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

/**
 * Create a hash of a component's structure to detect modifications
 */
function hashComponent(component) {
  // Create a deterministic string representation of the component
  const hashable = {
    type: component.type,
    props: component.props,
    childrenCount: component.children?.length || 0,
    slotChildrenKeys: component.slotChildren ? Object.keys(component.slotChildren) : []
  };
  return JSON.stringify(hashable);
}

/**
 * Create a new instance of a saved component with new IDs
 */
export function instantiateSavedComponent(savedComponentId) {
  const saved = getSavedComponentById(savedComponentId);
  if (!saved) return null;

  // Clone the component and regenerate all IDs
  const regenerateIds = (component, isRoot = false) => {
    const newComponent = {
      ...component,
      id: `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      props: { ...component.props },
    };

    // Add metadata to track this is from a saved component (only on root)
    if (isRoot) {
      newComponent.savedComponentId = savedComponentId;
      newComponent.savedComponentHash = hashComponent(component);
    }

    if (component.children && component.children.length > 0) {
      newComponent.children = component.children.map(child => regenerateIds(child, false));
    }

    if (component.slotChildren) {
      newComponent.slotChildren = {};
      Object.keys(component.slotChildren).forEach(slotName => {
        if (component.slotChildren[slotName]) {
          newComponent.slotChildren[slotName] = component.slotChildren[slotName].map(child => regenerateIds(child, false));
        }
      });
    }

    return newComponent;
  };

  return regenerateIds(saved.component, true);
}

/**
 * Check if a component matches its saved version (hasn't been modified)
 */
export function isUnmodifiedSavedComponent(component) {
  if (!component.savedComponentId || !component.savedComponentHash) {
    return false;
  }

  const currentHash = hashComponent(component);
  return currentHash === component.savedComponentHash;
}

/**
 * Property Editor Component
 *
 * Smart property editing panel that renders appropriate inputs based on prop types.
 * Supports strings, numbers, booleans, enums, design tokens, actions, icons, and children.
 * Includes conditional property rendering based on other property values.
 */

import { useState } from 'react';
import { PropTypes, getComponentMetadata, LAYOUT_PROPS } from '../../lib/componentMetadata';
import {
  ColorTokenPicker,
  SpacingTokenPicker,
  TypographyTokenPicker,
  ElevationTokenPicker,
} from './DesignTokenPicker';
import { ActionEditor } from './ActionEditor';
import { IconPicker } from './IconPicker';

export function PropertyEditor({ component, parentComponent, onUpdate, allComponents = [], onAddChild, onSaveComponent }) {
  if (!component) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400 text-sm">
        Select a component to edit its properties
      </div>
    );
  }

  const metadata = getComponentMetadata(component.type);

  if (!metadata) {
    return (
      <div className="h-full flex items-center justify-center text-red-600 text-sm">
        Unknown component type: {component.type}
      </div>
    );
  }

  const handlePropChange = (propName, value) => {
    onUpdate({
      ...component,
      props: {
        ...component.props,
        [propName]: value,
      },
    });
  };

  const handleActionChange = (propName, actionIndex, actionData) => {
    const actions = component.actions || [];
    const updatedActions = [...actions];

    if (actionIndex >= 0 && actionIndex < actions.length) {
      updatedActions[actionIndex] = { ...actionData, propName };
    } else {
      updatedActions.push({ ...actionData, propName });
    }

    onUpdate({
      ...component,
      actions: updatedActions,
    });
  };

  // Check if a property should be shown based on showWhen conditions
  const shouldShowProp = (prop) => {
    if (!prop.showWhen) return true;

    // showWhen can be an object like { billboard: true } or { type: ['filter', 'choice'] }
    for (const [conditionProp, conditionValue] of Object.entries(prop.showWhen)) {
      let actualValue = component.props[conditionProp];

      // If the prop is undefined, use the default value from metadata
      if (actualValue === undefined) {
        const conditionPropMetadata = metadata.props.find(p => p.name === conditionProp);
        if (conditionPropMetadata && conditionPropMetadata.default !== undefined) {
          actualValue = conditionPropMetadata.default;
        }
      }

      // Handle array of values (e.g., type: ['filter', 'choice'])
      if (Array.isArray(conditionValue)) {
        if (!conditionValue.includes(actualValue)) {
          return false;
        }
      } else {
        // Handle single value (e.g., billboard: true)
        if (actualValue !== conditionValue) {
          return false;
        }
      }
    }

    return true;
  };

  const renderPropInput = (prop) => {
    const value = component.props[prop.name];

    switch (prop.type) {
      case PropTypes.STRING:
        // Use textarea for customNotes
        if (prop.name === 'customNotes') {
          return (
            <textarea
              value={value || ''}
              onChange={(e) => handlePropChange(prop.name, e.target.value)}
              placeholder={prop.description || 'Add any special notes or requirements...'}
              rows={4}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
            />
          );
        }

        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handlePropChange(prop.name, e.target.value)}
            placeholder={prop.description || `Enter ${prop.name}...`}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );

      case PropTypes.NUMBER:
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => handlePropChange(prop.name, parseFloat(e.target.value))}
            placeholder={prop.default !== undefined ? `Default: ${prop.default}` : ''}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );

      case PropTypes.BOOLEAN:
        // Boolean is handled entirely by PropControl component
        return null;

      case PropTypes.ENUM:
        // Use IconPicker for icon properties
        if (prop.isIcon) {
          return (
            <IconPicker
              value={value || ''}
              onChange={(val) => handlePropChange(prop.name, val)}
              label=""
            />
          );
        }

        // Standard enum dropdown
        return (
          <select
            value={value || ''}
            onChange={(e) => handlePropChange(prop.name, e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select {prop.name}...</option>
            {prop.options.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case PropTypes.COLOR:
        return <ColorTokenPicker value={value} onChange={(val) => handlePropChange(prop.name, val)} />;

      case PropTypes.SPACING:
        return <SpacingTokenPicker value={value} onChange={(val) => handlePropChange(prop.name, val)} />;

      case PropTypes.TYPOGRAPHY:
        return <TypographyTokenPicker value={value} onChange={(val) => handlePropChange(prop.name, val)} />;

      case PropTypes.ELEVATION:
        return <ElevationTokenPicker value={value} onChange={(val) => handlePropChange(prop.name, val)} />;

      case PropTypes.FUNCTION:
        if (prop.acceptsAction) {
          // Use simplified ActionEditor (just text description)
          const actionIndex = (component.actions || []).findIndex(a => a.propName === prop.name);
          const existingAction = actionIndex >= 0 ? component.actions[actionIndex] : null;

          return (
            <ActionEditor
              value={existingAction?.description || ''}
              onChange={(description) => handleActionChange(prop.name, actionIndex, { type: 'custom', description })}
            />
          );
        }
        return (
          <div className="text-xs text-gray-500 italic">
            Function props are handled automatically
          </div>
        );

      case PropTypes.NODE:
        return (
          <div className="text-xs text-gray-500 italic">
            Use "Add Child Component" button below to add children
          </div>
        );

      case PropTypes.COMPONENT:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handlePropChange(prop.name, e.target.value)}
            placeholder="Enter component name (e.g., Settings, Info)"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handlePropChange(prop.name, e.target.value)}
            placeholder={`Enter ${prop.name}...`}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );
    }
  };

  // Get layout props based on parent component type
  const layoutProps = parentComponent && LAYOUT_PROPS[parentComponent.type]
    ? LAYOUT_PROPS[parentComponent.type]
    : [];

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Component Header */}
      <div className="pb-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">{component.type}</h3>
        <p className="text-xs text-gray-500 mt-1">{metadata.description}</p>
        <p className="text-xs text-gray-400 font-mono mt-1">ID: {component.id.slice(0, 12)}...</p>
        {parentComponent && (
          <p className="text-xs text-blue-600 mt-1">↳ Inside: {parentComponent.type}</p>
        )}
      </div>

      {/* Properties */}
      <div className="space-y-4">
        {metadata.props
          .filter(prop => shouldShowProp(prop)) // Apply conditional rendering
          .sort((a, b) => {
            // Sort so boolean properties come last
            const aIsBoolean = a.type === PropTypes.BOOLEAN;
            const bIsBoolean = b.type === PropTypes.BOOLEAN;

            if (aIsBoolean === bIsBoolean) return 0; // Keep original order
            if (aIsBoolean) return 1; // a is boolean, move to end
            return -1; // b is boolean, a comes first
          })
          .map(prop => (
            <PropControl
              key={prop.name}
              prop={prop}
              value={component.props[prop.name]}
              onChange={(value) => handlePropChange(prop.name, value)}
              renderInput={() => renderPropInput(prop)}
            />
          ))}
      </div>

      {/* Layout Properties (if inside a layout component) */}
      {layoutProps.length > 0 && (
        <div className="pt-3 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Layout Properties
            <span className="text-xs text-gray-500 ml-2 font-normal">(for {parentComponent.type})</span>
          </h4>
          <div className="space-y-4">
            {layoutProps
              .sort((a, b) => {
                // Sort so boolean properties come last
                const aIsBoolean = a.type === PropTypes.BOOLEAN;
                const bIsBoolean = b.type === PropTypes.BOOLEAN;

                if (aIsBoolean === bIsBoolean) return 0;
                if (aIsBoolean) return 1;
                return -1;
              })
              .map(prop => (
                <PropControl
                  key={prop.name}
                  prop={prop}
                  value={component.props[prop.name]}
                  onChange={(value) => handlePropChange(prop.name, value)}
                  renderInput={() => renderPropInput(prop)}
                />
              ))}
          </div>
        </div>
      )}

      {/* Add Child Component Button(s) - Slot-based, dynamic slots, or single */}
      {metadata.hasChildren && (
        <div className="pt-3 border-t border-gray-200 space-y-2">
          {metadata.hasDynamicSlots && metadata.name === 'DataTable' ? (
            // DataTable with dynamic slots - generate buttons based on columnCount
            Array.from({ length: component.props.columnCount || 3 }).map((_, index) => {
              const slotName = `column${index + 1}`;
              const slotChildren = component.slotChildren?.[slotName] || [];
              const headers = component.props.columnHeaders?.split(',') || [];
              const header = headers[index]?.trim() || `Column ${index + 1}`;

              return (
                <div key={slotName}>
                  <button
                    onClick={() => onAddChild(component.id, slotName, metadata.slotTemplate.allowedComponents)}
                    className="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-300 rounded-md hover:bg-blue-100 transition-colors"
                  >
                    + Add {header} Component
                  </button>
                  {slotChildren.length > 0 && (
                    <p className="text-xs text-gray-600 mt-1">
                      {slotChildren.length} component(s)
                    </p>
                  )}
                </div>
              );
            })
          ) : metadata.slots ? (
            // Component has slots - show one button per slot (filtered by showWhen)
            metadata.slots
              .filter((slot) => {
                // Check showWhen condition for slots (same logic as props)
                if (!slot.showWhen) return true;

                for (const [conditionProp, conditionValue] of Object.entries(slot.showWhen)) {
                  let actualValue = component.props[conditionProp];

                  // If the prop is undefined, use the default value from metadata
                  if (actualValue === undefined) {
                    const conditionPropMetadata = metadata.props.find(p => p.name === conditionProp);
                    if (conditionPropMetadata && conditionPropMetadata.default !== undefined) {
                      actualValue = conditionPropMetadata.default;
                    }
                  }

                  // Handle array of values
                  if (Array.isArray(conditionValue)) {
                    if (!conditionValue.includes(actualValue)) {
                      return false;
                    }
                  } else {
                    // Handle single value
                    if (actualValue !== conditionValue) {
                      return false;
                    }
                  }
                }

                return true;
              })
              .map((slot) => {
              const slotChildren = component.slotChildren?.[slot.name] || [];
              return (
                <div key={slot.name}>
                  <button
                    onClick={() => onAddChild(component.id, slot.name, slot.allowedComponents, slot.autoAdd)}
                    className="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-300 rounded-md hover:bg-blue-100 transition-colors"
                  >
                    + Add {slot.label}
                  </button>
                  {slot.allowedComponents && (
                    <p className="text-xs text-gray-500 mt-1">
                      Allowed: {slot.allowedComponents.join(', ')}
                    </p>
                  )}
                  {slotChildren.length > 0 && (
                    <p className="text-xs text-gray-600 mt-1">
                      {slotChildren.length} {slot.label.toLowerCase()}{slotChildren.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              );
            })
          ) : (
            // Component has simple children (no slots)
            <>
              <button
                onClick={() => onAddChild(component.id)}
                className="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-300 rounded-md hover:bg-blue-100 transition-colors"
              >
                + Add Child Component
              </button>
              {component.children && component.children.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  {component.children.length} child component{component.children.length !== 1 ? 's' : ''}
                </p>
              )}
            </>
          )}
        </div>
      )}

      {/* Save as Custom Component Button */}
      <div className="pt-3 border-t border-gray-200">
        <button
          onClick={() => onSaveComponent(component.id)}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          Save as Custom Component
        </button>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Save this component with all its children to reuse later
        </p>
      </div>
    </div>
  );
}

// PropControl Component - handles property display with info icon and description toggle
function PropControl({ prop, value, onChange, renderInput }) {
  const [showDescription, setShowDescription] = useState(false);

  // For boolean properties, render them inline with checkbox and label
  if (prop.type === PropTypes.BOOLEAN) {
    return (
      <div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value !== undefined ? value : (prop.default || false)}
              onChange={(e) => onChange(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-xs font-medium text-gray-700">{prop.name}</span>
          </label>
          {prop.description && (
            <button
              type="button"
              onClick={() => setShowDescription(!showDescription)}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
              title="Toggle description"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          )}
        </div>
        {prop.description && showDescription && (
          <p className="text-xs text-gray-500 mt-1 bg-gray-50 p-2 rounded">{prop.description}</p>
        )}
      </div>
    );
  }

  // For all other property types, render label with input below
  return (
    <div>
      <div className="flex items-center gap-1 mb-1.5">
        <label className="text-xs font-medium text-gray-700">
          {prop.name}
          {prop.required && <span className="text-red-600 ml-1">*</span>}
          {prop.default !== undefined && !prop.required && (
            <span className="text-gray-400 ml-1 font-normal">(default: {String(prop.default)})</span>
          )}
        </label>
        {prop.description && prop.type !== PropTypes.FUNCTION && (
          <button
            type="button"
            onClick={() => setShowDescription(!showDescription)}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
            title="Toggle description"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        )}
      </div>
      {renderInput()}
      {prop.description && showDescription && prop.type !== PropTypes.FUNCTION && (
        <p className="text-xs text-gray-500 mt-1 bg-gray-50 p-2 rounded">{prop.description}</p>
      )}
    </div>
  );
}

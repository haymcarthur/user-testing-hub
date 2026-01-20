import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { COMPONENT_METADATA, ComponentCategories } from '../lib/componentMetadata';
import { loadComponent, canLoadComponent } from '../lib/componentLoader';
import { PropTypes as MetaPropTypes } from '../lib/componentMetadata';
import { DesignTokens } from './DesignTokens';
import { IconsPage } from './Icons';
import * as Icons from '../../ux-zion-library/src/icons';
import { Button } from '../../ux-zion-library/src/components/Button';
import { ListItem } from '../../ux-zion-library/src/components/ListItem';
import { getSavedComponents, deleteSavedComponent } from '../lib/savedComponents';

export function ComponentShowcase() {
  const { componentName } = useParams();
  const navigate = useNavigate();
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [Component, setComponent] = useState(null);
  const [props, setProps] = useState({});
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedComponents, setSavedComponents] = useState([]);
  const [tutorialOverlayOpen, setTutorialOverlayOpen] = useState(false);

  // Load saved components on mount
  useEffect(() => {
    setSavedComponents(getSavedComponents());
  }, []);

  // Group components by category - only include components that can be loaded
  const componentsByCategory = {};
  Object.entries(COMPONENT_METADATA).forEach(([name, metadata]) => {
    // Skip components that don't have a loader (abstract/placeholder components)
    if (!canLoadComponent(name)) {
      return;
    }

    // Filter by search query
    if (searchQuery && !name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return;
    }

    const category = metadata.category || 'Other';
    if (!componentsByCategory[category]) {
      componentsByCategory[category] = [];
    }
    componentsByCategory[category].push({ name, ...metadata });
  });

  // Add saved components to the Composite category
  const filteredSavedComponents = savedComponents.filter(saved =>
    !searchQuery ||
    saved.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    saved.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (filteredSavedComponents.length > 0) {
    if (!componentsByCategory[ComponentCategories.COMPOSITE]) {
      componentsByCategory[ComponentCategories.COMPOSITE] = [];
    }

    filteredSavedComponents.forEach(saved => {
      componentsByCategory[ComponentCategories.COMPOSITE].push({
        name: saved.name,
        description: saved.description,
        isSaved: true,
        savedId: saved.id,
      });
    });
  }

  // Sort categories and components
  const sortedCategories = Object.keys(componentsByCategory).sort();
  Object.keys(componentsByCategory).forEach(category => {
    componentsByCategory[category].sort((a, b) => a.name.localeCompare(b.name));
  });

  // Load component when selected
  useEffect(() => {
    if (!componentName || componentName === 'design-tokens' || componentName === 'icons') {
      setSelectedComponent(null);
      setComponent(null);
      return;
    }

    // Convert URL param back to component name
    const actualComponentName = componentName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');

    const metadata = COMPONENT_METADATA[actualComponentName];
    if (!metadata) {
      setError('Component not found');
      return;
    }

    // Initialize component with metadata, and copy defaultSlotChildren to slotChildren if they exist
    const initialComponent = {
      name: actualComponentName,
      ...metadata,
      // Copy defaultSlotChildren to slotChildren for initial state
      slotChildren: metadata.defaultSlotChildren ? { ...metadata.defaultSlotChildren } : {}
    };
    setSelectedComponent(initialComponent);
    setTutorialOverlayOpen(false); // Reset overlay state when switching components

    async function load() {
      try {
        setError(null);
        const comp = await loadComponent(actualComponentName);
        setComponent(() => comp);

        // Initialize props with defaults and example data
        if (metadata?.props) {
          const initialProps = {};
          metadata.props.forEach(prop => {
            // Skip internal props
            if (prop.name === 'customNotes') {
              return;
            }

            // Skip title only if it's a tree label (not an actual component prop)
            if (prop.name === 'title' && prop.description === 'Label for this component in the tree') {
              return;
            }

            // Skip state props for interactive components (Checkbox, Radio, Toggle)
            if ((actualComponentName === 'Checkbox' || actualComponentName === 'Radio' || actualComponentName === 'Toggle')
                && (prop.name === 'checked' || prop.name === 'selected')) {
              return;
            }

            // Use default if provided
            if (prop.default !== undefined) {
              initialProps[prop.name] = prop.default;
            }
            // Otherwise populate with example data based on prop type and name
            else if (prop.type === MetaPropTypes.STRING) {
              // Generate appropriate example text based on prop name
              if (prop.name === 'label' || prop.name === 'labelLarge') {
                initialProps[prop.name] = 'Label Text';
              } else if (prop.name === 'placeholder') {
                initialProps[prop.name] = 'Enter text here...';
              } else if (prop.name === 'title' && prop.description !== 'Label for this component in the tree') {
                initialProps[prop.name] = 'Example Title';
              } else if (prop.name === 'heading') {
                initialProps[prop.name] = 'Example Heading';
              } else if (prop.name === 'subheading') {
                initialProps[prop.name] = 'Example subheading text';
              } else if (prop.name === 'text' && actualComponentName === 'Tag') {
                initialProps[prop.name] = 'Tag Text';
              } else if (prop.name === 'text' || prop.name === 'content') {
                initialProps[prop.name] = 'Example content text for this component';
              } else if (prop.name === 'message' && actualComponentName === 'AlertBanner') {
                initialProps[prop.name] = 'This is an important alert message for the user';
              } else if (prop.name === 'message') {
                initialProps[prop.name] = 'Example message text';
              } else if (prop.name === 'primaryButtonLabel' && actualComponentName === 'AlertBanner') {
                initialProps[prop.name] = 'Learn More';
              } else if (prop.name === 'secondaryButtonLabel' && actualComponentName === 'AlertBanner') {
                initialProps[prop.name] = 'Dismiss';
              } else if (prop.name === 'value') {
                initialProps[prop.name] = 'Example value';
              } else if (prop.name === 'options' && actualComponentName === 'AutoSelect') {
                initialProps[prop.name] = 'New York, Los Angeles, Chicago, Houston, Phoenix';
              } else if (prop.name === 'items' && actualComponentName === 'Breadcrumb') {
                initialProps[prop.name] = 'Home, Products';
              } else if (prop.name === 'menuItems' && actualComponentName === 'MenuOverlay') {
                initialProps[prop.name] = 'Home with house icon\nProfile with avatar and subheading "View profile"\nSettings with gear icon and arrow';
              } else if (prop.name === 'primaryButtonLabel' && actualComponentName === 'DialogOverlay') {
                initialProps[prop.name] = 'OK';
              } else if (prop.name === 'secondaryButtonLabel' && actualComponentName === 'DialogOverlay') {
                initialProps[prop.name] = 'Cancel';
              } else if (prop.name === 'leftButtonLabel' && actualComponentName === 'DialogOverlay') {
                initialProps[prop.name] = 'Delete';
              } else if (prop.name === 'breadcrumbItems' && actualComponentName === 'FullPageOverlay') {
                initialProps[prop.name] = 'Home, Records';
              } else if (prop.name === 'lowEmphasis1Label' && actualComponentName === 'FullPageOverlay') {
                initialProps[prop.name] = 'Names';
              } else if (prop.name === 'lowEmphasis1Icon' && actualComponentName === 'FullPageOverlay') {
                initialProps[prop.name] = 'RecordPerson';
              } else if (prop.name === 'lowEmphasis2Label' && actualComponentName === 'FullPageOverlay') {
                initialProps[prop.name] = 'Information';
              } else if (prop.name === 'lowEmphasis2Icon' && actualComponentName === 'FullPageOverlay') {
                initialProps[prop.name] = 'Info';
              } else if (prop.name === 'headerPrimaryLabel' && actualComponentName === 'FullPageOverlay') {
                initialProps[prop.name] = 'Save Record';
              } else if (prop.name === 'footerPrimaryLabel' && actualComponentName === 'FullPageOverlay') {
                initialProps[prop.name] = 'Save';
              } else if (prop.name === 'footerSecondaryLabel' && actualComponentName === 'FullPageOverlay') {
                initialProps[prop.name] = 'Cancel';
              } else if (prop.name === 'primaryButtonLabel' && actualComponentName === 'InfoSheet') {
                initialProps[prop.name] = 'Save';
              } else if (prop.name === 'secondaryButtonLabel' && actualComponentName === 'InfoSheet') {
                initialProps[prop.name] = 'Cancel';
              } else if (prop.name === 'labelCustom' && actualComponentName === 'ZoomPanControl') {
                initialProps[prop.name] = 'Custom Control';
              } else if (prop.name.toLowerCase().includes('url') || prop.name.toLowerCase().includes('src') || prop.name.toLowerCase().includes('image')) {
                initialProps[prop.name] = 'https://placehold.co/400x300';
              } else if (prop.name === 'onClick' || prop.name === 'onChange' || prop.name === 'onRemove' || prop.name === 'onToggleExpand' || prop.name === 'onButtonClick') {
                // Don't set handler props - they'll be undefined
                return;
              } else if (prop.name === 'content' && actualComponentName === 'TestInstructionOverlay') {
                // Don't set default content - let the component determine it based on type
                // This allows recording type to show its default text
                return;
              } else if (prop.name === 'customButtonText' && actualComponentName === 'TestInstructionOverlay') {
                // Don't set default customButtonText - let the component determine it based on type
                return;
              } else if (prop.name === 'questionText' && (actualComponentName === 'OpenTextQuestion' || actualComponentName === 'OpinionScaleQuestion' || actualComponentName === 'MultipleChoiceQuestion')) {
                initialProps[prop.name] = 'How satisfied are you with this experience?';
                return;
              } else if (prop.name === 'options' && actualComponentName === 'MultipleChoiceQuestion') {
                initialProps[prop.name] = 'Very satisfied, Satisfied, Neutral, Dissatisfied, Very dissatisfied';
                return;
              } else {
                initialProps[prop.name] = `Example ${prop.name}`;
              }
            } else if (prop.type === MetaPropTypes.NUMBER) {
              // Special handling for startTime in TestRecordingControls
              if (prop.name === 'startTime' && actualComponentName === 'TestRecordingControls') {
                initialProps[prop.name] = Date.now();
              } else if (prop.name === 'currentStep' && actualComponentName === 'TestInstructionOverlay') {
                initialProps[prop.name] = 2;
              } else if (prop.name === 'totalSteps' && actualComponentName === 'TestInstructionOverlay') {
                initialProps[prop.name] = 5;
              } else {
                initialProps[prop.name] = 0;
              }
            } else if (prop.type === MetaPropTypes.BOOLEAN) {
              initialProps[prop.name] = false;
            } else if (prop.type === MetaPropTypes.ENUM) {
              // For ENUM types, use first option or a sensible default
              if (prop.isIcon) {
                // For icon properties, default to a common icon
                initialProps[prop.name] = 'Add';
              } else if (prop.options && prop.options.length > 0) {
                // Use first option as default
                initialProps[prop.name] = prop.options[0];
              }
            }
          });
          setProps(initialProps);
        }
      } catch (err) {
        console.error('Failed to load component:', actualComponentName, err);
        setError(`${err.message || 'Unknown error'}`);
      }
    }
    load();
  }, [componentName]);

  const handleComponentClick = (name) => {
    // Convert camelCase to kebab-case: TextField -> text-field
    const urlName = name.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
    navigate(`/showcase/${urlName}`);
  };

  const updateProp = (propName, value) => {
    setProps(prev => ({
      ...prev,
      [propName]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto fixed h-full">
        <div className="p-4 border-b border-gray-200">
          <Link to="/" className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <h2 className="text-lg font-bold text-gray-900 mt-4">Components</h2>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search components..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <nav className="p-4">
          {/* Overview link */}
          <button
            onClick={() => navigate('/showcase')}
            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              !componentName
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Overview
          </button>

          {/* Design Tokens link */}
          <button
            onClick={() => navigate('/showcase/design-tokens')}
            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              componentName === 'design-tokens'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Design Tokens
          </button>

          {/* Icons link */}
          <button
            onClick={() => navigate('/showcase/icons')}
            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              componentName === 'icons'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Icons
          </button>

          {/* Divider between navigation and components */}
          <div className="my-4 border-t border-gray-200"></div>

          {/* Search results info */}
          {searchQuery && sortedCategories.length > 0 && (
            <div className="px-3 py-2 text-xs text-gray-500">
              {Object.values(componentsByCategory).reduce((sum, comps) => sum + comps.length, 0)} result{Object.values(componentsByCategory).reduce((sum, comps) => sum + comps.length, 0) !== 1 ? 's' : ''} found
            </div>
          )}

          {/* No results message */}
          {searchQuery && sortedCategories.length === 0 && (
            <div className="px-3 py-4 text-sm text-gray-500 text-center">
              No components found matching "{searchQuery}"
            </div>
          )}

          {/* Categories and components */}
          {sortedCategories.map((category, index) => (
            <div key={category}>
              {/* Divider between categories */}
              {index > 0 && (
                <div className="my-4 border-t border-gray-200"></div>
              )}

              <div className="mt-4">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {category}
                </h3>
                <div className="mt-2 space-y-1">
                  {componentsByCategory[category].map(comp => {
                    const urlName = comp.name.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
                    const isActive = componentName === urlName;

                    // Check if this is a saved component
                    const isSaved = comp.isSaved || false;

                    return (
                      <div
                        key={isSaved ? comp.savedId : comp.name}
                        className="group relative flex items-center"
                      >
                        <button
                          onClick={() => handleComponentClick(comp.name)}
                          className={`flex-1 text-left px-3 py-2 rounded-md text-sm transition-colors ${
                            isActive
                              ? 'bg-blue-50 text-blue-700 font-medium'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {isSaved && <span className="mr-1 text-xs">💾</span>}
                          {comp.name}
                        </button>
                        {isSaved && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Delete "${comp.name}" from saved components?`)) {
                                deleteSavedComponent(comp.savedId);
                                setSavedComponents(getSavedComponents());
                              }
                            }}
                            className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 text-red-600 hover:bg-red-50 rounded transition-opacity"
                            title="Delete saved component"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        <div className="max-w-7xl mx-auto px-8 py-8">
          {componentName === 'design-tokens' ? (
            // Design Tokens Page
            <DesignTokens />
          ) : componentName === 'icons' ? (
            // Icons Page
            <IconsPage />
          ) : !selectedComponent ? (
            // Overview Page
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Zion-like Component Library</h1>
              <div className="prose prose-lg max-w-none">
                <p className="text-lg text-gray-700 mb-6">
                  This is a custom component library built to mimic the FamilySearch UI Foundation Zion components.
                  These components are designed purely for prototyping and user testing purposes.
                </p>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        <strong>Not Production Ready:</strong> These components are simplified versions of the actual Zion library,
                        created with reduced dependencies to enable rapid prototyping and testing workflows.
                      </p>
                    </div>
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">About This Library</h2>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-blue-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span><strong>Mimics FamilySearch Zion:</strong> Components are styled and structured to closely resemble the production UI Foundation library</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-blue-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span><strong>Lightweight:</strong> Reduced dependencies make it easy to integrate into test prototypes</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-blue-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span><strong>Interactive Playground:</strong> Explore and test each component with live property editing</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-blue-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span><strong>User Testing Focus:</strong> Built specifically for creating user research prototypes and collecting feedback</span>
                  </li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">How to Use</h2>
                <p className="text-gray-700">
                  Select any component from the sidebar to view its interactive preview. You can adjust properties in real-time
                  to see how the component behaves with different configurations. Use this showcase to:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 mt-2 ml-4">
                  <li>Explore available components and their capabilities</li>
                  <li>Understand component props and variations</li>
                  <li>Plan your user testing prototypes</li>
                  <li>Reference component usage when building tests</li>
                </ul>
              </div>
            </div>
          ) : (
            // Component Demo
            <div>
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">{selectedComponent.name}</h1>
                <p className="text-gray-600 mt-1">{selectedComponent.description}</p>
              </div>

              <div className="space-y-8">
                {/* Preview Area */}
                <div>
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-bold text-gray-900">Preview</h2>
                      {/* Toggle button for HelpTutorial overlay types */}
                      {selectedComponent?.name === 'HelpTutorial' &&
                       props.type === 'slides' && (
                        <Button
                          emphasis="medium"
                          variant="blue"
                          onClick={() => setTutorialOverlayOpen(!tutorialOverlayOpen)}
                        >
                          {tutorialOverlayOpen ? 'Close Tutorial' : 'Open Tutorial'}
                        </Button>
                      )}
                    </div>
                    <div className="bg-gray-50 rounded-lg p-8 min-h-[300px] flex items-center justify-center relative">
                      {error && (
                        <div className="text-red-600 text-center p-4">
                          <p className="font-medium">Error loading component</p>
                          <p className="text-sm mt-2 font-mono bg-red-50 p-2 rounded">{error}</p>
                          <p className="text-xs mt-2 text-gray-600">
                            This component may not be fully implemented yet or has loading issues.
                          </p>
                        </div>
                      )}
                      {!error && !Component && (
                        <div className="text-gray-600">Loading component...</div>
                      )}
                      {!error && Component && (
                        <div className="w-full">
                          {(() => {
                            // Prepare props for rendering
                            const renderProps = { ...props };

                            // List of props that are metadata-only and should not be passed to components
                            const metadataOnlyProps = [
                              'disabledRules', 'validation',
                              'groupOptions', 'save', 'details', 'onClick', 'onChange', 'onRemove'
                            ];

                            // Remove metadata-only props
                            metadataOnlyProps.forEach(prop => {
                              delete renderProps[prop];
                            });

                            // Special handling for Button and BillboardButton components
                            if (selectedComponent.name === 'Button' || selectedComponent.name === 'BillboardButton') {
                              // Convert iconStart from string name to actual icon component
                              if (renderProps.iconStart) {
                                const IconComponent = Icons[renderProps.iconStart];
                                renderProps.iconStart = IconComponent || null;
                              }

                              // Convert iconEnd from string name to actual icon component
                              if (renderProps.iconEnd) {
                                const IconComponent = Icons[renderProps.iconEnd];
                                renderProps.iconEnd = IconComponent || null;
                              }
                            }

                            // Special handling for Chips component
                            if (selectedComponent.name === 'Chips') {
                              // Convert iconStart from string name to actual icon component
                              if (renderProps.iconStart) {
                                const IconComponent = Icons[renderProps.iconStart];
                                renderProps.iconStart = IconComponent || null;
                              }

                              // Convert iconEnd from string name to actual icon component
                              if (renderProps.iconEnd) {
                                const IconComponent = Icons[renderProps.iconEnd];
                                renderProps.iconEnd = IconComponent || null;
                              }
                            }

                            // Special handling for IconButton component
                            if (selectedComponent.name === 'IconButton') {
                              // Convert icon from string name to actual icon component
                              if (renderProps.icon) {
                                const IconComponent = Icons[renderProps.icon];
                                renderProps.icon = IconComponent || null;
                              }
                            }

                            // Special handling for Tag component
                            if (selectedComponent.name === 'Tag') {
                              // Convert icon from string name to actual icon component
                              if (renderProps.icon) {
                                const IconComponent = Icons[renderProps.icon];
                                renderProps.icon = IconComponent || null;
                              }
                            }

                            // Special handling for Card component
                            if (selectedComponent.name === 'Card') {
                              // Add interactive onClick handler if onClick prop is set
                              if (renderProps.onClick) {
                                const clickDescription = renderProps.onClick;
                                renderProps.onClick = () => {
                                  console.log(`Card clicked: ${clickDescription}`);
                                };
                              }
                            }

                            // Special handling for Paginator component
                            if (selectedComponent.name === 'Paginator') {
                              // Add handlers to make pagination interactive
                              renderProps.onPageChange = (page) => {
                                updateProp('currentPage', page);
                              };
                              renderProps.onResultsPerPageChange = (value) => {
                                updateProp('resultsPerPage', value);
                              };
                            }

                            // Special handling for HelpTutorial component
                            if (selectedComponent.name === 'HelpTutorial') {
                              // Convert icon name to component for introduction type
                              if (renderProps.type === 'introduction' && renderProps.introIcon) {
                                const IconComponent = Icons[renderProps.introIcon];
                                renderProps.introIcon = IconComponent ? renderProps.introIcon : 'PlaceTemple';
                              }

                              // Add interactive handlers for introduction type
                              if (renderProps.type === 'introduction') {
                                renderProps.onDismiss = () => {
                                  console.log('Tutorial dismissed');
                                  setTutorialOverlayOpen(false);
                                };
                                renderProps.onStart = () => {
                                  // Start the tutorial - go to slides mode
                                  updateProp('type', 'slides');
                                  updateProp('currentSlide', 1);
                                  setTutorialOverlayOpen(true);
                                };
                              }

                              // Add navigation handlers for slides type
                              if (renderProps.type === 'slides') {
                                // Calculate total slides from slotChildren
                                const slides = selectedComponent.slotChildren?.slides || [];
                                const totalSlides = slides.length;

                                // Initialize currentSlide if not set
                                if (!renderProps.currentSlide) {
                                  renderProps.currentSlide = 1;
                                }

                                renderProps.onNext = () => {
                                  const current = renderProps.currentSlide || 1;
                                  if (current < totalSlides) {
                                    updateProp('currentSlide', current + 1);
                                  }
                                };

                                renderProps.onPrevious = () => {
                                  const current = renderProps.currentSlide || 1;
                                  if (current > 1) {
                                    updateProp('currentSlide', current - 1);
                                  }
                                };

                                renderProps.onClose = () => {
                                  setTutorialOverlayOpen(false);
                                };
                              }
                            }

                            // Special handling for ZoomPanControl component
                            if (selectedComponent.name === 'ZoomPanControl') {
                              // Map custom prop names to component prop names
                              renderProps.label = renderProps.labelCustom;
                              delete renderProps.labelCustom;

                              if (renderProps.onClickCustom) {
                                renderProps.onClick = renderProps.onClickCustom;
                              }
                              delete renderProps.onClickCustom;

                              // Convert icon props from string names to actual icon components
                              if (renderProps.iconStart) {
                                const IconComponent = Icons[renderProps.iconStart];
                                renderProps.iconStart = IconComponent || null;
                              }
                              if (renderProps.iconEnd) {
                                const IconComponent = Icons[renderProps.iconEnd];
                                renderProps.iconEnd = IconComponent || null;
                              }
                            }

                            // Special handling for Select component
                            if (selectedComponent.name === 'Select') {
                              // Convert icon from string name to actual icon component
                              if (renderProps.icon) {
                                const IconComponent = Icons[renderProps.icon];
                                renderProps.icon = IconComponent || null;
                              }

                              // Parse options string into array
                              if (renderProps.options && typeof renderProps.options === 'string') {
                                const optionsArray = renderProps.options.split(',').map(opt => opt.trim()).filter(opt => opt);
                                renderProps.options = optionsArray.length > 0 ? optionsArray : ['Option 1', 'Option 2', 'Option 3'];
                              } else if (!renderProps.options) {
                                // Default options if none provided
                                renderProps.options = ['Option 1', 'Option 2', 'Option 3'];
                              }

                              // Handle labelLarge boolean - convert label to labelLarge if true
                              if (renderProps.labelLarge === true && renderProps.label) {
                                renderProps.labelLarge = renderProps.label;
                                delete renderProps.label;
                              } else if (renderProps.labelLarge === false) {
                                delete renderProps.labelLarge;
                              }
                            }

                            // Special handling for TextField component
                            if (selectedComponent.name === 'TextField') {
                              // Convert icon from string name to actual icon component
                              if (renderProps.icon) {
                                const IconComponent = Icons[renderProps.icon];
                                renderProps.icon = IconComponent || null;
                              }

                              // Handle labelLarge boolean - convert label to labelLarge if true
                              if (renderProps.labelLarge === true && renderProps.label) {
                                renderProps.labelLarge = renderProps.label;
                                delete renderProps.label;
                              } else if (renderProps.labelLarge === false) {
                                delete renderProps.labelLarge;
                              }

                              // Make TextField controlled - initialize value from defaultValue if not set
                              if (!renderProps.value) {
                                renderProps.value = renderProps.defaultValue || '';
                              }

                              // Provide onChange handler that updates the value
                              renderProps.onChange = (e) => {
                                updateProp('value', e.target.value);
                              };
                            }

                            // Special handling for AutoSelect component
                            if (selectedComponent.name === 'AutoSelect') {
                              // Convert startIcon from string name to actual icon component
                              if (renderProps.startIcon) {
                                const IconComponent = Icons[renderProps.startIcon];
                                renderProps.startIcon = IconComponent || null;
                              }

                              // Parse options string into array
                              if (renderProps.options && typeof renderProps.options === 'string') {
                                const optionsArray = renderProps.options.split(',').map(opt => opt.trim()).filter(opt => opt);
                                renderProps.options = optionsArray.length > 0 ? optionsArray : ['Option 1', 'Option 2', 'Option 3'];
                              } else if (!renderProps.options) {
                                // Default options if none provided
                                renderProps.options = ['Option 1', 'Option 2', 'Option 3'];
                              }

                              // Make AutoSelect controlled - initialize value if not set
                              if (!renderProps.value) {
                                renderProps.value = '';
                              }

                              // Provide onChange handler that updates the value
                              renderProps.onChange = (newValue) => {
                                updateProp('value', newValue);
                              };

                              // Handle labelLarge boolean - convert label to labelLarge if true
                              if (renderProps.labelLarge === true && renderProps.label) {
                                renderProps.labelLarge = renderProps.label;
                                delete renderProps.label;
                              } else if (renderProps.labelLarge === false) {
                                delete renderProps.labelLarge;
                              }
                            }

                            // Special handling for Breadcrumb component
                            if (selectedComponent.name === 'Breadcrumb') {
                              // Convert comma-separated string to array of breadcrumb items
                              if (renderProps.items && typeof renderProps.items === 'string') {
                                const labels = renderProps.items.split(',').map(item => item.trim()).filter(item => item);
                                renderProps.items = labels.length > 0
                                  ? labels.map(label => ({ label }))
                                  : [{ label: 'Home' }, { label: 'Products' }];
                              } else if (!renderProps.items || !Array.isArray(renderProps.items)) {
                                // Default breadcrumb items if none provided or invalid
                                renderProps.items = [{ label: 'Home' }, { label: 'Products' }];
                              }
                            }

                            // Special handling for MenuOverlay component
                            if (selectedComponent.name === 'MenuOverlay') {
                              // Convert horizontalAlign to align prop
                              if (renderProps.horizontalAlign) {
                                const alignMap = {
                                  'left': 'start',
                                  'center': 'center',
                                  'right': 'end'
                                };
                                renderProps.align = alignMap[renderProps.horizontalAlign] || 'center';
                                delete renderProps.horizontalAlign;
                              }

                              // Parse menuItems from instruction string
                              if (renderProps.menuItems && typeof renderProps.menuItems === 'string') {
                                const lines = renderProps.menuItems.split('\n').map(line => line.trim()).filter(line => line);
                                renderProps.menuItems = lines.length > 0 ? lines : ['Menu Item 1', 'Menu Item 2', 'Menu Item 3'];
                              } else if (!renderProps.menuItems || !Array.isArray(renderProps.menuItems)) {
                                renderProps.menuItems = ['Menu Item 1', 'Menu Item 2', 'Menu Item 3'];
                              }

                              // Remove anchorRef from props - it will be provided by MenuOverlayExample
                              delete renderProps.anchorRef;
                            }

                            // Special handling for Checkbox component
                            if (selectedComponent.name === 'Checkbox') {
                              if (renderProps.type === 'group' && renderProps.groupLabelOptions) {
                                // Parse comma-separated options
                                const options = renderProps.groupLabelOptions.split(',').map(opt => opt.trim()).filter(opt => opt);
                                renderProps.groupOptions = options;
                                delete renderProps.groupLabelOptions;
                              }
                              delete renderProps.type;
                            }

                            // Special handling for Radio component
                            if (selectedComponent.name === 'Radio') {
                              if (renderProps.type === 'group' && renderProps.groupLabelOptions) {
                                // Parse comma-separated options
                                const options = renderProps.groupLabelOptions.split(',').map(opt => opt.trim()).filter(opt => opt);
                                renderProps.groupOptions = options;
                              }
                              delete renderProps.groupLabelOptions;
                              delete renderProps.type;
                            }

                            // Special handling for ListItem component
                            if (selectedComponent.name === 'ListItem') {
                              // Convert startElement metadata to actual components
                              if (renderProps.startElement && renderProps.startElement !== 'none') {
                                if (renderProps.startElement === 'icon' && renderProps.icon) {
                                  const IconComponent = Icons[renderProps.icon];
                                  renderProps.startElement = IconComponent ? <IconComponent size="md" /> : null;
                                  delete renderProps.icon;
                                } else if (renderProps.startElement === 'avatar') {
                                  // Create avatar object from individual props
                                  renderProps.avatar = {
                                    type: renderProps.avatarType || 'monogram',
                                    name: renderProps.avatarName || 'User',
                                    photoSrc: renderProps.photoSrc
                                  };
                                  delete renderProps.startElement;
                                  delete renderProps.avatarType;
                                  delete renderProps.avatarName;
                                  delete renderProps.photoSrc;
                                } else if (renderProps.startElement === 'image') {
                                  // Display placeholder image element
                                  renderProps.startElement = (
                                    <div style={{ width: '40px', height: '40px', backgroundColor: '#E0E0E0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#666' }}>
                                      IMG
                                    </div>
                                  );
                                  delete renderProps.image;
                                } else if (renderProps.startElement === 'checkbox') {
                                  // Display placeholder checkbox
                                  renderProps.startElement = (
                                    <input type="checkbox" style={{ width: '18px', height: '18px' }} />
                                  );
                                } else {
                                  delete renderProps.startElement;
                                }
                              } else {
                                delete renderProps.startElement;
                                delete renderProps.icon;
                                delete renderProps.avatarType;
                                delete renderProps.avatarName;
                                delete renderProps.photoSrc;
                                delete renderProps.image;
                              }

                              // Handle metaText - if enabled, show meta text and clear endIcon
                              if (renderProps.metaText) {
                                renderProps.metaText = renderProps.metaTextContent || 'Meta';
                                delete renderProps.metaTextContent;
                                delete renderProps.endIcon;
                              } else {
                                // Convert endIcon name to component
                                if (renderProps.endIcon) {
                                  const IconComponent = Icons[renderProps.endIcon];
                                  renderProps.endIcon = IconComponent ? <IconComponent size="sm" /> : null;
                                }
                                delete renderProps.metaText;
                                delete renderProps.metaTextContent;
                              }

                              // Handle emphasized - pass it through for Paragraph component
                              // Default heading if none provided
                              if (!renderProps.heading) {
                                renderProps.heading = 'List Item Heading';
                              }

                              // Add default overline and subheading to make dense mode more visible
                              if (!renderProps.overline) {
                                renderProps.overline = 'Overline text';
                              }
                              if (!renderProps.subheading) {
                                renderProps.subheading = 'Subheading text';
                              }
                            }

                            // Extract content props that need to be converted to children
                            // Some components (like Divider) use label as a direct prop, not as children
                            const componentsWithLabelProp = ['Divider', 'StatusOverlay', 'Checkbox', 'Radio', 'Toggle', 'Select', 'TextField', 'TextArea', 'AutoSelect', 'Chips', 'ZoomPanControl'];
                            const shouldKeepLabel = componentsWithLabelProp.includes(selectedComponent.name);

                            // Some components use text as a direct prop, not as children
                            const componentsWithTextProp = ['Tag'];
                            const shouldKeepText = componentsWithTextProp.includes(selectedComponent.name);

                            const textContent = (!shouldKeepText && renderProps.text) || (!shouldKeepLabel && renderProps.label);
                            if (!shouldKeepText) {
                              delete renderProps.text;
                            }
                            if (!shouldKeepLabel) {
                              delete renderProps.label;
                            }

                            // Special handling for Slider onChange
                            if (selectedComponent.name === 'Slider') {
                              // Provide a real onChange handler that updates the value
                              renderProps.onChange = (newValue) => {
                                updateProp('value', newValue);
                              };
                            }

                            // Special handling for TextArea - controlled component
                            if (selectedComponent.name === 'TextArea') {
                              // Initialize value from defaultValue if not already set
                              if (!renderProps.value) {
                                renderProps.value = renderProps.defaultValue || '';
                              }

                              // Provide onChange handler that updates the value
                              renderProps.onChange = (e) => {
                                updateProp('value', e.target.value);
                              };

                              // Remove maxLength if it's 0 (means no limit)
                              if (renderProps.maxLength === 0) {
                                delete renderProps.maxLength;
                              }

                              // Handle labelLarge boolean - convert label to labelLarge if true
                              if (renderProps.labelLarge === true && renderProps.label) {
                                renderProps.labelLarge = renderProps.label;
                                delete renderProps.label;
                              } else if (renderProps.labelLarge === false) {
                                delete renderProps.labelLarge;
                              }
                            }

                            // Special handling for StatusOverlay - action button
                            if (selectedComponent.name === 'StatusOverlay') {
                              // Convert actionLabel boolean + actionButtonLabel string to just actionLabel string
                              if (renderProps.actionLabel && renderProps.actionButtonLabel) {
                                renderProps.actionLabel = renderProps.actionButtonLabel;
                              } else {
                                // If actionLabel is false or no label text provided, remove it
                                delete renderProps.actionLabel;
                              }
                              delete renderProps.actionButtonLabel;
                            }

                            // Special handling for layout components with gap and alignment
                            if (selectedComponent.name === 'Row' || selectedComponent.name === 'Column' || selectedComponent.name === 'Stack' || selectedComponent.name === 'Grid') {
                              // Convert user-friendly alignment values to component values
                              const convertAlignment = (value) => {
                                if (value === 'left' || value === 'top') return 'start';
                                if (value === 'right' || value === 'bottom') return 'end';
                                return value; // center, stretch, space-between stay the same
                              };

                              // For Grid component, use alignItems and justifyItems
                              if (selectedComponent.name === 'Grid') {
                                if (renderProps.horizontalAlign) {
                                  renderProps.justifyItems = convertAlignment(renderProps.horizontalAlign);
                                  delete renderProps.horizontalAlign;
                                }
                                if (renderProps.verticalAlign) {
                                  renderProps.alignItems = convertAlignment(renderProps.verticalAlign);
                                  delete renderProps.verticalAlign;
                                }
                              } else {
                                // For Row, Column, Stack - use alignX and alignY
                                if (renderProps.horizontalAlign) {
                                  renderProps.alignX = convertAlignment(renderProps.horizontalAlign);
                                  delete renderProps.horizontalAlign;
                                }
                                if (renderProps.verticalAlign) {
                                  renderProps.alignY = convertAlignment(renderProps.verticalAlign);
                                  delete renderProps.verticalAlign;
                                }
                              }

                              // For Stack component, handle align property based on direction
                              if (selectedComponent.name === 'Stack') {
                                if (renderProps.direction === 'horizontal') {
                                  // Horizontal stack: alignY becomes the cross-axis align
                                  renderProps.align = renderProps.alignY || 'start';
                                } else {
                                  // Vertical stack: alignX becomes the cross-axis align
                                  renderProps.align = renderProps.alignX || 'start';
                                }
                              }

                              // Convert gap token to pixel value or handle "between"
                              if (renderProps.gap === 'between') {
                                // For "between", set gap to 0 and set alignX/alignY to "space-between"
                                renderProps.gap = 0;
                                if (selectedComponent.name === 'Row' || (selectedComponent.name === 'Stack' && renderProps.direction === 'horizontal')) {
                                  renderProps.alignX = 'space-between';
                                } else if (selectedComponent.name === 'Column' || (selectedComponent.name === 'Stack' && renderProps.direction === 'vertical')) {
                                  renderProps.alignY = 'space-between';
                                }
                              } else if (renderProps.gap && typeof renderProps.gap === 'string') {
                                // Convert spacing token to numeric value (divide by 4 since component expects units)
                                const spacingMap = {
                                  'pico': 1,    // 4px / 4
                                  'nano': 2,    // 8px / 4
                                  'xxs': 3,     // 12px / 4
                                  'xs': 4,      // 16px / 4
                                  'sm': 6.5,    // 26px / 4
                                  'md': 9.75,   // 39px / 4
                                  'lg': 14.5,   // 58px / 4
                                  'xl': 21.5,   // 86px / 4
                                  'xxl': 32     // 128px / 4
                                };
                                renderProps.gap = spacingMap[renderProps.gap] !== undefined ? spacingMap[renderProps.gap] : 9.75;
                              }
                            }

                            // Convert string handlers to undefined (they should be functions)
                            Object.keys(renderProps).forEach(key => {
                              if ((key.startsWith('on') || key.includes('Click') || key.includes('Change'))
                                  && typeof renderProps[key] === 'string') {
                                delete renderProps[key];
                              }
                            });

                            // Special handling for image components - convert string to array of image objects
                            if (selectedComponent.name === 'ImageGrid' || selectedComponent.name === 'RibbonViewer' || selectedComponent.name === 'ImageViewer') {
                              if (renderProps.images && typeof renderProps.images === 'string') {
                                // Create array of 5 placeholder images
                                renderProps.images = Array.from({ length: 5 }, (_, i) => ({
                                  src: `https://placehold.co/400x300?text=Image+${i + 1}`,
                                  alt: `Placeholder image ${i + 1}`
                                }));
                              }
                            }

                            // Special rendering for Tab component - render multiple tabs
                            if (selectedComponent.name === 'Tab') {
                              return <TabExample Component={Component} renderProps={renderProps} />;
                            }

                            // Special rendering for DialogOverlay - needs trigger button and state
                            if (selectedComponent.name === 'DialogOverlay') {
                              return <DialogOverlayExample Component={Component} renderProps={renderProps} />;
                            }

                            // Special rendering for FullPageOverlay - needs trigger button and state
                            if (selectedComponent.name === 'FullPageOverlay') {
                              return <FullPageOverlayExample Component={Component} renderProps={renderProps} />;
                            }

                            // Special rendering for InfoSheet - needs trigger button and state
                            if (selectedComponent.name === 'InfoSheet') {
                              return <InfoSheetExample Component={Component} renderProps={renderProps} />;
                            }

                            // Special handling for QuickGlanceOverlay and TooltipOverlay alignment
                            if (selectedComponent.name === 'QuickGlanceOverlay' || selectedComponent.name === 'TooltipOverlay') {
                              // Convert horizontalAlign or verticalAlign to align prop
                              const alignMap = {
                                'left': 'start',
                                'center': 'center',
                                'right': 'end',
                                'top': 'start',
                                'bottom': 'end'
                              };

                              if (renderProps.horizontalAlign) {
                                renderProps.align = alignMap[renderProps.horizontalAlign] || 'center';
                                delete renderProps.horizontalAlign;
                              } else if (renderProps.verticalAlign) {
                                renderProps.align = alignMap[renderProps.verticalAlign] || 'center';
                                delete renderProps.verticalAlign;
                              }
                            }

                            // Special rendering for QuickGlanceOverlay - needs trigger button and state
                            if (selectedComponent.name === 'QuickGlanceOverlay') {
                              return <QuickGlanceOverlayExample Component={Component} renderProps={renderProps} />;
                            }

                            // Special rendering for TooltipOverlay - needs trigger button and hover state
                            if (selectedComponent.name === 'TooltipOverlay') {
                              return <TooltipOverlayExample Component={Component} renderProps={renderProps} />;
                            }

                            // Special rendering for TestRecordingControls - needs onToggleExpand callback
                            if (selectedComponent.name === 'TestRecordingControls') {
                              return (
                                <Component
                                  {...renderProps}
                                  onToggleExpand={() => {
                                    updateProp('isExpanded', !renderProps.isExpanded);
                                  }}
                                />
                              );
                            }

                            // Special rendering for TestInstructionOverlay - needs onButtonClick callback and task state management
                            if (selectedComponent.name === 'TestInstructionOverlay') {
                              // Remove buttonText from renderProps since the component determines it automatically
                              // Only use customButtonText if provided
                              const { buttonText, ...overlayProps } = renderProps;

                              return (
                                <Component
                                  {...overlayProps}
                                  onButtonClick={() => {
                                    console.log('Button clicked');
                                    // If this is a task type and not yet begun, toggle taskBegun state
                                    if (renderProps.type === 'task' && !renderProps.taskBegun) {
                                      updateProp('taskBegun', true);
                                    }
                                  }}
                                />
                              );
                            }

                            // Special rendering for OpenTextQuestion - needs onChange callback
                            if (selectedComponent.name === 'OpenTextQuestion') {
                              return (
                                <Component
                                  {...renderProps}
                                  onChange={(value) => {
                                    updateProp('value', value);
                                  }}
                                />
                              );
                            }

                            // Special rendering for OpinionScaleQuestion - needs onChange callback
                            if (selectedComponent.name === 'OpinionScaleQuestion') {
                              return (
                                <Component
                                  {...renderProps}
                                  onChange={(value) => {
                                    updateProp('value', value);
                                  }}
                                />
                              );
                            }

                            // Special rendering for MultipleChoiceQuestion - needs onChange callback and parse options
                            if (selectedComponent.name === 'MultipleChoiceQuestion') {
                              // Parse options string to array
                              const optionsArray = renderProps.options && typeof renderProps.options === 'string'
                                ? renderProps.options.split(',').map(opt => opt.trim())
                                : ['Option 1', 'Option 2', 'Option 3'];

                              // Ensure value is the right type based on multiSelect
                              let currentValue = renderProps.value;
                              if (renderProps.multiSelect) {
                                // For multiSelect, value should be an array
                                if (!Array.isArray(currentValue)) {
                                  currentValue = currentValue ? [currentValue] : [];
                                }
                              } else {
                                // For single select, value should be a string
                                if (Array.isArray(currentValue)) {
                                  currentValue = currentValue[0] || '';
                                }
                              }

                              return (
                                <Component
                                  {...renderProps}
                                  options={optionsArray}
                                  value={currentValue}
                                  onChange={(value) => {
                                    updateProp('value', value);
                                  }}
                                />
                              );
                            }

                            // Special rendering for ImageGrid - needs active state management
                            if (selectedComponent.name === 'ImageGrid') {
                              return <ImageGridExample Component={Component} renderProps={renderProps} />;
                            }

                            // Special rendering for ImageViewer - needs proper sizing container
                            if (selectedComponent.name === 'ImageViewer') {
                              return <ImageViewerExample Component={Component} renderProps={renderProps} />;
                            }

                            // Special rendering for Spacer - show two elements with spacer between
                            if (selectedComponent.name === 'Spacer') {
                              return (
                                <div style={{
                                  display: 'flex',
                                  flexDirection: renderProps.direction === 'horizontal' ? 'row' : 'column',
                                  alignItems: renderProps.direction === 'horizontal' ? 'center' : 'stretch'
                                }}>
                                  <div style={{
                                    padding: '16px',
                                    backgroundColor: '#E3F2FD',
                                    borderRadius: '4px',
                                    border: '1px solid #90CAF9',
                                    flexShrink: 0
                                  }}>
                                    Item 1
                                  </div>
                                  <Component {...renderProps} />
                                  <div style={{
                                    padding: '16px',
                                    backgroundColor: '#F3E5F5',
                                    borderRadius: '4px',
                                    border: '1px solid #CE93D8',
                                    flexShrink: 0
                                  }}>
                                    Item 2
                                  </div>
                                </div>
                              );
                            }

                            // Special rendering for HelpTutorial - use example component
                            if (selectedComponent.name === 'HelpTutorial') {
                              return <HelpTutorialExample Component={Component} renderProps={renderProps} selectedComponent={selectedComponent} tutorialOverlayOpen={tutorialOverlayOpen} />;
                            }

                            // If component has children slot or has text content
                            if (selectedComponent.hasChildren || textContent) {
                              // Special rendering for layout components that should show multiple children
                              if (selectedComponent.name === 'Row' || selectedComponent.name === 'Column' || selectedComponent.name === 'Stack' || selectedComponent.name === 'Grid' || selectedComponent.name === 'Screen') {
                                return (
                                  <Component {...renderProps}>
                                    <div style={{ padding: '16px', backgroundColor: '#E3F2FD', borderRadius: '4px', border: '1px solid #90CAF9' }}>
                                      Item 1
                                    </div>
                                    <div style={{ padding: '16px', backgroundColor: '#F3E5F5', borderRadius: '4px', border: '1px solid #CE93D8' }}>
                                      Item 2
                                    </div>
                                    <div style={{ padding: '16px', backgroundColor: '#FFF3E0', borderRadius: '4px', border: '1px solid #FFB74D' }}>
                                      Item 3
                                    </div>
                                  </Component>
                                );
                              }

                              // Special rendering for MenuOverlay - needs an anchor and positioning
                              if (selectedComponent.name === 'MenuOverlay') {
                                return <MenuOverlayExample Component={Component} renderProps={renderProps} />;
                              }

                              return (
                                <Component {...renderProps}>
                                  {textContent || (
                                    <div className="text-gray-700">
                                      Sample content for {selectedComponent.name}
                                    </div>
                                  )}
                                </Component>
                              );
                            } else {
                              console.log('Rendering component without children, renderProps:', renderProps);
                              return <Component {...renderProps} />;
                            }
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Properties Panel */}
                <div>
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Properties</h2>
                    {selectedComponent.props && selectedComponent.props.length > 0 ? (
                      <div className="space-y-4">
                        {selectedComponent.props
                          .filter(prop => {
                            // Filter out customNotes
                            if (prop.name === 'customNotes') return false;

                            // Filter out title only if it's a tree label (not an actual component prop)
                            if (prop.name === 'title' && prop.description === 'Label for this component in the tree') return false;

                            // Check showWhen conditions
                            if (prop.showWhen) {
                              return Object.entries(prop.showWhen).every(([key, expectedValue]) => {
                                // Handle array of expected values (OR condition)
                                if (Array.isArray(expectedValue)) {
                                  return expectedValue.includes(props[key]);
                                }
                                return props[key] === expectedValue;
                              });
                            }

                            return true;
                          })
                          .sort((a, b) => {
                            // Sort so boolean properties come last
                            const aIsBoolean = a.type === MetaPropTypes.BOOLEAN;
                            const bIsBoolean = b.type === MetaPropTypes.BOOLEAN;

                            if (aIsBoolean === bIsBoolean) return 0; // Keep original order
                            if (aIsBoolean) return 1; // a is boolean, move to end
                            return -1; // b is boolean, a comes first
                          })
                          .map(prop => (
                            <PropertyControl
                              key={prop.name}
                              prop={prop}
                              value={props[prop.name]}
                              onChange={(value) => updateProp(prop.name, value)}
                            />
                          ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 text-sm">No configurable properties</p>
                    )}
                  </div>
                </div>

                  {/* Best Practices */}
                  {selectedComponent.bestPractices && selectedComponent.bestPractices.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mt-8">
                      <h2 className="text-lg font-bold text-gray-900 mb-4">Best Practices</h2>
                      <div className="space-y-4">
                        {selectedComponent.bestPractices.map((practice, index) => (
                          <div key={index} className="border-l-4 border-blue-500 pl-4">
                            <h3 className="font-semibold text-gray-900 mb-2">{practice.title}</h3>
                            <div className="text-sm text-gray-700 space-y-1">
                              {practice.items.map((item, itemIndex) => (
                                <p key={itemIndex} className="leading-relaxed">{item}</p>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Property Control Component
function PropertyControl({ prop, value, onChange }) {
  const { name, type, options, description, isIcon } = prop;
  const [showDescription, setShowDescription] = useState(false);

  // Icon selector - special dropdown for icon selection
  if (isIcon && type === MetaPropTypes.ENUM) {
    // Get all available icon names from the Icons object
    const iconNames = Object.keys(Icons).sort();

    return (
      <div>
        <div className="flex items-center gap-1 mb-1">
          <label className="text-sm font-medium text-gray-700">
            {name}
          </label>
          {description && (
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
        {description && showDescription && (
          <p className="text-xs text-gray-500 mb-2 bg-gray-50 p-2 rounded">{description}</p>
        )}
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="">None</option>
          {iconNames.map(iconName => (
            <option key={iconName} value={iconName}>
              {iconName}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // String input
  if (type === MetaPropTypes.STRING) {
    return (
      <div>
        <div className="flex items-center gap-1 mb-1">
          <label className="text-sm font-medium text-gray-700">
            {name}
          </label>
          {description && (
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
        {description && showDescription && (
          <p className="text-xs text-gray-500 mb-2 bg-gray-50 p-2 rounded">{description}</p>
        )}
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          placeholder={prop.default}
        />
      </div>
    );
  }

  // Number input
  if (type === MetaPropTypes.NUMBER) {
    return (
      <div>
        <div className="flex items-center gap-1 mb-1">
          <label className="text-sm font-medium text-gray-700">
            {name}
          </label>
          {description && (
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
        {description && showDescription && (
          <p className="text-xs text-gray-500 mb-2 bg-gray-50 p-2 rounded">{description}</p>
        )}
        <input
          type="number"
          value={value || prop.default || 0}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>
    );
  }

  // Boolean input
  if (type === MetaPropTypes.BOOLEAN) {
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
            <span className="text-sm font-medium text-gray-700">{name}</span>
          </label>
          {description && (
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
        {description && showDescription && (
          <p className="text-xs text-gray-500 mt-1 bg-gray-50 p-2 rounded">{description}</p>
        )}
      </div>
    );
  }

  // Enum (select) input
  if (type === MetaPropTypes.ENUM && options) {
    return (
      <div>
        <div className="flex items-center gap-1 mb-1">
          <label className="text-sm font-medium text-gray-700">
            {name}
          </label>
          {description && (
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
        {description && showDescription && (
          <p className="text-xs text-gray-500 mb-2 bg-gray-50 p-2 rounded">{description}</p>
        )}
        <select
          value={value || prop.default || options[0]}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          {options.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // Color input
  if (type === MetaPropTypes.COLOR) {
    return (
      <div>
        <div className="flex items-center gap-1 mb-1">
          <label className="text-sm font-medium text-gray-700">
            {name}
          </label>
          {description && (
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
        {description && showDescription && (
          <p className="text-xs text-gray-500 mb-2 bg-gray-50 p-2 rounded">{description}</p>
        )}
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000 or rgba(0,0,0,0.5)"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
        />
      </div>
    );
  }

  // Default fallback
  return (
    <div>
      <div className="flex items-center gap-1 mb-1">
        <label className="text-sm font-medium text-gray-700">
          {name}
        </label>
        {description && (
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
      {description && showDescription && (
        <p className="text-xs text-gray-500 mb-2 bg-gray-50 p-2 rounded">{description}</p>
      )}
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      />
    </div>
  );
}

// Helper component for QuickGlanceOverlay to show trigger button
function QuickGlanceOverlayExample({ Component, renderProps }) {
  const anchorRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  // Convert width to string with px
  const width = renderProps.width ? `${renderProps.width}px` : '200px';

  // Remove props that aren't needed by QuickGlanceOverlay
  const { anchorRef: _, width: _width, ...componentProps } = renderProps;

  return (
    <div>
      <Button ref={anchorRef} onClick={() => setIsOpen(!isOpen)}>
        Quick Glance Trigger
      </Button>
      <Component
        {...componentProps}
        width={width}
        anchorRef={anchorRef}
        isOpen={isOpen}
        close={() => setIsOpen(false)}
      >
        <div style={{ padding: '12px' }} className="text-gray-700">
          Quick glance content
        </div>
      </Component>
    </div>
  );
}

// Helper component for TooltipOverlay to show hover trigger button
function TooltipOverlayExample({ Component, renderProps }) {
  const anchorRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  // Remove props that aren't needed by TooltipOverlay
  const { anchorRef: _, message, ...componentProps } = renderProps;

  return (
    <div>
      <Button
        ref={anchorRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        Hover for Tooltip
      </Button>
      <Component
        {...componentProps}
        anchorRef={anchorRef}
        visible={isVisible}
      >
        {message || 'Tooltip text'}
      </Component>
    </div>
  );
}

// Helper component for ImageGrid to manage active state
function ImageGridExample({ Component, renderProps }) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <Component
      {...renderProps}
      activeIndex={activeIndex}
      onThumbnailClick={(index) => setActiveIndex(index)}
    />
  );
}

// Helper component for ImageViewer to provide proper sizing
function ImageViewerExample({ Component, renderProps }) {
  return (
    <div style={{ height: '600px', width: '100%', display: 'flex', flexDirection: 'column' }}>
      <Component {...renderProps} />
    </div>
  );
}

// Helper component for InfoSheet to show trigger button
function InfoSheetExample({ Component, renderProps }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDocked, setIsDocked] = useState(false);

  // Build button objects only if footer is enabled
  let primaryButton = null;
  let secondaryButton = null;

  if (renderProps.footer) {
    if (renderProps.primaryButton && renderProps.primaryButtonLabel) {
      primaryButton = { label: renderProps.primaryButtonLabel, onClick: () => setIsOpen(false) };
    }
    if (renderProps.secondaryButton && renderProps.secondaryButtonLabel) {
      secondaryButton = { label: renderProps.secondaryButtonLabel, onClick: () => setIsOpen(false) };
    }
  }

  // Remove button-related props that aren't needed by InfoSheet
  const { primaryButtonLabel, secondaryButtonLabel, footer, ...componentProps } = renderProps;

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>
        Open Info Sheet
      </Button>
      {isOpen && (
        <Component
          {...componentProps}
          close={() => setIsOpen(false)}
          onBack={renderProps.panel ? () => setIsOpen(false) : undefined}
          isDocked={isDocked}
          onDockToggle={renderProps.dockable ? () => setIsDocked(!isDocked) : undefined}
          primaryButton={primaryButton}
          secondaryButton={secondaryButton}
        >
          <div className="text-gray-700">
            This is the info sheet content area. You can add any content here.
          </div>
        </Component>
      )}
    </div>
  );
}

// Helper component for FullPageOverlay to show trigger button
function FullPageOverlayExample({ Component, renderProps }) {
  const [isOpen, setIsOpen] = useState(false);

  // Parse breadcrumb items
  let breadcrumb = null;
  if (renderProps.breadcrumb && renderProps.breadcrumbItems) {
    const items = renderProps.breadcrumbItems.split(',').map(item => item.trim()).filter(item => item);
    breadcrumb = items.map(label => ({ label }));
  }

  // Build icon buttons
  const iconButtons = [];
  const iconButtonCount = parseInt(renderProps.iconButtonCount || '0');
  for (let i = 1; i <= iconButtonCount; i++) {
    const iconName = renderProps[`iconButton${i}`];
    if (iconName) {
      const IconComponent = Icons[iconName];
      if (IconComponent) {
        iconButtons.push({
          icon: IconComponent,
          label: `Button ${i}`,
          onClick: () => setIsOpen(false)
        });
      }
    }
  }

  // Build low emphasis (secondary) buttons
  const secondaryButtons = [];
  const lowEmphasisCount = parseInt(renderProps.lowEmphasisCount || '0');
  for (let i = 1; i <= lowEmphasisCount; i++) {
    const iconName = renderProps[`lowEmphasis${i}Icon`];
    const label = renderProps[`lowEmphasis${i}Label`];
    if (label) {
      const IconComponent = iconName ? Icons[iconName] : null;
      secondaryButtons.push({
        label: label,
        icon: IconComponent,
        onClick: () => setIsOpen(false)
      });
    }
  }

  // Build primary button
  let primaryButton = null;
  if (renderProps.headerPrimaryButton && renderProps.headerPrimaryLabel) {
    primaryButton = {
      label: renderProps.headerPrimaryLabel,
      onClick: () => setIsOpen(false)
    };
  }

  // Build footer
  let footer = null;
  if (renderProps.footerPrimaryButton || renderProps.footerSecondaryButton) {
    const footerButtons = [];

    if (renderProps.footerSecondaryButton && renderProps.footerSecondaryLabel) {
      footerButtons.push(
        <Button key="secondary" emphasis="low" variant="blue" onClick={() => setIsOpen(false)}>
          {renderProps.footerSecondaryLabel}
        </Button>
      );
    }

    if (renderProps.footerPrimaryButton && renderProps.footerPrimaryLabel) {
      footerButtons.push(
        <Button key="primary" emphasis="high" variant="blue" onClick={() => setIsOpen(false)}>
          {renderProps.footerPrimaryLabel}
        </Button>
      );
    }

    footer = (
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        {footerButtons}
      </div>
    );
  }

  // Remove props that aren't needed by FullPageOverlay
  const {
    breadcrumbItems,
    iconButtonCount: _iconButtonCount,
    iconButton1, iconButton2, iconButton3, iconButton4,
    lowEmphasisCount: _lowEmphasisCount,
    lowEmphasis1Icon, lowEmphasis1Label,
    lowEmphasis2Icon, lowEmphasis2Label,
    lowEmphasis3Icon, lowEmphasis3Label,
    headerPrimaryButton, headerPrimaryLabel,
    footerPrimaryButton, footerPrimaryLabel,
    footerSecondaryButton, footerSecondaryLabel,
    ...componentProps
  } = renderProps;

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>
        Open Full Page
      </Button>
      <Component
        {...componentProps}
        isOpen={isOpen}
        close={() => setIsOpen(false)}
        breadcrumb={breadcrumb}
        iconButtons={iconButtons}
        secondaryButtons={secondaryButtons}
        primaryButton={primaryButton}
        footer={footer}
      >
        <div style={{ padding: '24px' }} className="text-gray-700">
          This is the full page overlay content area. You can add any content here.
        </div>
      </Component>
    </div>
  );
}

// Helper component for DialogOverlay to show trigger button
function DialogOverlayExample({ Component, renderProps }) {
  const [isOpen, setIsOpen] = useState(false);

  // Build button objects from props
  const primaryButton = renderProps.primaryButton && renderProps.primaryButtonLabel
    ? { label: renderProps.primaryButtonLabel, onClick: () => setIsOpen(false) }
    : null;

  const secondaryButton = renderProps.secondaryButton && renderProps.secondaryButtonLabel
    ? { label: renderProps.secondaryButtonLabel, onClick: () => setIsOpen(false) }
    : null;

  const leftButton = renderProps.leftButton && renderProps.leftButtonLabel
    ? { label: renderProps.leftButtonLabel, onClick: () => setIsOpen(false) }
    : null;

  // Remove button-related props that aren't needed by DialogOverlay
  const { primaryButtonLabel, secondaryButtonLabel, leftButtonLabel, ...componentProps } = renderProps;

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>
        Open Dialog
      </Button>
      <Component
        {...componentProps}
        isOpen={isOpen}
        close={() => setIsOpen(false)}
        primaryButton={primaryButton}
        secondaryButton={secondaryButton}
        leftButton={leftButton}
      >
        <div className="text-gray-700">
          This is the dialog content area. You can add any content here.
        </div>
      </Component>
    </div>
  );
}

// Helper component for Tab to render multiple tabs with state
function TabExample({ Component, renderProps }) {
  const [activeTab, setActiveTab] = useState(0);

  const tabCount = renderProps.tabCount || 2;
  let tabLabels = ['Tab 1', 'Tab 2'];

  // Parse tabLabels if provided
  if (renderProps.tabLabels && typeof renderProps.tabLabels === 'string') {
    const labels = renderProps.tabLabels.split(',').map(l => l.trim()).filter(l => l);
    if (labels.length > 0) {
      tabLabels = labels;
    }
  }

  // Ensure we have enough labels for the tab count
  while (tabLabels.length < tabCount) {
    tabLabels.push(`Tab ${tabLabels.length + 1}`);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'row', borderBottom: '1px solid #E0E0E0' }}>
      {Array.from({ length: tabCount }).map((_, index) => (
        <Component
          key={index}
          label={tabLabels[index] || `Tab ${index + 1}`}
          active={activeTab === index}
          onClick={() => setActiveTab(index)}
          activeColor={renderProps.activeColor}
          fullWidth={renderProps.fullWidth}
        />
      ))}
    </div>
  );
}

// Helper component for MenuOverlay to use hooks
function MenuOverlayExample({ Component, renderProps }) {
  const anchorRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  // Get menu items from renderProps, with fallback
  const menuItems = renderProps.menuItems || ['Menu Item 1', 'Menu Item 2', 'Menu Item 3'];

  // Remove menuItems from renderProps since it's not a prop for MenuOverlay component
  const { menuItems: _, ...componentProps } = renderProps;

  // Parse menu item instructions
  const parseMenuItem = (instruction) => {
    const props = {};

    // Extract heading (text before "with")
    const headingMatch = instruction.match(/^([^w]+?)(?:\s+with\s+|$)/i);
    props.heading = headingMatch ? headingMatch[1].trim() : instruction;

    // Extract overline with quoted text
    const overlineMatch = instruction.match(/overline\s+["']([^"']+)["']/i);
    if (overlineMatch) props.overline = overlineMatch[1];

    // Extract subheading with quoted text
    const subheadingMatch = instruction.match(/subheading\s+["']([^"']+)["']/i);
    if (subheadingMatch) props.subheading = subheadingMatch[1];

    // Check for avatar
    if (/with\s+avatar/i.test(instruction)) {
      props.avatar = { type: 'monogram', name: props.heading };
    }

    // Extract icon name (look for pattern "with [name] icon")
    const iconMatch = instruction.match(/with\s+(\w+)\s+icon/i);
    if (iconMatch) {
      const iconName = iconMatch[1].charAt(0).toUpperCase() + iconMatch[1].slice(1);
      const IconComponent = Icons[iconName];
      if (IconComponent) {
        props.startElement = <IconComponent size="md" />;
      }
    }

    // Check for end icon (look for "and arrow" or similar)
    if (/and\s+arrow/i.test(instruction)) {
      const ChevronRight = Icons.ChevronRight;
      if (ChevronRight) {
        props.endIcon = <ChevronRight size="sm" />;
      }
    }

    return props;
  };

  return (
    <div>
      <Button ref={anchorRef} onClick={() => setIsOpen(!isOpen)}>
        Menu Trigger
      </Button>
      <Component {...componentProps} anchorRef={anchorRef} isOpen={isOpen} close={() => setIsOpen(false)}>
        {menuItems.map((item, index) => {
          const itemProps = typeof item === 'string' ? parseMenuItem(item) : { heading: item };
          return (
            <ListItem
              key={index}
              {...itemProps}
              fullWidth={true}
              isFirst={index === 0}
              isLast={index === menuItems.length - 1}
              onClick={() => setIsOpen(false)}
            />
          );
        })}
      </Component>
    </div>
  );
}

// Helper component for HelpTutorial to render slot children
function HelpTutorialExample({ Component, renderProps, selectedComponent, tutorialOverlayOpen }) {
  const [HelpTutorialSlideComponent, setHelpTutorialSlideComponent] = useState(null);
  const [CardComponent, setCardComponent] = useState(null);
  const [HeadingBlockComponent, setHeadingBlockComponent] = useState(null);

  // Load HelpTutorialSlide, Card, and HeadingBlock components
  useEffect(() => {
    loadComponent('HelpTutorialSlide').then(comp => setHelpTutorialSlideComponent(() => comp));
    loadComponent('Card').then(comp => setCardComponent(() => comp));
    loadComponent('HeadingBlock').then(comp => setHeadingBlockComponent(() => comp));
  }, []);

  if (!HelpTutorialSlideComponent || !CardComponent || !HeadingBlockComponent) {
    return <div className="text-gray-600 text-center p-8">Loading...</div>;
  }

  // Only render if it's introduction type OR if overlay is open for slides type
  if (renderProps.type === 'introduction' || (renderProps.type === 'slides' && tutorialOverlayOpen)) {
    // Build slot children - render component data as React elements
    const renderedSlotChildren = {};

    if (selectedComponent.slotChildren?.slides) {
      renderedSlotChildren.slides = selectedComponent.slotChildren.slides.map((slideData, index) => {
        // Render cards if this slide has them
        let renderedCards = {};
        if (slideData.slotChildren?.cards) {
          renderedCards.cards = slideData.slotChildren.cards.map((cardData, cardIndex) => {
            // Render card children (e.g., HeadingBlock components)
            const cardChildren = cardData.children?.map((childData, childIndex) => {
              if (childData.name === 'HeadingBlock') {
                return <HeadingBlockComponent key={`card-${cardIndex}-child-${childIndex}`} {...childData.props} />;
              }
              return null;
            }).filter(Boolean);

            return (
              <CardComponent key={`card-${cardIndex}`} {...cardData.props}>
                {cardChildren}
              </CardComponent>
            );
          });
        }

        // Render the slide with its cards
        return (
          <HelpTutorialSlideComponent
            key={`slide-${index}`}
            {...slideData.props}
            slotChildren={renderedCards}
          />
        );
      });
    }

    return <Component {...renderProps} slotChildren={renderedSlotChildren} />;
  }

  // For slides type when closed, show a placeholder message
  if (renderProps.type === 'slides') {
    return (
      <div className="text-gray-600 text-center p-8">
        Click "Open Tutorial" button above to view the tutorial overlay
      </div>
    );
  }

  return null;
}

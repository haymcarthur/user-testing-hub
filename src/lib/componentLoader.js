/**
 * Component Loader
 *
 * Dynamically loads Zion UI components for the showcase
 */

// Map of component names to their import paths
const componentImportMap = {
  // Buttons
  Button: () => import('@zion/components/Button').then(m => m.Button),
  IconButton: () => import('@zion/components/IconButton').then(m => m.IconButton),
  BillboardButton: () => import('@zion/components/BillboardButton').then(m => m.BillboardButton),

  // Form Controls
  TextField: () => import('@zion/components/TextField').then(m => m.TextField),
  TextArea: () => import('@zion/components/TextArea').then(m => m.TextArea),
  Select: () => import('@zion/components/Select').then(m => m.Select),
  Checkbox: () => import('@zion/components/Checkbox').then(m => m.Checkbox),
  Radio: () => import('@zion/components/Radio').then(m => m.Radio),
  Toggle: () => import('@zion/components/Toggle').then(m => m.Toggle),
  Slider: () => import('@zion/components/Slider').then(m => m.Slider),
  AutoSuggest: () => import('@zion/components/AutoSuggest').then(m => m.AutoSuggest),
  AutoSelect: () => import('@zion/components/AutoSelect').then(m => m.AutoSelect),
  CustomControl: () => import('@zion/components/CustomControl').then(m => m.CustomControl),

  // Card
  Card: () => import('@zion/components/Card').then(m => m.Card),

  // Chips
  Chips: () => import('@zion/components/Chips').then(m => m.Chips),
  ActionChip: () => import('@zion/components/ActionChip').then(m => m.ActionChip),
  BillboardActionChip: () => import('@zion/components/BillboardActionChip').then(m => m.BillboardActionChip),
  ChoiceChip: () => import('@zion/components/ChoiceChip').then(m => m.ChoiceChip),
  FilterChip: () => import('@zion/components/FilterChip').then(m => m.FilterChip),
  InputChip: () => import('@zion/components/InputChip').then(m => m.InputChip),

  // Layout
  Screen: () => import('@zion/components/Screen').then(m => m.Screen),
  Row: () => import('@zion/components/Row').then(m => m.Row),
  Column: () => import('@zion/components/Column').then(m => m.Column),
  Grid: () => import('@zion/components/Grid').then(m => m.Grid),
  Stack: () => import('@zion/components/Stack').then(m => m.Stack),
  Spacer: () => import('@zion/components/Spacer').then(m => m.Spacer),
  Divider: () => import('@zion/components/Divider').then(m => m.Divider),
  Header: () => import('@zion/components/Header').then(m => m.Header),
  Breadcrumb: () => import('@zion/components/Breadcrumb').then(m => m.Breadcrumb),
  ListItem: () => import('@zion/components/ListItem').then(m => m.ListItem),

  // Typography
  HeadingBlock: () => import('@zion/components/HeadingBlock').then(m => m.HeadingBlock),
  Subheading: () => import('@zion/components/Subheading').then(m => m.Subheading),
  Paragraph: () => import('@zion/components/Paragraph').then(m => m.Paragraph),
  DataBlock: () => import('@zion/components/DataBlock').then(m => m.DataBlock),

  // Feedback
  Alert: () => import('@zion/components/Alert').then(m => m.Alert),
  AlertBanner: () => import('@zion/components/AlertBanner').then(m => m.AlertBanner),
  Avatar: () => import('@zion/components/Avatar').then(m => m.Avatar),
  PersonBlock: () => import('@zion/components/PersonBlock').then(m => m.PersonBlock),
  Tag: () => import('@zion/components/Tag').then(m => m.Tag),

  // Overlays
  DialogOverlay: () => import('@zion/components/DialogOverlay').then(m => m.DialogOverlay),
  MenuOverlay: () => import('@zion/components/MenuOverlay').then(m => m.MenuOverlay),
  TooltipOverlay: () => import('@zion/components/TooltipOverlay').then(m => m.TooltipOverlay),
  FullPageOverlay: () => import('@zion/components/FullPageOverlay').then(m => m.FullPageOverlay),
  StatusOverlay: () => import('@zion/components/StatusOverlay').then(m => m.StatusOverlay),
  QuickGlanceOverlay: () => import('@zion/components/QuickGlanceOverlay').then(m => m.QuickGlanceOverlay),
  InfoSheet: () => import('@zion/components/InfoSheet').then(m => m.InfoSheet),
  HelpTutorial: () => import('@zion/components/HelpTutorial').then(m => m.HelpTutorial),
  HelpTutorialSlide: () => import('@zion/components/HelpTutorialSlide').then(m => m.HelpTutorialSlide),

  // Navigation
  Tab: () => import('@zion/components/Tab').then(m => m.Tab),
  TabGroup: () => import('@zion/components/TabGroup').then(m => m.TabGroup),
  NavigationHeader: () => import('@zion/components/NavigationHeader').then(m => m.NavigationHeader),
  Footer: () => import('@zion/components/Footer').then(m => m.Footer),

  // Image/Media
  AdjustImage: () => import('@zion/components/AdjustImage').then(m => m.AdjustImage),
  ImageGrid: () => import('@zion/components/ImageGrid').then(m => m.ImageGrid),
  ImageViewer: () => import('@zion/components/ImageViewer').then(m => m.ImageViewer),
  RibbonViewer: () => import('@zion/components/RibbonViewer').then(m => m.RibbonViewer),
  ZoomControl: () => import('@zion/components/ZoomControl').then(m => m.ZoomControl),
  ZoomPanControl: () => import('@zion/components/ZoomPanControl').then(m => m.ZoomPanControl),
  PageControl: () => import('@zion/components/PageControl').then(m => m.PageControl),

  // Tables
  DataTable: () => import('@zion/components/DataTable').then(m => m.DataTable),
  Paginator: () => import('@zion/components/Paginator').then(m => m.Paginator),

  // Test UI
  TestRecordingControls: () => import('../components/test-ui/TestRecordingControls').then(m => m.TestRecordingControls),
  TestInstructionOverlay: () => import('../components/test-ui/TestInstructionOverlay').then(m => m.TestInstructionOverlay),
  OpenTextQuestion: () => import('../components/test-ui/OpenTextQuestion').then(m => m.OpenTextQuestion),
  OpinionScaleQuestion: () => import('../components/test-ui/OpinionScaleQuestion').then(m => m.OpinionScaleQuestion),
  MultipleChoiceQuestion: () => import('../components/test-ui/MultipleChoiceQuestion').then(m => m.MultipleChoiceQuestion),
};

/**
 * Load a component dynamically
 * @param {string} componentName - Name of the component to load
 * @returns {Promise<Component>} The component
 */
export async function loadComponent(componentName) {
  const loader = componentImportMap[componentName];

  if (!loader) {
    throw new Error(`Component "${componentName}" not found in component loader map`);
  }

  try {
    const component = await loader();
    return component;
  } catch (error) {
    console.error(`Failed to load component ${componentName}:`, error);
    throw new Error(`Failed to load ${componentName}: ${error.message}`);
  }
}

/**
 * Check if a component can be loaded
 * @param {string} componentName - Name of the component
 * @returns {boolean}
 */
export function canLoadComponent(componentName) {
  return componentName in componentImportMap;
}

/**
 * Get list of all loadable components
 * @returns {string[]}
 */
export function getLoadableComponents() {
  return Object.keys(componentImportMap);
}

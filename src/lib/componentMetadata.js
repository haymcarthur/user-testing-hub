/**
 * Component Metadata Registry
 *
 * Comprehensive metadata for all Zion UI components, matching the UX Zion Library.
 * Every component has title as first field and customNotes as last field.
 */

// Prop type definitions
export const PropTypes = {
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  FUNCTION: 'function',
  NODE: 'node',
  COMPONENT: 'component',
  ENUM: 'enum',
  COLOR: 'color',
  SPACING: 'spacing',
  TYPOGRAPHY: 'typography',
  ELEVATION: 'elevation',
};

/**
 * Layout Props - Special props that appear based on parent component type
 */
export const LAYOUT_PROPS = {
  Grid: [
    {
      name: 'columnSpan',
      type: PropTypes.NUMBER,
      default: 1,
      required: false,
      description: 'How many columns wide should this be? (e.g., in a 6-column grid: 1 = narrow, 3 = half width, 6 = full width)'
    },
    {
      name: 'rowSpan',
      type: PropTypes.NUMBER,
      default: 1,
      required: false,
      description: 'How many rows tall should this be? (1 = single row, 2+ = spans multiple rows)'
    },
  ],
  Row: [
    {
      name: 'width',
      type: PropTypes.STRING,
      default: 'auto',
      required: false,
      description: 'Width of this item (e.g., "200px" for fixed, "auto" for content size, leave empty to share space equally)'
    },
    {
      name: 'grow',
      type: PropTypes.BOOLEAN,
      default: false,
      required: false,
      description: 'Should this item grow to fill leftover space?'
    },
  ],
  Column: [
    {
      name: 'height',
      type: PropTypes.STRING,
      default: 'auto',
      required: false,
      description: 'Height of this item (e.g., "200px" for fixed, "auto" for content size, leave empty to share space equally)'
    },
    {
      name: 'grow',
      type: PropTypes.BOOLEAN,
      default: false,
      required: false,
      description: 'Should this item grow to fill leftover space?'
    },
  ],
  Stack: [
    {
      name: 'alignment',
      type: PropTypes.ENUM,
      options: ['left', 'center', 'right', 'top', 'bottom', 'stretch'],
      default: 'auto',
      required: false,
      description: 'How should THIS item align? For horizontal stacks use left/center/right, for vertical stacks use top/center/bottom (overrides the Stack\'s default alignment just for this item)'
    },
  ],
};

/**
 * Component Categories
 */
export const ComponentCategories = {
  LAYOUT: 'Layout',
  CONTROLS: 'Controls',
  CARDS: 'Cards',
  CONTENT: 'Content',
  VISUALS: 'Visuals',
  INPUTS: 'Inputs',
  NAVIGATION: 'Navigation',
  OVERLAYS: 'Overlays',
  COMPOSITE: 'Composite',
  TEST_UI: 'Test UI',
};

/**
 * Slot Definitions - For components that accept children in specific named areas
 */
export const SlotTypes = {
  HEADER: 'header',
  CONTENT: 'content',
  CONTROLS: 'controls',
  COLUMNS: 'columns',
};

/**
 * Component Metadata Registry
 */
export const COMPONENT_METADATA = {
  // ===== LAYOUT =====
  Screen: {
    name: 'Screen',
    category: ComponentCategories.LAYOUT,
    description: 'Full screen container - represents one complete screen in your flow',
    hasChildren: true,
    props: [
      { name: 'title', type: PropTypes.STRING, required: false, description: 'Label for this screen in the tree' },
      { name: 'useBackgroundImage', type: PropTypes.BOOLEAN, default: false, required: false, description: 'Use background image instead of color' },
      { name: 'backgroundImage', type: PropTypes.STRING, required: false, showWhen: { useBackgroundImage: true }, description: 'URL or path to background image' },
      { name: 'backgroundColor', type: PropTypes.ENUM, options: [
        'gray00', 'gray02', 'gray03', 'gray05',
        'blue00', 'blue03', 'blue05', 'blue10', 'blue20',
        'green02', 'green03', 'green05', 'green10', 'green20',
        'yellow02', 'yellow03', 'yellow05', 'yellow10', 'yellow20',
        'red02', 'red03', 'red05', 'red10', 'red20',
        'danger02', 'danger03', 'danger05', 'danger10', 'danger20',
        'purple02', 'purple03', 'purple05', 'purple10', 'purple20'
      ], required: false, showWhen: { useBackgroundImage: false }, description: 'Background color using design tokens' },
      { name: 'customNotes', type: PropTypes.STRING, required: false, description: 'Special considerations or requirements' },
    ],
  },

  Row: {
    name: 'Row',
    category: ComponentCategories.LAYOUT,
    description: 'Horizontal layout - arrange items side-by-side',
    hasChildren: true,
    props: [
      { name: 'title', type: PropTypes.STRING, required: false, description: 'Label for this component in the tree' },
      { name: 'gap', type: PropTypes.ENUM, options: ['pico', 'nano', 'xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl', 'between'], default: 'md', required: false, description: 'Space between items (spacing tokens or "between" to fill space)' },
      { name: 'horizontalAlign', type: PropTypes.ENUM, options: ['left', 'center', 'right', 'space-between'], default: 'left', required: false, description: 'Horizontal alignment of items' },
      { name: 'verticalAlign', type: PropTypes.ENUM, options: ['top', 'center', 'bottom', 'stretch'], default: 'center', required: false, description: 'Vertical alignment of items' },
      { name: 'wrap', type: PropTypes.BOOLEAN, default: false, required: false },
      { name: 'customNotes', type: PropTypes.STRING, required: false, description: 'Special considerations or requirements' },
    ],
  },

  Column: {
    name: 'Column',
    category: ComponentCategories.LAYOUT,
    description: 'Vertical layout - stack items top-to-bottom',
    hasChildren: true,
    props: [
      { name: 'title', type: PropTypes.STRING, required: false, description: 'Label for this component in the tree' },
      { name: 'gap', type: PropTypes.ENUM, options: ['pico', 'nano', 'xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl', 'between'], default: 'md', required: false, description: 'Space between items (spacing tokens or "between" to fill space)' },
      { name: 'horizontalAlign', type: PropTypes.ENUM, options: ['left', 'center', 'right', 'stretch'], default: 'left', required: false, description: 'Horizontal alignment of items' },
      { name: 'verticalAlign', type: PropTypes.ENUM, options: ['top', 'center', 'bottom', 'space-between'], default: 'top', required: false, description: 'Vertical alignment of items' },
      { name: 'customNotes', type: PropTypes.STRING, required: false, description: 'Special considerations or requirements' },
    ],
  },

  Grid: {
    name: 'Grid',
    category: ComponentCategories.LAYOUT,
    description: 'Grid layout - organize items in rows and columns',
    hasChildren: true,
    props: [
      { name: 'title', type: PropTypes.STRING, required: false, description: 'Label for this component in the tree' },
      { name: 'columns', type: PropTypes.NUMBER, default: 2, required: false, description: 'Number of columns' },
      { name: 'gap', type: PropTypes.ENUM, options: ['pico', 'nano', 'xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'], default: 'md', required: false, description: 'Space between items (spacing tokens)' },
      { name: 'horizontalAlign', type: PropTypes.ENUM, options: ['left', 'center', 'right', 'stretch'], default: 'stretch', required: false, description: 'Horizontal alignment of items within their grid cells' },
      { name: 'verticalAlign', type: PropTypes.ENUM, options: ['top', 'center', 'bottom', 'stretch'], default: 'stretch', required: false, description: 'Vertical alignment of items within their grid cells' },
      { name: 'customNotes', type: PropTypes.STRING, required: false, description: 'Special considerations or requirements' },
    ],
  },

  Stack: {
    name: 'Stack',
    category: ComponentCategories.LAYOUT,
    description: 'Simple stack with consistent spacing',
    hasChildren: true,
    props: [
      { name: 'title', type: PropTypes.STRING, required: false, description: 'Label for this component in the tree' },
      { name: 'direction', type: PropTypes.ENUM, options: ['vertical', 'horizontal'], default: 'vertical', required: false },
      { name: 'gap', type: PropTypes.ENUM, options: ['pico', 'nano', 'xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl', 'between'], default: 'md', required: false, description: 'Space between items (spacing tokens or "between" to fill space)' },
      { name: 'horizontalAlign', type: PropTypes.ENUM, options: ['left', 'center', 'right', 'stretch'], default: 'left', required: false, description: 'Horizontal alignment of items' },
      { name: 'verticalAlign', type: PropTypes.ENUM, options: ['top', 'center', 'bottom', 'stretch'], default: 'top', required: false, description: 'Vertical alignment of items' },
      { name: 'customNotes', type: PropTypes.STRING, required: false, description: 'Special considerations or requirements' },
    ],
  },

  Spacer: {
    name: 'Spacer',
    category: ComponentCategories.LAYOUT,
    description: 'Creates consistent spacing using design tokens',
    hasChildren: false,
    props: [
      { name: 'size', type: PropTypes.ENUM, options: ['pico', 'nano', 'xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'], default: 'md', required: false, description: 'Spacing size using design tokens (4px to 128px)' },
      { name: 'direction', type: PropTypes.ENUM, options: ['vertical', 'horizontal'], default: 'vertical', required: false, description: 'Direction of spacing' },
      { name: 'customNotes', type: PropTypes.STRING, required: false, description: 'Special considerations or requirements' },
    ],
  },

  // ===== CONTROLS =====
  Button: {
    name: 'Button',
    category: ComponentCategories.CONTROLS,
    description: 'Standard button component',
    hasChildren: false,
    props: [
      { name: 'label', type: PropTypes.STRING, required: true, description: 'Text to show on the button' },
      { name: 'variant', type: PropTypes.ENUM, options: ['blue', 'gray', 'danger'], default: 'blue', required: false },
      { name: 'emphasis', type: PropTypes.ENUM, options: ['high', 'medium', 'low', 'inline', 'moreLess'], default: 'high', required: false, description: 'Button style emphasis. "inline" = low emphasis with no horizontal padding. "moreLess" = compact style for more/less toggles.' },
      { name: 'onClick', type: PropTypes.STRING, required: false, description: 'What happens when clicked' },
      { name: 'iconStart', type: PropTypes.ENUM, required: false, isIcon: true, description: 'Icon at start of button' },
      { name: 'iconEnd', type: PropTypes.ENUM, required: false, isIcon: true, description: 'Icon at end of button' },
      { name: 'disabled', type: PropTypes.BOOLEAN, default: false, required: false },
      { name: 'fullWidth', type: PropTypes.BOOLEAN, default: false, required: false, description: 'Make button take full width of container' },
      { name: 'disabledRules', type: PropTypes.STRING, required: false, showWhen: { disabled: true }, description: 'Custom rules for when button should be disabled' },
      { name: 'customNotes', type: PropTypes.STRING, required: false, description: 'Special considerations or requirements' },
    ],
    bestPractices: [
      { title: 'Visual Hierarchy', items: ['Use one primary action per screen (high emphasis blue)', 'Secondary actions use medium or low emphasis', 'Destructive actions use danger variant', 'Never use multiple high emphasis buttons close together'] },
      { title: 'Action Clarity', items: ['Use clear action verbs: "Save Changes", "Delete Account", "Learn More"', 'Avoid generic labels like "OK", "Yes", "Click Here"', 'Keep labels concise (1-3 words)'] },
      { title: 'Disabled State', items: ['Set disabled={true} rather than removing the button', 'Consider tooltip explaining why disabled', 'Don\'t use disabled for destructive actions - use dialogs'] },
      { title: 'Icon Placement', items: ['Use iconStart for actions (Add, Save, Back)', 'Use iconEnd for navigation (Next, Continue)', 'Don\'t use both icons together', 'Icons should be 16px for standard buttons'] },
      { title: 'Form Buttons', items: ['Primary submit: type="submit" with high emphasis', 'Cancel: medium or low emphasis', 'Place primary on right, secondary on left'] }
    ]
  },

  BillboardButton: {
    name: 'BillboardButton',
    category: ComponentCategories.CONTROLS,
    description: 'Larger billboard-style button with extended color palette',
    hasChildren: false,
    props: [
      { name: 'label', type: PropTypes.STRING, required: true, description: 'Text to show on the button' },
      { name: 'variant', type: PropTypes.ENUM, options: ['gray', 'blue', 'green', 'yellow', 'red', 'purple'], default: 'blue', required: false },
      { name: 'emphasis', type: PropTypes.ENUM, options: ['high', 'lightHigh', 'medium', 'low', 'inline', 'moreLess'], default: 'high', required: false, description: 'Button style emphasis. "inline" = low emphasis with no horizontal padding. "moreLess" = compact style for more/less toggles.' },
      { name: 'onClick', type: PropTypes.STRING, required: false, description: 'What happens when clicked' },
      { name: 'iconStart', type: PropTypes.ENUM, required: false, isIcon: true, description: 'Icon at start of button' },
      { name: 'iconEnd', type: PropTypes.ENUM, required: false, isIcon: true, description: 'Icon at end of button' },
      { name: 'disabled', type: PropTypes.BOOLEAN, default: false, required: false },
      { name: 'fullWidth', type: PropTypes.BOOLEAN, default: false, required: false, description: 'Make button take full width of container' },
      { name: 'disabledRules', type: PropTypes.STRING, required: false, showWhen: { disabled: true }, description: 'Custom rules for when button should be disabled' },
      { name: 'customNotes', type: PropTypes.STRING, required: false, description: 'Special considerations or requirements' },
    ],
  },

  IconButton: {
    name: 'IconButton',
    category: ComponentCategories.CONTROLS,
    description: 'Icon-only button',
    hasChildren: false,
    props: [
      { name: 'icon', type: PropTypes.ENUM, required: true, isIcon: true },
      { name: 'variant', type: PropTypes.ENUM, options: ['blue', 'gray', 'danger'], default: 'gray', required: false },
      { name: 'emphasis', type: PropTypes.ENUM, options: ['high', 'low', 'lightHigh'], default: 'low', required: false },
      { name: 'onClick', type: PropTypes.STRING, required: false, description: 'What happens when clicked' },
      { name: 'size', type: PropTypes.ENUM, options: ['xs', 'sm', 'md', 'lg', 'xl'], default: 'md', required: false },
      { name: 'label', type: PropTypes.STRING, required: true, description: 'Accessible label for screen readers' },
      { name: 'disabled', type: PropTypes.BOOLEAN, default: false, required: false },
      { name: 'customNotes', type: PropTypes.STRING, required: false, description: 'Special considerations or requirements' },
    ],
  },

  Chips: {
    name: 'Chips',
    category: ComponentCategories.CONTROLS,
    description: 'Chip component with multiple types',
    hasChildren: false,
    props: [
      { name: 'type', type: PropTypes.ENUM, options: ['filter', 'action', 'billboard', 'choice', 'input'], default: 'filter', required: false },
      { name: 'color', type: PropTypes.ENUM, options: ['blue', 'green', 'yellow', 'red', 'purple'], default: 'blue', required: false, showWhen: { type: ['billboard', 'choice'] }, description: 'Color variant of the chip' },
      { name: 'inline', type: PropTypes.BOOLEAN, default: false, required: false, showWhen: { type: ['action', 'billboard'] }, description: 'Use inline styling with reduced padding' },
      { name: 'disabled', type: PropTypes.BOOLEAN, default: false, required: false },
      { name: 'emphasis', type: PropTypes.ENUM, options: ['high', 'low'], default: 'high', required: false, showWhen: { type: ['action', 'billboard'] }, description: 'Emphasis level (high or low)' },
      { name: 'label', type: PropTypes.STRING, required: true, description: 'Text to display in chip' },
      { name: 'iconStart', type: PropTypes.ENUM, required: false, isIcon: true, showWhen: { type: ['action', 'billboard', 'choice', 'input'] }, description: 'Icon to display at start of chip' },
      { name: 'iconEnd', type: PropTypes.ENUM, required: false, isIcon: true, showWhen: { type: ['action', 'billboard'] }, description: 'Icon to display at end of chip' },
      { name: 'onRemove', type: PropTypes.STRING, required: false, showWhen: { type: 'input' }, description: 'What happens when removed' },
      { name: 'onClick', type: PropTypes.STRING, required: false, description: 'What happens when clicked' },
      { name: 'customNotes', type: PropTypes.STRING, required: false, description: 'Special considerations or requirements' },
    ],
  },

  Checkbox: {
    name: 'Checkbox',
    category: ComponentCategories.CONTROLS,
    description: 'Checkbox input',
    hasChildren: false,
    props: [
      { name: 'type', type: PropTypes.ENUM, options: ['single', 'group'], default: 'single', required: false, description: 'Single checkbox or group of checkboxes' },
      { name: 'label', type: PropTypes.STRING, required: false, description: 'Label text next to checkbox', showWhen: { type: 'single' } },
      { name: 'indeterminate', type: PropTypes.BOOLEAN, default: false, required: false, showWhen: { type: 'single' } },
      { name: 'groupLabelOptions', type: PropTypes.STRING, required: false, description: 'Comma-separated list of checkbox labels (e.g., "Option 1, Option 2, Option 3")', showWhen: { type: 'group' } },
      { name: 'disabled', type: PropTypes.BOOLEAN, default: false, required: false },
      { name: 'onChange', type: PropTypes.STRING, required: false, description: 'What happens when state changes' },
      { name: 'customNotes', type: PropTypes.STRING, required: false, description: 'Special considerations or requirements' },
    ],
  },

  Radio: {
    name: 'Radio',
    category: ComponentCategories.CONTROLS,
    description: 'Radio button input',
    hasChildren: false,
    props: [
      { name: 'type', type: PropTypes.ENUM, options: ['single', 'group'], default: 'single', required: false, description: 'Single radio button or group of radio buttons' },
      { name: 'label', type: PropTypes.STRING, required: false, description: 'Label text next to radio button', showWhen: { type: 'single' } },
      { name: 'groupLabelOptions', type: PropTypes.STRING, required: false, description: 'Comma-separated list of radio button labels (e.g., "Option 1, Option 2, Option 3")', showWhen: { type: 'group' } },
      { name: 'disabled', type: PropTypes.BOOLEAN, default: false, required: false },
      { name: 'onChange', type: PropTypes.STRING, required: false, description: 'What happens when selected' },
      { name: 'customNotes', type: PropTypes.STRING, required: false, description: 'Special considerations or requirements' },
    ],
  },

  Toggle: {
    name: 'Toggle',
    category: ComponentCategories.CONTROLS,
    description: 'Toggle switch',
    hasChildren: false,
    props: [
      { name: 'disabled', type: PropTypes.BOOLEAN, default: false, required: false },
      { name: 'onChange', type: PropTypes.STRING, required: false, description: 'What happens when toggled' },
      { name: 'label', type: PropTypes.STRING, required: false, description: 'Label text next to toggle' },
      { name: 'customNotes', type: PropTypes.STRING, required: false, description: 'Special considerations or requirements' },
    ],
  },

  ZoomPanControl: {
    name: 'ZoomPanControl',
    category: ComponentCategories.CONTROLS,
    description: 'Zoom/Pan controls with multiple type variations',
    hasChildren: false,
    props: [
      { name: 'type', type: PropTypes.ENUM, options: ['zoom', 'custom', 'pageControl'], default: 'zoom', required: false },
      // Zoom type props
      { name: 'onZoomOut', type: PropTypes.STRING, required: false, showWhen: { type: 'zoom' }, description: 'Zoom out increment action' },
      { name: 'onZoomIn', type: PropTypes.STRING, required: false, showWhen: { type: 'zoom' }, description: 'Zoom in increment action' },
      // Custom type props
      { name: 'iconStart', type: PropTypes.ENUM, required: false, isIcon: true, showWhen: { type: 'custom' }, description: 'Icon at start' },
      { name: 'iconEnd', type: PropTypes.ENUM, required: false, isIcon: true, showWhen: { type: 'custom' }, description: 'Icon at end' },
      { name: 'labelCustom', type: PropTypes.STRING, required: false, showWhen: { type: 'custom' }, description: 'Label text for button' },
      { name: 'onClickCustom', type: PropTypes.STRING, required: false, showWhen: { type: 'custom' }, description: 'Custom action for this control' },
      // Page control props
      { name: 'labelPage', type: PropTypes.STRING, default: 'image', required: false, showWhen: { type: 'pageControl' } },
      // All types
      { name: 'disabled', type: PropTypes.BOOLEAN, default: false, required: false },
      { name: 'customNotes', type: PropTypes.STRING, required: false, description: 'Special considerations or requirements' },
    ],
  },

  // ===== CONTENT =====
  Card: {
    name: 'Card',
    category: ComponentCategories.CONTENT,
    description: 'Versatile card component - can be content-only, image+content combo, or image-only',
    hasChildren: true,
    props: [
      { name: 'title', type: PropTypes.STRING, required: false, description: 'Label for this component in the tree' },
      { name: 'size', type: PropTypes.ENUM, options: ['xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'], default: 'md', required: false },
      { name: 'variant', type: PropTypes.ENUM, options: ['elevated', 'outlined', 'none'], default: 'elevated', required: false },
      { name: 'image', type: PropTypes.STRING, required: false, description: 'Optional image URL. If no children, renders image-only card.' },
      { name: 'imagePosition', type: PropTypes.ENUM, options: ['top', 'bottom', 'left', 'right', 'middle'], default: 'top', required: false },
      { name: 'imageAspectRatio', type: PropTypes.ENUM, options: ['16:9', '4:3', '3:2', '1:1', '2:3', '3:4', '9:16'], default: '16:9', required: false },
      { name: 'removeOppositeMargin', type: PropTypes.BOOLEAN, default: false, required: false },
      { name: 'backgroundColor', type: PropTypes.ENUM, options: [
        'gray00', 'gray02', 'gray03', 'gray05',
        'blue00', 'blue03', 'blue05', 'blue10', 'blue20',
        'green02', 'green03', 'green05', 'green10', 'green20',
        'yellow02', 'yellow03', 'yellow05', 'yellow10', 'yellow20',
        'red02', 'red03', 'red05', 'red10', 'red20',
        'danger02', 'danger03', 'danger05', 'danger10', 'danger20',
        'purple02', 'purple03', 'purple05', 'purple10', 'purple20'
      ], required: false, description: 'Background color token', showWhen: { variant: 'none' } },
      { name: 'onClick', type: PropTypes.STRING, required: false, description: 'What happens when clicked' },
      { name: 'customNotes', type: PropTypes.STRING, required: false, description: 'Special considerations or requirements' },
    ],
  },

  HeadingBlock: {
    name: 'HeadingBlock',
    category: ComponentCategories.CONTENT,
    description: 'Heading with optional overline and subheading',
    hasChildren: false,
    props: [
      { name: 'level', type: PropTypes.ENUM, options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'], default: 'h2', required: false },
      { name: 'overline', type: PropTypes.STRING, required: false, description: 'Overline text (use "" for exact wording, or describe what to use)' },
      { name: 'heading', type: PropTypes.STRING, required: false, description: 'Heading text (use "" for exact wording, or describe what to use)' },
      { name: 'subheading', type: PropTypes.STRING, required: false, description: 'Subheading text (use "" for exact wording, or describe what to use)' },
      { name: 'centered', type: PropTypes.BOOLEAN, default: false, required: false },
      { name: 'customNotes', type: PropTypes.STRING, required: false, description: 'Special considerations or requirements' },
    ],
  },

  DataBlock: {
    name: 'DataBlock',
    category: ComponentCategories.CONTENT,
    description: 'Block for displaying data with heading and paragraph',
    hasChildren: false,
    props: [
      { name: 'heading', type: PropTypes.STRING, required: false, description: 'Heading text (use "" for exact wording, or describe what to use)' },
      { name: 'paragraph', type: PropTypes.STRING, required: false, description: 'Paragraph text (use "" for exact wording, or describe what to use)' },
      { name: 'customNotes', type: PropTypes.STRING, required: false, description: 'Special considerations or requirements' },
    ],
  },

  Paragraph: {
    name: 'Paragraph',
    category: ComponentCategories.CONTENT,
    description: 'Paragraph text component',
    hasChildren: false,
    props: [
      { name: 'size', type: PropTypes.ENUM, options: ['xs', 'sm', 'md', 'lg', 'xl'], default: 'md', required: false },
      { name: 'text', type: PropTypes.STRING, required: false, description: 'Paragraph text (use "" for exact wording, or describe what to use)' },
      { name: 'centered', type: PropTypes.BOOLEAN, default: false, required: false },
      { name: 'secondary', type: PropTypes.BOOLEAN, default: false, required: false },
      { name: 'dense', type: PropTypes.BOOLEAN, default: false, required: false },
      { name: 'customNotes', type: PropTypes.STRING, required: false, description: 'Special considerations or requirements' },
    ],
  },

  ListItem: {
    name: 'ListItem',
    category: ComponentCategories.CONTENT,
    description: 'List item with optional start element and content',
    hasChildren: false,
    props: [
      { name: 'startElement', type: PropTypes.ENUM, options: ['none', 'icon', 'image', 'checkbox', 'avatar'], default: 'none', required: false },
      { name: 'icon', type: PropTypes.ENUM, required: false, isIcon: true, showWhen: { startElement: 'icon' } },
      { name: 'image', type: PropTypes.STRING, required: false, showWhen: { startElement: 'image' }, description: 'Path to image file or folder' },
      { name: 'avatarType', type: PropTypes.ENUM, options: ['photo', 'male', 'female', 'anonymous', 'monogram'], default: 'monogram', required: false, showWhen: { startElement: 'avatar' }, description: 'Type of avatar to display' },
      { name: 'avatarName', type: PropTypes.STRING, required: false, showWhen: { startElement: 'avatar' }, description: 'Name for avatar (for monogram or alt text)' },
      { name: 'photoSrc', type: PropTypes.STRING, required: false, showWhen: { startElement: 'avatar', avatarType: 'photo' }, description: 'URL for photo avatar' },
      { name: 'overline', type: PropTypes.STRING, required: false, description: 'Overline text (use "" for exact wording, or describe what to use)' },
      { name: 'heading', type: PropTypes.STRING, required: false, description: 'Heading text (use "" for exact wording, or describe what to use)' },
      { name: 'subheading', type: PropTypes.STRING, required: false, description: 'Subheading text (use "" for exact wording, or describe what to use)' },
      { name: 'endIcon', type: PropTypes.ENUM, required: false, isIcon: true },
      { name: 'metaText', type: PropTypes.BOOLEAN, default: false, required: false, description: 'Show meta text (disables endIcon when true)' },
      { name: 'metaTextContent', type: PropTypes.STRING, required: false, showWhen: { metaText: true }, description: 'Text to display as meta text' },
      { name: 'onClick', type: PropTypes.STRING, required: false, description: 'What happens when clicked' },
      { name: 'dense', type: PropTypes.BOOLEAN, default: false, required: false },
      { name: 'emphasized', type: PropTypes.BOOLEAN, default: false, required: false },
      { name: 'customNotes', type: PropTypes.STRING, required: false, description: 'Special considerations or requirements' },
    ],
    bestPractices: [
      { title: 'Text Hierarchy', items: ['Always provide heading - it\'s the primary content', 'Use overline for context (category, date, type)', 'Use subheading for secondary info (description, status)', 'Don\'t use all three text levels unless truly needed'] },
      { title: 'Start Elements', items: ['Icons: For actions, categories, status (16px)', 'Avatars: For people, user accounts (size varies)', 'Images: For content previews (40x40px recommended)', 'Checkboxes: For multi-select lists', 'None: For simple text-only lists'] },
      { title: 'End Content Strategy', items: ['Use endIcon (ChevronRight) to show navigation/drill-down', 'Use metaText for timestamps, counts, status', 'Never use both endIcon and metaText together', 'Keep metaText short (1-2 words or numbers)'] },
      { title: 'Dense Variant', items: ['Use dense={true} for compact lists with many items', 'Reduces vertical padding from 12px to 8px', 'Best for data-heavy interfaces', 'Don\'t use dense if items have avatars or images'] },
      { title: 'Interactive States', items: ['Provide onClick for clickable items', 'Hover background appears automatically with onClick', 'Use emphasized={true} to bold the heading', 'Disabled state via parent - no disabled prop'] },
      { title: 'In MenuOverlay', items: ['ALWAYS use fullWidth={true} for edge-to-edge hover', 'Use isFirst={true} for first item (removes top padding)', 'Use isLast={true} for last item (removes bottom padding)', 'Wrap in div with margin: \'0 -16px\' for proper alignment'] },
      { title: 'In Regular Lists', items: ['Don\'t use fullWidth for regular lists', 'Separate items with Divider components', 'Group related items together', 'Use consistent start element types within a list'] },
      { title: 'Accessibility', items: ['Heading is required for screen readers', 'Use semantic alt text for images/avatars', 'Ensure onClick items are keyboard accessible', 'Use aria-label if heading doesn\'t convey full context'] }
    ]
  },

  Divider: {
    name: 'Divider',
    category: ComponentCategories.CONTENT,
    description: 'Divider line with optional label',
    hasChildren: false,
    props: [
      { name: 'orientation', type: PropTypes.ENUM, options: ['horizontal', 'vertical'], default: 'horizontal', required: false },
      { name: 'label', type: PropTypes.STRING, required: false, description: 'Label text (use "" for exact wording, or describe what to use)' },
      { name: 'labelPosition', type: PropTypes.ENUM, options: ['below', 'center'], default: 'below', required: false, description: 'Position of label relative to divider line' },
      { name: 'customNotes', type: PropTypes.STRING, required: false, description: 'Special considerations or requirements' },
    ],
  },

  DataTable: {
    name: 'DataTable',
    category: ComponentCategories.CONTENT,
    description: 'Data table with dynamic slot-based columns',
    hasChildren: true,
    hasDynamicSlots: true,
    slotTemplate: {
      allowedComponents: [
        'Avatar', 'Button', 'Checkbox', 'Chips', 'DataBlock', 'Icon',
        'IconButton', 'ListItem', 'Paragraph', 'Radio', 'Select',
        'Tag', 'TextField', 'Toggle'
      ]
    },
    props: [
      { name: 'columnCount', type: PropTypes.NUMBER, default: 3, required: false, description: 'Number of columns (1-20)' },
      { name: 'rowCount', type: PropTypes.NUMBER, default: 3, required: false, description: 'Number of data rows (1-50)' },
      { name: 'columnHeaders', type: PropTypes.STRING, required: false, description: 'Comma-separated column headers (e.g., "Name, Email, Role")' },
      { name: 'gap', type: PropTypes.ENUM, options: ['pico', 'nano', 'xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'], default: 'lg', required: false, description: 'Horizontal space between columns' },
      { name: 'rowGap', type: PropTypes.ENUM, options: ['pico', 'nano', 'xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'], default: 'lg', required: false, description: 'Vertical space between rows' },
      { name: 'showHeaderDivider', type: PropTypes.BOOLEAN, default: true, required: false, description: 'Show divider line below header' },
      { name: 'showRowDividers', type: PropTypes.BOOLEAN, default: true, required: false, description: 'Show divider lines between rows' },
      { name: 'customNotes', type: PropTypes.STRING, required: false, description: 'Special considerations or requirements' },
    ],
  },

  Paginator: {
    name: 'Paginator',
    category: ComponentCategories.NAVIGATION,
    description: 'Pagination controls with results per page selector',
    hasChildren: false,
    props: [
      { name: 'currentPage', type: PropTypes.NUMBER, default: 1, required: false, description: 'Current page number (1-indexed)' },
      { name: 'totalPages', type: PropTypes.NUMBER, default: 1, required: false, description: 'Total number of pages' },
      { name: 'resultsPerPage', type: PropTypes.NUMBER, default: 10, required: false, description: 'Number of results per page (10, 20, 50, or 100)' },
      { name: 'showAll', type: PropTypes.BOOLEAN, default: false, required: false, description: 'Show "All" option in results per page dropdown' },
      { name: 'hideResultsPerPage', type: PropTypes.BOOLEAN, default: false, required: false, description: 'Hide the results per page section (left side)' },
      { name: 'dense', type: PropTypes.BOOLEAN, default: false, required: false, description: 'Remove top/bottom spacing (default is 12px)' },
      { name: 'customNotes', type: PropTypes.STRING, required: false, description: 'Special considerations or requirements' },
    ],
  },

  // ===== INPUTS =====
  TextField: {
    name: 'TextField',
    category: ComponentCategories.INPUTS,
    description: 'Single-line text input',
    hasChildren: false,
    props: [
      { name: 'label', type: PropTypes.STRING, required: false, description: 'Input label text' },
      { name: 'labelLarge', type: PropTypes.BOOLEAN, default: false, required: false, description: 'Use large label style' },
      { name: 'message', type: PropTypes.STRING, required: false, description: 'Helper or error message' },
      { name: 'placeholder', type: PropTypes.STRING, required: false },
      { name: 'status', type: PropTypes.ENUM, options: ['default', 'valid', 'warning', 'error'], default: 'default', required: false },
      { name: 'icon', type: PropTypes.ENUM, required: false, isIcon: true },
      { name: 'validation', type: PropTypes.STRING, required: false, description: 'Validation rules or requirements' },
      { name: 'clearable', type: PropTypes.BOOLEAN, default: false, required: false },
      { name: 'disabled', type: PropTypes.BOOLEAN, default: false, required: false },
      { name: 'billboard', type: PropTypes.BOOLEAN, default: false, required: false },
      { name: 'customNotes', type: PropTypes.STRING, required: false, description: 'Special considerations or requirements' },
    ],
    bestPractices: [
      { title: 'Labels', items: ['Always provide descriptive labels', 'Use labelLarge for prominence in simple forms', 'Don\'t use placeholder as label replacement'] },
      { title: 'Validation', items: ['Show errors after user interaction (blur or submit)', 'Be specific: "Email must include @" not "Invalid email"', 'Use status="error" with descriptive message', 'Don\'t show errors while typing'] },
      { title: 'Input Types', items: ['Use type="email" for emails (mobile keyboard)', 'Use type="tel" for phones', 'Use type="password" for passwords'] },
      { title: 'Placeholder Text', items: ['Show format examples: "john@example.com"', 'Don\'t repeat the label text', 'Placeholders disappear on input'] }
    ]
  },

  TextArea: {
    name: 'TextArea',
    category: ComponentCategories.INPUTS,
    description: 'Multi-line text input',
    hasChildren: false,
    props: [
      { name: 'label', type: PropTypes.STRING, required: false, description: 'Input label text' },
      { name: 'labelLarge', type: PropTypes.BOOLEAN, default: false, required: false, description: 'Use large label style' },
      { name: 'message', type: PropTypes.STRING, required: false },
      { name: 'placeholder', type: PropTypes.STRING, required: false },
      { name: 'status', type: PropTypes.ENUM, options: ['default', 'valid', 'warning', 'error'], default: 'default', required: false },
      { name: 'maxLength', type: PropTypes.NUMBER, required: false, description: 'Maximum character count (set to 0 for no limit)' },
      { name: 'resize', type: PropTypes.ENUM, options: ['both', 'vertical', 'horizontal', 'none'], default: 'both', required: false },
      { name: 'validation', type: PropTypes.STRING, required: false, description: 'Validation rules' },
      { name: 'disabled', type: PropTypes.BOOLEAN, default: false, required: false },
      { name: 'billboard', type: PropTypes.BOOLEAN, default: false, required: false },
      { name: 'customNotes', type: PropTypes.STRING, required: false, description: 'Special considerations or requirements' },
    ],
    bestPractices: [
      { title: 'Character Limits', items: ['Always set maxLength to prevent overflow', 'Shows character counter to user', 'Set to 0 only if truly unlimited'] },
      { title: 'Height', items: ['Short feedback: 3-4 rows', 'Comments: 6-8 rows', 'Long-form: 10+ rows', 'Users can resize if allowed'] },
      { title: 'Resize Behavior', items: ['resize="vertical" recommended (prevents width changes)', 'resize="both" gives full control', 'resize="none" use sparingly'] }
    ]
  },

  Select: {
    name: 'Select',
    category: ComponentCategories.INPUTS,
    description: 'Dropdown select input',
    hasChildren: false,
    props: [
      { name: 'label', type: PropTypes.STRING, required: false, description: 'Input label text' },
      { name: 'labelLarge', type: PropTypes.BOOLEAN, default: false, required: false, description: 'Use large label style' },
      { name: 'message', type: PropTypes.STRING, required: false },
      { name: 'placeholder', type: PropTypes.STRING, required: false },
      { name: 'options', type: PropTypes.STRING, required: false, description: 'Comma-separated list of options (e.g., "Option 1, Option 2, Option 3")' },
      { name: 'status', type: PropTypes.ENUM, options: ['default', 'valid', 'warning', 'error'], default: 'default', required: false },
      { name: 'icon', type: PropTypes.ENUM, required: false, isIcon: true },
      { name: 'validation', type: PropTypes.STRING, required: false, description: 'Validation rules' },
      { name: 'billboard', type: PropTypes.BOOLEAN, default: false, required: false },
      { name: 'disabled', type: PropTypes.BOOLEAN, default: false, required: false },
      { name: 'customNotes', type: PropTypes.STRING, required: false, description: 'Special considerations or requirements' },
    ],
    bestPractices: [
      { title: 'Option Count', items: ['2-3 options: Consider Radio buttons instead', '4-10 options: Select is appropriate', '10+ with search: Use AutoSelect instead'] },
      { title: 'Option Order', items: ['Alphabetical for countries, states, names', 'Most common first for frequent options', 'Group related options when possible'] },
      { title: 'Default Values', items: ['Set sensible defaults when applicable', 'Use placeholder for "no selection" state', 'Don\'t pre-select unless clear default exists'] }
    ]
  },

  AutoSelect: {
    name: 'AutoSelect',
    category: ComponentCategories.INPUTS,
    description: 'Autocomplete select with search',
    hasChildren: false,
    props: [
      { name: 'label', type: PropTypes.STRING, required: false, description: 'Input label text' },
      { name: 'labelLarge', type: PropTypes.BOOLEAN, default: false, required: false, description: 'Use large label style' },
      { name: 'message', type: PropTypes.STRING, required: false },
      { name: 'placeholder', type: PropTypes.STRING, required: false },
      { name: 'options', type: PropTypes.STRING, required: false, description: 'Comma-separated list of options (e.g., "Option 1, Option 2, Option 3")' },
      { name: 'status', type: PropTypes.ENUM, options: ['default', 'valid', 'warning', 'error'], default: 'default', required: false },
      { name: 'disabled', type: PropTypes.BOOLEAN, default: false, required: false },
      { name: 'billboard', type: PropTypes.BOOLEAN, default: false, required: false },
      { name: 'clearable', type: PropTypes.BOOLEAN, default: false, required: false },
      { name: 'validation', type: PropTypes.STRING, required: false, description: 'Validation rules' },
      { name: 'startIcon', type: PropTypes.ENUM, required: false, isIcon: true },
      { name: 'customNotes', type: PropTypes.STRING, required: false, description: 'Special considerations or requirements' },
    ],
    bestPractices: [
      { title: 'When to Use', items: ['10+ options where users need search/filter', 'Lists that may grow (cities, users, tags)', 'When users know what they\'re looking for', 'Use Select for small, stable lists (<10)'] },
      { title: 'AllowCreate', items: ['Great for tags, categories, custom lists', 'Validate created entries before saving', 'Don\'t use for fixed data sets (countries)'] },
      { title: 'Icons & Clearable', items: ['Use startIcon to indicate field purpose', 'Always enable clearable for optional fields', 'Essential for filter/search scenarios'] },
      { title: 'Performance', items: ['Load options on demand if very large (1000+)', 'Debounce onChange if making API calls', 'Cache filtered results when possible'] }
    ]
  },

  Slider: {
    name: 'Slider',
    category: ComponentCategories.INPUTS,
    description: 'Range slider input',
    hasChildren: false,
    props: [
      { name: 'min', type: PropTypes.NUMBER, default: 0, required: false },
      { name: 'max', type: PropTypes.NUMBER, default: 100, required: false },
      { name: 'value', type: PropTypes.NUMBER, default: 50, required: false },
      { name: 'onChange', type: PropTypes.STRING, required: false, description: 'What happens when value changes' },
      { name: 'step', type: PropTypes.NUMBER, default: 1, required: false },
      { name: 'customNotes', type: PropTypes.STRING, required: false, description: 'Special considerations or requirements' },
    ],
  },

  // ===== VISUALS =====
  Icon: {
    name: 'Icon',
    category: ComponentCategories.VISUALS,
    description: 'Display an icon',
    hasChildren: false,
    props: [
      { name: 'size', type: PropTypes.ENUM, options: ['xs', 'sm', 'md', 'lg'], default: 'md', required: false },
      { name: 'icon', type: PropTypes.ENUM, required: true, isIcon: true },
      { name: 'backgroundColor', type: PropTypes.ENUM, options: ['blue', 'green', 'yellow', 'danger'], required: false },
      { name: 'customNotes', type: PropTypes.STRING, required: false, description: 'Special considerations or requirements' },
    ],
  },

  Avatar: {
    name: 'Avatar',
    category: ComponentCategories.VISUALS,
    description: 'User avatar with multiple types',
    hasChildren: false,
    props: [
      { name: 'size', type: PropTypes.ENUM, options: ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'], default: 'md', required: false },
      { name: 'type', type: PropTypes.ENUM, options: ['monogram', 'male', 'female', 'anonymous', 'photo'], default: 'monogram', required: false },
      { name: 'photoSrc', type: PropTypes.STRING, required: false, showWhen: { type: 'photo' }, description: 'Path to photo file or folder' },
      { name: 'name', type: PropTypes.STRING, required: false, description: 'Name for avatar (use "" for exact wording, or describe what to use)' },
      { name: 'grayMode', type: PropTypes.BOOLEAN, default: false, required: false },
      { name: 'customNotes', type: PropTypes.STRING, required: false, description: 'Special considerations or requirements' },
    ],
  },

  Tag: {
    name: 'Tag',
    category: ComponentCategories.VISUALS,
    description: 'Tag displaying an icon with text in various color variants',
    hasChildren: false,
    props: [
      { name: 'variant', type: PropTypes.ENUM, options: ['blue', 'green', 'yellow', 'red', 'purple', 'gray', 'danger'], default: 'blue', required: false, description: 'Color variant' },
      { name: 'icon', type: PropTypes.ENUM, required: true, isIcon: true, description: 'Icon to display (18x18)' },
      { name: 'text', type: PropTypes.STRING, required: true, description: 'Text to display next to icon' },
      { name: 'customNotes', type: PropTypes.STRING, required: false, description: 'Special considerations or requirements' },
    ],
  },

  PersonBlock: {
    name: 'PersonBlock',
    category: ComponentCategories.CONTENT,
    description: 'Person display with avatar and text information',
    hasChildren: false,
    props: [
      { name: 'size', type: PropTypes.ENUM, options: ['sm', 'md', 'lg', 'xl'], default: 'md', required: false, description: 'Size determines avatar size and text styling' },
      { name: 'centered', type: PropTypes.BOOLEAN, default: false, required: false, description: 'Center all content and place avatar on top' },
      { name: 'noBold', type: PropTypes.BOOLEAN, default: false, required: false, description: 'Use body typography instead of bold for heading' },
      { name: 'overline', type: PropTypes.STRING, required: false, description: 'Overline text (use "" for exact wording, or describe what to use)' },
      { name: 'heading', type: PropTypes.STRING, required: false, description: 'Heading text (use "" for exact wording, or describe what to use)' },
      { name: 'subheading', type: PropTypes.STRING, required: false, description: 'Subheading text (use "" for exact wording, or describe what to use)' },
      { name: 'avatarType', type: PropTypes.ENUM, options: ['photo', 'male', 'female', 'anonymous', 'monogram'], default: 'monogram', required: false, description: 'Type of avatar to display' },
      { name: 'photoSrc', type: PropTypes.STRING, required: false, showWhen: { avatarType: 'photo' }, description: 'Path to photo file or folder' },
      { name: 'name', type: PropTypes.STRING, required: false, description: 'Name for avatar (use "" for exact wording, or describe what to use)' },
      { name: 'grayMode', type: PropTypes.BOOLEAN, default: false, required: false, description: 'Use grayscale version for avatar' },
      { name: 'customNotes', type: PropTypes.STRING, required: false, description: 'Special considerations or requirements' },
    ],
  },

  RibbonViewer: {
    name: 'RibbonViewer',
    category: ComponentCategories.VISUALS,
    description: 'Horizontal scrollable ribbon of images',
    hasChildren: false,
    props: [
      { name: 'images', type: PropTypes.STRING, required: true, description: 'Path to image files or folder' },
      { name: 'onThumbnailClick', type: PropTypes.STRING, default: 'Open image in full-screen viewer with navigation controls', required: false, description: 'What happens when clicking a thumbnail' },
      { name: 'customNotes', type: PropTypes.STRING, required: false, description: 'Special considerations or requirements' },
    ],
  },

  ImageViewer: {
    name: 'ImageViewer',
    category: ComponentCategories.VISUALS,
    description: 'Advanced image viewer with zoom and controls',
    hasChildren: true,
    props: [
      { name: 'images', type: PropTypes.STRING, required: true, description: 'Path to image files or folder' },
      { name: 'ribbonViewer', type: PropTypes.BOOLEAN, default: true, required: false },
      { name: 'showPageCounter', type: PropTypes.BOOLEAN, default: true, required: false, description: 'Show page counter in top left corner' },
      { name: 'customNotes', type: PropTypes.STRING, required: false, description: 'Special considerations or requirements' },
    ],
    slots: [
      {
        name: SlotTypes.CONTROLS,
        label: 'Controls',
        description: 'Zoom/pan controls in upper right corner',
        allowedComponents: ['ZoomPanControl'],
        autoAdd: 'ZoomPanControl', // Automatically add this component when clicking Add
      },
    ],
  },

  ImageGrid: {
    name: 'ImageGrid',
    category: ComponentCategories.VISUALS,
    description: 'Grid layout for displaying images',
    hasChildren: false,
    props: [
      { name: 'images', type: PropTypes.STRING, required: true, description: 'Path to image files or folder' },
      { name: 'onThumbnailClick', type: PropTypes.STRING, default: 'Open image in full-screen viewer with navigation controls', required: false, description: 'What happens when clicking a thumbnail' },
      { name: 'columnsPerRow', type: PropTypes.NUMBER, default: 5, required: false },
      { name: 'customNotes', type: PropTypes.STRING, required: false, description: 'Special considerations or requirements' },
    ],
  },

  // ===== NAVIGATION =====
  Breadcrumb: {
    name: 'Breadcrumb',
    category: ComponentCategories.NAVIGATION,
    description: 'Breadcrumb navigation',
    hasChildren: false,
    props: [
      { name: 'items', type: PropTypes.STRING, required: false, description: 'Comma-separated breadcrumb labels (e.g., "Home, Products, Details")' },
      { name: 'customNotes', type: PropTypes.STRING, required: false, description: 'Special considerations or requirements' },
    ],
  },

  MenuOverlay: {
    name: 'MenuOverlay',
    category: ComponentCategories.NAVIGATION,
    description: 'Dropdown menu overlay',
    hasChildren: true,
    props: [
      { name: 'title', type: PropTypes.STRING, required: false, description: 'Label for this component in the tree' },
      { name: 'menuItems', type: PropTypes.STRING, required: false, description: 'Instructions for menu items using ListItem component. Describe each item and specify: heading (required), overline (optional), subheading (optional), startElement (icon/avatar/image/checkbox), endIcon (optional). Example: "Home with house icon, Profile with avatar, Settings with gear icon and arrow"' },
      { name: 'position', type: PropTypes.ENUM, options: ['top', 'bottom', 'left', 'right'], default: 'bottom', required: false, description: 'Position relative to anchor button' },
      { name: 'horizontalAlign', type: PropTypes.ENUM, options: ['left', 'center', 'right'], default: 'center', required: false, description: 'Align menu to left, center, or right of anchor button' },
      { name: 'offset', type: PropTypes.NUMBER, default: 8, required: false, description: 'Distance from anchor button in pixels' },
      { name: 'width', type: PropTypes.NUMBER, default: 200, required: false, description: 'Width of menu in pixels' },
      { name: 'customNotes', type: PropTypes.STRING, required: false, description: 'Special considerations or requirements' },
    ],
    bestPractices: [
      { title: 'Menu Positioning', items: ['Use position="bottom" for most cases', 'Use align="start" to align left edge with anchor', 'Use offset={8} for comfortable spacing', 'Ensure menu doesn\'t clip off screen edges'] },
      { title: 'Menu Width', items: ['Match anchor width for select-style menus', 'Use fixed width (200-300px) for action menus', 'Allow content to determine width for mixed content', 'Avoid menus wider than 400px'] },
      { title: 'Menu Items', items: ['Always use ListItem components for menu items', 'Use fullWidth={true} for proper edge-to-edge hover', 'Be consistent with navigation patterns in your app', 'Group related items with Divider'] },
      { title: 'Actions and Closing', items: ['Close menu after item selection', 'Support multiple actions without closing (use checkboxes)', 'Provide "Cancel" or "Close" for non-action menus', 'Close on click outside'] },
      { title: 'Keyboard Navigation', items: ['Support arrow keys for navigation', 'Support Enter/Space to select', 'Support Esc to close', 'Maintain focus management'] },
      { title: 'Scrolling', items: ['Set max-height for long lists (240px recommended)', 'Show scroll indicators when content overflows', 'Keep most important items at top', 'Consider search/filter for 10+ items'] },
      { title: 'Icons and Visual Hierarchy', items: ['Use icons to indicate categories or actions', 'Use endIcon (arrow) to show nested menus', 'Use consistent icon sizing (16px recommended)', 'Don\'t overuse icons - text alone is often clearer'] },
      { title: 'Accessibility', items: ['Ensure proper focus management', 'Use role="menu" and aria-labels', 'Support keyboard navigation', 'Announce menu state to screen readers'] }
    ]
  },

  Tab: {
    name: 'Tab',
    category: ComponentCategories.NAVIGATION,
    description: 'Tab navigation',
    hasChildren: false,
    props: [
      { name: 'tabCount', type: PropTypes.NUMBER, default: 2, required: false, description: 'Number of tabs (1-20)' },
      { name: 'tabLabels', type: PropTypes.STRING, required: false, description: 'Comma-separated list of tab labels (e.g., "Overview, Details, Settings")' },
      { name: 'activeColor', type: PropTypes.ENUM, options: ['blue', 'green', 'yellow', 'red', 'purple', 'gray'], default: 'blue', required: false },
      { name: 'fullWidth', type: PropTypes.BOOLEAN, default: false, required: false },
      { name: 'customNotes', type: PropTypes.STRING, required: false, description: 'Special considerations or requirements' },
    ],
  },

  NavigationHeader: {
    name: 'NavigationHeader',
    category: ComponentCategories.NAVIGATION,
    description: 'FamilySearch-style header with navigation menus and user actions',
    hasChildren: false,
    props: [
      { name: 'loggedIn', type: PropTypes.BOOLEAN, default: false, required: false, description: 'Whether the user is logged in' },
      { name: 'userName', type: PropTypes.STRING, default: 'User', required: false, description: 'User name for logged-in state' },
      { name: 'userAvatarType', type: PropTypes.ENUM, options: ['photo', 'male', 'female', 'anonymous', 'monogram'], default: 'monogram', required: false, description: 'Avatar type for logged-in state' },
      { name: 'userPhotoSrc', type: PropTypes.STRING, required: false, description: 'Photo URL for avatar (if type is "photo")' },
      { name: 'onNavigate', type: PropTypes.ACTION, required: false, description: 'Action when navigation items are clicked. Item name will be passed as parameter.' },
      { name: 'customNotes', type: PropTypes.STRING, required: false, description: 'Special considerations or requirements' },
    ],
  },

  Footer: {
    name: 'Footer',
    category: ComponentCategories.NAVIGATION,
    description: 'FamilySearch-style footer with site navigation and information',
    hasChildren: false,
    props: [
      { name: 'expanded', type: PropTypes.BOOLEAN, default: true, required: false, description: 'Whether footer is expanded or collapsed' },
      { name: 'onToggle', type: PropTypes.ACTION, required: false, description: 'Action when expand/collapse is toggled. New state will be passed as parameter.' },
      { name: 'onNavigate', type: PropTypes.ACTION, required: false, description: 'Action when navigation items are clicked. Item name will be passed as parameter.' },
      { name: 'customNotes', type: PropTypes.STRING, required: false, description: 'Special considerations or requirements' },
    ],
  },

  // ===== OVERLAYS =====
  Alert: {
    name: 'Alert',
    category: ComponentCategories.OVERLAYS,
    description: 'Alert notification',
    hasChildren: false,
    props: [
      { name: 'status', type: PropTypes.ENUM, options: ['warning', 'help', 'success', 'error'], default: 'warning', required: false },
      { name: 'outline', type: PropTypes.BOOLEAN, default: false, required: false },
      { name: 'dismissible', type: PropTypes.BOOLEAN, default: false, required: false },
      { name: 'dense', type: PropTypes.BOOLEAN, default: false, required: false },
      { name: 'label', type: PropTypes.STRING, required: false, description: 'Alert message' },
      { name: 'customNotes', type: PropTypes.STRING, required: false, description: 'Special considerations or requirements' },
    ],
  },

  AlertBanner: {
    name: 'AlertBanner',
    category: ComponentCategories.OVERLAYS,
    description: 'Alert banner with icon, message, and optional low emphasis action buttons',
    hasChildren: false,
    props: [
      { name: 'type', type: PropTypes.ENUM, options: ['info', 'warning', 'error', 'maintenance', 'custom'], default: 'info', required: false, description: 'Type of alert banner' },
      { name: 'message', type: PropTypes.STRING, required: true, description: 'Alert message text' },
      { name: 'customIcon', type: PropTypes.ENUM, isIcon: true, default: 'NoticeInfo', required: false, showWhen: { type: 'custom' }, description: 'Icon to display for custom type' },
      {
        name: 'customIconBackgroundColor',
        type: PropTypes.ENUM,
        options: [
          // Button Colors (High Emphasis)
          'buttonColors.highBlue',
          'buttonColors.highGreen',
          'buttonColors.highYellow',
          'buttonColors.highRed',
          'buttonColors.highPurple',
          'buttonColors.highDanger',
          'buttonColors.highGray',
          // Gray Scale
          'colors.gray.gray00',
          'colors.gray.gray02',
          'colors.gray.gray03',
          'colors.gray.gray05',
          'colors.gray.gray10',
          'colors.gray.gray20',
          'colors.gray.gray30',
          'colors.gray.gray40',
          'colors.gray.gray50',
          'colors.gray.gray60',
          'colors.gray.gray70',
          'colors.gray.gray80',
          'colors.gray.gray90',
          'colors.gray.gray100',
          // Blue
          'colors.blue.blue00',
          'colors.blue.blue03',
          'colors.blue.blue05',
          'colors.blue.blue10',
          'colors.blue.blue20',
          'colors.blue.blue30',
          'colors.blue.blue40',
          'colors.blue.blue50',
          'colors.blue.blue60',
          'colors.blue.blue70',
          'colors.blue.blue80',
          'colors.blue.blue90',
          // Green
          'colors.green.green02',
          'colors.green.green03',
          'colors.green.green05',
          'colors.green.green10',
          'colors.green.green20',
          'colors.green.green30',
          'colors.green.green40',
          'colors.green.green50',
          'colors.green.green60',
          'colors.green.green70',
          'colors.green.green80',
          'colors.green.green90',
          // Yellow
          'colors.yellow.yellow02',
          'colors.yellow.yellow03',
          'colors.yellow.yellow05',
          'colors.yellow.yellow10',
          'colors.yellow.yellow20',
          'colors.yellow.yellow30',
          'colors.yellow.yellow40',
          'colors.yellow.yellow50',
          'colors.yellow.yellow60',
          'colors.yellow.yellow70',
          'colors.yellow.yellow80',
          'colors.yellow.yellow90',
          // Red
          'colors.red.red02',
          'colors.red.red03',
          'colors.red.red05',
          'colors.red.red10',
          'colors.red.red20',
          'colors.red.red30',
          'colors.red.red40',
          'colors.red.red50',
          'colors.red.red60',
          'colors.red.red70',
          'colors.red.red80',
          'colors.red.red90',
          // Danger
          'colors.danger.danger02',
          'colors.danger.danger03',
          'colors.danger.danger05',
          'colors.danger.danger10',
          'colors.danger.danger20',
          'colors.danger.danger30',
          'colors.danger.danger40',
          'colors.danger.danger50',
          'colors.danger.danger60',
          'colors.danger.danger70',
          'colors.danger.danger80',
          'colors.danger.danger90',
          // Purple
          'colors.purple.purple02',
          'colors.purple.purple03',
          'colors.purple.purple05',
          'colors.purple.purple10',
          'colors.purple.purple20',
          'colors.purple.purple30',
          'colors.purple.purple40',
          'colors.purple.purple50',
          'colors.purple.purple60',
          'colors.purple.purple70',
          'colors.purple.purple80',
          'colors.purple.purple90',
          // Transparent Colors
          'transparentColors.transparentGray02',
          'transparentColors.transparentGray03',
          'transparentColors.transparentGray05',
          'transparentColors.transparentGray10',
          'transparentColors.transparentGray40',
          'transparentColors.transparentGray80',
          'transparentColors.transparentGray90',
          'transparentColors.transparentBlue03',
          'transparentColors.transparentBlue90',
          'transparentColors.transparentGreen03',
          'transparentColors.transparentGreen90',
          'transparentColors.transparentYellow03',
          'transparentColors.transparentYellow40',
          'transparentColors.transparentYellow90',
          'transparentColors.transparentRed03',
          'transparentColors.transparentRed90',
          'transparentColors.transparentDanger03',
          'transparentColors.transparentDanger90',
          'transparentColors.transparentPurple03',
          'transparentColors.transparentPurple90',
          // Custom option
          'custom'
        ],
        default: 'buttonColors.highBlue',
        required: false,
        showWhen: { type: 'custom' },
        description: 'Background color for custom icon - choose from design tokens or use custom hex'
      },
      { name: 'customColorHex', type: PropTypes.STRING, required: false, showWhen: { type: 'custom', customIconBackgroundColor: 'custom' }, description: 'Custom hex color (e.g., #4A90E2) - only shown when custom color is selected' },
      { name: 'primaryButtonLabel', type: PropTypes.STRING, required: false, description: 'Label for primary action button (low emphasis inline blue)' },
      { name: 'onPrimaryClick', type: PropTypes.STRING, required: false, description: 'What happens when primary button is clicked' },
      { name: 'secondaryButtonLabel', type: PropTypes.STRING, required: false, description: 'Label for secondary action button (low emphasis inline blue)' },
      { name: 'onSecondaryClick', type: PropTypes.STRING, required: false, description: 'What happens when secondary button is clicked' },
      { name: 'customNotes', type: PropTypes.STRING, required: false, description: 'Special considerations or requirements' },
    ],
    bestPractices: [
      { title: 'Choose the Right Type', items: ['Info: General announcements, new features, tips', 'Warning: Important non-critical issues (deprecation, quota warnings)', 'Error: Critical issues requiring attention (outage, failed sync)', 'Maintenance: Scheduled downtime, system updates', 'Custom: Specific use cases requiring custom icon/color combination'] },
      { title: 'Message Clarity', items: ['Be concise - one or two sentences maximum', 'Start with the impact: "Your data is not syncing" not "Sync error"', 'Avoid technical jargon unless for technical audience', 'Include what the user should do if action needed'] },
      { title: 'Action Buttons', items: ['Use for actionable alerts only', 'Primary: Main action (Learn More, View Details, Retry)', 'Secondary: Dismissive or alternative action (Dismiss, Later)', 'Limit to 2 buttons maximum', 'Use emphasis="inline" for proper styling'] },
      { title: 'Button Order', items: ['Secondary button appears first (left)', 'Primary button appears second (right)', 'This matches standard dialog button patterns', 'Both buttons use inline emphasis (no background)'] },
      { title: 'Persistence', items: ['Don\'t auto-dismiss critical alerts (error type)', 'Auto-dismiss info alerts after user sees them', 'Allow dismissal for non-critical alerts', 'Remember dismissal state per user/session'] },
      { title: 'Placement', items: ['Place at top of page below header/navigation', 'Use fixed positioning for critical alerts', 'Stack multiple alerts vertically if needed', 'Consider toast notifications for transient messages'] },
      { title: 'Frequency', items: ['Don\'t show the same alert repeatedly', 'Batch related alerts together', 'Use progressive disclosure for multiple issues', 'Respect user dismissals'] },
      { title: 'Accessibility', items: ['Banner is automatically visible (no hidden state)', 'Message is readable by screen readers', 'Buttons are keyboard accessible', 'Use role="alert" for critical messages'] }
    ]
  },

  DialogOverlay: {
    name: 'DialogOverlay',
    category: ComponentCategories.OVERLAYS,
    description: 'Modal dialog overlay',
    hasChildren: true,
    props: [
      { name: 'title', type: PropTypes.STRING, required: false, description: 'Dialog title' },
      { name: 'subtitle', type: PropTypes.STRING, required: false },
      { name: 'closable', type: PropTypes.BOOLEAN, default: true, required: false },
      { name: 'size', type: PropTypes.ENUM, options: ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'], default: 'md', required: false },
      { name: 'primaryButton', type: PropTypes.BOOLEAN, default: true, required: false },
      { name: 'secondaryButton', type: PropTypes.BOOLEAN, default: true, required: false },
      { name: 'leftButton', type: PropTypes.BOOLEAN, default: false, required: false },
      // Button properties will be handled dynamically
      { name: 'primaryButtonLabel', type: PropTypes.STRING, required: false, showWhen: { primaryButton: true } },
      { name: 'secondaryButtonLabel', type: PropTypes.STRING, required: false, showWhen: { secondaryButton: true } },
      { name: 'leftButtonLabel', type: PropTypes.STRING, required: false, showWhen: { leftButton: true } },
      { name: 'customNotes', type: PropTypes.STRING, required: false, description: 'Special considerations or requirements' },
    ],
    bestPractices: [
      { title: 'Dialog Size', items: ['xs: Confirmations, simple alerts (320px)', 'sm: Single field forms, quick edits (480px)', 'md: Standard forms, settings (640px - default)', 'lg: Multi-section forms, data entry (800px)', 'xl/xxl: Complex workflows, multi-step forms', 'Choose smallest size that fits content comfortably'] },
      { title: 'Dialog Title', items: ['Always provide a clear, action-oriented title', 'Use sentence case: "Delete account" not "Delete Account"', 'Keep under 60 characters', 'Title should clearly indicate the purpose'] },
      { title: 'Footer Buttons', items: ['Primary (right): Main action (Save, Delete, Confirm)', 'Secondary (right): Cancel or alternative action', 'Left button: Destructive action (Delete, Remove)', 'Use 1-2 buttons typically, 3 buttons maximum', 'Primary uses high emphasis, others use low'] },
      { title: 'Content Layout', items: ['Keep content focused on one task', 'Use clear section headings if multiple sections', 'Don\'t make users scroll unless necessary', 'Consider multi-step dialogs for complex flows'] },
      { title: 'Focus Management', items: ['Focus moves to dialog on open', 'Focus returns to trigger on close', 'Tab navigation stays within dialog', 'Esc key closes dialog (unless unsaved changes)'] },
      { title: 'Form Validation', items: ['Validate on submit, not while typing', 'Show specific error messages inline', 'Disable primary button until valid (if appropriate)', 'Prevent accidental close with unsaved changes'] },
      { title: 'Async Operations', items: ['Show loading state on buttons during save', 'Disable dialog interactions during operations', 'Keep dialog open to show success message', 'Auto-close after brief success message (optional)'] },
      { title: 'Accessibility', items: ['Set closable={true} to allow Esc to close', 'Ensure all form fields have labels', 'Use proper focus management', 'Screen reader announces dialog open/close'] }
    ]
  },

  FullPageOverlay: {
    name: 'FullPageOverlay',
    category: ComponentCategories.OVERLAYS,
    description: 'Full-page overlay panel',
    hasChildren: true,
    slots: [
      {
        name: SlotTypes.HEADER,
        label: 'Header Buttons',
        description: 'Add IconButton or Button components to the header',
        allowedComponents: ['IconButton', 'Button']
      },
      {
        name: SlotTypes.CONTENT,
        label: 'Content',
        description: 'Main content area of the overlay',
        allowedComponents: null // Allow any component
      }
    ],
    props: [
      { name: 'title', type: PropTypes.STRING, required: false, description: 'Overlay title' },
      { name: 'subtitle', type: PropTypes.STRING, required: false },
      { name: 'breadcrumb', type: PropTypes.BOOLEAN, default: false, required: false },
      { name: 'breadcrumbItems', type: PropTypes.STRING, required: false, showWhen: { breadcrumb: true }, description: 'Comma-separated breadcrumb labels (e.g., "Home, Products")' },

      // Footer Buttons
      { name: 'footerPrimaryButton', type: PropTypes.BOOLEAN, default: true, required: false, description: 'Show primary button in footer (right side)' },
      { name: 'footerPrimaryLabel', type: PropTypes.STRING, required: false, showWhen: { footerPrimaryButton: true } },
      { name: 'footerSecondaryButton', type: PropTypes.BOOLEAN, default: true, required: false, description: 'Show secondary button in footer (right side)' },
      { name: 'footerSecondaryLabel', type: PropTypes.STRING, required: false, showWhen: { footerSecondaryButton: true } },

      { name: 'customNotes', type: PropTypes.STRING, required: false, description: 'Special considerations or requirements' },
    ],
  },

  InfoSheet: {
    name: 'InfoSheet',
    category: ComponentCategories.OVERLAYS,
    description: 'Bottom sheet for information',
    hasChildren: true,
    props: [
      { name: 'size', type: PropTypes.ENUM, options: ['sm', 'md', 'lg'], default: 'md', required: false },
      { name: 'title', type: PropTypes.STRING, required: false, description: 'Sheet title' },
      { name: 'elevated', type: PropTypes.BOOLEAN, default: false, required: false },
      { name: 'subtitle', type: PropTypes.STRING, required: false },
      { name: 'panel', type: PropTypes.BOOLEAN, default: false, required: false },
      { name: 'closable', type: PropTypes.BOOLEAN, default: true, required: false },
      { name: 'dockable', type: PropTypes.BOOLEAN, default: false, required: false },
      { name: 'footer', type: PropTypes.BOOLEAN, default: true, required: false },
      { name: 'primaryButton', type: PropTypes.BOOLEAN, default: true, required: false, showWhen: { footer: true } },
      { name: 'primaryButtonLabel', type: PropTypes.STRING, required: false, showWhen: { footer: true, primaryButton: true } },
      { name: 'secondaryButton', type: PropTypes.BOOLEAN, default: true, required: false, showWhen: { footer: true } },
      { name: 'secondaryButtonLabel', type: PropTypes.STRING, required: false, showWhen: { footer: true, secondaryButton: true } },
      { name: 'customNotes', type: PropTypes.STRING, required: false, description: 'Special considerations or requirements' },
    ],
  },

  HelpTutorial: {
    name: 'HelpTutorial',
    category: ComponentCategories.OVERLAYS,
    description: 'Multi-slide help tutorial with optional introduction - use slot-based HelpTutorialSlide components',
    hasChildren: true,
    slots: [
      {
        name: 'slides',
        label: 'Slides',
        description: 'Add HelpTutorialSlide components for each tutorial slide',
        allowedComponents: ['HelpTutorialSlide'],
        autoAdd: 'HelpTutorialSlide'
      }
    ],
    defaultSlotChildren: {
      slides: [
        {
          id: 'default-title-slide',
          name: 'HelpTutorialSlide',
          props: {
            type: 'title',
            heading: 'Welcome to the Feature',
            paragraph: 'This tutorial will walk you through the key features and help you get started quickly.',
            imageSrc: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="500" height="300"%3E%3Crect width="500" height="300" fill="%234A90E2"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="white"%3EWelcome Image%3C/text%3E%3C/svg%3E'
          },
          slotChildren: {}
        },
        {
          id: 'default-main-slide-1',
          name: 'HelpTutorialSlide',
          props: {
            type: 'main',
            heading: 'Step 1: Getting Started',
            paragraph: 'Begin by clicking on the main navigation menu. You\'ll find all the essential tools and features organized by category.',
            imageSrc: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="500" height="300"%3E%3Crect width="500" height="300" fill="%2350C878"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="white"%3EStep 1%3C/text%3E%3C/svg%3E'
          },
          slotChildren: {}
        },
        {
          id: 'default-main-slide-2',
          name: 'HelpTutorialSlide',
          props: {
            type: 'main',
            heading: 'Step 2: Explore the Dashboard',
            paragraph: 'The dashboard provides an overview of your recent activity and quick access to common actions.',
            imageSrc: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="500" height="300"%3E%3Crect width="500" height="300" fill="%23FFB347"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="white"%3EStep 2%3C/text%3E%3C/svg%3E'
          },
          slotChildren: {}
        },
        {
          id: 'default-end-slide',
          name: 'HelpTutorialSlide',
          props: {
            type: 'end',
            heading: 'You\'re All Set!',
            endTitle: 'Explore Related Topics',
            paragraph: 'Check out these additional resources to learn more.'
          },
          slotChildren: {
            cards: [
              {
                id: 'default-card-1',
                name: 'Card',
                props: {
                  size: 'xxs',
                  variant: 'elevated',
                  image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150"%3E%3Crect width="200" height="150" fill="%239B59B6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="white"%3EAdvanced%3C/text%3E%3C/svg%3E',
                  onClick: 'Open advanced features tutorial'
                },
                children: [
                  {
                    id: 'default-card-1-heading',
                    name: 'HeadingBlock',
                    props: {
                      level: 'h6',
                      heading: 'Advanced Features'
                    }
                  }
                ]
              },
              {
                id: 'default-card-2',
                name: 'Card',
                props: {
                  size: 'xxs',
                  variant: 'elevated',
                  image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150"%3E%3Crect width="200" height="150" fill="%23E74C3C"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="white"%3ECustomize%3C/text%3E%3C/svg%3E',
                  onClick: 'Open customization guide'
                },
                children: [
                  {
                    id: 'default-card-2-heading',
                    name: 'HeadingBlock',
                    props: {
                      level: 'h6',
                      heading: 'Customization Guide'
                    }
                  }
                ]
              }
            ]
          }
        }
      ]
    },
    props: [
      { name: 'title', type: PropTypes.STRING, required: false, description: 'Label for this component in the tree' },
      { name: 'showIntroduction', type: PropTypes.BOOLEAN, default: true, required: false, description: 'Whether to show introduction dialog before tutorial slides' },

      // Introduction slide props
      { name: 'introIcon', type: PropTypes.ENUM, isIcon: true, default: 'PlaceTemple', required: false, showWhen: { showIntroduction: true }, description: 'Icon for introduction slide' },
      { name: 'introHeading', type: PropTypes.STRING, default: 'Welcome to the Tutorial', required: false, showWhen: { showIntroduction: true }, description: 'Heading for introduction slide' },
      { name: 'introSubheading', type: PropTypes.STRING, default: 'Learn the basics in just a few steps', required: false, showWhen: { showIntroduction: true }, description: 'Subheading for introduction slide' },

      { name: 'customNotes', type: PropTypes.STRING, required: false, description: 'Special considerations or requirements' },
    ],
  },

  HelpTutorialSlide: {
    name: 'HelpTutorialSlide',
    category: ComponentCategories.OVERLAYS,
    description: 'Individual slide for HelpTutorial - set type to title/main/end',
    hasChildren: true,
    slots: [
      {
        name: 'cards',
        label: 'Cards',
        description: 'Related content cards (only for end slides)',
        allowedComponents: ['Card'],
        autoAdd: 'Card',
        showWhen: { type: 'end' }
      }
    ],
    props: [
      { name: 'type', type: PropTypes.ENUM, options: ['title', 'main', 'end'], default: 'main', required: false, description: 'Slide type determines heading size and layout' },
      { name: 'imageSrc', type: PropTypes.STRING, required: false, description: 'Image/illustration URL for slide' },
      { name: 'heading', type: PropTypes.STRING, default: 'Tutorial Slide', required: false, description: 'Slide heading (h3 for title, h5 for main/end)' },
      { name: 'paragraph', type: PropTypes.STRING, default: 'This is the tutorial content.', required: false, description: 'Slide paragraph text' },
      { name: 'endTitle', type: PropTypes.STRING, required: false, showWhen: { type: 'end' }, description: 'Optional h4 title for end slide (above cards)' },
      { name: 'customNotes', type: PropTypes.STRING, required: false, description: 'Special considerations or requirements' },
    ],
  },

  QuickGlanceOverlay: {
    name: 'QuickGlanceOverlay',
    category: ComponentCategories.OVERLAYS,
    description: 'Quick glance overlay for contextual info',
    hasChildren: true,
    props: [
      { name: 'title', type: PropTypes.STRING, required: false, description: 'Label for this component in the tree' },
      { name: 'anchorRef', type: PropTypes.STRING, required: false, description: 'What to anchor this overlay to' },
      { name: 'position', type: PropTypes.ENUM, options: ['top', 'bottom', 'left', 'right'], default: 'right', required: false },
      { name: 'horizontalAlign', type: PropTypes.ENUM, options: ['left', 'center', 'right'], default: 'center', required: false, showWhen: { position: ['top', 'bottom'] }, description: 'Horizontal alignment when positioned above or below anchor' },
      { name: 'verticalAlign', type: PropTypes.ENUM, options: ['top', 'center', 'bottom'], default: 'center', required: false, showWhen: { position: ['left', 'right'] }, description: 'Vertical alignment when positioned left or right of anchor' },
      { name: 'offset', type: PropTypes.NUMBER, default: 8, required: false },
      { name: 'width', type: PropTypes.NUMBER, default: 200, required: false },
      { name: 'customNotes', type: PropTypes.STRING, required: false, description: 'Special considerations or requirements' },
    ],
  },

  StatusOverlay: {
    name: 'StatusOverlay',
    category: ComponentCategories.OVERLAYS,
    description: 'Status notification overlay (toast)',
    hasChildren: false,
    props: [
      { name: 'status', type: PropTypes.ENUM, options: ['normal', 'success', 'warning', 'error'], default: 'normal', required: false },
      { name: 'message', type: PropTypes.STRING, required: false, description: 'Status message to display' },
      { name: 'dismissible', type: PropTypes.BOOLEAN, default: false, required: false },
      { name: 'longMessage', type: PropTypes.BOOLEAN, default: false, required: false },
      { name: 'actionLabel', type: PropTypes.BOOLEAN, default: false, required: false },
      { name: 'actionButtonLabel', type: PropTypes.STRING, default: 'Action', required: false, showWhen: { actionLabel: true } },
      { name: 'customNotes', type: PropTypes.STRING, required: false, description: 'Special considerations or requirements' },
    ],
  },

  TooltipOverlay: {
    name: 'TooltipOverlay',
    category: ComponentCategories.OVERLAYS,
    description: 'Tooltip for additional information',
    hasChildren: false,
    props: [
      { name: 'position', type: PropTypes.ENUM, options: ['top', 'bottom', 'left', 'right'], default: 'top', required: false },
      { name: 'horizontalAlign', type: PropTypes.ENUM, options: ['left', 'center', 'right'], default: 'center', required: false, showWhen: { position: ['top', 'bottom'] }, description: 'Horizontal alignment when positioned above or below anchor' },
      { name: 'verticalAlign', type: PropTypes.ENUM, options: ['top', 'center', 'bottom'], default: 'center', required: false, showWhen: { position: ['left', 'right'] }, description: 'Vertical alignment when positioned left or right of anchor' },
      { name: 'offset', type: PropTypes.NUMBER, default: 8, required: false, description: 'Distance from anchor in pixels' },
      { name: 'message', type: PropTypes.STRING, required: false, description: 'Tooltip message' },
      { name: 'customNotes', type: PropTypes.STRING, required: false, description: 'Special considerations or requirements' },
    ],
  },

  // ===== COMPOSITE =====
  CustomComponent: {
    name: 'CustomComponent',
    category: ComponentCategories.COMPOSITE,
    description: 'Custom component placeholder',
    hasChildren: true,
    props: [
      { name: 'title', type: PropTypes.STRING, required: false, description: 'Label for this component in the tree' },
      { name: 'details', type: PropTypes.STRING, required: false, description: 'Detailed description of this custom component, its behavior, and appearance' },
      { name: 'save', type: PropTypes.BOOLEAN, default: true, required: false, description: 'Save to personal component library?' },
      { name: 'customNotes', type: PropTypes.STRING, required: false, description: 'Special considerations or requirements' },
    ],
  },

  // ===== TEST UI =====
  TestRecordingControls: {
    name: 'TestRecordingControls',
    category: ComponentCategories.TEST_UI,
    description: 'Test recording controls with countdown, recording indicator, and expand/collapse toggle',
    hasChildren: false,
    props: [
      { name: 'isRecording', type: PropTypes.BOOLEAN, default: false, required: false, description: 'Whether screen recording is active' },
      { name: 'startTime', type: PropTypes.NUMBER, default: Date.now(), required: false, description: 'Timestamp when test started (for countdown)' },
      { name: 'isExpanded', type: PropTypes.BOOLEAN, default: true, required: false, description: 'Whether instructions panel is expanded' },
      { name: 'onToggleExpand', type: PropTypes.STRING, required: false, description: 'Callback when expand/collapse is clicked' },
      { name: 'disableToggle', type: PropTypes.BOOLEAN, default: false, required: false, description: 'Whether to disable the expand/collapse button. Should be TRUE when showing recording, recordingRequired, scenario, or thankYou overlays.' },
      { name: 'customNotes', type: PropTypes.STRING, required: false, description: 'Special considerations or requirements' },
    ],
  },

  TestInstructionOverlay: {
    name: 'TestInstructionOverlay',
    category: ComponentCategories.TEST_UI,
    description: 'Instruction overlay for displaying tasks, questions, scenarios, recording alerts, or thank you messages with automatic button text and scrim behavior. When showing recording, recordingRequired, scenario, or thankYou types, set TestRecordingControls disableToggle={true}. Use the exported shouldDisableCollapseToggle() helper function to coordinate.',
    hasChildren: false,
    props: [
      { name: 'type', type: PropTypes.ENUM, options: ['recording', 'recordingRequired', 'scenario', 'task', 'question', 'thankYou'], default: 'task', required: false, description: 'Type of content being displayed. Recording shows default permission text at start. RecordingRequired shows when user accidentally stops screen sharing. Thank You hides the button. For recording/recordingRequired/scenario/thankYou types, disable the TestRecordingControls collapse toggle.' },
      { name: 'currentStep', type: PropTypes.NUMBER, required: false, description: 'Current step number (for task/question)', showWhen: { type: ['task', 'question'] } },
      { name: 'totalSteps', type: PropTypes.NUMBER, required: false, description: 'Total number of steps (for task/question)', showWhen: { type: ['task', 'question'] } },
      { name: 'isLastQuestion', type: PropTypes.BOOLEAN, default: false, required: false, description: 'Whether this is the last question (changes button to "Finish")', showWhen: { type: 'question' } },
      { name: 'taskBegun', type: PropTypes.BOOLEAN, default: false, required: false, description: 'Whether the task has been started (changes button to "I\'m Done" and removes scrim)', showWhen: { type: 'task' } },
      { name: 'content', type: PropTypes.STRING, required: false, description: 'The instruction/scenario/task/question text. Recording type has default content.' },
      { name: 'customButtonText', type: PropTypes.STRING, required: false, description: 'Optional custom button text override (otherwise auto-determined by type)' },
      { name: 'showScrim', type: PropTypes.BOOLEAN, default: true, required: false, description: 'Whether to show the dark scrim overlay behind this component' },
      { name: 'onButtonClick', type: PropTypes.STRING, required: false, description: 'Callback when button is clicked' },
      { name: 'customNotes', type: PropTypes.STRING, required: false, description: 'Special considerations or requirements' },
    ],
  },

  OpenTextQuestion: {
    name: 'OpenTextQuestion',
    category: ComponentCategories.TEST_UI,
    description: 'Open-ended text input question for user tests',
    hasChildren: false,
    props: [
      { name: 'questionText', type: PropTypes.STRING, default: 'Your question here', required: true, description: 'The question to ask the user' },
      { name: 'placeholder', type: PropTypes.STRING, default: 'Type your answer here...', required: false, description: 'Placeholder text for the input' },
      { name: 'value', type: PropTypes.STRING, default: '', required: false, description: 'Current value of the input' },
      { name: 'onChange', type: PropTypes.STRING, required: false, description: 'Callback when value changes' },
      { name: 'required', type: PropTypes.BOOLEAN, default: false, required: false, description: 'Whether the question is required' },
      { name: 'maxLength', type: PropTypes.NUMBER, required: false, description: 'Maximum character length' },
      { name: 'multiline', type: PropTypes.BOOLEAN, default: true, required: false, description: 'Whether to show a textarea (true) or single-line input (false)' },
      { name: 'customNotes', type: PropTypes.STRING, required: false, description: 'Special considerations or requirements' },
    ],
  },

  OpinionScaleQuestion: {
    name: 'OpinionScaleQuestion',
    category: ComponentCategories.TEST_UI,
    description: 'Opinion scale (Likert scale) question for user tests',
    hasChildren: false,
    props: [
      { name: 'questionText', type: PropTypes.STRING, default: 'Your question here', required: true, description: 'The question to ask the user' },
      { name: 'scaleMin', type: PropTypes.NUMBER, default: 1, required: false, description: 'Minimum scale value' },
      { name: 'scaleMax', type: PropTypes.NUMBER, default: 5, required: false, description: 'Maximum scale value' },
      { name: 'minLabel', type: PropTypes.STRING, default: 'Strongly Disagree', required: false, description: 'Label for minimum value' },
      { name: 'maxLabel', type: PropTypes.STRING, default: 'Strongly Agree', required: false, description: 'Label for maximum value' },
      { name: 'value', type: PropTypes.NUMBER, required: false, description: 'Currently selected value' },
      { name: 'onChange', type: PropTypes.STRING, required: false, description: 'Callback when value changes' },
      { name: 'required', type: PropTypes.BOOLEAN, default: false, required: false, description: 'Whether the question is required' },
      { name: 'customNotes', type: PropTypes.STRING, required: false, description: 'Special considerations or requirements' },
    ],
  },

  MultipleChoiceQuestion: {
    name: 'MultipleChoiceQuestion',
    category: ComponentCategories.TEST_UI,
    description: 'Multiple choice question with radio buttons or checkboxes for user tests',
    hasChildren: false,
    props: [
      { name: 'questionText', type: PropTypes.STRING, default: 'Your question here', required: true, description: 'The question to ask the user' },
      { name: 'options', type: PropTypes.STRING, default: 'Option 1, Option 2, Option 3', required: true, description: 'Comma-separated list of options' },
      { name: 'value', type: PropTypes.STRING, default: '', required: false, description: 'Currently selected option(s) - string for single, array for multi' },
      { name: 'onChange', type: PropTypes.STRING, required: false, description: 'Callback when selection changes' },
      { name: 'required', type: PropTypes.BOOLEAN, default: false, required: false, description: 'Whether the question is required' },
      { name: 'multiSelect', type: PropTypes.BOOLEAN, default: false, required: false, description: 'Whether to allow multiple selections (uses checkboxes instead of radio buttons)' },
      { name: 'allowOther', type: PropTypes.BOOLEAN, default: false, required: false, description: 'Whether to show an "Other" option with text input' },
      { name: 'customNotes', type: PropTypes.STRING, required: false, description: 'Special considerations or requirements' },
    ],
  },
};

/**
 * Helper functions
 */
export function getAllComponentNames() {
  return Object.keys(COMPONENT_METADATA);
}

export function getComponentsByCategory(category) {
  return Object.entries(COMPONENT_METADATA)
    .filter(([_, metadata]) => metadata.category === category)
    .map(([name, metadata]) => ({ name, ...metadata }));
}

export function getComponentMetadata(componentName) {
  return COMPONENT_METADATA[componentName] || null;
}

export function getAllCategories() {
  return Object.values(ComponentCategories);
}

export function componentHasChildren(componentName) {
  const metadata = getComponentMetadata(componentName);
  return metadata ? metadata.hasChildren : false;
}

export function getActionProps(componentName) {
  const metadata = getComponentMetadata(componentName);
  if (!metadata) return [];
  return metadata.props.filter(prop => prop.acceptsAction);
}

# Changelog

All notable changes that have been pushed to the production repository (`user-test-hub-package`) are documented here.

## [2026-01-20] - Complete Icon Registry with All 258 Icons

### Fixed
- **Icon Picker now shows all 258 icons** from ux-zion-library (previously only ~100)
- Missing icons like `DocumentRecordPerson`, `EventBirth`, `PersonFamily` now available
- Icons are properly categorized into 18 groups for easier browsing

### Added
- **generate-icon-registry.js** - Script to auto-generate icon registry from library
- All icon categories: Activities, Content, Controls, Discovery, Documents, Events, General, Help, Logos, Media, Menus, Navigation, Notices, People, Places, Social, Things, Trees

### Technical Details
**Files Modified:**
- `src/lib/iconRegistry.js` - Complete registry with all 258 icons, auto-generated
- `generate-icon-registry.js` - New script to regenerate registry when icons change

**Category Breakdown:**
- Controls: 28 icons
- Content: 25 icons
- Documents: 24 icons (includes DocumentRecordPerson, DocumentRecordSearch, etc.)
- Places: 22 icons
- Things: 20 icons
- Media: 18 icons
- Social: 18 icons
- Events: 16 icons (includes EventBirth, EventMarriage, EventCensus, etc.)
- General: 16 icons
- Navigation: 13 icons
- Notices: 13 icons
- People: 9 icons
- Activities: 8 icons
- Help: 8 icons
- Menus: 8 icons
- Discovery: 6 icons
- Trees: 4 icons
- Logos: 2 icons

To regenerate icon registry when new icons are added to ux-zion-library:
```bash
node generate-icon-registry.js
```

---

## [2026-01-20] - HelpTutorial Slot-Based Architecture (BREAKING CHANGE)

### Changed - HelpTutorial Component (BREAKING)
- **Complete architectural refactoring** from prop-based to slot-based system
- **New HelpTutorialSlide component** - Individual slides are now separate components
- **Removed props:** `heading`, `paragraph`, `imageSrc`, `endTitle`, `showRelatedCards`, `relatedCards`, `totalSlides`, `type` (type is now internal)
- **Added props:** `showIntroduction` (boolean) controls whether introduction dialog is available
- **Slot architecture:** Tutorial now uses `slides` slot containing HelpTutorialSlide components
- **Default sample slides:** ComponentShowcase now displays 4 sample slides (1 title, 2 main, 1 end with cards) with SVG placeholder images
- **Fixed:** Set `hasChildren: true` for both HelpTutorial and HelpTutorialSlide so slot buttons appear in prototype builder

### Added - HelpTutorialSlide Component (NEW)
- Individual slide component for building tutorials
- **Props:** `type` ('title' | 'main' | 'end'), `imageSrc`, `heading`, `paragraph`, `endTitle`
- **Nested `cards` slot** - End slides can contain multiple Card components for related content (only shows when type='end')
- **Type-based rendering:**
  - Title slides: h3 heading, md paragraph
  - Main slides: h5 heading, sm paragraph
  - End slides: h5 heading in header, optional h4 endTitle, cards grid or paragraph
- Each slide independently configures its own content
- **Auto-add:** Clicking "Add Slides" automatically adds HelpTutorialSlide, clicking "Add Cards" automatically adds Card (no palette needed)

### Added - Card onClick Support
- Card component now accepts `onClick` prop for interactive click handling
- **Interactive features:**
  - Pointer cursor when clickable
  - Hover lift effect (2px translateY)
  - Enhanced shadow on hover for elevated variant
  - Smooth transitions
- Updated metadata with onClick property (PropTypes.STRING, description-based)
- ComponentShowcase logs click descriptions: `Card clicked: [description]`

### Migration Guide

**Old approach (prop-based):**
```javascript
<HelpTutorial
  type="title"
  heading="Welcome"
  paragraph="Get started..."
  imageSrc="/image.jpg"
  currentSlide={1}
  totalSlides={3}
/>
```

**New approach (slot-based):**
```javascript
<HelpTutorial showIntroduction={true}>
  <HelpTutorialSlide
    type="title"
    heading="Welcome"
    paragraph="Get started..."
    imageSrc="/image.jpg"
  />
  <HelpTutorialSlide type="main" heading="Step 1" paragraph="..." />
  <HelpTutorialSlide type="end" heading="Complete!">
    <Card size="xxs" variant="elevated" onClick="Open tutorial 1">
      <HeadingBlock level="h6" heading="Related Topic" />
    </Card>
  </HelpTutorialSlide>
</HelpTutorial>
```

**Note:** The `type` prop on HelpTutorial has been removed - it's now controlled internally (starts as 'introduction' if showIntroduction=true, switches to 'slides' when opened).

### Technical Details

**Files Added:**
- `ux-zion-library/src/components/HelpTutorialSlide.jsx` - New slide component (95 lines)

**Files Modified:**
- `ux-zion-library/src/components/HelpTutorial.jsx` - Refactored to use slot children
- `ux-zion-library/src/components/Card.jsx` - Added onClick support with hover effects
- `src/lib/componentLoader.js` - Added HelpTutorialSlide import
- `src/lib/componentMetadata.js` - Updated metadata for both components with slots, added defaultSlotChildren with 4 sample slides, removed title prop from HelpTutorialSlide, added showWhen to cards slot, added autoAdd to both slots
- `src/pages/ComponentShowcase.jsx` - Updated navigation handlers, HelpTutorialExample renders card children, initializes defaultSlotChildren
- `src/components/prototypeBuilder/PropertyEditor.jsx` - Added showWhen support for slots (cards slot only shows when type='end')
- `CHANGELOG.md` - This entry

**New Architecture Benefits:**
- Unlimited slides - designers add as many as needed
- Per-slide configuration - each slide has independent properties
- Type flexibility - designers can have multiple title/end slides if desired
- Cards are real components - full Card API including onClick, all props
- Consistent with FullPageOverlay/ImageViewer slot patterns
- Cleaner prop structure - no complex conditional showWhen logic

**Breaking Changes:**
Existing HelpTutorial instances will need complete rebuild using new slot architecture. No automatic migration available.

---

## [2026-01-20] - Paginator Component and ComponentShowcase Improvements

### Added
- **Paginator component** - New navigation component for data tables with pagination controls
  - Left side: "Results Per Page" selector (10, 20, 50, 100, optional "All")
  - Right side: Previous/Next buttons, page input field, and page count display
  - Props: `currentPage`, `totalPages`, `resultsPerPage`, `showAll`, `hideResultsPerPage`, `dense`
  - Interactive callbacks: `onPageChange`, `onResultsPerPageChange`
  - Proper disabled states for navigation buttons on first/last pages
  - Uses IconButton with BackwardArrowCaret and ForwardArrowCaret icons

### Changed
- **ComponentShowcase layout** - Reordered cards for better user experience
  - Preview card now appears first (before Properties card)
  - Proper spacing between Preview and Properties cards using Tailwind's `space-y-8`
- **Paginator category** - Moved from CONTENT to NAVIGATION category for better organization

### Technical Details

**Files Added:**
- `ux-zion-library/src/components/Paginator.jsx` - New pagination component (189 lines)

**Files Modified:**
- `src/lib/componentLoader.js` - Added Paginator dynamic import
- `src/lib/componentMetadata.js` - Added Paginator metadata with all props, moved to NAVIGATION category
- `src/pages/ComponentShowcase.jsx` - Swapped Preview/Properties order, added Paginator interactive handlers

**Component Usage:**
```javascript
<Paginator
  currentPage={1}
  totalPages={15}
  resultsPerPage={10}
  showAll={false}
  hideResultsPerPage={false}
  dense={false}
  onPageChange={(page) => setCurrentPage(page)}
  onResultsPerPageChange={(value) => setResultsPerPage(value)}
/>
```

## [2026-01-20] - DataTable Dynamic Slot-Based Columns

### Changed
- **DataTable component** completely refactored to use slot-based column system
- **Replaced** text-based `columns` prop with dynamic slot architecture similar to FullPageOverlay and ImageViewer
- Each column is now a slot that accepts component templates
- One component per column = template repeated for all rows in that column

### Added
- **columnCount property** (NUMBER, default: 3) - Number of columns to display
- **rowCount property** (NUMBER, default: 3) - Number of data rows to generate
- **columnHeaders property** (STRING) - Comma-separated column headers (e.g., "Name, Email, Role")
- **gap property** (ENUM) - Horizontal spacing between columns using spacing tokens
- **rowGap property** (ENUM) - Vertical spacing between rows using spacing tokens
- **showHeaderDivider property** (BOOLEAN, default: true) - Toggle divider below header
- **showRowDividers property** (BOOLEAN, default: true) - Toggle dividers between rows
- **Dynamic slot button generation** in PropertyEditor - buttons appear based on columnCount
- **Component filtering** - Only 14 table-compatible components allowed in column slots

### Allowed Components in Table Cells
Avatar, Button, Checkbox, Chips, DataBlock, Icon, IconButton, ListItem, Paragraph, Radio, Select, Tag, TextField, Toggle

### Removed
- **Old columns prop** (text description) - replaced with slot-based system
- **data prop** - no longer needed, rows generated from rowCount
- **renderCell prop** - replaced with component template approach
- **"Allowed:" text display** - component palette filters instead

### Technical Details

**Files Modified:**
- `src/lib/componentMetadata.js` - Added `hasDynamicSlots: true` flag and `slotTemplate` definition
- `ux-zion-library/src/components/DataTable.jsx` - Complete refactor to slot-based rendering
- `src/components/prototypeBuilder/PropertyEditor.jsx` - Added dynamic slot button generation for DataTable

**Architecture:**
```javascript
// Designer workflow:
1. Set columnCount: 3
2. Set columnHeaders: "Name, Email, Actions"
3. PropertyEditor shows: "Add Name Component", "Add Email Component", "Add Actions Component"
4. Add ONE Button to "Actions" column
5. Set rowCount: 5
6. Result: 5 rows with Button in every "Actions" cell
```

**Component Template System:**
- Column slot contains ONE component that serves as template
- Template component is cloned for each row with unique keys
- Empty columns display placeholder "-" in gray
- Uses `React.cloneElement()` to prevent key conflicts

**Metadata Structure:**
```javascript
DataTable: {
  hasChildren: true,
  hasDynamicSlots: true,
  slotTemplate: {
    allowedComponents: ['Avatar', 'Button', 'Checkbox', ...],
  },
  props: [columnCount, rowCount, columnHeaders, gap, rowGap, ...]
}
```

### Benefits
- **Consistent architecture** with FullPageOverlay and ImageViewer slot patterns
- **Designer flexibility** - Add any interactive component to table cells
- **Component palette filtering** - Only shows valid components for table cells
- **Dynamic columns** - No fixed column limit, generate buttons based on count
- **Visual spacing control** - Gap and rowGap properties use spacing tokens
- **Clean UI** - Column headers appear in button labels

### Breaking Changes
This is a breaking change from the old text-based columns system. Existing DataTable instances will need to be recreated using the new slot-based approach.

---

## [2026-01-15] - Automated Image Asset Handling

### Added
- **Image path collection** - System now automatically detects all image references in prototype specs
- **Claude instructions** - Test specs now include detailed instructions for copying image files and updating paths
- **Multi-prop detection** - Scans common image props: `images`, `src`, `image`, `imageSrc`, `thumbnailSrc`, `backgroundImage`
- **Comma-separated support** - Handles ImageViewer's comma-separated image lists

### How It Works
1. Designer adds images to `public/` directory and references filename in component properties
2. System collects all image paths from prototype spec (traversing regular and slot children)
3. Generated test spec includes instructions for Claude to:
   - Create test-specific directory: `public/test-images/[test-id]/`
   - Copy image files from `public/` to new directory
   - Update all image paths in component code to use full paths: `/test-images/[test-id]/filename.jpg`
4. Each test gets isolated image directory to prevent conflicts

### Technical Details
**Files Modified:**
- `src/lib/testSpecGenerator.js` - Added `collectImagePaths()` function and image instructions section

**New Function:**
```javascript
collectImagePaths(components)
- Recursively traverses component tree (children + slotChildren)
- Extracts image file paths from component props
- Handles comma-separated paths
- Returns array of unique image paths
```

**Generated Spec Additions:**
- "Image Assets" section with copy instructions
- File list showing source → destination paths
- Example code showing correct path format
- Critical warnings about required file operations

### Benefits
- Eliminates manual image path management
- Each test has isolated image directory (no conflicts)
- Clear instructions for Claude reduce errors
- Supports all image props across component library
- Works with both regular and slot children

---

## [2026-01-15] - ImageViewer Slot-Based Control System

### Changed - ImageViewer Component
- **Replaced** boolean `zoomPanControls` prop with slot-based children system
- **Added** `showPageCounter` boolean prop to control page counter visibility in top left
- **Added** `controls` slot for zoom/pan controls in upper right corner
  - Auto-adds ZoomPanControl component when clicking "Add Controls" button
  - Only accepts ZoomPanControl components
- Designers now have full control over individual control properties

### Fixed - Core Slot Support
- **Fixed** `findComponentById` to search slot children (was preventing selection of slot components)
- **Fixed** `updateComponentById` to update components in slots
- **Fixed** `deleteComponentById` to delete from slots
- **Fixed** `flattenComponents` to traverse slot children
- **Fixed** PropertyEditor to use default values when checking `showWhen` conditions
- **Fixed** ComponentTree child count to include slot children
- **Fixed** auto-expand behavior for parents with slot children
- **Fixed** auto-add feature to pass parentId/slotName directly (avoiding async state issues)
- **Hidden** generic add child button for slot-only components

### Technical Details
**Files Modified:**
- `src/lib/componentMetadata.js` - Updated ImageViewer metadata with slots definition
- `ux-zion-library/src/components/ImageViewer.jsx` - Render controls from slotChildren prop
- `src/lib/prototypeSpec.js` - All helper functions now support slotChildren
- `src/components/prototypeBuilder/PropertyEditor.jsx` - Use defaults for showWhen, pass autoAdd
- `src/components/prototypeBuilder/PrototypeBuilderModal.jsx` - Fixed auto-add async issue
- `src/components/prototypeBuilder/ComponentTree.jsx` - Fixed count, expand, hide add button

### Benefits
- Consistent slot architecture across FullPageOverlay and ImageViewer
- Designers control individual control properties instead of generic booleans
- Cleaner, more intuitive prototype builder UI
- Prevents adding incompatible components to restricted slots

---

## [2026-01-15] - Critical Setup Wizard Fixes

### Fixed
- **SQL schema mismatch** - Setup wizard now creates correct `test_configurations` and `custom_components` tables instead of outdated `tests` table
- **Database schema alignment** - Wizard SQL now matches production schema with all required columns and indexes
- **Missing table errors** - Resolves "Could not find table 'test_configurations'" errors for new setups

### Changed - Setup Wizard SQL
- Updated Step 4 database setup SQL to include:
  - `test_configurations` table (replaces old `tests` table)
  - `custom_components` table for saved component library
  - All missing columns: `spec_file_path`, `config_hash`, `current_round`, `recording_error`, etc.
  - Proper RLS policies for all tables
  - Trigger functions for auto-updating timestamps

### Technical Details
**Files Modified:**
- `src/components/SetupWizard.jsx` - Updated embedded SQL in Step 4 to match migrations-combined.sql

### Impact
- New users will no longer see "table not found" errors after setup
- Eliminates need to manually run additional migration SQL
- Ensures database schema consistency between setup wizard and app code

---

## [2026-01-15] - Simplified .env Setup Process

### Changed
- **Removed download button approach** - Too many browser compatibility issues (env.txt vs .env, macOS Finder restrictions)
- **Simplified to copy/paste flow** - Clear 8-step VSCode-only instructions
- **Single workflow** - No more platform-specific workarounds or renaming instructions

### Technical Details
**Files Modified:**
- `src/components/SetupWizard.jsx` - Replaced download UI with simple copy textarea
- `SETUP.md` - Updated instructions to match new copy/paste flow
- `.gitignore` - Added env.txt to prevent accidental commits

### Benefits
- Consistent experience across all platforms
- No browser filename quirks
- Works entirely within VSCode (no Finder/terminal needed)
- Clearer, more straightforward instructions

---

## [2026-01-15] - Slot-Based Component Children System

### Added
- **Slot-based architecture** for components that need specific child placement areas
- `SlotTypes` constant in metadata system (HEADER, CONTENT, CONTROLS, COLUMNS)

### Changed - FullPageOverlay
- **Replaced** `iconButtonCount`, `lowEmphasisCount`, `headerPrimaryButton` props with slot-based children
- **Added** two slots:
  - `header` slot - Accepts IconButton and Button components only
  - `content` slot - Accepts any component
- PropertyEditor now shows separate "Add Header Buttons" and "Add Content" buttons
- ComponentPalette filters to show only allowed components for each slot
- ComponentTree displays slot children with labeled sections ("HEADER", "CONTENT")
- Empty categories are now hidden in component palette

### Technical Details
**Files Modified:**
- `src/lib/componentMetadata.js` - Added SlotTypes and slots definition
- `ux-zion-library/src/components/FullPageOverlay.jsx` - Updated to render from slotChildren prop
- `src/components/prototypeBuilder/PropertyEditor.jsx` - Multiple Add buttons per slot
- `src/components/prototypeBuilder/PrototypeBuilderModal.jsx` - Store children in slotChildren object
- `src/components/prototypeBuilder/ComponentPalette.jsx` - Filter by allowedComponents, hide empty categories
- `src/components/prototypeBuilder/ComponentTree.jsx` - Display slot children with labels
- `src/lib/testSpecGenerator.js` - Document slot structure in specs

### Benefits
- Designers have full control over individual button properties (emphasis, color, icons, etc.)
- No more guessing which numbered button is which
- Prevents adding incompatible components to restricted slots
- Cleaner, more intuitive prototype builder UI

---

## Template for Future Entries

```markdown
## [YYYY-MM-DD] - Feature Name

### Added
- List new features

### Changed
- List modifications to existing features

### Fixed
- List bug fixes

### Removed
- List removed features

### Technical Details
**Files Modified:**
- path/to/file.js - Description

**Commit Hash:** [hash]
```

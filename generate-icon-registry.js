/**
 * Generate Icon Registry
 *
 * Automatically generates iconRegistry.js with all available icons from ux-zion-library
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read all icon files
const iconsDir = path.join(__dirname, 'ux-zion-library/src/icons');
const iconFiles = fs.readdirSync(iconsDir)
  .filter(file => file.endsWith('.jsx'))
  .map(file => file.replace('.jsx', ''))
  .sort();

console.log(`Found ${iconFiles.length} icons`);

// Categorize icons based on prefix
function categorizeIcon(iconName) {
  if (iconName.startsWith('Activity')) return 'Activities';
  if (iconName.startsWith('Content')) return 'Content';
  if (iconName.startsWith('Control')) return 'Controls';
  if (iconName.startsWith('Discovery')) return 'Discovery';
  if (iconName.startsWith('Document')) return 'Documents';
  if (iconName.startsWith('Event')) return 'Events';
  if (iconName.startsWith('Help')) return 'Help';
  if (iconName.startsWith('Logo')) return 'Logos';
  if (iconName.startsWith('Media')) return 'Media';
  if (iconName.startsWith('Menu')) return 'Menus';
  if (iconName.startsWith('Notice')) return 'Notices';
  if (iconName.startsWith('Person')) return 'People';
  if (iconName.startsWith('Place')) return 'Places';
  if (iconName.startsWith('Social')) return 'Social';
  if (iconName.startsWith('Thing')) return 'Things';
  if (iconName.startsWith('Tree')) return 'Trees';
  if (iconName.includes('Arrow')) return 'Navigation';

  return 'General';
}

// Convert camelCase to Title Case with spaces
function toTitleCase(str) {
  return str
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Generate icon entries
const iconEntries = [
  "  // None option\n  { value: 'none', label: 'None', category: 'None' },\n"
];

iconFiles.forEach(iconName => {
  const category = categorizeIcon(iconName);
  const label = toTitleCase(iconName);
  iconEntries.push(`  { value: '${iconName}', label: '${label}', category: '${category}' },`);
});

// Generate the file content
const fileContent = `/**
 * Icon Registry
 *
 * Registry of all available Zion UI icons for use in the prototype builder.
 * Auto-generated from ux-zion-library/src/icons
 *
 * Total icons: ${iconFiles.length}
 *
 * To regenerate: node generate-icon-registry.js
 */

// All ${iconFiles.length} icons from Zion UI library
export const ICON_REGISTRY = [
${iconEntries.join('\n')}
];

/**
 * Get all icon options organized by category
 */
export function getIconsByCategory() {
  const categories = {};

  ICON_REGISTRY.forEach(icon => {
    if (!categories[icon.category]) {
      categories[icon.category] = [];
    }
    categories[icon.category].push(icon);
  });

  return categories;
}

/**
 * Get all icons as flat array
 */
export function getAllIcons() {
  return ICON_REGISTRY;
}

/**
 * Find icon by value
 */
export function findIcon(value) {
  return ICON_REGISTRY.find(icon => icon.value === value);
}

/**
 * Get icon categories
 */
export function getIconCategories() {
  const categories = new Set();
  ICON_REGISTRY.forEach(icon => categories.add(icon.category));
  return Array.from(categories);
}
`;

// Write the file
const outputPath = path.join(__dirname, 'src/lib/iconRegistry.js');
fs.writeFileSync(outputPath, fileContent);

console.log(`✅ Generated ${outputPath}`);
console.log(`   Total icons: ${iconFiles.length}`);

// Show breakdown by category
const categoryCount = {};
iconFiles.forEach(icon => {
  const cat = categorizeIcon(icon);
  categoryCount[cat] = (categoryCount[cat] || 0) + 1;
});

console.log('\nIcons by category:');
Object.entries(categoryCount)
  .sort((a, b) => b[1] - a[1])
  .forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count}`);
  });

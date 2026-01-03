/**
 * New Tabinator - Build Script
 * 
 * Simple build script using Bun's native APIs.
 * Copies source files to dist/ for Chrome Web Store upload.
 * 
 * Usage: bun run build.js
 */

import { mkdir, rm, copyFile, exists } from 'fs/promises';
import { join } from 'path';

const ROOT = import.meta.dir;
const DIST = join(ROOT, 'dist');
const SRC = join(ROOT, 'src');

/**
 * Files to copy to dist/ root
 */
const ROOT_FILES = [
  'manifest.json'
];

/**
 * Source files to copy (will be flattened to dist/ root)
 */
const SRC_FILES = [
  'newtab.html',
  'newtab.css',
  'newtab.js'
];

/**
 * Cleans and recreates the dist directory
 */
async function cleanDist() {
  console.log('🧹 Cleaning dist/...');
  
  if (await exists(DIST)) {
    await rm(DIST, { recursive: true });
  }
  
  await mkdir(DIST, { recursive: true });
  await mkdir(join(DIST, 'icons'), { recursive: true });
}

/**
 * Copies files to dist
 */
async function copyFiles() {
  console.log('📦 Copying files...');
  
  // Copy root files
  for (const file of ROOT_FILES) {
    const src = join(ROOT, file);
    const dest = join(DIST, file);
    await copyFile(src, dest);
    console.log(`   ✓ ${file}`);
  }
  
  // Copy source files (flattened to dist root)
  for (const file of SRC_FILES) {
    const src = join(SRC, file);
    const dest = join(DIST, file);
    await copyFile(src, dest);
    console.log(`   ✓ src/${file} → ${file}`);
  }
  
  // Copy icons if they exist
  const iconsDir = join(ROOT, 'icons');
  if (await exists(iconsDir)) {
    const iconSizes = ['icon16.png', 'icon48.png', 'icon128.png'];
    for (const icon of iconSizes) {
      const src = join(iconsDir, icon);
      if (await exists(src)) {
        const dest = join(DIST, 'icons', icon);
        await copyFile(src, dest);
        console.log(`   ✓ icons/${icon}`);
      }
    }
  } else {
    console.log('   ⚠ No icons/ folder found (optional)');
  }
}

/**
 * Main build function
 */
async function build() {
  console.log('\n🚀 Building New Tabinator...\n');
  
  const start = performance.now();
  
  await cleanDist();
  await copyFiles();
  
  const elapsed = (performance.now() - start).toFixed(0);
  
  console.log(`\n✅ Build complete in ${elapsed}ms`);
  console.log('📁 Output: dist/');
  console.log('\nTo install in Chrome:');
  console.log('  1. Open chrome://extensions/');
  console.log('  2. Enable "Developer mode"');
  console.log('  3. Click "Load unpacked"');
  console.log('  4. Select the dist/ folder\n');
}

// Run build
build().catch((err) => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});

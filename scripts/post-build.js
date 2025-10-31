// Post-build script to copy static files to dist folder
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '../dist');
const srcDir = path.join(__dirname, '../src');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy manifest.json
fs.copyFileSync(
  path.join(srcDir, 'manifest.json'),
  path.join(distDir, 'manifest.json')
);
console.log('✓ Copied manifest.json');

// Copy popup.html
fs.copyFileSync(
  path.join(srcDir, 'popup.html'),
  path.join(distDir, 'popup.html')
);
console.log('✓ Copied popup.html');

// Copy icons folder if it exists
const iconsDir = path.join(srcDir, 'icons');
const distIconsDir = path.join(distDir, 'icons');

if (fs.existsSync(iconsDir)) {
  if (!fs.existsSync(distIconsDir)) {
    fs.mkdirSync(distIconsDir, { recursive: true });
  }
  
  const files = fs.readdirSync(iconsDir);
  files.forEach(file => {
    fs.copyFileSync(
      path.join(iconsDir, file),
      path.join(distIconsDir, file)
    );
  });
  console.log('✓ Copied icons');
} else {
  console.log('⚠ Icons folder not found - create placeholder icons');
}

console.log('\n✓ Build completed successfully!');


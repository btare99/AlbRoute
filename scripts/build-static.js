const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const appDir = path.join(__dirname, '..', 'app');
const apiDir = path.join(appDir, 'api');
const tempApiDir = path.join(__dirname, '..', 'node_modules', 'api-backup');
const nextDir = path.join(__dirname, '..', '.next');

console.log('--- Static Build Helper ---');

// Clean .next cache folder to avoid type validation errors on moved api files
if (fs.existsSync(nextDir)) {
  console.log('Cleaning .next cache directory...');
  fs.rmSync(nextDir, { recursive: true, force: true });
}

let moved = false;
try {
  if (fs.existsSync(apiDir)) {
    console.log('Temporarily moving app/api to app-api-backup...');
    fs.renameSync(apiDir, tempApiDir);
    moved = true;
  }

  console.log('Running next build...');
  execSync('next build', { stdio: 'inherit' });
  console.log('Build completed successfully.');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exitCode = 1;
} finally {
  if (moved && fs.existsSync(tempApiDir)) {
    console.log('Restoring app/api from app-api-backup...');
    fs.renameSync(tempApiDir, apiDir);
  }
}

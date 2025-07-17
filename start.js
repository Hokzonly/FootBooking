import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting backend...');
console.log('Current directory:', process.cwd());

const backendPath = path.join(__dirname, 'backend');
console.log('Backend path:', backendPath);

const child = spawn('npm', ['start'], {
  cwd: backendPath,
  stdio: 'inherit',
  shell: true
});

child.on('error', (error) => {
  console.error('Failed to start backend:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  console.log('Backend exited with code:', code);
  process.exit(code);
}); 
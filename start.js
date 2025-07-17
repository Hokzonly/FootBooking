import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting backend...');
console.log('Current directory:', process.cwd());

const backendPath = path.join(__dirname, 'backend');
console.log('Backend path:', backendPath);

// First, install dependencies
console.log('Installing backend dependencies...');
const installChild = spawn('npm', ['install'], {
  cwd: backendPath,
  stdio: 'inherit',
  shell: true
});

installChild.on('error', (error) => {
  console.error('Failed to install dependencies:', error);
  process.exit(1);
});

installChild.on('exit', (code) => {
  if (code !== 0) {
    console.error('Install failed with code:', code);
    process.exit(code);
  }
  
  console.log('Dependencies installed, building backend...');
  
  // Then, build the backend
  const buildChild = spawn('npm', ['run', 'build'], {
    cwd: backendPath,
    stdio: 'inherit',
    shell: true
  });

  buildChild.on('error', (error) => {
    console.error('Failed to build backend:', error);
    process.exit(1);
  });

  buildChild.on('exit', (code) => {
    if (code !== 0) {
      console.error('Build failed with code:', code);
      process.exit(code);
    }
    
    console.log('Build successful, starting backend...');
    
    // Finally, start the backend
    const startChild = spawn('npm', ['start'], {
      cwd: backendPath,
      stdio: 'inherit',
      shell: true
    });

    startChild.on('error', (error) => {
      console.error('Failed to start backend:', error);
      process.exit(1);
    });

    startChild.on('exit', (code) => {
      console.log('Backend exited with code:', code);
      process.exit(code);
    });
  });
}); 
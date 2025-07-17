import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting backend...');
console.log('Current directory:', process.cwd());

const backendPath = path.join(__dirname, 'backend');
console.log('Backend path:', backendPath);

// Pass all environment variables to child processes
const env = { ...process.env };

// First, install dependencies
console.log('Installing backend dependencies...');
const installChild = spawn('npm', ['install'], {
  cwd: backendPath,
  stdio: 'inherit',
  shell: true,
  env
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
  
  console.log('Dependencies installed, setting up database...');
  
  // Then, run database migrations
  const migrateChild = spawn('npx', ['prisma', 'migrate', 'deploy'], {
    cwd: backendPath,
    stdio: 'inherit',
    shell: true,
    env
  });

  migrateChild.on('error', (error) => {
    console.error('Failed to run migrations:', error);
    process.exit(1);
  });

  migrateChild.on('exit', (code) => {
    if (code !== 0) {
      console.error('Migration failed with code:', code);
      console.log('Skipping migrations and continuing with build...');
      
      // Continue with build even if migrations fail
      console.log('Building backend...');
      
      const buildChild = spawn('npm', ['run', 'build'], {
        cwd: backendPath,
        stdio: 'inherit',
        shell: true,
        env
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
        
        const startChild = spawn('npm', ['start'], {
          cwd: backendPath,
          stdio: 'inherit',
          shell: true,
          env
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
      return;
    }
    
    console.log('Database migrations completed, building backend...');
    
    // Then, build the backend
    const buildChild = spawn('npm', ['run', 'build'], {
      cwd: backendPath,
      stdio: 'inherit',
      shell: true,
      env
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
        shell: true,
        env
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
}); 
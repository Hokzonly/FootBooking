import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backendPath = path.join(__dirname, 'backend');
const env = { ...process.env };

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
      console.log('Migration failed, continuing with build...');
      
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
    
    const seedChild = spawn('npm', ['run', 'seed'], {
      cwd: backendPath,
      stdio: 'inherit',
      shell: true,
      env
    });

    seedChild.on('error', (error) => {
      console.error('Failed to seed database:', error);
      process.exit(1);
    });

    seedChild.on('exit', (code) => {
      if (code !== 0) {
        console.log('Seed failed, continuing with build...');
      }
      
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
}); 
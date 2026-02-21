import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const projectId = process.env.VITE_FIREBASE_PROJECT_ID || '';
const apiKey = process.env.VITE_FIREBASE_API_KEY || '';
const appId = process.env.VITE_FIREBASE_APP_ID || '';

const envContent = `export const environment = {
  production: false,
  firebase: {
    apiKey: '${apiKey}',
    authDomain: '${projectId}.firebaseapp.com',
    projectId: '${projectId}',
    storageBucket: '${projectId}.firebasestorage.app',
    appId: '${appId}',
  },
};
`;

const envPath = path.join(process.cwd(), 'src', 'environments', 'environment.ts');
fs.mkdirSync(path.dirname(envPath), { recursive: true });
fs.writeFileSync(envPath, envContent);
console.log('Environment file generated with Firebase config.');

const ngBin = path.join(process.cwd(), 'node_modules', '.bin', 'ng');
const ngServe = spawn(
  ngBin,
  ['serve', '--host', '0.0.0.0', '--port', '5000', '--disable-host-check', '--configuration', 'development'],
  {
    stdio: 'inherit',
    env: { ...process.env, NG_CLI_ANALYTICS: 'false' },
    cwd: process.cwd(),
  }
);

ngServe.on('error', (err) => {
  console.error('Failed to start Angular dev server:', err);
  process.exit(1);
});

ngServe.on('close', (code) => {
  process.exit(code ?? 0);
});

process.on('SIGINT', () => ngServe.kill('SIGINT'));
process.on('SIGTERM', () => ngServe.kill('SIGTERM'));

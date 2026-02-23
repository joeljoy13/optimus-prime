const { spawn } = require('child_process');

const electronBinary = require('electron');
const env = { ...process.env, NODE_ENV: 'development', VITE_DEV_SERVER_URL: 'http://localhost:5173' };
delete env.ELECTRON_RUN_AS_NODE;

const child = spawn(electronBinary, ['.'], {
  stdio: 'inherit',
  env
});

child.on('error', (error) => {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});

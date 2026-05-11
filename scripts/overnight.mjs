import { spawn } from 'node:child_process';

const commands = [
  ['npm', ['run', 'check']],
  ['npm', ['run', 'test:e2e:all']],
  ['npm', ['run', 'test:a11y']],
  ['npm', ['run', 'analyze']],
];

if (process.env.SNYK_TOKEN) {
  commands.push(['npm', ['run', 'snyk']], ['npm', ['run', 'snyk:code']]);
} else {
  console.log('[overnight] SNYK_TOKEN is not set; skipping Snyk dependency and code scans.');
}

for (const [command, args] of commands) {
  await run(command, args);
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const commandLine = `${command} ${args.join(' ')}`;
    console.log(`[overnight] $ ${commandLine}`);
    const child = spawn(commandLine, {
      cwd: process.cwd(),
      env: process.env,
      shell: true,
      stdio: 'inherit',
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${commandLine} exited with code ${code}`));
      }
    });
  });
}

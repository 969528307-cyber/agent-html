// @ts-nocheck
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import mdx from '@astrojs/mdx';
import { defineConfig } from 'astro/config';

const siteRoot = fileURLToPath(new URL('.', import.meta.url));

const readJsonBody = (request) =>
  new Promise((resolve, reject) => {
    let body = '';
    request.on('data', (chunk) => {
      body += chunk;
    });
    request.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    request.on('error', reject);
  });

const runNpmScript = (script, candidateId, extraArgs = []) =>
  new Promise((resolve, reject) => {
    const child = spawn('npm', ['run', script, '--', candidateId, ...extraArgs], {
      cwd: siteRoot,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(stderr || stdout || `${script} failed with exit code ${code}`));
      }
    });
  });

const localCandidateActions = () => ({
  name: 'local-candidate-actions',
  hooks: {
    'astro:server:setup': ({ server }) => {
      server.middlewares.use('/internal-api/publish-candidate', async (request, response) => {
        response.setHeader('Content-Type', 'application/json');

        if (request.method !== 'POST') {
          response.statusCode = 405;
          response.end(JSON.stringify({ ok: false, error: 'Use POST.' }));
          return;
        }

        try {
          const body = await readJsonBody(request);
          const candidateId = String(body.candidateId || '').trim();

          if (!/^candidate-[a-z0-9-]+$/.test(candidateId)) {
            response.statusCode = 400;
            response.end(JSON.stringify({ ok: false, error: 'Invalid candidate id.' }));
            return;
          }

          const preflight = await runNpmScript('publish:candidate', candidateId, ['--preflight']);
          const approve = await runNpmScript('approve:candidate', candidateId);
          const publish = await runNpmScript('publish:candidate', candidateId);
          response.end(JSON.stringify({ ok: true, preflight, approve, publish }));
        } catch (error) {
          response.statusCode = 500;
          response.end(JSON.stringify({ ok: false, error: error.message }));
        }
      });
    },
  },
});

// https://astro.build/config
export default defineConfig({
  integrations: [mdx(), localCandidateActions()],
});

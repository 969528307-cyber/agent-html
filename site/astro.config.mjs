// @ts-nocheck
import crypto from 'node:crypto';
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import mdx from '@astrojs/mdx';
import { defineConfig } from 'astro/config';
import {
  getInternalPassword,
  INTERNAL_AUTH_COOKIE,
  INTERNAL_CSRF_COOKIE,
  isAuthenticated,
  isAuthFreePath,
  isCsrfValid,
  isInternalRequestPath,
  safeNextPath,
} from './scripts/internal-auth.mjs';

const siteRoot = fileURLToPath(new URL('.', import.meta.url));
const internalSessionToken = crypto.randomBytes(32).toString('hex');
const internalCsrfToken = crypto.randomBytes(32).toString('hex');

const loadLocalEnv = () => {
  const envPath = new URL('.env.local', import.meta.url);
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const index = trimmed.indexOf('=');
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, '');
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
};

loadLocalEnv();

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

const readFormOrJsonBody = async (request) => {
  const body = await readJsonBodyAsText(request);
  const contentType = request.headers['content-type'] || '';

  if (contentType.includes('application/json')) {
    return body ? JSON.parse(body) : {};
  }

  return Object.fromEntries(new URLSearchParams(body));
};

const readJsonBodyAsText = (request) =>
  new Promise((resolve, reject) => {
    let body = '';
    request.on('data', (chunk) => {
      body += chunk;
    });
    request.on('end', () => resolve(body));
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
    let settled = false;
    const timeout = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill('SIGTERM');
      reject(new Error(`${script} timed out.`));
    }, 120000);

    const finish = (callback) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      callback();
    };

    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    child.on('error', (error) => finish(() => reject(error)));
    child.on('close', (code) => {
      finish(() => {
        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          reject(new Error(stderr || stdout || `${script} failed with exit code ${code}`));
        }
      });
    });
  });

const localCandidateActions = () => ({
  name: 'local-candidate-actions',
  hooks: {
    'astro:server:setup': ({ server }) => {
      server.middlewares.use(async (request, response, next) => {
        const url = new URL(request.url || '/', 'http://127.0.0.1');
        const pathname = url.pathname;

        if (pathname === '/item/internal') {
          response.statusCode = 302;
          response.setHeader('Location', '/internal');
          response.end();
          return;
        }

        if (pathname === '/internal-auth/login') {
          if (request.method !== 'POST') {
            response.statusCode = 405;
            response.end('Use POST.');
            return;
          }

          try {
            const body = await readFormOrJsonBody(request);
            const password = String(body.password || '');
            const nextPath = safeNextPath(String(body.next || '/internal'));
            const configuredPassword = getInternalPassword();

            if (!configuredPassword) {
              response.statusCode = 500;
              response.setHeader('Content-Type', 'application/json');
              response.end(JSON.stringify({ ok: false, error: 'Set INTERNAL_AUTH_PASSWORD in .env.local before using internal login.' }));
              return;
            }

            if (password !== configuredPassword) {
              response.statusCode = 401;
              response.setHeader('Content-Type', 'application/json');
              response.end(JSON.stringify({ ok: false, error: 'Wrong password.' }));
              return;
            }

            response.statusCode = 200;
            response.setHeader('Content-Type', 'application/json');
            response.setHeader(
              'Set-Cookie',
              [
                `${INTERNAL_AUTH_COOKIE}=${encodeURIComponent(internalSessionToken)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`,
                `${INTERNAL_CSRF_COOKIE}=${encodeURIComponent(internalCsrfToken)}; Path=/; SameSite=Lax; Max-Age=604800`,
              ]
            );
            response.end(JSON.stringify({ ok: true, next: nextPath }));
          } catch (error) {
            response.statusCode = 400;
            response.setHeader('Content-Type', 'application/json');
            response.end(JSON.stringify({ ok: false, error: error.message || 'Login failed.' }));
          }
          return;
        }

        if (pathname === '/internal-auth/logout') {
          response.statusCode = 302;
          response.setHeader('Set-Cookie', [
            `${INTERNAL_AUTH_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
            `${INTERNAL_CSRF_COOKIE}=; Path=/; SameSite=Lax; Max-Age=0`,
          ]);
          response.setHeader('Location', '/internal/login');
          response.end();
          return;
        }

        if (isInternalRequestPath(pathname) && !isAuthFreePath(pathname)) {
          const loggedIn = isAuthenticated({
            cookieHeader: request.headers.cookie || '',
            sessionToken: internalSessionToken,
          });

          if (!loggedIn) {
            if (pathname.startsWith('/internal-api/')) {
              response.statusCode = 401;
              response.setHeader('Content-Type', 'application/json');
              response.end(JSON.stringify({ ok: false, error: 'Login required.' }));
              return;
            }

            response.statusCode = 302;
            response.setHeader('Location', `/internal/login?next=${encodeURIComponent(pathname)}`);
            response.end();
            return;
          }
        }

        next();
      });

      server.middlewares.use('/internal-api/publish-candidate', async (request, response) => {
        response.setHeader('Content-Type', 'application/json');

        if (request.method !== 'POST') {
          response.statusCode = 405;
          response.end(JSON.stringify({ ok: false, error: 'Use POST.' }));
          return;
        }

        try {
          if (!isCsrfValid({ cookieHeader: request.headers.cookie || '', csrfHeader: request.headers['x-csrf-token'] || '' })) {
            response.statusCode = 403;
            response.end(JSON.stringify({ ok: false, error: 'Invalid CSRF token.' }));
            return;
          }

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

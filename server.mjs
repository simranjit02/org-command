// AI Employees command center. Zero dependencies: node command-center/server.mjs
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const ORG = path.resolve(here, 'org');
const PORT = Number(process.env.PORT) || 4747;

const read = (p) => { try { return fs.readFileSync(p, 'utf8'); } catch { return null; } };
const slugs = () => fs.readdirSync(ORG).filter((d) => fs.existsSync(path.join(ORG, d, 'employee.json')));

function scheduleRows(md) {
  return (md || '').split('\n')
    .filter((l) => /^\|\s*`[a-z0-9-]+`\s*\|/.test(l))
    .map((l) => l.split('|').slice(1, -1).map((c) => c.trim().replace(/`/g, '')))
    .filter((c) => c.length === 8)
    .map(([routine, days, fire, , , , budget, browser]) => ({ routine, days, fire, budget, browser }));
}

function runlog(text) {
  return (text || '').split('\n').filter(Boolean).flatMap((l) => { try { return [JSON.parse(l)]; } catch { return []; } })
    .sort((a, b) => String(b.start).localeCompare(String(a.start)));
}

function employee(slug) {
  const dir = path.join(ORG, slug);
  const meta = JSON.parse(read(path.join(dir, 'employee.json')));
  // Installed = the install run wrote its state folder; until then show the kit's sample output.
  const installed = fs.existsSync(path.join(dir, 'state'));
  const live = (f) => read(path.join(dir, f));
  const brief = live('brief-latest.md');
  const log = live('runlog.jsonl');
  return {
    slug, name: meta.name, role: meta.role, version: meta.version, installed,
    hasDashboard: fs.existsSync(path.join(dir, 'dashboard/index.html')),
    sample: !brief,
    schedule: scheduleRows(live('SCHEDULE.md')),
    brief: brief ?? live('examples/brief-latest.md') ?? '',
    runlog: runlog(log ?? live('examples/runlog.jsonl')).slice(0, 25),
  };
}

function hire(slug, name) {
  const dir = path.join(ORG, slug);
  const cmd = `cd ${JSON.stringify(dir)} && claude ${JSON.stringify(`Install the ${name} from this folder.`)}`;
  const script = `tell application "Terminal"\nactivate\ndo script ${JSON.stringify(cmd)}\nend tell`;
  return new Promise((res, rej) => execFile('osascript', ['-e', script], (e) => (e ? rej(e) : res())));
}

const send = (res, code, body, type = 'application/json') => {
  res.writeHead(code, { 'content-type': type });
  res.end(type === 'application/json' ? JSON.stringify(body) : body);
};

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  try {
    if (req.method === 'GET' && url.pathname === '/') return send(res, 200, read(path.join(here, 'index.html')), 'text/html; charset=utf-8');
    if (req.method === 'GET' && url.pathname === '/api/org') return send(res, 200, slugs().map(employee));
    const m = url.pathname.match(/^\/(api\/hire|dashboard)\/([a-z0-9-]+)$/);
    // Slug must be one of the installed folders: it ends up in a shell command and a file path.
    if (m && !slugs().includes(m[2])) return send(res, 404, { error: 'unknown employee' });
    if (req.method === 'POST' && m?.[1] === 'api/hire') {
      await hire(m[2], employee(m[2]).name);
      return send(res, 200, { ok: true });
    }
    if (req.method === 'GET' && m?.[1] === 'dashboard') {
      const html = read(path.join(ORG, m[2], 'dashboard/index.html'));
      return html ? send(res, 200, html, 'text/html; charset=utf-8') : send(res, 404, { error: 'not built yet' });
    }
    send(res, 404, { error: 'not found' });
  } catch (e) {
    send(res, 500, { error: e.message });
  }
}).listen(PORT, '127.0.0.1', () => console.log(`Command center: http://localhost:${PORT}`));

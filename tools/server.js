/*
 * 로컬 서버: 생성기를 http://localhost:8765 로 띄우고, 화면의 "빌드" 버튼과 자동 빌드를 맡는다.
 *
 *   start.bat 더블클릭  (또는 node tools/server.js)
 *
 * - parts 폴더의 SVG 를 저장하면 자동으로 빌드하고, 열려 있는 생성기 화면을 새로 고친다.
 * - 화면의 "빌드" 버튼은 같은 일을 바로 한 번 한다.
 * - 이 컴퓨터(127.0.0.1)에서만 접속된다. 따로 설치할 것은 없다 (Node.js 만 있으면 된다).
 */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const net = require('net');

const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT) || 8765;
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json; charset=utf-8', '.md': 'text/plain; charset=utf-8'
};

const clients = new Set();
let building = null, again = false, last = { ok: true, output: '', at: null };

function broadcast(msg) {
  const data = 'data: ' + JSON.stringify(msg) + '\n\n';
  for (const res of clients) res.write(data);
}

function build() {
  if (building) { again = true; return building; }
  building = new Promise((resolve) => {
    execFile(process.execPath, [path.join(ROOT, 'tools', 'build.js')], { cwd: ROOT }, (err, stdout, stderr) => {
      last = { ok: !err, output: (stdout + (stderr || '')).trim(), at: new Date().toLocaleTimeString('ko-KR') };
      console.log('[' + last.at + '] 빌드 ' + (last.ok ? '완료' : '실패') + '\n' + last.output + '\n');
      broadcast({ type: 'built', ok: last.ok, output: last.output, at: last.at });
      building = null;
      if (again) { again = false; build(); }
      resolve(last);
    });
  });
  return building;
}

// parts 폴더 감시: 저장이 몰려도 한 번만 빌드한다
let timer = null;
try {
  fs.watch(path.join(ROOT, 'parts'), { recursive: true }, (ev, name) => {
    if (!name || !/\.(svg|json)$/i.test(name)) return;
    clearTimeout(timer);
    timer = setTimeout(build, 400);
  });
} catch (e) {
  console.log('폴더 감시를 켜지 못했습니다. 빌드 버튼은 그대로 쓸 수 있습니다. (' + e.message + ')');
}

// ---------------------------------------------------------------- 항목 편집
const PARTS = path.join(ROOT, 'parts');
const DATA_ONLY = { iris: 1, lash: 1, fold: 1, lowline: 1, lowlash: 1, eyeGap: 1, eyeY: 1, eyeSize: 1, mouthY: 1 };
const ID_RE = /^[A-Za-z0-9_-]+$/;
const OPEN_RE = /^[\p{L}\p{N}_ -]+$/u;

function catDir(cat) {
  if (!ID_RE.test(cat || '') || cat.charAt(0) === '_') throw new Error('항목 이름이 올바르지 않습니다');
  const dir = path.join(PARTS, cat);
  if (!fs.existsSync(dir)) throw new Error('parts/' + cat + ' 폴더가 없습니다');
  return dir;
}
function readEntries(cat) {
  const f = path.join(catDir(cat), '_parts.json');
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : [];
}
function writeEntries(cat, list) {
  const text = '[\n' + list.map((e) => '  ' + JSON.stringify(e)).join(',\n') + '\n]\n';
  fs.writeFileSync(path.join(catDir(cat), '_parts.json'), text, 'utf8');
}
function svgPath(cat, id) {
  if (!ID_RE.test(id || '')) throw new Error('파일 이름은 영문, 숫자, -, _ 만 쓸 수 있습니다');
  return path.join(catDir(cat), id + '.svg');
}
// VectorCraft 가 제어 포트(--control 7979)를 켜고 실행 중이면 그 창에 연다.
// 제어 포트를 켠 VectorCraft 는 다른 곳에서 연 파일을 넘겨받지 못해서, 그냥 실행하면 매번 새 창이 뜬다.
// file.open 은 새 탭으로 열고, 이미 열린 파일이면 그 탭으로 옮겨 간다.
const VC_PORT = Number(process.env.VECTORCRAFT_CONTROL_PORT) || 7979;
function openInVectorCraft(file) {
  return new Promise((resolve) => {
    const sock = net.connect(VC_PORT, '127.0.0.1');
    let buf = '', done = false;
    const finish = (ok) => { if (done) return; done = true; sock.destroy(); resolve(ok); };
    sock.setTimeout(3000, () => finish(false));
    sock.on('error', () => finish(false));
    sock.on('connect', () => sock.write(JSON.stringify({ id: 1, method: 'command', params: { id: 'file.open', params: { path: file } } }) + '\n'));
    sock.on('data', (d) => {
      buf += d;
      const nl = buf.indexOf('\n');
      if (nl < 0) return;
      try { finish(!!JSON.parse(buf.slice(0, nl)).ok); } catch (e) { finish(false); }
    });
  });
}
async function openWith(target) {
  if (/\.svg$/i.test(target) && await openInVectorCraft(target)) return 'vectorcraft';
  // 윈도우 기본 프로그램으로 연다 (SVG 는 연결된 편집기, 폴더는 탐색기)
  execFile('cmd', ['/c', 'start', '""', target], { windowsHide: true });
  return 'start';
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let s = '';
    req.on('data', (c) => { s += c; if (s.length > 1e6) req.destroy(); });
    req.on('end', () => { try { resolve(s ? JSON.parse(s) : null); } catch (e) { reject(new Error('잘못된 요청입니다')); } });
  });
}

async function handleApi(url, q, req) {
  const cat = q.get('cat'), id = q.get('id');
  if (url === '/api/list' && req.method === 'GET') {
    const files = fs.readdirSync(catDir(cat)).filter((f) => /\.svg$/i.test(f) && f[0] !== '_').map((f) => f.replace(/\.svg$/i, ''));
    return { entries: readEntries(cat), files: files, dataOnly: !!DATA_ONLY[cat] };
  }
  if (req.method !== 'POST') throw new Error('지원하지 않는 요청입니다');

  if (url === '/api/list') {
    const list = await readBody(req);
    if (!Array.isArray(list)) throw new Error('목록 형식이 아닙니다');
    const seen = new Set();
    list.forEach((e) => {
      if (!e || !ID_RE.test(e.id || '') || seen.has(e.id)) throw new Error('id 가 비었거나 겹칩니다: ' + (e && e.id));
      seen.add(e.id);
      if (typeof e.name !== 'string' || !e.name.trim()) e.name = e.id;
      if (e.w != null && !(Number(e.w) >= 0)) throw new Error(e.name + ': 비중은 0 이상 숫자여야 합니다');
    });
    writeEntries(cat, list);
    build();
    return { ok: true };
  }
  if (url === '/api/remove') {
    const list = readEntries(cat), e = list.find((x) => x.id === id);
    if (!e) throw new Error('목록에 없는 항목입니다');
    const file = svgPath(cat, id);
    if (fs.existsSync(file)) {
      // 바로 지우지 않고 parts/_trash 로 옮긴다
      const trash = path.join(PARTS, '_trash', cat);
      fs.mkdirSync(trash, { recursive: true });
      const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
      fs.renameSync(file, path.join(trash, id + '-' + stamp + '.svg'));
    }
    writeEntries(cat, list.filter((x) => x.id !== id));
    build();
    return { ok: true };
  }
  if (url === '/api/copy') {
    const src = svgPath(cat, id);
    if (!fs.existsSync(src)) throw new Error(id + '.svg 가 없습니다');
    const list = readEntries(cat);
    let n = 2, nid;
    do { nid = id + '-' + n++; } while (fs.existsSync(svgPath(cat, nid)) || list.some((x) => x.id === nid));
    fs.copyFileSync(src, svgPath(cat, nid));
    const i = list.findIndex((x) => x.id === id), base = list[i] || { name: id };
    const entry = { id: nid, name: base.name + ' 사본' };
    if (base.w != null) entry.w = base.w;
    list.splice(i + 1, 0, entry);
    writeEntries(cat, list);
    build();
    return { ok: true, id: nid };
  }
  if (url === '/api/open') {
    if (!id) { openWith(catDir(cat)); return { ok: true }; }
    // 열기만 할 때는 한글·띄어쓰기 파일 이름도 받는다 (경로 문자와 cmd 특수문자는 막는다)
    if (!OPEN_RE.test(id)) throw new Error('열 수 없는 파일 이름입니다: ' + id);
    const f = path.join(catDir(cat), id + '.svg');
    if (fs.existsSync(f)) { const how = await openWith(f); return { ok: true, opened: cat + '/' + id + '.svg' + (how === 'vectorcraft' ? ' (VectorCraft 창)' : '') }; }
    // 화면의 "파일" 버튼: 수치만 있는 항목은 그 폴더의 _parts.json 을 연다
    if (q.get('fallback')) {
      const entry = readEntries(cat).find((x) => x.id === id);
      if (DATA_ONLY[cat] || (entry && entry.empty)) { openWith(path.join(catDir(cat), '_parts.json')); return { ok: true, opened: cat + '/_parts.json' }; }
      throw new Error('"' + id + '" 은(는) 그림 파일이 없는 항목입니다 (없음 등)');
    }
    throw new Error(id + '.svg 가 없습니다');
  }
  throw new Error('없는 요청입니다');
}

http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  const q = new URLSearchParams(req.url.split('?')[1] || '');

  // 4×4 샘플 PNG 를 samples 폴더에 저장한다 (본문 = PNG 그대로)
  if (url === '/api/sample' && req.method === 'POST') {
    const name = q.get('name') || '';
    const done = (code, r) => { res.writeHead(code, { 'Content-Type': TYPES['.json'] }); res.end(JSON.stringify(r)); };
    if (!/^[A-Za-z0-9._-]+\.png$/.test(name)) { done(400, { error: '파일 이름이 올바르지 않습니다' }); return; }
    const chunks = []; let size = 0;
    req.on('data', (c) => { size += c.length; if (size > 4e7) req.destroy(); else chunks.push(c); });
    req.on('end', () => {
      try {
        const dir = path.join(ROOT, 'samples');
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, name), Buffer.concat(chunks));
        done(200, { saved: 'samples/' + name });
      } catch (e) { done(400, { error: e.message }); }
    });
    return;
  }

  if (url.indexOf('/api/') === 0 && url !== '/api/build' && url !== '/api/events') {
    handleApi(url, q, req).then(
      (r) => { res.writeHead(200, { 'Content-Type': TYPES['.json'] }); res.end(JSON.stringify(r)); },
      (e) => { res.writeHead(400, { 'Content-Type': TYPES['.json'] }); res.end(JSON.stringify({ error: e.message })); }
    );
    return;
  }

  if (url === '/api/build' && req.method === 'POST') {
    build().then((r) => { res.writeHead(200, { 'Content-Type': TYPES['.json'] }); res.end(JSON.stringify(r)); });
    return;
  }
  if (url === '/api/events') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    res.write('data: {"type":"hello"}\n\n');
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }

  let file = path.normalize(path.join(ROOT, url === '/' ? 'index.html' : url));
  if (file !== ROOT && !file.startsWith(ROOT + path.sep)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end('없음'); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(data);
  });
}).listen(PORT, '127.0.0.1', () => {
  console.log('생성기: http://localhost:' + PORT + '   (끄려면 이 창을 닫으세요)\n');
  build();
});

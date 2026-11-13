/*
 * 파츠 빌드: parts/ 폴더의 SVG 파일을 읽어 js/parts-data.js 로 묶는다.
 *
 *   node tools/build.js      (또는 build.bat 더블클릭)
 *
 * 하는 일
 * 1. parts/<항목>/_parts.json 의 순서대로 <id>.svg 를 읽는다. 목록에 없는 SVG 는 맨 뒤에 자동으로 붙인다.
 * 2. SVG 안에서 이름(id)이 붙은 그룹을 조각으로 꺼낸다.
 *      half           왼쪽 절반만 그린 것. 생성기가 좌우 반전해서 양쪽에 그린다.
 *      full           그린 그대로 한 번만 그린다. (이름 없는 나머지 그림도 full 로 들어간다)
 *      <레이어>-half / <레이어>-full   다른 레이어에 놓을 조각 (예: hairBack-half)
 *      white, lines   눈: 흰자 모양 / 눈꺼풀 선
 *      upper, lower   속눈썹: 위 / 아래
 *      fill, cap, tuck, edge   기본머리(base/hair.svg)
 *    이름이 "_" 로 시작하는 것(_guide, _mirror-...)과 <image> 는 편집용이라 버린다.
 * 3. 기준 색을 색 변수로 바꾼다 (아래 COLORS). 그 밖의 색은 그대로 둔다.
 * 4. 편집할 때 밑에 깔아 볼 가이드 그림을 parts/_guide/ 에 다시 만든다.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const PARTS = path.join(ROOT, 'parts');
const OUT = path.join(ROOT, 'js', 'parts-data.js');

// 엔진의 경로 계산(flatten)을 빌드에서도 쓴다
const ENGINE = (() => {
  const ctx = {}; ctx.window = ctx; vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', 'core.js'), 'utf8'), ctx, { filename: 'core.js' });
  return ctx.CG;
})();

/*
 * 면으로 된 선 모양의 가운데 선을 구한다.
 * 모양 윤곽을 가장 왼쪽 점과 가장 오른쪽 점에서 위·아래 두 줄로 나눈 뒤, 두 줄의 같은 위치끼리 평균을 낸다.
 */
function centerline(d) {
  let p = ENGINE.flatten(d);
  if (p.length > 2 && Math.hypot(p[0][0] - p[p.length - 1][0], p[0][1] - p[p.length - 1][1]) < 0.01) p = p.slice(0, -1);
  if (p.length < 4) return d;
  let lo = 0, hi = 0;
  p.forEach((q, i) => { if (q[0] < p[lo][0]) lo = i; if (q[0] > p[hi][0]) hi = i; });
  const chain = (step) => { const out = [p[lo]]; let i = lo; while (i !== hi) { i = (i + step + p.length) % p.length; out.push(p[i]); } return out; };
  const N = 30;
  const even = (c) => {
    if (c.length < 2) return Array.from({ length: N }, () => c[0]);
    const len = [0];
    for (let i = 1; i < c.length; i++) len.push(len[i - 1] + Math.hypot(c[i][0] - c[i - 1][0], c[i][1] - c[i - 1][1]));
    const total = len[len.length - 1] || 1, out = []; let j = 1;
    for (let k = 0; k < N; k++) {
      const s = total * k / (N - 1);
      while (j < c.length - 1 && len[j] < s) j++;
      const t = (s - len[j - 1]) / ((len[j] - len[j - 1]) || 1);
      out.push([c[j - 1][0] + (c[j][0] - c[j - 1][0]) * t, c[j - 1][1] + (c[j][1] - c[j - 1][1]) * t]);
    }
    return out;
  };
  const a = even(chain(1)), b = even(chain(-1));
  let mid = a.map((q, k) => [(q[0] + b[k][0]) / 2, (q[1] + b[k][1]) / 2]);
  // 윤곽 점 간격이 고르지 않아 생기는 들쭉날쭉함을 펴 준다 (양 끝점은 그대로)
  for (let it = 0; it < 6; it++) mid = mid.map((q, k) => (k === 0 || k === mid.length - 1 ? q : [(mid[k - 1][0] + 2 * q[0] + mid[k + 1][0]) / 4, (mid[k - 1][1] + 2 * q[1] + mid[k + 1][1]) / 4]));
  const r = (v) => Math.round(v * 10) / 10;
  return 'M' + mid.map((q) => r(q[0]) + ' ' + r(q[1])).join(' L');
}

// 이 색으로 칠한 곳은 생성기에서 고른 색으로 바뀐다
const COLORS = {
  '#5d4e48': '--hair', '#2b201d': '--hair-line',
  '#fdeeea': '--skin', '#b46352': '--skin-line',
  '#1e1a1a': '--lash', '#8b8284': '--lid-low',
  '#f3bfb8': '--blush', '#d99a8f': '--blush-line',
  '#dc6450': '--lip', '#b98a88': '--nose', '#6f3a30': '--mole',
  '#7e5647': '--eye', '#3d2a22': '--eye-ring', '#1e1412': '--pupil',
  '#d8433b': '--acc', '#6f2420': '--acc-line',
  '#3a3336': '--glass', '#f9f2f1': '--cloth', '#e9a6a0': '--aegyo'
};

const LAYERS = ['hairBack', 'body', 'hairMid', 'hairBase', 'ear', 'face', 'skin', 'makeup', 'skinTop', 'mouth', 'eye',
  'hairLine', 'hairFront', 'hairSide', 'brow', 'glasses', 'acc'];

// 항목 -> 기본 레이어. 여기 없는 항목(eye, pupil, hl, lash, iris)은 따로 처리한다.
const GENERIC = {
  front: 'hairFront', extra: 'hairFront', side: 'hairSide', back: 'hairMid', face: 'face', skinfx: 'skin',
  makeup: 'makeup', lip: 'makeup', brow: 'brow', mouth: 'mouth', acc: 'acc', glasses: 'glasses'
};
const CATEGORIES = ['front', 'extra', 'side', 'back', 'face', 'skinfx', 'makeup', 'lip', 'eye', 'iris', 'pupil', 'hl', 'lash', 'fold', 'lowline', 'lowlash', 'aegyo', 'dark',
  'brow', 'mouth', 'eyeGap', 'eyeY', 'eyeSize', 'mouthY', 'acc', 'glasses'];

const PIECE_NAMES = {};
['half', 'full', 'left', 'right', 'white', 'lines', 'upper', 'lower', 'fill', 'cap', 'tuck', 'edge'].forEach((n) => { PIECE_NAMES[n] = n; });
LAYERS.forEach((l) => ['half', 'full'].forEach((s) => { PIECE_NAMES[(l + '-' + s).toLowerCase()] = l + '-' + s; }));
const MARKERS = { iris: 1 };
// 그림 없이 _parts.json 의 수치만 쓰는 항목 (눈동자 크기, 아이라인에서 만드는 것들)
const DATA_ONLY = { iris: 1, lash: 1, fold: 1, lowline: 1, lowlash: 1, aegyo: 1, dark: 1, eyeGap: 1, eyeY: 1, eyeSize: 1, mouthY: 1 };

const warnings = [];
const notes = [];
const warn = (msg) => { warnings.push(msg); };

// ---------------------------------------------------------------- XML 읽기
function parseAttrs(src) {
  const attrs = [];
  const re = /([^\s=]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  let m;
  while ((m = re.exec(src))) attrs.push([m[1], m[2] !== undefined ? m[2] : m[3]]);
  return attrs;
}

function parseXml(src) {
  const root = { tag: '#root', attrs: [], children: [] };
  const stack = [root];
  const re = /<!--[\s\S]*?-->|<\?[\s\S]*?\?>|<!DOCTYPE[\s\S]*?>|<!\[CDATA\[([\s\S]*?)\]\]>|<\/\s*([^\s>]+)\s*>|<([^\s>\/!?]+)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>|([^<]+)/g;
  let m;
  while ((m = re.exec(src))) {
    const top = stack[stack.length - 1];
    if (m[1] !== undefined) top.children.push({ text: m[1] });
    else if (m[2]) {
      for (let i = stack.length - 1; i > 0; i--) if (stack[i].tag === m[2]) { stack.length = i; break; }
    } else if (m[3]) {
      const node = { tag: m[3], attrs: parseAttrs(m[4]), children: [] };
      top.children.push(node);
      if (!m[5]) stack.push(node);
    } else if (m[6] !== undefined && m[6].trim()) top.children.push({ text: m[6] });
  }
  return root;
}

const attr = (node, name) => { const a = node.attrs.find((x) => x[0] === name); return a ? a[1] : undefined; };
const tagOf = (node) => node.tag.replace(/^svg:/, '');

// 편집기가 넣는 것들 중 그림이 아닌 것
function isDropped(node) {
  const t = tagOf(node);
  if (t.indexOf(':') >= 0) return true;
  return ['metadata', 'title', 'desc', 'script', 'style', 'image', 'foreignObject'].indexOf(t) >= 0;
}

// 그룹 이름: id, 없으면 Inkscape 레이어 이름. Illustrator 가 바꿔 쓴 글자를 되돌린다.
function nameOf(node) {
  let n = attr(node, 'id') || attr(node, 'inkscape:label') || attr(node, 'data-name') || '';
  return n.trim().replace(/_x2D_/g, '-').replace(/_x5F_/g, '_').replace(/_\d+_$/, '');
}

function isHidden(name) { return name.charAt(0) === '_'; }

// <style> 안의 .클래스 { ... } 규칙을 모은다 (Illustrator 가 색을 클래스로 내보낸다)
function collectCss(node, css) {
  for (const c of node.children) {
    if (c.text !== undefined) continue;
    if (tagOf(c) === 'style') {
      const text = c.children.map((x) => x.text || '').join('');
      const re = /([^{}]+)\{([^}]*)\}/g;
      let m;
      while ((m = re.exec(text))) {
        m[1].split(',').forEach((sel) => {
          const k = /^\s*\.([\w-]+)\s*$/.exec(sel);
          if (k) css[k[1]] = (css[k[1]] || '') + m[2].trim().replace(/;?$/, ';');
        });
      }
    } else collectCss(c, css);
  }
}

function collectIds(node, ids) {
  for (const c of node.children) {
    if (c.text !== undefined || isDropped(c)) continue;
    const n = nameOf(c);
    if (n && isHidden(n)) continue;
    const id = attr(c, 'id');
    if (id) ids.add(id);
    collectIds(c, ids);
  }
}

// ---------------------------------------------------------------- 조각 만들기
function makeWriter(prefix, ids, css) {
  const reid = (id) => prefix + '-' + id + '@@';

  function recolor(v) {
    return v.replace(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g, (hex) => {
      let h = hex.toLowerCase();
      if (h.length === 4) h = '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];
      return COLORS[h] ? 'var(' + COLORS[h] + ')' : hex;
    });
  }
  function relink(v) {
    return v.replace(/url\(\s*["']?#([^)"']+)["']?\s*\)/g, (all, id) => (ids.has(id) ? 'url(#' + reid(id) + ')' : all));
  }

  // skipId: 조각 이름으로 쓰인 id 는 지운다
  function open(node, skipId) {
    let style = '', out = '<' + tagOf(node), href = null;
    for (const [k, v0] of node.attrs) {
      let v = v0;
      if (k === 'id') { if (!skipId && ids.has(v)) out += ' id="' + reid(v) + '"'; continue; }
      if (k === 'class') { v.split(/\s+/).forEach((c) => { if (css[c]) style = css[c] + style; }); continue; }
      if (k === 'style') { style += v; continue; }
      if (k === 'display') { if (v !== 'none') out += ' display="' + v + '"'; continue; }
      if (k === 'href' || k === 'xlink:href') { href = v; continue; }
      if (k.indexOf(':') >= 0 || k.indexOf('data-') === 0 || k === 'enable-background' || k === 'xmlns' || k === 'version') continue;
      out += ' ' + k + '="' + relink(recolor(v)) + '"';
    }
    if (href !== null) out += ' href="' + (href.charAt(0) === '#' && ids.has(href.slice(1)) ? '#' + reid(href.slice(1)) : href) + '"';
    style = style.replace(/display\s*:\s*none\s*;?/g, '').trim();
    if (style) out += ' style="' + relink(recolor(style)) + '"';
    return out;
  }

  function inner(node) {
    let out = '';
    for (const c of node.children) {
      if (c.text !== undefined) { out += c.text; continue; }
      if (isDropped(c)) continue;
      const n = nameOf(c);
      if (n && isHidden(n)) continue;
      out += whole(c, false);
    }
    return out;
  }

  function whole(node, skipId) {
    const body = inner(node);
    return body ? open(node, skipId) + '>' + body + '</' + tagOf(node) + '>' : open(node, skipId) + '/>';
  }

  return { open, inner, whole };
}

/*
 * SVG 파일 하나에서 조각을 꺼낸다.
 * 반환: { pieces: {이름: markup}, defs: markup, markers: {iris:[x,y], ...} }
 */
function readSvg(file, prefix) {
  const doc = parseXml(fs.readFileSync(file, 'utf8'));
  const svg = doc.children.find((c) => c.tag && tagOf(c) === 'svg');
  if (!svg) { warn(path.relative(ROOT, file) + ': <svg> 를 찾지 못했습니다'); return null; }

  const css = {}, ids = new Set();
  collectCss(svg, css);
  collectIds(svg, ids);
  const w = makeWriter(prefix, ids, css);
  const res = { pieces: {}, defs: '', markers: {}, paths: {}, custom: {} };
  const defsItems = [];
  const r1 = (v) => Math.round(v * 10) / 10;

  /*
   * 위치 표시 읽기
   * - iris  : 원(또는 원을 바꾼 경로)의 가운데 -> [x, y]
   * - corner, low : 선(line 또는 점 두 개짜리 path). 시작점에 속눈썹이 붙고, 선 방향으로 돌아간다 -> [x, y, 각도]
   *                 점(circle)이면 각도 0 으로 본다
   */
  function readMarker(c, key) {
    const t = tagOf(c);
    const nums = (s) => (s.match(/-?\d*\.?\d+(?:e-?\d+)?/gi) || []).map(Number);
    if (key !== 'iris') {
      let pts = null;
      if (t === 'line') pts = ['x1', 'y1', 'x2', 'y2'].map((a) => parseFloat(attr(c, a)));
      else if (t === 'path' || t === 'polyline') {
        const n = nums(attr(c, 'd') || attr(c, 'points') || '');
        if (n.length >= 4) pts = [n[0], n[1], n[n.length - 2], n[n.length - 1]];
      }
      if (pts && pts.every(isFinite)) {
        const ang = Math.atan2(pts[3] - pts[1], pts[2] - pts[0]) * 180 / Math.PI;
        return [r1(pts[0]), r1(pts[1]), r1(ang)];
      }
    }
    let x = parseFloat(attr(c, 'cx')), y = parseFloat(attr(c, 'cy'));
    if (!(isFinite(x) && isFinite(y)) && attr(c, 'd')) {
      const n = nums(attr(c, 'd'));
      const xs = n.filter((v, i) => i % 2 === 0), ys = n.filter((v, i) => i % 2 === 1);
      if (xs.length && ys.length) { x = (Math.min(...xs) + Math.max(...xs)) / 2; y = (Math.min(...ys) + Math.max(...ys)) / 2; }
    }
    if (!(isFinite(x) && isFinite(y))) return null;
    return key === 'iris' ? [r1(x), r1(y)] : [r1(x), r1(y), 0];
  }
  const add = (name, markup) => { res.pieces[name] = (res.pieces[name] || '') + markup; };

  // wraps: 이름 없는 그룹(편집기의 "레이어 1" 등)을 통과할 때 그 그룹의 변형·투명도를 유지한다
  function walk(node, wraps) {
    const wrap = (m) => wraps.reduceRight((acc, o) => o + '>' + acc + '</g>', m);
    for (const c of node.children) {
      if (c.text !== undefined) continue;
      const t = tagOf(c);
      if (t === 'defs') { c.children.forEach((d) => { if (d.tag && !isDropped(d)) defsItems.push(d); }); continue; }
      if (isDropped(c)) continue;
      const raw = nameOf(c);
      if (raw === '_ref' && c.children.filter((x) => x.tag).length > 1) warn(path.relative(ROOT, file) + ': 참고 레이어(_ref) 안에 그림이 있습니다. 편집 레이어로 옮겨야 나옵니다');
      if (raw && isHidden(raw)) continue;
      const key = raw.toLowerCase();
      if (MARKERS[key]) {
        const m = readMarker(c, key);
        if (m) res.markers[key] = m;
        else warn(path.relative(ROOT, file) + ': ' + key + ' 표시의 위치를 읽지 못했습니다');
        continue;
      }
      if (key === 'upper' || key === 'lower') {
        /*
         * 아이라인. 두 가지로 그릴 수 있다.
         * - 선(stroke)으로 그린 경로: 그 경로를 그대로 쓴다.
         * - 면(fill)으로 그린 모양 (편집기에서 선 폭을 바꾸면 면으로 저장된다): 모양은 그대로 그리고,
         *   속눈썹·쌍꺼풀을 붙일 가운데 선은 모양에서 계산한다.
         */
        const shapes = [];
        const collect = (n) => {
          if (n.text !== undefined || isDropped(n)) return;
          const t2 = tagOf(n);
          if (t2 === 'path' || t2 === 'polygon' || t2 === 'polyline') {
            let d = attr(n, 'd');
            if (!d) { const pts = (attr(n, 'points') || '').trim().split(/[\s,]+/).map(Number); d = 'M' + pts.join(' ') + (t2 === 'polygon' ? ' Z' : ''); }
            const css2 = (attr(n, 'style') || '') + ';' + ((attr(n, 'class') || '').split(/\s+/).map((k) => css[k] || '').join(''));
            const fill = attr(n, 'fill') || (/fill\s*:\s*([^;]+)/.exec(css2) || [])[1] || '#000';
            shapes.push({ d: d, filled: fill.trim().toLowerCase() !== 'none', node: n });
          }
          n.children.forEach(collect);
        };
        collect(c);
        const stroke = shapes.find((x) => !x.filled), filled = shapes.filter((x) => x.filled);
        if (stroke) res.paths[key] = stroke.d;
        else if (filled.length) {
          res.paths[key] = centerline(filled[0].d);
          res.paths[key + 'Shape'] = wrap(w.inner(c));
        } else warn(path.relative(ROOT, file) + ': ' + key + ' 아이라인을 찾지 못했습니다');
        continue;
      }
      // 눈 파일에 직접 그린 속눈썹·쌍꺼풀·애교살 (lash, fold-inner 처럼 이름 붙인 그룹)
      if (/^(lash|fold|lowlash|aegyo)(-[a-z0-9_-]+)?$/.test(key)) { res.custom[key] = wrap(w.whole(c, true)); continue; }
      if (PIECE_NAMES[key]) {
        if (PIECE_NAMES[key] === 'white') {
          // 흰자는 clipPath 안에 들어가므로 <g> 로 감쌀 수 없다. 속성 없는 그룹(편집기 레이어)은 벗긴다.
          if (wraps.some((o) => o !== '<g')) warn(path.relative(ROOT, file) + ': 흰자(white)를 변형이 걸린 그룹 밖으로 빼 주세요');
          add('white', w.inner(c));
        } else add(PIECE_NAMES[key], wrap(w.whole(c, true)));
        continue;
      }
      if (t === 'g') { walk(c, wraps.concat(w.open(c, true))); continue; }
      if (t === 'switch' || t === 'svg') { walk(c, wraps); continue; }
      // 눈 파일: 그룹 없이 그냥 그린 선도 색으로 알아본다. 노란 선 = 아래 라인, 검은 선 = 윗 아이라인
      if (prefix.indexOf('eye-') === 0 && (t === 'path' || t === 'polygon' || t === 'polyline')) {
        const st = (attr(c, 'style') || '') + ';' + ((attr(c, 'class') || '').split(/\s+/).map((k) => css[k] || '').join(''));
        const pick = (name) => (attr(c, name) || (new RegExp(name + '\\s*:\\s*([^;]+)').exec(st) || [])[1] || '').trim().toLowerCase();
        const stroke = pick('stroke'), fill = pick('fill');
        const line = stroke && stroke !== 'none' ? stroke : '', area = !line && fill && fill !== 'none' ? fill : '';
        const which = (line || area) === '#f5c400' ? 'lower' : ['#1e1a1a', '#352a27', '#2b201d', '#000000', '#000'].indexOf(line || area) >= 0 ? 'upper' : '';
        if (which && !res.paths[which]) {
          let d = attr(c, 'd');
          if (!d) { const pts = (attr(c, 'points') || '').trim().split(/[\s,]+/).map(Number); d = 'M' + pts.join(' ') + (t === 'polygon' ? ' Z' : ''); }
          if (line) res.paths[which] = d;
          else { res.paths[which] = centerline(d); res.paths[which + 'Shape'] = wrap(w.whole(c, false)); }
          continue;
        }
      }
      add('full', wrap(w.whole(c, false)));
    }
  }
  walk(svg, []);
  // 작은 좌표계 파일(눈동자, 하이라이트)은 화면 가운데가 원점이어야 한다. 편집기가 좌표를 0,0 시작으로 바꿔 저장해도 가운데로 되돌린다.
  const vb = (attr(svg, 'viewBox') || '').trim().split(/[\s,]+/).map(Number);
  if (vb.length === 4 && vb.every(isFinite) && vb[2] > 0) {
    const cx = vb[0] + vb[2] / 2, cy = vb[1] + vb[3] / 2, k = 220 / vb[2];
    res.center = (Math.abs(cx) > 0.01 || Math.abs(cy) > 0.01 || Math.abs(k - 1) > 0.001)
      ? 'translate(' + (-cx * k) + ' ' + (-cy * k) + ') scale(' + k + ')' : '';
  }
  // defs 는 조각에서 실제로 쓰는 것만 남긴다 (참고 그림이 쓰던 것은 버린다)
  const used = Object.keys(res.pieces).map((k) => res.pieces[k]).join('');
  defsItems.forEach((d) => {
    const id = attr(d, 'id');
    if (id && used.indexOf('#' + prefix + '-' + id + '@@') >= 0) res.defs += w.whole(d, false);
  });
  return res;
}

// ---------------------------------------------------------------- 항목별 조립
function readList(cat) {
  const dir = path.join(PARTS, cat);
  if (!fs.existsSync(dir)) { warn('parts/' + cat + ' 폴더가 없습니다'); return []; }
  let list = [];
  const listFile = path.join(dir, '_parts.json');
  if (fs.existsSync(listFile)) {
    try { list = JSON.parse(fs.readFileSync(listFile, 'utf8')); }
    catch (e) { warn('parts/' + cat + '/_parts.json 을 읽지 못했습니다: ' + e.message); }
  }
  /*
   * 폴더와 목록을 맞춘다. 파일을 넣으면 목록 끝에 붙고, 파일을 지우면 목록에서도 빠진다.
   * 바뀐 것이 있으면 _parts.json 을 다시 써 둔다 (이름은 파일 이름으로 시작하니 나중에 고치면 된다).
   */
  const before = JSON.stringify(list);
  const files = new Set(fs.readdirSync(dir).filter((f) => /\.svg$/i.test(f) && f.charAt(0) !== '_').map((f) => f.replace(/\.svg$/i, '')));
  if (!DATA_ONLY[cat]) {
    list = list.filter((e) => {
      if (e.none || e.empty || files.has(e.id)) return true;
      notes.push('parts/' + cat + ': ' + e.id + '.svg 가 없어서 목록에서 뺐습니다');
      return false;
    });
  }
  const known = new Set(list.map((e) => e.id));
  for (const id of Array.from(files).sort()) {
    if (!known.has(id)) { list.push({ id: id, name: id }); notes.push('parts/' + cat + ': ' + id + '.svg 를 목록 끝에 추가했습니다'); }
  }
  if (JSON.stringify(list) !== before) writeList(cat, list);
  return list;
}

function writeList(cat, list) {
  const text = '[\n' + list.map((e) => '  ' + JSON.stringify(e)).join(',\n') + '\n]\n';
  fs.writeFileSync(path.join(PARTS, cat, '_parts.json'), text, 'utf8');
}

function entryBase(e) {
  const p = { id: e.id, name: e.name || e.id };
  if (e.w != null) p.w = e.w;
  if (e.default) p.isDefault = true;
  if (e.none) p.none = true;
  return p;
}

function buildCategory(cat) {
  const out = [];
  for (const e of readList(cat)) {
    const p = entryBase(e);
    if (DATA_ONLY[cat]) {
      for (const k of Object.keys(e)) if (['id', 'name', 'w', 'default', 'none'].indexOf(k) < 0) p[k] = e[k];
      out.push(p); continue;
    }
    if (e.none || e.empty) { out.push(p); continue; }

    const file = path.join(PARTS, cat, e.id + '.svg');
    if (!fs.existsSync(file)) { warn('parts/' + cat + '/' + e.id + '.svg 가 없어서 건너뜁니다'); continue; }
    const r = readSvg(file, cat + '-' + e.id);
    if (!r) continue;
    const pc = r.pieces;

    if (GENERIC[cat]) {
      p.pieces = {};
      const put = (layer, side, m) => {
        if (!m) return;
        p.pieces[layer] = p.pieces[layer] || {};
        p.pieces[layer][side] = (p.pieces[layer][side] || '') + m;
      };
      for (const name of Object.keys(pc)) {
        if (name === 'half') put(GENERIC[cat], 'half', pc[name]);
        else if (name === 'full' || name === 'left' || name === 'right') put(GENERIC[cat], 'full', pc[name]);
        else {
          const k = name.lastIndexOf('-');
          if (k > 0 && LAYERS.indexOf(name.slice(0, k)) >= 0) put(name.slice(0, k), name.slice(k + 1), pc[name]);
          else warn('parts/' + cat + '/' + e.id + '.svg: "' + name + '" 그룹은 이 항목에서 쓰지 않습니다');
        }
      }
      if (!Object.keys(p.pieces).length) warn('parts/' + cat + '/' + e.id + '.svg: 그림이 없습니다');
      if (e.down) p.down = true;
      if (e.noCap) p.noCap = true;
    } else if (cat === 'eye') {
      if (pc.white) p.white = pc.white;
      p.lines = (pc.lines || '') + (pc.half || '') + (pc.full || '');
      if (r.markers.iris) p.iris = r.markers.iris;
      if (r.paths.upper) p.upper = r.paths.upper;
      if (r.paths.lower) p.lower = r.paths.lower;
      if (r.paths.upperShape) p.upperShape = r.paths.upperShape;
      if (r.paths.lowerShape) p.lowerShape = r.paths.lowerShape;
      if (Object.keys(r.custom).length) p.custom = r.custom;
      if (e.alt) p.alt = e.alt;
    } else if (cat === 'pupil') {
      p.body = (pc.full || '') + (pc.half || '');
      if (r.center) p.body = '<g transform="' + r.center + '">' + p.body + '</g>';
      if (e.noRing) p.noRing = true;
    } else if (cat === 'hl') {
      p.mark = (pc.full || '') + (pc.half || '');
      if (r.center) p.mark = '<g transform="' + r.center + '">' + p.mark + '</g>';
    } else if (cat === 'lash') {
      if (pc.upper) p.upper = pc.upper;
      if (pc.lower) p.lower = pc.lower;
    }
    if (r.defs) p.defs = r.defs;
    out.push(p);
  }
  if (out.length && !out.some((p) => p.isDefault)) out[0].isDefault = true;
  return out;
}

function buildBase() {
  const base = {};
  const read = (name) => {
    const file = path.join(PARTS, 'base', name + '.svg');
    if (!fs.existsSync(file)) { warn('parts/base/' + name + '.svg 가 없습니다'); return { pieces: {}, defs: '' }; }
    return readSvg(file, 'base-' + name) || { pieces: {}, defs: '' };
  };
  ['body', 'ear', 'nose', 'guide'].forEach((n) => {
    const r = read(n);
    base[n] = { half: (r.defs || '') + (r.pieces.half || ''), full: r.pieces.full || '' };
  });
  const h = read('hair').pieces;
  base.hair = { fill: h.fill || '', cap: h.cap || '', tuck: h.tuck || '', edge: h.edge || '' };
  return base;
}

// ---------------------------------------------------------------- 가이드 그림
/*
 * 편집할 때 깔아 보는 그림. 그 항목만 뺀 기본 캐릭터를 실제 색으로 그리되,
 * 파츠가 놓이는 레이어를 기준으로 아래쪽과 위쪽을 나눠 둔다. 파츠 파일이 이 그림들 사이에
 * 조각을 끼워 넣기 때문에, 편집기에서도 생성 결과와 같은 순서로 겹쳐 보인다.
 *   <항목>-below-<레이어>.svg : 그 레이어 바로 아래까지
 *   <항목>-top.svg            : 마지막 레이어 위 전부
 */
function writeGuides(dataJs, data) {
  const ctx = {};
  ctx.window = ctx;
  vm.createContext(ctx);
  for (const f of ['core.js', 'palettes.js']) vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', f), 'utf8'), ctx, { filename: f });
  vm.runInContext(dataJs, ctx, { filename: 'parts-data.js' });
  const CG = ctx.CG;
  const hair = { front: true, ahoge: true, side: true, back: true };
  // 헤어 항목은 다른 헤어 파츠를 다 빼고 기본머리와 가이드 선만 보여 준다. 눈은 앞머리에 가리지 않게 한다.
  const omitOf = (cat) => (hair[cat] ? hair : cat === 'eye' ? { eye: true, front: true, ahoge: true, side: true } : { [cat]: true });

  const dir = path.join(PARTS, '_guide');
  fs.mkdirSync(dir, { recursive: true });
  for (const f of fs.readdirSync(dir)) if (/\.svg$/i.test(f)) fs.unlinkSync(path.join(dir, f));

  let n = 0;
  const write = (name, opts) => {
    const svg = CG.compose(CG.defaultState(), Object.assign({ literal: true, size: 702 }, opts));
    fs.writeFileSync(path.join(dir, name + '.svg'), svg + '\n', 'utf8');
    n++;
  };
  write('base', {});
  for (const cat of Object.keys(GENERIC).concat(['eye'])) {
    const used = new Set([LAYERS.indexOf(GENERIC[cat] || 'eye')]);
    (data.parts[cat] || []).forEach((p) => Object.keys(p.pieces || {}).forEach((l) => used.add(LAYERS.indexOf(l))));
    let start = 0;
    for (const i of Array.from(used).sort((a, b) => a - b)) {
      write(cat + '-below-' + LAYERS[i], { omit: omitOf(cat), layers: [start, i] });
      start = i + 1;
    }
    write(cat + '-top', { omit: omitOf(cat), layers: [start, LAYERS.length], guide: !!hair[cat] });
  }
  return n;
}

// ---------------------------------------------------------------- 실행
const data = { base: buildBase(), parts: {} };
const counts = [];
for (const cat of CATEGORIES) {
  data.parts[cat] = buildCategory(cat);
  counts.push(cat + ' ' + data.parts[cat].length);
}

const js = '/* 자동으로 만든 파일입니다. 직접 고치지 말고 parts/ 폴더의 SVG 를 고친 뒤 build.bat 을 실행하세요. */\n' +
  'CG.load(' + JSON.stringify(data) + ');\n';
fs.writeFileSync(OUT, js, 'utf8');

console.log('파츠: ' + counts.join(', '));
console.log('만든 파일: js/parts-data.js (' + Math.round(js.length / 1024) + ' KB)');
if (notes.length) {
  console.log('\n목록 정리 ' + notes.length + '건');
  notes.forEach((m) => console.log("  - " + m));
}
if (warnings.length) {
  console.log('\n확인할 것 ' + warnings.length + '건');
  warnings.forEach((m) => console.log('  - ' + m));
}

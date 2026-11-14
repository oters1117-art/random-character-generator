/* 조합 코드 → 그림 프롬프트 (로컬 테스트 전용).
 * app.js 가 localhost 에서만 이 파일을 불러온다. 공개판(dovemayo.com)에는 복사되지 않는다.
 * CG.prompt(state) → { en, ko }. 영어는 이미지 생성 AI용, 한국어는 사람이 읽거나 한국어를 받는 AI용.
 * 사전에 없는 파츠는 한국어 이름을 그대로 넣는다(새 파츠를 만들면 EN 에 한 줄 더하면 된다). */
(function (CG) {
  'use strict';
  var EN = {
    front: {
      gapshort: 'short full bangs with small gaps at the sides', gap: 'full bangs with small gaps at the sides', gaplong: 'long full bangs with small gaps at the sides',
      blunt: 'straight-cut blunt bangs', bluntlong: 'long straight-cut blunt bangs reaching the eyes',
      mushroomshort: 'short rounded mushroom bangs', mushroom: 'rounded mushroom bangs',
      choppyshort: 'short choppy bangs', choppy: 'choppy uneven bangs', zigzagshort: 'short zigzag (sawtooth) bangs', zigzag: 'zigzag (sawtooth) bangs',
      mbang: 'M-shaped bangs', mbanglong: 'long M-shaped bangs', tribang: 'triangle-pointed bangs',
      curly: 'curly bangs', curlylong: 'long curly bangs', eyecover2: 'long bangs covering both eyes', seethrough: 'thin see-through bangs',
      antenna: 'see-through bangs with two antenna strands', centerwisp: 'forehead showing with a few wisps in the middle', centerlock: 'forehead showing with one lock in the middle',
      parted: 'center-parted fringe', side73: '7:3 side part', curtain: 'curtain bangs', curtainlong: 'long curtain bangs',
      sidebang: 'side-swept bangs', sidebanglong: 'long side-swept bangs', diagonal: 'diagonally cut bangs', diagonallong: 'long diagonally cut bangs',
      sidecurveshort: 'short bangs curving to one side', sidecurve: 'bangs curving to one side', sidecurvelong: 'long bangs curving to one side',
      eyecover1: 'long bangs covering one eye', kkaennip: 'sleek side-swept bangs tucked to one side (Korean kkaennip style)', pinned: 'bangs pinned back to one side',
      braidbang: 'braided bangs', twostrand: 'two long strands framing the face', longcurlin: 'long face-framing bangs curling inward',
      himebang: 'hime-cut straight bangs', longwave: 'long wavy face-framing bangs', 'longwave-one': 'a long wavy face-framing strand on one side',
      allback: 'hair slicked back with no bangs, forehead fully showing', babyhair: 'hair slicked back with baby hairs on the forehead'
    },
    extra: {
      ahoge1: 'a small ahoge (stray hair strand) on top', ahoge2: 'a long ahoge (stray hair strand) on top', apple: 'an "apple" tuft tied up on top of the head',
      knot: 'a small half-up tie at the back', halfbun: 'a half-up bun', crownbraid: 'a crown braid around the head', buns: 'two small buns on the sides of the head',
      onetail: 'one side tail', sidetails: 'two small side tails', sidetailslong: 'two long side tails', pigtails: 'short pigtails',
      twinhighx: 'high twin tails', halftwin: 'half-up twin tails (two side-up)', ponyx: 'a high ponytail', flipends: 'flipped-out hair ends'
    },
    side: {
      sideburn: 'short sideburns', aegyo: 'thin wisps in front of the ears', jawshort: 'straight side locks to the jaw', jaw: 'straight side locks past the jaw',
      long: 'long straight side locks to the shoulders', chest: 'long straight side locks reaching the chest', xxlong: 'very long straight side locks reaching the waist',
      hime: 'hime-cut side locks', himelong: 'long hime-cut side locks', spike: 'spiky side locks', spikelong: 'long spiky side locks',
      curlin: 'side locks curling inward', curlinlong: 'long side locks curling inward', curl: 'side locks with curled ends', curllong: 'long side locks with curled ends',
      volumecurl: 'voluminous inward-curled side locks', volumecurllong: 'long voluminous inward-curled side locks', messyin: 'long messy inward-curled side locks',
      flipout: 'side locks flipping outward', flipoutlong: 'long side locks flipping outward',
      waveshort: 'short wavy side locks', wave: 'wavy side locks', wavelong: 'long wavy side locks', roll: 'vertical ringlet (drill) side curls',
      braid: 'braided side locks', braidlong: 'long braided side locks', braidtemple: 'a small braid at the temple', tied: 'side locks tied at the ends'
    },
    back: {
      none: 'short hair', pixie: 'a short pixie cut', pixielong: 'a pixie cut', spiky: 'short spiky hair', curlyshort: 'short curly hair', wolf: 'a wolf cut',
      earbob: 'an ear-length bob', chinbob: 'a chin-length bob', bob: 'a bob', longbob: 'a long bob to the shoulders', sharpbob: 'a sharp blunt-cut bob', tassel: 'a tassel cut',
      medium: 'straight shoulder-length hair', midlong: 'straight medium-long hair', long: 'long straight hair',
      chincurl: 'a short cut curling inward', curlin: 'medium hair curling inward', curlmid: 'long hair curling inward',
      flipshort: 'a short cut flipping outward', flipout: 'medium hair flipping outward',
      wavechin: 'short wavy hair', wavem: 'medium wavy hair', wavelongbob: 'long wavy hair', wavel: 'very long wavy hair',
      hippieshort: 'short hippie perm', hippie: 'hippie perm', waveperm: 'long water-wave perm', scurl: 'very long hair with big S-curls', curlyl: 'long voluminous curly hair',
      layered: 'layered medium hair', layeredlong: 'long layered hair', hush: 'a hush cut',
      ponyhighshort: 'a short high ponytail', ponyhigh: 'a long high ponytail', ponylow: 'a low ponytail', sidepony: 'a side ponytail', sideponylong: 'a long side ponytail',
      frontdrape: 'hair tied and draped over one shoulder', twinhigh: 'high twin tails', twinhighlong: 'long high twin tails',
      twinshort: 'short low twin tails', twin: 'low twin tails', twinlong: 'long low twin tails', pigtail: 'pigtails', drilltwin: 'drill (ringlet) twin tails',
      braid1: 'a single braid', 'braid-big-side': 'a thick side braid', braid2short: 'two short braids', braid2: 'two long braids', 'braid-ring': 'two braided loops',
      bun1: 'a bun on top of the head', bun_l: 'a big bun on top of the head', bun2: 'two buns', buntwin: 'buns with twin tails', lowbun: 'a low side bun', lowbuns: 'two low buns',
      clawup: 'hair twisted up with a claw clip'
    },
    eye: {
      round: 'round eyes', tsuri: 'upturned (tsurime) eyes', tare: 'droopy (tareme) eyes', jito: 'half-lidded unimpressed (jitome) eyes', almond: 'almond-shaped eyes',
      cat: 'cat-like eyes', sharp: 'long sharp eyes', deformed: 'big round chibi eyes', sleepy: 'sleepy eyes', slit: 'narrow slit eyes',
      smile: 'smiling crescent eyes', closed: 'closed eyes', fox: 'fox-like narrow eyes'
    },
    fold: { inner: 'inner double eyelids', outer: 'double eyelids' },
    lash: { up1: '1 upper lash', up3: '3 upper lashes', up5: '5 upper lashes', down1: '1 downward upper lash', down3: '3 downward upper lashes', down5: '5 downward upper lashes' },
    lowlash: { n3: '3 lower lashes', n5: '5 lower lashes', n7: '7 lower lashes' },
    iris: { big: 'large irises', small: 'small irises (sanpaku)' },
    pupil: {
      big: 'big pupils', small: 'small pupils', slit: 'vertical slit pupils', ring: 'ring-shaped irises', rinnegan: 'concentric ring irises', swirl: 'swirl irises',
      heart: 'heart-shaped pupils', star: 'star-shaped pupils', cross: 'cross-shaped pupils', blank: 'no pupils', dot: 'tiny dot eyes', octo: 'octopus-like pupils', goat: 'horizontal goat pupils'
    },
    hl: { one: 'one white highlight', two: 'two white highlights', pupil: 'white pupils' },
    face: { round: 'a round face', egg: 'an oval face', pointed: 'a pointed chin', chubby: 'chubby cheeks', heart: 'a heart-shaped face', baby: 'a baby face' },
    ear: { big: 'big ears', soft: 'slightly pointed ears', elf: 'pointed elf ears', cat: 'cat ears', fox: 'fox ears' },
    skinfx: { mole: 'a beauty mark under the eye', freckles: 'freckles' },
    makeup: { blush: 'pink blush on the cheeks', 'blush-nose': 'pink blush across the cheeks and nose' },
    around: { shadow: 'soft shadow under the eyes', aegyo: 'aegyo-sal (puffy under-eye)', darklight: 'light dark circles', darkdeep: 'deep dark circles' },
    lip: { light: 'a light lip tint' },
    brow: { flat: 'straight eyebrows', arch: 'arched eyebrows', down: 'drooping eyebrows', up: 'raised eyebrows', angled: 'angled eyebrows', thick: 'thick eyebrows',
      thin: 'thin eyebrows', short: 'short rounded eyebrows', frown: 'frowning eyebrows', danmuji: 'short thick oblong eyebrows' },
    mouth: { smile: 'a small smile', line: 'a straight-line mouth', frown: 'a sulky frown', cat: 'a cat-like ":3" mouth', pout: 'a pout', smirk: 'a one-sided smirk',
      wavy: 'a wavy flustered mouth', dot: 'a tiny dot mouth', o: 'a small open "o" mouth', open: 'an open-mouth smile', tri: 'a small triangle mouth',
      grin: 'a grin showing teeth', fang: 'a smile with one small fang', frontteeth: 'a smile showing front teeth', shark: 'a grin with sharp shark teeth', partedLips: 'slightly parted lips' },
    acc: { pin: 'a hair pin', snap2: 'two snap hair clips', clawclip: 'a claw clip', hairroll: 'a hair roller in the bangs', band: 'a headband', bow: 'a bow headband', bigbow: 'a big bow at the back of the head' },
    glasses: { round: 'round thin-frame glasses', 'round-horn': 'round horn-rimmed glasses', square: 'square thin-frame glasses', 'square-horn': 'square horn-rimmed glasses',
      boston: 'boston-style glasses', 'boston-horn': 'boston-style horn-rimmed glasses', eyepatch: 'an eyepatch' },
    earring: { 'stud-mini': 'tiny stud earrings', stud: 'stud earrings', 'stud-mini-2': 'two tiny stud earrings on each ear', 'stud-big1-mini2': 'a stud and two tiny studs on each ear',
      hoop: 'hoop earrings', drop: 'drop earrings', bar: 'long bar earrings', cuff: 'ear cuffs' },
    facewear: { mask: 'a white face mask', maskblack: 'a black face mask', bandage: 'an adhesive bandage on the cheek', bandagenose: 'an adhesive bandage across the nose' }
  };
  var EN_COLOR = {
    hair: { black: 'black', blueblack: 'blue-black', darkbrown: 'dark brown', choco: 'chocolate brown', softbrown: 'natural brown', milkbrown: 'milk-tea brown', ashbrown: 'ash brown',
      khakibrown: 'khaki brown', orangebrown: 'orange brown', redbrown: 'red-brown', pinkbrown: 'pink-brown', burgundy: 'burgundy', honey: 'honey blonde', beige: 'beige blonde',
      ashblonde: 'ash blonde', platinum: 'platinum blonde', silverash: 'silver ash', ashgray: 'ash gray', white: 'white', lavsilver: 'lavender-tinted silver', butter: 'butter blonde',
      cherry: 'cherry red', coral: 'coral orange', rosegold: 'rose gold', babypink: 'baby pink', hotpink: 'hot pink', ashpink: 'ash pink', peach: 'peach', lilacpink: 'lilac pink',
      lavender: 'lavender ash', ashpurple: 'ash purple', violet: 'violet', navy: 'navy', ashblue: 'ash blue', skyblue: 'sky blue', midnight: 'midnight purple', bluegray: 'blue-gray',
      aqua: 'aqua', mint: 'mint', pistachio: 'pistachio mint green', sagegreen: 'sage green', teal: 'teal', khakigreen: 'khaki green' },
    eye: { black: 'black', darkbrown: 'dark brown', brown: 'brown', hazel: 'hazel', amber: 'amber', gold: 'gold', red: 'red', pink: 'pink', purple: 'purple', blue: 'blue', sky: 'sky blue', teal: 'teal', green: 'green', gray: 'gray' },
    skin: { base: 'fair', porcelain: 'porcelain', peach: 'peachy', ivory: 'ivory', rosy: 'rosy', lightbeige: 'light beige', beige: 'natural beige', honey: 'honey', tan: 'tan', brown: 'brown', deep: 'deep brown' },
    acc: { red: 'red', burgundy: 'burgundy', pink: 'dusty pink', babypink: 'baby pink', yellow: 'butter yellow', mustard: 'mustard', beige: 'beige', brown: 'brown', sage: 'sage',
      khaki: 'khaki', skyblue: 'sky blue', navy: 'navy', lavender: 'lavender', gold: 'gold', silver: 'silver', white: 'white', gray: 'gray', black: 'black' },
    bg: { greige: 'greige', cream: 'cream', dustypink: 'dusty pink', sage: 'sage green', dustyblue: 'dusty blue', lavender: 'lavender', charcoal: 'charcoal gray' }
  };
  EN_COLOR.odd = EN_COLOR.eye;

  function part(key, state) {
    var list = CG.parts[key] || [], id = state[key];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }
  function color(slot, state) {
    var s = CG.colorSlots.filter(function (c) { return c.key === slot; })[0], list = CG.palettes[s.palette] || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === state[slot]) return { id: list[i].id, ko: list[i].name, en: (EN_COLOR[s.palette] || {})[list[i].id] || list[i].name, hex: list[i].hex };
    return null;
  }
  var NONE = { none: 1, normal: 1 };
  function has(key, state) { return state[key] && !NONE[state[key]]; }
  // 영어 / 한국어 한 조각. 한쪽만·반전 표시를 붙인다
  function piece(key, state, lang) {
    var p = part(key, state);
    if (!p) return '';
    var t = lang === 'en' ? ((EN[key] || {})[p.id] || p.name) : p.name;
    var only = state.only && state.only[key], flip = state.flip && state.flip[key];
    if (only) t += lang === 'en' ? (only === 'l' ? ' (only on the viewer\'s left side)' : ' (only on the viewer\'s right side)') : (only === 'l' ? ' (화면 왼쪽만)' : ' (화면 오른쪽만)');
    else if (flip) t += lang === 'en' ? ' (mirrored left-right)' : ' (좌우 반전)';
    return t;
  }
  function join(arr) { return arr.filter(Boolean).join(', '); }

  CG.prompt = function (state) {
    state = CG.normalize(state);
    var hair = color('hairColor', state), eye = color('eyeColor', state), odd = state.oddColor !== 'none' ? color('oddColor', state) : null;
    var skin = color('skinColor', state), accC = color('accColor', state), bg = color('bgColor', state);
    var c = function (x) { return x ? x.en + ' (' + x.hex + ')' : ''; };
    var ck = function (x) { return x ? x.ko + ' (' + x.hex + ')' : ''; };
    var hairKeys = ['back', 'front', 'side', 'extra'].filter(function (k) { return k === 'back' || has(k, state); });
    var accKeys = ['acc', 'glasses', 'earring', 'facewear'].filter(function (k) { return has(k, state); });
    var tweak = { eyeGap: { wide: 'set slightly wide apart', narrow: 'set slightly close together' }, eyeY: { up: 'set slightly higher', down: 'set slightly lower' }, eyeSize: { big: 'slightly larger', small: 'slightly smaller' } };
    var tweakKo = { eyeGap: { wide: '눈 간격 조금 멀게', narrow: '눈 간격 조금 가깝게' }, eyeY: { up: '눈 조금 위로', down: '눈 조금 아래로' }, eyeSize: { big: '눈 조금 크게', small: '눈 조금 작게' } };
    var oddSide = state.flip && state.flip.oddColor;

    // ---------- English ----------
    var en = [];
    en.push('Flat 2D illustration of a cute young woman, front view, head and shoulders, centered, square 1:1. Simple minimal anime style: bold rounded dark outlines, flat fill colors with no shading or gradients except soft blush, clean vector look.');
    en.push('Hair: ' + c(hair) + '. ' + join(hairKeys.map(function (k) { return piece(k, state, 'en'); })) + '.');
    var eyes = [piece('eye', state, 'en'), eye ? c(eye) + ' irises' : '', has('fold', state) && piece('fold', state, 'en'), has('iris', state) && piece('iris', state, 'en'),
      state.pupil !== 'basic' && piece('pupil', state, 'en'), has('hl', state) && piece('hl', state, 'en'), has('lash', state) && piece('lash', state, 'en'), has('lowlash', state) && piece('lowlash', state, 'en'),
      state.lowline === 'on' && 'lower eyeliner'];
    ['eyeGap', 'eyeY', 'eyeSize'].forEach(function (k) { if (tweak[k][state[k]]) eyes.push(tweak[k][state[k]]); });
    en.push('Eyes: ' + join(eyes) + '.' + (odd ? ' Heterochromia: the eye on the viewer\'s ' + (oddSide ? 'left' : 'right') + ' is ' + c(odd) + '.' : ''));
    var face = [piece('face', state, 'en'), skin ? c(skin) + ' skin' : '', has('ear', state) && piece('ear', state, 'en'), piece('brow', state, 'en'), piece('mouth', state, 'en'),
      ({ down:'mouth set slightly lower', up: 'mouth set slightly higher' })[state.mouthY],
      has('makeup', state) && piece('makeup', state, 'en'), has('lip', state) && piece('lip', state, 'en'), has('around', state) && piece('around', state, 'en'), has('skinfx', state) && piece('skinfx', state, 'en'),
      'a small simple line nose'];
    en.push('Face: ' + join(face) + '.');
    if (accKeys.length) en.push('Accessories: ' + join(accKeys.map(function (k) { return piece(k, state, 'en'); })) + (accC && (has('acc', state) || has('earring', state)) ? '; accessory color ' + c(accC) : '') + '.');
    en.push('Wearing a plain simple top with a round neckline.');
    en.push(bg && bg.id !== 'none' ? 'Plain solid ' + c(bg) + ' background.' : 'Transparent / plain white background.');
    en.push('No text, no watermark.');

    // ---------- 한국어 ----------
    var ko = [];
    ko.push('귀여운 젊은 여성의 플랫한 2D 일러스트. 정면, 어깨까지 나오는 얼굴, 가운데, 1:1 정사각형. 단순한 애니메이션풍: 굵고 둥근 진한 외곽선, 그림자·그라데이션 없는 단색 채색(볼터치만 부드럽게).');
    var catName = function (k) { return CG.categories.filter(function (x) { return x.key === k; })[0].name; };
    ko.push('머리: ' + ck(hair) + '. ' + join(hairKeys.map(function (k) { return catName(k) + ' ' + piece(k, state, 'ko'); })) + '.');
    var eyesKo = [piece('eye', state, 'ko'), eye ? '눈동자 ' + ck(eye) : '', has('fold', state) && piece('fold', state, 'ko'), has('iris', state) && piece('iris', state, 'ko'),
      state.pupil !== 'basic' && '동공 ' + piece('pupil', state, 'ko'), has('hl', state) && '하이라이트 ' + piece('hl', state, 'ko'), has('lash', state) && '속눈썹 ' + piece('lash', state, 'ko'),
      has('lowlash', state) && '아래 속눈썹 ' + piece('lowlash', state, 'ko'), state.lowline === 'on' && '아래 아이라인'];
    ['eyeGap', 'eyeY', 'eyeSize'].forEach(function (k) { if (tweakKo[k][state[k]]) eyesKo.push(tweakKo[k][state[k]]); });
    ko.push('눈: ' + join(eyesKo) + '.' + (odd ? ' 오드아이: 화면 ' + (oddSide ? '왼쪽' : '오른쪽') + ' 눈은 ' + ck(odd) + '.' : ''));
    var faceKo = [piece('face', state, 'ko'), skin ? '피부 ' + ck(skin) : '', has('ear', state) && piece('ear', state, 'ko'), '눈썹 ' + piece('brow', state, 'ko'), '입 ' + piece('mouth', state, 'ko'),
      ({ down: '입 조금 아래로', up: '입 조금 위로' })[state.mouthY], has('makeup', state) && piece('makeup', state, 'ko'), has('lip', state) && '립 ' + piece('lip', state, 'ko'),
      has('around', state) && piece('around', state, 'ko'), has('skinfx', state) && piece('skinfx', state, 'ko'), '코는 작은 선 하나'];
    ko.push('얼굴: ' + join(faceKo) + '.');
    if (accKeys.length) ko.push('악세사리: ' + join(accKeys.map(function (k) { return piece(k, state, 'ko'); })) + (accC && (has('acc', state) || has('earring', state)) ? ' / 악세사리 색 ' + ck(accC) : '') + '.');
    ko.push('옷은 둥근 목선의 단순한 민무늬 상의.');
    ko.push(bg && bg.id !== 'none' ? '배경은 ' + ck(bg) + ' 단색.' : '배경은 투명 또는 흰색.');
    ko.push('글자, 워터마크 없음.');

    return { en: en.join('\n'), ko: ko.join('\n') };
  };
})(window.CG);

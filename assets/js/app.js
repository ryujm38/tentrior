/* ============================================================
   TENTRIOR app.js — 우리다운 캠핑을 만드는 법.
   - 공통 헤더 / 검색 / 푸터
   - data/*.js 의 데이터를 읽어 페이지별 화면을 그립니다.
   - 콘텐츠 추가·수정은 이 파일이 아니라 data 폴더에서 하세요.
   ============================================================ */
(async function () {
  'use strict';

  const T = window.TENTRIOR || {};
  const S = T.site || {};
  ['styles', 'products', 'tents', 'setups', 'journal', 'tendeuli', 'camperjournal'].forEach((k) => { T[k] = T[k] || []; });

  const PAGE = document.body.dataset.page || '';
  const ROOT = document.body.dataset.root || '';
  const app = document.getElementById('app');
  const BRAND = `${S.name || 'TENTRIOR'} ${S.nameKo || '텐트리어'}`;

  /* ---------- 세팅(setups) — 관리자가 Supabase에 등록한 데이터로 교체 ---------- */
  // 세팅 데이터가 필요한 페이지에서만 미리 요청을 보내두고, 라우팅 직전에 기다려요.
  // Supabase가 준비 안 됐거나 등록된 세팅이 없으면 data/setups.js 샘플을 그대로 써요.
  const SETUPS_PAGES = ['home', 'look', 'setup', 'style', 'guide', 'weekend', 'camperjournal'];
  function mapDbSetup(row) {
    let image = '';
    if (row.image_path) {
      try {
        const { data } = window.TENTRIOR.auth.client.storage.from('setup-images').getPublicUrl(row.image_path);
        image = (data && data.publicUrl) || '';
      } catch (e) { /* 스토리지 버킷이 아직 없으면 무시 */ }
    }
    return {
      id: row.id, featured: !!row.featured, date: row.setup_date || (row.created_at || '').slice(0, 10),
      title: row.title, subtitle: row.subtitle || '', style: row.style || '', tent: row.tent || '',
      people: row.people || '', season: row.season || '', image,
      summary: row.summary || '', story: row.story || [], tips: row.tips || [],
      items: row.items || [], budget: row.budget || null, hero: row.hero || null
    };
  }
  async function fetchDbSetups() {
    const auth = window.TENTRIOR.auth;
    if (!auth || !auth.ready) return null;
    try {
      const { data, error } = await auth.client.from('setups').select('*');
      if (error || !data || !data.length) return null;
      return data.map(mapDbSetup);
    } catch (e) { return null; }
  }
  const setupsPromise = SETUPS_PAGES.indexOf(PAGE) !== -1 ? fetchDbSetups() : null;

  /* ---------- helpers ---------- */
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
  const won = (n) => '₩' + Number(n || 0).toLocaleString('ko-KR');
  const param = (k) => new URLSearchParams(location.search).get(k);
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const lines = (v) => esc(v).replace(/\n/g, '<br>');
  const findById = (list, id) => list.find((x) => x.id === id);
  const product = (id) => findById(T.products, id);
  const styleOf = (id) => findById(T.styles, id);
  const tentOf = (id) => findById(T.tents, id);
  const setupOf = (id) => findById(T.setups, id);
  const fmtDate = (d) => String(d || '').replace(/-/g, '.');
  const byDateDesc = (a, b) => String(b.date).localeCompare(String(a.date));

  const CATS = {
    tent: ['TENT', '텐트'], table: ['TABLE', '테이블'], chair: ['CHAIR', '체어'], lantern: ['LIGHTING', '조명'],
    rug: ['RUG', '러그'], storage: ['STORAGE', '수납'], kitchen: ['KITCHEN', '키친'], fabric: ['FABRIC', '패브릭']
  };
  const catKo = (c) => (CATS[c] ? CATS[c][1] : c);
  const catEn = (c) => (CATS[c] ? CATS[c][0] : String(c).toUpperCase());

  // 메인 BEST PICKS 탭 → 카테고리 묶음
  const PICK_TABS = [
    ['all', 'All', null],
    ['tent', 'Tent', ['tent']],
    ['furniture', 'Furniture', ['table', 'chair']],
    ['lighting', 'Lighting', ['lantern']],
    ['tableware', 'Tableware', ['kitchen']],
    ['others', 'Others', ['rug', 'storage', 'fabric']]
  ];

  const ICON = {
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/></svg>',
    bag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1.2 12H6.2Z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>',
    menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    arrow: '<svg class="arr" viewBox="0 0 30 10" aria-hidden="true"><path d="M0 5h28M24 1l4 4-4 4"/></svg>',
    out: '<svg class="out" viewBox="0 0 12 12" aria-hidden="true"><path d="M4 2h6v6M10 2L3 9"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".6"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="M10 9.2v5.6l5-2.8Z"/></svg>',
    blog: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="4.5" width="17" height="15" rx="3"/><path d="M8.5 15.5v-7l7 7v-7"/></svg>'
  };

  // 제품 사진이 없을 때 보여줄 카테고리 아이콘 (64×64 선 그림)
  const CAT_ICON = {
    tent: 'M8 50L32 12L56 50ZM26 50L32 30L38 50',
    table: 'M8 26H56M14 26L10 50M50 26L54 50M16 36H48',
    chair: 'M20 12H44L42 36H22ZM16 36H48M20 36L44 54M44 36L20 54',
    lantern: 'M24 14Q32 4 40 14M22 16H42M24 16V46H40V16M20 50H44M32 26Q37 32 32 38Q27 32 32 26Z',
    rug: 'M12 18H52V46H12ZM18 24H46V40H18ZM12 22H8M12 30H8M12 38H8M52 22H56M52 30H56M52 38H56',
    storage: 'M10 24H54V52H10ZM8 16H56V24H8ZM26 34H38',
    kitchen: 'M14 22H38V46Q38 52 32 52H20Q14 52 14 46ZM38 28H44Q50 28 50 34Q50 40 44 40H38M20 10Q17 14 20 18M28 10Q25 14 28 18',
    fabric: 'M10 20H54V30H10ZM10 30H54V40H10ZM10 40H54V50H10ZM18 20V50M46 20V50'
  };
  function brightness(hex) {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
    if (!m) return 255;
    const n = parseInt(m[1], 16);
    return (((n >> 16) * 299) + (((n >> 8) & 255) * 587) + ((n & 255) * 114)) / 1000;
  }
  function catIcon(cat, swatch) {
    if (!CAT_ICON[cat]) return '';
    const color = brightness(swatch) > 190 ? '#8A5F3D' : swatch;
    return `<svg class="cat-icon" viewBox="0 0 64 64" aria-hidden="true"><path d="${CAT_ICON[cat]}" fill="none" stroke="${esc(color)}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }

  const itemsTotal = (items) => (items || []).reduce((sum, it) => {
    const p = product(it.product);
    return sum + (p ? p.price * (it.qty || 1) : 0);
  }, 0);

  function setMeta(title, desc) {
    if (title) document.title = `${title} | ${BRAND}`;
    const m = $('meta[name="description"]');
    if (desc && m) m.setAttribute('content', desc);
  }

  // GA4 등을 붙이면 자동으로 이벤트가 전송됩니다.
  function track(name, params) {
    if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
  }

  function replaceQuery(state) {
    const q = new URLSearchParams();
    Object.keys(state).forEach((k) => { if (state[k] !== 'all') q.set(k, state[k]); });
    try { history.replaceState(null, '', location.pathname + (q.toString() ? '?' + q : '')); } catch (e) { /* file:// 에서는 무시 */ }
  }

  /* ---------- 샘플 일러스트 (사진이 없을 때) ----------
     mood: 'day'(스타일 색) | 'golden'(노을) | 'night'(밤) */
  const MOODS = {
    golden: { sky: ['#3D5A49', '#C4865A', '#F2C585'], haze: 0.1, orb: ['#FFE0A3', 0.9, 780, 440, 62], trees: ['#2E4A3A', '#1C3427'], treeOp: [0.75, 0.95], ground: '#6A4D36', overlay: ['#3B2414', 0.16], stars: false },
    night: { sky: ['#0D1A14', '#18301F', '#30443A'], haze: 0, orb: ['#F3E7CB', 0.92, 1010, 118, 30], trees: ['#15271D', '#0B1711'], treeOp: [0.9, 1], ground: '#282017', overlay: ['#06100A', 0.44], stars: true }
  };
  const sceneCache = {};

  function scene(styleId, mood) {
    const key = `${styleId}:${mood || 'day'}`;
    if (sceneCache[key]) return sceneCache[key];
    const st = styleOf(styleId) || T.styles[0] || {};
    const c = Object.assign({ sky: '#EFE2CF', ground: '#C9B08D', tent: '#E6D7BF', door: '#7A5B42', rug: '#E3D3B8', wood: '#9C6B43', chair: '#7B5A3E', accent: '#B98B55', fabric: '#A2533A', tree: '#7D8A62' }, st.palette);
    const m = MOODS[mood] || { sky: [c.sky, c.sky, c.sky], haze: 0.45, orb: ['#FFFFFF', 0.5, 1010, 130, 44], trees: [c.tree, c.tree], treeOp: [0.28, 0.5], ground: c.ground, overlay: null, stars: false };

    const pines = (offset, base, scale) => {
      let d = '';
      for (let i = 0; i < 17; i++) {
        const w = (48 + ((i * 29) % 26)) * scale;
        const h = (120 + ((i * 53) % 100)) * scale;
        const x = i * 74 - 30 + offset + ((i * 37) % 28);
        d += `M${x} ${base}L${x + w / 2} ${base - h}L${x + w} ${base}Z`;
      }
      return d;
    };
    const bulbs = [0.08, 0.2, 0.32, 0.44, 0.56, 0.68, 0.8, 0.92].map((t) => {
      const u = 1 - t;
      return [u * u * 415 + 2 * u * t * 760 + t * t * 1120, u * u * 165 + 2 * u * t * 240 + t * t * 235 + 7];
    });
    const stars = m.stars ? Array.from({ length: 36 }, (_, i) =>
      `<circle cx="${(i * 137) % 1200}" cy="${20 + ((i * 89) % 330)}" r="${i % 5 === 0 ? 2 : 1.2}" fill="#FFF6DD" opacity="${(0.35 + ((i * 7) % 5) / 10).toFixed(2)}"/>`).join('') : '';

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${m.sky[0]}"/><stop offset=".62" stop-color="${m.sky[1]}"/><stop offset="1" stop-color="${m.sky[2]}"/></linearGradient>
<linearGradient id="haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="${m.haze}"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></linearGradient>
<radialGradient id="glow"><stop offset="0" stop-color="#FFD58A" stop-opacity=".9"/><stop offset="1" stop-color="#FFD58A" stop-opacity="0"/></radialGradient>
</defs>
<rect width="1200" height="800" fill="url(#sky)"/>
<rect width="1200" height="560" fill="url(#haze)"/>
${stars}
<circle cx="${m.orb[2]}" cy="${m.orb[3]}" r="${m.orb[4]}" fill="${m.orb[0]}" opacity="${m.orb[1]}"/>
<path d="${pines(20, 552, 0.8)}" fill="${m.trees[0]}" opacity="${m.treeOp[0]}"/>
<path d="${pines(-10, 560, 1)}" fill="${m.trees[1]}" opacity="${m.treeOp[1]}"/>
<rect y="548" width="1200" height="252" fill="${m.ground}"/>
<rect y="548" width="1200" height="252" fill="url(#shade)"/>
<ellipse cx="560" cy="702" rx="410" ry="66" fill="${c.rug}"/>
<ellipse cx="560" cy="702" rx="365" ry="50" fill="none" stroke="${c.door}" stroke-opacity=".2" stroke-width="3" stroke-dasharray="14 12"/>
<ellipse cx="415" cy="592" rx="340" ry="24" fill="#000" opacity=".12"/>
<line x1="415" y1="150" x2="30" y2="610" stroke="${c.door}" stroke-opacity=".35" stroke-width="2"/>
<polygon points="95,588 415,150 735,588" fill="${c.tent}"/>
<polygon points="415,150 735,588 575,588" fill="#000" opacity=".06"/>
<path d="M330 588L415 300L500 588Z" fill="${c.door}" opacity=".78"/>
<path d="M415 300L500 588L552 588Z" fill="${c.tent}"/>
<path d="M415 300L500 588L552 588Z" fill="#000" opacity=".08"/>
<line x1="415" y1="152" x2="415" y2="112" stroke="${c.door}" stroke-width="6" stroke-linecap="round"/>
<rect x="600" y="498" width="290" height="16" rx="4" fill="${c.wood}"/>
<rect x="616" y="514" width="11" height="94" fill="${c.wood}"/>
<rect x="863" y="514" width="11" height="94" fill="${c.wood}"/>
<rect x="616" y="566" width="258" height="7" fill="${c.wood}" opacity=".7"/>
<ellipse cx="700" cy="494" rx="38" ry="7" fill="#fff" opacity=".92"/>
<rect x="766" y="466" width="20" height="30" rx="4" fill="${c.accent}"/>
<rect x="822" y="452" width="14" height="44" rx="5" fill="${c.door}" opacity=".7"/>
<path d="M940 372Q995 356 1050 372L1044 540L946 540Z" fill="${c.chair}"/>
<path d="M925 540L1065 540L1052 578L938 578Z" fill="${c.chair}"/>
<path d="M925 540L1065 540L1052 578L938 578Z" fill="#000" opacity=".12"/>
<line x1="944" y1="578" x2="1052" y2="652" stroke="${c.wood}" stroke-width="8" stroke-linecap="round"/>
<line x1="1046" y1="578" x2="938" y2="652" stroke="${c.wood}" stroke-width="8" stroke-linecap="round"/>
<path d="M966 384L1018 384L1026 596L958 596Z" fill="${c.fabric}"/>
<path d="M962 430H1020M961 480H1022M960 530H1024M959 575H1025" stroke="${c.door}" stroke-opacity=".22" stroke-width="5"/>
<rect x="112" y="604" width="168" height="94" rx="6" fill="${c.accent}"/>
<rect x="106" y="596" width="180" height="18" rx="5" fill="${c.door}" opacity=".55"/>
<rect x="176" y="636" width="40" height="8" rx="4" fill="${c.door}" opacity=".4"/>
${m.overlay ? `<rect width="1200" height="800" fill="${m.overlay[0]}" opacity="${m.overlay[1]}"/>` : ''}
<path d="M415 165Q760 240 1120 235" fill="none" stroke="${c.door}" stroke-opacity=".55" stroke-width="2"/>
${bulbs.map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="18" fill="url(#glow)"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6" fill="#FFE9B5"/>`).join('')}
<line x1="640" y1="206" x2="640" y2="292" stroke="${c.door}" stroke-width="3"/>
<circle cx="640" cy="322" r="${mood === 'night' ? 160 : 120}" fill="url(#glow)"/>
<rect x="628" y="284" width="24" height="10" rx="3" fill="${c.door}"/>
<rect x="620" y="294" width="40" height="54" rx="9" fill="${c.accent}"/>
<rect x="629" y="302" width="22" height="38" rx="6" fill="#FFEBC0"/>
</svg>`;
    sceneCache[key] = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    return sceneCache[key];
  }

  const imgSrc = (src, styleId, mood) => (src ? ROOT + src : scene(styleId, mood));
  const setupImg = (s, mood) => imgSrc(s.image, s.style, mood);

  /* ---------- layout ---------- */
  const NAV = [
    { label: '텐트리어', href: 'look.html', match: ['look', 'setup', 'style', 'guide'] },
    { label: '텐들이', href: 'tendeuli.html', match: ['tendeuli', 'tendeuli-submit'] },
    { label: '캠퍼저널', href: 'camperjournal.html', match: ['camperjournal'] },
    { label: '텐트리어 픽', href: 'pick.html', match: ['pick'] }
  ];

  function logoHTML() {
    if (S.logoImage) return `<span class="logo-img"><img src="${ROOT}${esc(S.logoImage)}" alt="${esc(BRAND)}"></span>`;
    return `<span class="logo-text">${esc(S.name || 'TENTRIOR')}</span>`;
  }

  function renderHeader() {
    const holder = document.getElementById('header');
    if (!holder) return;
    const activeHref = (NAV.find((n) => n.match.includes(PAGE)) || {}).href;
    holder.insertAdjacentHTML('beforebegin', `
      ${S.sampleNotice ? '<div class="sample-notice"><b>샘플 모드</b> · 지금 보이는 사진과 제품은 예시 데이터예요.</div>' : ''}
      <header class="site-header">
        <div class="container nav-wrap">
          <a class="logo" href="${ROOT}index.html" aria-label="${esc(BRAND)} 홈">${logoHTML()}</a>
          <nav class="nav" aria-label="주요 메뉴">
            ${NAV.map((n) => `<a href="${ROOT}${n.href}"${n.href === activeHref ? ' class="active" aria-current="page"' : ''}>${n.label}</a>`).join('')}
          </nav>
          <div class="nav-tools">
            <button type="button" class="icon-btn search-open" aria-label="검색">${ICON.search}</button>
            <a class="icon-btn" href="${ROOT}pick.html" aria-label="텐트리어 픽 보기">${ICON.bag}</a>
            <span id="auth-slot"></span>
            <button type="button" class="icon-btn nav-toggle" aria-label="메뉴 열기" aria-expanded="false">${ICON.menu}</button>
          </div>
        </div>
      </header>
      <div class="search-layer" hidden>
        <div class="search-panel" role="dialog" aria-modal="true" aria-label="사이트 검색">
          <div class="container">
            <div class="search-row">${ICON.search}<input class="search-input" type="search" placeholder="세팅, 아이템, 텐트, 스타일을 검색해보세요" aria-label="검색어" autocomplete="off"><button type="button" class="icon-btn search-close" aria-label="검색 닫기">${ICON.close}</button></div>
            <div class="search-results"></div>
          </div>
        </div>
      </div>`);
    holder.remove();

    const btn = $('.nav-toggle');
    const nav = $('.nav');
    btn.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
      btn.innerHTML = open ? ICON.close : ICON.menu;
    });
    bindSearch();
  }

  /* ---------- 검색 ---------- */
  function buildIndex() {
    const idx = [];
    const add = (o, words) => idx.push(Object.assign(o, { text: words.filter(Boolean).join(' ').toLowerCase() }));
    T.setups.forEach((s) => {
      const st = styleOf(s.style) || {};
      const tent = tentOf(s.tent) || {};
      add({ type: 'SETUP', title: s.title, sub: s.subtitle, href: `${ROOT}setup.html?id=${encodeURIComponent(s.id)}` },
        [s.title, s.subtitle, s.summary, st.name, st.ko, tent.name, s.season, s.people]);
    });
    T.products.forEach((p) => add({ type: 'ITEM', title: p.name, sub: `${p.brand} · ${catKo(p.category)} · ${won(p.price)}`, href: p.url || '#', external: true, id: p.id },
      [p.name, p.brand, catKo(p.category), catEn(p.category), p.color, p.material]));
    T.tents.forEach((t) => add({ type: 'GUIDE', title: `${t.name} 꾸미기`, sub: `${t.type} · ${t.capacity}`, href: `${ROOT}guide.html?t=${encodeURIComponent(t.id)}` },
      [t.name, t.short, t.type, t.intro]));
    T.styles.forEach((st) => add({ type: 'STYLE', title: `${st.name} · ${st.ko}`, sub: st.mood, href: `${ROOT}style.html?s=${encodeURIComponent(st.id)}` },
      [st.name, st.ko, st.mood, (st.keywords || []).join(' ')]));
    T.tendeuli.forEach((td) => add({ type: 'TENDEULI', title: td.title, sub: `${td.nickname} · ${td.place}`, href: `${ROOT}tendeuli.html?id=${encodeURIComponent(td.id)}` },
      [td.title, td.nickname, td.tent, td.place, td.intro]));
    T.camperjournal.forEach((a) => add({ type: 'CAMPERJOURNAL', title: a.title, sub: a.category, href: `${ROOT}camperjournal.html?id=${encodeURIComponent(a.id)}` },
      [a.title, a.category, a.excerpt, (a.tags || []).join(' ')]));
    T.journal.forEach((j) => add({ type: 'WEEKEND', title: j.title, sub: `${fmtDate(j.date)} · ${j.place}`, href: `${ROOT}weekend.html?id=${encodeURIComponent(j.id)}` },
      [j.title, j.excerpt, j.place]));
    return idx;
  }

  function bindSearch() {
    const layer = $('.search-layer');
    if (!layer) return;
    const input = $('.search-input', layer);
    const out = $('.search-results', layer);
    const SUGGEST = ['우드', '크림', '랜턴', '러그', '티피', '2인'];
    let index = null;

    const suggestHTML = () => `<div class="search-suggest"><span class="eyebrow" style="margin:0 8px 0 0">Suggest</span>${SUGGEST.map((w) => `<button type="button" class="chip" data-q="${esc(w)}">${esc(w)}</button>`).join('')}</div>`;
    const hitHTML = (h) => `<a class="search-hit" href="${esc(h.href)}"${h.external ? ` target="_blank" rel="sponsored noopener" data-track="${esc(h.id)}"` : ''}><span class="t">${esc(h.title)}${h.external ? ICON.out : ''}</span><span class="s">${esc(h.sub)}</span></a>`;

    function render() {
      const q = input.value.trim().toLowerCase();
      if (!q) { out.innerHTML = suggestHTML(); return; }
      index = index || buildIndex();
      const terms = q.split(/\s+/);
      const hits = index.filter((it) => terms.every((t) => it.text.includes(t)));
      if (!hits.length) {
        out.innerHTML = `<p class="search-empty">‘${esc(input.value.trim())}’에 맞는 결과가 없어요. 다른 단어로 찾아보세요.</p>${suggestHTML()}`;
        return;
      }
      const GROUP_LABEL = { SETUP: 'SETUP', TENDEULI: '텐들이', CAMPERJOURNAL: '캠퍼저널', ITEM: 'ITEM', GUIDE: 'GUIDE', STYLE: 'STYLE', WEEKEND: 'WEEKEND' };
      out.innerHTML = Object.keys(GROUP_LABEL).map((g) => {
        const list = hits.filter((h) => h.type === g).slice(0, 6);
        return list.length ? `<div class="search-group"><p class="eyebrow">${GROUP_LABEL[g]}</p>${list.map(hitHTML).join('')}</div>` : '';
      }).join('');
    }

    const open = () => { layer.hidden = false; document.body.classList.add('no-scroll'); render(); setTimeout(() => input.focus(), 30); };
    const close = () => { layer.hidden = true; document.body.classList.remove('no-scroll'); };
    $$('.search-open').forEach((b) => b.addEventListener('click', open));
    $('.search-close', layer).addEventListener('click', close);
    layer.addEventListener('click', (e) => {
      const chip = e.target.closest('[data-q]');
      if (chip) { input.value = chip.dataset.q; render(); input.focus(); return; }
      if (!e.target.closest('.search-panel')) close();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !layer.hidden) close(); });
    input.addEventListener('input', render);
    input.addEventListener('change', () => { if (input.value.trim()) track('search', { search_term: input.value.trim() }); });
  }

  function renderFooter() {
    const holder = document.getElementById('footer');
    if (!holder) return;
    const sns = [['instagram', 'Instagram', S.instagram], ['blog', 'Naver Blog', S.blog], ['youtube', 'YouTube', S.youtube]].filter((x) => x[2]);
    holder.outerHTML = `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-top">
          <div>
            <a class="footer-logo" href="${ROOT}index.html">${esc(S.name)}<span class="footer-logo-ko">${esc(S.nameKo)}</span></a>
            <p class="footer-slogan">${esc(S.slogan)}</p>
            <p style="margin:0">${esc(S.definition)}</p>
            ${sns.length ? `<div class="sns">${sns.map(([k, l, h]) => `<a href="${esc(h)}" target="_blank" rel="noopener" aria-label="${l}">${ICON[k]}</a>`).join('')}</div>` : ''}
          </div>
          <div>
            <p class="foot-title">Explore</p>
            <ul>${NAV.map((n) => `<li><a href="${ROOT}${n.href}">${n.label}</a></li>`).join('')}</ul>
          </div>
          <div>
            <p class="foot-title">Tentrior</p>
            <ul>
              <li><a href="${ROOT}about.html">브랜드 소개</a></li>
              <li><a href="${ROOT}about.html#partnership">브랜드 협업 문의</a></li>
              <li><a href="mailto:${esc(S.email)}">${esc(S.email)}</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p>${esc(S.disclosure)}</p>
          <p class="copy">© ${new Date().getFullYear()} ${esc(S.name)}. All rights reserved.</p>
        </div>
      </div>
    </footer>`;
  }

  /* ---------- components ---------- */
  function buyLink(p, label, cls) {
    return `<a${cls ? ` class="${cls}"` : ''} href="${esc(p.url || '#')}" target="_blank" rel="sponsored noopener" data-track="${esc(p.id)}">${label}</a>`;
  }

  function pageHead(eyebrow, title, desc, crumb) {
    return `<section class="page-head"><div class="container">${crumb || ''}<p class="eyebrow">${eyebrow}</p><h1>${title}</h1>${desc ? `<p>${desc}</p>` : ''}</div></section>`;
  }

  function setupCard(s) {
    const st = styleOf(s.style) || {};
    return `
    <a class="card" href="${ROOT}setup.html?id=${encodeURIComponent(s.id)}">
      <div class="card-img"><img src="${setupImg(s)}" alt="${esc(s.title)}" loading="lazy"><span class="badge">Setup #${esc(s.id)}</span></div>
      <div class="card-body">
        <p class="card-meta">${esc(st.name)} · ${esc(s.people)} · ${esc(s.season)}</p>
        <h3 class="en-title">${esc(s.title)}</h3>
        <p class="card-sub">${esc(s.subtitle)}</p>
        <p class="card-price">구성가 <b>${won(itemsTotal(s.items))}</b></p>
      </div>
    </a>`;
  }

  function productCard(p, withNote) {
    const visual = p.image ? `<img src="${ROOT}${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">` : catIcon(p.category, p.swatch);
    return `
    <article class="product-card">
      <a class="product-img" href="${esc(p.url || '#')}" target="_blank" rel="sponsored noopener" data-track="${esc(p.id)}" aria-label="${esc(p.name)} 구매 페이지로 이동">
        ${visual}${p.pick ? '<span class="pick-badge">PICK</span>' : ''}
      </a>
      <div class="product-info">
        <p class="p-brand">${esc(p.brand)}</p>
        <h4 class="p-name">${esc(p.name)}</h4>
        <p class="p-price">${won(p.price)}</p>
        ${withNote && p.pickNote ? `<p class="pick-note">${esc(p.pickNote)}</p>` : ''}
        ${buyLink(p, `구매하러 가기 ${ICON.out}`, 'p-link')}
      </div>
    </article>`;
  }

  function guideCard(t) {
    const count = T.setups.filter((s) => s.tent === t.id).length;
    return `
    <a class="card" href="${ROOT}guide.html?t=${encodeURIComponent(t.id)}">
      <div class="card-img"><img src="${imgSrc(t.image, t.style)}" alt="${esc(t.name)} 꾸미기" loading="lazy"><span class="badge">${esc(t.capacity)}</span></div>
      <div class="card-body">
        <p class="card-meta">${esc(t.type)}</p>
        <h3>${esc(t.name)} 꾸미기</h3>
        <p class="card-sub">스타일링 세팅 ${count}개</p>
      </div>
    </a>`;
  }

  function tendeuliCard(td) {
    const st = styleOf(td.style) || {};
    return `
    <a class="card" href="${ROOT}tendeuli.html?id=${encodeURIComponent(td.id)}">
      <div class="card-img"><img src="${imgSrc(td.image, td.style, td.mood)}" alt="${esc(td.title)}" loading="lazy"><span class="badge">${esc(td.nickname)}</span></div>
      <div class="card-body">
        <p class="card-meta">${esc(st.name)} · ${esc(td.season)} · ${esc(td.people)}</p>
        <h3>${esc(td.title)}</h3>
        <p class="card-sub">${esc(td.place)} · ${esc(td.tent)}</p>
      </div>
    </a>`;
  }

  function tendeuliItemsHTML(items) {
    return `<ol class="item-list">${(items || []).map((it, i) => {
      const p = it.product && product(it.product);
      return `
      <li class="item" data-row="${i}">
        <span class="num">${i + 1}</span>
        <div class="name">${esc(it.name)}</div>
        <div class="right">${p ? buyLink(p, '제품 보기 →') : ''}</div>
      </li>`;
    }).join('')}</ol>`;
  }

  function camperjournalCard(a) {
    return `
    <a class="card" href="${ROOT}camperjournal.html?id=${encodeURIComponent(a.id)}">
      <div class="card-img"><img src="${imgSrc(a.image, a.style || 'natural', 'day')}" alt="${esc(a.title)}" loading="lazy"><span class="badge">${esc(a.category)}</span></div>
      <div class="card-body">
        <p class="card-meta">${fmtDate(a.date)}</p>
        <h3>${esc(a.title)}</h3>
        <p class="card-sub">${esc(a.excerpt)}</p>
      </div>
    </a>`;
  }

  function styleTile(st) {
    return `
    <a class="style-tile" href="${ROOT}style.html?s=${encodeURIComponent(st.id)}">
      <img src="${imgSrc(st.image, st.id)}" alt="${esc(st.ko)}" loading="lazy">
      <div class="label"><strong>${esc(st.name)}</strong><span>${esc(st.mood)}</span></div>
    </a>`;
  }

  function swatches(st) {
    const p = st.palette || {};
    return `<div class="swatches">${[p.tent, p.rug, p.wood, p.chair, p.accent].map((c) => `<i style="background:${esc(c)}"></i>`).join('')}</div>`;
  }

  function itemListHTML(items) {
    return `<ol class="item-list">${items.map((it, i) => {
      const p = product(it.product);
      if (!p) return '';
      const qty = it.qty || 1;
      return `
      <li class="item" data-row="${i}">
        <span class="num">${i + 1}</span>
        <div>
          <div class="name">${esc(p.name)}${qty > 1 ? ` <span class="sub">× ${qty}</span>` : ''}</div>
          <div class="sub">${esc(p.brand)} · ${catKo(p.category)}${it.note ? ' · ' + esc(it.note) : ''}</div>
        </div>
        <div class="right">${won(p.price * qty)}${buyLink(p, '구매하기 →')}</div>
      </li>`;
    }).join('')}</ol>`;
  }

  function compareHTML(s) {
    const orig = itemsTotal(s.items);
    const alt = itemsTotal(s.budget.items);
    const pct = orig ? Math.round((1 - alt / orig) * 100) : 0;
    const list = (items) => `<ul class="mini-list">${items.map((it) => {
      const p = product(it.product);
      const qty = it.qty || 1;
      return p ? `<li><span>${buyLink(p, esc(p.name))}${qty > 1 ? ` × ${qty}` : ''}</span><span>${won(p.price * qty)}</span></li>` : '';
    }).join('')}</ul>`;
    return `
    <div class="compare">
      <div class="col"><p class="eyebrow">Original</p><div class="big">${won(orig)}</div>${list(s.items)}</div>
      <div class="col hl"><p class="eyebrow">Budget Version</p><div class="big">${won(alt)}${pct > 0 ? `<span class="save">-${pct}%</span>` : ''}</div>${list(s.budget.items)}</div>
    </div>
    ${s.budget.note ? `<p class="muted small" style="margin-top:14px">${esc(s.budget.note)}</p>` : ''}`;
  }

  function newsletterHTML() {
    return `
    <section class="newsletter-section">
      <div class="container newsletter">
        <p class="eyebrow">Tentrior Letter</p>
        <h2>다음 캠핑을 조금 더 우리답게.</h2>
        <p>따라 하고 싶은 캠핑 세팅과 새로 발견한 아이템을 보내드려요.</p>
        ${S.newsletterUrl
          ? `<div style="margin-top:26px"><a class="btn gold" href="${esc(S.newsletterUrl)}" target="_blank" rel="noopener">Subscribe ${ICON.arrow}</a></div>`
          : `<form id="newsletter-form"><input type="email" required placeholder="이메일 주소" aria-label="이메일 주소"><button class="btn gold" type="submit">Subscribe</button></form><p class="form-msg" aria-live="polite"></p>`}
      </div>
    </section>`;
  }

  function bindNewsletter() {
    const form = $('#newsletter-form');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      // 뉴스레터 서비스(data/site.js 의 newsletterUrl)를 연결하기 전까지는 이메일을 저장하지 않습니다.
      $('.form-msg').textContent = '뉴스레터는 곧 오픈해요. 조금만 기다려주세요!';
      form.reset();
    });
  }

  function notFound(msg, href, label) {
    app.innerHTML = `<section class="section"><div class="container empty"><h2>${esc(msg)}</h2><p><a class="btn ko" href="${href}">${label}</a></p></div></section>`;
  }

  /* ---------- SHOP THE SETUP (사진 위 번호) ---------- */
  function shoppableHTML(s) {
    return `
    <div class="shoppable">
      <img src="${setupImg(s)}" alt="${esc(s.title)} 캠핑 세팅">
      ${s.items.map((it, i) => (it.x == null || !product(it.product)) ? '' :
        `<button type="button" class="dot" style="left:${Number(it.x)}%;top:${Number(it.y)}%" data-i="${i}" aria-label="${i + 1}번 제품 보기">${i + 1}</button>`).join('')}
    </div>`;
  }

  function bindShoppable(scope, s) {
    const box = scope && $('.shoppable', scope);
    if (!box) return;
    const rows = $$('.item[data-row]', scope);

    function close() {
      $$('.pop', box).forEach((p) => p.remove());
      $$('.dot', box).forEach((d) => d.classList.remove('active'));
      rows.forEach((r) => r.classList.remove('active'));
    }

    function open(i) {
      const it = s.items[i];
      const p = it && product(it.product);
      if (!p) return;
      close();
      const row = rows.find((r) => Number(r.dataset.row) === i);
      if (row) row.classList.add('active');
      const dot = $(`.dot[data-i="${i}"]`, box);
      if (!dot) return;
      dot.classList.add('active');

      const qty = it.qty || 1;
      const pop = document.createElement('div');
      pop.className = 'pop';
      pop.innerHTML = `
        <button type="button" class="pop-close" aria-label="닫기">×</button>
        <p class="eyebrow">${i + 1} · ${catEn(p.category)}</p>
        <strong>${esc(p.name)}${qty > 1 ? ` × ${qty}` : ''}</strong>
        <p class="p-price">${won(p.price)}</p>
        ${buyLink(p, '제품 보러가기', 'btn accent btn-sm ko')}`;
      box.appendChild(pop);

      // 팝업이 사진 밖으로 나가지 않도록 위치 계산
      const W = box.clientWidth, H = box.clientHeight;
      const dx = (it.x / 100) * W, dy = (it.y / 100) * H;
      const pw = pop.offsetWidth, ph = pop.offsetHeight;
      let left = dx + 22;
      if (left + pw > W - 8) left = dx - 22 - pw;
      left = Math.max(8, Math.min(left, W - pw - 8));
      pop.style.left = left + 'px';
      pop.style.top = Math.max(8, Math.min(dy - 20, H - ph - 8)) + 'px';
      track('hotspot_open', { setup_id: s.id, product_id: p.id });
    }

    box.addEventListener('click', (e) => {
      const dot = e.target.closest('.dot');
      if (dot) { dot.classList.contains('active') ? close() : open(Number(dot.dataset.i)); return; }
      if (e.target.closest('.pop-close') || !e.target.closest('.pop')) close();
    });
    rows.forEach((r) => r.addEventListener('click', (e) => {
      if (e.target.closest('a')) return;
      open(Number(r.dataset.row));
      if (window.innerWidth <= 900) box.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }));
    let lastW = window.innerWidth;
    window.addEventListener('resize', () => { if (window.innerWidth !== lastW) { lastW = window.innerWidth; close(); } });
  }

  /* ---------- filters ---------- */
  function chipRow(label, key, options) {
    return `
    <div class="chip-row" data-key="${key}">
      <span class="chip-label">${label}</span>
      <button type="button" class="chip" data-v="all">전체</button>
      ${options.map(([v, l]) => `<button type="button" class="chip" data-v="${esc(v)}">${esc(l)}</button>`).join('')}
    </div>`;
  }

  function bindFilters(state, render) {
    const sync = () => $$('.chip-row', app).forEach((row) =>
      $$('.chip', row).forEach((c) => c.classList.toggle('active', c.dataset.v === state[row.dataset.key])));
    app.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip-row .chip');
      if (!chip) return;
      state[chip.closest('.chip-row').dataset.key] = chip.dataset.v;
      replaceQuery(state);
      sync();
      render();
    });
    sync();
    render();
  }

  /* ---------- hero slider ---------- */
  function heroHTML(slides) {
    const n = slides.length;
    return `
    <section class="hero" aria-roledescription="carousel" aria-label="이번 주 텐트리어 캠핑">
      ${slides.map((s, i) => {
        const h = s.hero || {};
        const tag = i === 0 ? 'h1' : 'h2';
        return `
        <div class="hero-slide${i === 0 ? ' is-active' : ''}" aria-hidden="${i === 0 ? 'false' : 'true'}">
          <img src="${setupImg(s, h.mood || 'golden')}" alt="${esc(s.title)}">
          <div class="container hero-content">
            <p class="eyebrow">Our Weekend</p>
            <${tag} class="hero-title">${lines(h.title || s.title)}</${tag}>
            <p class="hero-sub">${esc(h.sub || s.summary)}</p>
            <a class="btn line-light" href="setup.html?id=${encodeURIComponent(s.id)}"${i === 0 ? '' : ' tabindex="-1"'}>Explore ${ICON.arrow}</a>
          </div>
        </div>`;
      }).join('')}
      <div class="container hero-ui">
        <div class="hero-count">
          ${n > 1 ? `<button type="button" class="hero-arrow hero-prev" aria-label="이전 슬라이드">${ICON.arrow}</button>` : ''}
          <span class="cur">01</span><i class="bar"><b style="width:${100 / n}%"></b></i><span>${String(n).padStart(2, '0')}</span>
          ${n > 1 ? `<button type="button" class="hero-arrow hero-next" aria-label="다음 슬라이드">${ICON.arrow}</button>` : ''}
        </div>
        <p class="hero-vertical" aria-hidden="true">${esc(S.tagline || 'Camping style for our life')}</p>
      </div>
    </section>`;
  }

  function bindHero() {
    const hero = $('.hero');
    if (!hero) return;
    const slides = $$('.hero-slide', hero);
    const n = slides.length;
    if (n < 2) return;
    const cur = $('.cur', hero);
    const bar = $('.bar b', hero);
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let i = 0;
    let timer = null;

    function go(k) {
      slides[i].classList.remove('is-active');
      slides[i].setAttribute('aria-hidden', 'true');
      $$('a', slides[i]).forEach((a) => a.setAttribute('tabindex', '-1'));
      i = (k + n) % n;
      slides[i].classList.add('is-active');
      slides[i].setAttribute('aria-hidden', 'false');
      $$('a', slides[i]).forEach((a) => a.removeAttribute('tabindex'));
      cur.textContent = String(i + 1).padStart(2, '0');
      bar.style.width = ((i + 1) / n) * 100 + '%';
      restart();
    }
    function restart() {
      clearTimeout(timer);
      if (!reduce) timer = setTimeout(() => go(i + 1), 6500);
    }
    $('.hero-prev', hero).addEventListener('click', () => go(i - 1));
    $('.hero-next', hero).addEventListener('click', () => go(i + 1));
    hero.addEventListener('mouseenter', () => clearTimeout(timer));
    hero.addEventListener('mouseleave', restart);
    restart();
  }

  /* ============================================================
     PAGES
     ============================================================ */

  /* ---------- HOME ---------- */
  function pageHome() {
    const auth = window.TENTRIOR.auth || { ready: false };
    const setups = T.setups.slice().sort(byDateDesc);
    if (!setups.length) return notFound('아직 등록된 세팅이 없어요.', 'about.html', '텐트리어 소개 보기');
    let slides = setups.filter((s) => s.hero).slice(0, 5);
    if (!slides.length) slides = [setups.find((s) => s.featured) || setups[0]];
    const look = setupOf(S.homeShopTheLook) || setups[0];
    const latest = T.journal.slice().sort(byDateDesc)[0];
    const tileImg = S.tileImages || {};
    const bannerImg = S.bannerImages || {};
    const tiles = [
      ['tentrior', '텐트리어', '우리가 꾸민 캠핑 세팅', 'look.html', 'midcentury', 'golden'],
      ['tendeuli', '텐들이', '캠퍼들의 캠핑 집들이', 'tendeuli.html', 'natural', 'day'],
      ['camperjournal', '캠퍼저널', '캠핑 팁과 노하우', 'camperjournal.html', 'white', 'day'],
      ['pick', '텐트리어 픽', '우리가 고른 아이템', 'pick.html', 'japandi', 'night']
    ];

    app.innerHTML = `
    ${heroHTML(slides)}

    <section class="tiles-section"><div class="container"><div class="tiles">
      ${tiles.map(([k, en, ko, href, st, mood]) => `
      <a class="tile" href="${href}">
        <div class="tile-img"><img src="${tileImg[k] ? ROOT + esc(tileImg[k]) : scene(st, mood)}" alt="" loading="lazy"></div>
        <div class="tile-body"><strong>${en}</strong><span>${ko}</span></div>
      </a>`).join('')}
    </div></div></section>

    <section class="section brand-intro"><div class="container">
      <div class="ornament"></div>
      <p class="eyebrow">Tentrior</p>
      <h2 class="slogan">${esc(S.slogan)}</h2>
      <p class="definition">${esc(S.definition)}<br>예쁜 캠핑을 보고, 그 안에 담긴 스타일과 아이템을 발견해보세요.</p>
      <div class="brand-points">
        <div class="brand-point"><span class="num">01</span><strong>따라 하고 싶은 캠핑 스타일</strong><p>사진만 예쁜 캠핑이 아니라, 실제로 따라 할 수 있는 세팅을 보여드려요.</p></div>
        <div class="brand-point"><span class="num">02</span><strong>예쁘고 실용적인 아이템</strong><p>사진 속 아이템과 가격, 고르는 이유까지 한 번에 알려드려요.</p></div>
        <div class="brand-point"><span class="num">03</span><strong>부부가 즐기는 진짜 캠핑</strong><p>직접 머물고 써본 것만 소개해요. 아쉬웠던 점도 솔직하게.</p></div>
      </div>
    </div></section>

    <section class="section alt"><div class="container">
      <div class="line-head">
        <h2 class="caps-title">Best Picks</h2><span class="rule"></span>
        <div class="bp-tabs" role="tablist">${PICK_TABS.map(([k, label]) => `<button type="button" class="bp-tab" role="tab" data-tab="${k}">${label}</button>`).join('')}</div>
        <a class="link-more" href="pick.html" aria-label="텐트리어 픽 전체 보기">${ICON.arrow}</a>
      </div>
      <div class="products-row" id="best-grid"></div>
    </div></section>

    <section class="section" id="shop-the-look"><div class="container">
      <div class="section-head"><div><p class="eyebrow">Shop the Look</p><h2>사진 속 아이템을 발견해보세요</h2><p>사진 위 번호를 누르면 어떤 제품인지 바로 알 수 있어요.</p></div></div>
      <div class="setup-layout">
        <div class="sticky">${shoppableHTML(look)}</div>
        <div>
          <p class="eyebrow">Setup #${esc(look.id)} · ${esc((styleOf(look.style) || {}).name)}</p>
          <h3 class="en-title" style="font-size:1.9rem">${esc(look.title)}</h3>
          ${itemListHTML(look.items)}
          <div class="total"><span>이 세팅 그대로 구성하면</span><strong>${won(itemsTotal(look.items))}</strong></div>
          <div class="btn-row" style="margin-top:22px"><a class="btn accent" href="setup.html?id=${encodeURIComponent(look.id)}">Shop the Setup ${ICON.arrow}</a></div>
        </div>
      </div>
    </div></section>

    <section class="banners">
      <a class="banner" href="look.html">
        <img src="${bannerImg.style ? ROOT + esc(bannerImg.style) : scene('natural', 'golden')}" alt="" loading="lazy">
        <div class="banner-body">
          <p class="eyebrow">Camping Style</p>
          <h2>계절이 바뀌어도,<br>좋아하는 취향은 그대로.</h2>
          <p>텐트리어가 제안하는 계절별 캠핑 스타일</p>
          <span class="btn line-light">View More ${ICON.arrow}</span>
        </div>
      </a>
      <a class="banner bottom" href="tendeuli.html">
        <img src="${bannerImg.tendeuli ? ROOT + esc(bannerImg.tendeuli) : scene('white', 'day')}" alt="" loading="lazy">
        <div class="banner-body">
          <p class="eyebrow">Tendeuli</p>
          <h3>당신의 캠핑도<br>텐들이에 소개해보세요.</h3>
          <span class="btn line-light" style="margin-top:20px">참여 방법 보기 ${ICON.arrow}</span>
        </div>
        <span class="banner-mark">${esc(S.tendeuliHashtag || '')}</span>
      </a>
    </section>

    <div id="ad-banners-slot"></div>

    ${latest ? `
    <section class="section"><div class="container">
      <div class="section-head"><div><p class="eyebrow">Tentrior Weekend</p><h2>이번 주 우리는 여기에서 머물렀어요</h2></div><a class="link-more" href="weekend.html">Weekend ${ICON.arrow}</a></div>
      ${journalRow(latest)}
    </div></section>` : ''}

    ${newsletterHTML()}`;

    bindHero();
    bindBestPicks();
    bindShoppable($('#shop-the-look'), look);
    bindNewsletter();
    if (auth.ready) fetchActiveAds().then((ads) => {
      const slot = $('#ad-banners-slot', app);
      if (slot && ads.length) slot.outerHTML = adBannersHTML(ads);
    });
  }

  function bindBestPicks() {
    const grid = $('#best-grid');
    if (!grid) return;
    const tabs = $$('.bp-tab');
    const sorted = T.products.slice().sort((a, b) => (b.pick ? 1 : 0) - (a.pick ? 1 : 0));
    function render(key) {
      const tab = PICK_TABS.find((t) => t[0] === key) || PICK_TABS[0];
      // ALL 은 카테고리별로 하나씩 골고루 보여줘요
      const list = tab[2]
        ? sorted.filter((p) => tab[2].includes(p.category)).slice(0, 5)
        : ['tent', 'chair', 'lantern', 'table', 'storage', 'rug', 'kitchen', 'fabric'].map((c) => sorted.find((p) => p.category === c)).filter(Boolean).slice(0, 5);
      tabs.forEach((b) => {
        const on = b.dataset.tab === tab[0];
        b.classList.toggle('active', on);
        b.setAttribute('aria-selected', String(on));
      });
      grid.innerHTML = list.length ? list.map((p) => productCard(p)).join('') : '<p class="empty">준비 중이에요.</p>';
    }
    tabs.forEach((b) => b.addEventListener('click', () => render(b.dataset.tab)));
    render('all');
  }

  /* ---------- LOOK ---------- */
  function pageLook() {
    const setups = T.setups.slice().sort(byDateDesc);
    const state = { style: param('style') || 'all' };
    if (state.style !== 'all' && !styleOf(state.style)) state.style = 'all';

    app.innerHTML = `
    ${pageHead('Tentrior', '텐트리어', '우리가 직접 꾸민 텐트와 캠핑 세팅이에요. 텐트별·스타일별로 둘러보고, 사진 속 제품까지 확인해보세요.')}
    <section class="section tight" style="padding-bottom:0"><div class="container">
      <div class="line-head"><h2 class="caps-title">By Tent</h2><span class="rule"></span><a class="link-more" href="guide.html">Guide ${ICON.arrow}</a></div>
      <div class="grid g-4">${T.tents.slice(0, 4).map(guideCard).join('')}</div>
    </div></section>
    <section class="section"><div class="container">
      <div class="line-head"><h2 class="caps-title">All Setups</h2><span class="rule"></span><a class="link-more" href="style.html">Find Your Style ${ICON.arrow}</a></div>
      <div class="filters">
        ${chipRow('스타일', 'style', T.styles.filter((st) => setups.some((s) => s.style === st.id)).map((st) => [st.id, st.name]))}
      </div>
      <p class="result-count"></p>
      <div class="grid g-3" id="grid"></div>
    </div></section>`;

    bindFilters(state, () => {
      const list = setups.filter((s) => state.style === 'all' || s.style === state.style);
      $('.result-count', app).textContent = `세팅 ${list.length}개`;
      $('#grid', app).innerHTML = list.length ? list.map(setupCard).join('') : '<p class="empty" style="grid-column:1/-1">조건에 맞는 세팅이 아직 없어요.</p>';
    });
  }

  /* ---------- SETUP DETAIL ---------- */
  function pageSetup() {
    const s = setupOf(param('id'));
    if (!s) return notFound('세팅을 찾을 수 없어요.', 'look.html', '텐트리어로 돌아가기');
    const st = styleOf(s.style) || {};
    const tent = tentOf(s.tent);
    setMeta(`${s.title} — SETUP #${s.id}`, s.summary);
    const score = (x) => (x.style === s.style ? 2 : 0) + (x.tent === s.tent ? 1 : 0);
    const related = T.setups.filter((x) => x.id !== s.id).sort((a, b) => score(b) - score(a)).slice(0, 3);

    app.innerHTML = `
    <section class="section tight" id="setup-main"><div class="container">
      <div class="breadcrumb"><a href="look.html">Tentrior</a> / SETUP #${esc(s.id)}</div>
      <div class="setup-layout">
        <div class="sticky">${shoppableHTML(s)}<p class="hint">사진 속 번호를 누르면 제품 정보를 볼 수 있어요.</p></div>
        <div>
          <p class="eyebrow">Tentrior Setup #${esc(s.id)} · ${fmtDate(s.date)}</p>
          <h1 class="en-title" style="font-size:clamp(2.1rem,4.4vw,3rem);line-height:1.15">${esc(s.title)}</h1>
          <p class="muted" style="margin:0">${esc(s.subtitle)}</p>
          <dl class="meta">
            <div><dt>STYLE</dt><dd><a href="style.html?s=${encodeURIComponent(st.id || '')}">${esc(st.name)}</a></dd></div>
            <div><dt>TENT</dt><dd>${tent ? `<a href="guide.html?t=${encodeURIComponent(tent.id)}">${esc(tent.short)}</a>` : '-'}</dd></div>
            <div><dt>FOR</dt><dd>${esc(s.people)}</dd></div>
            <div><dt>SEASON</dt><dd>${esc(s.season)}</dd></div>
          </dl>
          <p class="eyebrow">Shop the Setup</p>
          <div class="disclosure">${esc(S.disclosure)}</div>
          ${itemListHTML(s.items)}
          <div class="total"><span>이 세팅 그대로 구성하면</span><strong>${won(itemsTotal(s.items))}</strong></div>
        </div>
      </div>
    </div></section>

    <section class="section alt"><div class="container">
      <div class="grid g-2" style="gap:48px 64px">
        <div><p class="eyebrow">Story</p><h2>이렇게 꾸몄어요</h2><div class="prose muted">${(s.story || []).map((p) => `<p>${esc(p)}</p>`).join('')}</div></div>
        <div><p class="eyebrow">Styling Point</p><h2>따라 하기 포인트</h2><ol class="tips">${(s.tips || []).map((t) => `<li>${esc(t)}</li>`).join('')}</ol></div>
      </div>
    </div></section>

    ${s.budget ? `
    <section class="section" id="budget"><div class="container">
      <div class="section-head"><div><p class="eyebrow">Budget Setup</p><h2>비슷한 분위기, 더 가볍게</h2></div></div>
      ${compareHTML(s)}
    </div></section>` : ''}

    ${related.length ? `
    <section class="section${s.budget ? ' alt' : ''}"><div class="container">
      <div class="section-head"><div><p class="eyebrow">More Setups</p><h2>이런 세팅은 어때요?</h2></div><a class="link-more" href="look.html">Tentrior ${ICON.arrow}</a></div>
      <div class="grid g-3">${related.map(setupCard).join('')}</div>
    </div></section>` : ''}`;

    bindShoppable($('#setup-main'), s);
    if (location.hash) { const target = document.getElementById(location.hash.slice(1)); if (target) requestAnimationFrame(() => target.scrollIntoView()); }
  }

  /* ---------- STYLE ---------- */
  function pageStyle() {
    const st = styleOf(param('s'));
    if (st) return styleDetail(st);

    app.innerHTML = `
    ${pageHead('Style', '취향으로 완성하는 캠핑', '인테리어에 스타일이 있듯, 캠핑에도 스타일이 있어요. 끌리는 분위기를 골라보거나 아래 테스트로 우리다운 캠핑 스타일을 찾아보세요.', '<div class="breadcrumb"><a href="look.html">Tentrior</a> / Style</div>')}
    <section class="section"><div class="container"><div class="grid g-4">${T.styles.map(styleTile).join('')}</div></div></section>
    <section class="section alt" id="quiz"><div class="container">
      <div class="section-head" style="justify-content:center;text-align:center"><div><p class="eyebrow">Find Your Camping Style</p><h2>우리다운 캠핑 스타일 찾기</h2><p>질문 4개면 충분해요.</p></div></div>
      <div class="quiz" id="quiz-box"></div>
    </div></section>`;

    initQuiz($('#quiz-box'));
    if (location.hash === '#quiz') requestAnimationFrame(() => $('#quiz').scrollIntoView());
  }

  function styleDetail(st) {
    setMeta(`${st.name} — ${st.ko}`, st.desc);
    const setups = T.setups.filter((s) => s.style === st.id).sort(byDateDesc);
    const prods = T.products.filter((p) => (p.styles || []).includes(st.id));

    app.innerHTML = `
    <section class="section tight"><div class="container">
      <div class="breadcrumb"><a href="look.html">Tentrior</a> / <a href="style.html">Style</a> / ${esc(st.name)}</div>
      <div class="style-hero">
        <img src="${imgSrc(st.image, st.id)}" alt="${esc(st.ko)}">
        <div>
          <p class="eyebrow">${esc(st.mood)}</p>
          <h1 class="en-title" style="letter-spacing:.14em;margin-bottom:.1em">${esc(st.name)}</h1>
          <p style="font-weight:600;margin:0 0 .8em">${esc(st.ko)}</p>
          <p class="muted">${esc(st.desc)}</p>
          ${swatches(st)}
          <div class="tagline">${(st.keywords || []).map((k) => `<span class="tag">#${esc(k)}</span>`).join('')}</div>
        </div>
      </div>
    </div></section>

    <section class="section alt"><div class="container">
      <div class="section-head"><div><p class="eyebrow">Styling Rule</p><h2>${esc(st.ko)}, 이렇게 따라 해요</h2></div></div>
      <ol class="tips">${(st.tips || []).map((t) => `<li>${esc(t)}</li>`).join('')}</ol>
    </div></section>

    <section class="section"><div class="container">
      <div class="section-head"><div><p class="eyebrow">Setups</p><h2>${esc(st.name)} 세팅</h2></div>${setups.length ? `<a class="link-more" href="look.html?style=${encodeURIComponent(st.id)}">Look ${ICON.arrow}</a>` : ''}</div>
      ${setups.length ? `<div class="grid g-3">${setups.map(setupCard).join('')}</div>` : '<p class="empty">이 스타일의 세팅은 곧 올라와요.</p>'}
    </div></section>

    ${prods.length ? `
    <section class="section alt"><div class="container">
      <div class="section-head"><div><p class="eyebrow">Items</p><h2>${esc(st.name)}에 어울리는 아이템</h2></div><a class="link-more" href="pick.html?style=${encodeURIComponent(st.id)}">Pick ${ICON.arrow}</a></div>
      <div class="grid g-4">${prods.slice(0, 8).map((p) => productCard(p)).join('')}</div>
    </div></section>` : ''}`;
  }

  /* ---------- 취향 테스트 ---------- */
  const QUIZ = [
    { q: '가장 끌리는 텐트 색은?', o: [
      ['아이보리 · 베이지', '밝고 부드러운 톤', { natural: 2, white: 1 }],
      ['카키 · 샌드', '자연스러운 아웃도어 톤', { military: 2, natural: 1 }],
      ['블랙 · 차콜', '시크하고 단정한 톤', { black: 3 }],
      ['그레이 · 뉴트럴', '담백하고 차분한 톤', { japandi: 2, modern: 1 }]
    ] },
    { q: '손이 가는 소재는?', o: [
      ['월넛 · 브라스', '따뜻한 결이 보이는 소재', { midcentury: 3 }],
      ['알루미늄 · 메탈', '가볍고 깔끔한 소재', { black: 2, military: 1 }],
      ['코튼 · 린넨', '부드러운 패브릭', { natural: 1, white: 1, japandi: 1 }],
      ['무광 · 매트', '군더더기 없는 소재', { modern: 3 }]
    ] },
    { q: '텐트 안에서 어떤 기분이고 싶어요?', o: [
      ['따뜻하고 아늑하게', '', { midcentury: 1, natural: 1 }],
      ['깔끔하고 여백 있게', '', { white: 2, japandi: 1 }],
      ['숲과 어우러지게', '', { natural: 2, military: 1 }],
      ['힘 빼고 담백하게', '', { japandi: 2, modern: 1 }]
    ] },
    { q: '꾸미기 예산은 어느 정도예요?', budget: true, o: [
      ['50만원 이하', '작은 아이템부터', 500000],
      ['100만원 안팎', '가구 몇 가지 바꾸기', 1000000],
      ['200만원 안팎', '텐트까지 새로 구성', 2000000],
      ['300만원 이상', '제대로 꾸미기', Infinity]
    ] }
  ];

  function initQuiz(box) {
    if (!box || !T.styles.length) return;
    let step = 0;
    let answers = [];

    function draw() {
      if (step >= QUIZ.length) return result();
      const q = QUIZ[step];
      box.innerHTML = `
        <div class="quiz-progress"><i style="width:${(step / QUIZ.length) * 100}%"></i></div>
        <p class="eyebrow">Question ${step + 1} / ${QUIZ.length}</p>
        <h3 style="font-size:1.5rem;font-weight:400">${esc(q.q)}</h3>
        <div class="quiz-options">${q.o.map((o, i) => `<button type="button" class="quiz-opt" data-i="${i}">${esc(o[0])}${o[1] ? `<small>${esc(o[1])}</small>` : ''}</button>`).join('')}</div>
        ${step > 0 ? '<button type="button" class="quiz-back">← 이전 질문</button>' : ''}`;
    }

    function result() {
      const score = {};
      let budget = Infinity;
      answers.forEach((ai, qi) => {
        const val = QUIZ[qi].o[ai][2];
        if (QUIZ[qi].budget) budget = val;
        else Object.keys(val).forEach((k) => { score[k] = (score[k] || 0) + val[k]; });
      });
      const best = T.styles.slice().sort((a, b) => (score[b.id] || 0) - (score[a.id] || 0))[0];
      const ofStyle = T.setups.filter((s) => s.style === best.id).sort((a, b) => itemsTotal(a.items) - itemsTotal(b.items));
      const fit = ofStyle.filter((s) => itemsTotal(s.items) <= budget);
      const recs = (fit.length ? fit : ofStyle).slice(0, 2);
      try { localStorage.setItem('tentrior_style', best.id); } catch (e) { /* 저장 불가 환경 무시 */ }
      track('quiz_complete', { style: best.id });

      box.innerHTML = `
        <div class="quiz-progress"><i style="width:100%"></i></div>
        <div class="quiz-result">
          <p class="eyebrow">Your Camping Style</p>
          <h2 class="en-title" style="font-size:clamp(2.4rem,6vw,3.4rem);letter-spacing:.14em;margin-bottom:.1em">${esc(best.name)}</h2>
          <p style="margin:0;font-weight:600">${esc(best.ko)} · ${esc(best.mood)}</p>
          ${swatches(best)}
          <p class="muted" style="max-width:520px;margin:18px auto 26px">${esc(best.desc)}</p>
          <div class="btn-row" style="justify-content:center">
            <a class="btn accent" href="style.html?s=${encodeURIComponent(best.id)}">View Style ${ICON.arrow}</a>
            <button type="button" class="btn line quiz-restart">Retry</button>
          </div>
        </div>
        ${recs.length ? `<div style="margin-top:40px"><p class="eyebrow">${fit.length ? '예산에 맞는 추천 세팅' : '가장 가까운 추천 세팅'}</p><div class="grid g-2">${recs.map(setupCard).join('')}</div></div>` : ''}`;
    }

    box.addEventListener('click', (e) => {
      const opt = e.target.closest('.quiz-opt');
      if (opt) { answers[step] = Number(opt.dataset.i); step++; draw(); return; }
      if (e.target.closest('.quiz-back')) { step = Math.max(0, step - 1); answers = answers.slice(0, step); draw(); return; }
      if (e.target.closest('.quiz-restart')) { step = 0; answers = []; draw(); }
    });
    draw();
  }

  /* ---------- GUIDE ---------- */
  function pageGuide() {
    const t = tentOf(param('t'));
    if (t) return guideDetail(t);
    const bs = T.setups.find((s) => s.budget);

    app.innerHTML = `
    ${pageHead('Guide', '처음부터, 더 즐겁게', '장비 스펙보다 “어떻게 놓으면 예쁘고 편한지”를 알려드려요. 텐트에 맞는 러그 사이즈, 테이블 높이, 조명 위치까지 따라 하기 쉽게 정리했어요.', '<div class="breadcrumb"><a href="look.html">Tentrior</a> / Guide</div>')}
    <section class="section"><div class="container">
      <div class="line-head"><h2 class="caps-title">By Tent</h2><span class="rule"></span></div>
      <div class="grid g-4">${T.tents.map(guideCard).join('')}</div>
    </div></section>
    <section class="section alt"><div class="container">
      <div class="section-head"><div><p class="eyebrow">Start Here</p><h2>처음 꾸민다면, 이 순서로</h2></div></div>
      <div class="grid g-3">
        <a class="step-card" href="style.html#quiz"><span class="num">01</span><h3>우리 취향 먼저 찾기</h3><p>질문 4개로 우리에게 맞는 캠핑 스타일을 먼저 정해요.</p><span class="link-more">Quiz ${ICON.arrow}</span></a>
        <a class="step-card" href="${bs ? `setup.html?id=${encodeURIComponent(bs.id)}#budget` : 'look.html'}"><span class="num">02</span><h3>예산에 맞춰 세팅 고르기</h3><p>같은 분위기를 원래 구성과 가벼운 구성으로 비교해봐요.</p><span class="link-more">Budget ${ICON.arrow}</span></a>
        <a class="step-card" href="pick.html"><span class="num">03</span><h3>작은 아이템부터 바꿔보기</h3><p>러그나 조명 하나만 바꿔도 분위기가 달라져요.</p><span class="link-more">Pick ${ICON.arrow}</span></a>
      </div>
    </div></section>`;
  }

  function guideDetail(t) {
    setMeta(`${t.name} 꾸미기 — 텐트 스타일링 가이드`, t.intro);
    const setups = T.setups.filter((s) => s.tent === t.id).sort(byDateDesc);
    const tp = product(t.product);
    const used = Array.from(new Set(setups.flatMap((s) => s.items.map((i) => i.product))))
      .filter((id) => id !== t.product).map(product).filter(Boolean);

    app.innerHTML = `
    <section class="section tight"><div class="container">
      <div class="breadcrumb"><a href="look.html">Tentrior</a> / <a href="guide.html">Guide</a> / ${esc(t.short)}</div>
      <div class="style-hero">
        <img src="${imgSrc(t.image, t.style)}" alt="${esc(t.name)} 스타일링">
        <div>
          <p class="eyebrow">${esc(t.type)} · ${esc(t.capacity)}</p>
          <h1 style="font-size:clamp(1.8rem,4vw,2.7rem)">${esc(t.name)}<br>꾸미기 가이드</h1>
          <p class="muted">${esc(t.intro)}</p>
          <div class="tagline"><span class="tag">바닥 ${esc(t.footprint)}</span><span class="tag">세팅 ${setups.length}개</span></div>
          ${tp ? buyLink(tp, `이 텐트 보러가기 · ${won(tp.price)} ${ICON.out}`, 'btn line ko') : ''}
        </div>
      </div>
    </div></section>

    <section class="section alt"><div class="container">
      <div class="grid g-2" style="gap:40px 64px">
        <div>
          <p class="eyebrow">Recommended</p><h2>이렇게 구성해요</h2>
          <table class="spec"><tbody>${Object.entries(t.spec || {}).map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</tbody></table>
        </div>
        <div>
          <p class="eyebrow">Layout</p><h2>배치 가이드</h2>
          <ol class="tips">${(t.layout || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ol>
          ${(t.mistakes || []).length ? `<div class="box warn" style="margin-top:20px"><p class="eyebrow">자주 하는 실수</p><ul class="bullet">${t.mistakes.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}
        </div>
      </div>
    </div></section>

    <section class="section"><div class="container">
      <div class="section-head"><div><p class="eyebrow">Setups</p><h2>${esc(t.short)} 스타일링 사례</h2></div></div>
      ${setups.length ? `<div class="grid g-3">${setups.map(setupCard).join('')}</div>` : '<p class="empty">이 텐트의 세팅은 곧 올라와요.</p>'}
    </div></section>

    ${used.length ? `
    <section class="section alt"><div class="container">
      <div class="section-head"><div><p class="eyebrow">Items</p><h2>이 텐트 세팅에 쓴 아이템</h2></div></div>
      <div class="grid g-4">${used.map((p) => productCard(p)).join('')}</div>
    </div></section>` : ''}`;
  }

  /* ---------- PICK (구 PICK + SHOP 통합) ---------- */
  function pagePick() {
    const picks = T.products.filter((p) => p.pick);
    const state = { style: param('style') || 'all' };
    if (state.style !== 'all' && !styleOf(state.style)) state.style = 'all';

    app.innerHTML = `
    ${pageHead('Tentrior Pick', '텐트리어 픽', '우리가 직접 고른 캠핑 아이템, 새로 발견한 제품, 스타일별 추천까지 한 곳에 모았어요.')}
    ${picks.length ? `
    <section class="section tight" style="padding-bottom:0"><div class="container">
      <div class="line-head"><h2 class="caps-title">Editor's Pick</h2><span class="rule"></span></div>
      <div class="disclosure">${esc(S.disclosure)}</div>
      <div class="grid g-3 pick-grid">${picks.map((p) => productCard(p, true)).join('')}</div>
    </div></section>` : ''}
    <section class="section"><div class="container">
      <div class="line-head"><h2 class="caps-title">All Items</h2><span class="rule"></span></div>
      <div class="filters">
        ${chipRow('스타일', 'style', T.styles.map((s) => [s.id, s.name]))}
      </div>
      ${picks.length ? '' : `<div class="disclosure">${esc(S.disclosure)}</div>`}
      <p class="result-count"></p>
      <div class="grid g-4" id="grid"></div>
    </div></section>`;

    bindFilters(state, () => {
      const list = T.products.filter((p) => state.style === 'all' || (p.styles || []).includes(state.style));
      $('.result-count', app).textContent = `제품 ${list.length}개`;
      $('#grid', app).innerHTML = list.length ? list.map((p) => productCard(p)).join('') : '<p class="empty" style="grid-column:1/-1">조건에 맞는 제품이 아직 없어요.</p>';
    });
  }

  /* ---------- 텐들이 (캠퍼 참여 갤러리) ---------- */
  // Supabase에 실제로 올라온 글(공개된 것만)을 화면에 쓰는 모양으로 바꿔줘요.
  function mapLiveTendeuli(row) {
    const auth = window.TENTRIOR.auth;
    let image = '';
    if (row.image_path && auth && auth.client) {
      try {
        const { data } = auth.client.storage.from('tendeuli-photos').getPublicUrl(row.image_path);
        image = (data && data.publicUrl) || '';
      } catch (e) { /* 스토리지 버킷이 아직 없으면 무시 */ }
    }
    return {
      id: row.id, date: (row.created_at || '').slice(0, 10), nickname: row.nickname || '캠퍼',
      title: row.title, tent: row.tent || '', style: row.style || 'natural', season: row.season || '',
      people: row.people || '', place: row.place || '', image, mood: 'day',
      intro: row.intro || '', point: row.point || '', items: row.items || [], comment: null, live: true
    };
  }

  async function fetchPublishedTendeuli() {
    const auth = window.TENTRIOR.auth;
    if (!auth || !auth.ready) return [];
    try {
      const { data, error } = await auth.client.from('tendeuli_posts').select('*').eq('status', 'published').order('created_at', { ascending: false });
      if (error || !data) return [];
      return data.map(mapLiveTendeuli);
    } catch (e) { return []; }
  }

  async function fetchOneTendeuli(id) {
    const auth = window.TENTRIOR.auth;
    if (!auth || !auth.ready) return null;
    try {
      let q = auth.client.from('tendeuli_posts').select('*').eq('id', id);
      if (!auth.isAdmin) q = q.eq('status', 'published');
      const { data, error } = await q.maybeSingle();
      if (error || !data) return null;
      return mapLiveTendeuli(data);
    } catch (e) { return null; }
  }

  function pageTendeuli() {
    const id = param('id');
    if (id) {
      const td = findById(T.tendeuli, id);
      if (td) return tendeuliDetail(td);
      // 샘플에 없으면 Supabase에 실제로 올라온 글인지 확인해요.
      app.innerHTML = '<section class="section"><div class="container empty">불러오는 중이에요…</div></section>';
      fetchOneTendeuli(id).then((row) => {
        if (row) tendeuliDetail(row);
        else notFound('기록을 찾을 수 없어요.', 'tendeuli.html', '텐들이로 돌아가기');
      });
      return;
    }

    const state = { style: param('style') || 'all' };
    const auth = window.TENTRIOR.auth || { ready: false };
    let liveList = [];

    function renderList() {
      const combined = liveList.concat(T.tendeuli).sort(byDateDesc);
      const filtered = state.style === 'all' ? combined : combined.filter((t) => t.style === state.style);
      $('.result-count', app).textContent = `기록 ${filtered.length}개`;
      $('#grid', app).innerHTML = filtered.length ? filtered.map(tendeuliCard).join('') : '<p class="empty" style="grid-column:1/-1">아직 등록된 기록이 없어요.</p>';
    }

    app.innerHTML = `
    ${pageHead('Tendeuli', '텐들이', '캠퍼들이 직접 꾸민 텐트와 캠핑 세팅을 소개해요. 나만의 캠핑 집들이를 텐트리어에 자랑해보세요.')}
    <section class="section tight" style="padding-bottom:0"><div class="container">
      <div class="filters">${chipRow('스타일', 'style', T.styles.map((st) => [st.id, st.name]))}</div>
      <p class="result-count"></p>
      <div class="grid g-3" id="grid"></div>
    </div></section>
    <section class="section alt"><div class="container">
      <div class="section-head"><div><p class="eyebrow">Join Tendeuli</p><h2>내 캠핑도 텐들이에 올려보세요</h2><p>텐트와 세팅 사진, 사용한 아이템을 알려주시면 텐트리어가 골라 소개해드려요.</p></div></div>
      <div class="btn-row">
        ${auth.ready
          ? `<a class="btn accent" href="tendeuli-submit.html">내 캠핑 올리기 ${ICON.arrow}</a>`
          : S.tendeuliFormUrl
            ? `<a class="btn accent" href="${esc(S.tendeuliFormUrl)}" target="_blank" rel="noopener">참여 신청하기 ${ICON.arrow}</a>`
            : `<span class="btn accent" style="opacity:.5;pointer-events:none" aria-disabled="true">참여 폼 준비 중</span>`}
        <span class="btn line ko">인스타그램 ${esc(S.tendeuliHashtag)} 태그하기</span>
      </div>
    </div></section>`;

    bindFilters(state, renderList);
    if (auth.ready) fetchPublishedTendeuli().then((rows) => { liveList = rows; renderList(); });
  }

  function tendeuliDetail(td) {
    setMeta(`${td.title} — 텐들이`, td.intro);
    const st = styleOf(td.style) || {};
    const related = T.tendeuli.filter((t) => t.id !== td.id && t.style === td.style).sort(byDateDesc).slice(0, 3);

    app.innerHTML = `
    <section class="section tight"><div class="container">
      <div class="breadcrumb"><a href="tendeuli.html">텐들이</a> / ${esc(td.title)}</div>
      <div class="setup-layout">
        <div class="sticky"><div class="shoppable"><img src="${imgSrc(td.image, td.style, td.mood)}" alt="${esc(td.title)}"></div></div>
        <div>
          <p class="eyebrow">텐들이 · ${fmtDate(td.date)} · ${esc(td.nickname)}</p>
          <h1 style="font-size:clamp(1.7rem,4vw,2.4rem)">${esc(td.title)}</h1>
          <dl class="meta">
            <div><dt>STYLE</dt><dd><a href="style.html?s=${encodeURIComponent(td.style)}">${esc(st.name)}</a></dd></div>
            <div><dt>TENT</dt><dd>${esc(td.tent)}</dd></div>
            <div><dt>FOR</dt><dd>${esc(td.people)}</dd></div>
            <div><dt>PLACE</dt><dd>${esc(td.place)}</dd></div>
          </dl>
          <p class="muted">${esc(td.intro)}</p>
          ${td.point ? `<div class="box" style="margin:20px 0"><p class="eyebrow">Styling Point</p><p style="margin:0">${esc(td.point)}</p></div>` : ''}
          <p class="eyebrow">Items</p>
          ${tendeuliItemsHTML(td.items)}
          ${td.comment ? `<div class="box warn" style="margin-top:20px"><p class="eyebrow">텐트리어의 한마디</p><p style="margin:0">${esc(td.comment)}</p></div>` : ''}
        </div>
      </div>
    </div></section>

    ${td.live ? `
    <section class="section" style="padding-top:0"><div class="container" style="max-width:760px">
      <h2>댓글</h2>
      <div id="comment-gate" class="gate-box" hidden>
        <p class="muted" style="margin:0 0 20px">댓글을 남기려면 로그인해주세요.</p>
        <button type="button" class="btn accent" id="comment-login-btn">로그인 · 회원가입</button>
      </div>
      <form id="comment-form" class="field-group" hidden style="margin-bottom:32px">
        <label>댓글 남기기<textarea id="comment-body" maxlength="500" placeholder="따뜻한 말 한마디 남겨주세요."></textarea></label>
        <button type="submit" class="btn accent" style="margin-top:10px">댓글 등록</button>
        <p class="field-msg" id="comment-msg" aria-live="polite"></p>
      </form>
      <ul class="comment-list" id="comment-list"><li class="muted">불러오는 중이에요…</li></ul>
    </div></section>` : ''}

    ${related.length ? `
    <section class="section alt"><div class="container">
      <div class="section-head"><div><p class="eyebrow">More</p><h2>비슷한 스타일의 텐들이</h2></div><a class="link-more" href="look.html?style=${encodeURIComponent(td.style)}">텐트리어에서 ${esc(st.name)} 보기 ${ICON.arrow}</a></div>
      <div class="grid g-3">${related.map(tendeuliCard).join('')}</div>
    </div></section>` : ''}`;

    if (td.live) bindTendeuliComments(td.id);
  }

  function bindTendeuliComments(postId) {
    const gate = $('#comment-gate', app), form = $('#comment-form', app), listEl = $('#comment-list', app);
    const body = $('#comment-body', form), msg = $('#comment-msg', app);

    function commentDate(iso) { return fmtDate(String(iso || '').slice(0, 10)); }

    function renderList(rows) {
      const auth = window.TENTRIOR.auth;
      if (!rows.length) { listEl.innerHTML = '<li class="muted">아직 댓글이 없어요. 첫 댓글을 남겨보세요.</li>'; return; }
      listEl.innerHTML = rows.map((c) => `
        <li class="comment-item" data-id="${esc(c.id)}">
          <div class="comment-head"><strong>${esc(c.nickname)}</strong><span class="muted small">${commentDate(c.created_at)}</span></div>
          <p class="comment-body">${esc(c.body)}</p>
          ${auth.user && auth.user.id === c.user_id ? '<button type="button" class="comment-delete">삭제</button>' : ''}
        </li>`).join('');
    }

    function load() {
      window.TENTRIOR.auth.client.from('tendeuli_comments').select('id,nickname,body,created_at,user_id')
        .eq('post_id', postId).order('created_at', { ascending: true })
        .then((res) => { renderList((res && res.data) || []); });
    }

    function showAuthState() {
      const auth = window.TENTRIOR.auth;
      if (auth.user) { gate.hidden = true; form.hidden = false; } else { gate.hidden = false; form.hidden = true; }
    }
    showAuthState();
    document.addEventListener('tentrior:auth', showAuthState);

    const loginBtn = $('#comment-login-btn', app);
    if (loginBtn) loginBtn.addEventListener('click', () => window.TENTRIOR.auth.openModal('signin'));

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const auth = window.TENTRIOR.auth;
      const text = body.value.trim();
      msg.textContent = '';
      if (!text) { msg.textContent = '댓글 내용을 입력해주세요.'; return; }
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      auth.client.from('tendeuli_comments').insert({
        post_id: postId, user_id: auth.user.id,
        nickname: auth.nickname || (auth.user.email ? auth.user.email.split('@')[0] : '캠퍼'),
        body: text
      }).then((res) => {
        if (res.error) throw res.error;
        body.value = '';
        load();
      }).catch((err) => {
        msg.textContent = (err && err.message) || '댓글을 등록하지 못했어요.';
      }).finally(() => { submitBtn.disabled = false; });
    });

    listEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.comment-delete');
      if (!btn) return;
      const li = btn.closest('.comment-item');
      const id = li && li.dataset.id;
      if (!id || !confirm('댓글을 삭제할까요?')) return;
      window.TENTRIOR.auth.client.from('tendeuli_comments').delete().eq('id', id).then(() => load());
    });

    load();
  }

  /* ---------- 광고 배너 (관리자 등록) ---------- */
  // 관리자 페이지에서 올린 광고(ads 테이블)를 불러와요. Supabase가 준비 안 됐거나
  // 등록된 광고가 없으면 조용히 아무것도 표시하지 않아요.
  async function fetchActiveAds() {
    const auth = window.TENTRIOR.auth;
    if (!auth || !auth.ready) return [];
    try {
      const { data, error } = await auth.client.from('ads').select('*')
        .eq('active', true).order('sort_order', { ascending: true });
      if (error || !data) return [];
      return data.map((row) => {
        let image = '';
        try {
          const { data: pub } = auth.client.storage.from('ad-images').getPublicUrl(row.image_path);
          image = (pub && pub.publicUrl) || '';
        } catch (e) { /* 스토리지 버킷이 아직 없으면 무시 */ }
        return { id: row.id, title: row.title || '', linkUrl: row.link_url || '#', image };
      }).filter((ad) => ad.image);
    } catch (e) { return []; }
  }

  function adBannersHTML(ads) {
    if (!ads.length) return '';
    return `
    <section class="section ad-banners"><div class="container">
      <div class="ad-row">
        ${ads.map((ad) => `
        <a class="ad-card" href="${esc(ad.linkUrl)}" target="_blank" rel="noopener sponsored">
          <img src="${esc(ad.image)}" alt="${esc(ad.title)}" loading="lazy">
          <span class="ad-label">AD</span>
          ${ad.title ? `<span class="ad-title">${esc(ad.title)}</span>` : ''}
        </a>`).join('')}
      </div>
    </div></section>`;
  }

  /* ---------- 캠퍼저널 (팁 · 정보 콘텐츠) ---------- */
  function pageCamperJournal() {
    const a = findById(T.camperjournal, param('id'));
    if (a) return camperjournalDetail(a);

    const list = T.camperjournal.slice().sort(byDateDesc);
    const cats = Array.from(new Set(list.map((x) => x.category)));
    const state = { cat: param('cat') || 'all' };
    if (state.cat !== 'all' && !cats.includes(state.cat)) state.cat = 'all';

    app.innerHTML = `
    ${pageHead('Camper Journal', '캠퍼저널', '장비 선택법, 텐트 관리, 조명과 수납, 계절 캠핑, 캠핑장 노하우까지. 캠핑을 더 잘하고 싶을 때 찾아보는 정보예요.')}
    <section class="section"><div class="container">
      <div class="filters">${chipRow('CATEGORY', 'cat', cats.map((c) => [c, c]))}</div>
      <p class="result-count"></p>
      <div class="grid g-3" id="grid"></div>
    </div></section>`;

    bindFilters(state, () => {
      const filtered = state.cat === 'all' ? list : list.filter((x) => x.category === state.cat);
      $('.result-count', app).textContent = `글 ${filtered.length}개`;
      $('#grid', app).innerHTML = filtered.length ? filtered.map(camperjournalCard).join('') : '<p class="empty" style="grid-column:1/-1">준비 중이에요.</p>';
    });
  }

  function camperjournalDetail(a) {
    setMeta(a.title, a.excerpt);
    const related = T.camperjournal.filter((x) => x.id !== a.id && x.category === a.category).slice(0, 3);
    const relProducts = (a.relatedProducts || []).map(product).filter(Boolean);
    const relSetups = (a.relatedSetups || []).map(setupOf).filter(Boolean);

    app.innerHTML = `
    <section class="section tight"><div class="container"><article class="article">
      <div class="breadcrumb"><a href="camperjournal.html">캠퍼저널</a> / ${esc(a.category)}</div>
      <p class="eyebrow">${esc(a.category)} · ${fmtDate(a.date)}</p>
      <h1 style="font-size:clamp(1.7rem,4vw,2.5rem)">${esc(a.title)}</h1>
      <img src="${imgSrc(a.image, a.style || 'natural', 'day')}" alt="${esc(a.title)}">
      <div class="prose">${(a.body || []).map((p) => `<p>${esc(p)}</p>`).join('')}</div>
      ${(a.tags || []).length ? `<div class="tagline">${a.tags.map((t) => `<span class="tag">#${esc(t)}</span>`).join('')}</div>` : ''}
    </article></div></section>

    ${relProducts.length ? `
    <section class="section alt"><div class="container">
      <div class="section-head"><div><p class="eyebrow">Related Items</p><h2>이 글에서 다룬 아이템</h2></div><a class="link-more" href="pick.html">Pick ${ICON.arrow}</a></div>
      <div class="grid g-4">${relProducts.map((p) => productCard(p)).join('')}</div>
    </div></section>` : ''}

    ${relSetups.length ? `
    <section class="section${relProducts.length ? '' : ' alt'}"><div class="container">
      <div class="section-head"><div><p class="eyebrow">Related Setups</p><h2>함께 보면 좋은 세팅</h2></div></div>
      <div class="grid g-3">${relSetups.map(setupCard).join('')}</div>
    </div></section>` : ''}

    ${related.length ? `
    <section class="section${(relProducts.length + relSetups.length) % 2 ? '' : ' alt'}"><div class="container">
      <div class="section-head"><div><p class="eyebrow">More</p><h2>${esc(a.category)} 관련 글</h2></div></div>
      <div class="grid g-3">${related.map(camperjournalCard).join('')}</div>
    </div></section>` : ''}`;
  }

  /* ---------- JOURNAL ---------- */
  function journalImg(j) {
    if (j.image) return ROOT + j.image;
    const s = setupOf(j.setup);
    return s ? setupImg(s) : scene('midcentury');
  }

  function journalFacts(j) {
    const tent = tentOf(j.tent);
    return `<div class="facts"><span><b>PLACE</b>${esc(j.place)}</span>${tent ? `<span><b>TENT</b>${esc(tent.short)}</span>` : ''}<span><b>WEATHER</b>${esc(j.weather)}</span></div>`;
  }

  function journalRow(j) {
    return `
    <a class="journal-row" href="${ROOT}weekend.html?id=${encodeURIComponent(j.id)}">
      <img src="${journalImg(j)}" alt="${esc(j.title)}" loading="lazy">
      <div>
        <p class="eyebrow">${fmtDate(j.date)}</p>
        <h3>${esc(j.title)}</h3>
        ${journalFacts(j)}
        <p class="muted" style="margin:0">${esc(j.excerpt)}</p>
      </div>
    </a>`;
  }

  function pageJournal() {
    const j = findById(T.journal, param('id'));
    if (j) return journalDetail(j);

    app.innerHTML = `
    ${pageHead('Tentrior Weekend', '텐트리어의 기록', '부부가 직접 머문 캠핑을 기록해요. 어디에서 어떤 텐트로 머물렀는지, 좋았던 점과 아쉬웠던 점까지 솔직하게.')}
    <section class="section"><div class="container">
      ${T.journal.length ? T.journal.slice().sort(byDateDesc).map(journalRow).join('') : '<p class="empty">첫 기록을 준비 중이에요.</p>'}
    </div></section>`;
  }

  function journalDetail(j) {
    setMeta(j.title, j.excerpt);
    const s = setupOf(j.setup);
    const list = (arr) => (arr || []).map((x) => `<li>${esc(x)}</li>`).join('');

    app.innerHTML = `
    <section class="section tight"><div class="container"><article class="article">
      <div class="breadcrumb"><a href="weekend.html">Weekend</a> / ${fmtDate(j.date)}</div>
      <p class="eyebrow">Tentrior Weekend · ${fmtDate(j.date)}</p>
      <h1 style="font-size:clamp(1.7rem,4vw,2.5rem)">${esc(j.title)}</h1>
      ${journalFacts(j)}
      <img src="${journalImg(j)}" alt="${esc(j.title)}">
      <div class="prose">${(j.body || []).map((p) => `<p>${esc(p)}</p>`).join('')}</div>
      <div class="grid g-2" style="margin:32px 0 48px;gap:20px">
        <div class="box"><p class="eyebrow">좋았던 점</p><ul class="bullet">${list(j.good)}</ul></div>
        <div class="box warn"><p class="eyebrow">아쉬웠던 점</p><ul class="bullet">${list(j.bad)}</ul></div>
      </div>
      ${s ? `<p class="eyebrow">이날의 세팅</p><div class="grid g-2">${setupCard(s)}</div>` : ''}
    </article></div></section>`;
  }

  /* ---------- INIT ---------- */
  renderHeader();
  if (setupsPromise) {
    const dbSetups = await setupsPromise;
    if (dbSetups) T.setups = dbSetups;
  }
  const pages = { home: pageHome, look: pageLook, setup: pageSetup, style: pageStyle, guide: pageGuide, pick: pagePick, tendeuli: pageTendeuli, camperjournal: pageCamperJournal, weekend: pageJournal };
  if (app && pages[PAGE]) pages[PAGE]();
  renderFooter();

  // 정적 페이지(about 등): 이메일 자리 채우기, 로고 이미지가 있으면 로고 블록 교체
  $$('[data-email]').forEach((a) => { a.href = 'mailto:' + S.email; a.textContent = S.email; });
  if (S.logoImage) $$('[data-lockup]').forEach((el) => { el.innerHTML = `<img class="lockup-img" src="${ROOT}${esc(S.logoImage)}" alt="${esc(BRAND)} — ${esc(S.slogan)}">`; });

  // 제휴 링크 클릭 추적
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-track]');
    if (a) track('affiliate_click', { product_id: a.dataset.track, page: PAGE });
  });
})();


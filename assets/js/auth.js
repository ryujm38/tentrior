/* ============================================================
   TENTRIOR auth.js — 회원가입 · 로그인 (Supabase)
   ------------------------------------------------------------
   data/supabase-config.js 에 url/anonKey 를 채우면 자동으로 켜져요.
   비워두면 로그인 버튼이 그냥 나타나지 않을 뿐, 사이트는 평소처럼
   동작해요 (에러 없음).

   이 파일이 하는 일
   - 헤더의 <span id="auth-slot"> 안에 로그인 아이콘 / 내 계정 메뉴를 그려요.
   - 로그인·회원가입·비밀번호 재설정 모달을 붙여요.
   - window.TENTRIOR.auth 로 다른 페이지(예: tendeuli-submit.html)에서
     로그인 상태를 확인하고 Supabase에 데이터를 쓸 수 있게 해요.

   필요한 테이블·정책 SQL은 SUPABASE_SETUP.md 를 확인하세요.
   ============================================================ */
(function () {
  'use strict';

  const CFG = window.TENTRIOR_SUPABASE || {};
  const READY = !!(CFG.url && CFG.anonKey && window.supabase && window.supabase.createClient);
  const client = READY ? window.supabase.createClient(CFG.url, CFG.anonKey) : null;
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const NICK_RE = /^[가-힣a-zA-Z0-9]+$/;
  /** 닉네임 형식(공백/특수문자/길이)과 금지어를 검사해요. data/banned-nicknames.js 의 목록을 사용해요. */
  function validateNickname(raw) {
    const name = raw || '';
    const trimmed = name.trim();
    if (!trimmed) return { ok: false, reason: '닉네임을 입력해주세요.' };
    if (/\s/.test(name)) return { ok: false, reason: '닉네임에는 공백을 쓸 수 없어요.' };
    if (trimmed.length < 2 || trimmed.length > 20) return { ok: false, reason: '닉네임은 2~20자로 입력해주세요.' };
    if (!NICK_RE.test(trimmed)) return { ok: false, reason: '닉네임은 한글, 영문, 숫자만 사용할 수 있어요.' };
    const lower = trimmed.toLowerCase();
    const banned = window.TENTRIOR_BANNED_WORDS || [];
    for (let i = 0; i < banned.length; i++) {
      const w = String(banned[i] || '').toLowerCase();
      if (w && lower.indexOf(w) !== -1) return { ok: false, reason: '닉네임에 사용할 수 없는 단어가 포함되어 있어요.' };
    }
    return { ok: true };
  }
  window.TENTRIOR = window.TENTRIOR || {};
  window.TENTRIOR.validateNickname = validateNickname;

  const ICON = {
    user: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8.5" r="3.5"/><path d="M4.5 20c1.4-3.6 4.4-5.5 7.5-5.5s6.1 1.9 7.5 5.5"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'
  };

  const state = { user: null, nickname: '', isAdmin: false };

  function slot() { return document.getElementById('auth-slot'); }

  function renderSlot() {
    const el = slot();
    if (!el || !READY) return;
    if (state.user) {
      const label = state.nickname || (state.user.email || '?');
      const initial = label.trim().charAt(0).toUpperCase() || '?';
      el.innerHTML = `
        <button type="button" class="icon-btn account-btn" aria-haspopup="true" aria-expanded="false" aria-label="내 계정">
          <span class="avatar-dot">${esc(initial)}</span>
        </button>
        <div class="account-menu" hidden>
          <p class="account-name">${esc(label)}</p>
          ${state.isAdmin ? '<a href="admin.html">관리자 페이지</a>' : ''}
          <a href="mypage.html">내 정보 보기</a>
          <button type="button" class="account-signout">로그아웃</button>
        </div>`;
    } else {
      el.innerHTML = `<button type="button" class="icon-btn auth-open" aria-label="로그인 · 회원가입">${ICON.user}</button>`;
    }
    bindSlot();
  }

  function bindSlot() {
    const el = slot();
    if (!el) return;
    const openBtn = el.querySelector('.auth-open');
    if (openBtn) openBtn.addEventListener('click', () => openModal('signin'));

    const accBtn = el.querySelector('.account-btn');
    const menu = el.querySelector('.account-menu');
    if (accBtn && menu) {
      accBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const willOpen = menu.hasAttribute('hidden');
        if (willOpen) menu.removeAttribute('hidden'); else menu.setAttribute('hidden', '');
        accBtn.setAttribute('aria-expanded', String(willOpen));
      });
      document.addEventListener('click', (e) => { if (!el.contains(e.target)) menu.setAttribute('hidden', ''); });
    }
    const signOutBtn = el.querySelector('.account-signout');
    if (signOutBtn) signOutBtn.addEventListener('click', async () => { await client.auth.signOut(); location.href = 'index.html'; });
  }

  /* ---------- 로그인/회원가입 모달 ---------- */
  function ensureModal() {
    if (document.querySelector('.auth-layer')) return;
    // 관리자 페이지는 회원가입을 막고 로그인만 할 수 있게 해요.
    const isAdminPage = document.body.getAttribute('data-page') === 'admin';
    const layer = document.createElement('div');
    layer.className = 'auth-layer';
    layer.hidden = true;
    layer.innerHTML = `
      <div class="auth-panel" role="dialog" aria-modal="true" aria-label="${isAdminPage ? '관리자 로그인' : '로그인 · 회원가입'}">
        <button type="button" class="icon-btn auth-close" aria-label="닫기">${ICON.close}</button>
        <div class="auth-tabs">
          <button type="button" class="auth-tab active" data-tab="signin">로그인</button>
          <button type="button" class="auth-tab" data-tab="signup"${isAdminPage ? ' hidden' : ''}>회원가입</button>
        </div>

        <form class="signin-form" novalidate>
          <div class="field-group">
            <label>이메일<input type="email" name="email" required autocomplete="email"></label>
          </div>
          <div class="field-group">
            <label>비밀번호<input type="password" name="password" required autocomplete="current-password"></label>
          </div>
          <button type="submit" class="btn accent">로그인</button>
          <p class="auth-msg signin-msg" aria-live="polite"></p>
          <button type="button" class="auth-forgot">비밀번호를 잊으셨나요?</button>
        </form>

        <form class="signup-form" novalidate hidden>
          <div class="field-group">
            <label>닉네임<input type="text" name="nickname" maxlength="20" placeholder="텐트리어에서 표시될 이름" autocomplete="off"></label>
            <p class="field-msg nickname-msg" aria-live="polite"></p>
          </div>

          <div class="field-group">
            <label>이메일
              <span class="input-with-btn">
                <input type="email" name="email" required autocomplete="email">
                <button type="button" class="btn small email-verify-btn">인증하기</button>
              </span>
            </label>
            <p class="field-msg email-msg" aria-live="polite"></p>
          </div>

          <div class="field-group code-group" hidden>
            <label>인증코드
              <span class="input-with-btn">
                <input type="text" name="code" inputmode="numeric" autocomplete="one-time-code" maxlength="8" placeholder="숫자 8자리">
                <button type="button" class="btn small code-verify-btn">인증확인</button>
              </span>
            </label>
            <p class="field-msg code-msg" aria-live="polite"></p>
            <button type="button" class="auth-forgot code-resend">인증코드 다시 받기</button>
          </div>

          <div class="field-group password-section" hidden>
            <label>비밀번호<input type="password" name="password" autocomplete="new-password" placeholder="영문+숫자 조합 8자 이상"></label>
            <p class="field-msg pw-msg" aria-live="polite"></p>
          </div>

          <div class="field-group password-section" hidden>
            <label>비밀번호 확인<input type="password" name="password2" autocomplete="new-password"></label>
            <p class="field-msg confirm-msg" aria-live="polite"></p>
          </div>

          <button type="button" class="btn accent signup-submit" disabled>회원가입</button>
          <p class="auth-msg signup-msg" aria-live="polite"></p>
        </form>
      </div>`;
    document.body.appendChild(layer);

    const tabs = layer.querySelectorAll('.auth-tab');
    const signinForm = layer.querySelector('.signin-form');
    const signupForm = layer.querySelector('.signup-form');
    const signinMsg = layer.querySelector('.signin-msg');
    const forgotBtn = signinForm.querySelector('.auth-forgot');

    function setMode(mode) {
      if (isAdminPage) mode = 'signin';
      tabs.forEach((t) => t.classList.toggle('active', t.dataset.tab === mode));
      signinForm.hidden = mode !== 'signin';
      signupForm.hidden = mode !== 'signup';
    }
    tabs.forEach((t) => t.addEventListener('click', () => setMode(t.dataset.tab)));

    /* ---------- 로그인 ---------- */
    forgotBtn.addEventListener('click', async () => {
      const email = signinForm.email.value.trim();
      if (!email) { signinMsg.textContent = '이메일을 먼저 입력해주세요.'; return; }
      try {
        const { error } = await client.auth.resetPasswordForEmail(email);
        if (error) throw error;
        signinMsg.textContent = '비밀번호 재설정 메일을 보냈어요. 메일함을 확인해주세요.';
      } catch (err) { signinMsg.textContent = err.message || '메일을 보내지 못했어요.'; }
    });

    signinForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      signinMsg.textContent = '';
      const email = signinForm.email.value.trim();
      const password = signinForm.password.value;
      const submitBtn = signinForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      try {
        const { error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
        closeModal();
        location.reload();
      } catch (err) {
        signinMsg.textContent = err.message || '문제가 발생했어요. 다시 시도해주세요.';
      } finally {
        submitBtn.disabled = false;
      }
    });

    /* ---------- 회원가입 ---------- */
    const nickInput = signupForm.nickname;
    const nickMsg = layer.querySelector('.nickname-msg');
    const emailInput = signupForm.email;
    const emailVerifyBtn = layer.querySelector('.email-verify-btn');
    const emailMsg = layer.querySelector('.email-msg');
    const codeGroup = layer.querySelector('.code-group');
    const codeInput = signupForm.code;
    const codeVerifyBtn = layer.querySelector('.code-verify-btn');
    const codeMsg = layer.querySelector('.code-msg');
    const codeResendBtn = layer.querySelector('.code-resend');
    const pwSections = layer.querySelectorAll('.password-section');
    const pwInput = signupForm.password;
    const pw2Input = signupForm.password2;
    const pwMsg = layer.querySelector('.pw-msg');
    const confirmMsg = layer.querySelector('.confirm-msg');
    const signupSubmit = layer.querySelector('.signup-submit');
    const signupMsg = layer.querySelector('.signup-msg');

    const PW_RE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    let nicknameOk = false;
    let emailVerified = false;
    let pendingEmail = '';
    let nickTimer = null;

    function updateSignupSubmit() {
      const pwOk = PW_RE.test(pwInput.value);
      const confirmOk = !!pw2Input.value && pw2Input.value === pwInput.value;
      signupSubmit.disabled = !(nicknameOk && emailVerified && pwOk && confirmOk);
    }

    function resetSignupForm() {
      signupForm.reset();
      [nickMsg, emailMsg, codeMsg, pwMsg, confirmMsg].forEach((el) => { el.textContent = ''; el.className = el.className.replace(/\s*(good|bad)/g, ''); });
      signupMsg.textContent = '';
      codeGroup.hidden = true;
      pwSections.forEach((el) => { el.hidden = true; });
      emailInput.disabled = false;
      emailVerifyBtn.disabled = false;
      codeInput.disabled = false;
      codeVerifyBtn.disabled = false;
      codeResendBtn.hidden = false;
      nicknameOk = false; emailVerified = false; pendingEmail = '';
      updateSignupSubmit();
    }

    nickInput.addEventListener('input', () => {
      const name = nickInput.value.trim();
      nicknameOk = false;
      updateSignupSubmit();
      clearTimeout(nickTimer);
      if (!name) { nickMsg.textContent = ''; nickMsg.className = 'field-msg nickname-msg'; return; }
      const rule = validateNickname(nickInput.value);
      if (!rule.ok) {
        nickMsg.textContent = rule.reason;
        nickMsg.className = 'field-msg nickname-msg bad';
        return;
      }
      nickMsg.textContent = '확인 중...';
      nickMsg.className = 'field-msg nickname-msg';
      nickTimer = setTimeout(async () => {
        try {
          const { data, error } = await client.from('profiles').select('id').eq('nickname', name).limit(1);
          if (error) throw error;
          if (data && data.length > 0) {
            nickMsg.textContent = '이미 사용 중인 이름이에요.';
            nickMsg.className = 'field-msg nickname-msg bad';
            nicknameOk = false;
          } else {
            nickMsg.textContent = '사용할 수 있는 이름이에요.';
            nickMsg.className = 'field-msg nickname-msg good';
            nicknameOk = true;
          }
        } catch (err) {
          nickMsg.textContent = '';
          nicknameOk = false;
        }
        updateSignupSubmit();
      }, 400);
    });

    emailInput.addEventListener('input', () => {
      if (emailVerified) {
        emailVerified = false;
        codeGroup.hidden = true;
        pwSections.forEach((el) => { el.hidden = true; });
        emailInput.disabled = false;
        emailVerifyBtn.disabled = false;
        emailMsg.textContent = '이메일을 변경했으니 다시 인증해주세요.';
        emailMsg.className = 'field-msg email-msg';
        updateSignupSubmit();
      }
    });

    emailVerifyBtn.addEventListener('click', async () => {
      const email = emailInput.value.trim();
      if (!email || !emailInput.checkValidity()) {
        emailMsg.textContent = '올바른 이메일을 입력해주세요.';
        emailMsg.className = 'field-msg email-msg bad';
        return;
      }
      emailVerifyBtn.disabled = true;
      emailMsg.textContent = '';
      try {
        const { error } = await client.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
        if (error) throw error;
        pendingEmail = email;
        emailMsg.textContent = '인증코드를 보냈어요. 메일함을 확인해주세요.';
        emailMsg.className = 'field-msg email-msg good';
        codeGroup.hidden = false;
        emailInput.disabled = true;
        codeInput.value = '';
        codeInput.focus();
      } catch (err) {
        emailMsg.textContent = err.message || '메일 발송에 실패했어요.';
        emailMsg.className = 'field-msg email-msg bad';
        emailVerifyBtn.disabled = false;
      }
    });

    codeVerifyBtn.addEventListener('click', async () => {
      const code = codeInput.value.trim();
      if (!code) { codeMsg.textContent = '인증코드를 입력해주세요.'; codeMsg.className = 'field-msg code-msg bad'; return; }
      codeVerifyBtn.disabled = true;
      codeMsg.textContent = '';
      try {
        const { error } = await client.auth.verifyOtp({ email: pendingEmail, token: code, type: 'email' });
        if (error) throw error;
        emailVerified = true;
        codeMsg.textContent = '이메일 인증이 완료됐어요.';
        codeMsg.className = 'field-msg code-msg good';
        codeInput.disabled = true;
        codeResendBtn.hidden = true;
        pwSections.forEach((el) => { el.hidden = false; });
        updateSignupSubmit();
      } catch (err) {
        codeMsg.textContent = err.message || '인증코드가 올바르지 않아요. 다시 확인해주세요.';
        codeMsg.className = 'field-msg code-msg bad';
        codeVerifyBtn.disabled = false;
      }
    });

    codeResendBtn.addEventListener('click', async () => {
      codeMsg.textContent = '';
      codeResendBtn.disabled = true;
      try {
        const { error } = await client.auth.signInWithOtp({ email: pendingEmail, options: { shouldCreateUser: true } });
        if (error) throw error;
        codeMsg.textContent = '인증코드를 다시 보냈어요.';
        codeMsg.className = 'field-msg code-msg good';
      } catch (err) {
        codeMsg.textContent = err.message || '재전송에 실패했어요.';
        codeMsg.className = 'field-msg code-msg bad';
      } finally {
        setTimeout(() => { codeResendBtn.disabled = false; }, 15000);
      }
    });

    function checkPassword() {
      const v = pwInput.value;
      if (!v) { pwMsg.textContent = ''; pwMsg.className = 'field-msg pw-msg'; }
      else if (PW_RE.test(v)) { pwMsg.textContent = '사용할 수 있는 비밀번호예요.'; pwMsg.className = 'field-msg pw-msg good'; }
      else { pwMsg.textContent = '영문+숫자를 조합해서 8자 이상 입력해주세요.'; pwMsg.className = 'field-msg pw-msg bad'; }
      checkConfirm();
      updateSignupSubmit();
    }
    function checkConfirm() {
      const v2 = pw2Input.value;
      if (!v2) { confirmMsg.textContent = ''; confirmMsg.className = 'field-msg confirm-msg'; }
      else if (v2 === pwInput.value) { confirmMsg.textContent = '비밀번호가 일치해요.'; confirmMsg.className = 'field-msg confirm-msg good'; }
      else { confirmMsg.textContent = '비밀번호가 일치하지 않아요.'; confirmMsg.className = 'field-msg confirm-msg bad'; }
      updateSignupSubmit();
    }
    pwInput.addEventListener('input', checkPassword);
    pw2Input.addEventListener('input', checkConfirm);

    signupForm.addEventListener('submit', (e) => e.preventDefault());
    signupSubmit.addEventListener('click', async () => {
      if (signupSubmit.disabled) return;
      const nameCheck = validateNickname(nickInput.value);
      if (!nameCheck.ok) {
        nickMsg.textContent = nameCheck.reason;
        nickMsg.className = 'field-msg nickname-msg bad';
        return;
      }
      signupSubmit.disabled = true;
      signupMsg.textContent = '';
      const nickname = nickInput.value.trim();
      try {
        const { error: upErr } = await client.auth.updateUser({ password: pwInput.value, data: { nickname } });
        if (upErr) throw upErr;
        const { data: userData } = await client.auth.getUser();
        if (userData && userData.user) {
          const { error: profErr } = await client.from('profiles').update({ nickname }).eq('id', userData.user.id);
          if (profErr) {
            if (profErr.code === '23505') {
              signupMsg.textContent = '이미 사용 중인 이름이에요. 다른 이름으로 다시 시도해주세요.';
              signupSubmit.disabled = false;
              return;
            }
            throw profErr;
          }
        }
        closeModal();
        location.reload();
      } catch (err) {
        signupMsg.textContent = err.message || '가입을 완료하지 못했어요. 다시 시도해주세요.';
        signupSubmit.disabled = false;
      }
    });

    layer.querySelector('.auth-close').addEventListener('click', closeModal);
    layer.addEventListener('click', (e) => { if (!e.target.closest('.auth-panel')) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !layer.hidden) closeModal(); });

    layer._setMode = setMode;
    layer._resetSignup = resetSignupForm;
  }

  function openModal(mode) {
    if (!READY) return;
    ensureModal();
    const layer = document.querySelector('.auth-layer');
    if (layer._resetSignup) layer._resetSignup();
    if (mode && layer._setMode) layer._setMode(mode);
    layer.hidden = false;
    document.body.classList.add('no-scroll');
    setTimeout(() => {
      const sel = mode === 'signup' ? '.signup-form input[name="nickname"]' : '.signin-form input[name="email"]';
      const f = layer.querySelector(sel);
      if (f) f.focus();
    }, 30);
  }
  function closeModal() {
    const layer = document.querySelector('.auth-layer');
    if (layer) layer.hidden = true;
    document.body.classList.remove('no-scroll');
  }

  async function applySession(session) {
    state.user = session ? session.user : null;
    state.nickname = '';
    state.isAdmin = false;
    if (state.user && client) {
      try {
        const { data } = await client.from('profiles').select('nickname, is_admin').eq('id', state.user.id).single();
        state.nickname = (data && data.nickname) || '';
        state.isAdmin = !!(data && data.is_admin);
      } catch (e) { /* 프로필 테이블이 아직 없어도 로그인 자체는 동작해요 */ }
    }
    renderSlot();
    document.dispatchEvent(new CustomEvent('tentrior:auth', { detail: { user: state.user, nickname: state.nickname, isAdmin: state.isAdmin } }));
  }

  window.TENTRIOR = window.TENTRIOR || {};
  window.TENTRIOR.auth = {
    ready: READY,
    client,
    get user() { return state.user; },
    get nickname() { return state.nickname; },
    get isAdmin() { return state.isAdmin; },
    openModal,
    closeModal,

    async init() {
      renderSlot();
      if (!READY) return null;
      const { data } = await client.auth.getSession();
      await applySession(data.session);
      client.auth.onAuthStateChange((_event, session) => { applySession(session); });
      return state.user;
    },

    /** 로그인이 안 돼 있으면 모달을 띄우고 false 를 돌려줘요. */
    requireLogin() {
      if (!READY) { alert('로그인 기능이 아직 준비되지 않았어요. data/supabase-config.js 를 설정해주세요.'); return false; }
      if (state.user) return true;
      openModal('signin');
      return false;
    },

    /** 닉네임 등 프로필을 바꾼 뒤 헤더 표시를 즉시 갱신해요. */
    async refresh() {
      if (!READY) return;
      const { data } = await client.auth.getSession();
      await applySession(data.session);
    }
  };

  document.addEventListener('DOMContentLoaded', () => { window.TENTRIOR.auth.init(); });
})();

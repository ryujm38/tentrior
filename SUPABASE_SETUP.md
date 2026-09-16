# 회원가입 · 로그인 연결하기 (Supabase)

텐트리어는 별도로 서버를 빌리지 않아도 **Supabase**라는 무료 서비스가 회원가입·로그인·데이터 저장을 대신 해줘요. 두 분이 할 일은 딱 세 가지예요.

1. Supabase에 무료 계정 만들기 *(직접 하셔야 해요 — 계정 생성은 본인 인증이 필요해서 제가 대신 할 수 없어요)*
2. 아래 SQL을 복사해서 붙여넣기 (표·규칙 자동 생성)
3. 발급된 주소 2개를 `data/supabase-config.js` 에 붙여넣기

10~15분이면 끝나요. 신용카드 등록 없이 무료로 시작할 수 있어요.

---

## 1단계 — Supabase 프로젝트 만들기

1. **https://supabase.com** 접속 → **Start your project** 클릭
2. GitHub 계정 또는 이메일로 가입 (두 분 계정으로 직접 진행해주세요)
3. **New project** 클릭
   - **Name**: `tentrior` (자유롭게)
   - **Database Password**: 자동 생성되는 비밀번호를 **꼭 메모해두세요** (나중에 필요할 수 있어요)
   - **Region**: `Northeast Asia (Seoul)` 선택 — 방문자 응답 속도가 빨라져요
4. **Create new project** 클릭 후 1~2분 기다리기

---

## 2단계 — 표(테이블) 만들기

프로젝트가 만들어지면 왼쪽 메뉴에서 **SQL Editor** → **New query** 로 들어가서, 아래 코드를 **전체 복사해서 붙여넣고 실행(Run)** 하세요. 한 번만 하면 돼요.

```sql
-- ============================================================
-- 1) 회원 프로필 (닉네임 저장용)
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null default '캠퍼',
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "프로필은 누구나 볼 수 있음"
  on public.profiles for select
  using (true);

create policy "본인 프로필만 등록 가능"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "본인 프로필만 수정 가능"
  on public.profiles for update
  using (auth.uid() = id);

-- 본인 프로필은 수정할 수 있어도, is_admin 값은 대시보드(관리자 SQL)로만 바꿀 수 있게 막아요.
-- (이게 없으면 로그인한 사람이 스스로 관리자 권한을 줄 수 있는 보안 구멍이 생겨요.)
create function public.protect_is_admin()
returns trigger as $$
begin
  if new.is_admin is distinct from old.is_admin and auth.role() <> 'service_role' then
    new.is_admin := old.is_admin;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger protect_profiles_is_admin
  before update on public.profiles
  for each row execute procedure public.protect_is_admin();

-- 회원가입하면 자동으로 프로필 한 줄이 만들어지도록
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nickname)
  values (new.id, coalesce(new.raw_user_meta_data->>'nickname', '캠퍼'));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- 2) 텐들이 글
-- ============================================================
create table public.tendeuli_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nickname text not null,
  title text not null,
  tent text,
  style text,
  season text,
  people text,
  place text,
  intro text,
  point text,
  items jsonb not null default '[]'::jsonb,
  image_path text,
  status text not null default 'pending' check (status in ('pending','published','rejected')),
  created_at timestamptz not null default now()
);

alter table public.tendeuli_posts enable row level security;

create policy "게시된 글은 누구나, 내 글은 나만 볼 수 있음"
  on public.tendeuli_posts for select
  using (status = 'published' or auth.uid() = user_id);

create policy "로그인한 사람은 자기 글을 대기 상태로만 등록 가능"
  on public.tendeuli_posts for insert
  with check (auth.uid() = user_id and status = 'pending');

create policy "대기 중인 내 글은 내가 수정 가능"
  on public.tendeuli_posts for update
  using (auth.uid() = user_id and status = 'pending')
  with check (auth.uid() = user_id and status = 'pending');

create policy "내 글은 내가 삭제 가능"
  on public.tendeuli_posts for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 3) 텐들이 댓글
-- ============================================================
create table public.tendeuli_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.tendeuli_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  nickname text not null,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.tendeuli_comments enable row level security;

create policy "댓글은 누구나 볼 수 있음"
  on public.tendeuli_comments for select
  using (true);

create policy "로그인한 사람은 댓글을 남길 수 있음"
  on public.tendeuli_comments for insert
  with check (auth.uid() = user_id);

create policy "내 댓글은 내가 삭제 가능"
  on public.tendeuli_comments for delete
  using (auth.uid() = user_id);
```

**Run** 버튼을 눌러 실행하세요. "Success. No rows returned" 메시지가 뜨면 성공이에요.

> **이미 이 SQL을 예전에 한 번 실행하셨다면** (표가 이미 있어서 위 SQL이 에러가 난다면), 아래 보정 SQL만 추가로 실행해주세요. `is_admin` 컬럼과 보안 트리거를 뒤늦게 추가하는 코드예요.
> ```sql
> alter table public.profiles add column if not exists is_admin boolean not null default false;
>
> create or replace function public.protect_is_admin()
> returns trigger as $$
> begin
>   if new.is_admin is distinct from old.is_admin and auth.role() <> 'service_role' then
>     new.is_admin := old.is_admin;
>   end if;
>   return new;
> end;
> $$ language plpgsql security definer;
>
> drop trigger if exists protect_profiles_is_admin on public.profiles;
> create trigger protect_profiles_is_admin
>   before update on public.profiles
>   for each row execute procedure public.protect_is_admin();
> ```

---

## 3단계 — 사진 저장 공간(Storage) 만들기

1. 왼쪽 메뉴 **Storage** → **New bucket**
2. 이름: `tendeuli-photos`
3. **Public bucket** 체크박스 **켜기** (사진이 사이트에서 보여야 하니까 공개로 설정)
4. **Create bucket**

그다음 다시 **SQL Editor** → **New query** 에서 아래를 실행하세요 (사진 접근 규칙):

```sql
create policy "텐들이 사진은 누구나 볼 수 있음"
  on storage.objects for select
  using (bucket_id = 'tendeuli-photos');

create policy "로그인한 사람은 텐들이 사진을 올릴 수 있음"
  on storage.objects for insert
  with check (bucket_id = 'tendeuli-photos' and auth.role() = 'authenticated');
```

---

## 4단계 — 사이트에 연결하기

1. Supabase 왼쪽 메뉴 **Project Settings**(⚙️) → **API**
2. **Project URL** 값 복사 (`https://xxxxxxxx.supabase.co` 형태)
3. **Project API keys** 에서 **anon / public** 키 복사 (긴 문자열)
   - ⚠️ **service_role** 키는 절대 복사하지 마세요. 그건 관리자 전용 비밀 키예요.
4. 텐트리어 프로젝트의 `data/supabase-config.js` 파일을 열어서 붙여넣기:

```js
window.TENTRIOR_SUPABASE = {
  url: '여기에 Project URL 붙여넣기',
  anonKey: '여기에 anon public 키 붙여넣기'
};
```

5. 파일 저장 → 미리보기(`serve.ps1`)를 껐다 다시 켜고 사이트 새로고침

헤더 오른쪽에 **로그인 아이콘**이 나타나면 성공이에요. 회원가입 → 이메일로 온 확인 링크 클릭 → 로그인 → `tendeuli.html`에서 **내 캠핑 올리기** 버튼으로 텐들이 페이지(`tendeuli-submit.html`)에 실제로 글을 올려보세요.

---

## 5단계 — 이메일 확인 화면 조금 더 예쁘게 (선택)

기본 상태로도 잘 작동하지만, 회원가입 확인 메일이 영어로 와요. 한글로 바꾸고 싶다면:

- Supabase 왼쪽 메뉴 **Authentication** → **Email Templates** 에서 문구를 한글로 수정할 수 있어요.
- **Authentication** → **URL Configuration** 에서 **Site URL** 을 실제 사이트 주소로 넣어두면, 이메일 속 링크가 로컬 주소가 아니라 실제 사이트로 연결돼요. (아직 도메인이 없다면 나중에 도메인을 연결한 뒤 이 값을 채워도 돼요.)

---

## 6단계 — 광고 배너 관리 연결하기

관리자 페이지에서 홈페이지에 보여줄 광고 배너(이미지 + 연결 링크)를 직접 올리고 지우려면, 표 1개와 저장 공간 1개를 더 만들어야 해요. **SQL Editor** → **New query** 에서 아래를 실행하세요.

```sql
-- 광고 배너 표
create table public.ads (
  id uuid primary key default gen_random_uuid(),
  title text,
  link_url text,
  image_path text not null,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.ads enable row level security;

create policy "노출 중인 광고는 누구나 볼 수 있음"
  on public.ads for select
  using (active = true);

create policy "관리자는 모든 광고를 볼 수 있음"
  on public.ads for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

create policy "관리자만 광고를 등록 가능"
  on public.ads for insert
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

create policy "관리자만 광고를 수정 가능"
  on public.ads for update
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

create policy "관리자만 광고를 삭제 가능"
  on public.ads for delete
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));
```

그다음 **Storage** → **New bucket** 으로 이미지 저장 공간을 만드세요.

1. 이름: `ad-images`
2. **Public bucket** 체크박스 **켜기**
3. **Create bucket**

다시 **SQL Editor** 에서 접근 규칙을 추가하세요.

```sql
create policy "광고 이미지는 누구나 볼 수 있음"
  on storage.objects for select
  using (bucket_id = 'ad-images');

create policy "관리자만 광고 이미지를 올릴 수 있음"
  on storage.objects for insert
  with check (bucket_id = 'ad-images' and exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

create policy "관리자만 광고 이미지를 지울 수 있음"
  on storage.objects for delete
  using (bucket_id = 'ad-images' and exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));
```

이제 관리자 계정으로 로그인해서 **관리자 페이지 → 광고 배너 관리**로 들어가면, 이미지와 연결 링크를 올려서 바로 등록할 수 있어요. 등록한 광고는 홈페이지에 자동으로 나타나고, "숨기기"나 "삭제"로 언제든 뺄 수 있어요.

---

## 새로 올라온 텐들이 글, 승인하는 법

사이트에 **관리자 페이지(`admin.html`)** 가 있어서, 관리자로 지정된 계정으로 로그인하면 거기서 바로 승인·반려·댓글 삭제를 할 수 있어요. 헤더의 내 계정 메뉴 → **관리자 페이지**로 들어가면 돼요.

물론 Supabase **Table Editor** → `tendeuli_posts` 에서 `status` 값을 직접 바꿔도 똑같이 동작해요 (`pending` → `published`/`rejected`). 사진 원본은 왼쪽 메뉴 **Storage** → `tendeuli-photos` 버킷에서 확인할 수 있어요.

### 관리자 계정 추가하기 (예: 배우자 계정)

1. 추가하고 싶은 사람이 먼저 사이트에서 회원가입을 완료해요.
2. Supabase **SQL Editor** 에서 아래 SQL의 이메일 주소만 바꿔서 실행하세요.

```sql
update public.profiles set is_admin = true
where id = (select id from auth.users where email = '여기에_이메일');
```

3. 저장 후 그 계정으로 사이트에 다시 로그인하면 "관리자 페이지" 메뉴가 나타나요.

관리자 권한은 Supabase 대시보드(또는 이 SQL)를 통해서만 부여할 수 있고, 사이트 자체에서는 누구도 스스로 관리자가 될 수 없도록 막아뒀어요.

---

## 무료 요금제로 충분한가요?

Supabase 무료 요금제는 데이터베이스 500MB, 파일 저장 1GB, 월간 활성 사용자 5만 명까지 무료예요. 텐들이가 막 시작하는 단계에서는 넉넉해요. 나중에 사용자가 크게 늘면 유료 플랜(월 25달러부터)으로 넘어가면 돼요 — 이건 그때 가서 결정해도 늦지 않아요.

---

## 문제가 생겼을 때

- **로그인 아이콘이 안 보여요**: `data/supabase-config.js` 에 값이 제대로 들어갔는지, 오타는 없는지 확인하세요.
- **가입은 되는데 로그인이 안 돼요**: 이메일함에서 확인 링크를 눌렀는지 확인하세요 (기본적으로 이메일 인증이 필요해요).
- **글 올리기가 실패해요**: 브라우저에서 F12 → Console 탭의 에러 메시지를 확인하세요. 대부분 2단계·3단계의 SQL을 실행하지 않았을 때 발생해요.
- **사진이 안 보여요**: 3단계에서 버킷을 만들 때 **Public bucket** 을 켰는지 확인하세요.


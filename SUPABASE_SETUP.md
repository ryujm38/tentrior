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

## 7단계 — 텐트리어 세팅(대문 슬라이드 포함) 관리 연결하기

관리자 페이지에서 "텐트리어 세팅"(사진 속 아이템을 소개하는 대표 콘텐츠, 메인 대문 슬라이드도 여기서 나와요)을 등록·수정·삭제하려면 표 1개와 저장 공간 1개가 더 필요해요. **SQL Editor** → **New query** 에서 아래를 실행하세요.

```sql
-- 텐트리어 세팅 표
create table public.setups (
  id text primary key default gen_random_uuid()::text,
  featured boolean not null default false,
  setup_date date not null default current_date,
  title text not null,
  subtitle text,
  style text,
  tent text,
  people text,
  season text,
  image_path text,
  summary text,
  story jsonb not null default '[]'::jsonb,
  tips jsonb not null default '[]'::jsonb,
  items jsonb not null default '[]'::jsonb,
  budget jsonb,
  hero jsonb,
  created_at timestamptz not null default now()
);

alter table public.setups enable row level security;

create policy "세팅은 누구나 볼 수 있음"
  on public.setups for select
  using (true);

create policy "관리자만 세팅을 등록 가능"
  on public.setups for insert
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

create policy "관리자만 세팅을 수정 가능"
  on public.setups for update
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

create policy "관리자만 세팅을 삭제 가능"
  on public.setups for delete
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));
```

그다음 **Storage** → **New bucket** 으로 사진 저장 공간을 만드세요.

1. 이름: `setup-images`
2. **Public bucket** 체크박스 **켜기**
3. **Create bucket**

다시 **SQL Editor** 에서 접근 규칙을 추가하세요.

```sql
create policy "세팅 사진은 누구나 볼 수 있음"
  on storage.objects for select
  using (bucket_id = 'setup-images');

create policy "관리자만 세팅 사진을 올릴 수 있음"
  on storage.objects for insert
  with check (bucket_id = 'setup-images' and exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

create policy "관리자만 세팅 사진을 지울 수 있음"
  on storage.objects for delete
  using (bucket_id = 'setup-images' and exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));
```

### 지금 있는 샘플 세팅(6개)을 표로 옮기기

지금 사이트에 보이는 샘플 세팅 6개(`data/setups.js`)를 표에 그대로 넣어두는 SQL이에요. 이렇게 하면 관리자 페이지에서 바로 이 샘플들을 수정하거나 지울 수 있어요. **한 번만 실행**하세요.

```sql
insert into public.setups (id, featured, setup_date, title, subtitle, style, tent, people, season, summary, story, tips, items, budget, hero) values
('001', true, '2026-09-12', 'Warm Wood Camping', '티피텐트를 따뜻한 우드톤으로 채운 가을 2인 캠핑', 'midcentury', 'tent-tc-tipi', '2인', '가을', '샌드 컬러 티피에 원목 IGT 테이블과 캔버스 체어를 더해, 해가 지고 나서 더 예뻐지는 우드 캠핑 세팅이에요.', '["가을 캠핑은 해가 빨리 지기 때문에, 이번 세팅은 처음부터 “밤에 예쁜 공간”을 목표로 잡았어요. 조명은 오일 랜턴 하나와 우드 쉐이드를 씌운 LED 랜턴 하나, 딱 두 개만 썼어요.","우드 톤은 오크 계열로 맞추고, 레드 체크 블랭킷 하나로만 컬러 포인트를 줬어요. 러그는 일부러 밝은 베이지로 깔아서 진한 우드 가구가 무거워 보이지 않게 했어요."]'::jsonb, '["우드 톤은 한 가지 계열(오크 or 월넛)로 통일하기","컬러 포인트는 블랭킷 하나로 충분해요","수납은 오픈 쉘프에 “보여줘도 되는 것”만"]'::jsonb, '[{"product":"p-tent-tc-tipi","x":24,"y":52},{"product":"p-lantern-oil","x":53,"y":40},{"product":"p-lantern-shade","x":72,"y":28},{"product":"p-table-igt","x":70,"y":66},{"product":"p-kitchen-wood","x":58,"y":58},{"product":"p-chair-canvas","qty":2,"x":86,"y":47},{"product":"p-fabric-blanket","x":82,"y":72},{"product":"p-rug-beige","x":38,"y":88},{"product":"p-storage-shelf","x":16,"y":80}]'::jsonb, '{"note":"텐트와 러그는 그대로, 가구와 조명을 가성비 제품으로 바꿔 비슷한 분위기를 만들었어요.","items":[{"product":"p-tent-tc-tipi"},{"product":"p-lantern-led"},{"product":"p-lantern-shade"},{"product":"p-table-roll"},{"product":"p-chair-wood-basic","qty":2},{"product":"p-rug-beige"},{"product":"p-storage-box"}]}'::jsonb, '{"title":"머무는 순간이\n더 특별해지는 곳.","sub":"좋아하는 것으로 채운 공간은 언제나 좋은 기억이 돼요.","mood":"golden"}'::jsonb),
('002', false, '2026-09-05', 'Cream Air Camping', '크림 에어텐트로 만든 화사한 봄·가을 거실', 'natural', 'tent-air-cream', '2~3인', '봄', '밝은 에어텐트에 아이보리 체어와 법랑 식기를 맞춘, 사진이 가장 화사하게 나오는 크림 캠핑이에요.', '["크림 캠핑은 “하얗게”가 아니라 “톤을 나누는 것”이 핵심이에요. 텐트가 가장 밝고, 러그가 중간, 우드 소품이 가장 진한 톤이 되도록 맞췄어요.","줄조명은 에어빔 라인을 따라 걸어서 텐트의 곡선이 밤에도 보이게 했어요."]'::jsonb, '["밝은 원단에는 원색 장비가 비쳐 보이니 캔버스 박스로 가리기","전구색 조명 하나로 통일","쿠션 커버만 바꿔도 체어 분위기가 달라져요"]'::jsonb, '[{"product":"p-tent-air-cream","x":24,"y":52},{"product":"p-lantern-string","x":72,"y":28},{"product":"p-lantern-led","x":53,"y":40},{"product":"p-table-low","x":70,"y":66},{"product":"p-kitchen-enamel","x":58,"y":58},{"product":"p-chair-cream","qty":2,"x":86,"y":47},{"product":"p-fabric-cushion","x":82,"y":72},{"product":"p-rug-beige","x":38,"y":88},{"product":"p-storage-box","x":16,"y":80}]'::jsonb, null, '{"title":"밝은 톤으로 채운\n우리만의 작은 거실.","sub":"크림 에어텐트에 톤을 세 단계로 나눠 화사하게 꾸몄어요.","mood":"golden"}'::jsonb),
('003', false, '2026-08-29', 'Black Minimal Camping', '필요한 것만 남긴 블랙 터널 텐트 세팅', 'black', 'tent-tunnel-black', '2인', '겨울', '블랙 텐트와 알루미늄 가구, 여섯 가지 장비만으로 완성한 미니멀 세팅이에요.', '["장비를 줄일수록 완성도가 올라가는 스타일이라, 이번엔 “이거 없으면 불편한가?”를 기준으로 하나씩 뺐어요.","전부 블랙이면 사진에서 형태가 뭉개져서, 러그만 한 톤 밝은 차콜로 골랐어요."]'::jsonb, '["조명은 낮은 위치에 분산","컬러는 블랙·실버·차콜 3가지 안에서","수납은 일렬로 줄 세우기"]'::jsonb, '[{"product":"p-tent-tunnel-black","x":24,"y":52},{"product":"p-lantern-led","x":53,"y":40},{"product":"p-table-alu","x":70,"y":66},{"product":"p-chair-black","qty":2,"x":86,"y":47},{"product":"p-rug-black","x":38,"y":88},{"product":"p-storage-crate","x":16,"y":80}]'::jsonb, null, null),
('004', false, '2026-08-22', 'Nordic Small Tent', '2인 소형 돔텐트 앞에 만든 작은 거실', 'white', 'tent-dome-ivory', '2인', '여름', '작은 돔텐트도 낮은 가구와 러그 하나면 충분히 예쁜 거실이 생겨요. 입문 부부에게 추천하는 세팅.', '["작은 텐트는 안을 꾸미기보다 “텐트 앞”을 거실로 쓰는 게 훨씬 효과적이에요.","가구 높이를 전부 무릎 아래로 맞췄더니 텐트와 비율이 맞아서 사진이 안정적으로 나왔어요."]'::jsonb, '["텐트 안은 잠자는 공간으로 비워두기","로우 가구로 비율 맞추기","법랑 식기로 완성도 올리기"]'::jsonb, '[{"product":"p-tent-dome-ivory","x":24,"y":52},{"product":"p-lantern-string","x":72,"y":28},{"product":"p-table-low","x":70,"y":66},{"product":"p-kitchen-enamel","x":58,"y":57},{"product":"p-fabric-tablecloth","x":52,"y":68},{"product":"p-chair-cream","qty":2,"x":86,"y":47},{"product":"p-rug-beige","x":38,"y":88}]'::jsonb, null, null),
('005', false, '2026-08-15', 'Vintage Lantern Night', '오일 랜턴과 킬림 러그로 채운 밤 캠핑', 'midcentury', 'tent-tc-tipi', '2인', '가을', '패턴은 러그 하나에만, 나머지는 무지로 받쳐서 과하지 않은 빈티지 무드를 만들었어요.', '["빈티지 캠핑은 아이템 하나하나보다 “조명 색온도”가 분위기의 절반이에요. 해가 지면 LED는 끄고 오일 랜턴만 켰어요.","킬림 러그가 강한 만큼 블랭킷과 수납박스는 무지로 골라 균형을 맞췄어요."]'::jsonb, '["패턴은 한 가지 아이템에만","무광·브라스 마감 고르기","텐트 안 화기 사용 시 환기·안전거리 필수"]'::jsonb, '[{"product":"p-tent-tc-tipi","x":24,"y":52},{"product":"p-lantern-oil","x":53,"y":40},{"product":"p-table-roll","x":70,"y":66},{"product":"p-chair-canvas","qty":2,"x":86,"y":47},{"product":"p-fabric-blanket","x":82,"y":72},{"product":"p-rug-kilim","x":38,"y":88},{"product":"p-storage-box","x":16,"y":80}]'::jsonb, null, '{"title":"랜턴 하나로\n완성하는 밤.","sub":"오일 랜턴과 킬림 러그로 채운 빈티지 캠핑의 밤이에요.","mood":"night"}'::jsonb),
('006', false, '2026-08-08', 'Natural Forest Camping', '숲과 어우러지는 내추럴 톤 가족 캠핑', 'natural', 'tent-air-cream', '3~4인', '여름', '밝은 우드와 카키 체어, 코튼 러그로 주변 숲과 경계 없이 어우러지게 만든 세팅이에요.', '["숲속 사이트라 주변 초록이 이미 충분해서, 장비에는 초록을 거의 쓰지 않고 우드와 오트밀 톤으로 받쳤어요.","오픈 쉘프를 두니 아이들 물건도 정리한 느낌이 나서 좋았어요."]'::jsonb, '["그린은 채도 낮은 컬러로 한두 개만","플라스틱 소품 최소화","쉘프로 “정리된 느낌” 만들기"]'::jsonb, '[{"product":"p-tent-air-cream","x":24,"y":52},{"product":"p-lantern-led","x":53,"y":40},{"product":"p-lantern-shade","x":72,"y":28},{"product":"p-table-roll","x":70,"y":66},{"product":"p-kitchen-wood","x":58,"y":58},{"product":"p-chair-wood-basic","qty":2,"x":86,"y":47},{"product":"p-rug-beige","x":38,"y":88},{"product":"p-storage-shelf","x":16,"y":80}]'::jsonb, null, null)
on conflict (id) do nothing;
```

실행한 뒤에는 관리자 계정으로 로그인해서 **관리자 페이지 → 텐트리어 세팅 관리**로 들어가면 6개 샘플이 목록에 보여요. 여기서 "수정하기"로 내용을 실제 세팅으로 바꾸거나, "삭제"로 지우거나, "+ 새 세팅 추가"로 새로 올릴 수 있어요. 등록한 세팅 중 "메인 첫 화면(대문) 슬라이드로 올리기"를 켠 항목은 자동으로 홈페이지 대문 슬라이드에 나타나요.

> `data/setups.js` 파일은 그대로 둬도 괜찮아요 — Supabase 연결 전이거나 등록된 세팅이 하나도 없을 때만 보여주는 기본 샘플이에요. Supabase에 세팅을 하나라도 등록하면 그때부터는 표에 있는 내용이 사이트에 보여요.

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


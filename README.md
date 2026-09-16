# TENTRIOR 텐트리어 — 운영 가이드

> 우리다운 캠핑을 만드는 법.
> 캠핑을 더 우리답게 만드는 스타일과 아이템을 소개합니다. (MVP v0.2)

## 0. 브랜드 & 디자인 기준

| 역할 | 색 | 코드 | 쓰는 곳 |
|---|---|---|---|
| 메인 | 딥그린 (숲) | `#22402F` | 제목, 기본 버튼, 뉴스레터·푸터 배경 |
| 보조 | 우드 브라운 | `#8A5F3D` / 로고 `#4A382C` | 로고, 구분선, 우드 소품 |
| 강조 | 주황 (모닥불) | `#D9732E` / 글자용 `#B3561C` | 핵심 버튼(SHOP THE SETUP), 선택된 번호·탭 |
| 포인트 | 골드 (랜턴) | `#C9A24E` / 글자용 `#86631F` | 영문 라벨, PICK 배지, 밑줄 |
| 바탕 | 웜 아이보리 | `#F7F3EB` · `#EDE6DA` | 페이지 배경 |

- 글꼴: 로고·영문 **Cormorant Garamond** / 한글 제목 **마루부리** / 본문 **Pretendard**
- 색은 `assets/css/style.css` 맨 위 `:root` 에서 한 번에 바꿀 수 있어요.
- 말투: 장비 스펙 중심 ✕, 과한 전문가 말투 ✕, 뜬구름 감성 ✕
  → 따라 하고 싶은 스타일 ○, 예쁘고 실용적인 아이템 ○, 부부의 진짜 캠핑 ○

설치나 빌드 없이 **HTML / CSS / JavaScript 파일만으로** 동작하는 사이트예요.
콘텐츠는 `data` 폴더의 파일만 수정하면 되고, 디자인과 기능 코드는 건드릴 필요가 없어요.

---

## 1. 메뉴 구조

메인 메뉴는 4개예요. 이전 6메뉴(LOOK·STYLE·PICK·GUIDE·JOURNAL·SHOP)는 아래처럼 통합·재배치했어요.

| 새 메뉴 | 주소 | 내용 | 예전 메뉴 |
|---|---|---|---|
| **텐트리어** | `look.html` | 우리가 꾸민 캠핑 세팅. 텐트별(By Tent)·스타일별·계절별로 둘러보기 | LOOK + STYLE + GUIDE |
| **텐들이** | `tendeuli.html` | 캠퍼들의 캠핑 집들이 (사용자 참여 갤러리) | *(신규)* |
| **캠퍼저널** | `camperjournal.html` | 장비 선택법·텐트 관리·조명·수납·계절 캠핑·캠핑장 노하우 — 검색 유입용 정보 글 | *(신규)* |
| **텐트리어 픽** | `pick.html` | 에디터 추천(Editor's Pick) + 카테고리·스타일 필터 전체 제품 | PICK + SHOP |

`style.html`(스타일 상세·취향 테스트)과 `guide.html`(텐트별 상세 가이드)은 top 메뉴에서는 빠졌지만, **텐트리어 페이지에서 한 번에 연결**되는 하위 페이지로 남아있어요. 부부의 캠핑 기록(예전 JOURNAL)은 `weekend.html`로 이름을 바꿔 메인 화면 "이번 주 우리는 여기에서 머물렀어요" 섹션에서 계속 보여줘요.

---

## 2. 폴더 구조

```
TENTRIOR/
├─ index.html            메인 (사진 슬라이드 · 4메뉴 카테고리 · BEST PICKS · SHOP THE LOOK · 배너)
├─ look.html             텐트리어 — 세팅 목록 (By Tent 요약 + 스타일·계절·인원 필터)
├─ setup.html            SETUP 상세 — SHOP THE SETUP (사진 번호 → 제품)
├─ style.html            스타일 상세 · 취향 테스트 (텐트리어 하위 페이지)
├─ guide.html            텐트별 꾸미기 가이드 · 처음 시작하는 순서 (텐트리어 하위 페이지)
├─ tendeuli.html         텐들이 — 캠퍼 참여 갤러리 (목록 + 상세)
├─ camperjournal.html    캠퍼저널 — 캠핑 팁 정보 글 (목록 + 상세)
├─ pick.html             텐트리어 픽 — 에디터 추천 + 전체 제품 필터
├─ weekend.html          TENTRIOR WEEKEND — 부부의 캠핑 기록
├─ about.html            브랜드 소개 · 운영 원칙 · 브랜드 협업 문의
├─ tent.html, journal.html, shop.html   (예전 주소 → 새 주소로 자동 이동. 사이트 올릴 때 지워도 됨)
│
├─ data/                 ★ 콘텐츠는 여기만 수정
│  ├─ site.js            사이트 설정 (메일, SNS, 샘플 모드, 텐들이 참여 폼, 고지 문구)
│  ├─ products.js        제품 DB
│  ├─ setups.js          세팅 DB (텐트리어 대표 콘텐츠)
│  ├─ tents.js           텐트 DB (guide.html)
│  ├─ styles.js          스타일 DB
│  ├─ tendeuli.js        텐들이 — 캠퍼 참여 글 DB
│  ├─ camperjournal.js   캠퍼저널 — 팁 글 DB
│  └─ journal.js         부부의 캠핑 기록 (weekend.html)
│
├─ assets/
│  ├─ css/style.css      디자인
│  ├─ js/app.js          화면을 그리는 코드
│  └─ images/            사진 (setups / products / journal 등)
│
├─ tools/hotspot.html    운영 도구: 사진 속 제품 번호 좌표 만들기
└─ serve.ps1             내 PC에서 미리보기
```

---

## 3. 내 PC에서 미리보기

PowerShell에서 `TENTRIOR` 폴더로 이동한 뒤:

```
powershell -ExecutionPolicy Bypass -File serve.ps1
```

브라우저에서 **http://localhost:8080** 에 접속하세요. 종료는 `Ctrl + C`.

---

## 4. 새 세팅(TENTRIOR SETUP) 올리는 순서

텐트리어의 핵심 콘텐츠예요. 캠핑 한 번 → 세팅 하나를 목표로 해요.

**① 사진 준비**
- 가로 **3:2 비율** (예: 1800×1200px), 용량은 장당 500KB 이하 권장
- 제품이 잘 보이도록 “공간 전체”가 나오는 컷 1장 + 디테일 컷
- `assets/images/setups/007.jpg` 처럼 세팅 번호로 저장

**② 제품 등록** — `data/products.js`
- 사진에 나오는 제품 중 아직 없는 것만 추가해요 (한 번 등록하면 모든 페이지에서 재사용)
- `url` 에 제휴 링크를 넣어요

```js
{ id: 'p-chair-xxx', name: '제품명', brand: '브랜드', category: 'chair',
  color: '브라운', material: '캔버스', price: 129000,
  url: '제휴 링크', styles: ['wood', 'vintage'], swatch: '#7B5A3E',
  image: 'assets/images/products/p-chair-xxx.jpg' },
```

`category` 는 `tent` `table` `chair` `lantern` `rug` `storage` `kitchen` `fabric` 중 하나.

**③ 번호 좌표 만들기** — `tools/hotspot.html`
- 미리보기 서버를 켠 상태에서 http://localhost:8080/tools/hotspot.html 접속
- 사진 선택 → 제품 선택 → 사진 속 위치 클릭 → **코드 복사**

**④ 세팅 등록** — `data/setups.js` 맨 위에 추가

```js
{
  id: '007', date: '2026-09-20', featured: false,
  title: 'Autumn Picnic Camping', subtitle: '한 줄 설명',
  style: 'wood', tent: 'tent-tc-tipi', people: '2인', season: '가을',
  image: 'assets/images/setups/007.jpg',
  summary: '검색 결과·카드에 보일 요약 한두 문장',
  story: ['이렇게 꾸몄어요 1문단', '2문단'],
  tips: ['따라 하기 포인트 1', '포인트 2', '포인트 3'],
  items: [ /* ③에서 복사한 코드 붙여넣기 */ ],
  budget: { note: '...', items: [ { product: '...' } ] }   // 선택
},
```

- 메인 첫 화면 사진 슬라이드에 올리려면 `hero: { title: '첫 줄\\n둘째 줄', sub: '한 줄 설명' }` 추가 (최대 5개)
- 메인 SHOP THE LOOK 섹션의 세팅은 `data/site.js` 의 `homeShopTheLook`
- 메인 카테고리 5칸·배너 2칸 사진은 `data/site.js` 의 `tileImages`, `bannerImages`
- 로고 이미지 파일을 쓰려면 `data/site.js` 의 `logoImage` 에 경로 입력 (비워두면 글자 로고)

> 쉼표(,)나 따옴표가 하나라도 빠지면 페이지가 비어 보여요.
> 그럴 땐 브라우저에서 F12 → Console 탭의 빨간 에러 줄 번호를 확인하세요.

---

## 5. 텐들이 · 캠퍼저널 글 올리기

두 콘텐츠 모두 SETUP보다 훨씬 간단해요. 각 데이터 파일 맨 위에 객체 하나만 추가하면 돼요.

**텐들이** — `data/tendeuli.js`
```js
{
  id: 'td-005', date: '2026-09-18', nickname: '작성자 닉네임',
  title: '한 줄 제목', tent: '텐트 이름(자유 입력)', style: 'wood',
  season: '가을', people: '2인', place: '지역',
  intro: '소개 문단', point: '스타일링 포인트 한 줄', // 선택
  items: [ { name: '아이템명', product: 'p-xxx' }, { name: '제품 DB에 없으면 product 생략' } ],
  comment: '텐트리어 부부의 한마디' // 선택
},
```
사진 게시 동의를 받은 것만 올리고, `image` 에 사진 경로를 넣어주세요 (비워두면 스타일 색 기반 샘플 그림).

**캠퍼저널** — `data/camperjournal.js`
```js
{
  id: 'cj-009', date: '2026-09-18', category: '장비 선택법', // 텐트 관리·조명·수납·계절 캠핑·캠핑장 노하우 중 선택 가능
  title: '검색될 만한 제목', excerpt: '목록에 보일 한 줄 요약',
  body: ['문단 1', '문단 2'], tags: ['태그1', '태그2'],
  relatedProducts: ['p-xxx'],  // 텐트리어 픽으로 연결 (선택)
  relatedSetups: ['001']       // 텐트리어 세팅으로 연결 (선택)
},
```
`relatedProducts`/`relatedSetups` 를 채우면 글 하단에 관련 제품·세팅이 자동으로 붙어서, 정보 글이 자연스럽게 구매·세팅 페이지로 이어져요.

---

## 6. 오픈 전 체크리스트

- [ ] `data/site.js` — 메일, 인스타그램, 블로그, 텐들이 참여 폼(`tendeuliFormUrl`) 주소 입력
- [ ] 샘플 데이터를 실제 세팅·제품으로 교체 (최소 세팅 6개, 텐들이·캠퍼저널 각 3개 권장)
- [ ] 샘플 텐트를 **두 분이 실제로 쓰는 텐트 모델명**으로 교체 → 검색 유입 핵심
- [ ] 모든 제품 `url` 을 제휴 링크로 교체
- [ ] 제휴 프로그램별 **필수 고지 문구** 확인 후 `disclosure` 수정
      (쿠팡 파트너스·네이버 쇼핑 커넥트 각 가이드 + 공정위 추천·보증 심사지침)
- [ ] 협찬받은 제품이 들어간 세팅은 제목이나 요약에 `[협찬]` 표시
- [x] `data/site.js` 의 `sampleNotice: false` 로 샘플 안내 띠 끄기
- [ ] `about.html` 의 TODO 자리에 두 분 사진·소개 넣기
- [ ] `tent.html`, `journal.html`, `shop.html`(예전 주소 리다이렉트 파일) 삭제 여부 결정 — 남겨둬도 무해해요
- [ ] 휴대폰으로 모든 페이지 확인

---

## 7. 인터넷에 올리기 (무료)

폴더 전체를 그대로 올리면 돼요. `serve.ps1` 과 `README.md` 는 올려도 문제없어요.

| 방법 | 난이도 | 특징 |
|---|---|---|
| **Netlify Drop** | ★ | 사이트에서 폴더를 끌어다 놓으면 끝. 가장 빠름 |
| **Cloudflare Pages** | ★★ | 국내 속도 좋음, 직접 업로드 또는 GitHub 연결 |
| **GitHub Pages** | ★★ | 수정 이력 관리까지 가능 |

그다음:
1. 도메인 구매 (예: tentrior.kr / tentrior.co.kr — 구매 전 사용 가능 여부와 KIPRIS 상표 검토)
2. 호스팅 서비스에서 도메인 연결
3. **Google Search Console**, **네이버 서치어드바이저**에 사이트 등록
4. **GA4**(구글 애널리틱스) 설치 → 제휴 링크 클릭이 `affiliate_click` 이벤트로 자동 기록돼요
   (사진 번호 클릭은 `hotspot_open`, 취향 테스트 완료는 `quiz_complete`)

---

## 8. 회원가입 · 로그인 (Supabase 연동)

**8장부터는 별도 안내 문서(`SUPABASE_SETUP.md`)에 자세히 정리했어요.** 요약하면:

- 이 사이트는 서버를 직접 운영하지 않고, **Supabase**(무료로 시작 가능한 백엔드 서비스)가 회원가입·로그인·데이터 저장을 대신 처리해요.
- 두 분이 Supabase에 무료 계정을 만들고 프로젝트를 하나 생성하면, 발급되는 **Project URL** 과 **anon public key** 두 값을 `data/supabase-config.js` 에 붙여넣기만 하면 로그인 기능이 켜져요.
- 로그인한 사용자는 텐들이에 **직접 사진과 글을 올릴 수** 있고, 두 분은 Supabase 대시보드에서 승인(게시) 여부를 정해요.

자세한 계정 생성 절차, 붙여넣을 SQL, 체크리스트는 `SUPABASE_SETUP.md` 를 확인하세요.

---

## 9. 다음 개발 단계 (로드맵)

**2단계 — 운영 시작 (1~3개월)**
- 뉴스레터 서비스(스티비 등) 연결 → `data/site.js` 의 `newsletterUrl`
- GA4로 “어떤 스타일/제품이 클릭되는지” 데이터 쌓기
- 세팅 한 개 → 인스타 캐러셀·릴스·블로그로 재가공

**3단계 — 검색 최적화 (콘텐츠 20~30개 시점)**
- 지금 구조는 브라우저에서 JavaScript로 화면을 그려요.
  구글은 대체로 읽어가지만, **네이버 검색 수집에는 불리할 수 있어요.**
- 콘텐츠가 쌓이면 같은 `data` 구조를 그대로 두고, 페이지를 미리 HTML로 만들어두는
  정적 사이트 생성 방식(예: Astro)으로 전환해요. 세팅마다 고유 주소(`/setup/007`)도 생겨요.

**4단계 — 커머스 확장 (6개월~)**
- 브랜드 협업 페이지 고도화 (방문자·클릭 데이터가 담긴 브랜드 키트)
- 공동구매 페이지, TENTRIOR ORIGINAL 상품 페이지


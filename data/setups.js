/* ============================================================
   SETUP DB — TENTRIOR SETUP (대표 콘텐츠 포맷)
   ------------------------------------------------------------
   image  : 'assets/images/setups/001.jpg' (비워두면 샘플 일러스트)
   items  : 사진 속 제품. x / y 는 사진 위 번호 위치(%)
            → tools/hotspot.html 에서 사진을 클릭하면 자동으로 만들어져요.
   qty    : 수량 (기본 1)
   budget : 비슷한 분위기를 더 저렴하게 만드는 대안 구성 (선택)
   hero   : 메인 첫 화면 슬라이드에 올릴 때만 (선택)
            { title: '줄바꿈은\n이렇게', sub: '한 줄 설명', mood: 'golden' | 'night' | 'day' }
   ※ 아래는 샘플 데이터입니다.
   ============================================================ */
window.TENTRIOR = window.TENTRIOR || {};

TENTRIOR.setups = [
  {
    id: '001', featured: true, date: '2026-09-12',
    hero: { title: '머무는 순간이\n더 특별해지는 곳.', sub: '좋아하는 것으로 채운 공간은 언제나 좋은 기억이 돼요.', mood: 'golden' },
    title: 'Warm Wood Camping', subtitle: '티피텐트를 따뜻한 우드톤으로 채운 가을 2인 캠핑',
    style: 'midcentury', tent: 'tent-tc-tipi', people: '2인', season: '가을', image: '',
    summary: '샌드 컬러 티피에 원목 IGT 테이블과 캔버스 체어를 더해, 해가 지고 나서 더 예뻐지는 우드 캠핑 세팅이에요.',
    story: [
      '가을 캠핑은 해가 빨리 지기 때문에, 이번 세팅은 처음부터 “밤에 예쁜 공간”을 목표로 잡았어요. 조명은 오일 랜턴 하나와 우드 쉐이드를 씌운 LED 랜턴 하나, 딱 두 개만 썼어요.',
      '우드 톤은 오크 계열로 맞추고, 레드 체크 블랭킷 하나로만 컬러 포인트를 줬어요. 러그는 일부러 밝은 베이지로 깔아서 진한 우드 가구가 무거워 보이지 않게 했어요.'
    ],
    tips: ['우드 톤은 한 가지 계열(오크 or 월넛)로 통일하기', '컬러 포인트는 블랭킷 하나로 충분해요', '수납은 오픈 쉘프에 “보여줘도 되는 것”만'],
    items: [
      { product: 'p-tent-tc-tipi', x: 24, y: 52 },
      { product: 'p-lantern-oil', x: 53, y: 40 },
      { product: 'p-lantern-shade', x: 72, y: 28 },
      { product: 'p-table-igt', x: 70, y: 66 },
      { product: 'p-kitchen-wood', x: 58, y: 58 },
      { product: 'p-chair-canvas', qty: 2, x: 86, y: 47 },
      { product: 'p-fabric-blanket', x: 82, y: 72 },
      { product: 'p-rug-beige', x: 38, y: 88 },
      { product: 'p-storage-shelf', x: 16, y: 80 }
    ],
    budget: {
      note: '텐트와 러그는 그대로, 가구와 조명을 가성비 제품으로 바꿔 비슷한 분위기를 만들었어요.',
      items: [
        { product: 'p-tent-tc-tipi' },
        { product: 'p-lantern-led' },
        { product: 'p-lantern-shade' },
        { product: 'p-table-roll' },
        { product: 'p-chair-wood-basic', qty: 2 },
        { product: 'p-rug-beige' },
        { product: 'p-storage-box' }
      ]
    }
  },
  {
    id: '002', date: '2026-09-05',
    hero: { title: '밝은 톤으로 채운\n우리만의 작은 거실.', sub: '크림 에어텐트에 톤을 세 단계로 나눠 화사하게 꾸몄어요.', mood: 'golden' },
    title: 'Cream Air Camping', subtitle: '크림 에어텐트로 만든 화사한 봄·가을 거실',
    style: 'natural', tent: 'tent-air-cream', people: '2~3인', season: '봄', image: '',
    summary: '밝은 에어텐트에 아이보리 체어와 법랑 식기를 맞춘, 사진이 가장 화사하게 나오는 크림 캠핑이에요.',
    story: [
      '크림 캠핑은 “하얗게”가 아니라 “톤을 나누는 것”이 핵심이에요. 텐트가 가장 밝고, 러그가 중간, 우드 소품이 가장 진한 톤이 되도록 맞췄어요.',
      '줄조명은 에어빔 라인을 따라 걸어서 텐트의 곡선이 밤에도 보이게 했어요.'
    ],
    tips: ['밝은 원단에는 원색 장비가 비쳐 보이니 캔버스 박스로 가리기', '전구색 조명 하나로 통일', '쿠션 커버만 바꿔도 체어 분위기가 달라져요'],
    items: [
      { product: 'p-tent-air-cream', x: 24, y: 52 },
      { product: 'p-lantern-string', x: 72, y: 28 },
      { product: 'p-lantern-led', x: 53, y: 40 },
      { product: 'p-table-low', x: 70, y: 66 },
      { product: 'p-kitchen-enamel', x: 58, y: 58 },
      { product: 'p-chair-cream', qty: 2, x: 86, y: 47 },
      { product: 'p-fabric-cushion', x: 82, y: 72 },
      { product: 'p-rug-beige', x: 38, y: 88 },
      { product: 'p-storage-box', x: 16, y: 80 }
    ]
  },
  {
    id: '003', date: '2026-08-29',
    title: 'Black Minimal Camping', subtitle: '필요한 것만 남긴 블랙 터널 텐트 세팅',
    style: 'black', tent: 'tent-tunnel-black', people: '2인', season: '겨울', image: '',
    summary: '블랙 텐트와 알루미늄 가구, 여섯 가지 장비만으로 완성한 미니멀 세팅이에요.',
    story: [
      '장비를 줄일수록 완성도가 올라가는 스타일이라, 이번엔 “이거 없으면 불편한가?”를 기준으로 하나씩 뺐어요.',
      '전부 블랙이면 사진에서 형태가 뭉개져서, 러그만 한 톤 밝은 차콜로 골랐어요.'
    ],
    tips: ['조명은 낮은 위치에 분산', '컬러는 블랙·실버·차콜 3가지 안에서', '수납은 일렬로 줄 세우기'],
    items: [
      { product: 'p-tent-tunnel-black', x: 24, y: 52 },
      { product: 'p-lantern-led', x: 53, y: 40 },
      { product: 'p-table-alu', x: 70, y: 66 },
      { product: 'p-chair-black', qty: 2, x: 86, y: 47 },
      { product: 'p-rug-black', x: 38, y: 88 },
      { product: 'p-storage-crate', x: 16, y: 80 }
    ]
  },
  {
    id: '004', date: '2026-08-22',
    title: 'Nordic Small Tent', subtitle: '2인 소형 돔텐트 앞에 만든 작은 거실',
    style: 'white', tent: 'tent-dome-ivory', people: '2인', season: '여름', image: '',
    summary: '작은 돔텐트도 낮은 가구와 러그 하나면 충분히 예쁜 거실이 생겨요. 입문 부부에게 추천하는 세팅.',
    story: [
      '작은 텐트는 안을 꾸미기보다 “텐트 앞”을 거실로 쓰는 게 훨씬 효과적이에요.',
      '가구 높이를 전부 무릎 아래로 맞췄더니 텐트와 비율이 맞아서 사진이 안정적으로 나왔어요.'
    ],
    tips: ['텐트 안은 잠자는 공간으로 비워두기', '로우 가구로 비율 맞추기', '법랑 식기로 완성도 올리기'],
    items: [
      { product: 'p-tent-dome-ivory', x: 24, y: 52 },
      { product: 'p-lantern-string', x: 72, y: 28 },
      { product: 'p-table-low', x: 70, y: 66 },
      { product: 'p-kitchen-enamel', x: 58, y: 57 },
      { product: 'p-fabric-tablecloth', x: 52, y: 68 },
      { product: 'p-chair-cream', qty: 2, x: 86, y: 47 },
      { product: 'p-rug-beige', x: 38, y: 88 }
    ]
  },
  {
    id: '005', date: '2026-08-15',
    hero: { title: '랜턴 하나로\n완성하는 밤.', sub: '오일 랜턴과 킬림 러그로 채운 빈티지 캠핑의 밤이에요.', mood: 'night' },
    title: 'Vintage Lantern Night', subtitle: '오일 랜턴과 킬림 러그로 채운 밤 캠핑',
    style: 'midcentury', tent: 'tent-tc-tipi', people: '2인', season: '가을', image: '',
    summary: '패턴은 러그 하나에만, 나머지는 무지로 받쳐서 과하지 않은 빈티지 무드를 만들었어요.',
    story: [
      '빈티지 캠핑은 아이템 하나하나보다 “조명 색온도”가 분위기의 절반이에요. 해가 지면 LED는 끄고 오일 랜턴만 켰어요.',
      '킬림 러그가 강한 만큼 블랭킷과 수납박스는 무지로 골라 균형을 맞췄어요.'
    ],
    tips: ['패턴은 한 가지 아이템에만', '무광·브라스 마감 고르기', '텐트 안 화기 사용 시 환기·안전거리 필수'],
    items: [
      { product: 'p-tent-tc-tipi', x: 24, y: 52 },
      { product: 'p-lantern-oil', x: 53, y: 40 },
      { product: 'p-table-roll', x: 70, y: 66 },
      { product: 'p-chair-canvas', qty: 2, x: 86, y: 47 },
      { product: 'p-fabric-blanket', x: 82, y: 72 },
      { product: 'p-rug-kilim', x: 38, y: 88 },
      { product: 'p-storage-box', x: 16, y: 80 }
    ]
  },
  {
    id: '006', date: '2026-08-08',
    title: 'Natural Forest Camping', subtitle: '숲과 어우러지는 내추럴 톤 가족 캠핑',
    style: 'natural', tent: 'tent-air-cream', people: '3~4인', season: '여름', image: '',
    summary: '밝은 우드와 카키 체어, 코튼 러그로 주변 숲과 경계 없이 어우러지게 만든 세팅이에요.',
    story: [
      '숲속 사이트라 주변 초록이 이미 충분해서, 장비에는 초록을 거의 쓰지 않고 우드와 오트밀 톤으로 받쳤어요.',
      '오픈 쉘프를 두니 아이들 물건도 정리한 느낌이 나서 좋았어요.'
    ],
    tips: ['그린은 채도 낮은 컬러로 한두 개만', '플라스틱 소품 최소화', '쉘프로 “정리된 느낌” 만들기'],
    items: [
      { product: 'p-tent-air-cream', x: 24, y: 52 },
      { product: 'p-lantern-led', x: 53, y: 40 },
      { product: 'p-lantern-shade', x: 72, y: 28 },
      { product: 'p-table-roll', x: 70, y: 66 },
      { product: 'p-kitchen-wood', x: 58, y: 58 },
      { product: 'p-chair-wood-basic', qty: 2, x: 86, y: 47 },
      { product: 'p-rug-beige', x: 38, y: 88 },
      { product: 'p-storage-shelf', x: 16, y: 80 }
    ]
  }
];

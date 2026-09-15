/* ============================================================
   PRODUCT DB — 제품 한 번 등록 → 모든 세팅/페이지에서 재사용
   ------------------------------------------------------------
   id        : 고유값 (영문, 바꾸지 않기)
   category  : tent | table | chair | lantern | rug | storage | kitchen | fabric
   price     : 숫자만 (원)
   url       : 제휴 링크 (쿠팡 파트너스 / 네이버 쇼핑 커넥트 등)
   styles    : 어울리는 스타일 id 목록
   swatch    : 사진이 없을 때 보여줄 대표 색
   image     : 'assets/images/products/xxx.jpg' (선택)
   pick      : true 면 PICK 페이지에 노출, pickNote 는 추천 이유
   ※ 아래는 전부 샘플 데이터입니다. 실제 제품으로 교체하세요.
   ============================================================ */
window.TENTRIOR = window.TENTRIOR || {};

TENTRIOR.products = [
  // ---------- TENT ----------
  { id: 'p-tent-air-cream', name: '크림 에어텐트 4인 거실형', brand: '샘플 브랜드', category: 'tent', color: '크림', material: '폴리코튼', price: 890000, url: '#', styles: ['natural', 'white'], swatch: '#EFE6D6' },
  { id: 'p-tent-tc-tipi', name: 'TC 원폴 티피텐트', brand: '샘플 브랜드', category: 'tent', color: '샌드', material: 'TC(폴리코튼)', price: 520000, url: '#', styles: ['midcentury', 'natural', 'military'], swatch: '#D9C7A5' },
  { id: 'p-tent-tunnel-black', name: '블랙 터널 거실형 텐트', brand: '샘플 브랜드', category: 'tent', color: '블랙', material: '폴리에스터', price: 760000, url: '#', styles: ['black'], swatch: '#3A3835' },
  { id: 'p-tent-dome-ivory', name: '아이보리 돔텐트 2인', brand: '샘플 브랜드', category: 'tent', color: '아이보리', material: '폴리에스터', price: 240000, url: '#', styles: ['white', 'natural'], swatch: '#F4F1EA' },

  // ---------- TABLE ----------
  { id: 'p-table-roll', name: '우드 롤테이블 L', brand: '샘플 브랜드', category: 'table', color: '월넛', material: '원목', price: 159000, url: '#', styles: ['midcentury', 'natural'], swatch: '#8A5E3C', pick: true, pickNote: '접으면 한 손에 들리는데, 펼치면 공간의 중심이 돼요. 우드 캠핑을 시작한다면 첫 번째로 추천하는 가구.' },
  { id: 'p-table-igt', name: '우드 IGT 프레임 테이블', brand: '샘플 브랜드', category: 'table', color: '오크', material: '원목 + 스틸', price: 289000, url: '#', styles: ['midcentury', 'natural'], swatch: '#B48A5E' },
  { id: 'p-table-alu', name: '블랙 알루미늄 폴딩 테이블', brand: '샘플 브랜드', category: 'table', color: '블랙', material: '알루미늄', price: 89000, url: '#', styles: ['black', 'military'], swatch: '#2F2E2C' },
  { id: 'p-table-low', name: '화이트 로우 테이블', brand: '샘플 브랜드', category: 'table', color: '화이트', material: '알루미늄', price: 69000, url: '#', styles: ['white', 'natural'], swatch: '#F2F0EA', pick: true, pickNote: '낮은 테이블 하나로 작은 텐트가 훨씬 넓어 보여요. 크림·노르딕 세팅의 숨은 공신.' },

  // ---------- CHAIR ----------
  { id: 'p-chair-canvas', name: '브라운 캔버스 우드 체어', brand: '샘플 브랜드', category: 'chair', color: '브라운', material: '캔버스 + 원목', price: 129000, url: '#', styles: ['midcentury', 'natural'], swatch: '#7B5A3E', pick: true, pickNote: '사진에 가장 많이 “이 의자 뭐예요?” 질문이 달리는 체어. 앉은 자세가 편해서 오래 머물게 돼요.' },
  { id: 'p-chair-cream', name: '아이보리 릴렉스 체어', brand: '샘플 브랜드', category: 'chair', color: '아이보리', material: '폴리에스터', price: 79000, url: '#', styles: ['natural', 'white'], swatch: '#E9E0CF' },
  { id: 'p-chair-black', name: '블랙 컴팩트 체어', brand: '샘플 브랜드', category: 'chair', color: '블랙', material: '알루미늄 + 폴리에스터', price: 59000, url: '#', styles: ['black'], swatch: '#262523' },
  { id: 'p-chair-khaki', name: '카키 로우 체어', brand: '샘플 브랜드', category: 'chair', color: '카키', material: '코듀라', price: 49000, url: '#', styles: ['military', 'natural'], swatch: '#5E5E3E' },
  { id: 'p-chair-wood-basic', name: '우드암 폴딩 체어', brand: '샘플 브랜드', category: 'chair', color: '내추럴', material: '원목 + 폴리에스터', price: 45000, url: '#', styles: ['midcentury', 'natural'], swatch: '#A8825A' },

  // ---------- LANTERN ----------
  { id: 'p-lantern-oil', name: '브라스 오일 랜턴', brand: '샘플 브랜드', category: 'lantern', color: '브라스', material: '황동', price: 98000, url: '#', styles: ['midcentury'], swatch: '#C49A45', pick: true, pickNote: '불을 켜는 순간 캠핑의 온도가 바뀌어요. 텐트 안에서는 반드시 환기와 안전거리를 지켜주세요.' },
  { id: 'p-lantern-led', name: '충전식 LED 랜턴 (전구색)', brand: '샘플 브랜드', category: 'lantern', color: '베이지', material: 'ABS', price: 45000, url: '#', styles: ['natural', 'midcentury', 'white', 'black', 'military'], swatch: '#E7D8BC' },
  { id: 'p-lantern-shade', name: '우드 랜턴 쉐이드', brand: '샘플 브랜드', category: 'lantern', color: '내추럴', material: '원목', price: 25000, url: '#', styles: ['midcentury', 'natural'], swatch: '#B48A5E', pick: true, pickNote: '2만원대로 LED 랜턴을 우드 조명처럼 바꿔주는 가성비 끝판왕.' },
  { id: 'p-lantern-string', name: '앵두 전구 줄조명 10m', brand: '샘플 브랜드', category: 'lantern', color: '웜화이트', material: 'PVC', price: 19000, url: '#', styles: ['natural', 'white', 'modern'], swatch: '#F3E3B5' },

  // ---------- RUG ----------
  { id: 'p-rug-beige', name: '베이지 코튼 러그 200×140', brand: '샘플 브랜드', category: 'rug', color: '베이지', material: '코튼', price: 69000, url: '#', styles: ['natural', 'white', 'midcentury'], swatch: '#E3D3B8', pick: true, pickNote: '어떤 스타일에도 실패가 없는 러그. 바닥 하나만 정리돼도 사진이 달라져요.' },
  { id: 'p-rug-kilim', name: '킬림 패턴 러그', brand: '샘플 브랜드', category: 'rug', color: '테라코타', material: '울 혼방', price: 89000, url: '#', styles: ['midcentury', 'modern'], swatch: '#A8553E' },
  { id: 'p-rug-black', name: '차콜 방수 러그', brand: '샘플 브랜드', category: 'rug', color: '차콜', material: 'PE', price: 49000, url: '#', styles: ['black', 'military'], swatch: '#5A5752' },

  // ---------- STORAGE ----------
  { id: 'p-storage-shelf', name: '우드 3단 쉘프', brand: '샘플 브랜드', category: 'storage', color: '오크', material: '원목', price: 119000, url: '#', styles: ['midcentury', 'natural'], swatch: '#B48A5E' },
  { id: 'p-storage-box', name: '캔버스 수납박스 50L', brand: '샘플 브랜드', category: 'storage', color: '아이보리', material: '캔버스', price: 39000, url: '#', styles: ['natural', 'midcentury', 'white'], swatch: '#E6DCCB' },
  { id: 'p-storage-crate', name: '블랙 폴딩 크레이트', brand: '샘플 브랜드', category: 'storage', color: '블랙', material: 'PP', price: 29000, url: '#', styles: ['black', 'military'], swatch: '#2F2E2C' },

  // ---------- KITCHEN ----------
  { id: 'p-kitchen-enamel', name: '화이트 법랑 식기 세트', brand: '샘플 브랜드', category: 'kitchen', color: '화이트', material: '법랑', price: 58000, url: '#', styles: ['white', 'natural'], swatch: '#F4F2EC' },
  { id: 'p-kitchen-wood', name: '우드 커팅보드 & 트레이', brand: '샘플 브랜드', category: 'kitchen', color: '월넛', material: '원목', price: 32000, url: '#', styles: ['midcentury', 'natural'], swatch: '#8A5E3C' },

  // ---------- FABRIC ----------
  { id: 'p-fabric-blanket', name: '체크 울 블랭킷', brand: '샘플 브랜드', category: 'fabric', color: '레드 체크', material: '울 혼방', price: 49000, url: '#', styles: ['midcentury', 'modern'], swatch: '#A2533A' },
  { id: 'p-fabric-tablecloth', name: '린넨 테이블보', brand: '샘플 브랜드', category: 'fabric', color: '오트밀', material: '린넨', price: 22000, url: '#', styles: ['natural', 'white'], swatch: '#E8DFCF' },
  { id: 'p-fabric-cushion', name: '크림 쿠션 커버 2P', brand: '샘플 브랜드', category: 'fabric', color: '크림', material: '코튼', price: 24000, url: '#', styles: ['natural', 'white'], swatch: '#F3ECDF' }
];

/* ============================================================
   텐들이 DB — 캠퍼들의 캠핑 집들이 (사용자 참여)
   ------------------------------------------------------------
   참여 폼·인스타 해시태그로 받은 사연 중에서, 사진 게시에 동의받은 것만 올려요.
   image    : 'assets/images/tendeuli/td-005.jpg' (비워두면 샘플 일러스트)
   style    : 가장 가까운 스타일 id (styles.js) — 비슷한 세팅 추천에 쓰여요
   items    : 사용한 아이템. product 에 제품 id를 넣으면 텐트리어 픽 제품과 연결돼요
   comment  : 텐트리어 부부의 한마디 (선택)
   ※ 아래는 샘플 데이터입니다. 최신 글이 맨 위에 오도록 추가하세요.
   ============================================================ */
window.TENTRIOR = window.TENTRIOR || {};

TENTRIOR.tendeuli = [
  {
    id: 'td-004', date: '2026-09-10', nickname: '숲멍부부 (예시)',
    title: '벨텐트 안을 거실처럼 꾸민 가을 집들이',
    tent: '폴리코튼 벨텐트 5m', style: 'midcentury', season: '가을', people: '2인', place: '경기 · 양평',
    image: '', mood: 'golden',
    intro: '원목 가구를 하나씩 모으다 보니 텐트가 거실이 됐어요. 조명은 전부 전구색으로 맞추고, 원색 장비는 박스 안에 숨겼어요.',
    point: '러그를 두 장 겹쳐 깔아서 바닥에서 올라오는 냉기를 막았어요.',
    items: [
      { name: '우드 롤테이블', product: 'p-table-roll' },
      { name: '브라스 오일 랜턴', product: 'p-lantern-oil' },
      { name: '체크 울 블랭킷', product: 'p-fabric-blanket' },
      { name: '직접 만든 원목 선반' }
    ],
    comment: '러그 두 장 겹치기는 가을·겨울에 꼭 따라 해볼 만한 팁이에요.'
  },
  {
    id: 'td-003', date: '2026-09-03', nickname: '초보캠퍼 J (예시)',
    title: '입문 3개월, 크림 톤으로 맞춘 첫 가족 세팅',
    tent: '에어텐트 4인', style: 'natural', season: '봄', people: '3인 가족', place: '강원 · 춘천',
    image: '', mood: 'day',
    intro: '처음엔 장비를 사는 대로 가져갔더니 색이 제각각이었어요. 텐트 색에 맞춰 체어와 러그만 바꿨는데 분위기가 확 달라졌어요.',
    point: '아이 장난감은 캔버스 바구니 하나에 모아서 입구 옆에 두었어요.',
    items: [
      { name: '아이보리 릴렉스 체어', product: 'p-chair-cream' },
      { name: '앵두 전구 줄조명', product: 'p-lantern-string' },
      { name: '베이지 코튼 러그', product: 'p-rug-beige' },
      { name: '아이용 캠핑 의자' }
    ],
    comment: '체어와 러그만 바꿔도 된다는 걸 보여주는 좋은 예예요.'
  },
  {
    id: 'td-002', date: '2026-08-27', nickname: '블랙앤캠프 (예시)',
    title: '짐은 줄이고 분위기는 살린 솔로 블랙 캠핑',
    tent: '터널형 텐트', style: 'black', season: '겨울', people: '솔로', place: '충북 · 제천',
    image: '', mood: 'night',
    intro: '혼자 다니다 보니 설치와 철수가 빨라야 했어요. 장비를 블랙과 실버로만 정리하니 적은 짐으로도 완성된 느낌이 나요.',
    point: '크레이트 두 개를 테이블 겸 수납으로 같이 써요.',
    items: [
      { name: '블랙 알루미늄 폴딩 테이블', product: 'p-table-alu' },
      { name: '블랙 컴팩트 체어', product: 'p-chair-black' },
      { name: '블랙 폴딩 크레이트', product: 'p-storage-crate' }
    ]
  },
  {
    id: 'td-001', date: '2026-08-20', nickname: '바다곁 (예시)',
    title: '바닷가 사이트에 어울리는 노르딕 화이트',
    tent: '돔텐트 2인', style: 'white', season: '여름', people: '2인', place: '충남 · 태안',
    image: '', mood: 'golden',
    intro: '바다 앞이라 색을 최대한 빼고 화이트와 밝은 우드로만 꾸몄어요. 해 질 무렵 사진이 제일 예뻐요.',
    point: '바람이 강한 곳이라 가벼운 소품은 법랑 식기처럼 무게 있는 걸로 골랐어요.',
    items: [
      { name: '화이트 로우 테이블', product: 'p-table-low' },
      { name: '화이트 법랑 식기 세트', product: 'p-kitchen-enamel' },
      { name: '린넨 테이블보', product: 'p-fabric-tablecloth' },
      { name: '라탄 바구니' }
    ],
    comment: '바람 많은 바닷가에서는 “무게 있는 소품”이 예쁨과 실용을 같이 챙겨줘요.'
  }
];

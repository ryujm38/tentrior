/* ============================================================
   사이트 기본 설정 — TENTRIOR 텐트리어
   - 운영 시작 전에 TODO 표시된 값만 바꿔주면 됩니다.
   ============================================================ */
window.TENTRIOR = window.TENTRIOR || {};

TENTRIOR.site = {
  name: 'TENTRIOR',
  nameKo: '텐트리어',
  slogan: '우리다운 캠핑을 만드는 법.',
  definition: '캠핑을 더 우리답게 만드는 스타일과 아이템을 소개합니다.',
  tagline: 'Camping style for our life', // 메인 사진 오른쪽 아래 세로 문구

  email: 'hello@tentrior.kr',              // TODO: 실제 문의 메일
  instagram: 'https://www.instagram.com/', // TODO: 인스타그램 주소
  blog: 'https://blog.naver.com/',         // TODO: 네이버 블로그 주소
  youtube: '',                             // TODO: 유튜브 주소 (없으면 비워두기)

  // 로고 이미지 (정사각형 원본 로고 파일). 비워두면 글자 로고로 표시돼요.
  logoImage: '',          // 예: 'assets/images/logo.png'

  // ---------- 텐들이 (캠퍼 참여) ----------
  tendeuliFormUrl: '',            // TODO: 참여 신청 폼 주소 (구글 폼, 네이버 폼 등)
  tendeuliHashtag: '#텐들이',      // 인스타그램 참여 해시태그

  // 메인 사진 슬라이드는 data/setups.js 에서 hero 가 있는 세팅으로 자동 구성돼요.
  homeShopTheLook: '002', // 메인 SHOP THE LOOK 섹션에 보여줄 세팅 번호

  // 메인 메뉴 4칸 / 배너 2칸 사진 (비워두면 샘플 일러스트)
  tileImages: { tentrior: '', tendeuli: '', camperjournal: '', pick: '' },   // 예: tentrior: 'assets/images/tiles/tentrior.jpg'
  bannerImages: { style: '', tendeuli: '' },

  newsletterUrl: '',      // TODO: 스티비 등 뉴스레터 구독 페이지 주소

  // 사진·제품이 샘플일 때 상단에 안내 띠를 보여줍니다. 실제 콘텐츠로 바꾸면 false 로.
  sampleNotice: false,

  // 제휴 링크 고지 문구 (추천·보증 표시). 각 제휴 프로그램의 필수 문구를 확인해 맞춰주세요.
  disclosure:
    '텐트리어의 일부 제품 링크는 제휴 링크(쿠팡 파트너스·네이버 쇼핑 커넥트 등)예요. 링크를 통해 구매하시면 텐트리어에 소정의 수수료가 지급될 수 있으며, 구매 가격은 동일해요.'
};

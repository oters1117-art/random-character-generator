/* 색 팔레트. w 는 랜덤에서 뽑힐 비중(기본 1). */
(function () {
  'use strict';

  // 헤어: 실제 염색 색상 기준 32색
  CG.addPalette('hair', [
    // 내추럴
    { id: 'black', name: '흑발', hex: '#2b2627', group: '내추럴', w: 3 },
    { id: 'blueblack', name: '블루블랙', hex: '#232836', group: '내추럴', w: 3 },
    { id: 'darkbrown', name: '다크브라운', hex: '#3e2f2a', group: '내추럴', w: 3 },
    { id: 'choco', name: '초코브라운', hex: '#54392e', group: '내추럴', w: 3 },
    { id: 'softbrown', name: '내추럴브라운', hex: '#5d4e48', group: '내추럴', w: 3, isDefault: true },
    { id: 'milkbrown', name: '밀크브라운', hex: '#9a7a62', group: '내추럴', w: 3 },
    // 브라운 염색
    { id: 'ashbrown', name: '애쉬브라운', hex: '#7a6a62', group: '브라운 염색', w: 2 },
    { id: 'khakibrown', name: '카키브라운', hex: '#6e6248', group: '브라운 염색', w: 2 },
    { id: 'orangebrown', name: '오렌지브라운', hex: '#a05a32', group: '브라운 염색', w: 2 },
    { id: 'redbrown', name: '레드브라운', hex: '#7c3a30', group: '브라운 염색', w: 2 },
    { id: 'pinkbrown', name: '핑크브라운', hex: '#a8736f', group: '브라운 염색', w: 2 },
    { id: 'burgundy', name: '버건디', hex: '#5e2030', group: '브라운 염색', w: 2 },
    // 블론드·탈색
    { id: 'honey', name: '허니블론드', hex: '#d9a956', group: '블론드·탈색', w: 1.5 },
    { id: 'beige', name: '베이지블론드', hex: '#dcc39a', group: '블론드·탈색', w: 1.5 },
    { id: 'ashblonde', name: '애쉬블론드', hex: '#c9bca6', group: '블론드·탈색', w: 1.5 },
    { id: 'platinum', name: '플래티넘', hex: '#ece3cf', group: '블론드·탈색', w: 1.5 },
    { id: 'silverash', name: '실버애쉬', hex: '#c3c6cc', group: '블론드·탈색', w: 1.5 },
    { id: 'ashgray', name: '애쉬그레이', hex: '#8e9299', group: '블론드·탈색', w: 1.5 },
    { id: 'white', name: '화이트', hex: '#f3f1ee', group: '블론드·탈색', w: 1.5 },
    // 레드·핑크
    { id: 'cherry', name: '체리레드', hex: '#b3202e', group: '레드·핑크' },
    { id: 'coral', name: '코랄오렌지', hex: '#ef7d4f', group: '레드·핑크' },
    { id: 'rosegold', name: '로즈골드', hex: '#e0a391', group: '레드·핑크' },
    { id: 'babypink', name: '베이비핑크', hex: '#f6b9c9', group: '레드·핑크' },
    { id: 'hotpink', name: '핫핑크', hex: '#e8457e', group: '레드·핑크' },
    // 퍼플·블루
    { id: 'lavender', name: '라벤더애쉬', hex: '#b3a6cf', group: '퍼플·블루' },
    { id: 'ashpurple', name: '애쉬퍼플', hex: '#7c6790', group: '퍼플·블루' },
    { id: 'violet', name: '바이올렛', hex: '#6a3fa0', group: '퍼플·블루' },
    { id: 'navy', name: '네이비', hex: '#26365e', group: '퍼플·블루' },
    { id: 'ashblue', name: '애쉬블루', hex: '#6f87a6', group: '퍼플·블루' },
    { id: 'skyblue', name: '스카이블루', hex: '#8fc4ea', group: '퍼플·블루' },
    // 그린
    { id: 'mint', name: '민트', hex: '#9adcc8', group: '그린' },
    { id: 'khakigreen', name: '카키그린', hex: '#5d6b47', group: '그린' }
  ]);

  CG.addPalette('eye', [
    { id: 'black', name: '검정', hex: '#2a2422', w: 2 },
    { id: 'darkbrown', name: '다크브라운', hex: '#4a3128', w: 2 },
    { id: 'brown', name: '브라운', hex: '#7e5647', w: 2, isDefault: true },
    { id: 'hazel', name: '헤이즐', hex: '#9a7a45' },
    { id: 'amber', name: '호박색', hex: '#c98a2b' },
    { id: 'gold', name: '금색', hex: '#d9b23c' },
    { id: 'red', name: '빨강', hex: '#b8323a' },
    { id: 'pink', name: '핑크', hex: '#d9668f' },
    { id: 'purple', name: '보라', hex: '#7a52b3' },
    { id: 'blue', name: '블루', hex: '#3d6fc4' },
    { id: 'sky', name: '하늘색', hex: '#5fa8dc' },
    { id: 'teal', name: '청록', hex: '#2f9c99' },
    { id: 'green', name: '녹색', hex: '#4c9a55' },
    { id: 'gray', name: '회색', hex: '#7d858f' }
  ]);


  CG.addPalette('acc', [
    { id: 'red', name: '빨강', hex: '#d8433b', isDefault: true },
    { id: 'pink', name: '핑크', hex: '#f29bb5' },
    { id: 'yellow', name: '노랑', hex: '#f2c94c' },
    { id: 'navy', name: '네이비', hex: '#2f3f6e' },
    { id: 'white', name: '흰색', hex: '#f7f3ee' },
    { id: 'black', name: '검정', hex: '#2b2627' }
  ]);

  // hex 가 null 이면 배경 없이 투명
  CG.addPalette('bg', [
    { id: 'greige', name: '그레이지', hex: '#ada19f', isDefault: true },
    { id: 'cream', name: '크림', hex: '#efe6d8' },
    { id: 'dustypink', name: '더스티핑크', hex: '#e3c4c0' },
    { id: 'sage', name: '세이지', hex: '#b9c7b5' },
    { id: 'dustyblue', name: '더스티블루', hex: '#b3c2d1' },
    { id: 'lavender', name: '라벤더', hex: '#c9c0db' },
    { id: 'charcoal', name: '차콜', hex: '#4a4648' },
    { id: 'none', name: '없음 (투명)', hex: null, w: 0 }
  ]);
})();

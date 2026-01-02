/* =========================
   채광 정보 탭 - 전문가 세팅 (mining-info.js)
========================= */

// 전문가 스킬 데이터
const miningExpertData = {
  cobi: {
    name: '코비타임',
    levels: [
      { lv: 1, desc: '아일랜드에서 채광 시 코비 등장 확률 +1%' },
      { lv: 2, desc: '아일랜드에서 채광 시 코비 등장 확률 +1.5%' },
      { lv: 3, desc: '아일랜드에서 채광 시 코비 등장 확률 +2%' },
      { lv: 4, desc: '아일랜드에서 채광 시 코비 등장 확률 +2.5%' },
      { lv: 5, desc: '아일랜드에서 채광 시 코비 등장 확률 +3%' },
      { lv: 6, desc: '아일랜드에서 채광 시 코비 등장 확률 +4%' },
      { lv: 7, desc: '아일랜드에서 채광 시 코비 등장 확률 +5%' }
    ]
  },
  ingot: {
    name: '주괴 좀 사주괴',
    levels: [
      { lv: 1, desc: '주괴 판매가 +5%' },
      { lv: 2, desc: '주괴 판매가 +7%' },
      { lv: 3, desc: '주괴 판매가 +10%' },
      { lv: 4, desc: '주괴 판매가 +20%' },
      { lv: 5, desc: '주괴 판매가 +30%' },
      { lv: 6, desc: '주괴 판매가 +50%' }
    ]
  },
  'gem-start': {
    name: '반짝임의 시작',
    levels: [
      { lv: 1, desc: '아일랜드 채광 시 3% 확률로 보석 1개 드롭' },
      { lv: 2, desc: '아일랜드 채광 시 7% 확률로 보석 1개 드롭' },
      { lv: 3, desc: '아일랜드 채광 시 10% 확률로 보석 2개 드롭' }
    ]
  },
  'gem-shine': {
    name: '반짝반짝 눈이 부셔',
    levels: [
      { lv: 1, desc: '보석 판매가 +5%' },
      { lv: 2, desc: '보석 판매가 +7%' },
      { lv: 3, desc: '보석 판매가 +10%' },
      { lv: 4, desc: '보석 판매가 +20%' },
      { lv: 5, desc: '보석 판매가 +30%' },
      { lv: 6, desc: '보석 판매가 +50%' }
    ]
  },
  lucky: {
    name: '럭키 히트',
    levels: [
      { lv: 1, desc: '아일랜드 채광 시 1% 확률로 광석 1개 추가 드롭' },
      { lv: 2, desc: '아일랜드 채광 시 2% 확률로 광석 1개 추가 드롭' },
      { lv: 3, desc: '아일랜드 채광 시 3% 확률로 광석 1개 추가 드롭' },
      { lv: 4, desc: '아일랜드 채광 시 4% 확률로 광석 1개 추가 드롭' },
      { lv: 5, desc: '아일랜드 채광 시 5% 확률로 광석 1개 추가 드롭' },
      { lv: 6, desc: '아일랜드 채광 시 6% 확률로 광석 1개 추가 드롭' },
      { lv: 7, desc: '아일랜드 채광 시 7% 확률로 광석 1개 추가 드롭' },
      { lv: 8, desc: '아일랜드 채광 시 8% 확률로 광석 2개 추가 드롭' },
      { lv: 9, desc: '아일랜드 채광 시 10% 확률로 광석 2개 추가 드롭' },
      { lv: 10, desc: '아일랜드 채광 시 15% 확률로 광석 3개 추가 드롭' }
    ]
  },
  'fire-pick': {
    name: '불붙은 곡괭이',
    levels: [
      { lv: 1, desc: '채광 시 1% 확률로 광석이 주괴 1개로 제련' },
      { lv: 2, desc: '채광 시 2% 확률로 광석이 주괴 1개로 제련' },
      { lv: 3, desc: '채광 시 3% 확률로 광석이 주괴 1개로 제련' },
      { lv: 4, desc: '채광 시 4% 확률로 광석이 주괴 1개로 제련' },
      { lv: 5, desc: '채광 시 5% 확률로 광석이 주괴 1개로 제련' },
      { lv: 6, desc: '채광 시 6% 확률로 광석이 주괴 1개로 제련' },
      { lv: 7, desc: '채광 시 7% 확률로 광석이 주괴 1개로 제련' },
      { lv: 8, desc: '채광 시 8% 확률로 광석이 주괴 1개로 제련' },
      { lv: 9, desc: '채광 시 9% 확률로 광석이 주괴 1개로 제련' },
      { lv: 10, desc: '채광 시 15% 확률로 광석이 주괴 1개로 제련' }
    ]
  }
};

// 전문가 설명 HTML 생성
function generateExpertDescHTML(skillId) {
  const skill = miningExpertData[skillId];
  if (!skill) return '';
  
  return skill.levels.map(level => 
    `<strong>LV ${level.lv}</strong> – ${level.desc}`
  ).join('<br>');
}

// 전문가 정보 토글 함수
function toggleExpertInfo(id) {
  const desc = document.getElementById('desc-' + id);
  if (desc) {
    if (desc.style.display === 'none') {
      // 내용이 비어있으면 생성
      if (!desc.innerHTML.trim()) {
        desc.innerHTML = generateExpertDescHTML(id);
      }
      desc.style.display = 'block';
    } else {
      desc.style.display = 'none';
    }
  }
}

// 초기화
document.addEventListener('DOMContentLoaded', function() {
  // 모든 설명 영역 초기화 (빈 상태로 유지, 클릭 시 로드)
  console.log('Mining info initialized');
});
/* =========================
   채광 정보 탭 - 조합법 (mining-recipes.js)
========================= */

// 채광물 가공 데이터
const miningProcessData = [
  { result: '강화 횃불', materials: '횃불 4개' },
  { result: '코룸 주괴', materials: '코룸 16개 + 강화 횃불 2개' },
  { result: '리프톤 주괴', materials: '리프톤 16개 + 강화 횃불 4개' },
  { result: '세렌트 주괴', materials: '세렌트 16개 + 강화 횃불 8개' }
];

// 강화 제작 데이터
const miningCraftData = [
  { result: '조약돌 뭉치', materials: '조약돌 64개' },
  { result: '심층암 조약돌 뭉치', materials: '심층암 조약돌 64개' },
  { result: '하급 라이프스톤', materials: '조약돌 뭉치 2개 + 구리 블록 8개 + 레드스톤 블록 3개 + 코룸 주괴 1개' },
  { result: '중급 라이프스톤', materials: '심층암 조약돌 뭉치 2개 + 청금석 블록 5개 + 철 블록 5개 + 다이아몬드 블록 3개 + 리프톤 주괴 2개' },
  { result: '상급 라이프스톤', materials: '구리 블록 30개 + 자수정 블록 20개 + 철 블록 7개 + 금 블록 7개 + 다이아몬드 블록 5개 + 세렌트 주괴 3개' },
  { result: '하급 소울스톤', materials: '코룸 주괴 1개 + 로즈샤드 1개 + 에릴코어 1개' },
  { result: '중급 소울스톤', materials: '리프톤 주괴 1개 + 에릴코어 2개 + 바인하트 1개 + 스카이엣지 1개' },
  { result: '상급 소울스톤', materials: '세렌트 주괴 1개 + 에릴코어 2개 + 바인하트 2개 + 스카이엣지 2개 + 솔라코드 1개' }
];

// 테이블 행 생성 함수
function createRecipeRow(item) {
  return `
    <tr>
      <td>${item.result}</td>
      <td>${item.materials}</td>
    </tr>
  `;
}

// 테이블 렌더링 함수
function renderMiningRecipes() {
  // 채광물 가공 테이블
  const processTbody = document.getElementById('mining-process-tbody');
  if (processTbody) {
    processTbody.innerHTML = miningProcessData.map(createRecipeRow).join('');
  }
  
  // 강화 제작 테이블
  const craftTbody = document.getElementById('mining-craft-tbody');
  if (craftTbody) {
    craftTbody.innerHTML = miningCraftData.map(createRecipeRow).join('');
  }
}

// 조합법 탭 전환 함수
function initMiningRecipeTabs() {
  const tabs = document.querySelectorAll('.recipe-tab[data-mining-tab]');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      // 모든 탭 비활성화
      tabs.forEach(t => t.classList.remove('active'));
      // 클릭한 탭 활성화
      this.classList.add('active');
      
      // 모든 콘텐츠 숨김
      document.querySelectorAll('#mining-process, #mining-craft').forEach(c => {
        c.classList.remove('active');
      });
      
      // 해당 콘텐츠 표시
      const targetId = this.getAttribute('data-mining-tab');
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });
}

// 초기화
document.addEventListener('DOMContentLoaded', function() {
  renderMiningRecipes();
  initMiningRecipeTabs();
  console.log('Mining recipes initialized');
});
// ================================
// 순수 효율 계산 탭 스크립트
// ================================

// ================================
// 🔧 기본 시세 설정 (3일마다 여기만 수정!)
// ================================
const DEFAULT_PRICES = {
  "토마토 스파게티": 531,
  "어니언 링": 534,
  "갈릭 케이크": 462,
  "삼겹살 토마토 찌개": 1845,
  "삼색 아이스크림": 1415,
  "마늘 양갈비 핫도그": 1148,
  "달콤 시리얼": 1413,
  "로스트 치킨 파이": 1343,
  "스윗 치킨 햄버거": 2259,
  "토마토 파인애플 피자": 2343,
  "양파 수프": 2936,
  "허브 삼겹살 찜": 1338,
  "토마토 라자냐": 3491,
  "딥 크림 빠네": 2163,
  "트리플 소갈비 꼬치": 1574
};
// ================================

// 요리 데이터 (이미지 포함)
const EFFICIENCY_RECIPES = [
  { name: "토마토 스파게티", bases: { tomato: 1, onion: 0, garlic: 0 }, minPrice: 243, maxPrice: 810, img: "food_tomato_spaghetti.png", ingredients: "토마토 베이스 1개 + 호박 묶음 1개" },
  { name: "어니언 링", bases: { tomato: 0, onion: 2, garlic: 0 }, minPrice: 388, maxPrice: 1296, img: "food_onion_ring.png", ingredients: "양파 베이스 2개 + 요리용 소금 1개" },
  { name: "갈릭 케이크", bases: { tomato: 0, onion: 0, garlic: 1 }, minPrice: 243, maxPrice: 810, img: "food_garlic_cake.png", ingredients: "마늘 베이스 1개 + 당근 묶음 1개" },
  { name: "삼겹살 토마토 찌개", bases: { tomato: 2, onion: 0, garlic: 0 }, minPrice: 576, maxPrice: 1921, img: "food_pork_tomato_stew.png", ingredients: "토마토 베이스 2개 + 비트 묶음 1개 + 요리용 소금 1개 + 익힌 돼지고기 1개 + 익힌 돼지 삼겹살 1개" },
  { name: "삼색 아이스크림", bases: { tomato: 0, onion: 2, garlic: 0 }, minPrice: 758, maxPrice: 2527, img: "food_icecream_triple.png", ingredients: "양파 베이스 2개 + 수박 묶음 1개 + 코코넛 1개 + 설탕 큐브 1개 + 요리용 우유 1개" },
  { name: "마늘 양갈비 핫도그", bases: { tomato: 0, onion: 0, garlic: 2 }, minPrice: 549, maxPrice: 1832, img: "food_garlic_lamb_hotdog.png", ingredients: "마늘 베이스 2개 + 감자 묶음 1개 + 오일 1개 + 익힌 양고기 1개 + 익힌 양 갈비살 1개" },
  { name: "달콤 시리얼", bases: { tomato: 2, onion: 0, garlic: 0 }, minPrice: 589, maxPrice: 1964, img: "food_sweet_cereal.png", ingredients: "토마토 베이스 2개 + 달콤한 열매 묶음 1개 + 파인애플 1개 + 밀가루 반죽 1개 + 오일 1개" },
  { name: "로스트 치킨 파이", bases: { tomato: 0, onion: 0, garlic: 2 }, minPrice: 675, maxPrice: 2253, img: "food_roast_chicken_pie.png", ingredients: "마늘 베이스 2개 + 당근 묶음 1개 + 버터 조각 1개 + 익힌 닭고기 1개 + 익힌 닭 다리살 1개" },
  { name: "스윗 치킨 햄버거", bases: { tomato: 1, onion: 1, garlic: 0 }, minPrice: 1083, maxPrice: 3612, img: "food_sweet_chicken_burger.png", ingredients: "토마토 베이스 1개 + 양파 베이스 1개 + 비트 묶음 1개 + 달콤한 열매 묶음 1개 + 익힌 닭 가슴살 1개 + 익힌 닭 다리살 1개" },
  { name: "토마토 파인애플 피자", bases: { tomato: 2, onion: 0, garlic: 2 }, minPrice: 878, maxPrice: 2930, img: "food_tomato_pineapple_pizza.png", ingredients: "토마토 베이스 2개 + 마늘 베이스 2개 + 파인애플 1개 + 치즈 조각 1개 + 스테이크 1개 + 익힌 소 등심 1개" },
  { name: "양파 수프", bases: { tomato: 0, onion: 2, garlic: 1 }, minPrice: 1000, maxPrice: 3335, img: "food_onion_soup.png", ingredients: "양파 베이스 2개 + 마늘 베이스 1개 + 감자 묶음 1개 + 코코넛 1개 + 버터 조각 1개 + 익힌 돼지 앞다리살 1개" },
  { name: "허브 삼겹살 찜", bases: { tomato: 0, onion: 1, garlic: 2 }, minPrice: 749, maxPrice: 2499, img: "food_herb_pork_steam.png", ingredients: "마늘 베이스 2개 + 양파 베이스 1개 + 호박 묶음 1개 + 요리용 소금 1개 + 오일 1개 + 익힌 돼지 삼겹살 1개" },
  { name: "토마토 라자냐", bases: { tomato: 1, onion: 1, garlic: 1 }, minPrice: 1253, maxPrice: 4177, img: "food_tomato_lasagna.png", ingredients: "토마토 베이스 1개 + 양파 베이스 1개 + 마늘 베이스 1개 + 당근 묶음 1개 + 호박 묶음 1개 + 밀가루 반죽 1개 + 익힌 양 다리살 1개" },
  { name: "딥 크림 빠네", bases: { tomato: 1, onion: 1, garlic: 1 }, minPrice: 1151, maxPrice: 3837, img: "food_cream_pane.png", ingredients: "토마토 베이스 1개 + 양파 베이스 1개 + 마늘 베이스 1개 + 수박 묶음 1개 + 감자 묶음 1개 + 치즈 조각 1개 + 요리용 우유 1개" },
  { name: "트리플 소갈비 꼬치", bases: { tomato: 1, onion: 1, garlic: 1 }, minPrice: 1291, maxPrice: 4307, img: "food_beef_rib_skewer.png", ingredients: "토마토 베이스 1개 + 양파 베이스 1개 + 마늘 베이스 1개 + 당근 묶음 1개 + 비트 묶음 1개 + 설탕 큐브 1개 + 익힌 소 갈비살 1개" }
];

// 씨앗 이미지
const SEED_IMAGES = {
  tomato: "food_img/tomato_seed.png",
  onion: "food_img/onion_seed.png",
  garlic: "food_img/garlic_seed.png"
};

// 씨앗 이름
const SEED_NAMES = {
  tomato: "토마토 씨앗",
  onion: "양파 씨앗",
  garlic: "마늘 씨앗"
};

// 괭이 레벨별 드롭 수
const HOE_DROPS = {
  0: 1, 1: 1, 2: 2, 3: 2, 4: 2, 5: 3,
  6: 3, 7: 3, 8: 4, 9: 4, 10: 4,
  11: 5, 12: 5, 13: 6, 14: 6, 15: 10
};

// 작물별 수확 배율
const CROP_DROP_RATE = { tomato: 2.0, onion: 1.5, garlic: 2.5 };

// 대왕 작물 기본 확률
const KING_CROP_BASE_CHANCE = 0.02;
const KING_CROP_MULTIPLIER = 7;

// 전문가 스킬 데이터
const EXPERT_HARVEST_DATA = [
  { rate: 0, count: 0, desc: "효과 없음" },
  { rate: 0.01, count: 1, desc: "수확 시 1% 확률로 +1개" },
  { rate: 0.02, count: 1, desc: "수확 시 2% 확률로 +1개" },
  { rate: 0.03, count: 1, desc: "수확 시 3% 확률로 +1개" },
  { rate: 0.04, count: 1, desc: "수확 시 4% 확률로 +1개" },
  { rate: 0.05, count: 2, desc: "수확 시 5% 확률로 +2개" },
  { rate: 0.07, count: 2, desc: "수확 시 7% 확률로 +2개" },
  { rate: 0.10, count: 3, desc: "수확 시 10% 확률로 +3개" }
];

const EXPERT_KING_DATA = [
  { bonus: 0, desc: "효과 없음" },
  { bonus: 0.005, desc: "+0.5%" },
  { bonus: 0.01, desc: "+1%" },
  { bonus: 0.03, desc: "+3%" },
  { bonus: 0.05, desc: "+5%" }
];

// 안전하게 데이터 가져오기
function getExpertKingData(level) {
  const maxLevel = EXPERT_KING_DATA.length - 1;
  const safeLevel = Math.min(Math.max(0, level), maxLevel);
  return EXPERT_KING_DATA[safeLevel];
}

const EXPERT_MONEY_DATA = [
  { bonus: 0, desc: "효과 없음" },
  { bonus: 0.01, desc: "+1%" },
  { bonus: 0.02, desc: "+2%" },
  { bonus: 0.03, desc: "+3%" },
  { bonus: 0.04, desc: "+4%" },
  { bonus: 0.05, desc: "+5%" },
  { bonus: 0.06, desc: "+6%" },
  { bonus: 0.10, desc: "+10%" },
  { bonus: 0.15, desc: "+15%" },
  { bonus: 0.30, desc: "+30%" },
  { bonus: 0.50, desc: "+50%" }
];

// 상태 변수
let efficiencyState = {
  prices: {},
  stamina: 3300,
  mode: 'efficiency',
  hoeLevel: 0,
  harvest: 0,
  king: 0,
  money: 0,
  results: [],
  selectedRecipe: '',
  initialized: false  // 초기화 여부 플래그
};

// 초기화
function initEfficiencyTab() {
  // 최초 1회만 가격 초기화
  if (!efficiencyState.initialized) {
    EFFICIENCY_RECIPES.forEach(r => {
      efficiencyState.prices[r.name] = DEFAULT_PRICES[r.name] || Math.floor((r.minPrice + r.maxPrice) / 2);
    });
    efficiencyState.initialized = true;
    bindEfficiencyEvents();
  }
  
  syncEfficiencyExpertSettings();
  renderPriceEditGrid();
  calculateEfficiency();
}

// 전문가 세팅 동기화
function syncEfficiencyExpertSettings() {
  efficiencyState.hoeLevel = parseInt(document.getElementById('hoe-level')?.value) || 0;
  efficiencyState.harvest = parseInt(document.getElementById('expert-harvest')?.value) || 0;
  efficiencyState.king = parseInt(document.getElementById('expert-king')?.value) || 0;
  efficiencyState.money = parseInt(document.getElementById('expert-money')?.value) || 0;
}

// 이벤트 바인딩
function bindEfficiencyEvents() {
  const priceEditBtn = document.getElementById('btn-price-edit');
  if (priceEditBtn) {
    priceEditBtn.addEventListener('click', () => {
      const panel = document.getElementById('price-edit-panel');
      panel.classList.toggle('show');
      priceEditBtn.classList.toggle('active');
    });
  }

  const resetPriceBtn = document.getElementById('btn-reset-price');
  if (resetPriceBtn) {
    resetPriceBtn.addEventListener('click', () => {
      EFFICIENCY_RECIPES.forEach(r => {
        // DEFAULT_PRICES로 초기화
        efficiencyState.prices[r.name] = DEFAULT_PRICES[r.name] || Math.floor((r.minPrice + r.maxPrice) / 2);
      });
      renderPriceEditGrid();
      calculateEfficiency();
    });
  }

  const staminaInput = document.getElementById('efficiency-stamina');
  if (staminaInput) {
    staminaInput.addEventListener('input', (e) => {
      efficiencyState.stamina = parseInt(e.target.value) || 0;
      calculateEfficiency();
    });
  }

  document.querySelectorAll('.btn-mode').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.btn-mode').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      efficiencyState.mode = e.target.dataset.mode;
      calculateEfficiency();
    });
  });

  const guideSelect = document.getElementById('guide-recipe-select');
  if (guideSelect) {
    guideSelect.addEventListener('change', (e) => {
      efficiencyState.selectedRecipe = e.target.value;
      renderFarmingGuide();
    });
  }

  const expertInputs = ['hoe-level', 'expert-harvest', 'expert-king', 'expert-money'];
  expertInputs.forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('input', () => {
        syncEfficiencyExpertSettings();
        renderExpertSubtitle();
        calculateEfficiency();
      });
    }
  });
}

function formatEfficiencyNum(n) {
  return Math.floor(n).toLocaleString();
}

function renderPriceEditGrid() {
  const grid = document.getElementById('price-edit-grid');
  if (!grid) return;

  grid.innerHTML = EFFICIENCY_RECIPES.map(r => {
    const percent = Math.floor((efficiencyState.prices[r.name] / r.maxPrice) * 100);
    const pClass = percent >= 80 ? 'high' : percent >= 50 ? 'mid' : 'low';
    return `
      <div class="price-edit-item">
        <div class="item-header">
          <img src="food_img/${r.img}" alt="${r.name}" class="recipe-img">
          <span class="recipe-name">${r.name}</span>
        </div>
        <input type="number" value="${efficiencyState.prices[r.name]}" 
               data-recipe="${r.name}" class="price-input">
        <div class="price-percent ${pClass}">${percent}%</div>
      </div>
    `;
  }).join('');

  // 가격 입력 이벤트 바인딩
  grid.querySelectorAll('.price-input').forEach(input => {
    input.addEventListener('input', (e) => {
      const recipeName = e.target.dataset.recipe;
      const newPrice = parseInt(e.target.value) || 0;
      efficiencyState.prices[recipeName] = newPrice;
      
      const recipe = EFFICIENCY_RECIPES.find(r => r.name === recipeName);
      if (recipe) {
        const percent = Math.floor((newPrice / recipe.maxPrice) * 100);
        const pClass = percent >= 80 ? 'high' : percent >= 50 ? 'mid' : 'low';
        const percentEl = e.target.parentElement.querySelector('.price-percent');
        percentEl.textContent = percent + '%';
        percentEl.className = 'price-percent ' + pClass;
      }
      
      calculateEfficiency();
    });
  });
}

function renderExpertSubtitle() {
  const subtitle = document.querySelector('.efficiency-subtitle');
  if (!subtitle) return;

  const hoeDrop = HOE_DROPS[efficiencyState.hoeLevel] || HOE_DROPS[0] || 1;
  const harvestData = EXPERT_HARVEST_DATA[efficiencyState.harvest] || EXPERT_HARVEST_DATA[0];
  const kingData = getExpertKingData(efficiencyState.king);
  const moneyData = EXPERT_MONEY_DATA[efficiencyState.money] || EXPERT_MONEY_DATA[0];

  subtitle.innerHTML = `
    <span class="expert-tag">괭이 ${efficiencyState.hoeLevel}강<span class="tooltip">드롭 ${hoeDrop}개</span></span>
    <span class="expert-tag">풍년 ${efficiencyState.harvest}<span class="tooltip">${harvestData.desc}</span></span>
    <span class="expert-tag">대왕 ${efficiencyState.king}<span class="tooltip">등장 확률 ${kingData.desc}</span></span>
    <span class="expert-tag">판매 ${efficiencyState.money}<span class="tooltip">판매가 ${moneyData.desc}</span></span>
  `;
}

function calculateEfficiency() {
  const hoeDrop = HOE_DROPS[efficiencyState.hoeLevel] || HOE_DROPS[0] || 1;
  const kingData = getExpertKingData(efficiencyState.king);
  const kingBonus = KING_CROP_BASE_CHANCE + kingData.bonus;
  const kingMult = 1 + (kingBonus * (KING_CROP_MULTIPLIER - 1));
  const harvestData = EXPERT_HARVEST_DATA[efficiencyState.harvest] || EXPERT_HARVEST_DATA[0];
  const harvestBonus = harvestData.rate * harvestData.count;
  const moneyData = EXPERT_MONEY_DATA[efficiencyState.money] || EXPERT_MONEY_DATA[0];
  const moneyBonus = moneyData.bonus;

  efficiencyState.results = EFFICIENCY_RECIPES.map(recipe => {
    let totalSeeds = 0;
    const seedsPerCrop = {};

    ['tomato', 'onion', 'garlic'].forEach(crop => {
      const baseNeeded = recipe.bases[crop] || 0;
      if (baseNeeded > 0) {
        const effectiveRate = CROP_DROP_RATE[crop] * kingMult + harvestBonus;
        const seeds = (baseNeeded * 8) / effectiveRate;
        seedsPerCrop[crop] = seeds;
        totalSeeds += seeds;
      }
    });

    const gatherCount = totalSeeds / hoeDrop;
    const staminaPerOne = gatherCount * 7;
    const sellPrice = efficiencyState.prices[recipe.name] * (1 + moneyBonus);
    const efficiency = staminaPerOne > 0 ? sellPrice / staminaPerOne : 0;
    const maxCount = staminaPerOne > 0 ? Math.floor(efficiencyState.stamina / staminaPerOne) : 0;
    const totalProfit = maxCount * sellPrice;
    const pricePercent = Math.floor((efficiencyState.prices[recipe.name] / recipe.maxPrice) * 100);

    return {
      ...recipe,
      currentPrice: efficiencyState.prices[recipe.name],
      pricePercent,
      sellPrice: Math.floor(sellPrice),
      staminaPerOne,
      efficiency,
      maxCount,
      totalProfit,
      totalSeeds: {
        tomato: Math.ceil((seedsPerCrop.tomato || 0) * maxCount),
        onion: Math.ceil((seedsPerCrop.onion || 0) * maxCount),
        garlic: Math.ceil((seedsPerCrop.garlic || 0) * maxCount)
      }
    };
  });

  if (efficiencyState.mode === 'efficiency') {
    efficiencyState.results.sort((a, b) => b.efficiency - a.efficiency);
  } else {
    efficiencyState.results.sort((a, b) => b.totalProfit - a.totalProfit);
  }

  if (!efficiencyState.selectedRecipe && efficiencyState.results.length > 0) {
    efficiencyState.selectedRecipe = efficiencyState.results[0].name;
  }

  render();
}

function render() {
  renderExpertSubtitle();
  renderTop3Cards();
  renderFarmingGuide();
  renderRankingTable();
}

function renderTop3Cards() {
  const container = document.getElementById('top3-cards');
  if (!container) return;

  const top3 = efficiencyState.results.slice(0, 3);
  const moneyPercent = Math.round((EXPERT_MONEY_DATA[efficiencyState.money]?.bonus || 0) * 100);

  container.innerHTML = top3.map((item, i) => `
    <div class="top3-card ${i === 0 ? 'rank-1' : ''}">
      <div class="rank-badge">${i + 1}</div>
      <div class="recipe-info">
        <img src="food_img/${item.img}" alt="${item.name}" class="recipe-img">
        <span class="recipe-name">${item.name}</span>
      </div>
      <div class="price-info">현재가 ${formatEfficiencyNum(item.currentPrice)}G (최고가의 ${item.pricePercent}%)</div>
      
      <div class="metric-box">
        <div class="metric-label">${efficiencyState.mode === 'efficiency' ? '스태미나 효율' : '예상 총수익'}</div>
        <div class="metric-value">
          ${efficiencyState.mode === 'efficiency' 
            ? item.efficiency.toFixed(1) + ' G'
            : formatEfficiencyNum(item.totalProfit) + ' G'
          }
        </div>
        <div class="metric-unit">${efficiencyState.mode === 'efficiency' ? '/스태미나' : `(${formatEfficiencyNum(item.maxCount)}개 제작)`}</div>
      </div>
      
      <div class="detail-list">
        <div class="detail-row">
          <span>제작 가능</span>
          <span class="detail-value">${formatEfficiencyNum(item.maxCount)}개</span>
        </div>
        <div class="detail-row">
          <span>개당 스태미나</span>
          <span class="detail-value">약 ${item.staminaPerOne.toFixed(1)}</span>
        </div>
        <div class="detail-row">
          <span>판매가(+${moneyPercent}%)</span>
          <span class="detail-value">${formatEfficiencyNum(item.sellPrice)}G</span>
        </div>
      </div>
    </div>
  `).join('');
}

function renderFarmingGuide() {
  const item = efficiencyState.results.find(r => r.name === efficiencyState.selectedRecipe) || efficiencyState.results[0];
  if (!item) return;

  const select = document.getElementById('guide-recipe-select');
  if (select) select.value = item.name;

  const priceInfo = document.getElementById('guide-price-info');
  if (priceInfo) {
    priceInfo.textContent = `현재가 ${formatEfficiencyNum(item.currentPrice)}G (최고가의 ${item.pricePercent}%)`;
  }

  const guideStamina = document.getElementById('guide-stamina');
  const guideCount = document.getElementById('guide-count');
  const guideProfit = document.getElementById('guide-profit');
  const guideEfficiency = document.getElementById('guide-efficiency');

  if (guideStamina) guideStamina.textContent = formatEfficiencyNum(efficiencyState.stamina);
  if (guideCount) guideCount.textContent = formatEfficiencyNum(item.maxCount) + '개';
  if (guideProfit) guideProfit.textContent = formatEfficiencyNum(item.totalProfit) + 'G';
  if (guideEfficiency) guideEfficiency.textContent = item.efficiency.toFixed(1);

  const seedsList = document.getElementById('seeds-list');
  if (!seedsList) return;

  const hoeDrop = HOE_DROPS[efficiencyState.hoeLevel] || 1;

  let seedsHtml = '';
  ['tomato', 'onion', 'garlic'].forEach(crop => {
    if (item.totalSeeds[crop] > 0) {
      // 씨앗 개수 → 채집 횟수 → 스태미나 계산
      const gatherCount = Math.ceil(item.totalSeeds[crop] / hoeDrop);
      const staminaNeeded = gatherCount * 7;
      
      seedsHtml += `
        <div class="seed-item">
          <img src="${SEED_IMAGES[crop]}" alt="${SEED_NAMES[crop]}" class="seed-img">
          <div class="seed-info">
            <div class="seed-count">약 ${formatEfficiencyNum(item.totalSeeds[crop])}개</div>
            <div class="seed-name">${SEED_NAMES[crop]}</div>
            <div class="seed-stamina">${formatEfficiencyNum(staminaNeeded)} 스태미나</div>
          </div>
        </div>
      `;
    }
  });

  if (!seedsHtml) {
    seedsHtml = '<span style="color:#999; font-size:13px;">필요한 씨앗이 없습니다</span>';
  }

  seedsList.innerHTML = seedsHtml;
}

function renderRankingTable() {
  const title = document.getElementById('ranking-table-title');
  if (title) {
    title.textContent = `📊 전체 요리 ${efficiencyState.mode === 'efficiency' ? '효율' : '수익'} 순위`;
  }

  const tbody = document.getElementById('ranking-tbody');
  if (!tbody) return;

  tbody.innerHTML = efficiencyState.results.map((item, i) => {
    const pClass = item.pricePercent >= 80 ? 'high' : item.pricePercent >= 50 ? 'mid' : 'low';
    return `
      <tr class="${i < 3 ? 'top3-row' : ''} recipe-row" data-recipe="${item.name}" onclick="toggleRecipeDetail(this)">
        <td><span class="rank-num ${i < 3 ? 'top' : ''}">${i + 1}</span></td>
        <td>
          <div class="table-recipe">
            <img src="food_img/${item.img}" alt="${item.name}" class="table-recipe-img">
            <span class="table-recipe-name">${item.name}</span>
          </div>
        </td>
        <td class="text-right">${formatEfficiencyNum(item.currentPrice)}G</td>
        <td class="text-right"><span class="percent-badge ${pClass}">${item.pricePercent}%</span></td>
        <td class="text-right efficiency-val">${item.efficiency.toFixed(1)}</td>
        <td class="text-right">약 ${formatEfficiencyNum(item.maxCount)}개</td>
        <td class="text-right profit-val">${formatEfficiencyNum(item.totalProfit)}G</td>
      </tr>
      <tr class="recipe-detail-row" data-detail="${item.name}" style="display:none;">
        <td colspan="7">
          <div class="recipe-detail-content">
            <span class="recipe-detail-label">📖 조합법</span>
            <span class="recipe-detail-ingredients">${item.ingredients}</span>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// 조합법 토글 함수
function toggleRecipeDetail(row) {
  const recipeName = row.dataset.recipe;
  const detailRow = document.querySelector(`tr[data-detail="${recipeName}"]`);
  
  if (detailRow) {
    // 다른 열린 조합법 닫기
    document.querySelectorAll('.recipe-detail-row').forEach(r => {
      if (r !== detailRow) {
        r.style.display = 'none';
        r.previousElementSibling?.classList.remove('expanded');
      }
    });
    
    // 현재 조합법 토글
    if (detailRow.style.display === 'none') {
      detailRow.style.display = 'table-row';
      row.classList.add('expanded');
    } else {
      detailRow.style.display = 'none';
      row.classList.remove('expanded');
    }
  }
}

// 탭 활성화 시 초기화
document.addEventListener('DOMContentLoaded', () => {
  const efficiencyTabLink = document.querySelector('[data-target="tab-efficiency"]');
  if (efficiencyTabLink) {
    efficiencyTabLink.addEventListener('click', () => {
      setTimeout(initEfficiencyTab, 50);
    });
  }
});
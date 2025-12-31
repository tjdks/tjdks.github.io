// ================================
// 재배 탭 스크립트
// ================================

// 이미지 경로
const FARM_IMAGES = {
  tomato: { seed: 'food_img/tomato.png', base: 'food_img/tomato_base.png' },
  onion: { seed: 'food_img/onion.png', base: 'food_img/onion_base.png' },
  garlic: { seed: 'food_img/garlic.png', base: 'food_img/garlic_base.png' }
};

// 작물 데이터
const FARM_CROP_DATA = {
  tomato: { name: '토마토', color: '#ef4444' },
  onion: { name: '양파', color: '#a855f7' },
  garlic: { name: '마늘', color: '#22c55e' }
};

// 작물별 기대 드롭률
const FARM_CROP_DROP_RATE = { tomato: 2.0, onion: 1.5, garlic: 2.5 };

// 대왕 작물
const FARM_KING_BASE_CHANCE = 0.02;
const FARM_KING_MULTIPLIER = 7;

// 전문가 스킬 데이터
const FARM_EXPERT_HARVEST = {
  0: { rate: 0, count: 0 },
  1: { rate: 0.01, count: 1 },
  2: { rate: 0.02, count: 1 },
  3: { rate: 0.03, count: 1 },
  4: { rate: 0.04, count: 1 },
  5: { rate: 0.05, count: 2 },
  6: { rate: 0.07, count: 2 },
  7: { rate: 0.10, count: 3 }
};

const FARM_EXPERT_KING = {
  0: { bonus: 0 },
  1: { bonus: 0.005 },
  2: { bonus: 0.01 },
  3: { bonus: 0.03 },
  4: { bonus: 0.05 }
};

const FARM_EXPERT_SEED_BONUS = {
  0: { rate: 0 },
  1: { rate: 0.01 },
  2: { rate: 0.02 },
  3: { rate: 0.03 },
  4: { rate: 0.04 },
  5: { rate: 0.05 },
  6: { rate: 0.06 },
  7: { rate: 0.07 },
  8: { rate: 0.10 },
  9: { rate: 0.20 },
  10: { rate: 0.30 }
};

// 상태
let farmState = {
  seedInputs: { tomato: 0, onion: 0, garlic: 0 },
  existingBase: { tomato: 0, onion: 0, garlic: 0 },
  expert: { harvest: 0, king: 0, seedBonus: 0 }
};

// 초기화
function initFarmTab() {
  syncFarmExpertSettings();
  renderFarmExpertStatus();
  bindFarmEvents();
  calculateFarmResult();
}

// 정보탭 전문가 세팅 동기화
function syncFarmExpertSettings() {
  farmState.expert.harvest = parseInt(document.getElementById('expert-harvest')?.value) || 0;
  farmState.expert.king = parseInt(document.getElementById('expert-king')?.value) || 0;
  farmState.expert.seedBonus = parseInt(document.getElementById('expert-seed-bonus')?.value) || 0;
}

// 전문가 세팅 표시
function renderFarmExpertStatus() {
  const container = document.getElementById('farm-expert-status');
  if (!container) return;

  const harvestLevel = Math.min(farmState.expert.harvest, 7);
  const kingLevel = Math.min(farmState.expert.king, 4);
  const seedBonusLevel = Math.min(farmState.expert.seedBonus, 10);

  const harvestData = FARM_EXPERT_HARVEST[harvestLevel] || FARM_EXPERT_HARVEST[0];
  const kingData = FARM_EXPERT_KING[kingLevel] || FARM_EXPERT_KING[0];
  const seedBonusData = FARM_EXPERT_SEED_BONUS[seedBonusLevel] || FARM_EXPERT_SEED_BONUS[0];

  // 설명 텍스트
  const harvestDesc = harvestLevel === 0 ? '효과 없음' : `${Math.round(harvestData.rate * 100)}% 확률 +${harvestData.count}개`;
  const kingDesc = kingLevel === 0 ? '효과 없음' : `대왕 확률 +${kingData.bonus * 100}%`;
  const seedBonusDesc = seedBonusLevel === 0 ? '효과 없음' : `${Math.round(seedBonusData.rate * 100)}% 확률로 씨앗 드롭`;

  container.innerHTML = `
    <span class="farm-expert-tag harvest">풍년 ${harvestLevel}<span class="tooltip">${harvestDesc}</span></span>
    <span class="farm-expert-tag king">대왕 ${kingLevel}<span class="tooltip">${kingDesc}</span></span>
    <span class="farm-expert-tag seed">씨앗덤 ${seedBonusLevel}<span class="tooltip">${seedBonusDesc}</span></span>
  `;
}

// 이벤트 바인딩
function bindFarmEvents() {
  // 씨앗 입력
  ['tomato', 'onion', 'garlic'].forEach(crop => {
    const seedInput = document.getElementById(`farm-seed-${crop}`);
    if (seedInput) {
      seedInput.addEventListener('input', (e) => {
        farmState.seedInputs[crop] = parseInt(e.target.value) || 0;
        calculateFarmResult();
      });
    }

    const baseInput = document.getElementById(`farm-base-${crop}`);
    if (baseInput) {
      baseInput.addEventListener('input', (e) => {
        farmState.existingBase[crop] = parseInt(e.target.value) || 0;
        calculateFarmResult();
      });
    }
  });

  // 초기화 버튼
  document.getElementById('farm-reset-btn')?.addEventListener('click', resetFarmInputs);

  // 정보탭 전문가 세팅 변경 감지
  ['expert-harvest', 'expert-king', 'expert-seed-bonus'].forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('input', () => {
        syncFarmExpertSettings();
        renderFarmExpertStatus();
        calculateFarmResult();
      });
    }
  });
}

// 입력 초기화
function resetFarmInputs() {
  ['tomato', 'onion', 'garlic'].forEach(crop => {
    farmState.seedInputs[crop] = 0;
    farmState.existingBase[crop] = 0;
    
    const seedInput = document.getElementById(`farm-seed-${crop}`);
    const baseInput = document.getElementById(`farm-base-${crop}`);
    if (seedInput) seedInput.value = '';
    if (baseInput) baseInput.value = '';
  });
  calculateFarmResult();
}

// 수확량 계산
function calculateFarmResult() {
  const results = {};
  let hasAnyInput = false;

  ['tomato', 'onion', 'garlic'].forEach(crop => {
    const seeds = farmState.seedInputs[crop] || 0;
    const existingBaseCount = farmState.existingBase[crop] || 0;

    if (seeds > 0 || existingBaseCount > 0) hasAnyInput = true;

    if (seeds <= 0 && existingBaseCount <= 0) {
      results[crop] = null;
      return;
    }

    const baseDropRate = FARM_CROP_DROP_RATE[crop];
    let baseCrops = seeds * baseDropRate;

    // 대왕 작물 보너스
    const kingLevel = Math.min(farmState.expert.king, 4);
    const kingChance = FARM_KING_BASE_CHANCE + (FARM_EXPERT_KING[kingLevel]?.bonus || 0);
    baseCrops += seeds * kingChance * (FARM_KING_MULTIPLIER - 1) * baseDropRate;

    // 풍년 보너스
    const harvestLevel = Math.min(farmState.expert.harvest, 7);
    const harvestData = FARM_EXPERT_HARVEST[harvestLevel] || FARM_EXPERT_HARVEST[0];
    const harvestBonus = seeds * harvestData.rate * harvestData.count;
    const totalCrops = baseCrops + harvestBonus;

    // 씨앗 보너스
    const seedBonusLevel = Math.min(farmState.expert.seedBonus, 10);
    const seedBonusRate = FARM_EXPERT_SEED_BONUS[seedBonusLevel]?.rate || 0;
    const bonusSeeds = seeds * seedBonusRate;

    // 베이스 계산
    const newBase = totalCrops / 8;

    results[crop] = {
      seeds,
      crops: Math.floor(baseCrops),
      bonusCrops: Math.floor(harvestBonus),
      bonusSeeds: Math.floor(bonusSeeds),
      newBase: Math.floor(newBase),
      existingBase: existingBaseCount,
      totalBase: Math.floor(newBase + existingBaseCount)
    };
  });

  renderFarmResult(results, hasAnyInput);
}

// 결과 렌더링
function renderFarmResult(results, hasAnyInput) {
  const container = document.getElementById('farm-result-container');
  const summaryContainer = document.getElementById('farm-summary');

  if (!container) return;

  if (!hasAnyInput) {
    container.innerHTML = `
      <div class="farm-empty-state">
        <div class="empty-icon">🌾</div>
        <div class="empty-text">씨앗을 입력하면 예상 수확량이 표시됩니다</div>
      </div>
    `;
    if (summaryContainer) summaryContainer.style.display = 'none';
    return;
  }

  let html = '';

  ['tomato', 'onion', 'garlic'].forEach(crop => {
    const data = results[crop];
    const cropInfo = FARM_CROP_DATA[crop];
    const images = FARM_IMAGES[crop];

    if (!data) {
      html += `
        <div class="farm-result-card" style="--crop-color: ${cropInfo.color}">
          <div class="farm-result-header">
            <img src="${images.seed}" alt="${cropInfo.name}" class="crop-img">
            <span class="farm-crop-name">${cropInfo.name}</span>
          </div>
          <div style="text-align:center; padding: 20px 0; color: #ccc; font-size: 12px;">
            입력 없음
          </div>
        </div>
      `;
      return;
    }

    html += `
      <div class="farm-result-card" style="--crop-color: ${cropInfo.color}">
        <div class="farm-result-header">
          <img src="${images.seed}" alt="${cropInfo.name}" class="crop-img">
          <span class="farm-crop-name">${cropInfo.name}</span>
          ${data.seeds > 0 ? `<span class="farm-seed-count">씨앗 ${formatFarmNum(data.seeds)}개</span>` : ''}
        </div>
        
        ${data.seeds > 0 ? `
        <div class="farm-result-row">
          <span class="farm-result-label">농작물</span>
          <span class="farm-result-value">
            약 ${formatFarmNum(data.crops + data.bonusCrops)}개
            ${data.bonusCrops > 0 ? `<span class="farm-bonus">(풍년 +${formatFarmNum(data.bonusCrops)})</span>` : ''}
          </span>
        </div>
        <div class="farm-result-row">
          <span class="farm-result-label">보너스 씨앗</span>
          <span class="farm-result-value bonus-seed">+약 ${formatFarmNum(data.bonusSeeds)}개</span>
        </div>
        ` : ''}
        
        <div class="farm-result-row total">
          <span class="farm-result-label">총 베이스</span>
          <span class="farm-result-value primary">
            약 ${formatFarmNum(data.totalBase)}개
            ${data.existingBase > 0 && data.newBase > 0 ? 
              `<span class="farm-detail">(+${formatFarmNum(data.newBase)} 신규)</span>` : ''}
          </span>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;

  // 요약 바
  if (summaryContainer) {
    summaryContainer.style.display = 'flex';
    ['tomato', 'onion', 'garlic'].forEach(crop => {
      const el = document.getElementById(`farm-summary-${crop}`);
      if (el) el.textContent = formatFarmNum(results[crop]?.totalBase || 0);
    });
  }
}

function formatFarmNum(n) {
  return Math.floor(n).toLocaleString();
}

// 탭 전환 시 초기화
document.addEventListener('DOMContentLoaded', () => {
  const farmTabLink = document.querySelector('[data-target="tab-farm"]');
  if (farmTabLink) {
    farmTabLink.addEventListener('click', () => {
      setTimeout(initFarmTab, 50);
    });
  }
});
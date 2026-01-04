// 재배 스태미나 계산

const STAMINA_CONFIG = {
  perGather: 7,
  hoeLevel: 1,
  expertGift: 0,
  expertFire: 0,
};

// 괭이 레벨별 드롭 수
const HOE_STATS = {
  0: 1, 1: 1, 2: 2, 3: 2, 4: 2, 5: 3,
  6: 3, 7: 3, 8: 4, 9: 4, 10: 4,
  11: 5, 12: 5, 13: 6, 14: 6, 15: 10
};

// 전문가 스킬: 자연이 주는 선물 (씨앗 추가 드롭)
// { rate: 확률, count: 드롭 개수 }
const EXPERT_GIFT = {
  0: { rate: 0, count: 0 },
  1: { rate: 0.01, count: 1 },
  2: { rate: 0.02, count: 1 },
  3: { rate: 0.03, count: 1 },
  4: { rate: 0.04, count: 1 },
  5: { rate: 0.05, count: 2 },
  6: { rate: 0.06, count: 2 },
  7: { rate: 0.07, count: 3 },
  8: { rate: 0.08, count: 4 },
  9: { rate: 0.09, count: 5 },
  10: { rate: 0.10, count: 8 }
};

// 전문가 스킬: 불붙은 괭이 (베이스 추가 드롭)
// { rate: 확률, count: 드롭 개수 }
const EXPERT_FIRE = {
  0: { rate: 0, count: 0 },
  1: { rate: 0.01, count: 1 },
  2: { rate: 0.02, count: 1 },
  3: { rate: 0.03, count: 2 },
  4: { rate: 0.04, count: 2 },
  5: { rate: 0.05, count: 2 },
  6: { rate: 0.06, count: 3 },
  7: { rate: 0.07, count: 3 },
  8: { rate: 0.08, count: 5 },
  9: { rate: 0.09, count: 5 },
  10: { rate: 0.15, count: 7 }
};

// 작물 정보
const CROP_DATA = {
  tomato: { name: '토마토', img: 'food_img/tomato_seed.png' },
  onion: { name: '양파', img: 'food_img/onion_seed.png' },
  garlic: { name: '마늘', img: 'food_img/garlic_seed.png' }
};

let inputCount = 1;

function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function addStaminaInput() {
  inputCount++;
  const container = document.getElementById('stamina-inputs-container');
  
  const row = document.createElement('div');
  row.className = 'stamina-input-row';
  row.id = `input-row-${inputCount}`;
  row.innerHTML = `
    <div class="stamina-input-group">
      <label class="stamina-label">
        스태미나
        <input type="number" id="stamina-input-${inputCount}" class="stamina-input" placeholder="3300" min="0" step="7">
      </label>
      <label class="stamina-label">
        작물
        <select id="crop-select-${inputCount}" class="stamina-select">
          <option value="tomato">토마토</option>
          <option value="onion">양파</option>
          <option value="garlic">마늘</option>
        </select>
      </label>
    </div>
    <button class="btn-remove" onclick="removeStaminaInput(${inputCount})">×</button>
  `;
  container.appendChild(row);
  document.getElementById(`stamina-input-${inputCount}`).focus();
}

function removeStaminaInput(id) {
  const row = document.getElementById(`input-row-${id}`);
  if (row) row.remove();
}

function calculateStamina() {
  syncExpertSettings();
  
  const results = [];
  let grandTotal = 0;
  
  for (let i = 1; i <= inputCount; i++) {
    const inputElem = document.getElementById(`stamina-input-${i}`);
    const selectElem = document.getElementById(`crop-select-${i}`);
    
    if (!inputElem || !selectElem) continue;
    
    const stamina = parseInt(inputElem.value);
    const cropType = selectElem.value;
    
    if (!stamina || stamina <= 0) continue;
    
    const gatherCount = Math.floor(stamina / STAMINA_CONFIG.perGather);
    const dropsPerGather = HOE_STATS[STAMINA_CONFIG.hoeLevel] || 1;
    
    // 기본 씨앗 드롭
    let totalSeeds = gatherCount * dropsPerGather;
    
    // 자연이 주는 선물 보너스 (씨앗 추가)
    const giftData = EXPERT_GIFT[STAMINA_CONFIG.expertGift] || { rate: 0, count: 0 };
    const giftProcs = Math.floor(gatherCount * giftData.rate);
    const giftSeeds = giftProcs * giftData.count;
    totalSeeds += giftSeeds;
    
    // 불붙은 괭이 보너스 (베이스 추가)
    const fireData = EXPERT_FIRE[STAMINA_CONFIG.expertFire] || { rate: 0, count: 0 };
    const fireProcs = Math.floor(gatherCount * fireData.rate);
    const totalBase = fireProcs * fireData.count;
    
    grandTotal += totalSeeds + totalBase;
    
    results.push({
      cropType,
      cropName: CROP_DATA[cropType].name,
      cropImg: CROP_DATA[cropType].img,
      gatherCount,
      totalSeeds,
      giftSeeds,
      totalBase,
      giftRate: Math.round(giftData.rate * 100),
      giftCount: giftData.count,
      fireRate: Math.round(fireData.rate * 100),
      fireCount: fireData.count
    });
  }
  
  if (results.length === 0) {
    alert('스태미나를 입력해주세요.');
    return;
  }
  
  displayResults(results, grandTotal);
}

function displayResults(results, grandTotal) {
  const resultCard = document.getElementById('stamina-result-card');
  const resultBody = document.getElementById('result-body');
  
  resultCard.style.display = 'block';
  
  // 헤더에 총합 표시
  const titleElem = resultCard.querySelector('.result-section-title');
  titleElem.innerHTML = `<span>예상 획득량</span><span>총 ${formatNumber(grandTotal)}개</span>`;
  
  // 결과 그리드 생성
  let gridHtml = '<div class="result-grid">';
  
  results.forEach((r) => {
    // 합계 계산
    const total = r.totalSeeds + r.totalBase;
    
    gridHtml += `
      <div class="crop-result-section">
        <div class="crop-result-title">
          <img src="${r.cropImg}" alt="${r.cropName}">
          <span>${r.cropName}</span>
        </div>
        <div class="crop-result-row">
          <span class="result-label">씨앗</span>
          <span class="result-value">${formatNumber(r.totalSeeds - r.giftSeeds)}${r.giftSeeds > 0 ? `<span class="result-detail">+${r.giftSeeds}</span>` : ''}</span>
        </div>
        ${r.totalBase > 0 ? `
        <div class="crop-result-row">
          <span class="result-label">베이스</span>
          <span class="result-value primary">${formatNumber(r.totalBase)}<span class="result-detail">+${r.fireRate}%</span></span>
        </div>
        ` : ''}
        <div class="crop-result-row total">
          <span class="result-label">합계</span>
          <span class="result-value primary">${formatNumber(total)}</span>
        </div>
      </div>
    `;
  });
  
  gridHtml += '</div>';
  
  // 보너스 요약
  const r = results[0];
  
  let bonusHtml = '';
  if (r.giftRate > 0 || r.fireRate > 0) {
    bonusHtml = `
      <div class="bonus-summary">
        <div class="bonus-summary-title">적용 보너스</div>
        ${r.giftRate > 0 ? `씨앗 추가 0% → <strong>${r.giftRate}%</strong> 확률 ${r.giftCount}개 (자연의 선물 +${r.giftRate}%)` : ''}
        ${r.giftRate > 0 && r.fireRate > 0 ? ' · ' : ''}
        ${r.fireRate > 0 ? `베이스 추가 0% → <strong>${r.fireRate}%</strong> 확률 ${r.fireCount}개 (불붙은 괭이 +${r.fireRate}%)` : ''}
      </div>
    `;
  }
  
  resultBody.innerHTML = gridHtml + bonusHtml;
  
  setTimeout(() => {
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);
}

function syncExpertSettings() {
  const hoeInput = document.getElementById('hoe-level');
  const giftInput = document.getElementById('expert-gift');
  const fireInput = document.getElementById('expert-fire');
  
  STAMINA_CONFIG.hoeLevel = hoeInput ? (parseInt(hoeInput.value) || 1) : 1;
  STAMINA_CONFIG.expertGift = giftInput ? parseInt(giftInput.value) || 0 : 0;
  STAMINA_CONFIG.expertFire = fireInput ? parseInt(fireInput.value) || 0 : 0;
  
  updateExpertDisplay();
}

function updateExpertDisplay() {
  const { hoeLevel, expertGift, expertFire } = STAMINA_CONFIG;
  const expertInfoElem = document.getElementById('farming-expert-info');
  if (expertInfoElem) {
    expertInfoElem.textContent = `괭이 ${hoeLevel}강 · 자연의 선물 LV${expertGift} · 불붙은 괭이 LV${expertFire}`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const staminaInput = document.getElementById('stamina-input-1');
  if (staminaInput) {
    staminaInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') calculateStamina();
    });
  }
  
  const expertInputs = ['hoe-level', 'expert-gift', 'expert-fire'];
  expertInputs.forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('input', () => {
        syncExpertSettings();
        const resultCard = document.getElementById('stamina-result-card');
        if (resultCard && resultCard.style.display === 'block') {
          calculateStamina();
        }
      });
    }
  });
  
  syncExpertSettings();
});
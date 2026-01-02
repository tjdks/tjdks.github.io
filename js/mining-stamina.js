// 채광 스태미나 계산

const MINING_STAMINA_CONFIG = {
  perMine: 10,  // 1회 채광당 스태미나 소모
  pickaxeLevel: 1,
  expertCobiTime: 0,
  expertLucky: 0,
  expertFirePick: 0,
  expertGemStart: 0,
};

// 곡괭이 레벨별 스펙 (광물 드롭 수, 유물 확률, 코비 확률만)
const PICKAXE_STATS = {
  1:  { drops: 2,  relic: 0.00, cobi: 0.00 },
  2:  { drops: 3,  relic: 0.01, cobi: 0.01 },
  3:  { drops: 3,  relic: 0.01, cobi: 0.01 },
  4:  { drops: 3,  relic: 0.01, cobi: 0.02 },
  5:  { drops: 4,  relic: 0.02, cobi: 0.02 },
  6:  { drops: 4,  relic: 0.02, cobi: 0.03 },
  7:  { drops: 4,  relic: 0.02, cobi: 0.03 },
  8:  { drops: 5,  relic: 0.03, cobi: 0.04 },
  9:  { drops: 5,  relic: 0.03, cobi: 0.05 },
  10: { drops: 5,  relic: 0.03, cobi: 0.06 },
  11: { drops: 6,  relic: 0.05, cobi: 0.07 },
  12: { drops: 6,  relic: 0.05, cobi: 0.08 },
  13: { drops: 7,  relic: 0.05, cobi: 0.10 },
  14: { drops: 7,  relic: 0.05, cobi: 0.13 },
  15: { drops: 12, relic: 0.10, cobi: 0.15 }
};

// 전문가 스킬: 코비타임 (코비 등장 확률 증가)
const EXPERT_COBI_TIME = {
  0: 0,
  1: 0.01,
  2: 0.015,
  3: 0.02,
  4: 0.025,
  5: 0.03,
  6: 0.04,
  7: 0.05
};

// 전문가 스킬: 럭키 히트 (광석 추가 드롭)
const EXPERT_LUCKY = {
  0:  { rate: 0,    count: 0 },
  1:  { rate: 0.01, count: 1 },
  2:  { rate: 0.02, count: 1 },
  3:  { rate: 0.03, count: 1 },
  4:  { rate: 0.04, count: 1 },
  5:  { rate: 0.05, count: 1 },
  6:  { rate: 0.06, count: 1 },
  7:  { rate: 0.07, count: 1 },
  8:  { rate: 0.08, count: 2 },
  9:  { rate: 0.10, count: 2 },
  10: { rate: 0.15, count: 3 }
};

// 전문가 스킬: 불붙은 곡괭이 (광석→주괴 제련)
const EXPERT_FIRE_PICK = {
  0:  { rate: 0,    count: 0 },
  1:  { rate: 0.01, count: 1 },
  2:  { rate: 0.02, count: 1 },
  3:  { rate: 0.03, count: 1 },
  4:  { rate: 0.04, count: 1 },
  5:  { rate: 0.05, count: 1 },
  6:  { rate: 0.06, count: 1 },
  7:  { rate: 0.07, count: 1 },
  8:  { rate: 0.08, count: 1 },
  9:  { rate: 0.09, count: 1 },
  10: { rate: 0.15, count: 1 }
};

// 전문가 스킬: 반짝임의 시작 (보석 드롭)
const EXPERT_GEM_START = {
  0: { rate: 0,    count: 0 },
  1: { rate: 0.03, count: 1 },
  2: { rate: 0.07, count: 1 },
  3: { rate: 0.10, count: 2 }
};

// 광물 정보 (보석: 코룸→그라밋, 리프톤→에메리오, 세렌트→샤인플레어)
const ORE_DATA = {
  corum:   { name: '코룸',   img: 'mining_img/corum.png',   gemName: '그라밋' },
  lifton:  { name: '리프톤', img: 'mining_img/lifton.png',  gemName: '에메리오' },
  serent:  { name: '세렌트', img: 'mining_img/serent.png',  gemName: '샤인플레어' }
};

let miningInputCount = 1;

function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function addMiningStaminaInput() {
  miningInputCount++;
  const container = document.getElementById('mining-stamina-inputs-container');
  
  const row = document.createElement('div');
  row.className = 'stamina-input-row';
  row.id = `mining-input-row-${miningInputCount}`;
  row.innerHTML = `
    <div class="stamina-input-group">
      <label class="stamina-label">
        스태미나
        <input type="number" id="mining-stamina-input-${miningInputCount}" class="stamina-input" placeholder="3300" min="0" step="10">
      </label>
      <label class="stamina-label">
        광물
        <select id="ore-select-${miningInputCount}" class="stamina-select">
          <option value="corum">코룸</option>
          <option value="lifton">리프톤</option>
          <option value="serent">세렌트</option>
        </select>
      </label>
    </div>
    <button class="btn-remove" onclick="removeMiningStaminaInput(${miningInputCount})">×</button>
  `;
  container.appendChild(row);
  document.getElementById(`mining-stamina-input-${miningInputCount}`).focus();
}

function removeMiningStaminaInput(id) {
  const row = document.getElementById(`mining-input-row-${id}`);
  if (row) row.remove();
}

function calculateMiningStamina() {
  syncMiningExpertSettings();
  
  const results = [];
  let grandTotal = 0;
  
  for (let i = 1; i <= miningInputCount; i++) {
    const inputElem = document.getElementById(`mining-stamina-input-${i}`);
    const selectElem = document.getElementById(`ore-select-${i}`);
    
    if (!inputElem || !selectElem) continue;
    
    const stamina = parseInt(inputElem.value);
    const oreType = selectElem.value;
    
    if (!stamina || stamina <= 0) continue;
    
    const mineCount = Math.floor(stamina / MINING_STAMINA_CONFIG.perMine);
    const pickaxeStats = PICKAXE_STATS[MINING_STAMINA_CONFIG.pickaxeLevel] || PICKAXE_STATS[1];
    
    // 기본 광물 드롭
    let baseOre = mineCount * pickaxeStats.drops;
    
    // 럭키 히트 보너스 (광석 추가)
    const luckyData = EXPERT_LUCKY[MINING_STAMINA_CONFIG.expertLucky] || { rate: 0, count: 0 };
    const luckyProcs = Math.floor(mineCount * luckyData.rate);
    const luckyOre = luckyProcs * luckyData.count;
    const totalOre = baseOre + luckyOre;
    
    // 불붙은 곡괭이 (주괴 드롭)
    const fireData = EXPERT_FIRE_PICK[MINING_STAMINA_CONFIG.expertFirePick] || { rate: 0, count: 0 };
    const fireProcs = Math.floor(mineCount * fireData.rate);
    const totalIngot = fireProcs * fireData.count;
    
    // 반짝임의 시작 (보석 드롭)
    const gemData = EXPERT_GEM_START[MINING_STAMINA_CONFIG.expertGemStart] || { rate: 0, count: 0 };
    const gemProcs = Math.floor(mineCount * gemData.rate);
    const totalGem = gemProcs * gemData.count;
    
    // 유물 (곡괭이 기본 확률)
    const relicProcs = Math.floor(mineCount * pickaxeStats.relic);
    
    // 코비 소환 (곡괭이 기본 + 코비타임 전문가)
    const cobiBaseRate = pickaxeStats.cobi;
    const cobiExpertRate = EXPERT_COBI_TIME[MINING_STAMINA_CONFIG.expertCobiTime] || 0;
    const totalCobiRate = cobiBaseRate + cobiExpertRate;
    const cobiProcs = Math.floor(mineCount * totalCobiRate);
    
    // 총합 계산 (광물 + 주괴 + 보석)
    const total = totalOre + totalIngot + totalGem;
    grandTotal += total;
    
    results.push({
      oreType,
      oreName: ORE_DATA[oreType].name,
      oreImg: ORE_DATA[oreType].img,
      gemName: ORE_DATA[oreType].gemName,
      mineCount,
      baseOre,
      luckyOre,
      totalOre,
      totalIngot,
      totalGem,
      relicProcs,
      cobiProcs,
      total,
      // 보너스 정보
      luckyRate: Math.round(luckyData.rate * 100),
      luckyCount: luckyData.count,
      fireRate: Math.round(fireData.rate * 100),
      fireCount: fireData.count,
      gemRate: Math.round(gemData.rate * 100),
      gemCount: gemData.count,
      cobiBaseRate: Math.round(cobiBaseRate * 100),
      cobiExpertRate: Math.round(cobiExpertRate * 100),
      relicRate: Math.round(pickaxeStats.relic * 100)
    });
  }
  
  if (results.length === 0) {
    alert('스태미나를 입력해주세요.');
    return;
  }
  
  displayMiningResults(results, grandTotal);
}

function displayMiningResults(results, grandTotal) {
  const resultCard = document.getElementById('mining-stamina-result-card');
  const resultBody = document.getElementById('mining-result-body');
  
  resultCard.style.display = 'block';
  
  // 헤더에 총합 표시
  const titleElem = resultCard.querySelector('.result-section-title');
  titleElem.innerHTML = `<span>예상 획득량</span><span>총 ${formatNumber(grandTotal)}개</span>`;
  
  // 결과 그리드 생성
  let gridHtml = '<div class="result-grid">';
  
  results.forEach((r) => {
    gridHtml += `
      <div class="crop-result-section">
        <div class="crop-result-title">
          <img src="${r.oreImg}" alt="${r.oreName}">
          <span>${r.oreName}</span>
        </div>
        <div class="crop-result-row">
          <span class="result-label">광물</span>
          <span class="result-value">${formatNumber(r.baseOre)}${r.luckyOre > 0 ? `<span class="result-detail">+${r.luckyOre}</span>` : ''}</span>
        </div>
        ${r.totalIngot > 0 ? `
        <div class="crop-result-row">
          <span class="result-label">주괴</span>
          <span class="result-value primary">${formatNumber(r.totalIngot)}<span class="result-detail">+${r.fireRate}%</span></span>
        </div>
        ` : ''}
        <div class="crop-result-row">
          <span class="result-label">${r.gemName}</span>
          <span class="result-value">${formatNumber(r.totalGem)}${r.gemRate > 0 ? `<span class="result-detail">+${r.gemRate}%</span>` : ''}</span>
        </div>
        <div class="crop-result-row">
          <span class="result-label">유물</span>
          <span class="result-value">${formatNumber(r.relicProcs)}${r.relicRate > 0 ? `<span class="result-detail">+${r.relicRate}%</span>` : ''}</span>
        </div>
        <div class="crop-result-row">
          <span class="result-label">코비 (스킬펄스)</span>
          <span class="result-value">${formatNumber(r.cobiProcs)}${(r.cobiBaseRate + r.cobiExpertRate) > 0 ? `<span class="result-detail">+${r.cobiBaseRate + r.cobiExpertRate}%</span>` : ''}</span>
        </div>
        <div class="crop-result-row total">
          <span class="result-label">합계</span>
          <span class="result-value primary">${formatNumber(r.total)}</span>
        </div>
        <div class="crop-result-row sub-info">
          <span class="result-label">주괴</span>
          <span class="result-value">${formatNumber(Math.floor(r.totalOre / 16))}개</span>
        </div>
      </div>
    `;
  });
  
  gridHtml += '</div>';
  
  // 보너스 요약
  const r = results[0];
  
  let bonusHtml = '';
  const bonusParts = [];
  
  if (r.luckyRate > 0) {
    bonusParts.push(`광물 추가 0% → <strong>${r.luckyRate}%</strong> 확률 ${r.luckyCount}개 (럭키 히트 +${r.luckyRate}%)`);
  }
  if (r.fireRate > 0) {
    bonusParts.push(`주괴 추가 0% → <strong>${r.fireRate}%</strong> 확률 ${r.fireCount}개 (불붙은 곡괭이 +${r.fireRate}%)`);
  }
  if (r.gemRate > 0) {
    bonusParts.push(`보석 추가 0% → <strong>${r.gemRate}%</strong> 확률 ${r.gemCount}개 (반짝임의 시작 +${r.gemRate}%)`);
  }
  if (r.cobiExpertRate > 0) {
    bonusParts.push(`코비 확률 ${r.cobiBaseRate}% → <strong>${r.cobiBaseRate + r.cobiExpertRate}%</strong> (코비타임 +${r.cobiExpertRate}%)`);
  }
  
  if (bonusParts.length > 0) {
    bonusHtml = `
      <div class="bonus-summary">
        <div class="bonus-summary-title">적용 보너스</div>
        ${bonusParts.join(' · ')}
      </div>
    `;
  }
  
  resultBody.innerHTML = gridHtml + bonusHtml;
  
  setTimeout(() => {
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);
}

function syncMiningExpertSettings() {
  // 정보 탭의 전문가 설정 입력값 가져오기
  const pickaxeInput = document.getElementById('pickaxe-level');
  const cobiInput = document.getElementById('expert-cobi-level');        // 코비타임
  const luckyInput = document.getElementById('expert-lucky-level');      // 럭키 히트
  const fireInput = document.getElementById('expert-fire-pick-level');   // 불붙은 곡괭이
  const gemInput = document.getElementById('expert-gem-start-level');    // 반짝임의 시작
  
  MINING_STAMINA_CONFIG.pickaxeLevel = pickaxeInput ? parseInt(pickaxeInput.value) || 1 : 1;
  MINING_STAMINA_CONFIG.expertCobiTime = cobiInput ? parseInt(cobiInput.value) || 0 : 0;
  MINING_STAMINA_CONFIG.expertLucky = luckyInput ? parseInt(luckyInput.value) || 0 : 0;
  MINING_STAMINA_CONFIG.expertFirePick = fireInput ? parseInt(fireInput.value) || 0 : 0;
  MINING_STAMINA_CONFIG.expertGemStart = gemInput ? parseInt(gemInput.value) || 0 : 0;
  
  updateMiningExpertDisplay();
}

function updateMiningExpertDisplay() {
  const { pickaxeLevel, expertCobiTime, expertLucky, expertFirePick, expertGemStart } = MINING_STAMINA_CONFIG;
  const expertInfoElem = document.getElementById('mining-expert-info');
  if (expertInfoElem) {
    expertInfoElem.textContent = `곡괭이 ${pickaxeLevel}강 · 코비타임 LV${expertCobiTime} · 럭키 히트 LV${expertLucky} · 불붙은 곡괭이 LV${expertFirePick} · 반짝임의 시작 LV${expertGemStart}`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // 스태미나 입력 엔터키 처리
  const staminaInput = document.getElementById('mining-stamina-input-1');
  if (staminaInput) {
    staminaInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') calculateMiningStamina();
    });
  }
  
  // 전문가 설정 변경 시 자동 업데이트
  const expertInputs = [
    'pickaxe-level',
    'expert-cobi-level',
    'expert-lucky-level',
    'expert-fire-pick-level',
    'expert-gem-start-level'
  ];
  
  expertInputs.forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('input', () => {
        syncMiningExpertSettings();
        const resultCard = document.getElementById('mining-stamina-result-card');
        if (resultCard && resultCard.style.display === 'block') {
          calculateMiningStamina();
        }
      });
    }
  });
  
  // 초기 설정 동기화
  syncMiningExpertSettings();
});
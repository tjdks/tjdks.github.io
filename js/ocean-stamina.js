// 해양 스태미나 계산

const STAMINA_CONFIG = {
  perGather: 15,
  rodLevel: 0,
  expertDeepSea: 0,    // 폭풍의 물질꾼 → 심해 채집꾼으로 변경
  expertStar: 0,
  expertClamRefill: 0,
};

// 낚싯대 레벨별 드롭 수
const ROD_STATS = {
  0: 2, 1: 2, 2: 2, 3: 3, 4: 3, 5: 3,
  6: 4, 7: 4, 8: 4, 9: 5, 10: 5,
  11: 5, 12: 6, 13: 6, 14: 7, 15: 10
};

// 낚싯대 레벨별 조개 기본 확률
const ROD_CLAM_RATE = {
  0: 0.01, 1: 0.01, 2: 0.01, 3: 0.02, 4: 0.02, 5: 0.02,
  6: 0.03, 7: 0.03, 8: 0.03, 9: 0.05, 10: 0.05,
  11: 0.07, 12: 0.07, 13: 0.09, 14: 0.09, 15: 0.15
};

// 전문가 스킬 - 심해 채집꾼 (구 폭풍의 물질꾼)
const EXPERT_DEEP_SEA = { 0: 0, 1: 0.05, 2: 0.07, 3: 0.10, 4: 0.15, 5: 0.20 };
const EXPERT_STAR = { 0: 0, 1: 0.01, 2: 0.03, 3: 0.05, 4: 0.07, 5: 0.10, 6: 0.15 };
const EXPERT_CLAM_REFILL = { 
  0: 0, 1: 0.01, 2: 0.02, 3: 0.03, 4: 0.04, 5: 0.05, 
  6: 0.06, 7: 0.07, 8: 0.08, 9: 0.09, 10: 0.10 
};

// 어패류 정보
const FISH_DATA = {
  oyster: { name: '굴', img: 'img/oyster.png' },
  conch: { name: '소라', img: 'img/conch.png' },
  octopus: { name: '문어', img: 'img/octopus.png' },
  seaweed: { name: '미역', img: 'img/seaweed.png' },
  urchin: { name: '성게', img: 'img/urchin.png' }
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
        <input type="number" id="stamina-input-${inputCount}" class="stamina-input" placeholder="3000" min="0" step="15">
      </label>
      <label class="stamina-label">
        어패류
        <select id="fish-select-${inputCount}" class="stamina-select">
          <option value="oyster">굴</option>
          <option value="conch">소라</option>
          <option value="octopus">문어</option>
          <option value="seaweed">미역</option>
          <option value="urchin">성게</option>
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

function distributeByRarity(totalDrops, starLevel) {
  const starBonus = EXPERT_STAR[starLevel] || 0;
  const rate3 = 0.10 + starBonus;
  const rate2 = 0.30;
  const rate1 = 1 - rate2 - rate3;
  
  let count1 = Math.floor(totalDrops * rate1);
  let count2 = Math.floor(totalDrops * rate2);
  let count3 = Math.floor(totalDrops * rate3);
  
  // 나머지 배분
  let remainder = totalDrops - (count1 + count2 + count3);
  const fracs = [
    { key: 'count3', frac: (totalDrops * rate3) % 1 },
    { key: 'count2', frac: (totalDrops * rate2) % 1 },
    { key: 'count1', frac: (totalDrops * rate1) % 1 }
  ].sort((a, b) => b.frac - a.frac);
  
  const counts = { count1, count2, count3 };
  for (let i = 0; i < remainder; i++) {
    counts[fracs[i % 3].key]++;
  }
  
  return { 
    count1: counts.count1, 
    count2: counts.count2, 
    count3: counts.count3,
    starBonus: Math.round(starBonus * 100)
  };
}

function calculateStamina() {
  syncExpertSettings();
  
  const results = [];
  let grandTotal = 0;
  
  for (let i = 1; i <= inputCount; i++) {
    const inputElem = document.getElementById(`stamina-input-${i}`);
    const selectElem = document.getElementById(`fish-select-${i}`);
    
    if (!inputElem || !selectElem) continue;
    
    const stamina = parseInt(inputElem.value);
    const fishType = selectElem.value;
    
    if (!stamina || stamina <= 0) continue;
    
    const gatherCount = Math.floor(stamina / STAMINA_CONFIG.perGather);
    const dropsPerGather = ROD_STATS[STAMINA_CONFIG.rodLevel] || 1;
    let totalDrops = gatherCount * dropsPerGather;
    
    // 심해 채집꾼 보너스 (구 폭풍의 물질꾼)
    const deepSeaBonus = EXPERT_DEEP_SEA[STAMINA_CONFIG.expertDeepSea] || 0;
    const deepSeaDrops = Math.floor(gatherCount * deepSeaBonus);
    totalDrops += deepSeaDrops;
    
    // 등급별 분배
    const { count1, count2, count3, starBonus } = distributeByRarity(totalDrops, STAMINA_CONFIG.expertStar);
    
    // 조개 계산
    const baseClamRate = ROD_CLAM_RATE[STAMINA_CONFIG.rodLevel] || 0.01;
    const clamBonus = EXPERT_CLAM_REFILL[STAMINA_CONFIG.expertClamRefill] || 0;
    const totalClamRate = baseClamRate + clamBonus;
    const clamCount = Math.floor(gatherCount * totalClamRate);
    
    grandTotal += totalDrops;
    
    results.push({
      fishType,
      fishName: FISH_DATA[fishType].name,
      fishImg: FISH_DATA[fishType].img,
      count1, count2, count3,
      clamCount, totalDrops,
      starBonus,
      clamBonusPercent: Math.round(clamBonus * 100),
      deepSeaBonusPercent: Math.round(deepSeaBonus * 100)
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
    gridHtml += `
      <div class="fish-result-section">
        <div class="fish-result-title">
          <img src="${r.fishImg}" alt="${r.fishName}">
          <span>${r.fishName}</span>
        </div>
        <div class="fish-result-row">
          <span class="result-label">★</span>
          <span class="result-value">${formatNumber(r.count1)}</span>
        </div>
        <div class="fish-result-row">
          <span class="result-label">★★</span>
          <span class="result-value">${formatNumber(r.count2)}</span>
        </div>
        <div class="fish-result-row">
          <span class="result-label">★★★</span>
          <span class="result-value primary">${formatNumber(r.count3)}${r.starBonus > 0 ? `<span class="result-detail">+${r.starBonus}%</span>` : ''}</span>
        </div>
        <div class="fish-result-row">
          <span class="result-label">조개</span>
          <span class="result-value">${formatNumber(r.clamCount)}${r.clamBonusPercent > 0 ? `<span class="result-detail">+${r.clamBonusPercent}%</span>` : ''}</span>
        </div>
        <div class="fish-result-row total">
          <span class="result-label">합계</span>
          <span class="result-value primary">${formatNumber(r.totalDrops)}</span>
        </div>
      </div>
    `;
  });
  
  gridHtml += '</div>';
  
  // 보너스 요약
  const r = results[0];
  const baseClamRate = Math.round((ROD_CLAM_RATE[STAMINA_CONFIG.rodLevel] || 0.01) * 100);
  const totalClamRate = baseClamRate + r.clamBonusPercent;
  
  let bonusHtml = '';
  if (r.starBonus > 0 || r.clamBonusPercent > 0 || r.deepSeaBonusPercent > 0) {
    bonusHtml = `
      <div class="bonus-summary">
        <div class="bonus-summary-title">적용 보너스</div>
        ${r.starBonus > 0 ? `3성 확률 10% → <strong>${10 + r.starBonus}%</strong> (별별별 +${r.starBonus}%)` : ''}
        ${r.starBonus > 0 && r.clamBonusPercent > 0 ? ' · ' : ''}
        ${r.clamBonusPercent > 0 ? `조개 확률 ${baseClamRate}% → <strong>${totalClamRate}%</strong> (리필 +${r.clamBonusPercent}%)` : ''}
        ${(r.starBonus > 0 || r.clamBonusPercent > 0) && r.deepSeaBonusPercent > 0 ? ' · ' : ''}
        ${r.deepSeaBonusPercent > 0 ? `추가 드롭 <strong>+${r.deepSeaBonusPercent}%</strong>` : ''}
      </div>
    `;
  }
  
  resultBody.innerHTML = gridHtml + bonusHtml;
  
  setTimeout(() => {
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);
}

function syncExpertSettings() {
  const rodInput = document.getElementById('rod-level');
  const deepSeaInput = document.getElementById('expert-deep-sea');  // 변경된 ID
  const starInput = document.getElementById('expert-star');
  const clamInput = document.getElementById('expert-clam-refill');
  
  STAMINA_CONFIG.rodLevel = rodInput  ? (parseInt(rodInput.value) || 1)  : 1;
  STAMINA_CONFIG.expertDeepSea = deepSeaInput ? parseInt(deepSeaInput.value) || 0 : 0;
  STAMINA_CONFIG.expertStar = starInput ? parseInt(starInput.value) || 0 : 0;
  STAMINA_CONFIG.expertClamRefill = clamInput ? parseInt(clamInput.value) || 0 : 0;
  
  updateExpertDisplay();
}

function updateExpertDisplay() {
  const { rodLevel, expertDeepSea, expertStar, expertClamRefill } = STAMINA_CONFIG;
  const expertInfoElem = document.getElementById('ocean-expert-info');
  if (expertInfoElem) {
    expertInfoElem.textContent = `낚싯대 ${rodLevel}강 · 심해 채집꾼 LV${expertDeepSea} · 별별별 LV${expertStar} · 조개리필 LV${expertClamRefill}`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const staminaInput = document.getElementById('stamina-input-1');
  if (staminaInput) {
    staminaInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') calculateStamina();
    });
  }
  
  const expertInputs = ['rod-level', 'expert-deep-sea', 'expert-star', 'expert-clam-refill'];
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

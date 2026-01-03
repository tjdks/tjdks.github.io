/* =========================
   채광 손익 계산 (mining-efficiency.js)
========================= */

// 기본 시세 데이터
const miningPriceData = {
  // 바닐라 광물 블록
  coalBlock: 261,
  copperBlock: 97,
  ironBlock: 663,
  goldBlock: 800,
  diamondBlock: 2963,
  redstoneBlock: 77,
  lapisBlock: 235,
  amethystBlock: 87,
  // 띵타이쿤 재료
  cobbleBundle: 719,
  deepslateBundle: 382,
  corumIngot: 3500,
  liftonIngot: 3750,
  serentIngot: 4000,
  // 가공품 판매가
  torch: 121,
  abilityStone: 18209,
  lifestoneLow: 9584,
  lifestoneMid: 31293,
  lifestoneHigh: 49668
};

// 수수료율
const FEE_RATE = 0.05;

// 실수령액 계산
function getNetPrice(price) {
  return price * (1 - FEE_RATE);
}

// 숫자 포맷
function formatNumber(num) {
  return Math.round(num).toLocaleString('ko-KR');
}

// 입력값 가져오기
function getPriceVal(id) {
  const el = document.getElementById(id);
  return el ? (parseFloat(el.value) || 0) : 0;
}

// 손익 계산
function calculateMiningEfficiency() {
  // 시세 가져오기
  const prices = {
    coalBlock: getPriceVal('price-coal-block') || miningPriceData.coalBlock,
    copperBlock: getPriceVal('price-copper-block') || miningPriceData.copperBlock,
    ironBlock: getPriceVal('price-iron-block') || miningPriceData.ironBlock,
    goldBlock: getPriceVal('price-gold-block') || miningPriceData.goldBlock,
    diamondBlock: getPriceVal('price-diamond-block') || miningPriceData.diamondBlock,
    redstoneBlock: getPriceVal('price-redstone-block') || miningPriceData.redstoneBlock,
    lapisBlock: getPriceVal('price-lapis-block') || miningPriceData.lapisBlock,
    amethystBlock: getPriceVal('price-amethyst-block') || miningPriceData.amethystBlock,
    cobbleBundle: getPriceVal('price-cobble-bundle') || miningPriceData.cobbleBundle,
    deepslateBundle: getPriceVal('price-deepslate-bundle') || miningPriceData.deepslateBundle,
    corumIngot: getPriceVal('price-corum-ingot') || miningPriceData.corumIngot,
    liftonIngot: getPriceVal('price-lifton-ingot') || miningPriceData.liftonIngot,
    serentIngot: getPriceVal('price-serent-ingot') || miningPriceData.serentIngot
  };

  const sells = {
    torch: getPriceVal('sell-torch') || miningPriceData.torch,
    abilityStone: getPriceVal('sell-ability-stone') || miningPriceData.abilityStone,
    lifestoneLow: getPriceVal('sell-lifestone-low') || miningPriceData.lifestoneLow,
    lifestoneMid: getPriceVal('sell-lifestone-mid') || miningPriceData.lifestoneMid,
    lifestoneHigh: getPriceVal('sell-lifestone-high') || miningPriceData.lifestoneHigh
  };

  // 강화 횃불 원가 (석탄 4개 = 석탄블록 4/9개)
  const torchCost = prices.coalBlock * (4 / 9);

  // 결과 배열
  let results = [
    {
      name: '강화 횃불',
      formula: '석탄 4개',
      cost: torchCost,
      sell: sells.torch,
      net: getNetPrice(sells.torch),
      profit: getNetPrice(sells.torch) - torchCost
    },
    {
      name: '어빌리티스톤',
      formula: '코룸 + 리프톤 + 세렌트 주괴',
      cost: prices.corumIngot + prices.liftonIngot + prices.serentIngot,
      sell: sells.abilityStone,
      net: getNetPrice(sells.abilityStone),
      profit: getNetPrice(sells.abilityStone) - (prices.corumIngot + prices.liftonIngot + prices.serentIngot)
    },
    {
      name: '하급 라이프스톤',
      formula: '조약돌 뭉치 2 + 구리 8 + 레드스톤 3 + 코룸 주괴',
      cost: prices.cobbleBundle * 2 + prices.copperBlock * 8 + prices.redstoneBlock * 3 + prices.corumIngot,
      sell: sells.lifestoneLow,
      net: getNetPrice(sells.lifestoneLow),
      profit: getNetPrice(sells.lifestoneLow) - (prices.cobbleBundle * 2 + prices.copperBlock * 8 + prices.redstoneBlock * 3 + prices.corumIngot)
    },
    {
      name: '중급 라이프스톤',
      formula: '심층암 뭉치 2 + 청금석 5 + 철 5 + 다이아 3 + 리프톤 주괴 2',
      cost: prices.deepslateBundle * 2 + prices.lapisBlock * 5 + prices.ironBlock * 5 + prices.diamondBlock * 3 + prices.liftonIngot * 2,
      sell: sells.lifestoneMid,
      net: getNetPrice(sells.lifestoneMid),
      profit: getNetPrice(sells.lifestoneMid) - (prices.deepslateBundle * 2 + prices.lapisBlock * 5 + prices.ironBlock * 5 + prices.diamondBlock * 3 + prices.liftonIngot * 2)
    },
    {
      name: '상급 라이프스톤',
      formula: '구리 30 + 자수정 20 + 철 7 + 금 7 + 다이아 5 + 세렌트 주괴 3',
      cost: prices.copperBlock * 30 + prices.amethystBlock * 20 + prices.ironBlock * 7 + prices.goldBlock * 7 + prices.diamondBlock * 5 + prices.serentIngot * 3,
      sell: sells.lifestoneHigh,
      net: getNetPrice(sells.lifestoneHigh),
      profit: getNetPrice(sells.lifestoneHigh) - (prices.copperBlock * 30 + prices.amethystBlock * 20 + prices.ironBlock * 7 + prices.goldBlock * 7 + prices.diamondBlock * 5 + prices.serentIngot * 3)
    }
  ];

  // 손익 기준 정렬
  results.sort((a, b) => b.profit - a.profit);

  // TOP 3 렌더링
  renderTop3Cards(results);

  // 요약 통계 렌더링
  renderSummaryStats(results);

  // 테이블 렌더링
  renderRankingTable(results);
}

// TOP 3 카드 렌더링
function renderTop3Cards(results) {
  const top3Grid = document.getElementById('mining-top3-grid');
  if (!top3Grid) return;

  top3Grid.innerHTML = results.slice(0, 3).map((r, i) => {
    const isLoss = r.profit < 0;
    const cardClass = i === 0 ? (isLoss ? 'loss' : 'rank-1') : '';
    
    return `
      <div class="top3-card ${cardClass}">
        <div class="rank-badge">${i + 1}</div>
        <div class="recipe-name">${r.name}</div>
        <div class="price-info">판매가 ${formatNumber(r.sell)}G → 실수령 ${formatNumber(r.net)}G</div>
        <div class="metric-box">
          <div class="metric-label">순이익</div>
          <div class="metric-value ${r.profit < 0 ? 'negative' : ''}">${r.profit >= 0 ? '+' : ''}${formatNumber(r.profit)}<span class="metric-unit">G</span></div>
        </div>
        <div class="detail-list">
          <div class="detail-row">
            <span>재료 원가</span>
            <span class="detail-value">${formatNumber(r.cost)} G</span>
          </div>
          <div class="detail-row">
            <span>수수료 (5%)</span>
            <span class="detail-value">-${formatNumber(r.sell * FEE_RATE)} G</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// 요약 통계 렌더링
function renderSummaryStats(results) {
  const summaryStats = document.getElementById('mining-summary-stats');
  if (!summaryStats) return;

  let profitCount = 0, lossCount = 0;
  results.forEach(r => {
    if (r.profit > 0) profitCount++;
    else if (r.profit < 0) lossCount++;
  });

  summaryStats.innerHTML = `
    <div class="summary-stat profit">
      <div class="stat-label">가공이 이득</div>
      <div class="stat-value">${profitCount}개</div>
    </div>
    <div class="summary-stat loss">
      <div class="stat-label">재료 판매가 이득</div>
      <div class="stat-value">${lossCount}개</div>
    </div>
  `;
}

// 순위 테이블 렌더링
function renderRankingTable(results) {
  const tbody = document.getElementById('mining-ranking-tbody');
  if (!tbody) return;

  tbody.innerHTML = results.map((r, i) => `
    <tr class="${i < 3 ? 'top3-row' : ''}">
      <td><span class="rank-num ${i < 3 ? 'top' : ''}">${i + 1}</span></td>
      <td class="item-name">${r.name}</td>
      <td class="text-right cost-val">${formatNumber(r.cost)} G</td>
      <td class="text-right net-val">${formatNumber(r.net)} G</td>
      <td class="text-right profit-val ${r.profit >= 0 ? 'positive' : 'negative'}">${r.profit >= 0 ? '+' : ''}${formatNumber(r.profit)} G</td>
      <td class="text-right"><span class="verdict-badge ${r.profit >= 0 ? 'profit' : 'loss'}">${r.profit >= 0 ? '이득' : '손해'}</span></td>
    </tr>
  `).join('');
}

// 시세 기본값 복원
function resetMiningPrices() {
  // 바닐라 광물 블록
  document.getElementById('price-coal-block').value = miningPriceData.coalBlock;
  document.getElementById('price-copper-block').value = miningPriceData.copperBlock;
  document.getElementById('price-iron-block').value = miningPriceData.ironBlock;
  document.getElementById('price-gold-block').value = miningPriceData.goldBlock;
  document.getElementById('price-diamond-block').value = miningPriceData.diamondBlock;
  document.getElementById('price-redstone-block').value = miningPriceData.redstoneBlock;
  document.getElementById('price-lapis-block').value = miningPriceData.lapisBlock;
  document.getElementById('price-amethyst-block').value = miningPriceData.amethystBlock;
  // 띵타이쿤 재료
  document.getElementById('price-cobble-bundle').value = miningPriceData.cobbleBundle;
  document.getElementById('price-deepslate-bundle').value = miningPriceData.deepslateBundle;
  document.getElementById('price-corum-ingot').value = miningPriceData.corumIngot;
  document.getElementById('price-lifton-ingot').value = miningPriceData.liftonIngot;
  document.getElementById('price-serent-ingot').value = miningPriceData.serentIngot;
  // 가공품 판매가
  document.getElementById('sell-torch').value = miningPriceData.torch;
  document.getElementById('sell-ability-stone').value = miningPriceData.abilityStone;
  document.getElementById('sell-lifestone-low').value = miningPriceData.lifestoneLow;
  document.getElementById('sell-lifestone-mid').value = miningPriceData.lifestoneMid;
  document.getElementById('sell-lifestone-high').value = miningPriceData.lifestoneHigh;
  
  calculateMiningEfficiency();
}

// 초기화
document.addEventListener('DOMContentLoaded', function() {
  // 손익 탭이 활성화될 때 계산 실행
  const efficiencyTab = document.querySelector('[data-target="tab-efficiency"]');
  if (efficiencyTab) {
    efficiencyTab.addEventListener('click', function() {
      setTimeout(calculateMiningEfficiency, 100);
    });
  }
  
  console.log('Mining efficiency initialized');
});
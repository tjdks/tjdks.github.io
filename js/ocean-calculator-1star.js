/*************************************************
 * 1성 계산기 - 최적화 버전 (2025년 업데이트)
 * 
 * 조합법 변경사항:
 * - 정수: 어패류 2개 + 블록 → 정수 2개 (2개 단위 제작)
 *************************************************/

import { GOLD_PRICES, CORE_TO_ESSENCE_1STAR, ESSENCE_TO_BLOCK_1STAR, CORE_TO_FISH_1STAR } from './ocean-config.js';
import { 
    getPremiumRate, getPremiumText, getInputNumber, updateText, 
    isAdvancedMode, createMaterialCardsHTML, createMaterialTextHTML
} from './ocean-utils.js';
import { setupAdvancedToggle } from './ocean-ui.js';

// 전역 결과 저장
let lastResult = null;

/**
 * 2개 단위로 내림 처리
 * @param {number} n - 필요량
 * @returns {number} 2개 단위로 내림된 값
 */
function floorToTwo(n) {
    return Math.floor(n / 2) * 2;
}

/**
 * 1성 계산 메인 함수
 * @param {Object} input - 입력 데이터
 * @returns {Object|null} 계산 결과
 */
function calculate(input) {
    const isAdvanced = Number.isFinite(input.coreWG) && input.coreWG >= 0;

    // 보유 어패류
    const totalShellfish = {
        guard: input.guard,
        wave: input.wave,
        chaos: input.chaos,
        life: input.life,
        decay: input.decay
    };

    // 보유 정수
    const totalEss = {
        guard: (input.essGuard || 0),
        wave: (input.essWave || 0),
        chaos: (input.essChaos || 0),
        life: (input.essLife || 0),
        decay: (input.essDecay || 0)
    };

    // 보유 핵
    const totalCore = isAdvanced ? {
        WG: input.coreWG || 0,
        WP: input.coreWP || 0,
        OD: input.coreOD || 0,
        VD: input.coreVD || 0,
        ED: input.coreED || 0
    } : { WG: 0, WP: 0, OD: 0, VD: 0, ED: 0 };

    // 어패류로 만들 수 있는 정수 (2개 단위로 내림 → 2개씩 생성)
    const essFromShellfish = {
        guard: floorToTwo(totalShellfish.guard),  // 굴 2개 → 수호 정수 2개
        wave: floorToTwo(totalShellfish.wave),    // 소라 2개 → 파동 정수 2개
        chaos: floorToTwo(totalShellfish.chaos),  // 문어 2개 → 혼란 정수 2개
        life: floorToTwo(totalShellfish.life),    // 미역 2개 → 생명 정수 2개
        decay: floorToTwo(totalShellfish.decay)   // 성게 2개 → 부식 정수 2개
    };

    // 실제 사용 가능한 총 정수
    const availableEss = {
        guard: totalEss.guard + essFromShellfish.guard,
        wave: totalEss.wave + essFromShellfish.wave,
        chaos: totalEss.chaos + essFromShellfish.chaos,
        life: totalEss.life + essFromShellfish.life,
        decay: totalEss.decay + essFromShellfish.decay
    };

    let best = { gold: -1, A: 0, K: 0, L: 0 };

    // 최대 제작 가능 개수 추정 (상한선)
    const maxProducts = Math.floor(
        (availableEss.guard + availableEss.wave + availableEss.chaos + 
         availableEss.life + availableEss.decay + 
         totalCore.WG + totalCore.WP + totalCore.OD + totalCore.VD + totalCore.ED) / 3
    ) + 1;

    // 최적화된 루프
    for (let A = 0; A <= maxProducts; A++) {
        for (let K = 0; K <= maxProducts; K++) {
            for (let L = 0; L <= maxProducts; L++) {
                // 필요한 핵 개수
                const needCore = {
                    WG: A + L,      // 물결 수호: 아쿠티스 + 리바이던
                    WP: K + L,      // 파동 오염: 광란체 + 리바이던
                    OD: A + K,      // 질서 파괴: 아쿠티스 + 광란체
                    VD: A + K,      // 활력 붕괴: 아쿠티스 + 광란체
                    ED: L           // 침식 방어: 리바이던만
                };

                // 제작해야 할 핵 개수
                const makeCore = {
                    WG: Math.max(0, needCore.WG - totalCore.WG),
                    WP: Math.max(0, needCore.WP - totalCore.WP),
                    OD: Math.max(0, needCore.OD - totalCore.OD),
                    VD: Math.max(0, needCore.VD - totalCore.VD),
                    ED: Math.max(0, needCore.ED - totalCore.ED)
                };

                // 핵 제작에 필요한 정수
                // 물결수호: 수호+파동, 파동오염: 파동+혼란, 질서파괴: 혼란+생명
                // 활력붕괴: 생명+부식, 침식방어: 부식+수호
                const needEss = {
                    guard: makeCore.WG + makeCore.ED,  // 물결수호 + 침식방어
                    wave: makeCore.WG + makeCore.WP,   // 물결수호 + 파동오염
                    chaos: makeCore.WP + makeCore.OD,  // 파동오염 + 질서파괴
                    life: makeCore.OD + makeCore.VD,   // 질서파괴 + 활력붕괴
                    decay: makeCore.VD + makeCore.ED   // 활력붕괴 + 침식방어
                };

                // 정수가 충분한지 체크
                if (needEss.guard > availableEss.guard ||
                    needEss.wave > availableEss.wave ||
                    needEss.chaos > availableEss.chaos ||
                    needEss.life > availableEss.life ||
                    needEss.decay > availableEss.decay) {
                    continue;
                }

                const gold = A * GOLD_PRICES['1star'].A + K * GOLD_PRICES['1star'].K + L * GOLD_PRICES['1star'].L;
                if (gold > best.gold) {
                    best = { gold, A, K, L };
                }
            }
        }
    }

    if (best.gold < 0) return null;

    // 결과 계산
    return buildResult(best, totalCore, totalEss, totalShellfish, availableEss);
}

/**
 * 결과 객체 생성 (2개 단위 제작 반영)
 */
function buildResult(best, totalCore, totalEss, totalShellfish, availableEss) {
    const coreNeed = {
        WG: best.A + best.L,
        WP: best.K + best.L,
        OD: best.A + best.K,
        VD: best.A + best.K,
        ED: best.L
    };

    const coreToMake = {
        WG: Math.max(0, coreNeed.WG - totalCore.WG),
        WP: Math.max(0, coreNeed.WP - totalCore.WP),
        OD: Math.max(0, coreNeed.OD - totalCore.OD),
        VD: Math.max(0, coreNeed.VD - totalCore.VD),
        ED: Math.max(0, coreNeed.ED - totalCore.ED)
    };

    // 핵 제작에 필요한 정수
    const essNeedForCore = {
        guard: coreToMake.WG + coreToMake.ED,
        wave: coreToMake.WG + coreToMake.WP,
        chaos: coreToMake.WP + coreToMake.OD,
        life: coreToMake.OD + coreToMake.VD,
        decay: coreToMake.VD + coreToMake.ED
    };

    // 보유 정수에서 부족한 만큼 제작 필요
    const essToMake = {
        guard: Math.max(0, essNeedForCore.guard - totalEss.guard),
        wave: Math.max(0, essNeedForCore.wave - totalEss.wave),
        chaos: Math.max(0, essNeedForCore.chaos - totalEss.chaos),
        life: Math.max(0, essNeedForCore.life - totalEss.life),
        decay: Math.max(0, essNeedForCore.decay - totalEss.decay)
    };

    // 제작 횟수 계산 (2개씩 나오므로)
    const craftCount = {
        guard: Math.ceil(essToMake.guard / 2),
        wave: Math.ceil(essToMake.wave / 2),
        chaos: Math.ceil(essToMake.chaos / 2),
        life: Math.ceil(essToMake.life / 2),
        decay: Math.ceil(essToMake.decay / 2)
    };

    // 블록 필요량 (정수 제작에 필요) - 제작 횟수 기준
    // 수호: 점토 1개, 파동: 모래 2개, 혼란: 흙 4개, 생명: 자갈 2개, 부식: 화강암 1개
    const blockNeed = {
        clay: craftCount.guard * 1,
        sand: craftCount.wave * 2,
        dirt: craftCount.chaos * 4,
        gravel: craftCount.life * 2,
        granite: craftCount.decay * 1
    };

    // 어패류 필요량 (정수 제작에 필요) - 제작 횟수 × 2
    const shellfishNeed = {
        guard: craftCount.guard * 2,
        wave: craftCount.wave * 2,
        chaos: craftCount.chaos * 2,
        life: craftCount.life * 2,
        decay: craftCount.decay * 2
    };

    // 물고기 필요량 (핵 제작에 필요)
    // 물결 수호(WG): 새우, 파동 오염(WP): 도미, 질서 파괴(OD): 청어, 활력 붕괴(VD): 금붕어, 침식 방어(ED): 농어
    const fishNeed = {
        shrimp: coreToMake.WG,
        domi: coreToMake.WP,
        herring: coreToMake.OD,
        goldfish: coreToMake.VD,
        bass: coreToMake.ED
    };

    // 전체 필요량 (세트 모드용)
    const essNeedTotal = {
        guard: coreNeed.WG + coreNeed.ED,
        wave: coreNeed.WG + coreNeed.WP,
        chaos: coreNeed.WP + coreNeed.OD,
        life: coreNeed.OD + coreNeed.VD,
        decay: coreNeed.VD + coreNeed.ED
    };

    const craftCountTotal = {
        guard: Math.ceil(essNeedTotal.guard / 2),
        wave: Math.ceil(essNeedTotal.wave / 2),
        chaos: Math.ceil(essNeedTotal.chaos / 2),
        life: Math.ceil(essNeedTotal.life / 2),
        decay: Math.ceil(essNeedTotal.decay / 2)
    };

    const blockNeedTotal = {
        clay: craftCountTotal.guard * 1,
        sand: craftCountTotal.wave * 2,
        dirt: craftCountTotal.chaos * 4,
        gravel: craftCountTotal.life * 2,
        granite: craftCountTotal.decay * 1
    };

    const shellfishNeedTotal = {
        guard: craftCountTotal.guard * 2,
        wave: craftCountTotal.wave * 2,
        chaos: craftCountTotal.chaos * 2,
        life: craftCountTotal.life * 2,
        decay: craftCountTotal.decay * 2
    };

    // 물고기 전체 필요량 (세트 모드용)
    const fishNeedTotal = {
        shrimp: coreNeed.WG,
        domi: coreNeed.WP,
        herring: coreNeed.OD,
        goldfish: coreNeed.VD,
        bass: coreNeed.ED
    };

    return { 
        best, 
        coreNeed, coreToMake,
        essNeedTotal, essNeedForCore, essToMake,
        blockNeed, blockNeedTotal,
        shellfishNeed, shellfishNeedTotal,
        fishNeed, fishNeedTotal
    };
}

/**
 * 결과 업데이트
 */
function updateResult(result) {
    if (!result) return;

    const rate = getPremiumRate();
    updateText("result-gold-1", Math.floor(result.best.gold * (1 + rate)).toLocaleString());
    updateText("result-premium-bonus-1", getPremiumText(rate));
    updateText("result-acutis-1", result.best.A);
    updateText("result-frenzy-1", result.best.K);
    updateText("result-feather-1", result.best.L);

    const advanced = isAdvancedMode();
    const essData = advanced ? result.essToMake : result.essNeedTotal;
    const coreData = advanced ? result.coreToMake : result.coreNeed;
    const blockData = advanced ? result.blockNeed : result.blockNeedTotal;
    const shellfishData = advanced ? result.shellfishNeed : result.shellfishNeedTotal;
    const fishData = advanced ? result.fishNeed : result.fishNeedTotal;

    // 정수
    document.getElementById("result-essence-1").innerHTML = createMaterialCardsHTML([
        { icon: 'essence_guard', name: '수호 정수', value: essData.guard || 0 },
        { icon: 'essence_wave', name: '파동 정수', value: essData.wave || 0 },
        { icon: 'essence_chaos', name: '혼란 정수', value: essData.chaos || 0 },
        { icon: 'essence_life', name: '생명 정수', value: essData.life || 0 },
        { icon: 'essence_decay', name: '부식 정수', value: essData.decay || 0 }
    ]);

    // 핵
    document.getElementById("result-core-1").innerHTML = createMaterialCardsHTML([
        { icon: 'core_wg', name: '물결 수호', value: coreData.WG || 0 },
        { icon: 'core_wp', name: '파동 오염', value: coreData.WP || 0 },
        { icon: 'core_od', name: '질서 파괴', value: coreData.OD || 0 },
        { icon: 'core_vd', name: '활력 붕괴', value: coreData.VD || 0 },
        { icon: 'core_ed', name: '침식 방어', value: coreData.ED || 0 }
    ]);

    // 블록 (필요 재료)
    document.getElementById("result-block-1").innerHTML = createMaterialTextHTML([
        { name: '점토', value: blockData.clay },
        { name: '모래', value: blockData.sand },
        { name: '흙', value: blockData.dirt },
        { name: '자갈', value: blockData.gravel },
        { name: '화강암', value: blockData.granite }
    ]);

    // 물고기 (핵 제작용)
    document.getElementById("result-fish-1").innerHTML = createMaterialTextHTML([
        { name: '새우', value: fishData.shrimp },
        { name: '도미', value: fishData.domi },
        { name: '청어', value: fishData.herring },
        { name: '금붕어', value: fishData.goldfish },
        { name: '농어', value: fishData.bass }
    ]);

    document.getElementById('result-card-1').style.display = 'block';
    lastResult = result;
}

/**
 * 실행 함수
 */
export function run() {
    const advanced = isAdvancedMode();

    const input = {
        guard: getInputNumber("input-oyster-1"),
        wave: getInputNumber("input-shell-1"),
        chaos: getInputNumber("input-octopus-1"),
        life: getInputNumber("input-seaweed-1"),
        decay: getInputNumber("input-urchin-1")
    };

    if (advanced) {
        input.essGuard = getInputNumber("input-essence-guard-1");
        input.essWave = getInputNumber("input-essence-wave-1");
        input.essChaos = getInputNumber("input-essence-chaos-1");
        input.essLife = getInputNumber("input-essence-life-1");
        input.essDecay = getInputNumber("input-essence-decay-1");

        input.coreWG = getInputNumber("input-core-wg-1");
        input.coreWP = getInputNumber("input-core-wp-1");
        input.coreOD = getInputNumber("input-core-od-1");
        input.coreVD = getInputNumber("input-core-vd-1");
        input.coreED = getInputNumber("input-core-ed-1");
    } else {
        input.essGuard = input.essWave = input.essChaos = input.essLife = input.essDecay = 0;
        input.coreWG = input.coreWP = input.coreOD = input.coreVD = input.coreED = 0;
    }

    const result = calculate(input);
    if (!result) {
        alert("재료 부족");
        return;
    }

    updateResult(result);
}

/**
 * 재업데이트 (세트 모드 변경 시)
 */
export function refresh() {
    if (lastResult) updateResult(lastResult);
}

/**
 * 초기화
 */
export function init() {
    setupAdvancedToggle(1);
}

// 전역 함수로 노출
window.run1StarOptimization = run;

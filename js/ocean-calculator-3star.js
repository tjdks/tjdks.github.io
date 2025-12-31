/*************************************************
 * 3성 계산기 - 최적화 버전 (2025년 업데이트)
 * 
 * 조합법 변경사항:
 * - 엘릭서: 어패류 1개 + 불우렁쉥이 1개 + 유리병 3개 + 엔드 블록 → 엘릭서 1개
 * - 영약: 엘릭서 2종 + 말린 켈프 5개 + 발광 열매 2개 + 죽은 산호 블록 → 영약 1개
 * 
 * 주의: 3성은 엘릭서가 1개씩 제작됨 (정수/에센스와 다름)
 *************************************************/

import { GOLD_PRICES, POTION_TO_ELIXIR_3STAR } from './ocean-config.js';
import { 
    getPremiumRate, getPremiumText, getInputNumber, updateText, 
    isAdvancedMode, getElement, createMaterialCardsHTML, createMaterialTextHTML
} from './ocean-utils.js';
import { setupAdvancedToggle } from './ocean-ui.js';

let lastResult = null;

/**
 * 3성 계산 메인 함수
 */
function calculate(input) {
    const isAdvanced = Number.isFinite(input.potionImmortal) && input.potionImmortal >= 0;

    const totalFish = {
        guard: input.guard || 0,
        wave: input.wave || 0,
        chaos: input.chaos || 0,
        life: input.life || 0,
        decay: input.decay || 0
    };

    const totalElix = {
        guard: (input.elixGuard || 0),
        wave: (input.elixWave || 0),
        chaos: (input.elixChaos || 0),
        life: (input.elixLife || 0),
        decay: (input.elixDecay || 0)
    };

    const totalPotion = isAdvanced ? {
        immortal: input.potionImmortal || 0,
        barrier: input.potionBarrier || 0,
        corrupt: input.potionCorrupt || 0,
        frenzy: input.potionFrenzy || 0,
        venom: input.potionVenom || 0
    } : { immortal: 0, barrier: 0, corrupt: 0, frenzy: 0, venom: 0 };

    // 최대 제작 가능 개수 계산
    const maxImmortal = totalPotion.immortal + Math.floor((totalFish.guard + totalElix.guard + totalFish.life + totalElix.life) / 2);
    const maxBarrier = totalPotion.barrier + Math.floor((totalFish.guard + totalElix.guard + totalFish.wave + totalElix.wave) / 2);
    const maxCorrupt = totalPotion.corrupt + Math.floor((totalFish.chaos + totalElix.chaos + totalFish.decay + totalElix.decay) / 2);
    const maxFrenzy = totalPotion.frenzy + Math.floor((totalFish.chaos + totalElix.chaos + totalFish.life + totalElix.life) / 2);
    const maxVenom = totalPotion.venom + Math.floor((totalFish.wave + totalElix.wave + totalFish.decay + totalElix.decay) / 2);

    const maxAqua = Math.min(maxImmortal, maxBarrier, maxVenom);
    const maxNautilus = Math.min(maxImmortal, maxBarrier, maxFrenzy);
    const maxSpine = Math.min(maxCorrupt, maxFrenzy, maxVenom);

    let best = { gold: -1, AQUA: 0, NAUTILUS: 0, SPINE: 0 };

    for (let AQUA = 0; AQUA <= maxAqua; AQUA++) {
        for (let NAUTILUS = 0; NAUTILUS <= maxNautilus; NAUTILUS++) {
            for (let SPINE = 0; SPINE <= maxSpine; SPINE++) {
                
                const needPotion = {
                    immortal: AQUA + NAUTILUS,
                    barrier: AQUA + NAUTILUS,
                    corrupt: SPINE,
                    frenzy: NAUTILUS + SPINE,
                    venom: AQUA + SPINE
                };
                
                const makePotion = {
                    immortal: Math.max(0, needPotion.immortal - totalPotion.immortal),
                    barrier: Math.max(0, needPotion.barrier - totalPotion.barrier),
                    corrupt: Math.max(0, needPotion.corrupt - totalPotion.corrupt),
                    frenzy: Math.max(0, needPotion.frenzy - totalPotion.frenzy),
                    venom: Math.max(0, needPotion.venom - totalPotion.venom)
                };

                // 엘릭서는 1개씩 제작되므로 그대로
                const needElix = {
                    guard: makePotion.immortal + makePotion.barrier,
                    wave: makePotion.barrier + makePotion.venom,
                    chaos: makePotion.corrupt + makePotion.frenzy,
                    life: makePotion.immortal + makePotion.frenzy,
                    decay: makePotion.corrupt + makePotion.venom
                };

                const makeFish = {
                    guard: Math.max(0, needElix.guard - totalElix.guard),
                    wave: Math.max(0, needElix.wave - totalElix.wave),
                    chaos: Math.max(0, needElix.chaos - totalElix.chaos),
                    life: Math.max(0, needElix.life - totalElix.life),
                    decay: Math.max(0, needElix.decay - totalElix.decay)
                };

                if (
                    makeFish.guard > totalFish.guard ||
                    makeFish.wave > totalFish.wave ||
                    makeFish.chaos > totalFish.chaos ||
                    makeFish.life > totalFish.life ||
                    makeFish.decay > totalFish.decay
                ) continue;

                const gold = AQUA * GOLD_PRICES['3star'].AQUA + NAUTILUS * GOLD_PRICES['3star'].NAUTILUS + SPINE * GOLD_PRICES['3star'].SPINE;
                if (gold > best.gold) {
                    best = { gold, AQUA, NAUTILUS, SPINE };
                }
            }
        }
    }

    if (best.gold < 0) return null;

    return buildResult(best, totalPotion, totalElix, isAdvanced);
}

/**
 * 결과 객체 생성
 * 3성 엘릭서는 1개씩 제작됨 (1성/2성 정수/에센스와 다름)
 */
function buildResult(best, totalPotion, totalElix, isAdvanced) {
    const potionNeed = {
        immortal: best.AQUA + best.NAUTILUS,
        barrier: best.AQUA + best.NAUTILUS,
        corrupt: best.SPINE,
        frenzy: best.NAUTILUS + best.SPINE,
        venom: best.AQUA + best.SPINE
    };

    const potionToMake = {
        immortal: Math.max(0, potionNeed.immortal - totalPotion.immortal),
        barrier: Math.max(0, potionNeed.barrier - totalPotion.barrier),
        corrupt: Math.max(0, potionNeed.corrupt - totalPotion.corrupt),
        frenzy: Math.max(0, potionNeed.frenzy - totalPotion.frenzy),
        venom: Math.max(0, potionNeed.venom - totalPotion.venom)
    };

    // 엘릭서는 1개씩 제작됨
    const elixNeedForPotion = {
        guard: potionToMake.immortal + potionToMake.barrier,
        wave: potionToMake.barrier + potionToMake.venom,
        chaos: potionToMake.corrupt + potionToMake.frenzy,
        life: potionToMake.immortal + potionToMake.frenzy,
        decay: potionToMake.corrupt + potionToMake.venom
    };

    const elixToMake = {
        guard: Math.max(0, elixNeedForPotion.guard - totalElix.guard),
        wave: Math.max(0, elixNeedForPotion.wave - totalElix.wave),
        chaos: Math.max(0, elixNeedForPotion.chaos - totalElix.chaos),
        life: Math.max(0, elixNeedForPotion.life - totalElix.life),
        decay: Math.max(0, elixNeedForPotion.decay - totalElix.decay)
    };

    const totalElixToMake = elixToMake.guard + elixToMake.wave + elixToMake.chaos + elixToMake.life + elixToMake.decay;
    const totalPotionToMake = potionToMake.immortal + potionToMake.barrier + potionToMake.corrupt + potionToMake.frenzy + potionToMake.venom;

    // 재료 필요량 (엘릭서 1개당 어패류 1개, 불우렁쉥이 1개, 유리병 3개)
    const materialNeed = {
        seaSquirt: totalElixToMake,                    // 불우렁쉥이
        glassBottle: totalElixToMake * 3,              // 유리병
        driedKelp: totalPotionToMake * 5,              // 말린 켈프 (영약당 5개)
        glowBerry: totalPotionToMake * 2               // 발광 열매
    };

    // 어패류 필요량 (엘릭서 1개당 1개)
    const fishNeed = {
        guard: elixToMake.guard,
        wave: elixToMake.wave,
        chaos: elixToMake.chaos,
        life: elixToMake.life,
        decay: elixToMake.decay
    };

    // 엔드 블록 (엘릭서 제작용) - 엘릭서 1개당 1개
    const endBlockNeed = {
        endStone: elixToMake.guard,                    // 엔드 돌 (수호)
        endStoneBrick: elixToMake.wave,                // 엔드 석재 벽돌 (파동)
        chorusFruit: elixToMake.chaos * 4,             // 후렴과 (혼란)
        poppedChorusFruit: elixToMake.life * 4,        // 튀긴 후렴과 (생명)
        purpurBlock: elixToMake.decay                  // 퍼퍼 블록 (부식)
    };

    // 죽은 산호 블록 (영약 제작용) - 영약 1개당 1개
    const deadCoralNeed = {
        deadTubeCoral: potionToMake.immortal,          // 죽은 관 산호 블록 (불멸 재생)
        deadBrainCoral: potionToMake.barrier,          // 죽은 사방산호 블록 (파동 장벽)
        deadBubbleCoral: potionToMake.corrupt,         // 죽은 거품 산호 블록 (타락 침식)
        deadFireCoral: potionToMake.frenzy,            // 죽은 불 산호 블록 (생명 광란)
        deadHornCoral: potionToMake.venom              // 죽은 뇌 산호 블록 (맹독 파동)
    };

    // 전체 필요량 (세트 모드용)
    const elixNeedTotal = {
        guard: potionNeed.immortal + potionNeed.barrier,
        wave: potionNeed.barrier + potionNeed.venom,
        chaos: potionNeed.corrupt + potionNeed.frenzy,
        life: potionNeed.immortal + potionNeed.frenzy,
        decay: potionNeed.corrupt + potionNeed.venom
    };

    const totalElixNeed = elixNeedTotal.guard + elixNeedTotal.wave + elixNeedTotal.chaos + elixNeedTotal.life + elixNeedTotal.decay;
    const totalPotionNeed = potionNeed.immortal + potionNeed.barrier + potionNeed.corrupt + potionNeed.frenzy + potionNeed.venom;

    const materialNeedTotal = {
        seaSquirt: totalElixNeed,
        glassBottle: totalElixNeed * 3,
        driedKelp: totalPotionNeed * 5,
        glowBerry: totalPotionNeed * 2
    };

    const fishNeedTotal = {
        guard: elixNeedTotal.guard,
        wave: elixNeedTotal.wave,
        chaos: elixNeedTotal.chaos,
        life: elixNeedTotal.life,
        decay: elixNeedTotal.decay
    };

    const endBlockNeedTotal = {
        endStone: elixNeedTotal.guard,
        endStoneBrick: elixNeedTotal.wave,
        chorusFruit: elixNeedTotal.chaos * 4,
        poppedChorusFruit: elixNeedTotal.life * 4,
        purpurBlock: elixNeedTotal.decay
    };

    const deadCoralNeedTotal = {
        deadTubeCoral: potionNeed.immortal,
        deadBrainCoral: potionNeed.barrier,
        deadBubbleCoral: potionNeed.corrupt,
        deadFireCoral: potionNeed.frenzy,
        deadHornCoral: potionNeed.venom
    };

    return { 
        best,
        potionNeed, potionToMake,
        elixNeedTotal, elixToMake,
        materialNeed, materialNeedTotal,
        fishNeed, fishNeedTotal,
        endBlockNeed, endBlockNeedTotal,
        deadCoralNeed, deadCoralNeedTotal,
        isAdvancedMode: isAdvanced
    };
}

/**
 * 결과 업데이트
 */
function updateResult(result) {
    if (!result) return;

    const rate = getPremiumRate();
    updateText("result-gold-3", Math.floor(result.best.gold * (1 + rate)).toLocaleString());
    updateText("result-premium-bonus-3", getPremiumText(rate));
    updateText("result-aqua-3", result.best.AQUA);
    updateText("result-nautilus-3", result.best.NAUTILUS);
    updateText("result-spine-3", result.best.SPINE);

    const advanced = result.isAdvancedMode;
    const elixData = advanced ? result.elixToMake : result.elixNeedTotal;
    const potionData = advanced ? result.potionToMake : result.potionNeed;
    const materialData = advanced ? result.materialNeed : result.materialNeedTotal;
    const fishData = advanced ? result.fishNeed : result.fishNeedTotal;
    const endBlockData = advanced ? result.endBlockNeed : result.endBlockNeedTotal;
    const deadCoralData = advanced ? result.deadCoralNeed : result.deadCoralNeedTotal;

    // 엘릭서
    document.getElementById("result-essence-3").innerHTML = createMaterialCardsHTML([
        { icon: 'elixir-guard', name: '수호 엘릭서', value: elixData.guard || 0 },
        { icon: 'elixir-wave', name: '파동 엘릭서', value: elixData.wave || 0 },
        { icon: 'elixir-chaos', name: '혼란 엘릭서', value: elixData.chaos || 0 },
        { icon: 'elixir-life', name: '생명 엘릭서', value: elixData.life || 0 },
        { icon: 'elixir-decay', name: '부식 엘릭서', value: elixData.decay || 0 }
    ]);

    // 영약
    document.getElementById("result-core-3").innerHTML = createMaterialCardsHTML([
        { icon: 'potion-immortal', name: '불멸 재생', value: potionData.immortal || 0 },
        { icon: 'potion-barrier', name: '파동 장벽', value: potionData.barrier || 0 },
        { icon: 'potion-corrupt', name: '타락 침식', value: potionData.corrupt || 0 },
        { icon: 'potion-frenzy', name: '생명 광란', value: potionData.frenzy || 0 },
        { icon: 'potion-venom', name: '맹독 파동', value: potionData.venom || 0 }
    ]);

    // 재료 (불우렁쉥이, 유리병, 말린 켈프, 발광 열매)
    document.getElementById("result-material-3").innerHTML = createMaterialTextHTML([
        { name: '불우렁쉥이', value: materialData.seaSquirt },
        { name: '유리병', value: materialData.glassBottle },
        { name: '말린 켈프', value: materialData.driedKelp },
        { name: '발광 열매', value: materialData.glowBerry }
    ]);

    // 어패류 (3성)
    const fishSection = document.getElementById("result-fish-3");
    if (fishSection) {
        fishSection.innerHTML = createMaterialTextHTML([
            { name: '굴 ★★★', value: fishData.guard || 0 },
            { name: '소라 ★★★', value: fishData.wave || 0 },
            { name: '문어 ★★★', value: fishData.chaos || 0 },
            { name: '미역 ★★★', value: fishData.life || 0 },
            { name: '성게 ★★★', value: fishData.decay || 0 }
        ]);
    }

    // 엔드 블록 (엘릭서 제작용)
    document.getElementById("result-block-3").innerHTML = createMaterialTextHTML([
        { name: '엔드 돌', value: endBlockData.endStone },
        { name: '엔드 석재 벽돌', value: endBlockData.endStoneBrick },
        { name: '후렴과', value: endBlockData.chorusFruit },
        { name: '튀긴 후렴과', value: endBlockData.poppedChorusFruit },
        { name: '퍼퍼 블록', value: endBlockData.purpurBlock }
    ]);

    // 죽은 산호 블록 (영약 제작용)
    document.getElementById("result-flower-3").innerHTML = createMaterialTextHTML([
        { name: '죽은 관 산호', value: deadCoralData.deadTubeCoral },
        { name: '죽은 사방산호', value: deadCoralData.deadBrainCoral },
        { name: '죽은 거품 산호', value: deadCoralData.deadBubbleCoral },
        { name: '죽은 불 산호', value: deadCoralData.deadFireCoral },
        { name: '죽은 뇌 산호', value: deadCoralData.deadHornCoral }
    ]);

    const resultCard = getElement("result-card-3");
    if (resultCard) resultCard.style.display = "block";

    lastResult = result;
}

/**
 * 실행 함수
 */
export function run() {
    const advanced = isAdvancedMode();

    const input = {
        guard: getInputNumber("input-oyster-3"),
        wave: getInputNumber("input-conch-3"),
        chaos: getInputNumber("input-octopus-3"),
        life: getInputNumber("input-seaweed-3"),
        decay: getInputNumber("input-urchin-3")
    };

    if (advanced) {
        input.elixGuard = getInputNumber("input-elixir-guard-3");
        input.elixWave = getInputNumber("input-elixir-wave-3");
        input.elixChaos = getInputNumber("input-elixir-chaos-3");
        input.elixLife = getInputNumber("input-elixir-life-3");
        input.elixDecay = getInputNumber("input-elixir-decay-3");

        input.potionImmortal = getInputNumber("input-potion-immortal-3");
        input.potionBarrier = getInputNumber("input-potion-barrier-3");
        input.potionCorrupt = getInputNumber("input-potion-corrupt-3");
        input.potionFrenzy = getInputNumber("input-potion-frenzy-3");
        input.potionVenom = getInputNumber("input-potion-venom-3");
    } else {
        input.elixGuard = input.elixWave = input.elixChaos = input.elixLife = input.elixDecay = 0;
        input.potionImmortal = input.potionBarrier = input.potionCorrupt = input.potionFrenzy = input.potionVenom = 0;
    }

    const result = calculate(input);
    if (!result) {
        alert("재료 부족");
        return;
    }

    updateResult(result);
}

/**
 * 재업데이트
 */
export function refresh() {
    if (lastResult) updateResult(lastResult);
}

/**
 * 초기화
 */
export function init() {
    setupAdvancedToggle(3);
}

// 전역 함수로 노출
window.run3StarOptimization = run;
/*************************************************
 * 2성 계산기 - 최적화 버전 (2025년 업데이트)
 * 
 * 조합법 변경사항:
 * - 에센스: 어패류 2개 + 해초 2개 + 네더 블록 → 에센스 2개 (2개 단위 제작)
 * - 결정: 먹물 주머니 → 켈프 3개
 *************************************************/

import { GOLD_PRICES } from './ocean-config.js';
import { 
    getPremiumRate, getPremiumText, getInputNumber, updateText, 
    isAdvancedMode, getElement, createMaterialCardsHTML, createMaterialTextHTML
} from './ocean-utils.js';
import { setupAdvancedToggle } from './ocean-ui.js';

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
 * 2성 계산 메인 함수
 */
function calculate(input) {
    const isAdvanced = input.isAdvancedMode || false;

    // 보유 어패류 (2성)
    const totalShellfish = {
        guard: input.guard2 || 0,
        wave: input.wave2 || 0,
        chaos: input.chaos2 || 0,
        life: input.life2 || 0,
        decay: input.decay2 || 0
    };

    // 보유 에센스
    const totalEss = {
        guard: (input.essGuard || 0),
        wave: (input.essWave || 0),
        chaos: (input.essChaos || 0),
        life: (input.essLife || 0),
        decay: (input.essDecay || 0)
    };

    // 보유 결정
    const totalCrystal = isAdvanced ? {
        vital: input.crystalVital || 0,
        erosion: input.crystalErosion || 0,
        defense: input.crystalDefense || 0,
        regen: input.crystalRegen || 0,
        poison: input.crystalPoison || 0
    } : { vital: 0, erosion: 0, defense: 0, regen: 0, poison: 0 };

    // 어패류로 만들 수 있는 에센스 (2개 단위로 내림 → 2개씩 생성)
    const essFromShellfish = {
        guard: floorToTwo(totalShellfish.guard),
        wave: floorToTwo(totalShellfish.wave),
        chaos: floorToTwo(totalShellfish.chaos),
        life: floorToTwo(totalShellfish.life),
        decay: floorToTwo(totalShellfish.decay)
    };

    // 실제 사용 가능한 총 에센스
    const availableEss = {
        guard: totalEss.guard + essFromShellfish.guard,
        wave: totalEss.wave + essFromShellfish.wave,
        chaos: totalEss.chaos + essFromShellfish.chaos,
        life: totalEss.life + essFromShellfish.life,
        decay: totalEss.decay + essFromShellfish.decay
    };

    let best = { gold: -1, CORE: 0, POTION: 0, WING: 0 };

    // 최대 제작 가능 개수 추정 (상한선)
    const maxProducts = Math.floor(
        (availableEss.guard + availableEss.wave + availableEss.chaos + 
         availableEss.life + availableEss.decay + 
         totalCrystal.vital + totalCrystal.erosion + totalCrystal.defense + 
         totalCrystal.regen + totalCrystal.poison) / 3
    ) + 1;

    for (let CORE = 0; CORE <= maxProducts; CORE++) {
        for (let POTION = 0; POTION <= maxProducts; POTION++) {
            for (let WING = 0; WING <= maxProducts; WING++) {
                // 필요한 결정 개수
                const needCrystal = {
                    vital: CORE + WING,
                    erosion: CORE + POTION,
                    defense: WING,
                    regen: CORE + POTION,
                    poison: POTION + WING
                };

                // 제작해야 할 결정 개수
                const makeCrystal = {
                    vital: Math.max(0, needCrystal.vital - totalCrystal.vital),
                    erosion: Math.max(0, needCrystal.erosion - totalCrystal.erosion),
                    defense: Math.max(0, needCrystal.defense - totalCrystal.defense),
                    regen: Math.max(0, needCrystal.regen - totalCrystal.regen),
                    poison: Math.max(0, needCrystal.poison - totalCrystal.poison)
                };

                // 결정 제작에 필요한 에센스
                const needEss = {
                    guard: makeCrystal.vital + makeCrystal.defense,
                    wave: makeCrystal.erosion + makeCrystal.regen,
                    chaos: makeCrystal.defense + makeCrystal.poison,
                    life: makeCrystal.vital + makeCrystal.regen,
                    decay: makeCrystal.erosion + makeCrystal.poison
                };

                // 에센스가 충분한지 체크
                if (needEss.guard > availableEss.guard ||
                    needEss.wave > availableEss.wave ||
                    needEss.chaos > availableEss.chaos ||
                    needEss.life > availableEss.life ||
                    needEss.decay > availableEss.decay) {
                    continue;
                }

                const gold = CORE * GOLD_PRICES['2star'].CORE + POTION * GOLD_PRICES['2star'].POTION + WING * GOLD_PRICES['2star'].WING;
                if (gold > best.gold) {
                    best = { gold, CORE, POTION, WING };
                }
            }
        }
    }

    if (best.gold < 0) return null;

    return buildResult(best, totalCrystal, totalEss, totalShellfish, availableEss, isAdvanced);
}

/**
 * 결과 객체 생성 (2개 단위 제작 반영)
 */
function buildResult(best, totalCrystal, totalEss, totalShellfish, availableEss, isAdvanced) {
    const crystalNeed = {
        vital: best.CORE + best.WING,
        erosion: best.CORE + best.POTION,
        defense: best.WING,
        regen: best.CORE + best.POTION,
        poison: best.POTION + best.WING
    };

    const crystalToMake = {
        vital: Math.max(0, crystalNeed.vital - totalCrystal.vital),
        erosion: Math.max(0, crystalNeed.erosion - totalCrystal.erosion),
        defense: Math.max(0, crystalNeed.defense - totalCrystal.defense),
        regen: Math.max(0, crystalNeed.regen - totalCrystal.regen),
        poison: Math.max(0, crystalNeed.poison - totalCrystal.poison)
    };

    // 결정 제작에 필요한 에센스
    const essNeedForCrystal = {
        guard: crystalToMake.vital + crystalToMake.defense,
        wave: crystalToMake.erosion + crystalToMake.regen,
        chaos: crystalToMake.defense + crystalToMake.poison,
        life: crystalToMake.vital + crystalToMake.regen,
        decay: crystalToMake.erosion + crystalToMake.poison
    };

    // 보유 에센스에서 부족한 만큼 제작 필요
    const essToMake = {
        guard: Math.max(0, essNeedForCrystal.guard - totalEss.guard),
        wave: Math.max(0, essNeedForCrystal.wave - totalEss.wave),
        chaos: Math.max(0, essNeedForCrystal.chaos - totalEss.chaos),
        life: Math.max(0, essNeedForCrystal.life - totalEss.life),
        decay: Math.max(0, essNeedForCrystal.decay - totalEss.decay)
    };

    // 제작 횟수 계산 (2개씩 나오므로)
    const essCraftCount = {
        guard: Math.ceil(essToMake.guard / 2),
        wave: Math.ceil(essToMake.wave / 2),
        chaos: Math.ceil(essToMake.chaos / 2),
        life: Math.ceil(essToMake.life / 2),
        decay: Math.ceil(essToMake.decay / 2)
    };

    const totalCrystalToMake = crystalToMake.vital + crystalToMake.erosion + crystalToMake.defense + crystalToMake.regen + crystalToMake.poison;
    const totalEssCraftCount = essCraftCount.guard + essCraftCount.wave + essCraftCount.chaos + essCraftCount.life + essCraftCount.decay;

    // 재료 필요량 (제작 횟수 기준)
    const materialNeed = {
        seaweed: totalEssCraftCount * 2,
        kelp: totalCrystalToMake * 3,
        netherrack: essCraftCount.guard * 8,
        magmaBlock: essCraftCount.wave * 4,
        soulSoil: essCraftCount.chaos * 4,
        crimsonStem: essCraftCount.life * 2,
        warpedStem: essCraftCount.decay * 2,
        lapisBlock: crystalToMake.vital,
        redstoneBlock: crystalToMake.erosion,
        ironIngot: crystalToMake.defense,
        goldIngot: crystalToMake.regen,
        diamond: crystalToMake.poison
    };

    // 전체 필요량 (세트 모드용)
    const essNeedTotal = {
        guard: crystalNeed.vital + crystalNeed.defense,
        wave: crystalNeed.erosion + crystalNeed.regen,
        chaos: crystalNeed.defense + crystalNeed.poison,
        life: crystalNeed.vital + crystalNeed.regen,
        decay: crystalNeed.erosion + crystalNeed.poison
    };

    const essCraftCountTotal = {
        guard: Math.ceil(essNeedTotal.guard / 2),
        wave: Math.ceil(essNeedTotal.wave / 2),
        chaos: Math.ceil(essNeedTotal.chaos / 2),
        life: Math.ceil(essNeedTotal.life / 2),
        decay: Math.ceil(essNeedTotal.decay / 2)
    };

    const totalCrystalNeed = crystalNeed.vital + crystalNeed.erosion + crystalNeed.defense + crystalNeed.regen + crystalNeed.poison;
    const totalEssCraftCountTotal = essCraftCountTotal.guard + essCraftCountTotal.wave + essCraftCountTotal.chaos + essCraftCountTotal.life + essCraftCountTotal.decay;

    const materialNeedTotal = {
        seaweed: totalEssCraftCountTotal * 2,
        kelp: totalCrystalNeed * 3,
        netherrack: essCraftCountTotal.guard * 8,
        magmaBlock: essCraftCountTotal.wave * 4,
        soulSoil: essCraftCountTotal.chaos * 4,
        crimsonStem: essCraftCountTotal.life * 2,
        warpedStem: essCraftCountTotal.decay * 2,
        lapisBlock: crystalNeed.vital,
        redstoneBlock: crystalNeed.erosion,
        ironIngot: crystalNeed.defense,
        goldIngot: crystalNeed.regen,
        diamond: crystalNeed.poison
    };

    return { 
        best, 
        crystalNeed, crystalToMake,
        essNeedTotal, essNeedForCrystal, essToMake,
        materialNeed, materialNeedTotal,
        isAdvancedMode: isAdvanced
    };
}

/**
 * 결과 업데이트
 */
function updateResult(result) {
    if (!result) return;

    const rate = getPremiumRate();
    updateText("result-gold-2", Math.floor(result.best.gold * (1 + rate)).toLocaleString());
    updateText("result-premium-bonus-2", getPremiumText(rate));
    updateText("result-acutis-2", result.best.CORE);
    updateText("result-frenzy-2", result.best.POTION);
    updateText("result-feather-2", result.best.WING);

    const advanced = result.isAdvancedMode;
    const essData = advanced ? result.essToMake : result.essNeedTotal;
    const crystalData = advanced ? result.crystalToMake : result.crystalNeed;
    const materialData = advanced ? result.materialNeed : result.materialNeedTotal;

    // 에센스
    document.getElementById("result-essence-2").innerHTML = createMaterialCardsHTML([
        { icon: 'essence_guard_2', name: '수호 에센스', value: essData.guard || 0 },
        { icon: 'essence_wave_2', name: '파동 에센스', value: essData.wave || 0 },
        { icon: 'essence_chaos_2', name: '혼란 에센스', value: essData.chaos || 0 },
        { icon: 'essence_life_2', name: '생명 에센스', value: essData.life || 0 },
        { icon: 'essence_decay_2', name: '부식 에센스', value: essData.decay || 0 }
    ]);

    // 결정
    document.getElementById("result-core-2").innerHTML = createMaterialCardsHTML([
        { icon: 'crystal_vital', name: '활기 보존', value: crystalData.vital || 0 },
        { icon: 'crystal_erosion', name: '파도 침식', value: crystalData.erosion || 0 },
        { icon: 'crystal_defense', name: '방어 오염', value: crystalData.defense || 0 },
        { icon: 'crystal_regen', name: '격류 재생', value: crystalData.regen || 0 },
        { icon: 'crystal_poison', name: '맹독 혼란', value: crystalData.poison || 0 }
    ]);

    // 재료 (해초, 켈프)
    document.getElementById("result-material-2").innerHTML = createMaterialTextHTML([
        { name: '해초', value: materialData.seaweed || 0 },
        { name: '켈프', value: materialData.kelp || 0 }
    ]);

    // 네더 블록 (에센스 제작용)
    document.getElementById("result-coral-2").innerHTML = createMaterialTextHTML([
        { name: '네더랙', value: materialData.netherrack || 0 },
        { name: '마그마 블록', value: materialData.magmaBlock || 0 },
        { name: '영혼 흙', value: materialData.soulSoil || 0 },
        { name: '진홍빛 자루', value: materialData.crimsonStem || 0 },
        { name: '뒤틀린 자루', value: materialData.warpedStem || 0 }
    ]);

    // 광물 (결정 제작용)
    document.getElementById("result-extra-2").innerHTML = createMaterialTextHTML([
        { name: '청금석 블록', value: materialData.lapisBlock || 0 },
        { name: '레드스톤 블록', value: materialData.redstoneBlock || 0 },
        { name: '철 주괴', value: materialData.ironIngot || 0 },
        { name: '금 주괴', value: materialData.goldIngot || 0 },
        { name: '다이아몬드', value: materialData.diamond || 0 }
    ]);

    const resultCard = getElement("result-card-2");
    if (resultCard) resultCard.style.display = 'block';
    
    lastResult = result;
}

/**
 * 실행 함수
 */
export function run() {
    const advanced = isAdvancedMode();

    const input = {
        guard2: getInputNumber("input-guard-2"),
        wave2: getInputNumber("input-wave-2"),
        chaos2: getInputNumber("input-chaos-2"),
        life2: getInputNumber("input-life-2"),
        decay2: getInputNumber("input-decay-2"),
        isAdvancedMode: advanced
    };

    if (advanced) {
        input.essGuard = getInputNumber("input-essence-guard-2");
        input.essWave = getInputNumber("input-essence-wave-2");
        input.essChaos = getInputNumber("input-essence-chaos-2");
        input.essLife = getInputNumber("input-essence-life-2");
        input.essDecay = getInputNumber("input-essence-decay-2");

        input.crystalVital = getInputNumber("input-crystal-vital-2");
        input.crystalErosion = getInputNumber("input-crystal-erosion-2");
        input.crystalDefense = getInputNumber("input-crystal-defense-2");
        input.crystalRegen = getInputNumber("input-crystal-regen-2");
        input.crystalPoison = getInputNumber("input-crystal-poison-2");
    }

    const result = calculate(input);
    
    if (!result) {
        alert("재료가 부족합니다");
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
    setupAdvancedToggle(2);
}

// 전역 함수로 노출
window.run2StarOptimization = run;
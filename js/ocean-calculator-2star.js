/*************************************************
 * 2성 계산기 - 최적화 버전 (2025년 업데이트)
 * 
 * 조합법 변경사항:
 * - 에센스: 어패류 2개 + 해초 2개 + 네더 블록 → 에센스 2개
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
 * 2성 계산 메인 함수
 */
function calculate(input) {
    const isAdvanced = input.isAdvancedMode || false;

    const totalFish = {
        guard: input.guard2 || 0,
        wave: input.wave2 || 0,
        chaos: input.chaos2 || 0,
        life: input.life2 || 0,
        decay: input.decay2 || 0
    };

    const totalEss = {
        guard: (input.essGuard || 0),
        wave: (input.essWave || 0),
        chaos: (input.essChaos || 0),
        life: (input.essLife || 0),
        decay: (input.essDecay || 0)
    };

    const totalCrystal = isAdvanced ? {
        vital: input.crystalVital || 0,
        erosion: input.crystalErosion || 0,
        defense: input.crystalDefense || 0,
        regen: input.crystalRegen || 0,
        poison: input.crystalPoison || 0
    } : { vital: 0, erosion: 0, defense: 0, regen: 0, poison: 0 };

    // 최대 제작 가능 개수 계산
    const maxCore_vital = totalCrystal.vital + Math.floor((totalFish.guard + totalEss.guard + totalFish.life + totalEss.life) / 2);
    const maxCore_erosion = totalCrystal.erosion + Math.floor((totalFish.wave + totalEss.wave + totalFish.decay + totalEss.decay) / 2);
    const maxCore_regen = totalCrystal.regen + Math.floor((totalFish.wave + totalEss.wave + totalFish.life + totalEss.life) / 2);
    const maxCore = Math.min(maxCore_vital, maxCore_erosion, maxCore_regen);

    const maxPotion_erosion = totalCrystal.erosion + Math.floor((totalFish.wave + totalEss.wave + totalFish.decay + totalEss.decay) / 2);
    const maxPotion_regen = totalCrystal.regen + Math.floor((totalFish.wave + totalEss.wave + totalFish.life + totalEss.life) / 2);
    const maxPotion_poison = totalCrystal.poison + Math.floor((totalFish.chaos + totalEss.chaos + totalFish.decay + totalEss.decay) / 2);
    const maxPotion = Math.min(maxPotion_erosion, maxPotion_regen, maxPotion_poison);

    const maxWing_vital = totalCrystal.vital + Math.floor((totalFish.guard + totalEss.guard + totalFish.life + totalEss.life) / 2);
    const maxWing_defense = totalCrystal.defense + Math.floor((totalFish.guard + totalEss.guard + totalFish.chaos + totalEss.chaos) / 2);
    const maxWing_poison = totalCrystal.poison + Math.floor((totalFish.chaos + totalEss.chaos + totalFish.decay + totalEss.decay) / 2);
    const maxWing = Math.min(maxWing_vital, maxWing_defense, maxWing_poison);

    let best = { gold: -1, CORE: 0, POTION: 0, WING: 0 };

    for (let CORE = 0; CORE <= maxCore; CORE++) {
        for (let POTION = 0; POTION <= maxPotion; POTION++) {
            for (let WING = 0; WING <= maxWing; WING++) {
                const needCrystal = {
                    vital: CORE * 1 + WING * 1,
                    erosion: CORE * 1 + POTION * 1,
                    defense: WING * 1,
                    regen: CORE * 1 + POTION * 1,
                    poison: POTION * 1 + WING * 1
                };

                const makeCrystal = {
                    vital: Math.max(0, needCrystal.vital - totalCrystal.vital),
                    erosion: Math.max(0, needCrystal.erosion - totalCrystal.erosion),
                    defense: Math.max(0, needCrystal.defense - totalCrystal.defense),
                    regen: Math.max(0, needCrystal.regen - totalCrystal.regen),
                    poison: Math.max(0, needCrystal.poison - totalCrystal.poison)
                };

                const needEss = {
                    guard: makeCrystal.vital + makeCrystal.defense,
                    wave: makeCrystal.erosion + makeCrystal.regen,
                    chaos: makeCrystal.defense + makeCrystal.poison,
                    life: makeCrystal.vital + makeCrystal.regen,
                    decay: makeCrystal.erosion + makeCrystal.poison
                };

                const makeFish = {
                    guard: Math.max(0, needEss.guard - totalEss.guard),
                    wave: Math.max(0, needEss.wave - totalEss.wave),
                    chaos: Math.max(0, needEss.chaos - totalEss.chaos),
                    life: Math.max(0, needEss.life - totalEss.life),
                    decay: Math.max(0, needEss.decay - totalEss.decay)
                };

                if (
                    makeFish.guard > totalFish.guard ||
                    makeFish.wave > totalFish.wave ||
                    makeFish.chaos > totalFish.chaos ||
                    makeFish.life > totalFish.life ||
                    makeFish.decay > totalFish.decay
                ) continue;

                const gold = CORE * GOLD_PRICES['2star'].CORE + POTION * GOLD_PRICES['2star'].POTION + WING * GOLD_PRICES['2star'].WING;
                if (gold > best.gold) {
                    best = { gold, CORE, POTION, WING };
                }
            }
        }
    }

    if (best.gold < 0) return null;

    return buildResult(best, totalCrystal, totalEss, isAdvanced);
}

/**
 * 결과 객체 생성 (조합법 변경 반영)
 */
function buildResult(best, totalCrystal, totalEss, isAdvanced) {
    const crystalNeed = {
        vital: best.CORE * 1 + best.WING * 1,
        erosion: best.CORE * 1 + best.POTION * 1,
        defense: best.WING * 1,
        regen: best.CORE * 1 + best.POTION * 1,
        poison: best.POTION * 1 + best.WING * 1
    };

    const crystalToMake = {
        vital: Math.max(0, crystalNeed.vital - totalCrystal.vital),
        erosion: Math.max(0, crystalNeed.erosion - totalCrystal.erosion),
        defense: Math.max(0, crystalNeed.defense - totalCrystal.defense),
        regen: Math.max(0, crystalNeed.regen - totalCrystal.regen),
        poison: Math.max(0, crystalNeed.poison - totalCrystal.poison)
    };

    const essNeedForCrystal = {
        guard: crystalToMake.vital + crystalToMake.defense,
        wave: crystalToMake.erosion + crystalToMake.regen,
        chaos: crystalToMake.defense + crystalToMake.poison,
        life: crystalToMake.vital + crystalToMake.regen,
        decay: crystalToMake.erosion + crystalToMake.poison
    };

    const essToMake = {
        guard: Math.max(0, essNeedForCrystal.guard - totalEss.guard),
        wave: Math.max(0, essNeedForCrystal.wave - totalEss.wave),
        chaos: Math.max(0, essNeedForCrystal.chaos - totalEss.chaos),
        life: Math.max(0, essNeedForCrystal.life - totalEss.life),
        decay: Math.max(0, essNeedForCrystal.decay - totalEss.decay)
    };

    // 재료 필요량 (조합법 변경 반영)
    // 에센스 제작: 해초 2개 + 네더 블록
    // 결정 제작: 켈프 3개 + 광물
    const totalCrystalToMake = crystalToMake.vital + crystalToMake.erosion + crystalToMake.defense + crystalToMake.regen + crystalToMake.poison;
    const totalEssToMake = essToMake.guard + essToMake.wave + essToMake.chaos + essToMake.life + essToMake.decay;

    const materialNeed = {
        seaweed: totalEssToMake * 2,       // 해초 (에센스당 2개)
        kelp: totalCrystalToMake * 3,      // 켈프 (결정당 3개)
        netherrack: essToMake.guard * 8,   // 네더랙
        magmaBlock: essToMake.wave * 4,    // 마그마 블록
        soulSoil: essToMake.chaos * 4,     // 영혼 흙
        crimsonStem: essToMake.life * 2,   // 진홍빛 자루
        warpedStem: essToMake.decay * 2,   // 뒤틀린 자루
        lapisBlock: crystalToMake.vital,   // 청금석 블록
        redstoneBlock: crystalToMake.erosion, // 레드스톤 블록
        ironIngot: crystalToMake.defense,  // 철 주괴
        goldIngot: crystalToMake.regen,    // 금 주괴
        diamond: crystalToMake.poison      // 다이아몬드
    };

    const essNeedTotal = {
        guard: crystalNeed.vital + crystalNeed.defense,
        wave: crystalNeed.erosion + crystalNeed.regen,
        chaos: crystalNeed.defense + crystalNeed.poison,
        life: crystalNeed.vital + crystalNeed.regen,
        decay: crystalNeed.erosion + crystalNeed.poison
    };

    const totalCrystalNeed = crystalNeed.vital + crystalNeed.erosion + crystalNeed.defense + crystalNeed.regen + crystalNeed.poison;
    const totalEssNeed = essNeedTotal.guard + essNeedTotal.wave + essNeedTotal.chaos + essNeedTotal.life + essNeedTotal.decay;

    const materialNeedTotal = {
        seaweed: totalEssNeed * 2,
        kelp: totalCrystalNeed * 3,
        netherrack: essNeedTotal.guard * 8,
        magmaBlock: essNeedTotal.wave * 4,
        soulSoil: essNeedTotal.chaos * 4,
        crimsonStem: essNeedTotal.life * 2,
        warpedStem: essNeedTotal.decay * 2,
        lapisBlock: crystalNeed.vital,
        redstoneBlock: crystalNeed.erosion,
        ironIngot: crystalNeed.defense,
        goldIngot: crystalNeed.regen,
        diamond: crystalNeed.poison
    };

    return { 
        best, 
        crystalNeed, crystalToMake,
        essNeedTotal, essToMake,
        materialNeed, materialNeedTotal,
        isAdvancedMode: isAdvanced
    };
}

/**
 * 결과 업데이트 (조합법 변경 반영)
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
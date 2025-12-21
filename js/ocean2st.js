/*************************************************
 * 2️⃣ 2성 계산기 (ocean2st.js) - 성능 최적화 버전
 *************************************************/

document.addEventListener('DOMContentLoaded', () => {

    // ===== 상수 정의 =====
    const GOLD_2STAR = { CORE: 7413, POTION: 7487, WING: 7592 };
    
    const CRYSTAL_TO_ESSENCE = {
        vital:   { guard: 1, life: 1 },
        erosion: { wave: 1, decay: 1 },
        defense: { guard: 1, chaos: 1 },
        regen:   { wave: 1, life: 1 },
        poison:  { chaos: 1, decay: 1 }
    };
    
    const ESSENCE_TO_MATERIAL = {
        guard: { seaweed: 2, coral_guard: 1 },
        wave: { seaweed: 2, coral_wave: 1 },
        chaos: { seaweed: 2, coral_chaos: 1 },
        life: { seaweed: 2, coral_life: 1 },
        decay: { seaweed: 2, coral_decay: 1 }
    };
    
    const CRYSTAL_TO_MATERIAL = {
        vital: { ink: 1, mineral_lapis: 1 },
        erosion: { ink: 1, mineral_redstone: 1 },
        defense: { ink: 1, mineral_iron: 1 },
        regen: { ink: 1, mineral_gold: 1 },
        poison: { ink: 1, mineral_diamond: 1 }
    };

    const ITEM_TO_CRYSTAL = {
        CORE: { vital: 1, erosion: 1, regen: 1 },
        POTION: { erosion: 1, regen: 1, poison: 1 },
        WING: { vital: 1, defense: 1, poison: 1 }
    };

    const SET_COUNT = 64;
    const setSwitcher = document.getElementById('switcher-set');
    const advancedSwitcher = document.getElementById('switcher-advanced');
    const resultCard = document.getElementById("result-card-2");

    // ===== 유틸 함수 =====
    function formatSet(num) {
        const sets = Math.floor(num / SET_COUNT);
        const remainder = num % SET_COUNT;
        return `${sets} / ${remainder}`;
    }

    // ===== 고급 입력 모드 토글 =====
    if (advancedSwitcher) {
        advancedSwitcher.addEventListener('change', function() {
            const advancedInputs = document.getElementById('advanced-inputs-2');
            if (advancedInputs) {
                if (this.checked) {
                    advancedInputs.classList.add('active');
                } else {
                    advancedInputs.classList.remove('active');
                }
            }
            if (window.last2StarResult) update2StarResult(window.last2StarResult);
        });
    }

    // ===== 계산 함수 (최적화 버전) =====
    window.calculate2Star = function(input) {
        const isAdvancedMode = input.isAdvancedMode || false;

        // 1️⃣ 총 가용 자원
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

        const totalCrystal = isAdvancedMode ? {
            vital: input.crystalVital || 0,
            erosion: input.crystalErosion || 0,
            defense: input.crystalDefense || 0,
            regen: input.crystalRegen || 0,
            poison: input.crystalPoison || 0
        } : { vital: 0, erosion: 0, defense: 0, regen: 0, poison: 0 };

        // 2️⃣ 최대 제작 가능 개수 계산 (성능 최적화)
        
        // CORE: vital(guard+life) + erosion(wave+decay) + regen(wave+life)
        const maxCore_vital = totalCrystal.vital + Math.floor((totalFish.guard + totalEss.guard + totalFish.life + totalEss.life) / 2);
        const maxCore_erosion = totalCrystal.erosion + Math.floor((totalFish.wave + totalEss.wave + totalFish.decay + totalEss.decay) / 2);
        const maxCore_regen = totalCrystal.regen + Math.floor((totalFish.wave + totalEss.wave + totalFish.life + totalEss.life) / 2);
        const maxCore = Math.min(maxCore_vital, maxCore_erosion, maxCore_regen);

        // POTION: erosion(wave+decay) + regen(wave+life) + poison(chaos+decay)
        const maxPotion_erosion = totalCrystal.erosion + Math.floor((totalFish.wave + totalEss.wave + totalFish.decay + totalEss.decay) / 2);
        const maxPotion_regen = totalCrystal.regen + Math.floor((totalFish.wave + totalEss.wave + totalFish.life + totalEss.life) / 2);
        const maxPotion_poison = totalCrystal.poison + Math.floor((totalFish.chaos + totalEss.chaos + totalFish.decay + totalEss.decay) / 2);
        const maxPotion = Math.min(maxPotion_erosion, maxPotion_regen, maxPotion_poison);

        // WING: vital(guard+life) + defense(guard+chaos) + poison(chaos+decay)
        const maxWing_vital = totalCrystal.vital + Math.floor((totalFish.guard + totalEss.guard + totalFish.life + totalEss.life) / 2);
        const maxWing_defense = totalCrystal.defense + Math.floor((totalFish.guard + totalEss.guard + totalFish.chaos + totalEss.chaos) / 2);
        const maxWing_poison = totalCrystal.poison + Math.floor((totalFish.chaos + totalEss.chaos + totalFish.decay + totalEss.decay) / 2);
        const maxWing = Math.min(maxWing_vital, maxWing_defense, maxWing_poison);

        let best = { gold: -1, CORE: 0, POTION: 0, WING: 0 };

        // 3️⃣ 최적화된 루프 (실제 가능 범위만 탐색)
        for (let CORE = 0; CORE <= maxCore; CORE++) {
            for (let POTION = 0; POTION <= maxPotion; POTION++) {
                for (let WING = 0; WING <= maxWing; WING++) {
                    
                    // 필요한 결정
                    const needCrystal = {
                        vital: CORE * 1 + WING * 1,
                        erosion: CORE * 1 + POTION * 1,
                        defense: WING * 1,
                        regen: CORE * 1 + POTION * 1,
                        poison: POTION * 1 + WING * 1
                    };

                    // 제작할 결정
                    const makeCrystal = {
                        vital: Math.max(0, needCrystal.vital - totalCrystal.vital),
                        erosion: Math.max(0, needCrystal.erosion - totalCrystal.erosion),
                        defense: Math.max(0, needCrystal.defense - totalCrystal.defense),
                        regen: Math.max(0, needCrystal.regen - totalCrystal.regen),
                        poison: Math.max(0, needCrystal.poison - totalCrystal.poison)
                    };

                    // 제작할 결정에 필요한 에센스
                    const needEss = {
                        guard: makeCrystal.vital + makeCrystal.defense,
                        wave: makeCrystal.erosion + makeCrystal.regen,
                        chaos: makeCrystal.defense + makeCrystal.poison,
                        life: makeCrystal.vital + makeCrystal.regen,
                        decay: makeCrystal.erosion + makeCrystal.poison
                    };

                    // 제작할 에센스 (보유 에센스 차감)
                    const makeFish = {
                        guard: Math.max(0, needEss.guard - totalEss.guard),
                        wave: Math.max(0, needEss.wave - totalEss.wave),
                        chaos: Math.max(0, needEss.chaos - totalEss.chaos),
                        life: Math.max(0, needEss.life - totalEss.life),
                        decay: Math.max(0, needEss.decay - totalEss.decay)
                    };

                    // 2성 어패류 부족 체크
                    if (
                        makeFish.guard > totalFish.guard ||
                        makeFish.wave > totalFish.wave ||
                        makeFish.chaos > totalFish.chaos ||
                        makeFish.life > totalFish.life ||
                        makeFish.decay > totalFish.decay
                    ) continue;

                    const gold = CORE * GOLD_2STAR.CORE + POTION * GOLD_2STAR.POTION + WING * GOLD_2STAR.WING;
                    if (gold > best.gold) {
                        best = { gold, CORE, POTION, WING };
                    }
                }
            }
        }

        if (best.gold < 0) return null;

        // 4️⃣ 결과 계산
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

        const materialNeed = {
            seaweed: essToMake.guard * 2 + essToMake.wave * 2 + essToMake.chaos * 2 + essToMake.life * 2 + essToMake.decay * 2,
            ink: crystalToMake.vital + crystalToMake.erosion + crystalToMake.defense + crystalToMake.regen + crystalToMake.poison,
            coral_guard: essToMake.guard,
            coral_wave: essToMake.wave,
            coral_chaos: essToMake.chaos,
            coral_life: essToMake.life,
            coral_decay: essToMake.decay,
            mineral_lapis: crystalToMake.vital,
            mineral_redstone: crystalToMake.erosion,
            mineral_iron: crystalToMake.defense,
            mineral_gold: crystalToMake.regen,
            mineral_diamond: crystalToMake.poison
        };

        // 일반 모드 표시용 (전체 필요량)
        const essNeedTotal = {
            guard: crystalNeed.vital + crystalNeed.defense,
            wave: crystalNeed.erosion + crystalNeed.regen,
            chaos: crystalNeed.defense + crystalNeed.poison,
            life: crystalNeed.vital + crystalNeed.regen,
            decay: crystalNeed.erosion + crystalNeed.poison
        };

        const materialNeedTotal = {
            seaweed: essNeedTotal.guard * 2 + essNeedTotal.wave * 2 + essNeedTotal.chaos * 2 + essNeedTotal.life * 2 + essNeedTotal.decay * 2,
            ink: crystalNeed.vital + crystalNeed.erosion + crystalNeed.defense + crystalNeed.regen + crystalNeed.poison,
            coral_guard: essNeedTotal.guard,
            coral_wave: essNeedTotal.wave,
            coral_chaos: essNeedTotal.chaos,
            coral_life: essNeedTotal.life,
            coral_decay: essNeedTotal.decay,
            mineral_lapis: crystalNeed.vital,
            mineral_redstone: crystalNeed.erosion,
            mineral_iron: crystalNeed.defense,
            mineral_gold: crystalNeed.regen,
            mineral_diamond: crystalNeed.poison
        };

        return { 
            best, 
            crystalNeed,
            crystalToMake,
            essNeedTotal,
            essToMake,
            materialNeed,
            materialNeedTotal,
            isAdvancedMode
        };
    };

    // ===== 결과 업데이트 함수 =====
    window.update2StarResult = function(r) {
        const getElem = (id) => document.getElementById(id);
        const updateText = (id, text) => {
            const elem = getElem(id);
            if (elem) elem.textContent = text;
        };

        const premiumLVElem = getElem("info-expert-premium-price");
        const premiumLV = premiumLVElem ? (+premiumLVElem.value || 0) : 0;
        const PREMIUM_PRICE_RATE = {1:0.05,2:0.07,3:0.10,4:0.15,5:0.20,6:0.30,7:0.40,8:0.50};
        const rate = PREMIUM_PRICE_RATE[premiumLV] || 0;

        updateText("result-gold-2", Math.floor(r.best.gold * (1 + rate)).toLocaleString());
        updateText("result-premium-bonus-2", premiumLV ? `+${Math.floor(rate*100)}%` : '+0%');

        const isSetMode = setSwitcher && setSwitcher.checked;
        const format = (num) => isSetMode ? formatSet(num) : num;

        updateText("result-acutis-2", format(r.best.CORE));
        updateText("result-frenzy-2", format(r.best.POTION));
        updateText("result-feather-2", format(r.best.WING));

        const isAdvancedMode = r.isAdvancedMode;
        const essData = isAdvancedMode ? r.essToMake : r.essNeedTotal;
        const crystalData = isAdvancedMode ? r.crystalToMake : r.crystalNeed;
        const materialData = isAdvancedMode ? r.materialNeed : r.materialNeedTotal;

        updateText("result-essence-2",
            `수호 ${format(essData.guard || 0)}, ` +
            `파동 ${format(essData.wave || 0)}, ` +
            `혼란 ${format(essData.chaos || 0)}, ` +
            `생명 ${format(essData.life || 0)}, ` +
            `부식 ${format(essData.decay || 0)}`
        );

        updateText("result-core-2",
            `활기 보존 ${format(crystalData.vital || 0)}, ` +
            `파도 침식 ${format(crystalData.erosion || 0)}, ` +
            `방어 오염 ${format(crystalData.defense || 0)}, ` +
            `격류 재생 ${format(crystalData.regen || 0)}, ` +
            `맹독 혼란 ${format(crystalData.poison || 0)}`
        );

        updateText("result-material-2",
            `해초 ${format(materialData.seaweed || 0)}, ` +
            `먹물 ${format(materialData.ink || 0)}`
        );

        updateText("result-coral-2",
            `관 ${format(materialData.coral_guard || 0)}, ` +
            `사방 ${format(materialData.coral_wave || 0)}, ` +
            `거품 ${format(materialData.coral_chaos || 0)}, ` +
            `불 ${format(materialData.coral_life || 0)}, ` +
            `뇌 ${format(materialData.coral_decay || 0)}`
        );

        updateText("result-extra-2",
            `청금석 블록 ${format(materialData.mineral_lapis || 0)}, ` +
            `레드스톤 블록 ${format(materialData.mineral_redstone || 0)}, ` +
            `철 ${format(materialData.mineral_iron || 0)}, ` +
            `금 ${format(materialData.mineral_gold || 0)}, ` +
            `다이아 ${format(materialData.mineral_diamond || 0)}`
        );

        if (resultCard) resultCard.style.display = 'block';
        window.last2StarResult = r;
    };

    // ===== 버튼 클릭 =====
    window.run2StarOptimization = function() {
        const isAdvancedMode = advancedSwitcher && advancedSwitcher.checked;

        const input = {
            guard2: +document.getElementById("input-guard-2")?.value || 0,
            wave2: +document.getElementById("input-wave-2")?.value || 0,
            chaos2: +document.getElementById("input-chaos-2")?.value || 0,
            life2: +document.getElementById("input-life-2")?.value || 0,
            decay2: +document.getElementById("input-decay-2")?.value || 0,
            isAdvancedMode: isAdvancedMode
        };

        if (isAdvancedMode) {
            input.essGuard = +document.getElementById("input-essence-guard-2")?.value || 0;
            input.essWave = +document.getElementById("input-essence-wave-2")?.value || 0;
            input.essChaos = +document.getElementById("input-essence-chaos-2")?.value || 0;
            input.essLife = +document.getElementById("input-essence-life-2")?.value || 0;
            input.essDecay = +document.getElementById("input-essence-decay-2")?.value || 0;

            input.crystalVital = +document.getElementById("input-crystal-vital-2")?.value || 0;
            input.crystalErosion = +document.getElementById("input-crystal-erosion-2")?.value || 0;
            input.crystalDefense = +document.getElementById("input-crystal-defense-2")?.value || 0;
            input.crystalRegen = +document.getElementById("input-crystal-regen-2")?.value || 0;
            input.crystalPoison = +document.getElementById("input-crystal-poison-2")?.value || 0;
        }

        const r = calculate2Star(input);
        
        if (!r) {
            alert("재료가 부족합니다");
            return;
        }

        update2StarResult(r);
    };

    // ===== 스위치 이벤트 =====
    if (setSwitcher) {
        setSwitcher.addEventListener('change', () => {
            if (window.last2StarResult) update2StarResult(window.last2StarResult);
        });
    }

    // ===== 세트 표시 =====
    const inputIds = [
        "input-guard-2", "input-wave-2", "input-chaos-2", 
        "input-life-2", "input-decay-2"
    ];
    
    inputIds.forEach(id => {
        const input = document.getElementById(id);
        if (!input) return;
        
        const span = document.createElement('span');
        span.className = 'set-display';
        input.parentNode.appendChild(span);

        input.addEventListener('input', () => {
            const value = parseInt(input.value) || 0;
            if (setSwitcher && setSwitcher.checked) {
                span.textContent = ` ${formatSet(value)}`;
            } else {
                span.textContent = '';
            }
        });
    });

    console.log("✅ 2성 계산기 초기화 완료 (최적화 버전)");
});
/*************************************************
 * 3️⃣ 3성 계산기 (ocean3rd.js) - 고급 입력 모드 추가 (수정됨)
 *************************************************/

document.addEventListener('DOMContentLoaded', () => {

    const GOLD_3STAR = { AQUA: 10699, NAUTILUS: 10824, SPINE: 10892 };
    const POTION_TO_ELIXIR = {
        immortal: { guard: 1, life: 1 },
        barrier: { guard: 1, wave: 1 },
        corrupt: { chaos: 1, decay: 1 },
        frenzy: { chaos: 1, life: 1 },
        venom: { wave: 1, decay: 1 }
    };
    const SET_COUNT = 64;
    const setSwitcher = document.getElementById('switcher-set');
    const advancedSwitcher = document.getElementById('switcher-advanced');

    const inputs = [
        document.getElementById("input-oyster-3"),
        document.getElementById("input-conch-3"),
        document.getElementById("input-octopus-3"),
        document.getElementById("input-seaweed-3"),
        document.getElementById("input-urchin-3")
    ];

    // ===== 고급 입력 모드 토글 =====
    advancedSwitcher?.addEventListener('change', function() {
        const advancedInputs = document.getElementById('advanced-inputs-3');
        if (advancedInputs) {
            if (this.checked) {
                advancedInputs.classList.add('active');
            } else {
                advancedInputs.classList.remove('active');
            }
        }
    });

    function formatSet(num) {
        const sets = Math.floor(num / SET_COUNT);
        const remainder = num % SET_COUNT;
        if (sets > 0 && remainder > 0) return `${sets} / ${remainder}`;
        if (sets > 0) return `${sets} / 0`;
        return `0 / ${remainder}`;
    }

    // ===== 계산 함수 =====
    window.calculate3Star = function(input) {
        const isAdvanced = Number.isFinite(input.potionImmortal) && input.potionImmortal >= 0;

        let best = { gold: -1, AQUA: 0, NAUTILUS: 0, SPINE: 0 };

        // 보유 영약을 엘릭서로 환산
        let elixFromPotion = { guard: 0, wave: 0, chaos: 0, life: 0, decay: 0 };
        if (isAdvanced) {
            elixFromPotion.guard = input.potionImmortal * POTION_TO_ELIXIR.immortal.guard + 
                                    input.potionBarrier * POTION_TO_ELIXIR.barrier.guard;
            elixFromPotion.wave = input.potionBarrier * POTION_TO_ELIXIR.barrier.wave + 
                                   input.potionVenom * POTION_TO_ELIXIR.venom.wave;
            elixFromPotion.chaos = input.potionCorrupt * POTION_TO_ELIXIR.corrupt.chaos + 
                                    input.potionFrenzy * POTION_TO_ELIXIR.frenzy.chaos;
            elixFromPotion.life = input.potionImmortal * POTION_TO_ELIXIR.immortal.life + 
                                   input.potionFrenzy * POTION_TO_ELIXIR.frenzy.life;
            elixFromPotion.decay = input.potionCorrupt * POTION_TO_ELIXIR.corrupt.decay + 
                                    input.potionVenom * POTION_TO_ELIXIR.venom.decay;
        }

        // 총 보유 엘릭서
        const totalElix = {
            guard: input.guard + (input.elixGuard || 0) + elixFromPotion.guard,
            wave: input.wave + (input.elixWave || 0) + elixFromPotion.wave,
            chaos: input.chaos + (input.elixChaos || 0) + elixFromPotion.chaos,
            life: input.life + (input.elixLife || 0) + elixFromPotion.life,
            decay: input.decay + (input.elixDecay || 0) + elixFromPotion.decay
        };

        // 최적화: limit 설정
        let limit = Math.ceil(Math.max(
            totalElix.guard / 2,
            totalElix.wave / 2,
            totalElix.chaos / 2,
            totalElix.life / 2,
            totalElix.decay / 2
        )) + 5;

        for (let AQUA = 0; AQUA <= limit; AQUA++) {
            for (let NAUTILUS = 0; NAUTILUS <= limit; NAUTILUS++) {
                for (let SPINE = 0; SPINE <= limit; SPINE++) {
                    let potion = {
                        immortal: AQUA + NAUTILUS,
                        barrier: AQUA + NAUTILUS,
                        corrupt: SPINE,
                        frenzy: NAUTILUS + SPINE,
                        venom: AQUA + SPINE
                    };
                    
                    let elixir = {
                        guard: potion.immortal + potion.barrier,
                        wave: potion.barrier + potion.venom,
                        chaos: potion.corrupt + potion.frenzy,
                        life: potion.immortal + potion.frenzy,
                        decay: potion.corrupt + potion.venom
                    };

                    if (elixir.guard > totalElix.guard || elixir.wave > totalElix.wave || elixir.chaos > totalElix.chaos ||
                        elixir.life > totalElix.life || elixir.decay > totalElix.decay)
                        continue;

                    let gold = AQUA * GOLD_3STAR.AQUA + NAUTILUS * GOLD_3STAR.NAUTILUS + SPINE * GOLD_3STAR.SPINE;
                    if (gold > best.gold) best = { gold, AQUA, NAUTILUS, SPINE };
                }
            }
        }

        if (best.gold < 0) return null;

        let potionNeed = {
            immortal: best.AQUA + best.NAUTILUS,
            barrier: best.AQUA + best.NAUTILUS,
            corrupt: best.SPINE,
            frenzy: best.NAUTILUS + best.SPINE,
            venom: best.AQUA + best.SPINE
        };

        let elixirNeed = {
            guard: potionNeed.immortal + potionNeed.barrier,
            wave: potionNeed.barrier + potionNeed.venom,
            chaos: potionNeed.corrupt + potionNeed.frenzy,
            life: potionNeed.immortal + potionNeed.frenzy,
            decay: potionNeed.corrupt + potionNeed.venom
        };

        // 고급 모드일 경우 보유량 차감
        let potionToMake = { immortal: 0, barrier: 0, corrupt: 0, frenzy: 0, venom: 0 };
        let elixToMake = { guard: 0, wave: 0, chaos: 0, life: 0, decay: 0 };
        let finalElixNeed = { guard: 0, wave: 0, chaos: 0, life: 0, decay: 0 };

        if (isAdvanced) {
            potionToMake = {
                immortal: Math.max(0, potionNeed.immortal - input.potionImmortal),
                barrier: Math.max(0, potionNeed.barrier - input.potionBarrier),
                corrupt: Math.max(0, potionNeed.corrupt - input.potionCorrupt),
                frenzy: Math.max(0, potionNeed.frenzy - input.potionFrenzy),
                venom: Math.max(0, potionNeed.venom - input.potionVenom)
            };

            // 제작할 영약에 필요한 엘릭서
            elixToMake.guard = potionToMake.immortal * POTION_TO_ELIXIR.immortal.guard + 
                                potionToMake.barrier * POTION_TO_ELIXIR.barrier.guard;
            elixToMake.wave = potionToMake.barrier * POTION_TO_ELIXIR.barrier.wave + 
                               potionToMake.venom * POTION_TO_ELIXIR.venom.wave;
            elixToMake.chaos = potionToMake.corrupt * POTION_TO_ELIXIR.corrupt.chaos + 
                                potionToMake.frenzy * POTION_TO_ELIXIR.frenzy.chaos;
            elixToMake.life = potionToMake.immortal * POTION_TO_ELIXIR.immortal.life + 
                               potionToMake.frenzy * POTION_TO_ELIXIR.frenzy.life;
            elixToMake.decay = potionToMake.corrupt * POTION_TO_ELIXIR.corrupt.decay + 
                                potionToMake.venom * POTION_TO_ELIXIR.venom.decay;

            // 제작해야 할 엘릭서 (보유 엘릭서 + 보유 영약에서 나온 엘릭서 차감)
            finalElixNeed = {
                guard: Math.max(0, elixToMake.guard - (input.elixGuard + elixFromPotion.guard)),
                wave: Math.max(0, elixToMake.wave - (input.elixWave + elixFromPotion.wave)),
                chaos: Math.max(0, elixToMake.chaos - (input.elixChaos + elixFromPotion.chaos)),
                life: Math.max(0, elixToMake.life - (input.elixLife + elixFromPotion.life)),
                decay: Math.max(0, elixToMake.decay - (input.elixDecay + elixFromPotion.decay))
            };
        }

        return { best, elixirNeed, potionNeed, potionToMake, elixToMake, finalElixNeed, elixFromPotion };
    };

    // ===== 결과 업데이트 =====
    function update3StarResult(r) {
        const premiumLV = +document.getElementById("info-expert-premium-price").value || 0;
        const PREMIUM_PRICE_RATE = {1:0.05,2:0.07,3:0.10,4:0.15,5:0.20,6:0.30,7:0.40,8:0.50};
        const rate = PREMIUM_PRICE_RATE[premiumLV] || 0;

        document.getElementById("result-gold-3").textContent = Math.floor(r.best.gold * (1 + rate)).toLocaleString();
        document.getElementById("result-premium-bonus-3").textContent = premiumLV ? `+${Math.floor(rate*100)}%` : '+0%';

        document.getElementById("result-aqua-3").textContent = setSwitcher.checked ? formatSet(r.best.AQUA) : r.best.AQUA;
        document.getElementById("result-nautilus-3").textContent = setSwitcher.checked ? formatSet(r.best.NAUTILUS) : r.best.NAUTILUS;
        document.getElementById("result-spine-3").textContent = setSwitcher.checked ? formatSet(r.best.SPINE) : r.best.SPINE;

        const isAdvanced = advancedSwitcher && advancedSwitcher.checked;
        const elixData = isAdvanced ? r.finalElixNeed : r.elixirNeed;
        const potionData = isAdvanced ? r.potionToMake : r.potionNeed;

        document.getElementById("result-essence-3").textContent =
            `수호 ${setSwitcher.checked ? formatSet(elixData.guard || 0) : (elixData.guard || 0)}, ` +
            `파동 ${setSwitcher.checked ? formatSet(elixData.wave || 0) : (elixData.wave || 0)}, ` +
            `혼란 ${setSwitcher.checked ? formatSet(elixData.chaos || 0) : (elixData.chaos || 0)}, ` +
            `생명 ${setSwitcher.checked ? formatSet(elixData.life || 0) : (elixData.life || 0)}, ` +
            `부식 ${setSwitcher.checked ? formatSet(elixData.decay || 0) : (elixData.decay || 0)}`;

        document.getElementById("result-core-3").textContent =
            `불멸 재생 ${setSwitcher.checked ? formatSet(potionData.immortal || 0) : (potionData.immortal || 0)}, ` +
            `파동 장벽 ${setSwitcher.checked ? formatSet(potionData.barrier || 0) : (potionData.barrier || 0)}, ` +
            `타락 침식 ${setSwitcher.checked ? formatSet(potionData.corrupt || 0) : (potionData.corrupt || 0)}, ` +
            `생명 광란 ${setSwitcher.checked ? formatSet(potionData.frenzy || 0) : (potionData.frenzy || 0)}, ` +
            `맹독 파동 ${setSwitcher.checked ? formatSet(potionData.venom || 0) : (potionData.venom || 0)}`;

        // 재료: 제작할 엘릭서와 영약에 필요한 재료만
        const finalMaterialNeed = {
            glassBottle: 3 * (elixData.guard + elixData.wave + elixData.chaos + elixData.life + elixData.decay),
            seaSquirt: elixData.guard + elixData.wave + elixData.chaos + elixData.life + elixData.decay,
            glowInkSac: potionData.immortal + potionData.barrier + potionData.corrupt + potionData.frenzy + potionData.venom,
            glowBerry: 2 * (potionData.immortal + potionData.barrier + potionData.corrupt + potionData.frenzy + potionData.venom)
        };

        document.getElementById("result-material-3").textContent =
            `불우렁쉥이 ${setSwitcher.checked ? formatSet(finalMaterialNeed.seaSquirt) : finalMaterialNeed.seaSquirt}, ` +
            `유리병 ${setSwitcher.checked ? formatSet(finalMaterialNeed.glassBottle) : finalMaterialNeed.glassBottle}, ` +
            `발광 먹물 ${setSwitcher.checked ? formatSet(finalMaterialNeed.glowInkSac) : finalMaterialNeed.glowInkSac}, ` +
            `발광 열매 ${setSwitcher.checked ? formatSet(finalMaterialNeed.glowBerry) : finalMaterialNeed.glowBerry}`;

        // 네더 블록: 제작할 엘릭서에 필요한 블록만
        const finalNetherNeed = {
            netherrack: 16 * (elixData.guard || 0),
            magmaBlock: 8 * (elixData.wave || 0),
            soulSoil: 8 * (elixData.chaos || 0),
            crimsonStem: 4 * (elixData.life || 0),
            warpedStem: 4 * (elixData.decay || 0)
        };

        document.getElementById("result-block-3").textContent =
            `네더렉 ${setSwitcher.checked ? formatSet(finalNetherNeed.netherrack) : finalNetherNeed.netherrack}, ` +
            `마그마 ${setSwitcher.checked ? formatSet(finalNetherNeed.magmaBlock) : finalNetherNeed.magmaBlock}, ` +
            `영혼흙 ${setSwitcher.checked ? formatSet(finalNetherNeed.soulSoil) : finalNetherNeed.soulSoil}, ` +
            `진홍빛자루 ${setSwitcher.checked ? formatSet(finalNetherNeed.crimsonStem) : finalNetherNeed.crimsonStem}, ` +
            `뒤틀린자루 ${setSwitcher.checked ? formatSet(finalNetherNeed.warpedStem) : finalNetherNeed.warpedStem}`;

        // 꽃: 제작할 영약에 필요한 꽃만
        const finalFlowerNeed = {
            cornflower: potionData.immortal || 0,
            dandelion: potionData.barrier || 0,
            daisy: potionData.corrupt || 0,
            poppy: potionData.frenzy || 0,
            blueOrchid: potionData.venom || 0
        };

        document.getElementById("result-flower-3").textContent =
            `수레국화 ${setSwitcher.checked ? formatSet(finalFlowerNeed.cornflower) : finalFlowerNeed.cornflower}, ` +
            `민들레 ${setSwitcher.checked ? formatSet(finalFlowerNeed.dandelion) : finalFlowerNeed.dandelion}, ` +
            `데이지 ${setSwitcher.checked ? formatSet(finalFlowerNeed.daisy) : finalFlowerNeed.daisy}, ` +
            `양귀비 ${setSwitcher.checked ? formatSet(finalFlowerNeed.poppy) : finalFlowerNeed.poppy}, ` +
            `선애기별꽃 ${setSwitcher.checked ? formatSet(finalFlowerNeed.blueOrchid) : finalFlowerNeed.blueOrchid}`;

        window.last3StarResult = r;
    }

    // ===== 버튼 클릭 함수 =====
    window.run3StarOptimization = function() {
        const isAdvanced = advancedSwitcher && advancedSwitcher.checked;

        const input = {
            guard: +document.getElementById("input-oyster-3").value || 0,
            wave: +document.getElementById("input-conch-3").value || 0,
            chaos: +document.getElementById("input-octopus-3").value || 0,
            life: +document.getElementById("input-seaweed-3").value || 0,
            decay: +document.getElementById("input-urchin-3").value || 0
        };

        if (isAdvanced) {
            input.elixGuard = +document.getElementById("input-elixir-guard-3")?.value || 0;
            input.elixWave = +document.getElementById("input-elixir-wave-3")?.value || 0;
            input.elixChaos = +document.getElementById("input-elixir-chaos-3")?.value || 0;
            input.elixLife = +document.getElementById("input-elixir-life-3")?.value || 0;
            input.elixDecay = +document.getElementById("input-elixir-decay-3")?.value || 0;

            input.potionImmortal = +document.getElementById("input-potion-immortal-3")?.value || 0;
            input.potionBarrier = +document.getElementById("input-potion-barrier-3")?.value || 0;
            input.potionCorrupt = +document.getElementById("input-potion-corrupt-3")?.value || 0;
            input.potionFrenzy = +document.getElementById("input-potion-frenzy-3")?.value || 0;
            input.potionVenom = +document.getElementById("input-potion-venom-3")?.value || 0;
        } else {
            input.elixGuard = input.elixWave = input.elixChaos = input.elixLife = input.elixDecay = 0;
            input.potionImmortal = input.potionBarrier = input.potionCorrupt = input.potionFrenzy = input.potionVenom = 0;
        }

        const r = calculate3Star(input);
        if (!r) return alert("재료 부족");

        update3StarResult(r);
        document.getElementById("result-card-3").style.display = "block";
    };

    // ===== 스위치 토글 시 기존 결과 재포맷 =====
    if (setSwitcher) {
        setSwitcher.addEventListener('change', () => {
            if (window.last3StarResult) update3StarResult(window.last3StarResult);
        });
    }

    if (advancedSwitcher) {
        advancedSwitcher.addEventListener('change', () => {
            if (window.last3StarResult) update3StarResult(window.last3StarResult);
        });
    }

    // ===== 입력칸 세트 표시 =====
    inputs.forEach(input => {
        if (!input) return;
        const span = document.createElement('span');
        span.className = 'set-display';
        input.parentNode.appendChild(span);

        input.addEventListener('input', () => {
            const value = parseInt(input.value) || 0;
            if (setSwitcher && setSwitcher.checked) {
                const sets = Math.floor(value / SET_COUNT);
                const remainder = value % SET_COUNT;
                span.textContent = ` ${sets} / ${remainder}`;
            } else {
                span.textContent = '';
            }
        });
    });
});
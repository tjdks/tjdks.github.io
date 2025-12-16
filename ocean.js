/*************************************************
 * 공통 유틸
 *************************************************/
function add(target, src, mul = 1) {
    for (let k in src) {
        target[k] = (target[k] || 0) + src[k] * mul;
    }
}

/*************************************************
 * ===============================
 * 1️⃣ 1성 해양 계산기 (기준)
 * ===============================
 *************************************************/

// 핵 → 정수
const CORE_TO_ESSENCE = {
    WG: { guard:1, wave:1 },
    WP: { wave:1, chaos:1 },
    OD: { chaos:1, life:1 },
    VD: { life:1, decay:1 },
    ED: { decay:1, guard:1 }
};

// 정수 → 블록
const ESSENCE_TO_BLOCK = {
    guard:{ clay:2 },
    wave:{ sand:3 },
    chaos:{ dirt:4 },
    life:{ gravel:3 },
    decay:{ granite:1 }
};

// 핵 → 물고기
const CORE_TO_FISH = {
    WG:{ shrimp:1 },
    WP:{ domi:1 },
    OD:{ herring:1 },
    VD:{ goldfish:1 },
    ED:{ bass:1 }
};

// 골드 가격
const GOLD_1STAR = { A:2643, K:2682, L:2763 };

function calculate1Star(input){
    let tot = { ...input };
    let best = { gold:-1, A:0, K:0, L:0 };
    let limit = Math.max(10, tot.guard+tot.wave+tot.chaos+tot.life+tot.decay);

    for(let A=0; A<=limit; A++){
        for(let K=0; K<=limit; K++){
            for(let L=0; L<=limit; L++){

                let coreNeed = {
                    WG: A + L,
                    WP: K + L,
                    OD: A + K,
                    VD: A + K,
                    ED: L
                };

                let ess = { guard:0, wave:0, chaos:0, life:0, decay:0 };
                for(let c in coreNeed) add(ess, CORE_TO_ESSENCE[c], coreNeed[c]);

                if(
                    ess.guard > tot.guard ||
                    ess.wave  > tot.wave  ||
                    ess.chaos > tot.chaos ||
                    ess.life  > tot.life  ||
                    ess.decay > tot.decay
                ) continue;

                let gold = A*GOLD_1STAR.A + K*GOLD_1STAR.K + L*GOLD_1STAR.L;
                if(gold > best.gold) best = { gold, A, K, L };
            }
        }
    }
    if(best.gold < 0) return null;

    const coreNeed = {
        WG: best.A + best.L,
        WP: best.K + best.L,
        OD: best.A + best.K,
        VD: best.A + best.K,
        ED: best.L
    };

    let essNeed = { guard:0, wave:0, chaos:0, life:0, decay:0 };
    let blockNeed = {}, fishNeed = {};

    for(let c in coreNeed){
        add(essNeed, CORE_TO_ESSENCE[c], coreNeed[c]);
        add(fishNeed, CORE_TO_FISH[c], coreNeed[c]);
    }
    for(let e in essNeed){
        add(blockNeed, ESSENCE_TO_BLOCK[e], essNeed[e]);
    }

    return {
        best,
        coreNeed,   // ✅ 핵 제작량 반환
        essNeed,
        blockNeed,
        fishNeed
    };
}


function run1StarOptimization(){
    const r = calculate1Star({
        guard:+document.getElementById("input-oyster-1").value,
        wave:+document.getElementById("input-shell-1").value,
        chaos:+document.getElementById("input-octopus-1").value,
        life:+document.getElementById("input-seaweed-1").value,
        decay:+document.getElementById("input-urchin-1").value
    });
    if(!r) return alert("재료 부족");

    document.getElementById("result-gold-1").textContent = r.best.gold;
    document.getElementById("result-acutis-1").textContent = r.best.A;
    document.getElementById("result-frenzy-1").textContent = r.best.K;
    document.getElementById("result-feather-1").textContent = r.best.L;

    document.getElementById("result-essence-1").textContent =
        `수호 ${r.essNeed.guard}, 파동 ${r.essNeed.wave}, 혼란 ${r.essNeed.chaos}, 생명 ${r.essNeed.life}, 부식 ${r.essNeed.decay}`;

    document.getElementById("result-block-1").textContent =
        `점토 ${r.blockNeed.clay||0}, 모래 ${r.blockNeed.sand||0}, 흙 ${r.blockNeed.dirt||0}, 자갈 ${r.blockNeed.gravel||0}, 화강암 ${r.blockNeed.granite||0}`;

    document.getElementById("result-fish-1").textContent =
        `새우 ${r.fishNeed.shrimp||0}, 도미 ${r.fishNeed.domi||0}, 청어 ${r.fishNeed.herring||0}, 금붕어 ${r.fishNeed.goldfish||0}, 농어 ${r.fishNeed.bass||0}`;

    document.getElementById("result-core-1").textContent =
    `물결 수호 ${r.coreNeed.WG}, 파동 오염 ${r.coreNeed.WP}, 질서 파괴 ${r.coreNeed.OD}, 활력 붕괴 ${r.coreNeed.VD}, 침식 방어 ${r.coreNeed.ED}`;

    }

    const GOLD_2STAR = {
    CORE: 5702,   // 해구의 파동 코어
    POTION: 5760, // 침묵의 심해 비약
    WING: 5840    // 청해룡의 날개
};

function calculate2Star(input){
    let tot = { ...input };

    let best = { gold:-1, CORE:0, POTION:0, WING:0 };

    let limit = Math.max(
        10,
        tot.guard + tot.wave + tot.chaos + tot.life + tot.decay
    );

    for(let CORE=0; CORE<=limit; CORE++){
        for(let POTION=0; POTION<=limit; POTION++){
            for(let WING=0; WING<=limit; WING++){

                // 🔹 결정 제작량
                let crystal = {
                    vital: CORE + WING,        // 활기 보존
                    erosion: CORE + POTION,   // 파도 침식
                    defense: WING,            // 방어 오염
                    regen: CORE + POTION,     // 격류 재생
                    poison: POTION + WING     // 맹독 혼란
                };

                // 🔹 에센스 소모
                let ess = {
                    guard: crystal.vital + crystal.defense,
                    wave: crystal.erosion + crystal.regen,
                    chaos: crystal.defense + crystal.poison,
                    life: crystal.vital + crystal.regen,
                    decay: crystal.erosion + crystal.poison
                };

                if(
                    ess.guard > tot.guard ||
                    ess.wave  > tot.wave  ||
                    ess.chaos > tot.chaos ||
                    ess.life  > tot.life  ||
                    ess.decay > tot.decay
                ) continue;

                let gold =
                    CORE   * 5702 +
                    POTION * 5760 +
                    WING   * 5840;

                if(gold > best.gold){
                    best = { gold, CORE, POTION, WING };
                }
            }
        }
    }

    if(best.gold < 0) return null;

    // 🔹 최종 결정 제작량
    let crystalNeed = {
        vital: best.CORE + best.WING,
        erosion: best.CORE + best.POTION,
        defense: best.WING,
        regen: best.CORE + best.POTION,
        poison: best.POTION + best.WING
    };

    // 🔹 에센스
    let essNeed = {
        guard: crystalNeed.vital + crystalNeed.defense,
        wave: crystalNeed.erosion + crystalNeed.regen,
        chaos: crystalNeed.defense + crystalNeed.poison,
        life: crystalNeed.vital + crystalNeed.regen,
        decay: crystalNeed.erosion + crystalNeed.poison
    };

    // 🔹 재료
    let materialNeed = {
        seaweed: 2 * (
            essNeed.guard + essNeed.wave + essNeed.chaos +
            essNeed.life + essNeed.decay
        ),
        ink: crystalNeed.vital + crystalNeed.erosion +
             crystalNeed.defense + crystalNeed.regen +
             crystalNeed.poison
    };

    // 🔹 광물
    let mineralNeed = {
        lapis: crystalNeed.vital * 2,
        redstone: crystalNeed.erosion * 2,
        iron: crystalNeed.defense * 2,
        gold: crystalNeed.regen * 2,
        diamond: crystalNeed.poison * 2
    };

    return {
        best,
        essNeed,
        crystalNeed,
        materialNeed,
        mineralNeed
    };
}

function run2StarOptimization(){
    const r = calculate2Star({
        guard:+document.getElementById("input-guard-2").value,
        wave:+document.getElementById("input-wave-2").value,
        chaos:+document.getElementById("input-chaos-2").value,
        life:+document.getElementById("input-life-2").value,
        decay:+document.getElementById("input-decay-2").value
    });

    if(!r) return alert("재료 부족");

    document.getElementById("result-gold-2").textContent = r.best.gold;

    document.getElementById("result-acutis-2").textContent = r.best.CORE;
    document.getElementById("result-frenzy-2").textContent = r.best.POTION;
    document.getElementById("result-feather-2").textContent = r.best.WING;

    // 🔹 필요 에센스
    document.getElementById("result-essence-2").textContent =
        `수호 ${r.essNeed.guard}, 파동 ${r.essNeed.wave}, 혼란 ${r.essNeed.chaos}, 생명 ${r.essNeed.life}, 부식 ${r.essNeed.decay}`;

    // 🔹 필요 결정 제작
    document.getElementById("result-core-2").textContent =
        `활기 보존 ${r.crystalNeed.vital}, 파도 침식 ${r.crystalNeed.erosion}, 방어 오염 ${r.crystalNeed.defense}, 격류 재생 ${r.crystalNeed.regen}, 맹독 혼란 ${r.crystalNeed.poison}`;

    // 🔹 필요 재료
    document.getElementById("result-material-2").textContent =
        `해초 ${r.materialNeed.seaweed}, 먹물 주머니 ${r.materialNeed.ink}`;

    // 🔹 필요 광물
    document.getElementById("result-extra-2").textContent =
        `청금석 블록 ${r.mineralNeed.lapis}, 레드스톤 블록 ${r.mineralNeed.redstone}, 철 주괴 ${r.mineralNeed.iron}, 금 주괴 ${r.mineralNeed.gold}, 다이아 ${r.mineralNeed.diamond}`;
}


const GOLD_3STAR = {
    AQUA: 8230,      // 아쿠아 펄스 파편
    NAUTILUS: 8326,  // 나우틸러스의 손
    SPINE: 8379      // 무저의 척추
};

function calculate3Star(input){
    let tot = { ...input };

    let best = { gold:-1, AQUA:0, NAUTILUS:0, SPINE:0 };

    let limit = Math.max(
        10,
        tot.guard + tot.wave + tot.chaos + tot.life + tot.decay
    );

    for(let AQUA=0; AQUA<=limit; AQUA++){
        for(let NAUTILUS=0; NAUTILUS<=limit; NAUTILUS++){
            for(let SPINE=0; SPINE<=limit; SPINE++){

                // 🔹 영약 제작량
                let potion = {
                    immortal: AQUA + NAUTILUS,   // 불멸 재생
                    barrier: AQUA + NAUTILUS,    // 파동 장벽
                    poison: AQUA + SPINE,        // 맹독 파동
                    frenzy: NAUTILUS + SPINE,   // 생명 광란
                    corrupt: SPINE              // 타락 침식
                };

                // 🔹 엘릭서 소모
                let elixir = {
                    guard: potion.immortal + potion.barrier,
                    wave: potion.barrier + potion.poison,
                    chaos: potion.corrupt + potion.frenzy,
                    life: potion.immortal + potion.frenzy,
                    decay: potion.corrupt + potion.poison
                };

                if(
                    elixir.guard > tot.guard ||
                    elixir.wave  > tot.wave  ||
                    elixir.chaos > tot.chaos ||
                    elixir.life  > tot.life  ||
                    elixir.decay > tot.decay
                ) continue;

                let gold =
                    AQUA     * GOLD_3STAR.AQUA +
                    NAUTILUS * GOLD_3STAR.NAUTILUS +
                    SPINE    * GOLD_3STAR.SPINE;

                if(gold > best.gold){
                    best = { gold, AQUA, NAUTILUS, SPINE };
                }
            }
        }
    }

    if(best.gold < 0) return null;

    // 🔹 영약 최종 요구량
    let potionNeed = {
        immortal: best.AQUA + best.NAUTILUS,
        barrier: best.AQUA + best.NAUTILUS,
        poison: best.AQUA + best.SPINE,
        frenzy: best.NAUTILUS + best.SPINE,
        corrupt: best.SPINE
    };

    // 🔹 엘릭서
    let elixirNeed = {
        guard: potionNeed.immortal + potionNeed.barrier,
        wave: potionNeed.barrier + potionNeed.poison,
        chaos: potionNeed.corrupt + potionNeed.frenzy,
        life: potionNeed.immortal + potionNeed.frenzy,
        decay: potionNeed.corrupt + potionNeed.poison
    };

    // 🔹 재료
    let materialNeed = {
        seaSquirt: 3 * (
            elixirNeed.guard + elixirNeed.wave + elixirNeed.chaos +
            elixirNeed.life + elixirNeed.decay
        ),
        bottle: 5 * (
            elixirNeed.guard + elixirNeed.wave + elixirNeed.chaos +
            elixirNeed.life + elixirNeed.decay
        ),
        glowInk: potionNeed.immortal + potionNeed.barrier +
                 potionNeed.poison + potionNeed.frenzy + potionNeed.corrupt,
        glowBerry: potionNeed.immortal + potionNeed.barrier +
                   potionNeed.poison + potionNeed.frenzy + potionNeed.corrupt
    };

    // 🔹 블록
    let blockNeed = {
        netherrack: elixirNeed.guard * 32,
        magma: elixirNeed.wave * 16,
        soulSand: elixirNeed.chaos * 16,
        crimson: elixirNeed.life * 8,
        warped: elixirNeed.decay * 8
    };

    // 🔹 꽃
    let flowerNeed = {
        cornflower: potionNeed.immortal * 2,
        dandelion: potionNeed.barrier * 2,
        daisy: potionNeed.corrupt * 2,
        poppy: potionNeed.frenzy * 2,
        azure: potionNeed.poison * 2
    };

    return {
        best,
        elixirNeed,
        potionNeed,
        materialNeed,
        blockNeed,
        flowerNeed
    };
}

function run3StarOptimization(){
    const r = calculate3Star({
        guard:+document.getElementById("input-oyster-3").value,
        wave:+document.getElementById("input-conch-3").value,
        chaos:+document.getElementById("input-octopus-3").value,
        life:+document.getElementById("input-seaweed-3").value,
        decay:+document.getElementById("input-urchin-3").value
    });

    if(!r) return alert("재료 부족");

    document.getElementById("result-gold-3").textContent = r.best.gold;

    document.getElementById("result-aqua-3").textContent = r.best.AQUA;
    document.getElementById("result-nautilus-3").textContent = r.best.NAUTILUS;
    document.getElementById("result-spine-3").textContent = r.best.SPINE;

    document.getElementById("result-essence-3").textContent =
        `수호 ${r.elixirNeed.guard}, 파동 ${r.elixirNeed.wave}, 혼란 ${r.elixirNeed.chaos}, 생명 ${r.elixirNeed.life}, 부식 ${r.elixirNeed.decay}`;

    document.getElementById("result-core-3").textContent =
        `불멸 재생 ${r.potionNeed.immortal}, 파동 장벽 ${r.potionNeed.barrier}, 타락 침식 ${r.potionNeed.corrupt}, 생명 광란 ${r.potionNeed.frenzy}, 맹독 파동 ${r.potionNeed.poison}`;

    document.getElementById("result-material-3").textContent =
        `불우렁쉥이 ${r.materialNeed.seaSquirt}, 유리병 ${r.materialNeed.bottle}, 발광먹물주머니 ${r.materialNeed.glowInk}, 발광열매 ${r.materialNeed.glowBerry}`;

    document.getElementById("result-block-3").textContent =
        `네더렉 ${r.blockNeed.netherrack}, 마그마 ${r.blockNeed.magma}, 영혼모래 ${r.blockNeed.soulSand}, 진홍빛자루 ${r.blockNeed.crimson}, 뒤틀린자루 ${r.blockNeed.warped}`;

    document.getElementById("result-flower-3").textContent =
        `수레국화 ${r.flowerNeed.cornflower}, 민들레 ${r.flowerNeed.dandelion}, 데이지 ${r.flowerNeed.daisy}, 양귀비 ${r.flowerNeed.poppy}, 선애기별꽃 ${r.flowerNeed.azure}`;
}
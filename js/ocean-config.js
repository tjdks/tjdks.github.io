/*************************************************
 * 해양 계산기 - 공통 설정 및 상수
 *************************************************/

// 세트 관련 상수
export const SET_COUNT = 64;

// 골드 가격 (2025년 업데이트)
export const GOLD_PRICES = {
    '1star': { A: 3780, K: 3835, L: 3951 },
    '2star': { CORE: 8154, POTION: 8236, WING: 8351 },
    '3star': { AQUA: 13909, NAUTILUS: 14071, SPINE: 14160 }
};

// 프리미엄 가격 비율
export const PREMIUM_PRICE_RATE = {
    1: 0.05, 2: 0.07, 3: 0.10, 4: 0.15,
    5: 0.20, 6: 0.30, 7: 0.40, 8: 0.50
};

// 1성 - 핵에서 정수로 변환
export const CORE_TO_ESSENCE_1STAR = {
    WG: { guard: 1, wave: 1 },
    WP: { wave: 1, chaos: 1 },
    OD: { chaos: 1, life: 1 },
    VD: { life: 1, decay: 1 },
    ED: { decay: 1, guard: 1 }
};

// 1성 - 정수에서 블록으로 변환
export const ESSENCE_TO_BLOCK_1STAR = {
    guard: { clay: 1 },
    wave: { sand: 3 },
    chaos: { dirt: 4 },
    life: { gravel: 2 },
    decay: { granite: 1 }
};

// 1성 - 핵에서 물고기로 변환
export const CORE_TO_FISH_1STAR = {
    WG: { shrimp: 1 },
    WP: { domi: 1 },
    OD: { herring: 1 },
    VD: { goldfish: 1 },
    ED: { bass: 1 }
};

// 2성 - 에센스에서 블록으로 변환 (조합법 수정 반영)
export const ESSENCE_TO_BLOCK_2STAR = {
    guard: { seaweed: 2, netherrack: 8 },
    wave: { seaweed: 2, magmaBlock: 4 },
    chaos: { seaweed: 2, soulSoil: 4 },
    life: { seaweed: 2, crimsonStem: 2 },
    decay: { seaweed: 2, warpedStem: 2 }
};

// 2성 - 결정에서 재료로 변환 (조합법 수정 반영)
export const CRYSTAL_TO_MATERIAL_2STAR = {
    vital: { kelp: 3, lapisBlock: 1 },
    erosion: { kelp: 3, redstoneBlock: 1 },
    defense: { kelp: 3, ironIngot: 1 },
    regen: { kelp: 3, goldIngot: 1 },
    poison: { kelp: 3, diamond: 1 }
};

// 3성 - 엘릭서에서 재료로 변환 (조합법 수정 반영)
export const ELIXIR_TO_MATERIAL_3STAR = {
    guard: { seaSquirt: 1, glassBottle: 3, endStone: 1 },
    wave: { seaSquirt: 1, glassBottle: 3, endStoneBrick: 1 },
    chaos: { seaSquirt: 1, glassBottle: 3, chorusFruit: 4 },
    life: { seaSquirt: 1, glassBottle: 3, poppedChorusFruit: 4 },
    decay: { seaSquirt: 1, glassBottle: 3, purpurBlock: 1 }
};

// 3성 - 의약에서 재료로 변환 (조합법 수정 반영)
export const POTION_TO_MATERIAL_3STAR = {
    immortal: { driedKelp: 5, glowBerry: 2, deadTubeCoral: 1 },
    barrier: { driedKelp: 5, glowBerry: 2, deadBrainCoral: 1 },
    corrupt: { driedKelp: 5, glowBerry: 2, deadBubbleCoral: 1 },
    frenzy: { driedKelp: 5, glowBerry: 2, deadFireCoral: 1 },
    venom: { driedKelp: 5, glowBerry: 2, deadHornCoral: 1 }
};

// 3성 - 의약에서 엘릭서로 변환
export const POTION_TO_ELIXIR_3STAR = {
    immortal: { guard: 1, life: 1 },
    barrier: { guard: 1, wave: 1 },
    corrupt: { chaos: 1, decay: 1 },
    frenzy: { chaos: 1, life: 1 },
    venom: { wave: 1, decay: 1 }
};

// 낚싯대 강화 데이터
export const ROD_DATA = {
    1: { drop: 1, clamRate: 0 },
    2: { drop: 1, clamRate: 0.01 },
    3: { drop: 2, clamRate: 0.01 },
    4: { drop: 2, clamRate: 0.01 },
    5: { drop: 2, clamRate: 0.02 },
    6: { drop: 3, clamRate: 0.02 },
    7: { drop: 3, clamRate: 0.02 },
    8: { drop: 3, clamRate: 0.03 },
    9: { drop: 4, clamRate: 0.03 },
    10: { drop: 4, clamRate: 0.03 },
    11: { drop: 4, clamRate: 0.05 },
    12: { drop: 5, clamRate: 0.05 },
    13: { drop: 5, clamRate: 0.05 },
    14: { drop: 5, clamRate: 0.05 },
    15: { drop: 6, clamRate: 0.10 }
};

// 전문가 스킬 데이터
export const EXPERT_SKILLS = {
    storm: [0, 0.01, 0.03, 0.05, 0.07, 0.10],
    clamRefill: [0, 0.01, 0.015, 0.02, 0.025, 0.03, 0.035, 0.04, 0.045, 0.05, 0.07]
};
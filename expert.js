document.addEventListener("DOMContentLoaded", () => {

    // 전문가별 최대 LV
    const expertMaxLV = {
        "expert-clam-level": 6,
        "expert-premium-price": 6,
        "expert-storm": 5,
        "expert-star": 6,
        "expert-clam-refill": 10
    };

    // 각 input 요소 감시
    Object.keys(expertMaxLV).forEach(id => {
        const input = document.getElementById(id);
        input.addEventListener("input", () => {
            const max = expertMaxLV[id];
            if (Number(input.value) > max) {
                input.style.borderColor = "#dc2626"; // 붉은 테두리
                input.style.color = "#dc2626";
            } else {
                input.style.borderColor = ""; // 기본 색
                input.style.color = "";       // 기본 색
            }
        });
    });
});
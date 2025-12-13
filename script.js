function openTab(tabName, elmnt) {
    const tabs = document.getElementsByClassName("tab");
    for (let i = 0; i < tabs.length; i++) tabs[i].style.display = "none";

    const navLinks = document.querySelectorAll("nav a");
    navLinks.forEach(link => link.classList.remove("active"));

    document.getElementById(tabName).style.display = "block";
    if (elmnt) elmnt.classList.add("active");
}

function openSubTab(tabId, elmnt) {
    const parent = elmnt.closest('.tab');
    const contents = parent.querySelectorAll('.sub-tab-content');
    contents.forEach(c => c.style.display = 'none');

    const buttons = parent.querySelectorAll('.sub-tab');
    buttons.forEach(b => b.classList.remove('active'));

    document.getElementById(tabId).style.display = 'block';
    elmnt.classList.add('active');
}

document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       기존 정수·핵 토글
       ========================= */
    const toggleBtn = document.getElementById("ocean-toggleExisting");
    const existingBox = document.getElementById("ocean-existingInputs");

    toggleBtn.addEventListener("click", () => {
        const isOpen = existingBox.style.display === "flex";
        existingBox.style.display = isOpen ? "none" : "flex";
    });

    /* =========================
       계산 버튼 연결
       ========================= */
    const calcBtn = document.getElementById("ocean-calcBtn");
    const resultBox = document.getElementById("ocean-result");

    calcBtn.addEventListener("click", () => {

        /* ✅ 이미 결과가 열려 있으면 닫기 */
        if (resultBox.style.display === "block") {
            resultBox.style.display = "none";
            return;
        }

        /* 입력값 수집 */
        const input = {
            g: Number(document.getElementById("ocean-굴").value) || 0,
            s: Number(document.getElementById("ocean-소라").value) || 0,
            o: Number(document.getElementById("ocean-문어").value) || 0,
            m: Number(document.getElementById("ocean-미역").value) || 0,
            u: Number(document.getElementById("ocean-성게").value) || 0,

            eG_exist: Number(document.getElementById("ocean-eG_exist").value) || 0,
            eW_exist: Number(document.getElementById("ocean-eW_exist").value) || 0,
            eC_exist: Number(document.getElementById("ocean-eC_exist").value) || 0,
            eL_exist: Number(document.getElementById("ocean-eL_exist").value) || 0,
            eCo_exist: Number(document.getElementById("ocean-eCo_exist").value) || 0,

            cWG_exist: Number(document.getElementById("ocean-cWG_exist").value) || 0,
            cWP_exist: Number(document.getElementById("ocean-cWP_exist").value) || 0,
            cOD_exist: Number(document.getElementById("ocean-cOD_exist").value) || 0,
            cVD_exist: Number(document.getElementById("ocean-cVD_exist").value) || 0,
            cED_exist: Number(document.getElementById("ocean-cED_exist").value) || 0,
        };

        /* calc.js 로직 실행 */
        const result = calculateCoreOptimization(input);

        if (!result) {
            resultBox.style.display = "block";
            resultBox.innerHTML = "<b>❌ 조건을 만족하는 조합이 없습니다.</b>";
            return;
        }

        /* 결과 출력 */
        resultBox.style.display = "block";
        resultBox.innerHTML = `
            <h3>📊 최적 조합 결과</h3>
            <p><b>💰 최대 골드</b>: ${result.bestGold.toLocaleString()}</p>

            <p><b>리바이던의 깃털</b>: ${result.bestL}</p>
            <p><b>크라켄의 광란체</b>: ${result.bestK}</p>
            <p><b>영생의 아쿠티스</b>: ${result.bestA}</p>


            <hr>

            <h4>🔹 필요 정수 제작</h4>
            <p>수호 정수 ${result.make_eG}, 파동 정수 ${result.make_eW}, 혼란 정수 ${result.make_eC}</p>
            <p>생명 정수 ${result.make_eL}, 부식 정수 ${result.make_eCo}</p>


            <hr>

            <h4>🔹 필요 공예품 제작</h4>
            <p>물결 수호 ${result.needMake_WG}, 파동 오염 ${result.needMake_WP}, 질서 파괴 ${result.needMake_OD}</p>
            <p>활력 붕괴  ${result.needMake_VD}, 침식 방어 ${result.needMake_ED}</p>


            <hr>

            <h4>🔹 필요 재료</h4>
            <p>점토 ${result.need_clay}, 모래 ${result.need_sand}, 흙 ${result.need_dirt}, 자갈 ${result.need_gravel}, 화강암 ${result.need_granite}</p>

            <hr>

            <h4>🔹 필요 물고기</h4>
            <p>새우 ${result.need_shrimp}, 도미 ${result.need_domi}, 청어 ${result.need_herring}, 금붕어 ${result.need_goldfish}, 농어 ${result.need_bass}</p>
        `;
    });
});

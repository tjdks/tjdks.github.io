document.addEventListener('DOMContentLoaded', () => {
    const calculateBtn = document.getElementById('calculateBtn');
    const resultDiv = document.getElementById('result');

    calculateBtn.addEventListener('click', () => {
        // 해양 입력값
        const g = parseInt(document.getElementById('굴').value) || 0;
        const s = parseInt(document.getElementById('소라').value) || 0;
        const o = parseInt(document.getElementById('문어').value) || 0;
        const m = parseInt(document.getElementById('미역').value) || 0;
        const u = parseInt(document.getElementById('성게').value) || 0;

        // 기존 보유 정수
        const eG_exist = parseInt(document.getElementById('eG_exist').value) || 0;
        const eW_exist = parseInt(document.getElementById('eW_exist').value) || 0;
        const eC_exist = parseInt(document.getElementById('eC_exist').value) || 0;
        const eL_exist = parseInt(document.getElementById('eL_exist').value) || 0;
        const eCo_exist = parseInt(document.getElementById('eCo_exist').value) || 0;

        // 기존 보유 핵
        const cWG_exist = parseInt(document.getElementById('cWG_exist').value) || 0;
        const cWP_exist = parseInt(document.getElementById('cWP_exist').value) || 0;
        const cOD_exist = parseInt(document.getElementById('cOD_exist').value) || 0;
        const cVD_exist = parseInt(document.getElementById('cVD_exist').value) || 0;
        const cED_exist = parseInt(document.getElementById('cED_exist').value) || 0;

        // 신규 정수 계산
        const tot_eG = eG_exist + g;
        const tot_eW = eW_exist + s;
        const tot_eC = eC_exist + o;
        const tot_eL = eL_exist + m;
        const tot_eCo = eCo_exist + u;

        let bestGold = -1;
        let bestA = 0, bestK = 0, bestL = 0;

        for (let A = 0; A <= 200; A++) {
            for (let K = 0; K <= 200; K++) {
                for (let L = 0; L <= 200; L++) {
                    const need_WG = A + L;
                    const need_WP = K + L;
                    const need_OD = A + K;
                    const need_VD = A + K;
                    const need_ED = L;

                    const make_WG = Math.max(0, need_WG - cWG_exist);
                    const make_WP = Math.max(0, need_WP - cWP_exist);
                    const make_OD = Math.max(0, need_OD - cOD_exist);
                    const make_VD = Math.max(0, need_VD - cVD_exist);
                    const make_ED = Math.max(0, need_ED - cED_exist);

                    const req_eG = make_WG + make_ED;
                    const req_eW = make_WG + make_WP;
                    const req_eC = make_WP + make_OD;
                    const req_eL = make_OD + make_VD;
                    const req_eCo = make_VD + make_ED;

                    if (req_eG <= tot_eG && req_eW <= tot_eW && req_eC <= tot_eC &&
                        req_eL <= tot_eL && req_eCo <= tot_eCo) {
                        const gold = A * 2403 + K * 2438 + L * 2512;
                        if (gold > bestGold) {
                            bestGold = gold;
                            bestA = A; bestK = K; bestL = L;
                        }
                    }
                }
            }
        }

        if (bestGold < 0) {
            resultDiv.innerHTML = "<b>현재 자원으로 만들 수 있는 조합이 없습니다.</b>";
            return;
        }

        const used_WG = bestA + bestL;
        const used_WP = bestK + bestL;
        const used_OD = bestA + bestK;
        const used_VD = bestA + bestK;
        const used_ED = bestL;

        const needMake_WG = Math.max(0, used_WG - cWG_exist);
        const needMake_WP = Math.max(0, used_WP - cWP_exist);
        const needMake_OD = Math.max(0, used_OD - cOD_exist);
        const needMake_VD = Math.max(0, used_VD - cVD_exist);
        const needMake_ED = Math.max(0, used_ED - cED_exist);

        const make_eG = Math.max(0, needMake_WG + needMake_ED - eG_exist);
        const make_eW = Math.max(0, needMake_WG + needMake_WP - eW_exist);
        const make_eC = Math.max(0, needMake_WP + needMake_OD - eC_exist);
        const make_eL = Math.max(0, needMake_OD + needMake_VD - eL_exist);
        const make_eCo = Math.max(0, needMake_VD + needMake_ED - eCo_exist);

        resultDiv.innerHTML = `
            <b>최종 결과:</b><br>
            영생의 아쿠티스: ${bestA}<br>
            크라켄의 광란체: ${bestK}<br>
            리바이던의 깃털: ${bestL}<br>
            <b>총 획득 골드:</b> ${bestGold} G<br><br>

            <b>필요 정수:</b><br>
            수호: ${make_eG}, 파동: ${make_eW}, 혼란: ${make_eC}, 생명: ${make_eL}, 부식: ${make_eCo}<br><br>

            <b>필요 핵:</b><br>
            물결 수호: ${needMake_WG}, 파동 오염: ${needMake_WP}, 질서 파괴: ${needMake_OD}, 활력 붕괴: ${needMake_VD}, 침식 방어: ${needMake_ED}
        `;
    });

    // 기존 보유량 토글
    document.getElementById('toggleExisting').addEventListener('click', () => {
        const div = document.getElementById('existingInputs');
        div.style.display = div.style.display === 'none' ? 'block' : 'none';
    });
});

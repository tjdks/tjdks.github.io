/*************************************************
 * 공통 유틸
 *************************************************/
function add(target, src, mul = 1) {
    for (let k in src) {
        target[k] = (target[k] || 0) + src[k] * mul;
    }
}





/*************************************************
 * 1/2/3성 계산기 세트 모드 통합 JS
 *************************************************/

document.addEventListener('DOMContentLoaded', () => {

    const SET_COUNT = 64;
    const setSwitcher = document.getElementById('switcher-set');

    // ===== 입력칸 span 생성 + 세트 표시 함수 =====
    function setupInputSetDisplay(container) {
        const inputs = container.querySelectorAll('.input-grid input');

        inputs.forEach(input => {
            // 기존 span 확인 후 없으면 생성
            let span = input.parentNode.querySelector('.set-display');
            if (!span) {
                span = document.createElement('span');
                span.className = 'set-display';
                input.parentNode.appendChild(span);
            }

            input.addEventListener('input', () => {
                const value = parseInt(input.value) || 0;
                if (setSwitcher.checked) {
                    const sets = Math.floor(value / SET_COUNT);
                    const remainder = value % SET_COUNT;
                    span.textContent = ` ${sets} / ${remainder}`;
                } else {
                    span.textContent = '';
                }
            });

            // 초기 상태 반영
            if (!setSwitcher.checked) span.textContent = '';
        });
    }

    // ===== 성급 선택 시 입력칸 span 초기화 =====
    window.switchStarLevel = function(level) {
        const starCards = document.querySelectorAll('.star-level');
        starCards.forEach(card => card.style.display = 'none');

        const current = document.getElementById('star-' + level);
        current.style.display = 'block';

        // 현재 성급 입력칸 span 생성/초기화
        setupInputSetDisplay(current);
    };

    // ===== 세트 스위치 토글 시 입력칸 + 결과창 반영 =====
    setSwitcher.addEventListener('change', () => {
        const currentStar = document.querySelector('.star-level:not([style*="display: none"])');
        if (currentStar) {
            // 입력칸 span 업데이트
            const inputs = currentStar.querySelectorAll('.input-grid input');
            inputs.forEach(input => {
                const value = parseInt(input.value) || 0;
                const span = input.parentNode.querySelector('.set-display');
                if (!span) return;
                if (setSwitcher.checked) {
                    const sets = Math.floor(value / SET_COUNT);
                    const remainder = value % SET_COUNT;
                    span.textContent = ` ${sets} / ${remainder}`;
                } else {
                    span.textContent = '';
                }
            });
        }

        // 결과창 업데이트
        if (window.last1StarResult) window.update1StarResult(window.last1StarResult);
        if (window.last2StarResult) window.update2StarResult(window.last2StarResult);
        if (window.last3StarResult) window.update3StarResult(window.last3StarResult);
    });

    // ===== 초기화: 첫 화면 1성 입력 span 생성 =====
    const firstStar = document.getElementById('star-1');
    if (firstStar) setupInputSetDisplay(firstStar);

});
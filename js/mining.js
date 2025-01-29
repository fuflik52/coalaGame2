document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        if (item.getAttribute('data-section') === 'mining') {
            item.addEventListener('click', () => {
                // Проверяем, активен ли раздел майнинга
                if (document.querySelector('.mining-section.active')) {
                    showNotification('Раздел находится в разработке', 'info');
                }
            });
        }
    });

    // Добавляем обработчик для обновления контента только когда раздел активен
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.target.classList.contains('mining-section') && 
                mutation.target.classList.contains('active')) {
                initializeMiningSection();
            }
        });
    });

    const miningSection = document.querySelector('.mining-section');
    if (miningSection) {
        observer.observe(miningSection, { 
            attributes: true, 
            attributeFilter: ['class'] 
        });
    }
});

function initializeMiningSection() {
    const miningSection = document.querySelector('.mining-section');
    if (!miningSection || !miningSection.classList.contains('active')) return;

    // Здесь можно добавить инициализацию контента раздела майнинга
    // когда он будет готов к реализации

    miningSection.innerHTML = `
        <div class="dev-section">
            <div class="dev-header">
                <img src="https://i.postimg.cc/Y2PdgmFX/image.png" alt="Mining">
                <h2>Майнинг-ферма</h2>
                <div class="dev-status">В разработке</div>
            </div>
            
            <div class="dev-cards">
                <div class="dev-card">
                    <div class="dev-card-icon">🏭</div>
                    <h3 class="dev-card-title">Автоматический майнинг</h3>
                    <p class="dev-card-text">Создавайте и улучшайте свою майнинг-ферму</p>
                </div>
                <div class="dev-card">
                    <div class="dev-card-icon">⚡</div>
                    <h3 class="dev-card-title">Бустеры</h3>
                    <p class="dev-card-text">Ускоряйте добычу с помощью бустеров</p>
                </div>
                <div class="dev-card">
                    <div class="dev-card-icon">📊</div>
                    <h3 class="dev-card-title">Статистика</h3>
                    <p class="dev-card-text">Отслеживайте свой прогресс</p>
                </div>
            </div>
            
            <div class="dev-progress">
                <div class="dev-progress-info">
                    <span class="dev-version">Версия 0.0.1</span>
                    <span class="dev-date">До релиза: 14 дней</span>
                </div>
                
                <div class="dev-bar">
                    <div class="dev-bar-fill" style="width: 65%"></div>
                </div>
                
                <div class="dev-stages">
                    <div class="dev-stage done">
                        <div class="dev-stage-dot"></div>
                        <span class="dev-stage-text">Дизайн</span>
                    </div>
                    <div class="dev-stage done">
                        <div class="dev-stage-dot"></div>
                        <span class="dev-stage-text">Разработка</span>
                    </div>
                    <div class="dev-stage current">
                        <div class="dev-stage-dot"></div>
                        <span class="dev-stage-text">Тестирование</span>
                    </div>
                    <div class="dev-stage">
                        <div class="dev-stage-dot"></div>
                        <span class="dev-stage-text">Релиз</span>
                    </div>
                </div>
            </div>
        </div>
    `;
} 
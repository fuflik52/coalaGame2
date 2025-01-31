document.addEventListener('DOMContentLoaded', () => {
    // Инициализация при клике на пункт меню
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        if (item.getAttribute('data-section') === 'mining') {
            item.addEventListener('click', () => {
                const miningSection = document.querySelector('.mining-section');
                if (miningSection && miningSection.classList.contains('active')) {
                    if (!window.mining) {
                        window.mining = new Mining();
                    }
                }
            });
        }
        if (item.getAttribute('data-section') === 'rewards') {
            item.addEventListener('click', () => {
                showRewardsGameplay();
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

    // Ждем создания контейнера
    const checkContainer = setInterval(() => {
        const container = document.querySelector('.content-container');
        if (container) {
            clearInterval(checkContainer);
            // Инициализируем майнинг если мы находимся в разделе майнинга
            if (document.querySelector('.mining-section.active')) {
                window.mining = new Mining();
            }
        }
    }, 100);
});

function showMiningGameplay() {
    const miningSection = document.querySelector('.mining-section');
    if (!miningSection) return;

    miningSection.innerHTML = `
        <div class="mining-container">
            <div class="mining-header">
                <h2>Майнинг-ферма</h2>
                <div class="mining-stats">
                    <div class="mining-stat">
                        <i class="fas fa-bolt"></i>
                        <span class="mining-power">Мощность: 1</span>
                    </div>
                    <div class="mining-stat">
                        <i class="fas fa-tachometer-alt"></i>
                        <span class="mining-speed">Скорость: 0/сек</span>
                    </div>
                </div>
            </div>
            
            <div class="mining-progress">
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
                <div class="mining-animation">
                    <i class="fas fa-microchip pulse"></i>
                </div>
            </div>

            <div class="upgrades-container">
                <h3>Улучшения</h3>
                <div class="upgrade-cards">
                    <div class="upgrade-card" data-type="basic">
                        <div class="upgrade-icon">
                            <i class="fas fa-microchip"></i>
                        </div>
                        <div class="upgrade-info">
                            <h4>Базовый майнер</h4>
                            <p>Уровень: <span class="level">1</span></p>
                            <p>Мощность: +1</p>
                            <button class="upgrade-button">
                                Улучшить <span class="cost">100</span>
                                <i class="fas fa-coins"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="upgrade-card" data-type="advanced">
                        <div class="upgrade-icon">
                            <i class="fas fa-server"></i>
                        </div>
                        <div class="upgrade-info">
                            <h4>Продвинутый майнер</h4>
                            <p>Уровень: <span class="level">0</span></p>
                            <p>Мощность: +5</p>
                            <button class="upgrade-button">
                                Улучшить <span class="cost">500</span>
                                <i class="fas fa-coins"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="upgrade-card" data-type="premium">
                        <div class="upgrade-icon">
                            <i class="fas fa-database"></i>
                        </div>
                        <div class="upgrade-info">
                            <h4>Премиум майнер</h4>
                            <p>Уровень: <span class="level">0</span></p>
                            <p>Мощность: +20</p>
                            <button class="upgrade-button">
                                Улучшить <span class="cost">2000</span>
                                <i class="fas fa-coins"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    if (!window.mining) {
        window.mining = new Mining();
    }
}

function showRewardsGameplay() {
    const rewardsSection = document.querySelector('.rewards-section');
    if (!rewardsSection) return;

    rewardsSection.innerHTML = `
        <div class="rewards-container">
            <div class="rewards-header">
                <h2>Ежедневные награды</h2>
                <div class="rewards-total">
                    <i class="fas fa-coins"></i>
                    <span>Всего получено: <span class="total-earned">0</span></span>
                </div>
            </div>

            <div class="rewards-grid">
                <div class="reward-card" data-id="daily">
                    <div class="reward-icon">
                        <i class="fas fa-calendar-check"></i>
                    </div>
                    <div class="reward-info">
                        <h3>Ежедневный бонус</h3>
                        <div class="reward-amount">
                            <i class="fas fa-coins"></i>
                            <span>100</span>
                        </div>
                        <div class="reward-timer" data-id="daily">
                            Доступно через: <span>00:00:00</span>
                        </div>
                    </div>
                    <button class="claim-button" data-id="daily">
                        Получить
                    </button>
                </div>

                <div class="reward-card" data-id="achievement">
                    <div class="reward-icon">
                        <i class="fas fa-trophy"></i>
                    </div>
                    <div class="reward-info">
                        <h3>Достижение</h3>
                        <div class="reward-amount">
                            <i class="fas fa-coins"></i>
                            <span>500</span>
                        </div>
                        <div class="reward-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 0%"></div>
                            </div>
                            <span>0/100</span>
                        </div>
                    </div>
                    <button class="claim-button" data-id="achievement" disabled>
                        Получить
                    </button>
                </div>

                <div class="reward-card" data-id="referral">
                    <div class="reward-icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="reward-info">
                        <h3>Приведи друга</h3>
                        <div class="reward-amount">
                            <i class="fas fa-coins"></i>
                            <span>1000</span>
                        </div>
                        <p>Пригласите друзей и получите награду</p>
                    </div>
                    <button class="claim-button" data-id="referral">
                        Пригласить
                    </button>
                </div>
            </div>
        </div>
    `;

    if (!window.rewards) {
        window.rewards = new Rewards();
    }
}

function initializeMiningSection() {
    const miningSection = document.querySelector('.mining-section');
    if (!miningSection || !miningSection.classList.contains('active')) return;

    miningSection.innerHTML = `
        <div class="mining-container">
            <div class="mining-header">
                <h2>Майнинг</h2>
                <div class="mining-stats">
                    <div class="mining-stat">
                        <i class="fas fa-bolt"></i>
                        <span class="mining-power">Мощность: 1</span>
                    </div>
                    <div class="mining-stat">
                        <i class="fas fa-tachometer-alt"></i>
                        <span class="mining-speed">Скорость: 0/сек</span>
                    </div>
                </div>
            </div>
            
            <div class="mining-progress">
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
                <div class="mining-animation">
                    <i class="fas fa-microchip pulse"></i>
                </div>
            </div>

            <div class="upgrades-container">
                <h3>Улучшения</h3>
                <div class="upgrade-cards">
                    <div class="upgrade-card" data-type="basic">
                        <div class="upgrade-icon">
                            <i class="fas fa-microchip"></i>
                        </div>
                        <div class="upgrade-info">
                            <h4>Базовый майнер</h4>
                            <p>Уровень: <span class="level">1</span></p>
                            <p>Мощность: +1</p>
                            <button class="upgrade-button">
                                Улучшить <span class="cost">100</span>
                                <i class="fas fa-coins"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="upgrade-card" data-type="advanced">
                        <div class="upgrade-icon">
                            <i class="fas fa-server"></i>
                        </div>
                        <div class="upgrade-info">
                            <h4>Продвинутый майнер</h4>
                            <p>Уровень: <span class="level">0</span></p>
                            <p>Мощность: +5</p>
                            <button class="upgrade-button">
                                Улучшить <span class="cost">500</span>
                                <i class="fas fa-coins"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="upgrade-card" data-type="premium">
                        <div class="upgrade-icon">
                            <i class="fas fa-database"></i>
                        </div>
                        <div class="upgrade-info">
                            <h4>Премиум майнер</h4>
                            <p>Уровень: <span class="level">0</span></p>
                            <p>Мощность: +20</p>
                            <button class="upgrade-button">
                                Улучшить <span class="cost">2000</span>
                                <i class="fas fa-coins"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Инициализируем функционал майнинга
    window.mining = new Mining();
}

class Mining {
    constructor() {
        this.miningPower = 1;
        this.currentMiningSpeed = 0;
        this.upgrades = {
            basic: { level: 1, cost: 100, power: 1 },
            advanced: { level: 0, cost: 500, power: 5 },
            premium: { level: 0, cost: 2000, power: 20 }
        };
        
        this.initializeUI();
        this.initializeEventListeners();
        this.startMining();
    }

    initializeUI() {
        const miningSection = document.querySelector('.mining-section');
        if (!miningSection) return;

        miningSection.innerHTML = `
            <div class="mining-container">
                <div class="mining-header">
                    <h2>Майнинг-ферма</h2>
                    <div class="mining-stats">
                        <div class="mining-stat">
                            <i class="fas fa-bolt"></i>
                            <span class="mining-power">Мощность: ${this.miningPower}</span>
                        </div>
                        <div class="mining-stat">
                            <i class="fas fa-tachometer-alt"></i>
                            <span class="mining-speed">Скорость: ${this.currentMiningSpeed}/сек</span>
                        </div>
                    </div>
                </div>
                
                <div class="mining-progress">
                    <div class="progress-bar">
                        <div class="progress-fill"></div>
                    </div>
                    <div class="mining-animation">
                        <i class="fas fa-microchip pulse"></i>
                    </div>
                </div>

                <div class="upgrades-container">
                    <h3>Улучшения</h3>
                    <div class="upgrade-cards">
                        <div class="upgrade-card" data-type="basic">
                            <div class="upgrade-icon">
                                <i class="fas fa-microchip"></i>
                            </div>
                            <div class="upgrade-info">
                                <h4>Базовый майнер</h4>
                                <p>Уровень: <span class="level">1</span></p>
                                <p>Мощность: +1</p>
                                <button class="upgrade-button">
                                    Улучшить <span class="cost">100</span>
                                    <i class="fas fa-coins"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div class="upgrade-card" data-type="advanced">
                            <div class="upgrade-icon">
                                <i class="fas fa-server"></i>
                            </div>
                            <div class="upgrade-info">
                                <h4>Продвинутый майнер</h4>
                                <p>Уровень: <span class="level">0</span></p>
                                <p>Мощность: +5</p>
                                <button class="upgrade-button">
                                    Улучшить <span class="cost">500</span>
                                    <i class="fas fa-coins"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div class="upgrade-card" data-type="premium">
                            <div class="upgrade-icon">
                                <i class="fas fa-database"></i>
                            </div>
                            <div class="upgrade-info">
                                <h4>Премиум майнер</h4>
                                <p>Уровень: <span class="level">0</span></p>
                                <p>Мощность: +20</p>
                                <button class="upgrade-button">
                                    Улучшить <span class="cost">2000</span>
                                    <i class="fas fa-coins"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    initializeEventListeners() {
        const upgradeButtons = document.querySelectorAll('.upgrade-button');
        upgradeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const card = e.target.closest('.upgrade-card');
                const type = card.dataset.type;
                this.purchaseUpgrade(type);
            });
        });
    }

    purchaseUpgrade(type) {
        const upgrade = this.upgrades[type];
        if (window.game && window.game.balance >= upgrade.cost) {
            window.game.balance -= upgrade.cost;
            upgrade.level++;
            upgrade.cost = Math.floor(upgrade.cost * 1.5);
            this.miningPower += upgrade.power;
            
            this.updateUI();
            window.game.updateBalanceDisplay();
            
            window.game.showNotification({
                title: 'Улучшение куплено!',
                message: `Мощность майнинга увеличена на ${upgrade.power}`,
                type: 'success'
            });
        } else {
            window.game.showNotification({
                title: 'Недостаточно средств',
                message: 'Заработайте больше монет для покупки улучшения',
                type: 'error'
            });
        }
    }

    updateUI() {
        document.querySelector('.mining-power').textContent = `Мощность: ${this.miningPower}`;
        document.querySelector('.mining-speed').textContent = `Скорость: ${this.currentMiningSpeed}/сек`;
        
        Object.entries(this.upgrades).forEach(([type, upgrade]) => {
            const card = document.querySelector(`.upgrade-card[data-type="${type}"]`);
            if (card) {
                card.querySelector('.level').textContent = upgrade.level;
                card.querySelector('.cost').textContent = upgrade.cost;
            }
        });
    }

    startMining() {
        setInterval(() => {
            if (window.game) {
                this.currentMiningSpeed = this.miningPower / 10;
                window.game.balance += this.currentMiningSpeed;
                window.game.updateBalanceDisplay();
                this.updateUI();
                this.updateProgressBar();
            }
        }, 1000);
    }

    updateProgressBar() {
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            progressFill.style.width = '100%';
            progressFill.style.transition = 'width 1s linear';
            setTimeout(() => {
                progressFill.style.width = '0%';
            }, 50);
        }
    }
} 
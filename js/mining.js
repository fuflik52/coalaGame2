// Наблюдаем за изменениями в DOM
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
            mutation.addedNodes.forEach((node) => {
                if (node.classList && node.classList.contains('mining-section')) {
                    if (!window.mining) {
                        initializeMining();
                    }
                }
            });
        }
    });
});

// Начинаем наблюдение за изменениями в DOM
observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Функция инициализации майнинга
async function initializeMining() {
    try {
        // Ждем инициализацию базы данных и Telegram ID
        await waitForDatabase();
        await initializeTelegramId();
        
        // Создаем экземпляр майнинга
        window.mining = new Mining();
    } catch (error) {
        console.error('Ошибка при инициализации майнинга:', error);
    }
}

class Mining {
    constructor() {
        // Загружаем сохраненные данные или используем начальные значения
        const savedData = localStorage.getItem('miningData');
        const initialData = savedData ? JSON.parse(savedData) : {
            miningRate: 0,
            energyUsage: 0,
            upgrades: [
                {
                    id: 'miner_1',
                    name: 'Базовый майнер',
                    cost: 100,
                    rate: 1,
                    energy: 1,
                    level: 0,
                    maxLevel: 10
                },
                {
                    id: 'miner_2',
                    name: 'Продвинутый майнер',
                    cost: 500,
                    rate: 5,
                    energy: 4,
                    level: 0,
                    maxLevel: 5
                },
                {
                    id: 'miner_3',
                    name: 'Супер майнер',
                    cost: 2000,
                    rate: 20,
                    energy: 15,
                    level: 0,
                    maxLevel: 3
                }
            ]
        };

        this.miningRate = initialData.miningRate;
        this.energyUsage = initialData.energyUsage;
        this.upgrades = initialData.upgrades;

        this.initializeUpgrades();
        this.startMining();
        this.updateStats();
        this.startBalanceCheck();
    }

    startBalanceCheck() {
        // Проверяем баланс каждую секунду
        setInterval(() => {
            this.updateUpgradeButtons();
        }, 1000);
    }

    getBalance() {
        // Получаем баланс из основного интерфейса игры
        const balanceElement = document.querySelector('.user-info .balance');
        if (balanceElement) {
            const balanceText = balanceElement.textContent.trim();
            return parseInt(balanceText) || 0;
        }
        return 0;
    }

    updateUpgradeButtons() {
        const balance = this.getBalance();
        
        this.upgrades.forEach(upgrade => {
            const button = document.querySelector(`#upgrade-${upgrade.id} .upgrade-button`);
            if (button) {
                const cost = this.calculateCost(upgrade);
                const canAfford = balance >= cost;
                const isMaxLevel = upgrade.level >= upgrade.maxLevel;
                
                button.disabled = !canAfford || isMaxLevel;
                
                if (!canAfford) {
                    button.style.opacity = '0.5';
                    button.style.cursor = 'not-allowed';
                } else {
                    button.style.opacity = '1';
                    button.style.cursor = 'pointer';
                }
            }
        });
    }

    initializeUpgrades() {
        const upgradeCards = document.getElementById('upgradeCards');
        if (!upgradeCards) return;

        upgradeCards.innerHTML = '';
        
        this.upgrades.forEach(upgrade => {
            const card = document.createElement('div');
            card.className = `upgrade-card ${upgrade.level > 0 ? 'upgraded' : ''}`;
            card.id = `upgrade-${upgrade.id}`;
            
            const stats = [
                `+${upgrade.rate} монет/сек`,
                `+${upgrade.energy} энергии/сек`
            ];
            
            const cost = this.calculateCost(upgrade);
            const balance = this.getBalance();
            const canAfford = balance >= cost;
            const isMaxLevel = upgrade.level >= upgrade.maxLevel;
            
            card.innerHTML = `
                <div class="upgrade-info">
                    <h3>${upgrade.name}</h3>
                    <div class="upgrade-stats">
                        ${stats.map(stat => `<span>${stat}</span>`).join('')}
                    </div>
                    <div class="upgrade-level">
                        Уровень: ${upgrade.level}/${upgrade.maxLevel}
                    </div>
                </div>
                <button class="upgrade-button" onclick="mining.upgrade('${upgrade.id}')" ${(!canAfford || isMaxLevel) ? 'disabled' : ''}>
                    Улучшить за ${cost}
                    <img src="https://i.postimg.cc/FFx7T4Bh/image.png" alt="coins" class="coin-icon">
                </button>
            `;
            
            upgradeCards.appendChild(card);
        });
    }

    calculateCost(upgrade) {
        return Math.floor(upgrade.cost * Math.pow(1.5, upgrade.level));
    }

    upgrade(upgradeId) {
        const upgrade = this.upgrades.find(u => u.id === upgradeId);
        if (!upgrade) return;

        const cost = this.calculateCost(upgrade);
        const balance = this.getBalance();

        if (balance < cost) {
            console.log('Недостаточно монет:', balance, '<', cost);
            return;
        }
        if (upgrade.level >= upgrade.maxLevel) {
            console.log('Достигнут максимальный уровень');
            return;
        }

        // Обновляем баланс через основную систему игры
        if (window.updateBalance) {
            window.updateBalance(-cost);
        }

        // Обновляем уровень улучшения
        upgrade.level++;
        this.miningRate += upgrade.rate;
        this.energyUsage += upgrade.energy;

        // Сохраняем данные
        this.saveData();

        // Обновляем интерфейс
        this.initializeUpgrades();
        this.updateStats();
    }

    startMining() {
        setInterval(() => {
            if (this.miningRate > 0) {
                // Добавляем монеты через основную систему игры
                if (window.updateBalance) {
                    window.updateBalance(this.miningRate);
                }
                
                // Создаем эффект появления монет
                this.showMiningEffect();
            }
        }, 1000);
    }

    showMiningEffect() {
        // Добавляем визуальный эффект при майнинге
        const miningContainer = document.querySelector('.mining-container');
        if (!miningContainer) return;

        const particle = document.createElement('div');
        particle.className = 'mining-particle';
        particle.innerHTML = `<img src="https://i.postimg.cc/FFx7T4Bh/image.png" alt="coin" style="width: 16px; height: 16px;">`;
        
        // Случайное начальное положение
        const startX = Math.random() * 40 - 20;
        particle.style.cssText = `
            position: absolute;
            left: 50%;
            bottom: 100%;
            transform: translateX(${startX}px);
            animation: float-up 1s ease-out forwards;
        `;

        miningContainer.appendChild(particle);
        
        // Удаляем частицу после анимации
        setTimeout(() => particle.remove(), 1000);
    }

    updateStats() {
        const miningRateElement = document.getElementById('miningRate');
        const energyUsageElement = document.getElementById('energyUsage');

        if (miningRateElement) {
            miningRateElement.innerText = this.miningRate;
        }
        if (energyUsageElement) {
            energyUsageElement.innerText = this.energyUsage;
        }

        // Обновляем визуальное отображение кнопок
        this.updateUpgradeButtons();
    }

    saveData() {
        const data = {
            miningRate: this.miningRate,
            energyUsage: this.energyUsage,
            upgrades: this.upgrades
        };
        localStorage.setItem('miningData', JSON.stringify(data));
    }
}

// Добавляем стили для частиц
const style = document.createElement('style');
style.textContent = `
    @keyframes float-up {
        0% {
            transform: translateY(0) scale(1);
            opacity: 0.8;
        }
        100% {
            transform: translateY(-100px) scale(0.5);
            opacity: 0;
        }
    }

    @keyframes particle-burst {
        0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
        }
        100% {
            transform: translate(var(--x, 50px), var(--y, -50px)) scale(0);
            opacity: 0;
        }
    }

    .mining-particle {
        z-index: 100;
    }

    .upgrade-particle {
        z-index: 100;
    }
`;
document.head.appendChild(style);

// Инициализация при загрузке страницы
let mining = null;
document.addEventListener('DOMContentLoaded', () => {
    mining = new Mining();
}); 
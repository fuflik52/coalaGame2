document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Ждем инициализацию Telegram WebApp и базы данных
        await waitForDatabase();
        await initializeTelegramId();

        // Получаем Telegram ID
        const currentTelegramId = window.currentTelegramId;
        if (!currentTelegramId) {
            console.error('Нет данных пользователя Telegram');
            return;
        }

        // Инициализируем данные пользователя
        let userData = await window.db.getUserData(currentTelegramId);
        if (!userData) {
            const username = window.tg?.initDataUnsafe?.user?.username || 'Пользователь';
            userData = await window.db.createNewUser(currentTelegramId, username);
        }

        // Инициализируем интерфейс наград
        initializeRewardInterface();
        
        // Обновляем статус наград
        await updateRewardStatus();
        
        // Запускаем автоматическое обновление статуса
        setInterval(async () => {
            if (document.querySelector('.reward-section.active')) {
                await updateRewardStatus();
            }
        }, 60000);

    } catch (error) {
        console.error('Ошибка при инициализации:', error);
    }
});

// Инициализация интерфейса наград
function initializeRewardInterface() {
    const rewardSection = document.querySelector('.reward-section');
    if (!rewardSection) return;

    rewardSection.innerHTML = `
        <div class="reward-header">
            <img src="https://i.postimg.cc/Y2PdgmFX/image.png" alt="Rewards">
            <h2>Ежедневные награды</h2>
        </div>
        
        <div class="reward-grid">
            ${generateRewardDays()}
        </div>
        
        <div class="achievements-section">
            <h3>Достижения</h3>
            <div class="achievement-grid">
                ${generateAchievements()}
            </div>
        </div>
    `;

    // Добавляем обработчики событий
    initializeEventListeners();
}

// Генерация карточек ежедневных наград
function generateRewardDays() {
    const rewards = [
        { day: 1, amount: 1000, icon: '🎁' },
        { day: 2, amount: 5000, icon: '💎' },
        { day: 3, amount: 10000, icon: '🌟' },
        { day: 4, amount: 50000, icon: '🎯' },
        { day: 5, amount: 100000, icon: '🏆' },
        { day: 6, amount: 250000, icon: '👑' },
        { day: 7, amount: 500000, icon: '🌈' },
        { day: 8, amount: 1000000, icon: '🎉' }
    ];
    
    return rewards.map(reward => `
        <div class="reward-day" id="day${reward.day}">
            <div class="reward-icon">${reward.icon}</div>
            <h3>День ${reward.day}</h3>
            <div class="reward-amount">
                ${reward.amount.toLocaleString()} 
                <img src="https://i.postimg.cc/FFx7T4Bh/image.png" alt="Монеты">
            </div>
            <button class="claim-button" onclick="claimReward(${reward.day}, ${reward.amount})">
                Получить
            </button>
        </div>
    `).join('');
}

// Генерация достижений
function generateAchievements() {
    const achievements = [
        { id: 'clicks100', name: 'Начинающий кликер', description: '100 кликов', icon: '🎯', progress: 0, target: 100 },
        { id: 'clicks1000', name: 'Опытный кликер', description: '1,000 кликов', icon: '🎯', progress: 0, target: 1000 },
        { id: 'balance1m', name: 'Миллионер', description: 'Накопить 1,000,000 монет', icon: '💰', progress: 0, target: 1000000 },
        { id: 'mining1', name: 'Майнер', description: 'Купить первый майнер', icon: '⛏️', progress: 0, target: 1 }
    ];
    
    return achievements.map(achievement => `
        <div class="achievement-card" id="${achievement.id}">
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-info">
                <h4>${achievement.name}</h4>
                <p>${achievement.description}</p>
                <div class="achievement-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${(achievement.progress / achievement.target) * 100}%"></div>
                    </div>
                    <span class="progress-text">${achievement.progress}/${achievement.target}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Обработчики событий
function initializeEventListeners() {
    // Обработчики для кнопок получения наград
    document.querySelectorAll('.claim-button').forEach(button => {
        button.addEventListener('click', async (e) => {
            const day = parseInt(e.target.closest('.reward-day').id.replace('day', ''));
            const amount = parseInt(e.target.previousElementSibling.textContent);
            await claimReward(day, amount);
        });
    });
}

// Форматирование оставшегося времени
function formatTimeLeft(milliseconds) {
    if (milliseconds < 60000) {
        return 'Меньше минуты';
    }
    const minutes = Math.floor(milliseconds / 60000);
    return `${minutes} мин.`;
}

// Обновление статуса наград
async function updateRewardStatus() {
    try {
        const userData = await window.db.getUserData(window.currentTelegramId);
        if (!userData) return;

        const now = Date.now();
        const timePassedSinceLastClaim = now - userData.last_claim_time;
        const timeLeft = Math.max(0, 24 * 60 * 60 * 1000 - timePassedSinceLastClaim);
        const canClaim = timeLeft <= 0;

        // Обновляем статус каждой карточки награды
        for (let i = 1; i <= 8; i++) {
            const dayElement = document.getElementById(`day${i}`);
            if (!dayElement) continue;

            const claimButton = dayElement.querySelector('.claim-button');
            if (!claimButton) continue;

            if (i < userData.current_day) {
                dayElement.classList.add('claimed');
                claimButton.disabled = true;
                claimButton.textContent = 'Получено';
            } else if (i > userData.current_day) {
                claimButton.disabled = true;
                claimButton.textContent = 'Недоступно';
            } else if (!canClaim) {
                claimButton.disabled = true;
                claimButton.textContent = `Через ${formatTimeLeft(timeLeft)}`;
            } else {
                dayElement.classList.add('available');
                claimButton.disabled = false;
                claimButton.textContent = 'Получить';
            }
        }

        // Обновляем прогресс достижений
        updateAchievementsProgress(userData);

    } catch (error) {
        console.error('Ошибка при обновлении статуса наград:', error);
    }
}

// Обновление прогресса достижений
function updateAchievementsProgress(userData) {
    const achievements = {
        clicks100: { progress: userData.total_clicks || 0, target: 100 },
        clicks1000: { progress: userData.total_clicks || 0, target: 1000 },
        balance1m: { progress: userData.balance || 0, target: 1000000 },
        mining1: { progress: userData.mining_level || 0, target: 1 }
    };

    Object.entries(achievements).forEach(([id, data]) => {
        const card = document.getElementById(id);
        if (!card) return;

        const progressBar = card.querySelector('.progress-fill');
        const progressText = card.querySelector('.progress-text');
        
        if (progressBar && progressText) {
            const progress = Math.min(data.progress, data.target);
            progressBar.style.width = `${(progress / data.target) * 100}%`;
            progressText.textContent = `${progress.toLocaleString()}/${data.target.toLocaleString()}`;
            
            if (progress >= data.target) {
                card.classList.add('completed');
            }
        }
    });
}

// Получение награды
async function claimReward(day, amount) {
    try {
        const userData = await window.db.getUserData(window.currentTelegramId);
        if (!userData) return;

        const now = Date.now();
        const timePassedSinceLastClaim = now - userData.last_claim_time;
        const canClaim = timePassedSinceLastClaim >= 24 * 60 * 60 * 1000;

        if (!canClaim) {
            const timeLeft = 24 * 60 * 60 * 1000 - timePassedSinceLastClaim;
            showNotification(`Следующая награда будет доступна через ${formatTimeLeft(timeLeft)}`, 'info');
            return;
        }

        if (day !== userData.current_day) {
            showNotification('Эта награда недоступна', 'error');
            return;
        }

        // Обновляем данные пользователя
        await window.db.updateUserData(window.currentTelegramId, {
            balance: userData.balance + amount,
            current_day: userData.current_day + 1,
            last_claim_time: now
        });

        // Показываем анимацию награды
        showRewardAnimation(amount);
        
        // Обновляем отображение
        updateBalanceDisplay();
        updateRewardStatus();
        
        showNotification(`Вы получили ${amount.toLocaleString()} монет!`, 'success');

    } catch (error) {
        console.error('Ошибка при получении награды:', error);
        showNotification('Произошла ошибка при получении награды', 'error');
    }
}

// Показ анимации награды
function showRewardAnimation(amount) {
    const rewardElement = document.createElement('div');
    rewardElement.className = 'reward-animation';
    rewardElement.innerHTML = `
        <div style="display: flex; align-items: center; gap: 5px;">
            <span>+${amount.toLocaleString()}</span>
            <img src="https://i.postimg.cc/FFx7T4Bh/image.png" alt="Монеты" style="width: 24px; height: 24px;">
        </div>
    `;
    
    document.body.appendChild(rewardElement);
    
    requestAnimationFrame(() => {
        rewardElement.style.transform = 'translateY(-100px)';
        rewardElement.style.opacity = '0';
    });
    
    setTimeout(() => {
        document.body.removeChild(rewardElement);
    }, 2000);
}

// Показ уведомления
function showNotification(message, type = 'info') {
    if (typeof window.game?.showNotification === 'function') {
        window.game.showNotification({
            message,
            type
        });
    } else {
        console.log(message);
    }
}

class Reward {
    constructor() {
        // Загружаем сохраненные достижения или используем начальные значения
        const savedData = localStorage.getItem('achievementsData');
        const initialData = savedData ? JSON.parse(savedData) : {
            achievements: [
                {
                    id: 'first_coins',
                    name: 'Первые монеты',
                    description: 'Заработайте 100 монет',
                    progress: 0,
                    target: 100,
                    reward: 50,
                    completed: false,
                    icon: '💰'
                },
                {
                    id: 'energy_master',
                    name: 'Мастер энергии',
                    description: 'Достигните потребления 50 энергии',
                    progress: 0,
                    target: 50,
                    reward: 100,
                    completed: false,
                    icon: '⚡'
                },
                {
                    id: 'upgrade_expert',
                    name: 'Эксперт улучшений',
                    description: 'Купите 5 улучшений',
                    progress: 0,
                    target: 5,
                    reward: 200,
                    completed: false,
                    icon: '⭐'
                }
            ]
        };

        this.achievements = initialData.achievements;
        
        this.initializeAchievements();
        this.startTracking();
    }

    initializeAchievements() {
        const achievementGrid = document.getElementById('achievementGrid');
        if (!achievementGrid) return;

        achievementGrid.innerHTML = '';
        
        this.achievements.forEach(achievement => {
            const card = document.createElement('div');
            card.className = `achievement-card ${achievement.completed ? 'completed' : ''}`;
            card.id = `achievement-${achievement.id}`;
            
            card.innerHTML = `
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-info">
                    <h4>${achievement.name}</h4>
                    <p>${achievement.description}</p>
                    <div class="achievement-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${(achievement.progress / achievement.target) * 100}%"></div>
                        </div>
                        <div class="progress-text">${achievement.progress}/${achievement.target}</div>
                    </div>
                    <div class="achievement-reward">
                        <span>Награда:</span>
                        <span>${achievement.reward} монет</span>
                    </div>
                </div>
            `;
            
            achievementGrid.appendChild(card);
        });
    }

    startTracking() {
        setInterval(() => {
            const balance = parseInt(document.getElementById('balance')?.innerText) || 0;
            const energyUsage = parseInt(document.getElementById('energyUsage')?.innerText) || 0;
            const upgradeCount = document.querySelectorAll('.upgrade-card.upgraded')?.length || 0;

            this.achievements.forEach(achievement => {
                if (achievement.completed) return;

                switch(achievement.id) {
                    case 'first_coins':
                        achievement.progress = Math.min(balance, achievement.target);
                        break;
                    case 'energy_master':
                        achievement.progress = Math.min(energyUsage, achievement.target);
                        break;
                    case 'upgrade_expert':
                        achievement.progress = Math.min(upgradeCount, achievement.target);
                        break;
                }

                if (achievement.progress >= achievement.target && !achievement.completed) {
                    achievement.completed = true;
                    this.completeAchievement(achievement);
                }

                this.updateAchievementProgress(achievement);
            });

            // Сохраняем прогресс достижений
            this.saveData();
        }, 1000);
    }

    updateAchievementProgress(achievement) {
        const card = document.getElementById(`achievement-${achievement.id}`);
        if (!card) return;

        const progressFill = card.querySelector('.progress-fill');
        const progressText = card.querySelector('.progress-text');

        if (progressFill) {
            progressFill.style.width = `${(achievement.progress / achievement.target) * 100}%`;
        }
        if (progressText) {
            progressText.textContent = `${achievement.progress}/${achievement.target}`;
        }

        if (achievement.completed) {
            card.classList.add('completed');
        }
    }

    completeAchievement(achievement) {
        const balance = document.getElementById('balance');
        if (!balance) return;

        const currentBalance = parseInt(balance.innerText) || 0;
        balance.innerText = currentBalance + achievement.reward;

        // Показываем уведомление
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">${achievement.icon}</div>
                <div class="notification-text">
                    <h4>Достижение разблокировано!</h4>
                    <p>${achievement.name}</p>
                    <p>+${achievement.reward} монет</p>
                </div>
            </div>
        `;

        document.body.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    saveData() {
        const data = {
            achievements: this.achievements
        };
        localStorage.setItem('achievementsData', JSON.stringify(data));
    }
}

// Инициализация при загрузке страницы
let reward = null;
document.addEventListener('DOMContentLoaded', () => {
    reward = new Reward();
});
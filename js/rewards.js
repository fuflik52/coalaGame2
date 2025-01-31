class Rewards {
    constructor() {
        this.rewards = [
            {
                id: 'daily',
                name: 'Ежедневная награда',
                coins: 100,
                cooldown: 24 * 60 * 60 * 1000, // 24 часа
                lastClaimed: 0,
                icon: 'calendar-check'
            },
            {
                id: 'achievement',
                name: 'Достижение',
                coins: 500,
                progress: 0,
                maxProgress: 100,
                icon: 'trophy'
            },
            {
                id: 'referral',
                name: 'Приведи друга',
                coins: 1000,
                count: 0,
                icon: 'users'
            }
        ];
        
        this.initializeUI();
        this.loadRewardsData();
        this.startTimers();
    }

    initializeUI() {
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
                    ${this.rewards.map(reward => `
                        <div class="reward-card" data-id="${reward.id}">
                            <div class="reward-icon">
                                <i class="fas fa-${reward.icon}"></i>
                            </div>
                            <div class="reward-info">
                                <h3>${reward.name}</h3>
                                <div class="reward-amount">
                                    <i class="fas fa-coins"></i>
                                    <span>${reward.coins}</span>
                                </div>
                                ${reward.progress !== undefined ? `
                                    <div class="reward-progress">
                                        <div class="progress-bar">
                                            <div class="progress-fill" style="width: ${(reward.progress / reward.maxProgress) * 100}%"></div>
                                        </div>
                                        <span>${reward.progress}/${reward.maxProgress}</span>
                                    </div>
                                ` : ''}
                                ${reward.cooldown ? `
                                    <div class="reward-timer" data-id="${reward.id}">
                                        Доступно через: <span>00:00:00</span>
                                    </div>
                                ` : ''}
                            </div>
                            <button class="claim-button" data-id="${reward.id}">
                                ${reward.id === 'referral' ? 'Пригласить' : 'Получить'}
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const claimButtons = document.querySelectorAll('.claim-button');
        claimButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const rewardId = e.target.dataset.id;
                this.claimReward(rewardId);
            });
        });
    }

    async loadRewardsData() {
        try {
            if (window.tg?.initDataUnsafe?.user?.id) {
                const userData = await window.db.getUserRewards(window.tg.initDataUnsafe.user.id);
                if (userData) {
                    this.rewards.forEach(reward => {
                        if (userData[reward.id]) {
                            reward.lastClaimed = userData[reward.id].lastClaimed || 0;
                            reward.progress = userData[reward.id].progress || 0;
                            reward.count = userData[reward.id].count || 0;
                        }
                    });
                    this.updateUI();
                }
            }
        } catch (error) {
            console.error('Ошибка при загрузке данных наград:', error);
        }
    }

    startTimers() {
        setInterval(() => {
            this.rewards.forEach(reward => {
                if (reward.cooldown) {
                    const timeLeft = reward.cooldown - (Date.now() - reward.lastClaimed);
                    const timerElement = document.querySelector(`.reward-timer[data-id="${reward.id}"] span`);
                    if (timerElement) {
                        if (timeLeft > 0) {
                            timerElement.textContent = this.formatTime(timeLeft);
                        } else {
                            timerElement.textContent = 'Доступно!';
                        }
                    }
                }
            });
        }, 1000);
    }

    formatTime(ms) {
        const hours = Math.floor(ms / (60 * 60 * 1000));
        const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
        const seconds = Math.floor((ms % (60 * 1000)) / 1000);
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    async claimReward(rewardId) {
        const reward = this.rewards.find(r => r.id === rewardId);
        if (!reward) return;

        // Проверяем возможность получения награды
        if (reward.cooldown) {
            const timeLeft = reward.cooldown - (Date.now() - reward.lastClaimed);
            if (timeLeft > 0) {
                window.game.showNotification({
                    title: 'Награда недоступна',
                    message: `Подождите еще ${this.formatTime(timeLeft)}`,
                    type: 'error'
                });
                return;
            }
        }

        if (reward.progress !== undefined && reward.progress < reward.maxProgress) {
            window.game.showNotification({
                title: 'Награда недоступна',
                message: 'Выполните необходимые условия',
                type: 'error'
            });
            return;
        }

        // Начисляем награду
        if (window.game) {
            window.game.balance += reward.coins;
            window.game.updateBalanceDisplay();
            
            // Обновляем данные награды
            reward.lastClaimed = Date.now();
            if (reward.progress !== undefined) {
                reward.progress = 0;
            }
            reward.count = (reward.count || 0) + 1;

            // Сохраняем данные
            if (window.tg?.initDataUnsafe?.user?.id) {
                try {
                    await window.db.updateUserRewards(window.tg.initDataUnsafe.user.id, {
                        [reward.id]: {
                            lastClaimed: reward.lastClaimed,
                            progress: reward.progress,
                            count: reward.count
                        }
                    });
                } catch (error) {
                    console.error('Ошибка при сохранении данных наград:', error);
                }
            }

            // Обновляем UI
            this.updateUI();

            // Показываем уведомление
            window.game.showNotification({
                title: 'Награда получена!',
                message: `Вы получили ${reward.coins} монет`,
                type: 'success'
            });

            // Создаем эффект получения награды
            this.createRewardEffect(reward.coins);
        }
    }

    createRewardEffect(amount) {
        const rewardEffect = document.createElement('div');
        rewardEffect.className = 'reward-effect';
        rewardEffect.innerHTML = `
            <div class="coins-animation">
                <i class="fas fa-coins"></i>
                <span>+${amount}</span>
            </div>
        `;
        document.body.appendChild(rewardEffect);

        setTimeout(() => {
            rewardEffect.remove();
        }, 1500);
    }

    updateUI() {
        this.rewards.forEach(reward => {
            const card = document.querySelector(`.reward-card[data-id="${reward.id}"]`);
            if (!card) return;

            const button = card.querySelector('.claim-button');
            const progressBar = card.querySelector('.progress-fill');
            const progressText = card.querySelector('.reward-progress span');

            if (reward.cooldown) {
                const timeLeft = reward.cooldown - (Date.now() - reward.lastClaimed);
                button.disabled = timeLeft > 0;
            }

            if (progressBar && progressText) {
                progressBar.style.width = `${(reward.progress / reward.maxProgress) * 100}%`;
                progressText.textContent = `${reward.progress}/${reward.maxProgress}`;
                button.disabled = reward.progress < reward.maxProgress;
            }
        });

        // Обновляем общую сумму полученных наград
        const totalEarned = this.rewards.reduce((sum, reward) => {
            return sum + (reward.count || 0) * reward.coins;
        }, 0);
        document.querySelector('.total-earned').textContent = totalEarned;
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        if (item.getAttribute('data-section') === 'rewards') {
            item.addEventListener('click', () => {
                const rewardsSection = document.querySelector('.rewards-section');
                if (rewardsSection && rewardsSection.classList.contains('active')) {
                    if (!window.rewards) {
                        window.rewards = new Rewards();
                    }
                }
            });
        }
    });
}); 
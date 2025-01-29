let lastClaimTime = 0;
let currentDay = 1;
let currentTelegramId = null;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Ждем инициализацию Telegram WebApp
        await new Promise(resolve => setTimeout(resolve, 500));

        // Получаем Telegram ID
        if (!window.db.currentUser.id) {
            console.error('Нет данных пользователя Telegram');
            return;
        }

        currentTelegramId = window.db.currentUser.id.toString();

        // Пытаемся найти пользователя
        let userData = await window.db.getUserData(currentTelegramId);
        
        // Если пользователь не найден, создаем нового
        if (!userData) {
            userData = await window.db.createNewUser();
            if (!userData) {
                console.error('Не удалось создать пользователя');
                return;
            }
        }

        // Загружаем данные пользователя
        lastClaimTime = userData.last_claim_time;
        currentDay = userData.current_day;

        // Обновляем баланс в интерфейсе
        if (typeof updateBalanceDisplay === 'function') {
            updateBalanceDisplay(userData.balance);
        }

        // Обновляем имя пользователя
        window.db.updateUsername();

        const rewardSection = document.getElementById('rewardSection');
        
        // Создаем HTML структуру
        rewardSection.innerHTML = `
            <div class="reward-content">
                <div class="reward-buttons">
                    <button class="reward-button active" id="dailyRewardsBtn">Ежедневные призы</button>
                    <button class="reward-button" id="developmentBtn">В разработке</button>
                </div>

                <div class="daily-rewards active" id="dailyRewardsSection">
                    <div class="rewards-grid">
                        ${generateRewardDays()}
                    </div>
                </div>
                
                <div class="development-section" id="developmentSection">
                    <img src="https://i.postimg.cc/Y2PdgmFX/image.png" alt="Награды" class="reward-icon">
                    <h2 class="reward-header">Система наград</h2>
                    <div class="development-badge">В разработке</div>
                    <div class="reward-preview">
         
                        <div class="preview-card">
                            <h3>Бонусы</h3>
                
                        </div>

                    </div>
                    <div class="version-info">
                        <span class="version-item">Версия 0.0.1</span>
                        <span class="version-item">До релиза: 35 дней</span>
                    </div>
                    <div class="progress-steps">
                        <div class="progress-line"></div>
                        <div class="progress-step completed"></div>
                        <div class="progress-step completed"></div>
                        <div class="progress-step current"></div>
                        <div class="progress-step pending"></div>
                    </div>
                    <div class="progress-labels">
                        <span class="progress-label">Дизайн</span>
                        <span class="progress-label">Разработка</span>
                        <span class="progress-label">Тестирование</span>
                        <span class="progress-label">Релиз</span>
                    </div>
                </div>
            </div>
        `;
        
        const dailyRewardsBtn = document.getElementById('dailyRewardsBtn');
        const developmentBtn = document.getElementById('developmentBtn');
        const dailyRewardsSection = document.getElementById('dailyRewardsSection');
        const developmentSection = document.getElementById('developmentSection');
        
        // Обработчики кнопок
        dailyRewardsBtn.addEventListener('click', () => {
            dailyRewardsSection.classList.add('active');
            developmentSection.classList.remove('active');
            dailyRewardsBtn.classList.add('active');
            developmentBtn.classList.remove('active');
        });
        
        developmentBtn.addEventListener('click', () => {
            dailyRewardsSection.classList.remove('active');
            developmentSection.classList.add('active');
            dailyRewardsBtn.classList.remove('active');
            developmentBtn.classList.add('active');
            showNotification('Этот раздел находится в разработке', 'info');
        });
        
        // Обновляем статус наград при загрузке
        updateRewardStatus();
        
        // Проверяем статус каждую минуту
        setInterval(updateRewardStatus, 60000);
    } catch (error) {
        console.error('Ошибка при инициализации:', error);
    }
});

function generateRewardDays() {
    const rewards = [
        { day: 1, amount: 1000 },
        { day: 2, amount: 5000 },
        { day: 3, amount: 10000 },
        { day: 4, amount: 50000 },
        { day: 5, amount: 100000 },
        { day: 6, amount: 250000 },
        { day: 7, amount: 500000 },
        { day: 8, amount: 1000000 }
    ];
    
    return rewards.map(reward => `
        <div class="reward-day" id="day${reward.day}">
            <h3>День ${reward.day}</h3>
            <div class="reward-amount">
                ${reward.amount.toString().replace(/\s+/g, '')} 
                <img src="https://i.postimg.cc/FFx7T4Bh/image.png" alt="Баланс">
            </div>
            <button class="claim-button" onclick="claimReward(${reward.day}, ${reward.amount})">
                Получить
            </button>
        </div>
    `).join('');
}

function formatTimeLeft(milliseconds) {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    if (minutes > 0) {
        return `${minutes} мин.`;
    } else {
        return 'Меньше минуты';
    }
}

function updateRewardStatus() {
    const now = Date.now();
    const timePassedSinceLastClaim = now - lastClaimTime;
    const timeLeft = 60 * 1000 - timePassedSinceLastClaim; // 1 минута вместо 24 часов
    const canClaim = timeLeft <= 0;
    
    for (let i = 1; i <= 8; i++) {
        const dayElement = document.getElementById(`day${i}`);
        if (!dayElement) continue;
        
        const claimButton = dayElement.querySelector('.claim-button');
        
        if (i < currentDay) {
            dayElement.classList.add('claimed');
            claimButton.disabled = true;
            claimButton.textContent = 'Получено';
        } else if (i > currentDay) {
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
}

async function claimReward(day, amount) {
    if (day !== currentDay || !currentTelegramId) return;
    
    const now = Date.now();
    const timePassedSinceLastClaim = now - lastClaimTime;
    const timeLeft = 60 * 1000 - timePassedSinceLastClaim;
    
    if (timeLeft > 0) {
        showNotification(`Следующая награда будет доступна через ${formatTimeLeft(timeLeft)}`, 'info');
        return;
    }
    
    // Получаем текущий баланс из базы данных
    const userData = await window.db.getUserData(currentTelegramId);
    if (!userData) return;

    const newBalance = userData.balance + amount;
    
    // Обновляем баланс в базе данных
    const success = await window.db.updateUserBalance(currentTelegramId, newBalance);
    if (!success) {
        showNotification('Произошла ошибка при получении награды', 'error');
        return;
    }
    
    // Обновляем время получения награды и текущий день
    lastClaimTime = now;
    currentDay = Math.min(currentDay + 1, 8);
    
    // Сохраняем прогресс наград
    await window.db.updateUserRewards(currentTelegramId, currentDay, lastClaimTime);
    
    // Обновляем статус наград
    updateRewardStatus();
    
    // Показываем уведомление
    showNotification(`Вы получили ${amount.toString().replace(/\s+/g, '')} монет!`, 'success');
    
    // Обновляем баланс в интерфейсе
    if (typeof updateBalanceDisplay === 'function') {
        updateBalanceDisplay(newBalance);
    }
} 
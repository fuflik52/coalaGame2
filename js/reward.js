// Глобальные переменные для текущего пользователя
let currentTelegramId = null;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Ждем инициализацию Telegram WebApp и базы данных
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Получаем Telegram ID
        if (!window.tg?.initDataUnsafe?.user?.id) {
            console.error('Нет данных пользователя Telegram');
            return;
        }

        currentTelegramId = window.tg.initDataUnsafe.user.id.toString();

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

        // Восстанавливаем энергию
        await window.db.regenerateEnergy(currentTelegramId);
        
        // Получаем обновленные данные пользователя
        userData = await window.db.getUserData(currentTelegramId);
        if (!userData) return;

        // Обновляем баланс в интерфейсе
        if (typeof updateBalanceDisplay === 'function') {
            updateBalanceDisplay(userData.balance);
        }

        // Обновляем энергию в интерфейсе
        if (typeof updateEnergyDisplay === 'function') {
            updateEnergyDisplay(userData.energy, userData.max_energy);
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
        await updateRewardStatus();
        
        // Проверяем статус каждую минуту
        setInterval(updateRewardStatus, 60000);

        // Проверяем энергию каждую минуту
        setInterval(async () => {
            await window.db.regenerateEnergy(currentTelegramId);
            const updatedData = await window.db.getUserData(currentTelegramId);
            if (updatedData && typeof updateEnergyDisplay === 'function') {
                updateEnergyDisplay(updatedData.energy, updatedData.max_energy);
            }
        }, 60000);

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

async function updateRewardStatus() {
    if (!currentTelegramId) return;

    // Получаем актуальные данные из базы
    const userData = await window.db.getUserData(currentTelegramId);
    if (!userData) return;

    const now = Date.now();
    const timePassedSinceLastClaim = now - userData.last_claim_time;
    const timeLeft = 60 * 1000 - timePassedSinceLastClaim; // 1 минута вместо 24 часов
    const canClaim = timeLeft <= 0;
    
    for (let i = 1; i <= 8; i++) {
        const dayElement = document.getElementById(`day${i}`);
        if (!dayElement) continue;
        
        const claimButton = dayElement.querySelector('.claim-button');
        
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
}

async function claimReward(day, amount) {
    if (!currentTelegramId) {
        console.error('Нет ID пользователя Telegram');
        return;
    }
    
    console.log('Получение награды. День:', day, 'Сумма:', amount);
    
    // Получаем актуальные данные из базы
    const userData = await window.db.getUserData(currentTelegramId);
    if (!userData) {
        console.error('Не удалось получить данные пользователя');
        return;
    }
    
    console.log('Текущие данные пользователя:', userData);
    
    if (day !== userData.current_day) {
        console.log('Неверный день для награды');
        return;
    }
    
    const now = Date.now();
    const timePassedSinceLastClaim = now - userData.last_claim_time;
    const timeLeft = 60 * 1000 - timePassedSinceLastClaim;
    
    if (timeLeft > 0) {
        console.log('Слишком рано для получения награды. Осталось времени:', timeLeft);
        showNotification(`Следующая награда будет доступна через ${formatTimeLeft(timeLeft)}`, 'info');
        return;
    }

    const newBalance = userData.balance + amount;
    console.log('Новый баланс:', newBalance);
    
    // Обновляем баланс в базе данных
    const success = await window.db.updateUserBalance(currentTelegramId, newBalance);
    if (!success) {
        console.error('Ошибка при обновлении баланса');
        showNotification('Произошла ошибка при получении награды', 'error');
        return;
    }
    
    console.log('Баланс успешно обновлен');
    
    // Обновляем время получения награды и текущий день
    const newDay = Math.min(userData.current_day + 1, 8);
    console.log('Новый день:', newDay);
    
    // Сохраняем прогресс наград
    const rewardSuccess = await window.db.updateUserRewards(currentTelegramId, newDay, now);
    if (!rewardSuccess) {
        console.error('Ошибка при обновлении прогресса наград');
    }
    
    // Обновляем статус наград
    await updateRewardStatus();
    
    // Показываем уведомление
    showNotification(`Вы получили ${amount.toString().replace(/\s+/g, '')} монет!`, 'success');
    
    // Обновляем баланс в интерфейсе
    if (typeof updateBalanceDisplay === 'function') {
        console.log('Обновляем отображение баланса:', newBalance);
        updateBalanceDisplay(newBalance);
    } else {
        console.error('Функция updateBalanceDisplay не найдена');
    }
} 
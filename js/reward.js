// Инициализация страницы наград
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Ждем инициализацию Telegram WebApp и базы данных
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Получаем Telegram ID
        if (!window.tg?.initDataUnsafe?.user?.id) {
            console.error('Нет данных пользователя Telegram');
            return;
        }

        const currentTelegramId = window.tg.initDataUnsafe.user.id.toString();
        window.rewardData = { currentTelegramId }; // Сохраняем ID в объекте window

        // Пытаемся найти пользователя
        let userData = await window.db.getUserData(currentTelegramId);
        
        // Если пользователь не найден, создаем нового
        if (!userData) {
            const username = window.tg?.initDataUnsafe?.user?.username || 'Пользователь';
            userData = await window.db.createNewUser(currentTelegramId, username);
            if (!userData) {
                console.error('Не удалось создать пользователя');
                return;
            }
        } else {
            // Обновляем имя пользователя, если оно изменилось
            const username = window.tg?.initDataUnsafe?.user?.username;
            if (username && username !== userData.username) {
                await window.db.updateUsername(currentTelegramId, username);
            }
        }

        // Синхронизируем локальный баланс с базой данных
        await window.db.syncLocalBalance(currentTelegramId);
        
        // Получаем обновленные данные пользователя после синхронизации
        userData = await window.db.getUserData(currentTelegramId);
        if (!userData) return;

        // Восстанавливаем энергию
        await window.db.regenerateEnergy(currentTelegramId);
        
        // Получаем обновленные данные пользователя
        userData = await window.db.getUserData(currentTelegramId);
        if (!userData) return;

        // Обновляем баланс в интерфейсе только если активен нужный раздел
        if (typeof updateBalanceDisplay === 'function' && document.querySelector('.reward-section.active')) {
            updateBalanceDisplay(userData.balance);
        }

        // Обновляем энергию в интерфейсе только если активен нужный раздел
        if (typeof updateEnergyDisplay === 'function' && document.querySelector('.reward-section.active')) {
            updateEnergyDisplay(userData.energy, userData.max_energy);
        }

        const rewardSection = document.getElementById('rewardSection');
        if (!rewardSection || !document.querySelector('.reward-section.active')) return;

        if (!rewardSection.querySelector('.reward-content')) {
            rewardSection.innerHTML = `
                <div class="dev-section">
                    <div class="dev-header">
                        <img src="https://i.postimg.cc/Y2PdgmFX/image.png" alt="Rewards">
                        <h2>Система наград</h2>
                        <div class="dev-status">В разработке</div>
                    </div>
                    
                    <div class="dev-cards">
                        <div class="dev-card">
                            <div class="dev-card-icon">🏆</div>
                            <h3 class="dev-card-title">Достижения</h3>
                            <p class="dev-card-text">Выполняйте задания и получайте награды</p>
                        </div>
                        <div class="dev-card">
                            <div class="dev-card-icon">🎁</div>
                            <h3 class="dev-card-title">Бонусы</h3>
                            <p class="dev-card-text">Ежедневные награды и подарки</p>
                        </div>
                        <div class="dev-card">
                            <div class="dev-card-icon">📊</div>
                            <h3 class="dev-card-title">Рейтинг</h3>
                            <p class="dev-card-text">Соревнуйтесь с другими игроками</p>
                        </div>
                    </div>
                    
                    <div class="dev-progress">
                        <div class="dev-progress-info">
                            <span class="dev-version">Версия 0.0.1</span>
                            <span class="dev-date">До релиза: 35 дней</span>
                        </div>
                        
                        <div class="dev-bar">
                            <div class="dev-bar-fill" style="width: 45%"></div>
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
        
        // Обновляем статус наград только если активен нужный раздел
        if (document.querySelector('.reward-section.active')) {
            await updateRewardStatus();
            
            // Проверяем статус каждую минуту только если активен нужный раздел
            setInterval(() => {
                if (document.querySelector('.reward-section.active')) {
                    updateRewardStatus();
                }
            }, 60000);

            // Проверяем энергию каждую минуту только если активен нужный раздел
            setInterval(async () => {
                if (document.querySelector('.reward-section.active')) {
                    await window.db.regenerateEnergy(currentTelegramId);
                    const updatedData = await window.db.getUserData(currentTelegramId);
                    if (updatedData && typeof updateEnergyDisplay === 'function') {
                        updateEnergyDisplay(updatedData.energy, updatedData.max_energy);
                    }
                }
            }, 60000);
        }
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
    const currentTelegramId = window.rewardData?.currentTelegramId;
    if (!currentTelegramId) return;

    // Получаем актуальные данные из базы
    const userData = await window.db.getUserData(currentTelegramId);
    if (!userData) return;

    const now = Date.now();
    const timePassedSinceLastClaim = now - userData.last_claim_time;
    const timeLeft = 60 * 1000 - timePassedSinceLastClaim;
    const canClaim = timeLeft <= 0;
    
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
}

async function claimReward(day, amount) {
    const currentTelegramId = window.rewardData?.currentTelegramId;
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

// Добавляем функцию переключения разделов
function switchRewardSection(section) {
    const cards = document.querySelectorAll('.nav-card');
    cards.forEach(card => card.classList.remove('active'));
    
    const selectedCard = document.querySelector(`.nav-card[onclick*="${section}"]`);
    if (selectedCard) {
        selectedCard.classList.add('active');
    }
    
    if (section !== 'daily') {
        showNotification('Этот раздел находится в разработке', 'info');
    }
} 
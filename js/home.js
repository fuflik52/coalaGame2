let currentTelegramId = null;
let energy = 100;
let maxEnergy = 100;
let balance = parseInt(localStorage.getItem('balance')) || 0;
let lastEnergyUpdate = Date.now();
let lastEarningCheck = parseInt(localStorage.getItem('lastEarningCheck')) || Date.now();
let hourlyRate = 0; // Общая прибыль в час от всех карточек

function updateEnergy() {
    const now = Date.now();
    const timeDiff = now - lastEnergyUpdate;
    const energyToAdd = Math.floor(timeDiff / 1000); // 1 энергия в секунду

    if (energyToAdd > 0 && energy < maxEnergy) {
        energy = Math.min(maxEnergy, energy + energyToAdd);
        lastEnergyUpdate = now - (timeDiff % 1000);
        updateEnergyDisplay();
    }
}

function updateEnergyDisplay() {
    const progressBar = document.querySelector('.progress');
    progressBar.style.width = `${(energy / maxEnergy) * 100}%`;
    progressBar.textContent = `${energy}/${maxEnergy}`;
}

async function handleClick(event) {
    if (!currentTelegramId) return;

    try {
        const userData = await window.db.getUserData(currentTelegramId);
        if (!userData || userData.energy <= 0) {
            showNotification('Недостаточно энергии!', 'error');
            return;
        }

        // Обновляем энергию
        const newEnergy = userData.energy - 1;
        await window.db.updateUserEnergy(currentTelegramId, newEnergy);

        // Обновляем баланс
        const newBalance = userData.balance + 1;
        await window.db.updateUserBalance(currentTelegramId, newBalance);

        // Обновляем отображение
        updateEnergyDisplay(newEnergy, userData.max_energy);
        const balanceElement = document.querySelector('.balance-value');
        if (balanceElement) {
            balanceElement.textContent = newBalance.toLocaleString();
        }

        // Создаем анимацию +1
        const floatingValue = document.createElement('div');
        floatingValue.className = 'floating-value';
        floatingValue.textContent = '+1';
        
        // Позиционируем относительно клика
        const rect = event.target.getBoundingClientRect();
        floatingValue.style.left = `${event.clientX}px`;
        floatingValue.style.top = `${event.clientY}px`;
        
        document.body.appendChild(floatingValue);
        
        // Анимация движения вверх и исчезновения
        requestAnimationFrame(() => {
            floatingValue.style.transform = 'translateY(-50px)';
            floatingValue.style.opacity = '0';
        });
        
        // Удаляем элемент после анимации
        setTimeout(() => {
            floatingValue.remove();
        }, 1000);
    } catch (error) {
        console.error('Ошибка при обработке клика:', error);
    }
}

function updateBalance(amount) {
    balance += amount;
    localStorage.setItem('balance', balance);
    document.querySelector('.balance-value').textContent = balance.toLocaleString();
}

function calculateHourlyRate() {
    // Получаем все активные карточки и суммируем их hourlyEarnings
    const cards = JSON.parse(localStorage.getItem('activeCards')) || [];
    const hourlyRate = cards.reduce((total, card) => total + card.hourlyEarnings, 0);
    
    // Обновляем отображение прибыли в час
    const hourlyProfitElement = document.querySelector('.hourly-profit');
    if (hourlyProfitElement) {
        hourlyProfitElement.textContent = `${hourlyRate.toLocaleString()} /час`;
    }
}

async function checkPassiveEarnings() {
    if (!currentTelegramId) return;

    try {
        const userData = await window.db.getUserData(currentTelegramId);
        if (!userData) return;

        const cards = JSON.parse(localStorage.getItem('activeCards')) || [];
        const hourlyRate = cards.reduce((total, card) => total + card.hourlyEarnings, 0);
        
        if (hourlyRate > 0) {
            const newBalance = userData.balance + hourlyRate;
            await window.db.updateUserBalance(currentTelegramId, newBalance);
            
            const balanceElement = document.querySelector('.balance-value');
            if (balanceElement) {
                balanceElement.textContent = newBalance.toLocaleString();
            }
            
            showNotification(`Вы заработали ${hourlyRate.toLocaleString()} монет!`, 'success');
        }
    } catch (error) {
        console.error('Ошибка при проверке пассивного заработка:', error);
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', async () => {
    // Получаем Telegram ID
    currentTelegramId = window.tg?.initDataUnsafe?.user?.id?.toString();
    if (!currentTelegramId) {
        console.error('Нет ID пользователя Telegram');
        return;
    }

    const clickerButton = document.getElementById('clickerButton');
    clickerButton.addEventListener('click', handleClick);
    clickerButton.addEventListener('touchstart', handleClick);
    
    // Обновляем энергию каждую минуту
    setInterval(updateEnergy, 60000);
    
    // Загружаем данные пользователя
    await loadUserData();
    
    // Добавляем элемент для отображения прибыли в час
    const userInfo = document.querySelector('.user-info');
    const hourlyProfitElement = document.createElement('div');
    hourlyProfitElement.className = 'hourly-profit';
    hourlyProfitElement.textContent = '0 /час';
    userInfo.appendChild(hourlyProfitElement);
    
    // Обновляем баланс и прибыль в час
    calculateHourlyRate();
    
    // Проверяем пассивный заработок каждую минуту
    setInterval(async () => {
        await checkPassiveEarnings();
        calculateHourlyRate();
    }, 60000);
    
    // Проверяем сразу при загрузке
    await checkPassiveEarnings();
});

async function loadUserData() {
    try {
        const userData = await window.db.getUserData(currentTelegramId);
        if (userData) {
            // Обновляем отображение баланса
            const balanceElement = document.querySelector('.balance-value');
            if (balanceElement) {
                balanceElement.textContent = userData.balance.toLocaleString();
            }

            // Обновляем отображение энергии
            if (typeof updateEnergyDisplay === 'function') {
                updateEnergyDisplay(userData.energy, userData.max_energy);
            }
        }
    } catch (error) {
        console.error('Ошибка при загрузке данных пользователя:', error);
    }
}

async function updateEnergy() {
    try {
        await window.db.regenerateEnergy(currentTelegramId);
        const userData = await window.db.getUserData(currentTelegramId);
        if (userData && typeof updateEnergyDisplay === 'function') {
            updateEnergyDisplay(userData.energy, userData.max_energy);
        }
    } catch (error) {
        console.error('Ошибка при обновлении энергии:', error);
    }
}

function handleClick(event) {
    const button = event.currentTarget;
    const section = button.getAttribute('data-section');
    
    // Проверяем, существует ли элемент перед установкой textContent
    const balanceElement = document.querySelector('.balance');
    if (balanceElement) {
        balanceElement.textContent = '0';
    }
    
    // Переключаем секции
    switchSection(section);
}

function updateBalance(amount) {
    balance += amount;
    localStorage.setItem('balance', balance);
    document.querySelector('.balance-value').textContent = balance.toLocaleString();
}

function calculateHourlyRate() {
    // Получаем все активные карточки и суммируем их hourlyEarnings
    const cards = JSON.parse(localStorage.getItem('activeCards')) || [];
    hourlyRate = cards.reduce((total, card) => total + card.hourlyEarnings, 0);
    
    // Обновляем отображение прибыли в час
    document.querySelector('.hourly-profit').textContent = `${hourlyRate.toLocaleString()} /час`;
}

function checkPassiveEarnings() {
    const now = Date.now();
    const timePassed = now - lastEarningCheck;
    const hoursPassedFraction = timePassed / (60 * 60 * 1000); // Сколько часов прошло (дробное число)
    
    if (hoursPassedFraction > 0 && hourlyRate > 0) {
        const earnedAmount = Math.floor(hourlyRate * hoursPassedFraction);
        if (earnedAmount > 0) {
            updateBalance(earnedAmount);
            showNotification(`Вы заработали ${earnedAmount.toLocaleString()} монет!`, 'success');
        }
    }
    
    lastEarningCheck = now;
    localStorage.setItem('lastEarningCheck', lastEarningCheck);
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    const clickerButton = document.getElementById('clickerButton');
    clickerButton.addEventListener('click', handleClick);
    clickerButton.addEventListener('touchstart', handleClick);
    
    // Обновляем энергию каждую секунду
    setInterval(updateEnergy, 1000);
    
    // Сохраняем состояние перед закрытием страницы
    window.addEventListener('beforeunload', () => {
        localStorage.setItem('energy', energy);
        localStorage.setItem('maxEnergy', maxEnergy);
        localStorage.setItem('balance', balance);
        localStorage.setItem('lastEnergyUpdate', lastEnergyUpdate);
    });
    
    // Загружаем сохраненное состояние
    const savedEnergy = localStorage.getItem('energy');
    const savedMaxEnergy = localStorage.getItem('maxEnergy');
    const savedBalance = localStorage.getItem('balance');
    const savedLastUpdate = localStorage.getItem('lastEnergyUpdate');
    
    if (savedEnergy) energy = parseInt(savedEnergy);
    if (savedMaxEnergy) maxEnergy = parseInt(savedMaxEnergy);
    if (savedBalance) {
        balance = parseInt(savedBalance);
        document.querySelector('.balance-value').textContent = balance.toLocaleString();
    }
    if (savedLastUpdate) lastEnergyUpdate = parseInt(savedLastUpdate);
    
    updateEnergyDisplay();

    // Добавляем элемент для отображения прибыли в час
    const userInfo = document.querySelector('.user-info');
    const hourlyProfitElement = document.createElement('div');
    hourlyProfitElement.className = 'hourly-profit';
    hourlyProfitElement.textContent = '0 /час';
    userInfo.appendChild(hourlyProfitElement);
    
    // Обновляем баланс и прибыль в час
    calculateHourlyRate();
    
    // Проверяем пассивный заработок каждую минуту
    setInterval(() => {
        checkPassiveEarnings();
        calculateHourlyRate();
    }, 60000); // Каждую минуту
    
    // Проверяем сразу при загрузке
    checkPassiveEarnings();
}); 
let currentTelegramId = null;
let energy = parseInt(localStorage.getItem('energy')) || 100;
let maxEnergy = 100;
let balance = parseInt(localStorage.getItem('balance')) || 0;
let lastEnergyUpdate = parseInt(localStorage.getItem('lastEnergyUpdate')) || Date.now();
let lastEarningCheck = parseInt(localStorage.getItem('lastEarningCheck')) || Date.now();
let hourlyRate = 0; // Общая прибыль в час от всех карточек
let isLocalMode = true; // Добавляем флаг локального режима
const energyBar = document.getElementById('energyBar');

// Инициализация переменных
let clickCount = 0;
let lastClickTime = 0;
let clickMultiplier = 1;
let isClicking = false;

function updateEnergy() {
    energy = Math.min(maxEnergy, energy);
    energy = Math.max(0, energy);
    energyBar.style.width = `${energy}%`;
    
    // Обновляем текст энергии
    const energyText = document.getElementById('energyText');
    if (energyText) {
        energyText.textContent = `${energy}/${maxEnergy}`;
    }
    
    // Сохраняем текущее значение энергии
    localStorage.setItem('energy', energy);
    localStorage.setItem('lastEnergyUpdate', Date.now());
}

function updateEnergyDisplay() {
    const progressBar = document.querySelector('.progress');
    if (progressBar) {
        progressBar.style.width = `${(energy / maxEnergy) * 100}%`;
        progressBar.textContent = `${energy}/${maxEnergy}`;
    }
}

function handleClick(event) {
    event.preventDefault(); // Предотвращаем стандартное поведение
    
    if (isClicking) return;
    isClicking = true;

    const clickerButton = document.querySelector('.clicker-button');
    const koalaImage = clickerButton.querySelector('.clicker-koala');
    
    // Проверяем энергию
    if (energy <= 0) {
        showNotification('Недостаточно энергии!', 'error');
        isClicking = false;
        return;
    }

    // Уменьшаем энергию
    energy--;
    updateEnergy();
    
    // Добавляем анимацию нажатия
    clickerButton.classList.add('clicked');
    if (koalaImage) {
        koalaImage.classList.add('clicked');
    }
    
    // Обновляем счетчик кликов
    const currentTime = Date.now();
    if (currentTime - lastClickTime < 300) {
        clickCount++;
        if (clickCount >= 10) {
            clickMultiplier = 2;
        }
    } else {
        clickCount = 1;
        clickMultiplier = 1;
    }
    lastClickTime = currentTime;

    // Обновляем баланс
    const reward = 1 * clickMultiplier;
    const currentBalance = parseInt(document.querySelector('.balance-value').textContent.replace(/\s/g, '')) || 0;
    const newBalance = currentBalance + reward;
    
    // Обновляем отображение баланса
    document.querySelector('.balance-value').textContent = newBalance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    
    // Сохраняем в локальное хранилище
    localStorage.setItem('balance', newBalance);
    
    // Показываем анимацию награды
    showRewardAnimation(reward, event);
    
    // Убираем анимацию нажатия
    setTimeout(() => {
        clickerButton.classList.remove('clicked');
        if (koalaImage) {
            koalaImage.classList.remove('clicked');
        }
        isClicking = false;
    }, 150);
}

function updateBalance(amount) {
    balance += amount;
    localStorage.setItem('balance', balance);
    const balanceElement = document.querySelector('.balance-value');
    if (balanceElement && document.querySelector('.home-section.active')) {
        balanceElement.textContent = balance.toLocaleString();
    }
}

function calculateHourlyRate() {
    const cards = JSON.parse(localStorage.getItem('activeCards')) || [];
    hourlyRate = cards.reduce((total, card) => total + card.hourlyEarnings, 0);
    
    const hourlyProfitElement = document.querySelector('.hourly-profit');
    if (hourlyProfitElement && document.querySelector('.home-section.active')) {
        hourlyProfitElement.textContent = `${hourlyRate.toLocaleString()} /час`;
    }
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
document.addEventListener('DOMContentLoaded', async () => {
    // Получаем Telegram ID
    currentTelegramId = window.tg?.initDataUnsafe?.user?.id?.toString();

    const clickerButton = document.querySelector('.clicker-button'); // Изменено с getElementById на querySelector
    if (clickerButton) { // Добавляем проверку
        clickerButton.addEventListener('click', async (event) => {
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
        });

        clickerButton.addEventListener('touchstart', handleClick);
    }
    
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
    if (savedBalance && document.querySelector('.home-section.active')) {
        balance = parseInt(savedBalance);
        const balanceElement = document.querySelector('.balance-value');
        if (balanceElement) {
            balanceElement.textContent = balance.toLocaleString();
        }
    }
    if (savedLastUpdate) lastEnergyUpdate = parseInt(savedLastUpdate);
    
    updateEnergyDisplay();

    // Добавляем элемент для отображения прибыли в час
    const userInfo = document.querySelector('.user-info');
    if (userInfo && document.querySelector('.home-section.active')) {
        const hourlyProfitElement = document.createElement('div');
        hourlyProfitElement.className = 'hourly-profit';
        hourlyProfitElement.textContent = '0 /час';
        userInfo.appendChild(hourlyProfitElement);
    }
    
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

// Функция для восстановления энергии
function restoreEnergy() {
    const lastUpdate = parseInt(localStorage.getItem('lastEnergyUpdate')) || Date.now();
    const currentTime = Date.now();
    const secondsPassed = Math.floor((currentTime - lastUpdate) / 1000);
    
    // Добавляем по 1 единице энергии за каждую прошедшую секунду
    energy = Math.min(maxEnergy, energy + secondsPassed);
    updateEnergy();
}

// Инициализация энергии
document.addEventListener('DOMContentLoaded', () => {
    restoreEnergy();

    // Обработчик клика для траты энергии
    document.querySelector('.clicker-button')?.addEventListener('click', function() {
        if (energy > 0) {
            energy--;
            updateEnergy();
        } else {
            showNotification('Недостаточно энергии!', 'error');
        }
    });

    // Восстановление энергии каждую секунду
    setInterval(() => {
        if (energy < maxEnergy) {
            energy++;
            updateEnergy();
        }
    }, 1000);

    // Обновляем энергию при возвращении на вкладку
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            restoreEnergy();
        }
    });
});

// Инициализация обработчиков событий
function initializeHomeSection() {
    const clickSection = document.querySelector('.click-section');
    if (!clickSection) return;
    
    // Добавляем обработчики для мобильных устройств
    clickSection.addEventListener('touchstart', handleClick, { passive: false });
    clickSection.addEventListener('mousedown', handleClick);
    
    // Предотвращаем двойное срабатывание на мобильных
    clickSection.addEventListener('click', (e) => e.preventDefault());
    
    // Отключаем контекстное меню
    clickSection.addEventListener('contextmenu', (e) => e.preventDefault());
}

// Функция анимации награды
function showRewardAnimation(reward, event) {
    const rewardElement = document.createElement('div');
    rewardElement.className = 'reward-animation';
    rewardElement.textContent = `+${reward}`;
    
    // Позиционируем анимацию относительно клика
    const x = event.type.includes('touch') ? event.touches[0].clientX : event.clientX;
    const y = event.type.includes('touch') ? event.touches[0].clientY : event.clientY;
    
    rewardElement.style.left = `${x}px`;
    rewardElement.style.top = `${y}px`;
    
    document.body.appendChild(rewardElement);
    
    // Запускаем анимацию
    requestAnimationFrame(() => {
        rewardElement.style.transform = 'translateY(-50px) scale(1.2)';
        rewardElement.style.opacity = '0';
    });
    
    // Удаляем элемент после анимации
    setTimeout(() => {
        document.body.removeChild(rewardElement);
    }, 1000);
}

// Запускаем инициализацию при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    initializeHomeSection();
    restoreEnergy();
    
    // Восстановление энергии каждую секунду
    setInterval(() => {
        if (energy < maxEnergy) {
            energy++;
            updateEnergy();
        }
    }, 1000);
}); 
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
let isVibrationEnabled = localStorage.getItem('vibrationEnabled') === 'true';

// Инициализация Telegram ID из URL
function initializeTelegramId() {
    const urlParams = new URLSearchParams(window.location.search);
    window.telegramId = urlParams.get('id');
    if (!window.telegramId) {
        console.error('Telegram ID не найден в URL');
    }
    
    // Получаем имя пользователя из Telegram WebApp
    const username = window.tg?.initDataUnsafe?.user?.username || 
                    window.Telegram?.WebApp?.initDataUnsafe?.user?.username ||
                    window.tg?.initDataUnsafe?.user?.first_name ||
                    window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name ||
                    'Пользователь';
                    
    // Обновляем отображение имени пользователя
    const userNameElement = document.querySelector('.user-name');
    if (userNameElement) {
        userNameElement.textContent = username;
    }
}

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

function updateEnergyDisplay(currentEnergy, maxEnergy) {
    const energyBar = document.getElementById('energyBar');
    const energyText = document.getElementById('energyText');
    
    if (energyBar) {
        energyBar.style.width = `${(currentEnergy / maxEnergy) * 100}%`;
    }
    
    if (energyText) {
        const energySpan = energyText.querySelector('span');
        if (energySpan) {
            energySpan.textContent = `${currentEnergy}/${maxEnergy}`;
        }
    }
}

// Функция для проверки поддержки вибрации
function checkVibrationSupport() {
    return 'vibrate' in navigator;
}

// Функция для вибрации
function vibrate(duration = 50) {
    try {
        const isVibrationEnabled = localStorage.getItem('vibrationEnabled') === 'true';
        if (isVibrationEnabled && checkVibrationSupport()) {
            navigator.vibrate(duration);
            console.log('Вибрация активирована:', duration, 'мс');
        }
    } catch (error) {
        console.error('Ошибка при вибрации:', error);
    }
}

async function handleClick(event) {
    event.preventDefault();
    
    if (isClicking) return;
    isClicking = true;

    try {
        // Получаем Telegram ID
        const telegramId = window.tg?.initDataUnsafe?.user?.id?.toString() || window.Telegram?.WebApp?.initDataUnsafe?.user?.id?.toString();
        
        if (!telegramId) {
            showNotification('Ошибка: не удалось получить ID пользователя', 'error');
            return;
        }

        // Получаем текущие данные пользователя
        const userData = await window.db.getUserData(telegramId);
        if (!userData) {
            // Если пользователь не существует, создаем нового
            const newUser = await window.db.createNewUser(telegramId);
            if (!newUser) {
                showNotification('Ошибка создания данных пользователя', 'error');
                return;
            }
        }

        // Синхронизируем локальное значение энергии с базой данных
        const currentUserData = await window.db.getUserData(telegramId);
        energy = currentUserData.energy;
        maxEnergy = currentUserData.max_energy;
        updateEnergy();

        if (energy <= 0) {
            showNotification('Недостаточно энергии!', 'error');
            return;
        }

        // Тратим энергию
        energy--;
        updateEnergy();
        await window.db.spendEnergy(telegramId);

        // Добавляем анимацию нажатия
        const clickerButton = document.querySelector('.clicker-button');
        const koalaImage = clickerButton?.querySelector('.clicker-koala');
        
        if (clickerButton) clickerButton.classList.add('clicked');
        if (koalaImage) koalaImage.classList.add('clicked');

        // Вибрация при клике
        if (isVibrationEnabled && checkVibrationSupport()) {
            vibrate(50);
        }

        // Обновляем счетчик кликов и множитель
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
        await window.db.updateUserBalance(telegramId, currentUserData.balance + reward);

        // Показываем анимацию награды
        showRewardAnimation(reward, event);

        // Убираем анимацию нажатия
        setTimeout(() => {
            if (clickerButton) clickerButton.classList.remove('clicked');
            if (koalaImage) koalaImage.classList.remove('clicked');
        }, 100);

    } catch (error) {
        console.error('Ошибка при обработке клика:', error);
        showNotification('Произошла ошибка!', 'error');
    } finally {
        isClicking = false;
    }
}

function showRewardAnimation(reward, event) {
    const rewardElement = document.createElement('div');
    rewardElement.className = 'reward-animation';
    
    // Создаем контейнер для текста и иконки
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.gap = '5px';
    
    // Добавляем текст
    const text = document.createElement('span');
    text.textContent = `+${reward}`;
    
    // Добавляем иконку
    const icon = document.createElement('img');
    icon.src = 'https://i.postimg.cc/FFx7T4Bh/image.png';
    icon.style.width = '20px';
    icon.style.height = '20px';
    icon.style.objectFit = 'contain';
    
    // Сначала добавляем текст, потом иконку
    container.appendChild(text);
    container.appendChild(icon);
    rewardElement.appendChild(container);
    
    // Позиционируем анимацию относительно клика
    const x = event.type.includes('touch') ? event.touches[0].clientX : event.clientX;
    const y = event.type.includes('touch') ? event.touches[0].clientY : event.clientY;
    
    rewardElement.style.left = `${x}px`;
    rewardElement.style.top = `${y}px`;
    
    document.body.appendChild(rewardElement);
    
    // Запускаем анимацию
    requestAnimationFrame(() => {
        rewardElement.style.transform = 'translateY(-100px)';
        rewardElement.style.opacity = '0';
    });
    
    // Удаляем элемент после анимации
    setTimeout(() => {
        document.body.removeChild(rewardElement);
    }, 2000);
}

// Инициализация обработчиков событий
function initializeHomeSection() {
    const clickerButton = document.querySelector('.clicker-button');
    if (!clickerButton) return;
    
    // Добавляем обработчики для всех типов устройств
    clickerButton.addEventListener('mousedown', handleClick);
    clickerButton.addEventListener('touchstart', handleClick, { passive: false });
    
    // Предотвращаем стандартные действия браузера
    clickerButton.addEventListener('click', (e) => e.preventDefault());
    clickerButton.addEventListener('contextmenu', (e) => e.preventDefault());
    clickerButton.addEventListener('touchend', (e) => e.preventDefault());
}

// Запускаем инициализацию при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    initializeTelegramId();
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

            // Обновляем имя пользователя
            const username = window.tg?.initDataUnsafe?.user?.username || 
                           window.Telegram?.WebApp?.initDataUnsafe?.user?.username ||
                           window.tg?.initDataUnsafe?.user?.first_name ||
                           window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name ||
                           'Пользователь';
            
            const userNameElement = document.querySelector('.user-name');
            if (userNameElement) {
                userNameElement.textContent = username;
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
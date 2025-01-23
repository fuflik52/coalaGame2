let coins = 0;
let energy = 100;
let maxEnergy = 100;
const energyRegenRate = 1;
const energyRegenInterval = 2000;
let snowEnabled = true;
let energyInterval;
const savedCoins = localStorage.getItem('coins');
const savedEnergy = localStorage.getItem('energy');
if (savedCoins) coins = parseInt(savedCoins);
if (savedEnergy) energy = parseInt(savedEnergy);

// Устанавливаем снег включенным по умолчанию
if (localStorage.getItem('snowEnabled') === null) {
    localStorage.setItem('snowEnabled', 'true');
}

// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand(); // Раскрываем на весь экран

// Получаем параметр startapp из URL
const urlParams = new URLSearchParams(window.location.search);
const startParam = urlParams.get('tgWebAppStartParam');

// Если есть параметр startapp, обрабатываем его
if (startParam && startParam.startsWith('u')) {
    const referrerId = startParam.substring(1); // Убираем 'u' из начала
    // Здесь можно добавить логику для обработки реферальной системы
    console.log('Пользователь пришел по реферальной ссылке от:', referrerId);
}

// Получаем данные пользователя из Telegram
const user = tg.initDataUnsafe.user;
const username = user ? user.username : 'Пользователь';
const userId = user ? user.id : '0';

// Устанавливаем имя пользователя
document.getElementById('username').textContent = username;

// Добавляем переменную для хранения времени последнего обновления энергии
let lastEnergyUpdate = localStorage.getItem('lastEnergyUpdate') || Date.now();

// Функция для обновления энергии с учетом прошедшего времени
function updateOfflineEnergy() {
    const currentTime = Date.now();
    const lastUpdate = parseInt(localStorage.getItem('lastEnergyUpdate')) || currentTime;
    const timePassed = currentTime - lastUpdate;
    
    // Рассчитываем сколько энергии нужно добавить за все прошедшее время
    const energyToAdd = Math.floor(timePassed / energyRegenInterval) * energyRegenRate;
    
    if (energyToAdd > 0) {
        // Получаем актуальное значение энергии из localStorage
        let currentEnergy = parseInt(localStorage.getItem('energy')) || energy;
        currentEnergy = Math.min(maxEnergy, currentEnergy + energyToAdd);
        
        // Обновляем значения
        energy = currentEnergy;
        localStorage.setItem('energy', energy);
        updateEnergyDisplay();
    }
    
    // Обновляем время последнего обновления
    localStorage.setItem('lastEnergyUpdate', currentTime.toString());
}

// Функция копирования реферальной ссылки
function copyReferralLink() {
    const referralLink = `https://t.me/CoalaGame_Bot?start=u${userId}`;
    navigator.clipboard.writeText(referralLink).then(() => {
        const button = document.querySelector('.copy-link-button');
        button.innerHTML = '<i class="fas fa-check"></i> Скопировано';
        setTimeout(() => {
            button.innerHTML = '<i class="fas fa-copy"></i> Копировать ссылку';
        }, 2000);
    });
}

// Функция обновления списка друзей
function updateFriendList(friends) {
    const friendList = document.getElementById('friendList');
    const friendCount = document.getElementById('friendCount');
    
    if (!friends || friends.length === 0) {
        friendList.style.display = 'none';
        friendCount.textContent = '0';
        return;
    }

    friendList.style.display = 'block';
    friendCount.textContent = friends.length;
    friendList.innerHTML = '';

    friends.forEach(friend => {
        const friendItem = document.createElement('div');
        friendItem.className = 'friend-item';
        friendItem.innerHTML = `
            <div class="friend-avatar">
                <img src="${friend.avatar || 'https://i.postimg.cc/ZnggtH7v/image.png'}" alt="Avatar">
            </div>
            <div class="friend-name">${friend.username}</div>
            <div class="friend-status">Активен</div>
        `;
        friendList.appendChild(friendItem);
    });
}

// Пример использования (замените на реальные данные с сервера)
let friends = [];

function createSnowflakes() {
  const flakes = ['❅', '❆', '❄'];
  for (let i = 0; i < 50; i++) {
    const flake = document.createElement('div');
    flake.className = 'snowflake';
    flake.style.left = Math.random() * 100 + '%';
    flake.style.animationDelay = Math.random() * 10 + 's,' + Math.random() * 10 + 's';
    flake.textContent = flakes[Math.floor(Math.random() * flakes.length)];
    document.querySelector('.game-container').appendChild(flake);
  }
}
setInterval(() => {
  localStorage.setItem('coins', coins);
  localStorage.setItem('energy', energy);
}, 1000);
createSnowflakes();
energyInterval = setInterval(() => {
  if (energy < maxEnergy) {
    energy = Math.min(maxEnergy, energy + energyRegenRate);
    updateEnergyDisplay();
  }
}, energyRegenInterval);

// Функция для показа уведомлений
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-message">${message}</div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Анимация появления
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Удаление уведомления через 3 секунды
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Функция для создания анимации монетки и текста
function createClickAnimation(x, y) {
  // Создаем контейнер для анимации
  const container = document.createElement('div');
  container.className = 'click-animation-container';
  container.style.left = `${x}px`;
  container.style.top = `${y}px`;
  
  // Создаем текст +1
  const floatingText = document.createElement('div');
  floatingText.className = 'floating-text';
  floatingText.textContent = '+1';
  
  // Создаем монетку
  const floatingCoin = document.createElement('img');
  floatingCoin.src = 'https://i.postimg.cc/FFx7T4Bh/image.png';
  floatingCoin.className = 'floating-coin';
  
  // Добавляем элементы в контейнер
  container.appendChild(floatingText);
  container.appendChild(floatingCoin);
  document.body.appendChild(container);

  // Удаляем контейнер после анимации
  setTimeout(() => {
    container.remove();
  }, 1000);
}

// Функция для создания эффекта +1
function createClickEffect(x, y) {
    const gameContainer = document.querySelector('.game-container');
    if (!gameContainer) return;

    const effect = document.createElement('div');
    effect.className = 'click-effect';
    effect.textContent = '+1';
    
    // Получаем позицию относительно game-container
    const rect = gameContainer.getBoundingClientRect();
    effect.style.left = `${x - rect.left}px`;
    effect.style.top = `${y - rect.top}px`;
    
    gameContainer.appendChild(effect);

    // Удаляем элемент после завершения анимации
    effect.addEventListener('animationend', () => {
        effect.remove();
    });
}

// Функция для создания серпантина
function createConfetti() {
    const shapes = ['●', '■', '★', '♦', '♠', '♣', '♥'];
    const colors = ['#4CAF50', '#ffffff'];
    const confettiCount = 100; // Уменьшаем количество
    const gameContainer = document.querySelector('.game-container');
    
    // Создаем несколько волн серпантина
    for (let wave = 0; wave < 2; wave++) { // Уменьшаем количество волн
        setTimeout(() => {
            for (let i = 0; i < confettiCount; i++) {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * gameContainer.offsetWidth + 'px';
                confetti.style.animationDelay = Math.random() * 1 + wave * 0.5 + 's';
                confetti.style.color = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.fontSize = Math.random() * 0.5 + 0.5 + 'rem'; // Случайный размер
                confetti.textContent = shapes[Math.floor(Math.random() * shapes.length)];
                gameContainer.appendChild(confetti);
                
                // Удаляем конфетти после того, как он исчезнет из вида
                confetti.addEventListener('animationend', () => {
                    confetti.remove();
                });
            }
        }, wave * 300); // Уменьшаем интервал между волнами
    }
}

// Функция для вибрации
function vibrate(duration = 50) {
    if ('vibrate' in navigator) {
        // Для Android
        navigator.vibrate(duration);
    } else if ('webkitVibrate' in navigator) {
        // Для старых версий
        navigator.webkitVibrate(duration);
    }
}

// Обновляем функцию handleClick с более сильной вибрацией
function handleClick(event) {
    const gameSettings = getGameSettings();
    const adminSettings = getAdminSettings();
    if (energy > 0) {
        // Определяем координаты клика
        const x = event.clientX;
        const y = event.clientY;

        // Создаем эффект +1 только в разделе Home
        const activeSection = document.querySelector('.section.active');
        if (activeSection && activeSection.id === 'home') {
            createClickEffect(x, y);
            
            // Добавляем более сильную вибрацию
            if ('vibrate' in navigator) {
                navigator.vibrate([100, 30, 100]); // Паттерн вибрации: 100мс вкл, 30мс выкл, 100мс вкл
            }
        }

        // Обновляем счетчик
        coins += gameSettings.coinsPerClick * gameSettings.clickMultiplier;
        localStorage.setItem('coins', coins);
        document.getElementById('balance').textContent = coins;

        // Уменьшаем энергию
        energy = Math.max(0, energy - gameSettings.energyPerClick * gameSettings.clickMultiplier);
        localStorage.setItem('energy', energy);
        updateEnergyDisplay();

        // Показываем уведомление если энергия закончилась
        if (energy === 0) {
            showNotification('Недостаточно энергии!');
            if ('vibrate' in navigator) {
                navigator.vibrate([200, 100, 200]); // Более длинная вибрация для уведомления
            }
        }
    } else {
        showNotification('Недостаточно энергии!');
        if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200]); // Более длинная вибрация для уведомления
        }
    }
}

// Функция для получения настроек игры
function getGameSettings() {
    const defaultSettings = {
        clickMultiplier: 1,
        autoClickInterval: 1000,
        coinsPerClick: 1,
        energyPerClick: 1,
        priceMultiplier: 1
    };
    
    const settings = JSON.parse(localStorage.getItem('gameSettings') || '{}');
    return { ...defaultSettings, ...settings };
}

// Функция для получения админ настроек
function getAdminSettings() {
    const defaultSettings = {
        devMode: false,
        homeDevMode: false,
        shopDevMode: false,
        achievementsDevMode: false
    };
    
    const settings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
    return { ...defaultSettings, ...settings };
}

// Обновляем обработчик DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    // Обновляем отображение баланса и энергии сразу при загрузке
    document.getElementById('balance').textContent = Math.floor(coins);
    
    // Проверяем и начисляем энергию за время отсутствия
    updateOfflineEnergy();
    updateEnergyDisplay();
    
    const clickerButton = document.getElementById('clickerButton');
    
    // Добавляем обработчики для мыши и тачскрина
    clickerButton.addEventListener('click', handleClick);
    clickerButton.addEventListener('touchstart', handleClick);
});

// Обновляем интервал восстановления энергии
clearInterval(energyInterval);
energyInterval = setInterval(() => {
    if (energy < maxEnergy) {
        energy = Math.min(maxEnergy, energy + energyRegenRate);
        localStorage.setItem('energy', energy);
        localStorage.setItem('lastEnergyUpdate', Date.now().toString());
        updateEnergyDisplay();
    }
}, energyRegenInterval);

// Обработчик видимости страницы
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Сохраняем текущее состояние перед скрытием
        localStorage.setItem('energy', energy);
        localStorage.setItem('lastEnergyUpdate', Date.now().toString());
        clearInterval(energyInterval);
    } else {
        // Обновляем энергию при возвращении на страницу
        updateOfflineEnergy();
        energyInterval = setInterval(() => {
            if (energy < maxEnergy) {
                energy = Math.min(maxEnergy, energy + energyRegenRate);
                localStorage.setItem('energy', energy);
                localStorage.setItem('lastEnergyUpdate', Date.now().toString());
                updateEnergyDisplay();
            }
        }, energyRegenInterval);
    }
});

// Сохраняем состояние перед закрытием страницы
window.addEventListener('beforeunload', () => {
    localStorage.setItem('energy', energy);
    localStorage.setItem('lastEnergyUpdate', Date.now().toString());
});

// Инициализация обработчиков кликов для разделов в разработке
document.addEventListener('DOMContentLoaded', function() {
    const containers = [
        document.getElementById('construction-click-container'),
        document.getElementById('construction-click-container-reward')
    ];

    containers.forEach(container => {
        if (container) {
            container.addEventListener('click', function(e) {
                vibrate();
            });
        }
    });

    // Показываем сообщение о разработке при переключении на соответствующие разделы
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            if (targetId === 'mining' || targetId === 'reward') {
                showNotification('Этот раздел находится в разработке');
            }
        });
    });
});

// Функция обновления отображения энергии
function updateEnergyDisplay() {
    const energyFill = document.getElementById('energyFill');
    const currentEnergyElement = document.getElementById('currentEnergy');
    const maxEnergyElement = document.getElementById('maxEnergy');
    
    if (energyFill && currentEnergyElement && maxEnergyElement) {
        energyFill.style.width = (energy / maxEnergy * 100) + '%';
        currentEnergyElement.textContent = Math.floor(energy);
        maxEnergyElement.textContent = maxEnergy;
    }
}

function copyUsername() {
  navigator.clipboard.writeText(document.getElementById("yourUsername").textContent);
}

function addFriend() {
  let friendUsername = document.getElementById("friendUsername").value;
}

// Обновляем обработчик для вкладок
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(n => {
            n.classList.remove('active');
            n.style.color = '#888';
        });
        item.classList.add('active');
        item.style.color = '#4CAF50';
        
        // Окрашиваем иконку в зеленый цвет
        const icon = item.querySelector('.nav-icon');
        if (icon) {
            document.querySelectorAll('.nav-icon').forEach(i => i.style.filter = '');
            icon.style.filter = 'invert(56%) sepia(97%) saturate(349%) hue-rotate(89deg) brightness(95%) contrast(92%)';
        }

        const sectionId = item.getAttribute('data-section');
        document.getElementById(sectionId).classList.add('active');
        const energyBar = document.querySelector('.energy-bar');
        const topPanel = document.querySelector('.top-panel');
        const rewardSection = document.getElementById('reward');
        
        // Показываем уведомление для разделов в разработке
        if (sectionId === 'cards' || sectionId === 'mining') {
            showNotification('Этот раздел находится в разработке');
        }
        
        if (sectionId === 'home') {
            energyBar.classList.remove('hidden');
            topPanel.classList.remove('hidden');
            if (rewardSection) {
                rewardSection.style.display = 'none';
            }
        } else if (sectionId === 'reward') {
            energyBar.classList.add('hidden');
            topPanel.classList.add('hidden');
            if (rewardSection) {
                rewardSection.style.display = 'block';
                renderRewards();
            }
            document.querySelector('.content').style.marginTop = '0';
        } else {
            energyBar.classList.add('hidden');
            topPanel.classList.add('hidden');
            document.querySelector('.content').style.marginTop = '70px';
        }
    });
});

document.getElementById('userAvatar').addEventListener('click', showSettings);

function showSettings() {
    // Удаляем существующие настройки, если они есть
    const existingSettings = document.querySelector('.settings-overlay');
    if (existingSettings) {
        existingSettings.remove();
    }

    const settingsHtml = `
    <div class="settings-overlay">
        <div class="settings-container">
            <div class="settings-header">
                <h2>Настройки</h2>
                <div class="header-buttons">
                    <button id="settingsNewsButton" class="news-button">
                        <i class="fas fa-newspaper"></i>
                        Новости
                    </button>
                    <button class="close-settings">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="settings-content">
                <div class="setting-item">
                    <span>Звук</span>
                    <label class="switch">
                        <input type="checkbox" id="settingsSoundToggle">
                        <span class="slider round"></span>
                    </label>
                </div>
                <div class="setting-item">
                    <span>Вибрация</span>
                    <label class="switch">
                        <input type="checkbox" id="settingsVibrationToggle" checked>
                        <span class="slider round"></span>
                    </label>
                </div>
                <div class="setting-item">
                    <span>Снег</span>
                    <label class="switch">
                        <input type="checkbox" id="settingsSnowToggle" checked>
                        <span class="slider round"></span>
                    </label>
                </div>
            </div>
        </div>

        <!-- Модальное окно для новостей -->
        <div id="settingsNewsModal" class="modal-overlay hidden">
            <div class="modal-container">
                <div class="modal-header">
                    <h3>Новости</h3>
                    <button id="settingsCloseNewsModal" class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div id="settingsNewsContent" class="modal-content">
                    <!-- Здесь будет контент новостей -->
                </div>
            </div>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', settingsHtml);

    // Добавляем обработчик для закрытия окна настроек
    const closeButtons = document.querySelectorAll('.close-settings');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const overlay = document.querySelector('.settings-overlay');
            if (overlay) {
                overlay.remove();
            }
        });
    });

    // Инициализация кнопки новостей
    const newsButton = document.getElementById('settingsNewsButton');
    const newsModal = document.getElementById('settingsNewsModal');
    const closeNewsModal = document.getElementById('settingsCloseNewsModal');
    const newsContent = document.getElementById('settingsNewsContent');

    // Загрузка новостей из локального файла
    async function loadNews() {
        try {
            newsContent.innerHTML = `
                <div class="news-date text-gray-400 text-sm mb-2">23 января 2024</div>
                <div class="news-content">
                    <h1>📱 Mobile Clicker - Большое обновление!</h1>
                    
                    <h2>🌟 Версия 1.2.0</h2>
                    <h3>✨ Новые функции</h3>
                    <ul>
                        <li>🎯 Добавлен эффект +1 при клике в разделе Home</li>
                        <li>📱 Вибрация при нажатии для тактильной отдачи</li>
                        <li>❄️ Красивый эффект падающего снега</li>
                        <li>⚙️ Новое меню настроек с удобным доступом</li>
                        <li>📰 Раздел новостей для отслеживания обновлений</li>
                        <li>🎮 Улучшенный игровой процесс</li>
                    </ul>

                    <h3>🔧 Улучшения</h3>
                    <ul>
                        <li>🎨 Обновлён дизайн интерфейса</li>
                        <li>⚡ Улучшена производительность</li>
                        <li>📱 Оптимизация под мобильные устройства</li>
                        <li>🔄 Автоматическое сохранение настроек</li>
                    </ul>

                    <h3>🐛 Исправления</h3>
                    <ul>
                        <li>🔍 Исправлено позиционирование эффекта +1</li>
                        <li>🔧 Улучшена работа с сохранением прогресса</li>
                        <li>⚡ Оптимизирована анимация снега</li>
                        <li>🎯 Исправлены проблемы с кликами</li>
                    </ul>

                    <div class="news-divider"></div>

                    <div class="news-date text-gray-400 text-sm mb-2">22 января 2024</div>
                    <h2>🌟 Версия 1.1.0</h2>
                    <h3>✨ Новые функции</h3>
                    <ul>
                        <li>🎮 Базовая механика кликера</li>
                        <li>💰 Система монет и энергии</li>
                        <li>🏆 Система достижений</li>
                        <li>🎨 Тёмная тема интерфейса</li>
                    </ul>

                    <h3>🔧 Улучшения</h3>
                    <ul>
                        <li>⚡ Базовая оптимизация</li>
                        <li>📱 Адаптация под мобильные устройства</li>
                        <li>💾 Сохранение прогресса</li>
                    </ul>

                    <div class="news-divider"></div>

                    <div class="news-date text-gray-400 text-sm mb-2">20 января 2024</div>
                    <h2>🌟 Версия 1.0.0</h2>
                    <h3>✨ Первый релиз</h3>
                    <ul>
                        <li>🎮 Основной геймплей</li>
                        <li>📱 Мобильный интерфейс</li>
                        <li>🎨 Базовый дизайн</li>
                        <li>💰 Система наград</li>
                    </ul>
                </div>
            `;
        } catch (error) {
            console.error('Ошибка при загрузке новостей:', error);
            newsContent.innerHTML = '<p class="text-red-500">Ошибка при загрузке новостей. Пожалуйста, попробуйте позже.</p>';
        }
    }

    // Открытие модального окна новостей
    newsButton.addEventListener('click', function() {
        newsModal.classList.remove('hidden');
        loadNews();
    });

    // Закрытие модального окна новостей
    closeNewsModal.addEventListener('click', function() {
        newsModal.classList.add('hidden');
    });

    // Закрытие по клику вне модального окна
    newsModal.addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.add('hidden');
        }
    });

    // Инициализация переключателей
    const soundToggle = document.getElementById('settingsSoundToggle');
    const vibrationToggle = document.getElementById('settingsVibrationToggle');
    const snowToggle = document.getElementById('settingsSnowToggle');

    // Загружаем сохраненные настройки
    if (soundToggle) {
        soundToggle.checked = localStorage.getItem('soundEnabled') === 'true';
        soundToggle.addEventListener('change', function() {
            localStorage.setItem('soundEnabled', this.checked);
        });
    }

    if (vibrationToggle) {
        vibrationToggle.checked = localStorage.getItem('vibrationEnabled') !== 'false';
        vibrationToggle.addEventListener('change', function() {
            localStorage.setItem('vibrationEnabled', this.checked);
        });
    }

    if (snowToggle) {
        // Используем значение по умолчанию true, если настройка не задана
        const snowEnabled = localStorage.getItem('snowEnabled') !== 'false';
        snowToggle.checked = snowEnabled;
        
        // Применяем текущее состояние снега
        const flakes = document.querySelectorAll('.snowflake');
        flakes.forEach(flake => {
            flake.style.display = snowEnabled ? 'block' : 'none';
        });

        snowToggle.addEventListener('change', function() {
            localStorage.setItem('snowEnabled', this.checked);
            // Обновляем состояние снега
            const flakes = document.querySelectorAll('.snowflake');
            flakes.forEach(flake => {
                flake.style.display = this.checked ? 'block' : 'none';
            });
        });
    }
}

// Добавляем обработчик для раздела cards
document.addEventListener('DOMContentLoaded', function() {
    const cardsContainer = document.getElementById('construction-click-container-cards');
    if (cardsContainer) {
        cardsContainer.addEventListener('click', function() {
            vibrate();
        });
    }

    // Показываем сообщение о разработке при переключении на раздел cards
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section');
            if (sectionId === 'cards') {
                showNotification('Этот раздел находится в разработке');
            }
        });
    });
});

// Добавляем массив rewards
const rewards = [
    {
        id: 1,
        title: "Разработчики",
        amount: 1000,
        image: "https://i.postimg.cc/FFx7T4Bh/image.png",
        channelUsername: "your_channel_1",
        channelLink: "https://t.me/your_channel_1",
        isDone: false
    },
    {
        id: 2,
        title: "Коала",
        amount: 2000,
        image: "https://i.postimg.cc/FFx7T4Bh/image.png",
        channelUsername: "your_channel_2",
        channelLink: "https://t.me/your_channel_2",
        isDone: false
    }
];

// Функция для получения наград из localStorage
function getSavedRewards() {
    const savedRewards = localStorage.getItem('rewards');
    return savedRewards ? JSON.parse(savedRewards) : rewards;
}

// Функция для сохранения наград в localStorage
function saveRewards(rewards) {
    localStorage.setItem('rewards', JSON.stringify(rewards));
}

// Функция для отображения раздела наград
function renderRewards() {
    const rewardSection = document.getElementById('reward');
    if (!rewardSection) return;

    const currentRewards = getSavedRewards();
    
    rewardSection.innerHTML = `
        <div class="rewards-container">
            <div class="rewards-header">
                Задания
            </div>
            <div class="tab-container">
                <button id="ingameTab" class="flex-1 py-3 rounded-lg text-center transition-all duration-300 bg-[#262626] text-white" onclick="switchRewardTab('ingame')">Игровые</button>
                <button id="partnerTab" class="flex-1 py-3 rounded-lg text-center transition-all duration-300 text-white opacity-50" onclick="switchRewardTab('partner')">Партнёрские</button>
            </div>
            <div id="ingame-rewards" class="rewards-list">
                ${currentRewards.map(reward => `
                    <div class="reward-item">
                        <div class="reward-info">
                            <div class="reward-icon">
                                <img src="${reward.image}" alt="${reward.title}">
                            </div>
                            <div class="reward-details">
                                <div class="reward-title">${reward.title}</div>
                                <div class="reward-amount">
                                    <img src="https://i.postimg.cc/FFx7T4Bh/image.png" alt="reward">
                                    <span>${reward.amount}</span>
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            ${reward.isDone ? `
                                <div class="flex items-center gap-2 text-[#4CAF50]">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M13.3337 4L6.00033 11.3333L2.66699 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                                    </svg>
                                    <span>Выполнено</span>
                                </div>
                            ` : `
                                <button 
                                    id="reward-button-${reward.id}"
                                    class="reward-button ${reward.isChecking ? 'checking' : ''}"
                                    onclick="handleRewardClaim('${reward.channelLink}', ${reward.id})"
                                >
                                    ${reward.isChecking ? `
                                        <div class="flex items-center gap-2">
                                            <img src="https://i.postimg.cc/26VZfrgK/image.png" alt="verify" class="w-5 h-5">
                                            <span>Проверить</span>
                                        </div>
                                    ` : 'Начать'}
                                </button>
                            `}
                        </div>
                    </div>
                `).join('')}
            </div>
            <div id="partner-rewards" class="rewards-list hidden">
                <div class="text-center text-white/50 py-4">
                    Партнёрские задания скоро появятся
                </div>
            </div>
        </div>
    `;
}

// Функция переключения вкладок наград
function switchRewardTab(tab) {
    const ingameTab = document.getElementById('ingame-rewards');
    const partnerTab = document.getElementById('partner-rewards');
    const ingameButton = document.getElementById('ingameTab');
    const partnerButton = document.getElementById('partnerTab');
    
    if (tab === 'ingame') {
        ingameTab.classList.remove('hidden');
        partnerTab.classList.add('hidden');
        ingameButton.classList.add('bg-[#262626]');
        ingameButton.classList.remove('opacity-50');
        partnerButton.classList.remove('bg-[#262626]');
        partnerButton.classList.add('opacity-50');
    } else {
        ingameTab.classList.add('hidden');
        partnerTab.classList.remove('hidden');
        partnerButton.classList.add('bg-[#262626]');
        partnerButton.classList.remove('opacity-50');
        ingameButton.classList.remove('bg-[#262626]');
        ingameButton.classList.add('opacity-50');
    }
}

// Обновляем функцию handleRewardClaim
async function handleRewardClaim(channelLink, rewardId) {
    const currentRewards = getSavedRewards();
    const reward = currentRewards.find(r => r.id === rewardId);
    
    if (!reward || reward.isDone) {
        showNotification('Награда уже получена!', 'error');
        return;
    }

    if (!reward.isChecking) {
        showRewardMenu(channelLink, rewardId);
        reward.isChecking = true;
        saveRewards(currentRewards);
        renderRewards();
    } else {
        const isSubscribed = true;
        
        if (isSubscribed) {
            coins += reward.amount;
            localStorage.setItem('coins', coins);
            document.getElementById('balance').textContent = Math.floor(coins);
            reward.isDone = true;
            reward.isChecking = false;
            saveRewards(currentRewards);
            renderRewards();
            showNotification(`Получено ${reward.amount} монет!`, 'success');
            createConfetti();
        } else {
            showNotification('Для получения награды необходимо подписаться на канал!', 'error');
            window.open(channelLink, '_blank');
        }
    }
}

// Админ-панель
let adminPanelVisible = false;

document.addEventListener('keydown', function(event) {
    if (event.key === 'o' || event.key === 'O') {
        toggleAdminPanel();
    }
});

function toggleAdminPanel() {
    const existingPanel = document.getElementById('adminPanel');
    if (existingPanel) {
        existingPanel.remove();
        adminPanelVisible = false;
        return;
    }

    adminPanelVisible = true;
    const adminPanel = document.createElement('div');
    adminPanel.id = 'adminPanel';
    adminPanel.className = 'fixed top-4 right-4 bg-[#1A1B1A] p-4 rounded-xl shadow-lg z-50';
    adminPanel.innerHTML = `
        <div class="flex flex-col gap-3">
            <div class="text-white font-bold mb-2">Админ панель</div>
            <div class="flex gap-2">
                <input type="number" id="setCoins" placeholder="Монеты" class="bg-[#262626] text-white p-2 rounded">
                <button onclick="setCoins()" class="bg-blue-500 text-white px-3 rounded">OK</button>
            </div>
            <div class="flex gap-2">
                <input type="number" id="setEnergy" placeholder="Энергия" class="bg-[#262626] text-white p-2 rounded">
                <button onclick="setEnergy()" class="bg-blue-500 text-white px-3 rounded">OK</button>
            </div>
            <button onclick="createConfetti()" class="bg-green-500 text-white p-2 rounded">Показать серпантин</button>
            <button onclick="clearAllData()" class="bg-red-500 text-white p-2 rounded">Сбросить всё</button>
        </div>
    `;
    document.body.appendChild(adminPanel);
}

function setCoins() {
    const newCoins = parseInt(document.getElementById('setCoins').value);
    if (!isNaN(newCoins)) {
        coins = newCoins;
        localStorage.setItem('coins', coins);
        document.getElementById('balance').textContent = Math.floor(coins);
        showNotification('Баланс обновлен!', 'success');
    }
}

function setEnergy() {
    const newEnergy = parseInt(document.getElementById('setEnergy').value);
    if (!isNaN(newEnergy)) {
        energy = Math.min(maxEnergy, newEnergy);
        localStorage.setItem('energy', energy);
        updateEnergyDisplay();
        showNotification('Энергия обновлена!', 'success');
    }
}

// Обновляем стили для кнопок
const styles = `
.reward-button {
    padding: 0.5rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 500;
    transition: all 0.3s ease;
    background-color: #4CAF50;
    color: white;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.reward-button:hover {
    background-color: #45a049;
}

.reward-button.checking {
    background-color: #3B82F6;
}

.reward-button.checking:hover {
    background-color: #2563EB;
}

.reward-button img {
    width: 20px;
    height: 20px;
    object-fit: contain;
}

.reward-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #1A1B1A;
    padding: 1rem;
    border-radius: 1rem;
    margin-bottom: 1rem;
}

.reward-info {
    display: flex;
    gap: 1rem;
    align-items: center;
    flex: 1;
}
`;

// Добавляем стили на страницу
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

// Добавляем обработчик для установки активной вкладки при загрузке
document.addEventListener('DOMContentLoaded', function() {
    // Находим элемент Home в навигации и делаем его активным
    const homeNavItem = document.querySelector('.nav-item[data-section="home"]');
    if (homeNavItem) {
        homeNavItem.classList.add('active');
        homeNavItem.style.color = '#4CAF50';
        const icon = homeNavItem.querySelector('.nav-icon');
        if (icon) {
            icon.style.filter = 'invert(56%) sepia(97%) saturate(349%) hue-rotate(89deg) brightness(95%) contrast(92%)';
        }
    }

    // Активируем секцию Home
    const homeSection = document.getElementById('home');
    if (homeSection) {
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        homeSection.classList.add('active');
    }
});

// Обновляем функцию showRewardMenu
function showRewardMenu(channelLink, rewardId) {
    // Создаем элемент меню
    const menu = document.createElement('div');
    menu.className = 'reward-menu';
    menu.innerHTML = `
        <div class="reward-menu-header">
            <div class="header-title">Подписка на канал</div>
            <button class="close-menu">✕</button>
        </div>
        <div class="reward-menu-content">
            <div class="channel-info">
                <img src="https://i.postimg.cc/T3NbNK4D/image.png" alt="Channel Icon" class="channel-icon">
                <div class="channel-details">
                    <span class="channel-name">Название канала</span>
                </div>
            </div>
            <button class="channel-button">Перейти на канал</button>
        </div>
    `;

    // Добавляем стили для меню
    const styles = `
        .reward-menu {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            width: 100%;
            background: #1A1B1A;
            border-radius: 20px 20px 0 0;
            padding: 20px;
            animation: slideUp 0.3s forwards;
            z-index: 1000;
        }

        @keyframes slideUp {
            from {
                transform: translateY(100%);
            }
            to {
                transform: translateY(0);
            }
        }

        @keyframes slideDown {
            from {
                transform: translateY(0);
            }
            to {
                transform: translateY(100%);
            }
        }

        .reward-menu-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 15px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            width: 100%;
        }

        .header-title {
            font-size: 18px;
            font-weight: bold;
            color: rgba(255, 255, 255, 0.9);
            width: 100%;
            text-align: center;
            padding-right: 24px;
        }

        .close-menu {
            background: none;
            border: none;
            color: rgba(255, 255, 255, 0.6);
            font-size: 20px;
            cursor: pointer;
            padding: 5px;
            position: absolute;
            right: 20px;
            top: 20px;
        }

        .close-menu:hover {
            color: rgba(255, 255, 255, 0.9);
        }

        .channel-info {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            margin-bottom: 30px;
        }

        .channel-icon {
            width: 80px;
            height: 80px;
            border-radius: 40px;
            margin-bottom: 15px;
            object-fit: cover;
        }

        .channel-details {
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .channel-name {
            font-weight: bold;
            font-size: 16px;
            color: rgba(255, 255, 255, 0.9);
            margin-bottom: 5px;
        }

        .channel-button {
            width: 100%;
            padding: 15px;
            background: #4CAF50;
            border: none;
            border-radius: 12px;
            color: white;
            font-weight: bold;
            font-size: 16px;
            cursor: pointer;
            transition: background-color 0.2s ease;
        }

        .channel-button:hover {
            background: #45a049;
        }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    // Добавляем меню в игровой контейнер
    const gameContainer = document.querySelector('.game-container');
    gameContainer.appendChild(menu);

    // Обработчики событий
    const closeButton = menu.querySelector('.close-menu');
    const channelButton = menu.querySelector('.channel-button');

    closeButton.addEventListener('click', () => {
        menu.style.animation = 'slideDown 0.3s forwards';
        setTimeout(() => menu.remove(), 300);
    });

    channelButton.addEventListener('click', () => {
        window.open(channelLink, '_blank');
        // После открытия ссылки, переходим на главную страницу
        const homeSection = document.getElementById('home');
        const energyBar = document.querySelector('.energy-bar');
        const topPanel = document.querySelector('.top-panel');
        
        if (homeSection) {
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            homeSection.classList.add('active');
            
            // Показываем энергию и верхнюю панель
            if (energyBar) energyBar.classList.remove('hidden');
            if (topPanel) topPanel.classList.remove('hidden');
            
            // Активируем соответствующий пункт меню
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
                item.style.color = '';
                const icon = item.querySelector('.nav-icon');
                if (icon) {
                    icon.style.filter = '';
                }
            });
            
            const homeNavItem = document.querySelector('.nav-item[data-section="home"]');
            if (homeNavItem) {
                homeNavItem.classList.add('active');
                homeNavItem.style.color = '#4CAF50';
                const icon = homeNavItem.querySelector('.nav-icon');
                if (icon) {
                    icon.style.filter = 'invert(56%) sepia(97%) saturate(349%) hue-rotate(89deg) brightness(95%) contrast(92%)';
                }
            }

            // Обновляем отображение энергии и баланса
            updateEnergyDisplay();
            document.getElementById('balance').textContent = Math.floor(coins);
        }
        menu.remove();
    });
}

// Обновляем функцию clearAllData
function clearAllData() {
    // Очищаем все данные из localStorage
    localStorage.removeItem('coins');
    localStorage.removeItem('energy');
    localStorage.removeItem('lastEnergyUpdate');
    localStorage.removeItem('rewards');
    localStorage.removeItem('gameSettings');
    localStorage.removeItem('adminSettings');
    
    // Сбрасываем переменные
    coins = 0;
    energy = 100;
    document.getElementById('balance').textContent = '0';
    updateEnergyDisplay();
    
    // Обновляем отображение наград
    renderRewards();
    
    // Показываем уведомление и создаем эффект серпантина
    showNotification('Все данные очищены!', 'success');
    createConfetti();
}
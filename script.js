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
    const referralLink = `https://t.me/CoalaGame_Bot/play?startapp=u${userId}`;
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
    const colors = ['#4CAF50', '#FFD700', '#ffffff'];
    const shapes = ['●', '■', '★'];
    
    // Удаляем старый серпантин перед созданием нового
    const oldConfetti = document.querySelectorAll('.confetti');
    oldConfetti.forEach(conf => conf.remove());
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * window.innerWidth + 'px';
        confetti.style.animationDelay = Math.random() * 2 + 's';
        confetti.style.color = colors[Math.floor(Math.random() * colors.length)];
        confetti.textContent = shapes[Math.floor(Math.random() * shapes.length)];
        document.body.appendChild(confetti);

        setTimeout(() => {
            confetti.remove();
        }, window.CONFETTI_DURATION);
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

// Обновляем функцию handleClick с новой вибрацией
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
            vibrate(50); // Добавляем вибрацию при клике
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
            vibrate([100, 50, 100]); // Добавляем паттерн вибрации для уведомления
        }
    } else {
        showNotification('Недостаточно энергии!');
        vibrate([100, 50, 100]); // Добавляем паттерн вибрации для уведомления
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

// Функция для инициализации стандартных заданий
function initializeDefaultRewards() {
    const inGameTasks = JSON.parse(localStorage.getItem('inGameTasks') || '[]');
    const partnerTasks = JSON.parse(localStorage.getItem('partnerTasks') || '[]');
    
    // Если нет сохраненных заданий, добавляем стандартные
    if (inGameTasks.length === 0 && partnerTasks.length === 0) {
        const defaultRewards = rewards.map(reward => ({
            ...reward,
            type: 'ingame' // Помечаем все как игровые задания
        }));
        
        localStorage.setItem('inGameTasks', JSON.stringify(defaultRewards));
    }
}

// Обновляем обработчик DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    // Инициализируем стандартные задания
    initializeDefaultRewards();
    
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
    const sectionId = item.getAttribute('data-section');
    document.getElementById(sectionId).classList.add('active');
    const energyBar = document.querySelector('.energy-bar');
    const topPanel = document.querySelector('.top-panel');
        const rewardSection = document.getElementById('reward');
        
    if (sectionId === 'home') {
      energyBar.classList.remove('hidden');
      topPanel.classList.remove('hidden');
            // Скрываем раздел заданий в главном разделе
            if (rewardSection) {
                rewardSection.style.display = 'none';
            }
        } else if (sectionId === 'reward') {
            energyBar.classList.add('hidden');
            topPanel.classList.add('hidden');
            // Показываем раздел заданий
            if (rewardSection) {
                rewardSection.style.display = 'block';
                renderRewards();
            }
            // Убираем отступ сверху у контента
            document.querySelector('.content').style.marginTop = '0';
    } else {
      energyBar.classList.add('hidden');
      topPanel.classList.add('hidden');
            // Возвращаем отступ для других разделов
            document.querySelector('.content').style.marginTop = '70px';
    }
        
    if (sectionId === 'cards') {
      renderCards();
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

const cards = [
    {
      id: 1,
      image: "https://res.cloudinary.com/dib4woqge/image/upload/v1735300135/1000000472_wu48p4.png",
      title: "Начало пути",
      description: "Коала только начинает своё путешествие. Даёт 120 эвкалипта в час",
      price: "10000",
      perHour: 120,
      isNew: true
    },
    {
      id: 2,
      image: "https://i.postimg.cc/sxpJmh0S/image.png",
      title: "Первые деньги",
      description: "Коала заработала свои первые деньги. Продолжаем в том же духе. Добавляет 350 эвкалипта в час",
      price: "25000",
      perHour: 350
    },
    {
      id: 3,
      image: "https://i.postimg.cc/pVwWnFHC/image.png",
      title: "Коала на отдыхе",
      description: "После первых заработанных денег можно хорошенько отдохнуть. Добавляет 800 эвкалипта в час",
      price: "50000",
      perHour: 800
    },
    {
      id: 4,
      image: "https://i.postimg.cc/nLCgk3KD/image.png",
      title: "Снежные забавы",
      description: "Наступила зима, а значит можно хорошо порезвиться в снежки. Но не забываем про прибыль в 1800 эвкалипта в час",
      price: "100000",
      perHour: 1800
    },
    {
      id: 5,
      image: "https://i.postimg.cc/wTxjfh3V/Leonardo-Phoenix-10-A-vibrant-whimsical-illustration-of-Koala-2.jpg",
      title: "Коала-путешественник",
      description: "Наша коала отправляется в кругосветное путешествие, собирая эвкалипт по всему миру. Приносит 3500 эвкалипта в час",
      price: "200000",
      perHour: 3500,
      isNew: true
    },
    {
      id: 6,
      image: "https://i.postimg.cc/3JnrGd8c/Leonardo-Phoenix-10-A-whimsical-digital-illustration-of-a-koal-0.jpg",
      title: "Бизнес-коала",
      description: "Пора открывать свой бизнес! Коала в деловом костюме управляет сетью эвкалиптовых плантаций. Добавляет 7000 эвкалипта в час",
      price: "500000",
      perHour: 7000,
      isNew: true
    },
    {
      id: 7,
      image: "https://i.postimg.cc/zvqbJ67b/Leonardo-Phoenix-10-A-vibrant-whimsical-illustration-of-Space-0.jpg",
      title: "Космический исследователь",
      description: "Коала покоряет космос в поисках редких видов эвкалипта на других планетах. Приносит 12000 эвкалипта в час",
      price: "1000000",
      perHour: 12000,
      isNew: true
    },
    {
      id: 8,
      image: "https://i.postimg.cc/bv23bSh0/Leonardo-Phoenix-10-In-a-whimsical-vibrant-illustration-depict-0.jpg",
      title: "Коала-волшебник",
      description: "Магия и эвкалипт - отличное сочетание! Коала освоила древние заклинания приумножения эвкалипта. Добавляет 20000 эвкалипта в час",
      price: "5000000",
      perHour: 20000,
      isNew: true
    }
  ];
  
function renderCards() {
    const cardsContainer = document.querySelector('#cards .grid');
    if (!cardsContainer) {
        console.error('Cards container not found');
        return;
    }
    
    cardsContainer.innerHTML = '';
    
    // Сортируем карточки по цене
    const sortedCards = [...cards].sort((a, b) => parseInt(a.price) - parseInt(b.price));
    
    sortedCards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'bg-[#1A1B1A] rounded-xl p-2';
        cardElement.innerHTML = `
            <div class="w-full h-[60px] bg-zinc-800 rounded-[15px] mb-2 mx-auto flex justify-center items-center">
                <img alt="card" loading="eager" width="96" height="96" decoding="async" data-nimg="1" class="w-12 h-12 object-cover max-w-full" src="${card.image}" style="color: transparent;">
            </div>
            <div class="text-white mb-1 text-center font-bold text-xs">${card.title}</div>
            <div class="text-white text-[9px] mb-2 opacity-50">${card.description}</div>
            <div class="flex items-center justify-between">
                <button onclick="buyCard(${card.id})" class="rounded-full py-1 px-3 flex items-center bg-green-500 hover:bg-green-600">
                    <img src="https://i.postimg.cc/FFx7T4Bh/image.png" alt="leaf" class="w-3 h-3 mr-1">
                    <span class="text-sm font-bold text-white">${card.price}</span>
                </button>
                <div class="flex flex-col">
                    <div class="flex items-center flex-row gap-1">
                        <img src="https://i.postimg.cc/FFx7T4Bh/image.png" alt="leaf" class="w-3 h-3">
                        <span class="text-white text-sm">${card.perHour}</span>
                    </div>
                    <span class="text-white/50 text-[10px] text-right">per hour</span>
                </div>
            </div>
        `;
        cardsContainer.appendChild(cardElement);
    });
}

function buyCard(cardId) {
    const card = cards.find(c => c.id === cardId);
    if (!card) {
        showNotification('Карточка не найдена', 'error');
        return;
    }

    const price = parseInt(card.price);
    if (coins >= price) {
        coins -= price;
        localStorage.setItem('coins', coins);
        document.getElementById('balance').textContent = coins;
        
        // Добавляем карточку в купленные
        card.purchased = true;
        
        // Обновляем отображение карточек
        renderCards();
        
        // Показываем уведомление об успешной покупке
        showNotification(`Вы успешно приобрели "${card.title}"!`, 'success');
        
        // Добавляем эффект получения монет
        const perHour = parseInt(card.perHour);
        if (perHour > 0) {
            setInterval(() => {
                coins += perHour / 3600; // Конвертируем часовой доход в посекундный
                document.getElementById('balance').textContent = Math.floor(coins);
                localStorage.setItem('coins', coins);
            }, 1000);
        }
    } else {
        // Показываем уведомление о нехватке средств
        showNotification('Недостаточно средств!', 'error');
    }
}

document.querySelector('.top-panel').style.zIndex = '2';

// Функционал новостей
document.addEventListener('DOMContentLoaded', function() {
    const newsButton = document.getElementById('newsButton');
    const newsModal = document.getElementById('newsModal');
    const closeNewsModal = document.getElementById('closeNewsModal');
    const newsContent = document.getElementById('newsContent');

    async function fetchNewsContent() {
        try {
            const response = await fetch('news.json');
            if (!response.ok) {
                throw new Error('Не удалось загрузить новости');
            }

            const data = await response.json();
            if (data.news && data.news.length > 0) {
                const latestNews = data.news[0];
                newsContent.innerHTML = `
                    <div class="news-date text-gray-400 text-sm mb-2">${latestNews.date}</div>
                    <div class="news-content">${latestNews.content}</div>
                `;
            } else {
                newsContent.innerHTML = '<p class="text-gray-400">Нет доступных новостей</p>';
            }
        } catch (error) {
            console.error('Ошибка при загрузке новостей:', error);
            newsContent.innerHTML = '<p class="text-red-500">Ошибка при загрузке новостей. Пожалуйста, попробуйте позже.</p>';
        }
    }

    // Открытие модального окна
    newsButton.addEventListener('click', function() {
        newsModal.classList.remove('hidden');
        fetchNewsContent();
    });

    // Закрытие модального окна
    closeNewsModal.addEventListener('click', function() {
        newsModal.classList.add('hidden');
    });

    // Закрытие по клику вне модального окна
    newsModal.addEventListener('click', function(e) {
        if (e.target === newsModal) {
            newsModal.classList.add('hidden');
        }
    });
});

// Показываем сообщение о разработке при переключении на соответствующие разделы
document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.tab');
    const sectionNames = {
        'mining': 'Mining',
        'reward': 'Reward'
    };
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            if (targetId === 'mining' || targetId === 'reward') {
                showNotification(`Раздел ${sectionNames[targetId]} в разработке`);
            }
        });
    });
});

// Добавляем массив наград
const rewards = [
    {
        id: 1,
        title: "Разработчики",
        amount: 1000,
        image: "https://i.postimg.cc/T3NbNK4D/image.png",
        channelUsername: "devcoala",
        channelLink: "https://t.me/devcoala",
        isDone: false
    },
    {
        id: 2,
        title: "Коала",
        amount: 2000,
        image: "https://i.postimg.cc/T3NbNK4D/image.png",
        channelUsername: "coalaapp",
        channelLink: "https://t.me/coalaapp",
        isDone: false
    }
];

// Функция для очистки всех локальных данных
function clearAllData() {
    // Очищаем все данные из localStorage
    localStorage.removeItem('coins');
    localStorage.removeItem('energy');
    localStorage.removeItem('lastEnergyUpdate');
    localStorage.removeItem('gameSettings');
    localStorage.removeItem('adminSettings');
    localStorage.removeItem('inGameTasks');
    localStorage.removeItem('partnerTasks');
    
    // Сбрасываем переменные
    coins = 0;
    energy = 100;
    document.getElementById('balance').textContent = '0';
    updateEnergyDisplay();
    
    // Инициализируем стандартные задания заново
    initializeDefaultRewards();
    
    // Обновляем отображение наград
    renderRewards();
    
    showNotification('Все данные очищены!', 'success');
    createConfetti();
}

// Добавляем вызов функции при нажатии определенной комбинации клавиш (Ctrl + Shift + R)
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.shiftKey && event.key === 'R') {
        clearAllData();
    }
});

// Функции для работы с заданиями
function getSavedRewards() {
    const inGameTasks = JSON.parse(localStorage.getItem('inGameTasks') || '[]');
    const partnerTasks = JSON.parse(localStorage.getItem('partnerTasks') || '[]');
    return [...inGameTasks, ...partnerTasks];
}

function saveRewards(rewards) {
    const inGameTasks = rewards.filter(r => r.type === 'ingame');
    const partnerTasks = rewards.filter(r => r.type === 'partner');
    localStorage.setItem('inGameTasks', JSON.stringify(inGameTasks));
    localStorage.setItem('partnerTasks', JSON.stringify(partnerTasks));
}

function updateInGameTasks(tasks) {
    localStorage.setItem('inGameTasks', JSON.stringify(tasks));
    renderRewards();
}

function updatePartnerTasks(tasks) {
    localStorage.setItem('partnerTasks', JSON.stringify(tasks));
    renderRewards();
}

// Функция для отображения меню задания
function showRewardMenu(channelLink, rewardId) {
    const gameContainer = document.querySelector('.game-container');
    const existingMenu = document.querySelector('.reward-menu');
    if (existingMenu) {
        existingMenu.remove();
    }

    const menu = document.createElement('div');
    menu.className = 'reward-menu';
    menu.innerHTML = `
        <div class="reward-menu-header">
            <div class="reward-menu-title">Подписка на канал</div>
            <button class="reward-menu-close">×</button>
        </div>
        <div class="reward-menu-content">
            <div class="channel-info">
                <img src="https://i.postimg.cc/T3NbNK4D/image.png" alt="Channel Icon" class="channel-icon">
                <div class="channel-details">
                    <div class="channel-name">Наш канал</div>
                </div>
            </div>
            <button class="channel-button">Перейти на канал</button>
        </div>
    `;

    gameContainer.appendChild(menu);

    // Добавляем анимацию появления
    setTimeout(() => menu.classList.add('show'), 10);

    // Обработчик для кнопки закрытия
    const closeButton = menu.querySelector('.reward-menu-close');
    closeButton.addEventListener('click', () => {
        menu.classList.remove('show');
        setTimeout(() => menu.remove(), 300);
    });

    // Обработчик для кнопки канала
    const channelButton = menu.querySelector('.channel-button');
    channelButton.addEventListener('click', () => {
        window.open(channelLink, '_blank');
        menu.classList.remove('show');
        setTimeout(() => {
            menu.remove();
            // Переключаемся на главную страницу
            const homeTab = document.querySelector('[data-section="home"]');
            if (homeTab) {
                homeTab.click();
            }
        }, 300);
    });
}

// Функция для отображения заданий
function renderRewards() {
    const rewardSection = document.getElementById('reward');
    if (!rewardSection) return;

    const rewards = getSavedRewards();
    
    rewardSection.innerHTML = `
        <div class="rewards-container">
            <div class="tab-container">
                <button id="ingameTab" class="tab-button active" onclick="switchRewardTab('ingame')">Игровые</button>
                <button id="partnerTab" class="tab-button" onclick="switchRewardTab('partner')">Партнёрские</button>
            </div>
            <div id="ingame-rewards"></div>
            <div id="partner-rewards" class="hidden">
                <div class="text-center text-gray-500 mt-4">
                    Партнёрские задания скоро появятся
                </div>
            </div>
        </div>
    `;

    const ingameRewards = document.getElementById('ingame-rewards');
    const inGameTasks = rewards.filter(r => r.type === 'ingame');

    inGameTasks.forEach(reward => {
        const rewardElement = document.createElement('div');
        rewardElement.className = 'reward-item';
        rewardElement.innerHTML = `
            <div class="reward-info">
                <img src="${reward.image}" alt="reward" class="w-12 h-12">
                <div>
                    <div class="text-white font-bold">${reward.title}</div>
                    <div class="text-green-500">+${reward.amount} монет</div>
                </div>
            </div>
            <button onclick="handleRewardClaim('${reward.channelLink}', ${reward.id})" 
                    class="reward-button ${reward.isChecking ? 'checking' : ''} ${reward.isDone ? 'done' : ''}">
                ${reward.isDone ? 
                    '<span>✓ Выполнено</span>' : 
                    (reward.isChecking ? 
                        '<span>Проверить</span>' : 
                        '<span>Начать</span>'
                    )
                }
            </button>
        </div>
    `;
        ingameRewards.appendChild(rewardElement);
    });
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
        // Показываем меню подписки
        showRewardMenu(channelLink, rewardId);
        reward.isChecking = true;
        saveRewards(currentRewards);
        renderRewards();
    } else {
        // Проверяем подписку
        const isSubscribed = true; // Временно всегда true для тестирования
        
        if (isSubscribed) {
            // Начисляем награду
            coins += reward.amount;
            localStorage.setItem('coins', coins);
            document.getElementById('balance').textContent = Math.floor(coins);
            
            // Отмечаем задание как выполненное
            reward.isDone = true;
            reward.isChecking = false;
            saveRewards(currentRewards);
            renderRewards();
            
            // Показываем уведомление и запускаем серпантин
            showNotification(`Получено ${reward.amount} монет!`, 'success');
            createConfetti();
            
            // Вибрация для мобильных устройств
            if ('vibrate' in navigator) {
                navigator.vibrate(50);
            }
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

.mining-container {
    width: 100%;
    height: calc(100vh - 100px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    box-sizing: border-box;
}

.fortune-wheel-container {
    width: 100%;
    max-width: 1200px;
    height: 400px;
    position: relative;
    overflow: hidden;
    margin: 2rem auto;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 1rem;
    padding: 1rem;
}

.fortune-wheel-viewport {
    width: 1000px;
    height: 400px;
    overflow: hidden;
    position: relative;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 12px;
    border: 2px solid rgba(255, 255, 255, 0.1);
    margin: 0 auto;
}

.fortune-wheel-track {
    display: flex;
    gap: 15px;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    padding: 0 500px;
}

.prize-item {
    min-width: 200px;
    height: 300px;
    background: rgba(0, 0, 0, 0.4);
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 20px;
    border: 2px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;
}

.prize-icon {
    width: 100px;
    height: 100px;
    object-fit: contain;
}

.prize-balance {
    font-size: 2em;
    font-weight: bold;
    color: #4CAF50;
}

.prize-name {
    font-size: 1.2em;
    color: #ffffff;
}

.prize-value {
    font-size: 1em;
    color: rgba(255, 255, 255, 0.7);
}

.wheel-pointer {
    position: absolute;
    left: 50%;
    top: 0;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 20px solid transparent;
    border-right: 20px solid transparent;
    border-top: 25px solid #FFD700;
    z-index: 10;
}
`;

// Добавляем стили для графика
const graphStyles = `
.admin-load-graph {
    width: 100%;
    height: 70px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 12px;
    padding: 10px;
    margin: 10px 0;
}

.load-graph {
    width: 100%;
    height: 100%;
}

.graph-area {
    transition: d 0.3s ease;
}

.graph-line {
    transition: d 0.3s ease;
}
`;

const adminStyles = `
.admin-panel {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 15px;
    padding: 20px;
    margin: 20px;
    color: white;
}

.admin-panel h2 {
    font-size: 24px;
    margin-bottom: 20px;
    color: #FFA852;
}

.admin-section {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 12px;
    padding: 15px;
    margin-bottom: 15px;
}

.admin-section h3 {
    font-size: 18px;
    margin-bottom: 15px;
    color: #FFA852;
}

.server-stats {
    display: flex;
    gap: 20px;
    margin-top: 15px;
}

.stat-item {
    background: rgba(0, 0, 0, 0.3);
    padding: 10px 15px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 10px;
}

.stat-label {
    color: #FFA852;
    font-weight: bold;
}

.stat-value {
    color: white;
}

.admin-load-graph {
    width: 100%;
    height: 70px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 12px;
    padding: 10px;
    margin: 10px 0;
    position: relative;
}

.load-graph {
    width: 100%;
    height: 100%;
}

.graph-area {
    transition: d 0.3s ease;
}

.graph-line {
    transition: d 0.3s ease;
}
`;

// Добавляем все стили на страницу
const styleSheet = document.createElement('style');
styleSheet.textContent = styles + graphStyles + adminStyles;
document.head.appendChild(styleSheet);

// Глобальные переменные рулетки
window.SPIN_DURATION = 50000; // 50 секунд для более медленного вращения
window.CONFETTI_DURATION = 3000;
window.TOTAL_SPINS = 30;
window.isSpinning = false;
window.spinsLeft = parseInt(localStorage.getItem('spinsLeft')) || 5;

// Призы рулетки
window.PRIZES = [1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500, 7000, 7500, 8000, 8500, 9000, 9500, 10000].map(value => ({
    value: value.toString(),
    name: 'PRIZE',
    perHour: true
}));

// Инициализация рулетки
function initializeWheel() {
    updateSpinsDisplay();
    const spinButton = document.getElementById('spinButton');
    if (spinButton) {
        spinButton.addEventListener('click', handleSpin);
    }
    createPrizeTrack();
}

// Создание дорожки с призами
function createPrizeTrack() {
    const track = document.querySelector('.fortune-wheel-track');
    if (!track) return;

    // Увеличиваем количество повторений для большей длины трека
    let extendedPrizes = [];
    for (let i = 0; i < 15; i++) { // Увеличили с 10 до 15 повторений
        const shuffledPrizes = [...window.PRIZES].sort(() => Math.random() - 0.5);
        extendedPrizes = extendedPrizes.concat(shuffledPrizes);
    }
    
    track.innerHTML = extendedPrizes.map(prize => `
        <div class="prize-item" data-prize="${prize.value}">
            <img src="https://i.postimg.cc/FFx7T4Bh/image.png" alt="leaf" class="prize-icon">
            <div class="prize-balance">${prize.value}</div>
            <div class="prize-name">${prize.name}</div>
            <div class="prize-value">per hour</div>
        </div>
    `).join('');

    // Центрируем ленту изначально
    track.style.transform = 'translateX(-50%)';
}

// Обновление отображения оставшихся вращений
function updateSpinsDisplay() {
    const spinsDisplay = document.getElementById('spinsCount');
    if (spinsDisplay) {
        spinsDisplay.textContent = window.spinsLeft;
    }
}

// Обработка вращения
function handleSpin() {
    if (window.isSpinning || window.spinsLeft <= 0) return;
    
    window.isSpinning = true;
    window.spinsLeft--;
    localStorage.setItem('spinsLeft', window.spinsLeft);
    updateSpinsDisplay();

    const prize = selectRandomPrize();
    animateWheel(prize);
}

// Выбор случайного приза
function selectRandomPrize() {
    const randomIndex = Math.floor(Math.random() * window.PRIZES.length);
    return window.PRIZES[randomIndex];
}

// Анимация вращения
function animateWheel(selectedPrize) {
    const track = document.querySelector('.fortune-wheel-track');
    if (!track) return;

    const itemWidth = 220;
    const viewportWidth = window.innerWidth;
    const centerOffset = viewportWidth / 2 - itemWidth / 2;
    
    const prizeElements = track.querySelectorAll('.prize-item');
    const targetElement = Array.from(prizeElements).find(el => el.dataset.prize === selectedPrize.value);
    
    if (!targetElement) return;
    
    const targetRect = targetElement.getBoundingClientRect();
    const currentPosition = targetRect.left;
    const distanceToCenter = centerOffset - currentPosition;
    
    // Изменяем направление вращения на противоположное (вправо)
    const fullSpinsDistance = -(window.PRIZES.length * itemWidth * window.TOTAL_SPINS);
    const totalDistance = fullSpinsDistance - distanceToCenter;

    // Используем более плавную кривую анимации
    track.style.transition = `transform ${window.SPIN_DURATION}ms cubic-bezier(0.2, 0.1, 0.1, 1)`;
    track.style.transform = `translateX(${totalDistance}px)`;

    setTimeout(() => {
        finishSpin(selectedPrize);
    }, window.SPIN_DURATION);
}

// Завершение вращения
function finishSpin(prize) {
    if (!prize) return;
    
    const track = document.querySelector('.fortune-wheel-track');
    if (!track) return;
    
    const items = track.querySelectorAll('.prize-item');
    if (!items.length) return;
    
    const winningItem = Array.from(items).find(item => item.dataset.prize === prize.value);
    
    if (winningItem) {
        items.forEach(item => item.classList.remove('selected'));
        winningItem.classList.add('selected');
        
        // Показываем уведомление и эффекты только если нашли выигрышный элемент
        showWinNotification(prize);
        createConfetti();
        vibrate([100, 50, 100]);
    }
    
    window.isSpinning = false;
}

// Показ уведомления о выигрыше
function showWinNotification(prize) {
    const notification = document.createElement('div');
    notification.className = 'win-notification';
    notification.innerHTML = `
        <div class="win-content">
            <h3>Вы выиграли:</h3>
            <div class="prize-name">${prize.value}</div>
            <div class="prize-value">per hour</div>
        </div>
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    initializeWheel();
    createLoadGraph();
});

// Функция для создания графика нагрузки
function createLoadGraph() {
    const graphContainer = document.querySelector('.admin-load-graph');
    if (!graphContainer) return;

    const svg = `
    <svg class="load-graph" width="914" height="70" viewBox="0 0 914 70" style="width: 100%; height: 100%;">
        <defs>
            <clipPath id="graph-clip">
                <rect x="0" y="0" height="70" width="914"></rect>
            </clipPath>
            <linearGradient id="graphGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stop-color="#FFA852" stop-opacity="0.24"></stop>
                <stop offset="95%" stop-color="#FFA852" stop-opacity="0.08"></stop>
            </linearGradient>
        </defs>
        <g class="graph-layer">
            <path 
                stroke-width="2" 
                fill="url(#graphGradient)" 
                stroke="none" 
                class="graph-area" 
                d="M0,70L101.556,31.5L203.111,31.5L304.667,31.5L406.222,31.5L507.778,31.5L609.333,31.5L710.889,31.5L812.444,31.5L914,31.5L914,70L812.444,70L710.889,70L609.333,70L507.778,70L406.222,70L304.667,70L203.111,70L101.556,70L0,70Z">
            </path>
            <path 
                stroke-width="2" 
                stroke="#FFA852" 
                fill="none" 
                class="graph-line" 
                d="M0,70L101.556,31.5L203.111,31.5L304.667,31.5L406.222,31.5L507.778,31.5L609.333,31.5L710.889,31.5L812.444,31.5L914,31.5">
            </path>
        </g>
    </svg>
    `;

    graphContainer.innerHTML = svg;
}

// Функция для обновления графика
function updateLoadGraph() {
    const path = document.querySelector('.graph-area');
    const line = document.querySelector('.graph-line');
    if (!path || !line) return;

    // Генерируем случайные значения для демонстрации
    const points = [];
    for (let i = 0; i < 10; i++) {
        const y = Math.random() * 40 + 30; // Значения между 30 и 70
        points.push([i * 101.556, y]);
    }

    // Создаем path для области
    let areaPath = `M${points[0][0]},${points[0][1]}`;
    points.slice(1).forEach(point => {
        areaPath += `L${point[0]},${point[1]}`;
    });
    areaPath += `L${points[points.length-1][0]},70`;
    areaPath += `L${points[0][0]},70Z`;

    // Создаем path для линии
    let linePath = `M${points[0][0]},${points[0][1]}`;
    points.slice(1).forEach(point => {
        linePath += `L${point[0]},${point[1]}`;
    });

    path.setAttribute('d', areaPath);
    line.setAttribute('d', linePath);
}

// Обновляем график каждые 2 секунды
setInterval(updateLoadGraph, 2000);

// Добавить в секцию переменных
let mining = {
    hashRate: 0,
    totalHashes: 0,
    miners: [
        { level: 1, count: 0, baseRate: 50, upgradeCost: 100 }
    ]
};

// Обновить функцию рендеринга
function updateMiningDisplay() {
    document.getElementById('totalHashes').textContent = Math.floor(mining.totalHashes);
    document.getElementById('hashRate').textContent = `${mining.hashRate} H/s`;
}

// Цикл майнинга
setInterval(() => {
    if(mining.hashRate > 0) {
        mining.totalHashes += mining.hashRate;
        updateMiningDisplay();
    }
}, 1000);

// Обработчик улучшений
function upgradeMiner(level) {
    const miner = mining.miners.find(m => m.level === level);
    if(coins >= miner.upgradeCost) {
        coins -= miner.upgradeCost;
        miner.count++;
        miner.upgradeCost = Math.floor(miner.upgradeCost * 1.3);
        mining.hashRate += miner.baseRate;
        updateMiningDisplay();
        updateBalanceDisplay();
    }
}
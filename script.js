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

// Функция для вибрации
function vibrate() {
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
}

// Функция для обработки клика
function handleClick(event) {
    if (energy > 0) {
        // Определяем координаты клика
        const x = event.clientX;
        const y = event.clientY;

        // Создаем эффект +1 только в разделе Home
        const activeSection = document.querySelector('.section.active');
        if (activeSection && activeSection.id === 'home') {
            createClickEffect(x, y);
            vibrate();
        }

        // Обновляем счетчик
        coins++;
        localStorage.setItem('coins', coins);
        document.getElementById('balance').textContent = coins;

        // Уменьшаем энергию
        energy = Math.max(0, energy - 1);
        localStorage.setItem('energy', energy);
        updateEnergyDisplay();

        // Показываем уведомление если энергия закончилась
        if (energy === 0) {
            showNotification('Недостаточно энергии!');
        }
    } else {
        showNotification('Недостаточно энергии!');
    }
}

// Инициализация обработчиков событий
document.addEventListener('DOMContentLoaded', () => {
  const clickerButton = document.getElementById('clickerButton');
  
  // Добавляем обработчики для мыши
  clickerButton.addEventListener('click', handleClick);
  
  // Добавляем обработчики для сенсорных устройств
  clickerButton.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Предотвращаем зум на мобильных
    handleClick(e);
  }, { passive: false });
  
  // Отключаем стандартное поведение при касании
  clickerButton.addEventListener('touchmove', (e) => {
    e.preventDefault();
  }, { passive: false });
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

function updateEnergyDisplay() {
  document.getElementById('energyFill').style.width = energy / maxEnergy * 100 + '%';
  document.getElementById('currentEnergy').textContent = energy;
  document.getElementById('maxEnergy').textContent = maxEnergy;
}

function copyUsername() {
  navigator.clipboard.writeText(document.getElementById("yourUsername").textContent);
}

function addFriend() {
  let friendUsername = document.getElementById("friendUsername").value;
}

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
    if (sectionId === 'home') {
      energyBar.classList.remove('hidden');
      topPanel.classList.remove('hidden');
    } else {
      energyBar.classList.add('hidden');
      topPanel.classList.add('hidden');
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
        <div id="settingsNewsModal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50 flex items-center justify-center">
            <div class="bg-zinc-900 w-11/12 max-w-lg rounded-lg p-6 relative max-h-[80vh] overflow-y-auto">
                <button id="settingsCloseNewsModal" class="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <i class="fas fa-times"></i>
                </button>
                <h3 class="text-xl font-bold text-white mb-4">Новости</h3>
                <div id="settingsNewsContent" class="text-gray-300">
                    <!-- Здесь будет контент из Telegraph -->
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

    // Инициализация кнопки новостей и модального окна
    const newsButton = document.getElementById('settingsNewsButton');
    const newsModal = document.getElementById('settingsNewsModal');
    const closeNewsModal = document.getElementById('settingsCloseNewsModal');
    const newsContent = document.getElementById('settingsNewsContent');

    // URL статьи в Telegraph
    const telegraphUrl = 'https://telegra.ph/Novosti-CoalaGame-01-22';

    async function fetchNewsContent() {
        try {
            const response = await fetch(telegraphUrl, {
                mode: 'cors',
                headers: {
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3',
                }
            });
            
            if (!response.ok) {
                throw new Error('Не удалось загрузить новости');
            }

            const text = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');
            
            const article = doc.querySelector('article');
            if (article) {
                newsContent.innerHTML = article.innerHTML;
            } else {
                newsContent.innerHTML = '<p class="text-red-500">Не удалось загрузить новости. Пожалуйста, попробуйте позже.</p>';
            }
        } catch (error) {
            console.error('Ошибка при загрузке новостей:', error);
            newsContent.innerHTML = '<p class="text-red-500">Ошибка при загрузке новостей. Пожалуйста, попробуйте позже.</p>';
        }
    }

    // Открытие модального окна новостей
    newsButton.addEventListener('click', function() {
        const modal = document.getElementById('settingsNewsModal');
        if (modal) {
            modal.classList.remove('hidden');
            fetchNewsContent();
        }
    });

    // Закрытие модального окна новостей
    if (closeNewsModal) {
        closeNewsModal.addEventListener('click', function() {
            const modal = document.getElementById('settingsNewsModal');
            if (modal) {
                modal.classList.add('hidden');
            }
        });
    }

    // Закрытие по клику вне модального окна
    if (newsModal) {
        newsModal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.add('hidden');
            }
        });
    }

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

    // URL вашей статьи в Telegraph
    const telegraphUrl = 'https://telegra.ph/Obnovlenie-Mobile-Clicker-01-22';

    async function fetchNewsContent() {
        try {
            const response = await fetch(telegraphUrl);
            const text = await response.text();
            
            // Создаем временный элемент для парсинга HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');
            
            // Получаем основной контент статьи
            const article = doc.querySelector('article');
            if (article) {
                newsContent.innerHTML = article.innerHTML;
            } else {
                newsContent.innerHTML = '<p class="text-red-500">Не удалось загрузить новости</p>';
            }
        } catch (error) {
            newsContent.innerHTML = '<p class="text-red-500">Ошибка при загрузке новостей</p>';
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

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    clearInterval(energyInterval);
  } else {
    energyInterval = setInterval(() => {
      if (energy < maxEnergy) {
        energy = Math.min(maxEnergy, energy + energyRegenRate);
        updateEnergyDisplay();
      }
    }, energyRegenInterval);
  }
});
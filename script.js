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

// Функция для обработки клика
function handleClick(event) {
  if (energy > 0) {
    // Вибрация для мобильных устройств
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    // Определяем координаты клика
    let x, y;
    if (event.touches && event.touches.length > 0) {
      // Для сенсорных устройств обрабатываем каждое касание
      Array.from(event.touches).forEach(touch => {
        createClickAnimation(touch.clientX, touch.clientY);
      });
    } else if (event.clientX && event.clientY) {
      // Для клика мышью
      createClickAnimation(event.clientX, event.clientY);
    } else {
      // Если координаты недоступны, используем центр кнопки
      const button = document.getElementById('clickerButton');
      const rect = button.getBoundingClientRect();
      createClickAnimation(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }

    // Увеличиваем счетчик
    coins++;
    energy--;
    document.getElementById('balance').textContent = coins;
    updateEnergyDisplay();
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

document.getElementById('userAvatar').addEventListener('click', () => {
  const modal = document.createElement('div');
  modal.className = 'settings-overlay active';
  modal.innerHTML = `
    <div class="settings-panel">
      <div class="settings-header">
        <h2>Настройки</h2>
        <button class="close-settings" onclick="this.closest('.settings-overlay').remove()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="settings-content">
        <div class="settings-section">
          <div class="settings-item">
            <span>Звуки</span>
            <label class="switch">
              <input type="checkbox" id="soundToggle">
              <span class="slider"></span>
            </label>
          </div>
          <div class="settings-item">
            <span>Музыка</span>  
            <label class="switch">
              <input type="checkbox" id="musicToggle">
              <span class="slider"></span>
            </label>
          </div>
          <div class="settings-item">
            <span>Уведомления</span>
            <label class="switch">
              <input type="checkbox" id="notificationsToggle">
              <span class="slider"></span>
            </label>
          </div>
          <div class="settings-item">
            <span>Снег</span>
            <label class="switch">
              <input type="checkbox" id="snowToggle" ${snowEnabled ? 'checked' : ''}>
              <span class="slider"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('snowToggle').addEventListener('change', e => {
    snowEnabled = e.target.checked;
    const flakes = document.querySelectorAll('.snowflake');
    flakes.forEach(flake => {
      flake.style.display = snowEnabled ? 'block' : 'none';
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
  const cardsGrid = document.getElementById('cardsGrid');
  cardsGrid.innerHTML = '';
  
  // Сначала добавляем все карточки в массив, чтобы отсортировать их по цене
  const sortedCards = [...cards].sort((a, b) => parseInt(a.price) - parseInt(b.price));
  
  sortedCards.forEach(card => {
    const cardElement = document.createElement('div');
    cardElement.className = 'card';
    cardElement.innerHTML = `
        ${card.isNew ? '<div class="new-badge">NEW</div>' : ''}
        <div class="card-image-container">
          <img src="${card.image}" alt="${card.title}" loading="lazy">
        </div>
        <div class="card-title">${card.title}</div>
        <div class="card-description">${card.description}</div>
        <div class="card-footer">
            <div class="card-price">
                <img src="https://i.postimg.cc/FFx7T4Bh/image.png" alt="Coins" class="coin-icon">
                <span>${card.price}</span>
            </div>
            <button class="buy-button" onclick="buyCard(${card.id})">Купить</button>
        </div>
        <div class="per-hour">+${card.perHour}/час</div>
    `;
    cardsGrid.appendChild(cardElement);
  });
}

function buyCard(cardId) {
  const card = cards.find(c => c.id === cardId);
  if (card && coins >= parseInt(card.price)) {
    coins -= parseInt(card.price);
    document.getElementById('balance').textContent = coins;
    alert(`Вы купили карту "${card.title}"!`);
  } else {
    alert('Недостаточно монет!');
  }
}

document.querySelector('.top-panel').style.zIndex = '2';
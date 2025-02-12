// Данные мини-игр
const minigamesData = [
    {
        id: 1,
        title: "Память Коалы",
        description: "Тренируйте память, находя пары карточек с эвкалиптом",
        image: "https://i.postimg.cc/Y986QWcW/image.png",
        reward: 50,
        status: "available",
        isNew: true
    },
    {
        id: 2,
        title: "Собери Эвкалипт",
        description: "Собирайте падающие листья эвкалипта",
        image: "https://i.postimg.cc/bYHMFCPx/image.png",
        reward: 30,
        status: "cooldown",
        isNew: false
    },
    {
        id: 3,
        title: "Пазл Коалы",
        description: "Соберите картинку с коалой",
        image: "https://i.postimg.cc/T2C0DZG4/image.png",
        reward: 40,
        status: "available",
        isNew: true
    }
];

// Конфигурация слотов
const slotConfig = {
    symbols: [
        { id: 'koala', image: 'https://i.postimg.cc/nh2gXRj2/koala-button.png', value: 500 },
        { id: 'leaf', image: 'https://i.postimg.cc/nVWW79L8/leaf-card.png', value: 300 },
        { id: 'photoroom', image: 'https://i.postimg.cc/mrrqCY7s/image-Photoroom.png', value: 200 },
        { id: 'ton', image: 'https://i.postimg.cc/N0Pn4Kxr/ton.png', value: 150 },
        { id: 'star', image: 'https://i.postimg.cc/bYHMFCPx/image.png', value: 100 }
    ],
    spinCost: 100,
    spinDuration: 3000, // Уменьшаем до 3 секунд
    reels: 3,
    symbolHeight: 60,
    visibleSymbols: 3,
    combinations: [
        { symbols: ['koala', 'koala', 'koala'], multiplier: 50 },
        { symbols: ['leaf', 'leaf', 'leaf'], multiplier: 30 },
        { symbols: ['photoroom', 'photoroom', 'photoroom'], multiplier: 20 },
        { symbols: ['ton', 'ton', 'ton'], multiplier: 15 },
        { symbols: ['star', 'star', 'star'], multiplier: 10 },
        { symbols: ['koala', 'koala'], multiplier: 5 },
        { symbols: ['leaf', 'leaf'], multiplier: 3 },
        { symbols: ['photoroom', 'photoroom'], multiplier: 2 }
    ]
};

// Функция инициализации секции мини-игр
function initMinigames() {
    console.log('Инициализация секции мини-игр...');
    const container = document.querySelector('.minigames-grid');
    
    if (!container) {
        console.error('Контейнер для мини-игр не найден!');
        return;
    }

    console.log('Начинаем добавление карточек мини-игр...');
    minigamesData.forEach(game => {
        console.log(`Создание карточки для игры: ${game.title}`);
        const card = createGameCard(game);
        container.appendChild(card);
    });
    
    console.log('Все карточки мини-игр успешно добавлены');
}

// Функция создания карточки игры
function createGameCard(game) {
    console.log(`Создание HTML для игры: ${game.title}`);
    const card = document.createElement('div');
    card.className = `minigame-card ${game.isNew ? 'new' : ''}`;
    
    card.innerHTML = `
        <img src="${game.image}" alt="${game.title}" class="minigame-image">
        <div class="minigame-content">
            <h3 class="minigame-title">${game.title}</h3>
            <p class="minigame-description">${game.description}</p>
            <div class="minigame-stats">
                <div class="minigame-reward">
                    <img src="https://i.postimg.cc/jd48ZLzZ/image.png" alt="reward">
                    ${game.reward}
                </div>
                <div class="minigame-status ${game.status}">${getStatusText(game.status)}</div>
            </div>
        </div>
        ${game.isNew ? '<div class="minigame-badge">Новая</div>' : ''}
    `;
    
    card.addEventListener('click', () => {
        console.log(`Клик по карточке игры: ${game.title}`);
        startMinigame(game);
    });
    
    return card;
}

// Функция получения текста статуса
function getStatusText(status) {
    switch (status) {
        case 'available':
            return 'Доступно';
        case 'cooldown':
            return 'Перезарядка';
        default:
            return 'Недоступно';
    }
}

// Функция запуска мини-игры
function startMinigame(game) {
    console.log(`Попытка запуска игры: ${game.title}`);
    if (game.status === 'available') {
        console.log(`Игра ${game.title} запущена!`);
        // Здесь будет логика запуска игры
    } else {
        console.log(`Игра ${game.title} недоступна: ${getStatusText(game.status)}`);
        // Показать уведомление о недоступности
    }
}

// Функция обновления баланса
function updateBalance(amount) {
    const balanceElement = document.querySelector('.balance-value');
    const slotBalanceElement = document.querySelector('#slotBalance');
    
    if (balanceElement && slotBalanceElement) {
        // Получаем текущий баланс из обоих элементов
        const mainBalance = parseInt(balanceElement.textContent) || 0;
        const slotBalance = parseInt(slotBalanceElement.textContent) || 0;
        
        // Используем максимальное значение баланса
        const currentBalance = Math.max(mainBalance, slotBalance);
        const newBalance = currentBalance + amount;
        
        // Обновляем оба элемента баланса
        balanceElement.textContent = newBalance;
        slotBalanceElement.textContent = newBalance;
        
        console.log(`Баланс обновлен: ${currentBalance} -> ${newBalance}`);
        return newBalance;
    }
    return 0;
}

// Функция получения текущего баланса
function getCurrentBalance() {
    const balanceElement = document.querySelector('.balance-value');
    const slotBalanceElement = document.querySelector('#slotBalance');
    
    if (balanceElement && slotBalanceElement) {
        const mainBalance = parseInt(balanceElement.textContent) || 0;
        const slotBalance = parseInt(slotBalanceElement.textContent) || 0;
        return Math.max(mainBalance, slotBalance);
    }
    return 0;
}

// Инициализация игры
function initSlotMachine() {
    console.log('Инициализация слот-машины...');
    const container = document.querySelector('.minigames-container');
    if (!container) {
        console.error('Контейнер для слотов не найден!');
        return;
    }

    const currentBalance = getCurrentBalance();
    
    container.innerHTML = `
        <div class="slots-container">
            <div class="slots-header">
                <h2>Слоты Коалы</h2>
                <div class="balance-display">
                    <img src="https://i.postimg.cc/FFx7T4Bh/image.png" alt="coins">
                    <span id="slotBalance">${currentBalance}</span>
                </div>
            </div>
            
            <div class="slot-machine">
                <div class="reels-container">
                    ${Array(slotConfig.reels).fill().map(() => `
                        <div class="reel">
                            <div class="symbols-container"></div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="win-line"></div>
                
                <div class="controls">
                    <button class="spin-button">
                        <span>Крутить</span>
                        <div class="spin-cost">
                            <img src="https://i.postimg.cc/FFx7T4Bh/image.png" alt="coins">
                            <span>${slotConfig.spinCost}</span>
                        </div>
                    </button>
                </div>
            </div>
            
            <div class="win-message" style="display: none;">
                <span class="win-amount">+1000</span>
            </div>
        </div>
    `;

    initializeReels();
    attachEventListeners();
}

// Инициализация барабанов
function initializeReels() {
    console.log('Инициализация барабанов...');
    const reels = document.querySelectorAll('.reel');
    
    reels.forEach(reel => {
        const container = reel.querySelector('.symbols-container');
        container.style.position = 'absolute';
        container.style.width = '100%';
        container.style.height = '1000px'; // Уменьшаем высоту контейнера
        
        // Добавляем символы в каждый барабан (в 10-кратном количестве для большей непрерывности)
        for (let i = 0; i < 10; i++) {
            slotConfig.symbols.forEach(symbol => {
                const symbolElement = document.createElement('div');
                symbolElement.className = 'slot-symbol';
                symbolElement.innerHTML = `<img src="${symbol.image}" alt="${symbol.id}" style="width: 60px; height: 60px; object-fit: contain;">`;
                container.appendChild(symbolElement);
            });
        }
        
        // Устанавливаем начальную позицию
        const initialOffset = Math.floor(Math.random() * slotConfig.symbols.length) * 60;
        container.style.transform = `translateY(-${initialOffset}px)`;
    });
}

// Прикрепление обработчиков событий
function attachEventListeners() {
    console.log('Прикрепление обработчиков событий...');
    const spinButton = document.querySelector('.spin-button');
    if (spinButton) {
        spinButton.addEventListener('click', startSpin);
    }
}

// Запуск вращения
function startSpin() {
    console.log('Запуск вращения...');
    const currentBalance = getCurrentBalance();
    
    if (currentBalance < slotConfig.spinCost) {
        console.log('Недостаточно средств для вращения');
        showWinMessage('Недостаточно средств!');
        return;
    }
    
    // Списываем стоимость вращения
    updateBalance(-slotConfig.spinCost);
    
    const spinButton = document.querySelector('.spin-button');
    spinButton.disabled = true;
    
    const reels = document.querySelectorAll('.reel');
    let delay = 0;
    
    reels.forEach((reel, index) => {
        delay += 200; // Уменьшаем задержку между барабанами
        setTimeout(() => spinReel(reel, index), delay);
    });

    setTimeout(checkWin, delay + slotConfig.spinDuration + 500); // Добавляем небольшой запас времени
}

// Вращение отдельного барабана
function spinReel(reel, index) {
    console.log(`Вращение барабана ${index + 1}...`);
    const container = reel.querySelector('.symbols-container');
    
    // Сначала убираем transition для мгновенного сброса позиции
    container.style.transition = 'none';
    container.style.transform = 'translateY(0)';
    container.offsetHeight; // Форсируем reflow
    
    // Создаем keyframes для плавного замедления
    const totalSpins = 2; // Количество полных оборотов
    const symbolsHeight = slotConfig.symbols.length * 60; // Высота всех символов
    const finalOffset = (Math.floor(Math.random() * slotConfig.symbols.length)) * 60;
    const totalDistance = (symbolsHeight * totalSpins) + finalOffset;
    
    const keyframes = [
        { transform: 'translateY(0)', offset: 0 },
        { transform: `translateY(-${totalDistance * 0.4}px)`, offset: 0.4 },
        { transform: `translateY(-${totalDistance * 0.8}px)`, offset: 0.8 },
        { transform: `translateY(-${totalDistance}px)`, offset: 1 }
    ];

    const timing = {
        duration: slotConfig.spinDuration,
        easing: 'cubic-bezier(0.2, 0.6, 0.3, 1)',
        fill: 'forwards'
    };

    // Запускаем анимацию
    const animation = container.animate(keyframes, timing);
    
    // После остановки корректируем позицию и сохраняем финальный символ
    animation.onfinish = () => {
        const finalSymbolIndex = Math.floor(finalOffset / 60);
        container.style.transform = `translateY(-${finalOffset}px)`;
        container.dataset.finalSymbol = slotConfig.symbols[finalSymbolIndex].id;
        console.log(`Барабан ${index + 1} остановился на символе: ${slotConfig.symbols[finalSymbolIndex].id}`);
    };
}

// Проверка выигрыша
function checkWin() {
    console.log('Проверка выигрыша...');
    const spinButton = document.querySelector('.spin-button');
    spinButton.disabled = false;
    
    // Получаем финальные символы
    const reels = document.querySelectorAll('.reel');
    const finalSymbols = Array.from(reels).map(reel => 
        reel.querySelector('.symbols-container').dataset.finalSymbol
    );
    
    console.log('Финальные символы:', finalSymbols);
    
    // Проверяем комбинации
    let winAmount = 0;
    let winningCombo = null;
    
    // Сначала проверяем комбинации из трех символов
    for (const combo of slotConfig.combinations) {
        if (combo.symbols.length === 3) {
            const matches = combo.symbols.every((symbol, index) => 
                finalSymbols[index] === symbol
            );
            
            if (matches) {
                const baseValue = slotConfig.symbols.find(s => s.id === combo.symbols[0]).value;
                winAmount = baseValue * combo.multiplier;
                winningCombo = combo;
                break;
            }
        }
    }
    
    // Если нет выигрыша по трем символам, проверяем комбинации из двух
    if (!winningCombo) {
        for (const combo of slotConfig.combinations) {
            if (combo.symbols.length === 2) {
                const matches = finalSymbols[0] === combo.symbols[0] && 
                              finalSymbols[1] === combo.symbols[1];
                
                if (matches) {
                    const baseValue = slotConfig.symbols.find(s => s.id === combo.symbols[0]).value;
                    winAmount = baseValue * combo.multiplier;
                    winningCombo = combo;
                    break;
                }
            }
        }
    }
    
    if (winAmount > 0) {
        console.log(`Выигрышная комбинация: ${winningCombo.symbols.join(', ')}, выигрыш: ${winAmount}`);
        updateBalance(winAmount);
        showWinMessage(winAmount);
    } else {
        console.log('Нет выигрышной комбинации');
    }
}

// Показ сообщения о выигрыше
function showWinMessage(amount) {
    console.log(`Показ сообщения о выигрыше: ${amount}`);
    const winMessage = document.querySelector('.win-message');
    const winAmount = winMessage.querySelector('.win-amount');
    
    winAmount.textContent = `+${amount}`;
    winMessage.style.display = 'block';
    
    setTimeout(() => {
        winMessage.style.display = 'none';
    }, 2000);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM загружен, начинаем инициализацию мини-игр...');
    initMinigames();
    console.log('DOM загружен, начинаем инициализацию слотов...');
    initSlotMachine();
}); 
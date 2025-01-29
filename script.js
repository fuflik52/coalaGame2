document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    const clickerButton = document.getElementById('clickerButton');
    const balanceValue = document.querySelector('.balance-value');
    const settingsButton = document.getElementById('settingsButton');
    const settingsModal = document.getElementById('settingsModal');
    const sections = document.querySelectorAll('.content-section');
    const progressBar = document.querySelector('.progress');
    let balance = 0;
    
    // Система энергии
    let maxEnergy = 100;
    let currentEnergy = maxEnergy;
    let lastEnergyUpdate = Date.now();
    
    // Загружаем сохраненную энергию
    const savedEnergy = localStorage.getItem('energy');
    const savedEnergyTime = localStorage.getItem('energyTime');
    if (savedEnergy && savedEnergyTime) {
        const timePassed = Math.floor((Date.now() - parseInt(savedEnergyTime)) / 1000);
        currentEnergy = Math.min(maxEnergy, parseInt(savedEnergy) + timePassed);
        updateEnergyDisplay();
    }

    // Обновление энергии каждую секунду
    setInterval(() => {
        if (currentEnergy < maxEnergy) {
            currentEnergy = Math.min(maxEnergy, currentEnergy + 1);
            updateEnergyDisplay();
            saveEnergyState();
        }
    }, 1000);

    // Сохранение состояния энергии
    function saveEnergyState() {
        localStorage.setItem('energy', currentEnergy.toString());
        localStorage.setItem('energyTime', Date.now().toString());
    }

    // Обновление отображения энергии
    function updateEnergyDisplay() {
        progressBar.style.width = `${(currentEnergy / maxEnergy) * 100}%`;
        progressBar.textContent = `${currentEnergy}/${maxEnergy}`;
    }

    // Данные карточек
    const cardsData = [
        {
            id: 1,
            image: "https://res.cloudinary.com/dib4woqge/image/upload/v1735300135/1000000472_wu48p4.png",
            title: "Начало пути",
            description: "Коала только начинает своё путешествие. Даёт 120 эвкалипта в час",
            price: "10000",
            perHour: 120,
            isNew: false
        },
        {
            id: 2,
            image: "https://i.postimg.cc/sxpJmh0S/image.png",
            title: "Первые деньги",
            description: "Коала заработала свои первые деньги. Продолжаем в том же духе. Добавляет 350 эвкалипта в час",
            price: "25000",
            perHour: 350,
            isNew: false
        },
        {
            id: 3,
            image: "https://i.postimg.cc/pVwWnFHC/image.png",
            title: "Коала на отдыхе",
            description: "После первых заработанных денег можно хорошенько отдохнуть. Добавляет 800 эвкалипта в час",
            price: "50000",
            perHour: 800,
            isNew: false
        },
        {
            id: 4,
            image: "https://i.postimg.cc/nLCgk3KD/image.png",
            title: "Снежные забавы",
            description: "Наступила зима, а значит можно хорошо порезвиться в снежки. Но не забываем про прибыль в 1800 эвкалипта в час",
            price: "100000",
            perHour: 1800,
            isNew: false
        },
        {
            id: 5,
            image: "https://i.postimg.cc/wTxjfh3V/Leonardo-Phoenix-10-A-vibrant-whimsical-illustration-of-Koala-2.jpg",
            title: "Коала-путешественник",
            description: "Наша коала отправляется в кругосветное путешествие, собирая эвкалипт по всему миру. Приносит 3500 эвкалипта в час",
            price: "200000",
            perHour: 3500,
            isNew: false
        },
        {
            id: 6,
            image: "https://i.postimg.cc/3JnrGd8c/Leonardo-Phoenix-10-A-whimsical-digital-illustration-of-a-koal-0.jpg",
            title: "Бизнес-коала",
            description: "Пора открывать свой бизнес! Коала в деловом костюме управляет сетью эвкалиптовых плантаций. Добавляет 7000 эвкалипта в час",
            price: "500000",
            perHour: 7000,
            isNew: false
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

    // Функция переключения секций
    function switchSection(sectionId) {
        sections.forEach(section => {
            section.classList.remove('active');
        });
        const targetSection = document.getElementById(`${sectionId}Section`);
        targetSection.classList.add('active');

        // Проверка на разделы в разработке
        if (sectionId === 'mining' || sectionId === 'reward') {
            showNotification('Этот раздел находится в разработке', 'info');
        }
    }

    // Инициализация активной секции
    switchSection('home');

    // Обработка навигации
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            const section = item.dataset.section;
            switchSection(section);
        });
    });

    // Обработка кликов и тачей по кнопке
    function handleClick(e) {
        e.preventDefault(); // Предотвращаем стандартное поведение
        if (currentEnergy > 0) {
            currentEnergy--;
            updateEnergyDisplay();
            saveEnergyState();
            
            balance += 1;
            balanceValue.textContent = balance;
            
            // Создаем анимацию для каждого касания
            const value = document.createElement('span');
            value.className = 'floating-value';
            value.textContent = '+1';
            
            // Получаем координаты клика/касания
            const x = e.touches ? e.touches[0].clientX : e.clientX;
            const y = e.touches ? e.touches[0].clientY : e.clientY;
            
            value.style.cssText = `
                position: fixed;
                color: #4CAF50;
                font-size: 20px;
                font-weight: bold;
                pointer-events: none;
                animation: floatUp 1s ease-out forwards;
                left: ${x}px;
                top: ${y}px;
                transform: translate(-50%, -50%);
            `;
            
            document.body.appendChild(value);
            setTimeout(() => value.remove(), 1000);
        } else {
            showNotification('Недостаточно энергии!', 'error');
        }
    }

    // Добавляем обработчики для всех типов взаимодействия
    clickerButton.addEventListener('click', handleClick);
    clickerButton.addEventListener('touchstart', handleClick, { passive: false });
    
    // Отключаем масштабирование при двойном тапе
    document.addEventListener('touchstart', function(e) {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });

    // Отключаем контекстное меню на изображениях
    document.addEventListener('contextmenu', function(e) {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
        }
    });

    // Добавление гирлянды в модальное окно настроек
    function addGarlandToSettings() {
        const settingsModal = document.querySelector('.settings-modal');
        const garlandDiv = document.createElement('div');
        garlandDiv.className = 'garland_image';
        settingsModal.insertBefore(garlandDiv, settingsModal.firstChild);
    }

    // Вызываем функцию при открытии модального окна
    settingsButton.addEventListener('click', () => {
        settingsModal.classList.add('active');
        addGarlandToSettings();
    });

    settingsModal.querySelector('.close-button').addEventListener('click', () => {
        settingsModal.classList.remove('active');
    });

    // Закрытие модального окна по клику вне его
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            settingsModal.classList.remove('active');
        }
    });

    // Добавляем стили анимации
    const style = document.createElement('style');
    style.textContent = `
        @keyframes floatUp {
            0% {
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
            }
            100% {
                transform: translate(-50%, -150%) scale(1.5);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Обработка копирования реферальной ссылки
    const copyReferralButton = document.getElementById('copyReferralLink');
    
    copyReferralButton.addEventListener('click', async () => {
        // Здесь должен быть код для получения telegramId пользователя
        const telegramId = 'u0'; // Замените на реальный ID пользователя
        const referralLink = `https://t.me/CoalaGame_Bot/play?startapp=${telegramId}`;
        
        try {
            await navigator.clipboard.writeText(referralLink);
            
            // Визуальное подтверждение копирования
            const originalText = copyReferralButton.innerHTML;
            copyReferralButton.innerHTML = '<span>Скопировано! ✓</span>';
            copyReferralButton.style.background = '#45a049';
            
            setTimeout(() => {
                copyReferralButton.innerHTML = originalText;
                copyReferralButton.style.background = '#4CAF50';
            }, 2000);
        } catch (err) {
            console.error('Ошибка при копировании:', err);
        }
    });

    // Функция для показа уведомлений
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Удаляем уведомление через 3 секунды
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out forwards';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Функция для отображения карточек
    function renderCards() {
        const cardsGrid = document.getElementById('cardsGrid');
        if (!cardsGrid) return;

        cardsGrid.innerHTML = cardsData.map(card => `
            <div class="card-item">
                <img src="${card.image}" alt="${card.title}" class="card-image">
                <div class="card-content">
                    <div class="card-title">
                        ${card.title}
                        ${card.isNew ? '<span class="new-badge">NEW</span>' : ''}
                    </div>
                    <div class="card-description">${card.description}</div>
                    <div class="card-stats">
                        <div class="card-price" onclick="buyCard(${card.id})">
                            <img src="https://i.postimg.cc/FFx7T4Bh/image.png" alt="Currency">
                            ${card.price}
                        </div>
                        <div class="card-income">
                            +<span>${card.perHour}</span>/час
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Функция для покупки карточки
    function buyCard(cardId) {
        const card = cardsData.find(c => c.id === cardId);
        if (!card) return;
        
        if (balance >= parseInt(card.price)) {
            balance -= parseInt(card.price);
            balanceValue.textContent = balance;
            showNotification('Карточка успешно куплена!', 'success');
            // Здесь можно добавить логику для добавления карточки в коллекцию
        } else {
            showNotification('Недостаточно средств!', 'error');
        }
    }

    // Делаем функцию buyCard глобальной
    window.buyCard = buyCard;

    // Вызываем функцию при загрузке страницы
    renderCards();
}); 
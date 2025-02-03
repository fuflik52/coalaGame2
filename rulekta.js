class CardGame {
    constructor() {
        this.spinButton = document.querySelector('.spin-button');
        this.cardsContainer = document.querySelector('.cards-container');
        this.hintText = document.querySelector('.hint-text');
        this.container = document.querySelector('.container');
        
        // Добавляем контейнер для конфетти
        this.confettiContainer = document.createElement('div');
        this.confettiContainer.className = 'confetti-container';
        document.body.appendChild(this.confettiContainer);
        
        this.isGameActive = false;
        this.selectedCard = null;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.isPaid = false;
        
        // Скрываем подсказку при инициализации
        this.hintText.style.display = 'none';
        this.container.classList.add('game-inactive');
        
        // Инициализируем Telegram WebApp только если не в тестовом режиме
        if (!CONFIG.TEST_MODE) {
            this.tg = window.Telegram.WebApp;
            
            // Проверяем, что мы в Telegram WebApp
            if (!this.tg.initDataUnsafe?.user) {
                console.error('Эта игра должна быть запущена в Telegram WebApp');
                this.spinButton.disabled = true;
                return;
            }
        }

        this.prizes = [
            // Обычные призы (common)
            { type: 'leaf', value: 1000, chance: 45, rarity: 'common' },
            { type: 'koala', value: 5000, chance: 15, rarity: 'common' },
            
            // Редкие призы (rare)
            { type: 'leaf', value: 10000, chance: 20, rarity: 'rare' },
            { type: 'koala', value: 50000, chance: 10, rarity: 'rare' },
            
            // Золотые призы (gold) - только TON
            { type: 'ton', value: 0.1, chance: 5, rarity: 'gold' },
            { type: 'ton', value: 0.5, chance: 3, rarity: 'gold' },
            { type: 'ton', value: 1, chance: 2, rarity: 'gold' }
        ];
        
        this.init();
        this.createInitialCards();
    }

    init() {
        this.spinButton.addEventListener('click', () => this.handleSpinClick());
        
        // Добавляем обработчики для свайпов
        this.cardsContainer.addEventListener('touchstart', (e) => this.handleTouchStart(e), false);
        this.cardsContainer.addEventListener('touchmove', (e) => this.handleTouchMove(e), false);
    }

    handleTouchStart(e) {
        const touch = e.touches[0];
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
    }

    handleTouchMove(e) {
        if (!this.touchStartX || !this.touchStartY || !this.isGameActive) return;

        const touch = e.touches[0];
        const diffX = this.touchStartX - touch.clientX;
        const diffY = this.touchStartY - touch.clientY;

        // Если горизонтальный свайп больше вертикального и достаточно длинный
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
            const card = e.target.closest('.card');
            if (card && !card.classList.contains('flipped')) {
                this.selectCard(card);
            }
        }

        this.touchStartX = null;
        this.touchStartY = null;
    }

    createConfetti() {
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.animationDelay = Math.random() * 2 + 's';
            confetti.style.backgroundColor = [
                '#4ADE80', // зеленый
                '#FFC107', // желтый
                '#0088CC', // голубой
                '#FF4081', // розовый
            ][Math.floor(Math.random() * 4)];
            this.confettiContainer.appendChild(confetti);

            // Удаляем конфетти после анимации
            confetti.addEventListener('animationend', () => {
                confetti.remove();
            });
        }
    }

    createInitialCards() {
        // Очищаем контейнер перед созданием карточек
        const oldCards = Array.from(this.cardsContainer.querySelectorAll('.card'));
        const previousPrize = oldCards.find(card => card.classList.contains('flipped'))?.querySelector('.prize-value')?.innerHTML;
        
        this.cardsContainer.innerHTML = '';
        
        // Создаем ровно три карточки
        for (let i = 0; i < 3; i++) {
            const card = this.createCard();
            if (previousPrize && i !== 0) { // Не показываем на первой карточке
                const backFace = card.querySelector('.card-back');
                backFace.className = 'card-face card-back previous-prize';
                backFace.innerHTML = `
                    <div class="rarity-badge">Возможный выигрыш</div>
                    <img src="https://i.postimg.cc/ZnggtH7v/image.png" alt="Center Image" class="center-image">
                    <div class="prize-container">
                        <div class="prize-value">${previousPrize}</div>
                    </div>
                `;
            }
            card.classList.add('disabled');
            this.cardsContainer.appendChild(card);
        }
    }

    async handleSpinClick() {
        if (this.isGameActive) return;
        
        if (CONFIG.TEST_MODE) {
            // В тестовом режиме
            if (CONFIG.TEST_CONFIG.AUTO_PAY) {
                // Автоматическая "оплата"
                setTimeout(() => {
                    this.isPaid = true;
                    this.startGame();
                }, CONFIG.TEST_CONFIG.PAYMENT_DELAY);
            } else {
                // Имитация оплаты с подтверждением
                if (confirm('Подтвердить оплату 1 звезды?')) {
                    this.isPaid = true;
                    this.startGame();
                }
            }
        } else {
            // Боевой режим с Telegram
            try {
                this.tg.MainButton.text = "Оплатить 1 звезду";
                this.tg.MainButton.show();
                
                this.tg.MainButton.onClick(async () => {
                    try {
                        const response = await fetch('/api/create-invoice', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                user_id: this.tg.initDataUnsafe.user.id
                            })
                        });

                        const data = await response.json();
                        
                        if (data.invoice_url) {
                            this.tg.openInvoice(data.invoice_url, (status) => {
                                if (status === 'paid') {
                                    this.isPaid = true;
                                    this.startGame();
                                    this.tg.MainButton.hide();
                                } else {
                                    alert('Оплата не была завершена');
                                }
                            });
                        }
                    } catch (error) {
                        console.error('Ошибка при создании платежа:', error);
                        alert('Произошла ошибка при создании платежа');
                    }
                });
            } catch (error) {
                console.error('Ошибка:', error);
                alert('Произошла ошибка. Попробуйте еще раз.');
            }
        }
    }

    startGame() {
        if (!this.isPaid) {
            alert('Пожалуйста, оплатите 1 звезду для начала игры');
            return;
        }
        
        this.isGameActive = true;
        this.spinButton.disabled = true;
        
        // Показываем подсказку после оплаты
        this.hintText.style.display = 'block';
        this.hintText.style.opacity = '1';
        
        // Если есть открытые карточки, создаем новые
        const hasFlippedCards = this.cardsContainer.querySelector('.card.flipped');
        if (hasFlippedCards) {
            this.createInitialCards();
        }
        
        // Активируем карточки и убираем класс unpaid
        const cards = this.cardsContainer.querySelectorAll('.card');
        cards.forEach(card => {
            card.classList.remove('disabled', 'unpaid');
        });
        
        // Показываем подсказку в начале игры
        this.container.classList.remove('game-inactive');
        this.container.classList.add('game-active');
    }

    createCard() {
        const card = document.createElement('div');
        card.className = 'card unpaid';
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', 'Игровая карточка');
        
        // Лицевая сторона
        const frontFace = document.createElement('div');
        frontFace.className = 'card-face card-front';
        frontFace.setAttribute('aria-hidden', 'true');
        frontFace.innerHTML = `
            <div class="card-pattern">
                <img src="https://i.postimg.cc/T3qC7r9b/image.png" alt="Рубашка карты">
            </div>
        `;

        // Обратная сторона
        const backFace = document.createElement('div');
        backFace.className = 'card-face card-back';
        backFace.setAttribute('aria-hidden', 'true');

        card.appendChild(frontFace);
        card.appendChild(backFace);

        card.addEventListener('click', () => {
            if (!this.isPaid) {
                this.handleSpinClick(); // Вызываем оплату при клике на неоплаченную карточку
                return;
            }
            this.selectCard(card);
        });

        return card;
    }

    selectCard(card) {
        if (!this.isGameActive || card.classList.contains('flipped') || this.selectedCard || !this.isPaid) return;
        
        const prize = this.getRandomPrize();
        const backFace = card.querySelector('.card-back');
        
        // Скрываем подсказку при выборе карточки
        this.hintText.style.opacity = '0';
        
        backFace.className = `card-face card-back ${prize.rarity}`;
        
        backFace.innerHTML = `
            <div class="rarity-badge">${this.getRarityText(prize.rarity)}</div>
            <img src="https://i.postimg.cc/ZnggtH7v/image.png" alt="Center Image" class="center-image no-flip">
            <div class="prize-container">
                <div class="prize-value">${this.formatPrize(prize)}</div>
            </div>
        `;

        card.classList.add('flipped');
        this.selectedCard = card;
        
        // Показываем другие возможные призы на остальных карточках
        const otherCards = Array.from(this.cardsContainer.querySelectorAll('.card')).filter(c => c !== card);
        otherCards.forEach((otherCard, index) => {
            const otherBackFace = otherCard.querySelector('.card-back');
            const otherPrize = this.getOtherPossiblePrize(prize);
            otherBackFace.className = 'card-face card-back previous-prize';
            otherBackFace.innerHTML = `
                <div class="rarity-badge ${otherPrize.rarity}-border">${this.getRarityText(otherPrize.rarity)}</div>
                <div class="possible-win-text">Возможный выигрыш</div>
                <img src="https://i.postimg.cc/ZnggtH7v/image.png" alt="Center Image" class="center-image no-flip">
                <div class="prize-container">
                    <div class="prize-value">${this.formatPrize(otherPrize)}</div>
                </div>
            `;
            otherCard.classList.add('flipped');
        });
        
        if (prize.rarity === 'rare' || prize.rarity === 'gold') {
            this.createConfetti();
        }

        // После выбора карточки
        this.isGameActive = false;
        this.spinButton.disabled = false;
        this.isPaid = false;

        setTimeout(() => this.resetGame(), 5000);
    }

    // Новый метод для получения другого возможного приза
    getOtherPossiblePrize(currentPrize) {
        // Фильтруем призы, исключая текущий выигрыш
        const possiblePrizes = this.prizes.filter(p => 
            !(p.type === currentPrize.type && p.value === currentPrize.value)
        );
        
        // Выбираем случайный приз из оставшихся
        const randomIndex = Math.floor(Math.random() * possiblePrizes.length);
        return possiblePrizes[randomIndex];
    }

    getRarityText(rarity) {
        switch (rarity) {
            case 'common': return 'Обычная';
            case 'rare': return 'Редкая';
            case 'gold': return 'Золотая';
            default: return '';
        }
    }

    getRandomPrize() {
        const random = Math.random() * 100;
        let sum = 0;
        
        for (const prize of this.prizes) {
            sum += prize.chance;
            if (random <= sum) {
                return prize;
            }
        }
        
        return this.prizes[this.prizes.length - 1];
    }

    getPrizeIcon(type) {
        switch (type) {
            case 'leaf':
                return 'https://i.postimg.cc/FFx7T4Bh/image.png';
            case 'koala':
                return 'https://i.postimg.cc/FFx7T4Bh/image.png';
            case 'ton':
                return 'https://i.postimg.cc/gkM0v59L/image.png';
            default:
                return '';
        }
    }

    formatPrize(prize) {
        let value = prize.value.toLocaleString();
        let text = '';
        switch (prize.type) {
            case 'ton':
                text = `${value} TON`;
                break;
            case 'koala':
                text = `${value}`;
                break;
            case 'leaf':
                text = `${value}`;
                break;
        }
        return `<span>${text}</span>${this.getPrizeIconHTML(prize.type)}`;
    }

    getPrizeIconHTML(type) {
        const iconUrl = this.getPrizeIcon(type);
        return `<img src="${iconUrl}" alt="${type}" class="prize-icon">`;
    }

    resetGame() {
        this.isGameActive = false;
        this.selectedCard = null;
        this.spinButton.disabled = false;
        this.isPaid = false;
        
        // Скрываем подсказку при сбросе
        this.hintText.style.opacity = '0';
        this.hintText.style.display = 'none';
        this.container.classList.remove('game-active');
        this.container.classList.add('game-inactive');
        
        this.createInitialCards();
    }
}

// Инициализация игры при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new CardGame();
}); 
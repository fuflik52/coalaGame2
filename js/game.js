// Этот файл оставлен для будущей реализации игрового функционала
console.log('Game section is under development');

class CardGame {
    constructor() {
        this.spinButton = document.querySelector('.game-cards-container .spin-button');
        this.cardsContainer = document.querySelector('.game-cards-container .cards-container');
        this.hintText = document.querySelector('.game-cards-container .hint-text');
        this.container = document.querySelector('.game-cards-container .container');
        
        if (!this.spinButton || !this.cardsContainer || !this.hintText || !this.container) {
            console.error('Не удалось найти необходимые элементы игры');
            return;
        }
        
        this.confettiContainer = document.createElement('div');
        this.confettiContainer.className = 'confetti-container';
        document.body.appendChild(this.confettiContainer);
        
        this.isGameActive = false;
        this.selectedCard = null;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.isPaid = false;
        
        this.hintText.style.display = 'none';
        this.container.classList.add('game-inactive');
        
        this.tg = window.Telegram?.WebApp;
        
        this.prizes = [
            { type: 'leaf', value: 1000, chance: 45, rarity: 'common' },
            { type: 'koala', value: 5000, chance: 15, rarity: 'common' },
            { type: 'leaf', value: 10000, chance: 20, rarity: 'rare' },
            { type: 'koala', value: 50000, chance: 10, rarity: 'rare' },
            { type: 'ton', value: 0.1, chance: 5, rarity: 'gold' },
            { type: 'ton', value: 0.5, chance: 3, rarity: 'gold' },
            { type: 'ton', value: 1, chance: 2, rarity: 'gold' }
        ];
        
        this.init();
        this.createInitialCards();
    }

    init() {
        if (this.spinButton) {
            this.spinButton.addEventListener('click', () => this.handleSpinClick());
        }
        if (this.cardsContainer) {
            this.cardsContainer.addEventListener('touchstart', (e) => this.handleTouchStart(e), false);
            this.cardsContainer.addEventListener('touchmove', (e) => this.handleTouchMove(e), false);
        }
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
            this.confettiContainer.appendChild(confetti);

            confetti.addEventListener('animationend', () => {
                confetti.remove();
            });
        }
    }

    createInitialCards() {
        if (!this.cardsContainer) return;
        
        this.cardsContainer.innerHTML = '';
        
        for (let i = 0; i < 3; i++) {
            const card = this.createCard();
            card.classList.add('disabled');
            this.cardsContainer.appendChild(card);
        }
    }

    createCard() {
        const card = document.createElement('div');
        card.className = 'card unpaid';
        
        const frontFace = document.createElement('div');
        frontFace.className = 'card-face card-front';
        frontFace.innerHTML = `
            <div class="card-pattern">
                <img src="https://i.postimg.cc/T3qC7r9b/image.png" alt="Коала" class="center-image">
            </div>
        `;

        const backFace = document.createElement('div');
        backFace.className = 'card-face card-back';

        card.appendChild(frontFace);
        card.appendChild(backFace);

        card.addEventListener('click', () => {
            if (!this.isPaid) {
                this.handleSpinClick();
                return;
            }
            this.selectCard(card);
        });

        return card;
    }

    handleSpinClick() {
        if (this.isGameActive) return;
        
        // В демо-режиме автоматически активируем игру
        this.isPaid = true;
        this.startGame();
    }

    startGame() {
        if (!this.isPaid) return;
        
        this.isGameActive = true;
        if (this.spinButton) this.spinButton.disabled = true;
        
        this.hintText.style.display = 'block';
        this.hintText.style.opacity = '1';
        
        this.createInitialCards();
        
        const cards = this.cardsContainer.querySelectorAll('.card');
        cards.forEach(card => {
            card.classList.remove('disabled', 'unpaid');
        });
        
        this.container.classList.remove('game-inactive');
        this.container.classList.add('game-active');
    }

    selectCard(card) {
        if (!this.isGameActive || card.classList.contains('flipped') || this.selectedCard || !this.isPaid) return;
        
        const prize = this.getRandomPrize();
        const backFace = card.querySelector('.card-back');
        
        this.hintText.style.opacity = '0';
        
        backFace.className = `card-face card-back ${prize.rarity}`;
        backFace.innerHTML = this.getCardBackContent(prize);

        card.classList.add('flipped');
        this.selectedCard = card;
        
        if (prize.rarity === 'rare' || prize.rarity === 'gold') {
            this.createConfetti();
        }

        this.isGameActive = false;
        if (this.spinButton) this.spinButton.disabled = false;
        this.isPaid = false;

        setTimeout(() => this.resetGame(), 3000);
    }

    getCardBackContent(prize) {
        return `
            <div class="rarity-badge">${this.getRarityText(prize.rarity)}</div>
            <div class="card-pattern">
                <img src="https://i.postimg.cc/ZnggtH7v/image.png" alt="Коала" class="center-image">
            </div>
            <div class="prize-container">
                <div class="prize-value">
                    <span>${this.formatPrizeValue(prize)}</span>
                    <img src="${this.getPrizeIcon(prize.type)}" alt="${prize.type}" class="prize-icon">
                </div>
            </div>
        `;
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
        
        return this.prizes[0];
    }

    formatPrizeValue(prize) {
        let value = prize.value.toLocaleString();
        switch (prize.type) {
            case 'ton':
                return `${value} TON`;
            case 'koala':
            case 'leaf':
                return value;
            default:
                return value;
        }
    }

    getPrizeIcon(type) {
        switch (type) {
            case 'leaf':
            case 'koala':
                return 'https://i.postimg.cc/FFx7T4Bh/image.png';
            case 'ton':
                return 'https://i.postimg.cc/gkM0v59L/image.png';
            default:
                return '';
        }
    }

    resetGame() {
        this.isGameActive = false;
        this.selectedCard = null;
        if (this.spinButton) this.spinButton.disabled = false;
        this.isPaid = false;
        
        this.hintText.style.opacity = '0';
        this.hintText.style.display = 'none';
        this.container.classList.remove('game-active');
        this.container.classList.add('game-inactive');
        
        this.createInitialCards();
    }
}

// Инициализация игры при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const gameSection = document.getElementById('gameSection');
    if (gameSection && gameSection.classList.contains('active')) {
        new CardGame();
    }
    
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.target.classList.contains('active')) {
                new CardGame();
            }
        });
    });
    
    if (gameSection) {
        observer.observe(gameSection, {
            attributes: true,
            attributeFilter: ['class']
        });
    }
}); 
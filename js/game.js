class NumberGame {
    constructor() {
        this.grid = Array(5).fill().map(() => Array(5).fill(0));
        this.size = 5;
        this.score = 0;
        this.moves = 0;
        this.attempts = 5;
        this.isPlaying = false;
        
        // Получаем элементы DOM
        this.gameBoard = document.querySelector('.game-board');
        this.gridContainer = document.querySelector('.grid-container');
        this.scoreDisplay = document.querySelector('.score-value');
        this.movesDisplay = document.querySelector('.moves-value');
        this.attemptsDisplay = document.querySelector('.attempts-counter');
        
        // Создаем модальное окно подтверждения
        this.createConfirmModal();
        
        if (!this.gameBoard || !this.gridContainer) {
            console.error('Не найдены необходимые элементы игры');
            return;
        }
        
        this.initializeGame();
    }

    createConfirmModal() {
        const modal = document.createElement('div');
        modal.className = 'confirm-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-title">Подтвердите действие</div>
                <div class="modal-text">Вы уверены, что хотите выйти? Прогресс игры не будет сохранен.</div>
                <div class="modal-buttons">
                    <button class="cancel-button">Отмена</button>
                    <button class="confirm-button">OK</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Добавляем обработчики для кнопок
        const confirmButton = modal.querySelector('.confirm-button');
        const cancelButton = modal.querySelector('.cancel-button');
        const modalContent = modal.querySelector('.modal-content');

        confirmButton.addEventListener('click', () => {
            modal.style.display = 'none';
            this.confirmExit();
        });

        cancelButton.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        // Закрытие по клику вне модального окна
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });

        this.confirmModal = modal;
    }

    initializeGame() {
        // Создаем сетку
        this.gridContainer.innerHTML = '';
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.setAttribute('data-row', i);
                cell.setAttribute('data-col', j);
                this.gridContainer.appendChild(cell);
            }
        }

        // Добавляем обработчики событий
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        this.initializeTouchEvents();

        // Добавляем обработчики для кнопок
        const startButtons = document.querySelectorAll('.start-button');
        const exitButtons = document.querySelectorAll('.exit-button');
        const claimButtons = document.querySelectorAll('.claim-reward');
        
        startButtons.forEach(button => {
            button.addEventListener('click', () => {
                if (!this.isPlaying) {
                    const modal = button.closest('.game-modal');
                    if (modal) {
                        modal.style.display = 'none';
                    }
                    this.startGame();
                }
            });
        });
        
        exitButtons.forEach(button => {
            button.addEventListener('click', () => {
                const modal = button.closest('.game-modal');
                if (modal) {
                    modal.style.display = 'none';
                }
                this.exitGame();
            });
        });

        claimButtons.forEach(button => {
            button.addEventListener('click', () => {
                if (window.addMoney) {
                    window.addMoney(1000);
                }
                button.disabled = true;
                button.textContent = 'Награда получена';
                
                // Обновляем статистику
                const completedElement = document.querySelector('.stat-card:nth-child(2) .stat-value');
                if (completedElement) {
                    const completed = parseInt(completedElement.textContent) || 0;
                    completedElement.textContent = completed + 1;
                }
                
                const earnedElement = document.querySelector('.stat-card:nth-child(3) .stat-value');
                if (earnedElement) {
                    const earned = parseInt(earnedElement.textContent) || 0;
                    earnedElement.textContent = earned + 1000;
                }

                // Удаляем класс active у game-board
                if (this.gameBoard) {
                    this.gameBoard.classList.remove('active');
                }

                // Закрываем модальное окно
                const modal = button.closest('.game-modal');
                if (modal) {
                    modal.style.display = 'none';
                }

                // Создаем серпантин
                this.createConfetti();
            });
        });

        // Добавляем в window для доступа из консоли
        window.showGameOver = () => this.showGameOverModal();
        window.showLoseModal = () => this.showGameOverModal();
    }

    initializeTouchEvents() {
        let touchStartX = 0;
        let touchStartY = 0;

        this.gameBoard.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });

        this.gameBoard.addEventListener('touchend', (e) => {
            if (!this.isPlaying) return;
            
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            
            const minSwipeDistance = 50;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (Math.abs(deltaX) > minSwipeDistance) {
                    if (deltaX > 0) {
                        this.move('right');
                    } else {
                        this.move('left');
                    }
                }
            } else {
                if (Math.abs(deltaY) > minSwipeDistance) {
                    if (deltaY > 0) {
                        this.move('down');
                    } else {
                        this.move('up');
                    }
                }
            }
        });
    }

    handleKeyPress(event) {
        if (!this.isPlaying) return;

        switch(event.key) {
            case 'ArrowUp':
                event.preventDefault();
                this.move('up');
                break;
            case 'ArrowDown':
                event.preventDefault();
                this.move('down');
                break;
            case 'ArrowLeft':
                event.preventDefault();
                this.move('left');
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.move('right');
                break;
        }
    }

    startGame() {
        // Проверяем, выполнено ли задание
        const missionContainer = document.querySelector('.mission-container');
        if (missionContainer && missionContainer.classList.contains('mission-completed')) {
            this.attempts = Infinity; // Бесконечные попытки после выполнения
        } else if (this.attempts <= 0) {
            alert('У вас закончились попыток!');
            return;
        }

        this.isPlaying = true;
        this.score = 0;
        this.moves = 0;
        this.grid = Array(5).fill().map(() => Array(5).fill(0));
        
        // Показываем игровое поле и скрываем остальные элементы
        const gameSection = document.querySelector('.game-section');
        if (gameSection) {
            gameSection.classList.add('game-active');
        }
        if (this.gameBoard) {
            this.gameBoard.classList.add('active');
        }
        
        // Добавляем начальные плитки
        this.addNewTile();
        this.addNewTile();
        
        // Обновляем счетчики только если задание не выполнено
        if (!missionContainer || !missionContainer.classList.contains('mission-completed')) {
            this.attempts--;
        }
        this.updateDisplay();
        
        // Управляем видимостью кнопок
        const startButton = document.querySelector('.start-button');
        if (startButton) {
            startButton.style.display = 'none';
        }
    }

    exitGame() {
        // Если игра активна, показываем модальное окно подтверждения
        if (this.isPlaying) {
            this.confirmModal.style.display = 'flex';
            return;
        }
        this.confirmExit();
    }

    confirmExit() {
        // Обновляем лучший счет перед выходом
        this.updateBestScore();
        
        this.isPlaying = false;
        
        // Показываем все элементы и скрываем игровое поле
        const gameSection = document.querySelector('.game-section');
        if (gameSection) {
            gameSection.classList.remove('game-active');
        }
        if (this.gameBoard) {
            this.gameBoard.classList.remove('active');
        }
        
        // Очищаем сетку
        this.grid = Array(5).fill().map(() => Array(5).fill(0));
        
        // Управляем видимостью кнопок
        const startButton = document.querySelector('.start-button');
        if (startButton) {
            // Если задание выполнено, показываем кнопку "Играть"
            const missionContainer = document.querySelector('.mission-container');
            if (missionContainer && missionContainer.classList.contains('mission-completed')) {
                startButton.textContent = 'Играть';
                startButton.style.background = 'linear-gradient(45deg, #4CAF50, #45a049)';
            } else {
                startButton.textContent = 'Начать попытку';
            }
            startButton.style.display = 'block';
        }
        
        this.updateDisplay();
    }

    addNewTile() {
        const emptyCells = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({x: i, y: j});
                }
            }
        }

        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.grid[randomCell.x][randomCell.y] = Math.random() < 0.9 ? 2 : 4;
            const cell = document.querySelector(`[data-row="${randomCell.x}"][data-col="${randomCell.y}"]`);
            cell.classList.add('new');
            setTimeout(() => cell.classList.remove('new'), 200);
        }
    }

    move(direction) {
        if (!this.isPlaying) return;

        const previousGrid = JSON.stringify(this.grid);
        
        switch(direction) {
            case 'up':
                this.moveVertical(true);
                break;
            case 'down':
                this.moveVertical(false);
                break;
            case 'left':
                this.moveHorizontal(true);
                break;
            case 'right':
                this.moveHorizontal(false);
                break;
        }

        if (previousGrid !== JSON.stringify(this.grid)) {
            this.moves++;
            this.addNewTile();
            this.updateDisplay();
            this.checkGameStatus();
        }
    }

    moveHorizontal(toLeft) {
        for (let i = 0; i < this.size; i++) {
            let row = this.grid[i].filter(cell => cell !== 0);
            
            // Объединяем одинаковые числа
            for (let j = 0; j < row.length - 1; j++) {
                if (row[j] === row[j + 1]) {
                    row[j] *= 2;
                    this.score += row[j];
                    row.splice(j + 1, 1);
                }
            }
            
            // Добавляем нули до нужной длины
            while (row.length < this.size) {
                toLeft ? row.push(0) : row.unshift(0);
            }
            
            this.grid[i] = row;
        }
    }

    moveVertical(toTop) {
        for (let j = 0; j < this.size; j++) {
            let column = [];
            for (let i = 0; i < this.size; i++) {
                column.push(this.grid[i][j]);
            }
            
            column = column.filter(cell => cell !== 0);
            
            // Объединяем одинаковые числа
            for (let i = 0; i < column.length - 1; i++) {
                if (column[i] === column[i + 1]) {
                    column[i] *= 2;
                    this.score += column[i];
                    column.splice(i + 1, 1);
                }
            }
            
            // Добавляем нули до нужной длины
            while (column.length < this.size) {
                toTop ? column.push(0) : column.unshift(0);
            }
            
            // Обновляем сетку
            for (let i = 0; i < this.size; i++) {
                this.grid[i][j] = column[i];
            }
        }
    }

    updateDisplay() {
        // Обновляем отображение плиток
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const cell = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                if (cell) {
                    const value = this.grid[i][j];
                    cell.textContent = value || '';
                    cell.setAttribute('data-value', value);
                }
            }
        }

        // Обновляем счет и ходы
        if (this.scoreDisplay) {
            this.scoreDisplay.textContent = this.score;
        }
        if (this.movesDisplay) {
            this.movesDisplay.textContent = this.moves;
        }
        
        // Обновляем счетчик попыток только если задание не выполнено
        const missionContainer = document.querySelector('.mission-container');
        if (this.attemptsDisplay && (!missionContainer || !missionContainer.classList.contains('mission-completed'))) {
            this.attemptsDisplay.textContent = `Осталось попыток: ${this.attempts}`;
        }
    }

    checkGameStatus() {
        // Проверяем достижение 15000 очков
        if (this.score >= 15000) {
            // Проверяем, выполнено ли уже задание
            const missionContainer = document.querySelector('.mission-container');
            if (!missionContainer || !missionContainer.classList.contains('mission-completed')) {
                this.showVictoryModal();
                // Отмечаем задание как выполненное
                if (missionContainer) {
                    missionContainer.classList.add('mission-completed');
                    const attemptsCounter = missionContainer.querySelector('.attempts-counter');
                    if (attemptsCounter) {
                        const missionStatus = document.createElement('div');
                        missionStatus.className = 'mission-status';
                        missionStatus.textContent = 'Выполнено';
                        attemptsCounter.parentNode.replaceChild(missionStatus, attemptsCounter);
                    }
                }
            }
            return;
        }

        // Проверяем возможность ходов
        if (!this.hasValidMoves()) {
            this.updateBestScore();
            this.showGameOverModal();
        }
    }

    updateBestScore() {
        const bestScoreElement = document.querySelector('.stat-card:nth-child(1) .stat-value');
        if (bestScoreElement) {
            const bestScore = parseInt(bestScoreElement.textContent) || 0;
            if (this.score > bestScore) {
                bestScoreElement.textContent = this.score;
            }
        }
    }

    hasValidMoves() {
        // Проверяем наличие пустых ячеек
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) return true;
            }
        }

        // Проверяем возможность объединения по горизонтали
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size - 1; j++) {
                if (this.grid[i][j] === this.grid[i][j + 1]) return true;
            }
        }

        // Проверяем возможность объединения по вертикали
        for (let i = 0; i < this.size - 1; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === this.grid[i + 1][j]) return true;
            }
        }

        return false;
    }

    showVictoryModal() {
        this.isPlaying = false;
        // Обновляем лучший счет при победе
        this.updateBestScore();

        const gameSection = document.querySelector('.game-section');
        if (gameSection) {
            gameSection.classList.remove('game-active');
        }
        // Убираем класс active у игрового поля
        if (this.gameBoard) {
            this.gameBoard.classList.remove('active');
        }

        const victoryModal = document.querySelector('.game-modal.victory-modal');
        if (victoryModal) {
            victoryModal.style.display = 'flex';
            const content = victoryModal.querySelector('.modal-content');
            content.innerHTML = `
                <div class="modal-title">Победа!</div>
                <div class="modal-text">Поздравляем! Вы успешно выполнили задание!</div>
                <div class="reward-text">
                    <img src="https://i.postimg.cc/FFx7T4Bh/image.png" alt="монеты">
                    +1000 монет
                </div>
                <div class="modal-buttons">
                    <button class="control-button claim-reward">Получить награду</button>
                </div>
            `;

            // Добавляем обработчик для кнопки награды
            const claimButton = content.querySelector('.claim-reward');
            if (claimButton) {
                claimButton.addEventListener('click', () => {
                    // Обновляем баланс (прибавляем, а не заменяем)
                    if (window.addMoney) {
                        window.addMoney(1000);
                    }
                    const balanceElement = document.querySelector('.balance-value');
                    if (balanceElement) {
                        const currentBalance = parseInt(balanceElement.textContent) || 0;
                        balanceElement.textContent = (currentBalance + 1000).toString();
                    }

                    // Обновляем статистику
                    const completedElement = document.querySelector('.stat-card:nth-child(2) .stat-value');
                    if (completedElement) {
                        const completed = parseInt(completedElement.textContent) || 0;
                        completedElement.textContent = (completed + 1).toString();
                    }
                    
                    const earnedElement = document.querySelector('.stat-card:nth-child(3) .stat-value');
                    if (earnedElement) {
                        const earned = parseInt(earnedElement.textContent) || 0;
                        earnedElement.textContent = (earned + 1000).toString();
                    }

                    // Отключаем кнопку и меняем текст
                    claimButton.disabled = true;
                    claimButton.textContent = 'Награда получена';

                    // Закрываем модальное окно
                    victoryModal.style.display = 'none';

                    // Создаем серпантин
                    this.createConfetti();
                });
            }
        }

        // Отмечаем задание как выполненное и обновляем кнопку
        const missionContainer = document.querySelector('.mission-container');
        if (missionContainer) {
            missionContainer.classList.add('mission-completed');
            const attemptsCounter = missionContainer.querySelector('.attempts-counter');
            if (attemptsCounter) {
                const missionStatus = document.createElement('div');
                missionStatus.className = 'mission-status';
                missionStatus.textContent = 'Выполнено';
                attemptsCounter.parentNode.replaceChild(missionStatus, attemptsCounter);
            }
        }

        // Обновляем кнопку на главном экране и делаем её видимой
        const startButton = document.querySelector('.start-button');
        if (startButton) {
            startButton.textContent = 'Играть';
            startButton.style.background = 'linear-gradient(45deg, #4CAF50, #45a049)';
            startButton.style.pointerEvents = 'auto';
            startButton.style.display = 'block';
        }
    }

    showGameOverModal() {
        this.isPlaying = false;
        // Обновляем лучший счет при проигрыше
        this.updateBestScore();

        const gameSection = document.querySelector('.game-section');
        if (gameSection) {
            gameSection.classList.remove('game-active');
        }
        const gameOverModal = document.querySelector('.game-modal.game-over-modal');
        if (gameOverModal) {
            gameOverModal.style.display = 'flex';
            const content = gameOverModal.querySelector('.modal-content');
            content.innerHTML = `
                <div class="modal-title">Игра окончена 😢</div>
                <div class="modal-text">К сожалению, не удалось выполнить задание. Осталось попыток: ${this.attempts}</div>
                <div class="modal-buttons">
                    <button class="control-button retry-button">ПОПРОБОВАТЬ СНОВА</button>
                </div>
            `;

            // Добавляем обработчик для кнопки "Попробовать снова"
            const retryButton = content.querySelector('.retry-button');
            if (retryButton) {
                retryButton.addEventListener('click', () => {
                    gameOverModal.style.display = 'none';
                    this.startGame();
                });
            }
        }
    }

    createConfetti() {
        const confettiCount = 100;
        const container = document.querySelector('.game-section');
        
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            
            // Случайный цвет
            const colors = ['#4CAF50', '#FFC107', '#2196F3', '#E91E63', '#9C27B0'];
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            
            // Случайная начальная позиция
            confetti.style.left = Math.random() * 100 + '%';
            
            // Случайный размер
            const size = Math.random() * 10 + 5;
            confetti.style.width = size + 'px';
            confetti.style.height = size + 'px';
            
            // Случайная задержка
            confetti.style.animationDelay = Math.random() * 3 + 's';
            
            container.appendChild(confetti);
            
            // Удаляем конфетти после анимации
            confetti.addEventListener('animationend', () => {
                confetti.remove();
            });
        }
    }
}

// Инициализация игры
document.addEventListener('DOMContentLoaded', () => {
    const game = new NumberGame();
}); 
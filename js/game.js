class NumberGame {
    constructor() {
        this.grid = Array(5).fill().map(() => Array(5).fill(0));
        this.size = 5;
        this.score = 0;
        this.moves = 0;
        this.attempts = 5;
        this.isPlaying = false;
        this.energy = 100;
        this.maxEnergy = 100;
        this.lastEnergyUpdate = Date.now();
        this.energyRegenerationInterval = null;
        this.balance = 0;
        
        // Инициализация Telegram данных
        if (window.telegramHandler) {
            this.telegramUserId = window.telegramHandler.userId;
            this.botUsername = 'TapTapKoala_bot'; // Замените на ваше имя бота
        }
        
        // Получаем элементы DOM
        this.gameBoard = document.querySelector('.game-board');
        this.gridContainer = document.querySelector('.grid-container');
        this.scoreDisplay = document.querySelector('.score-value');
        this.movesDisplay = document.querySelector('.moves-value');
        this.attemptsDisplay = document.querySelector('.attempts-counter');
        this.energyText = document.querySelector('#energyText span');
        this.energyBar = document.querySelector('#energyBar');
        this.balanceDisplay = document.querySelector('.balance-value');
        
        // Создаем модальное окно подтверждения
        this.createConfirmModal();
        
        if (!this.gameBoard || !this.gridContainer) {
            console.error('Не найдены необходимые элементы игры');
            return;
        }
        
        // Добавляем обновление имени пользователя
        this.updateUsername();
        
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

                // Завершаем игру и возвращаемся к основному контенту
                this.isPlaying = false;
                
                // Показываем основной контент
                const gameSection = document.querySelector('.game-section');
                if (gameSection) {
                    gameSection.classList.add('active');
                    gameSection.classList.remove('game-active');
                }

                // Скрываем игровое поле
                if (this.gameBoard) {
                    this.gameBoard.classList.remove('active');
                }

                // Создаем эффект серпантина
                this.createConfetti();

                // Через 2 секунды закрываем модальное окно
                setTimeout(() => {
                    modal.classList.remove('active');
                    setTimeout(() => {
                        modal.remove();
                    }, 300);
                }, 2000);
            });
        });

        // Добавляем обработчик для click-section
        const clickSection = document.querySelector('.click-section');
        if (clickSection) {
            clickSection.addEventListener('click', () => this.handleClick());
        }

        // Загружаем сохраненные данные
        this.loadUserData();

        // Добавляем в window для доступа из консоли
        window.showGameOver = () => this.showGameOverModal();
        window.showLoseModal = () => this.showGameOverModal();
        window.game = this; // Добавляем ссылку на экземпляр игры

        // Запускаем регенерацию энергии
        this.startEnergyRegeneration();
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

    async updateBestScore() {
        if (this.score > (this.bestScore || 0)) {
            const previousBestScore = this.bestScore || 0;
            this.bestScore = this.score;
            
            // Обновляем отображение лучшего счета
            const bestScoreDisplay = document.querySelector('.best-score-value');
            if (bestScoreDisplay) {
                // Анимация обновления счета
                bestScoreDisplay.style.transition = 'transform 0.3s, opacity 0.3s';
                bestScoreDisplay.style.transform = 'scale(0.8)';
                bestScoreDisplay.style.opacity = '0';
                
                setTimeout(() => {
                    bestScoreDisplay.textContent = this.bestScore;
                    bestScoreDisplay.style.transform = 'scale(1.2)';
                    bestScoreDisplay.style.opacity = '1';
                    
                    setTimeout(() => {
                        bestScoreDisplay.style.transform = 'scale(1)';
                    }, 150);
                }, 150);
            }

            // Сохраняем лучший результат в базе данных
            if (window.tg?.initDataUnsafe?.user?.id) {
                try {
                    await window.db.updateUserGameScore(window.tg.initDataUnsafe.user.id, this.score);
                    this.showNotification({
                        title: 'Новый рекорд!',
                        message: `Поздравляем! Вы побили свой предыдущий рекорд (${previousBestScore})`,
                        type: 'success'
                    });
                } catch (error) {
                    console.error('Ошибка при обновлении счета:', error);
                    this.showNotification({
                        title: 'Ошибка',
                        message: 'Не удалось сохранить рекорд',
                        type: 'error'
                    });
                }
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

    async showVictoryModal() {
        // Сохраняем результат в базе данных
        if (window.tg?.initDataUnsafe?.user?.id) {
            await window.db.updateUserGameScore(window.tg.initDataUnsafe.user.id, this.score);
        }

        const modal = document.createElement('div');
        modal.className = 'game-modal victory-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Победа!</h2>
                <div class="score-container">
                    <div class="score-item">
                        <span class="score-label">Счет:</span>
                        <span class="score-value">${this.score}</span>
                    </div>
                    <div class="score-item">
                        <span class="score-label">Ходов:</span>
                        <span class="score-value">${this.moves}</span>
                    </div>
                </div>
                <div class="reward-container">
                    <span class="reward-text">Награда:</span>
                    <div class="reward-value">
                        <img src="https://i.postimg.cc/FFx7T4Bh/image.png" alt="Coins" class="reward-icon">
                        <span>1000</span>
                    </div>
                </div>
                <div class="modal-buttons">
                    <button class="exit-button">Выйти</button>
                    <button class="claim-reward">Получить награду</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Добавляем класс active после добавления в DOM
        setTimeout(() => {
            modal.classList.add('active');
        }, 100);

        // Добавляем обработчики для кнопок
        const claimButton = modal.querySelector('.claim-reward');
        const exitButton = modal.querySelector('.exit-button');

        claimButton.addEventListener('click', () => {
            if (window.addMoney) {
                window.addMoney(1000);
            }
            claimButton.disabled = true;
            claimButton.textContent = 'Награда получена';
            
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

            // Завершаем игру и возвращаемся к основному контенту
            this.isPlaying = false;
            
            // Показываем основной контент
            const gameSection = document.querySelector('.game-section');
            if (gameSection) {
                gameSection.classList.add('active');
                gameSection.classList.remove('game-active');
            }

            // Скрываем игровое поле
            if (this.gameBoard) {
                this.gameBoard.classList.remove('active');
            }

            // Создаем эффект серпантина
            this.createConfetti();

            // Через 2 секунды закрываем модальное окно
            setTimeout(() => {
                modal.classList.remove('active');
                setTimeout(() => {
                    modal.remove();
                }, 300);
            }, 2000);
        });

        exitButton.addEventListener('click', () => {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
            }, 300);
            
            // Завершаем игру и возвращаемся к основному контенту
            this.isPlaying = false;
            
            // Показываем основной контент
            const gameSection = document.querySelector('.game-section');
            if (gameSection) {
                gameSection.classList.add('active');
                gameSection.classList.remove('game-active');
            }

            // Скрываем игровое поле
            if (this.gameBoard) {
                this.gameBoard.classList.remove('active');
            }
        });
    }

    async showGameOverModal() {
        // Сохраняем результат в базе данных
        if (window.tg?.initDataUnsafe?.user?.id) {
            await window.db.updateUserGameScore(window.tg.initDataUnsafe.user.id, this.score);
        }

        const modal = document.createElement('div');
        modal.className = 'game-modal game-over-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Игра окончена</h2>
                <div class="score-container">
                    <div class="score-item">
                        <span class="score-label">Счет:</span>
                        <span class="score-value">${this.score}</span>
                    </div>
                    <div class="score-item">
                        <span class="score-label">Ходов:</span>
                        <span class="score-value">${this.moves}</span>
                    </div>
                </div>
                <div class="modal-buttons">
                    <button class="exit-button">Выйти</button>
                    <button class="start-button">Играть снова</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Добавляем класс active после добавления в DOM
        setTimeout(() => {
            modal.classList.add('active');
        }, 100);

        // Добавляем обработчики для кнопок
        const startButton = modal.querySelector('.start-button');
        const exitButton = modal.querySelector('.exit-button');

        startButton.addEventListener('click', () => {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
            }, 300);
            this.startGame();
        });

        exitButton.addEventListener('click', () => {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
            }, 300);
            this.isPlaying = false;
            if (this.gameBoard) {
                this.gameBoard.classList.remove('active');
            }
        });
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

    // Метод для запуска регенерации энергии
    startEnergyRegeneration() {
        // Очищаем предыдущий интервал, если он был
        if (this.energyRegenerationInterval) {
            clearInterval(this.energyRegenerationInterval);
        }

        this.energyRegenerationInterval = setInterval(() => {
            if (this.energy < this.maxEnergy) {
                this.energy = Math.min(this.maxEnergy, this.energy + 1);
                this.updateEnergyDisplay();
                this.saveUserData();
            }
        }, 1000);
    }

    // Добавляем метод обновления имени пользователя
    updateUsername() {
        const usernameElement = document.querySelector('.username');
        if (usernameElement && window.tg?.initDataUnsafe?.user) {
            const user = window.tg.initDataUnsafe.user;
            const username = user.username || user.first_name || 'Пользователь';
            usernameElement.textContent = username;
        }
    }

    // Обновляем метод загрузки данных пользователя
    async loadUserData() {
        try {
            if (window.tg?.initDataUnsafe?.user?.id) {
                const userData = await window.db.getUserData(window.tg.initDataUnsafe.user.id);
                if (userData) {
                    // Получаем сохраненные данные
                    this.energy = userData.energy || this.maxEnergy;
                    this.balance = userData.balance || 0;
                    this.maxEnergy = userData.max_energy || 100;
                    this.energyRegenRate = userData.energy_regen_rate || 1;
                    this.level = userData.level || 1;
                    this.exp = userData.exp || 0;
                    this.expNextLevel = userData.exp_next_level || 100;

                    // Обновляем имя пользователя
                    this.updateUsername();

                    // Вычисляем, сколько энергии должно было восстановиться
                    const lastUpdate = userData.last_energy_update || Date.now();
                    const secondsPassed = Math.floor((Date.now() - lastUpdate) / 1000);
                    const energyToAdd = Math.min(secondsPassed * this.energyRegenRate, this.maxEnergy - this.energy);
                    this.energy = Math.min(this.maxEnergy, this.energy + energyToAdd);

                    // Обновляем время последнего обновления
                    this.lastEnergyUpdate = Date.now();
                    
                    // Обновляем отображение
                    this.updateEnergyDisplay();
                    this.updateBalanceDisplay();
                    
                    // Запускаем регенерацию энергии
                    this.startEnergyRegeneration();
                }
            }
        } catch (error) {
            console.error('Ошибка при загрузке данных пользователя:', error);
        }
    }

    // Обновляем метод сохранения данных пользователя
    async saveUserData() {
        try {
            const userData = {
                energy: Math.floor(this.energy),
                balance: Math.floor(this.balance),
                last_energy_update: new Date().toISOString(),
                max_energy: Math.min(Math.floor(this.maxEnergy), 2147483647),
                energy_regen_rate: Math.min(Math.floor(this.energyRegenRate || 1), 2147483647),
                level: Math.min(Math.floor(this.level || 1), 2147483647),
                exp: Math.min(Math.floor(this.exp || 0), 2147483647),
                exp_next_level: Math.min(Math.floor(this.expNextLevel || 100), 2147483647)
            };

            await window.db.updateUserData(this.telegramUserId, userData);
        } catch (error) {
            console.error('Ошибка при сохранении данных пользователя:', error);
        }
    }

    // Обновляем метод обработки клика
    handleClick() {
        if (this.energy > 0) {
            // Уменьшаем энергию
            this.energy--;
            // Увеличиваем баланс
            this.balance++;
            
            // Обновляем отображение
            this.updateEnergyDisplay();
            this.updateBalanceDisplay();
            
            // Сохраняем данные
            this.saveUserData();
            
            // Добавляем анимацию клика
            const clickerButton = document.querySelector('.clicker-button');
            if (clickerButton) {
                clickerButton.classList.add('clicked');
                setTimeout(() => {
                    clickerButton.classList.remove('clicked');
                }, 100);
            }

            // Запускаем регенерацию энергии, если она еще не запущена
            if (!this.energyRegenerationInterval) {
                this.startEnergyRegeneration();
            }
        }
    }

    // Метод обновления отображения энергии
    updateEnergyDisplay() {
        if (this.energyText) {
            this.energyText.textContent = `${this.energy}/100`;
        }
        if (this.energyBar) {
            this.energyBar.style.width = `${this.energy}%`;
        }
    }

    // Метод обновления отображения баланса
    updateBalanceDisplay() {
        if (this.balanceDisplay) {
            this.balanceDisplay.textContent = this.balance;
        }
    }

    generateReferralLink() {
        // Создаем уникальный идентификатор для текущего пользователя
        const userId = this.telegramUserId;
        // Шифруем данные пользователя
        const encodedData = btoa(JSON.stringify({
            ref: userId,
            timestamp: Date.now()
        }));
        
        // Формируем ссылку на web app с зашифрованными параметрами
        const webAppUrl = `https://t.me/${this.botUsername}/app?startapp=ref_${encodedData}`;
        return webAppUrl;
    }

    async copyReferralLink() {
        const link = this.generateReferralLink();
        try {
            // Создаем временный input элемент
            const tempInput = document.createElement('input');
            tempInput.style.position = 'absolute';
            tempInput.style.left = '-9999px';
            tempInput.value = link;
            document.body.appendChild(tempInput);

            // Выделяем текст
            tempInput.select();
            tempInput.setSelectionRange(0, 99999);

            try {
                // Пробуем использовать современный API
                await navigator.clipboard.writeText(link);
                this.showNotification({
                    title: 'Успешно!',
                    message: 'Реферальная ссылка скопирована в буфер обмена',
                    type: 'success'
                });
            } catch (err) {
                // Если современный API недоступен, используем устаревший метод
                document.execCommand('copy');
                this.showNotification({
                    title: 'Успешно!',
                    message: 'Реферальная ссылка скопирована в буфер обмена',
                    type: 'success'
                });
            }

            // Удаляем временный элемент
            document.body.removeChild(tempInput);
        } catch (err) {
            console.error('Ошибка при копировании:', err);
            // Показываем ссылку пользователю, если копирование не удалось
            this.showNotification({
                title: 'Внимание',
                message: 'Не удалось скопировать автоматически. Нажмите и удерживайте ссылку для копирования.',
                type: 'info'
            });
            
            // Показываем ссылку в модальном окне
            const modal = document.createElement('div');
            modal.className = 'referral-modal';
            modal.innerHTML = `
                <div class="referral-modal-content">
                    <h3>Ваша реферальная ссылка:</h3>
                    <div class="referral-link-container">
                        <input type="text" value="${link}" readonly class="referral-link-input" />
                    </div>
                    <div class="referral-modal-footer">
                        <button class="close-modal-button">Закрыть</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            // Добавляем стили для модального окна
            const style = document.createElement('style');
            style.textContent = `
                .referral-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 10000;
                }
                .referral-modal-content {
                    background: #1a1a1a;
                    padding: 20px;
                    border-radius: 16px;
                    max-width: 90%;
                    width: 400px;
                }
                .referral-link-container {
                    margin: 15px 0;
                }
                .referral-link-input {
                    width: 100%;
                    padding: 12px;
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 8px;
                    color: white;
                    font-size: 14px;
                }
                .close-modal-button {
                    width: 100%;
                    padding: 12px;
                    background: #4CAF50;
                    border: none;
                    border-radius: 8px;
                    color: white;
                    font-size: 16px;
                    cursor: pointer;
                    transition: background 0.3s;
                }
                .close-modal-button:hover {
                    background: #45a049;
                }
            `;
            document.head.appendChild(style);

            // Добавляем обработчик для закрытия
            const closeButton = modal.querySelector('.close-modal-button');
            closeButton.addEventListener('click', () => {
                document.body.removeChild(modal);
            });

            // Добавляем обработчик для клика вне модального окна
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    document.body.removeChild(modal);
                }
            });
        }
    }

    // Метод для тестирования уведомлений
    testNotifications() {
        // Успешное уведомление
        this.showNotification({
            title: 'Успешно!',
            message: 'Это уведомление об успешном действии',
            type: 'success'
        });

        // Через 2 секунды показываем уведомление об ошибке
        setTimeout(() => {
            this.showNotification({
                title: 'Ошибка!',
                message: 'Это уведомление об ошибке',
                type: 'error'
            });
        }, 2000);

        // Через 4 секунды показываем информационное уведомление
        setTimeout(() => {
            this.showNotification({
                title: 'Информация',
                message: 'Это информационное уведомление',
                type: 'info'
            });
        }, 4000);
    }

    showNotification({ title, message, type = 'info' }) {
        console.log('Показываем уведомление:', { title, message, type });
        
        // Удаляем предыдущее уведомление, если оно есть
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        notification.innerHTML = `
            <div class="notification-content">
                ${title ? `<div class="notification-title">${title}</div>` : ''}
                <div class="notification-message">${message}</div>
            </div>
            <div class="progress-bar"></div>
        `;
        
        document.body.appendChild(notification);

        // Принудительный рендеринг
        notification.offsetHeight;

        // Показываем уведомление
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Удаляем уведомление через 5 секунд
        const hideTimeout = setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }, 5000);

        // Останавливаем таймер при наведении
        notification.addEventListener('mouseenter', () => {
            clearTimeout(hideTimeout);
        });

        // Запускаем новый таймер при уходе курсора
        notification.addEventListener('mouseleave', () => {
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (notification.parentElement) {
                        notification.remove();
                    }
                }, 300);
            }, 2000);
        });
    }

    initializeFriendsSection() {
        const copyButton = document.querySelector('#copyReferralLink');
        if (copyButton) {
            copyButton.addEventListener('click', async () => {
                console.log('Кнопка копирования нажата');
                try {
                    const link = this.generateReferralLink();
                    await navigator.clipboard.writeText(link);
                    this.showNotification({
                        title: 'Готово!',
                        message: 'Реферальная ссылка скопирована',
                        type: 'success'
                    });
                } catch (err) {
                    console.error('Ошибка копирования:', err);
                    this.showNotification({
                        title: 'Ошибка',
                        message: 'Не удалось скопировать ссылку. Попробуйте еще раз.',
                        type: 'error'
                    });
                }
            });
        } else {
            console.error('Кнопка копирования не найдена');
        }
        
        // Загружаем список рефералов
        this.loadReferrals();
    }

    async loadReferrals() {
        try {
            // Временно отображаем заглушку вместо реального запроса
            this.updateReferralsList([]);
        } catch (err) {
            console.error('Ошибка при загрузке рефералов:', err);
        }
    }

    updateReferralsList(referrals) {
        const referralsList = document.querySelector('.referrals-list');
        if (!referralsList) return;
        
        referralsList.innerHTML = '';
        
        if (referrals.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-referrals';
            emptyMessage.textContent = 'У вас пока нет рефералов';
            referralsList.appendChild(emptyMessage);
            return;
        }
        
        referrals.forEach(referral => {
            const referralItem = document.createElement('div');
            referralItem.className = 'referral-item';
            referralItem.innerHTML = `
                <img src="${referral.photo_url || 'img/default-avatar.png'}" class="referral-avatar">
                <div class="referral-info">
                    <div class="referral-name">${referral.username || 'Пользователь'}</div>
                    <div class="referral-date">Присоединился: ${new Date(referral.join_date).toLocaleDateString()}</div>
                </div>
            `;
            referralsList.appendChild(referralItem);
        });
    }
}

// Инициализация игры
document.addEventListener('DOMContentLoaded', () => {
    const game = new NumberGame();
    
    // Инициализируем раздел друзей
    game.initializeFriendsSection();
    
    // Добавляем тестовую кнопку для проверки уведомлений
    const testButton = document.createElement('button');
    testButton.textContent = 'Тест уведомлений';
    testButton.addEventListener('click', () => game.testNotifications());
    document.body.appendChild(testButton);

    // Добавляем в window для отладки
    window.game = game;
}); 
class Leaderboard {
    constructor() {
        this.container = document.querySelector('.leaderboard-container');
        this.updateInterval = null;
    }

    async init() {
        if (!this.container) return;
        
        // Создаем структуру таблицы лидеров
        this.container.innerHTML = `
            <h2>Лучшие игроки недели</h2>
            <div class="leaderboard-list"></div>
        `;

        // Начинаем обновление каждые 5 минут
        await this.updateLeaderboard();
        this.updateInterval = setInterval(() => this.updateLeaderboard(), 300000);
    }

    async updateLeaderboard() {
        const listContainer = this.container.querySelector('.leaderboard-list');
        if (!listContainer) return;

        try {
            const players = await window.db.getTopPlayers(10);
            
            if (!players || players.length === 0) {
                listContainer.innerHTML = '<div class="no-players">Пока нет игроков</div>';
                return;
            }

            listContainer.innerHTML = players.map((player, index) => `
                <div class="leaderboard-item ${index < 3 ? 'top-' + (index + 1) : ''}">
                    <div class="player-rank">${index + 1}</div>
                    <div class="player-info">
                        <img src="https://i.postimg.cc/vBBWGZjL/image.png" alt="Avatar" class="player-avatar">
                        <div class="player-name">${player.username}</div>
                    </div>
                    <div class="player-score">${player.weekly_score.toLocaleString()}</div>
                </div>
            `).join('');

        } catch (error) {
            console.error('Ошибка при обновлении таблицы лидеров:', error);
            listContainer.innerHTML = '<div class="error-message">Ошибка при загрузке данных</div>';
        }
    }

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const leaderboard = new Leaderboard();
    leaderboard.init();
}); 
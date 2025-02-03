class Leaderboard {
    constructor() {
        this.container = document.querySelector('.leaderboard-container');
        this.updateInterval = 60000; // Обновление каждую минуту
    }

    async init() {
        // Ждем инициализацию базы данных
        await this.waitForDatabase();
        await this.updateLeaderboard();
        setInterval(() => this.updateLeaderboard(), this.updateInterval);
    }

    waitForDatabase() {
        return new Promise((resolve) => {
            const checkDb = () => {
                if (window.db) {
                    resolve();
                } else {
                    setTimeout(checkDb, 100);
                }
            };
            checkDb();
        });
    }

    async updateLeaderboard() {
        try {
            if (!window.db) {
                console.error('База данных не инициализирована');
                return;
            }
            
            const players = await window.db.getTopPlayers(10);
            this.renderLeaderboard(players);
        } catch (error) {
            console.error('Ошибка при обновлении таблицы лидеров:', error);
        }
    }

    renderLeaderboard(players) {
        const listContainer = this.container.querySelector('.leaderboard-list');
        if (!listContainer) return;

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
    leaderboard.init().catch(console.error);
}); 
// Конфигурация базы данных
const dbConfig = {
    host: 'handyhost.ru', // Хост базы данных
    user: '', // Имя пользователя
    password: '', // Пароль
    database: '', // Название базы данных
    port: 3306 // Стандартный порт MySQL
};

// Проверяем, не был ли класс уже определен
if (!window.Database) {
    class Database {
        constructor() {
            this.connection = null;
            this.isConnected = false;
        }

        async connect() {
            try {
                if (!this.isConnected) {
                    this.connection = await mysql.createConnection(dbConfig);
                    this.isConnected = true;
                    console.log('Успешное подключение к базе данных');
                }
            } catch (error) {
                console.error('Ошибка подключения к базе данных:', error);
                throw error;
            }
        }

        async disconnect() {
            try {
                if (this.isConnected && this.connection) {
                    await this.connection.end();
                    this.isConnected = false;
                    console.log('Отключение от базы данных');
                }
            } catch (error) {
                console.error('Ошибка при отключении от базы данных:', error);
                throw error;
            }
        }

        async query(sql, params = []) {
            try {
                if (!this.isConnected) {
                    await this.connect();
                }
                const [results] = await this.connection.execute(sql, params);
                return results;
            } catch (error) {
                console.error('Ошибка выполнения запроса:', error);
                throw error;
            }
        }
    }

    // Создаем единственный экземпляр класса, если он еще не создан
    if (!window.db) {
        window.db = new Database();
    }
} 
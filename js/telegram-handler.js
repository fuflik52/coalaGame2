// Подавляем логи Telegram WebApp
const originalConsoleLog = console.log;
console.log = function() {
    const args = Array.from(arguments);
    if (!args[0]?.includes?.('[Telegram.WebView]')) {
        originalConsoleLog.apply(console, args);
    }
};

// Инициализация Telegram WebApp
class TelegramHandler {
    constructor() {
        // Проверяем наличие Telegram WebApp
        if (typeof window.Telegram === 'undefined') {
            console.log('Telegram WebApp не обнаружен, инициализация в тестовом режиме');
            this.tg = {
                ready: () => {},
                initDataUnsafe: {
                    user: {
                        id: 'test_user',
                        username: 'test_user',
                        first_name: 'Test',
                        last_name: 'User'
                    }
                }
            };
        } else {
            this.tg = window.Telegram.WebApp;
        }

        // Создаем тестовую базу данных если нет Supabase
        if (typeof window.db === 'undefined' || !window.db.supabase) {
            console.log('База данных не обнаружена, использую тестовый режим');
            window.db = {
                supabase: {
                    from: () => ({
                        select: () => ({
                            eq: () => ({
                                single: async () => ({ data: null, error: { code: 'PGRST116' } })
                            })
                        }),
                        insert: async () => ({ error: null }),
                        update: async () => ({ error: null })
                    })
                },
                // Добавляем тестовые функции для таблицы лидеров
                getTopPlayers: async () => {
                    return {
                        data: [
                            {
                                username: 'Игрок 1',
                                game_score: 1000,
                                avatar_url: null,
                                telegram_id: 'user1'
                            },
                            {
                                username: 'Игрок 2',
                                game_score: 800,
                                avatar_url: null,
                                telegram_id: 'user2'
                            },
                            {
                                username: 'Игрок 3',
                                game_score: 600,
                                avatar_url: null,
                                telegram_id: 'user3'
                            }
                        ],
                        error: null
                    };
                },
                getUserRank: async (telegramId) => {
                    return {
                        data: { rank: 4, total_players: 100 },
                        error: null
                    };
                },
                updateUserScore: async (telegramId, score) => {
                    return { error: null };
                }
            };
        }
        
        this.initApp();
    }

    initApp() {
        try {
            // Инициализируем Telegram WebApp
            this.tg.ready();
            
            // Получаем данные пользователя
            const user = this.tg.initDataUnsafe?.user;
            if (user) {
                this.userId = user.id;
                this.username = user.username;
                this.firstName = user.first_name;
                this.lastName = user.last_name;
                this.photoUrl = user.photo_url;

                // Проверяем параметр startapp для рефералов
                const startParam = new URLSearchParams(window.location.search).get('startapp');
                if (startParam && startParam.startsWith('ref_')) {
                    this.handleReferral(startParam.substring(4));
                }

                // Инициализируем пользователя в базе данных
                this.initUser();
            } else {
                console.log('Используется тестовый пользователь');
                this.userId = 'test_user';
                this.username = 'test_user';
            }
        } catch (error) {
            console.error('Ошибка при инициализации Telegram WebApp:', error);
        }
    }

    async initUser() {
        try {
            const telegramIdStr = String(this.userId);
            const { data, error } = await window.db.supabase
                .from('users')
                .select('*')
                .eq('telegram_id', telegramIdStr)
                .single();

            if (error && error.code === 'PGRST116') {
                // Пользователь не найден, создаем нового
                const { error: insertError } = await window.db.supabase
                    .from('users')
                    .insert([{
                        telegram_id: telegramIdStr,
                        username: this.username,
                        avatar_url: this.photoUrl,
                        energy: 100,
                        balance: 0,
                        max_energy: 100,
                        last_energy_update: new Date().toISOString(),
                        last_seen: new Date().toISOString()
                    }]);

                if (insertError) throw insertError;
            } else if (!error) {
                // Пользователь найден, обновляем last_seen
                const { error: updateError } = await window.db.supabase
                    .from('users')
                    .update({
                        last_seen: new Date().toISOString(),
                        username: this.username,
                        avatar_url: this.photoUrl
                    })
                    .eq('telegram_id', telegramIdStr);

                if (updateError) throw updateError;
            }
        } catch (error) {
            console.error('Ошибка при инициализации пользователя:', error);
        }
    }

    async handleReferral(encodedData) {
        try {
            // Декодируем данные реферала
            const referralData = JSON.parse(atob(encodedData));
            
            // Проверяем валидность данных
            if (referralData.ref && referralData.timestamp) {
                // Проверяем, не истекла ли ссылка (например, 24 часа)
                const linkAge = Date.now() - referralData.timestamp;
                if (linkAge > 24 * 60 * 60 * 1000) {
                    console.log('Реферальная ссылка истекла');
                    return;
                }

                // Добавляем реферала
                await window.db.addReferral(referralData.ref, this.userId);
            }
        } catch (error) {
            console.error('Ошибка при обработке реферальной ссылки:', error);
        }
    }
}

// Создаем глобальный экземпляр
window.telegramHandler = new TelegramHandler(); 
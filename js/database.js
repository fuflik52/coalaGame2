// Инициализация Supabase
const SUPABASE_URL = 'https://qahulspklirvxnafaytd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaHVsc3BrbGlydnhuYWZheXRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzNDI4ODMsImV4cCI6MjA1MzkxODg4M30.TAomMn9QHYFHCreVavdVGV6ld0LoZAqgyhSWWhacHr0';

// Создаем клиент Supabase
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Получаем данные из Telegram WebApp
if (!window.tg) {
    window.tg = window.Telegram?.WebApp;
}

// Ждем инициализацию Telegram WebApp
function waitForTelegramInit() {
    return new Promise((resolve) => {
        const maxAttempts = 50; // 5 секунд максимум
        let attempts = 0;
        
        const checkTelegram = () => {
            if (window.tg?.initDataUnsafe?.user?.id) {
                console.log('Telegram WebApp успешно инициализирован');
                resolve(window.tg.initDataUnsafe.user);
                return true;
            }
            return false;
        };

        // Проверяем сразу
        if (checkTelegram()) return;

        // Если не получилось, запускаем интервал
        const checkInterval = setInterval(() => {
            attempts++;
            if (checkTelegram() || attempts >= maxAttempts) {
                clearInterval(checkInterval);
                if (attempts >= maxAttempts) {
                    console.error('Не удалось получить данные пользователя Telegram');
                    resolve(null);
                }
            }
        }, 100);
    });
}

// Инициализируем базу данных
async function initDatabase() {
    const currentUser = await waitForTelegramInit();
    if (!currentUser || !currentUser.id) {
        console.error('Не удалось получить ID пользователя Telegram');
        return null;
    }
    console.log('Инициализация базы данных с пользователем:', currentUser.id);
    window.db = new Database(currentUser);
    return window.db;
}

class Database {
    constructor(currentUser) {
        this.supabase = supabaseClient;
        this.currentUser = currentUser;
        this.initializeUser();
    }

    async initializeUser() {
        if (this.currentUser.id) {
            const userData = await this.getUserData(this.currentUser.id);
            if (!userData) {
                await this.createNewUser(
                    this.currentUser.id,
                    this.currentUser.username || 'Пользователь',
                    `https://t.me/${this.currentUser.username}`
                );
            }
        }
    }

    async getUserData(telegramId) {
        try {
            if (!telegramId) {
                console.error('Ошибка: telegram_id не определен');
                return null;
            }

            const { data, error } = await this.supabase
                .from('users')
                .select('*')
                .eq('telegram_id', String(telegramId))
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    console.log('Пользователь не найден, будет создан новый');
                    return null;
                }
                throw error;
            }
            return data;
        } catch (error) {
            console.error('Ошибка при получении данных пользователя:', error);
            return null;
        }
    }

    async getTopPlayers(limit = 10) {
        try {
            const { data, error } = await this.supabase
                .from('users')
                .select('username, avatar_url, weekly_score')
                .order('weekly_score', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Ошибка при получении топ игроков:', error);
            return [];
        }
    }

    async updateUserGameScore(telegramId, score) {
        try {
            const telegramIdStr = String(telegramId);
            const { error } = await this.supabase
                .from('game_scores')
                .insert([
                    {
                        telegram_id: telegramIdStr,
                        score: score,
                        timestamp: new Date().toISOString()
                    }
                ]);

            if (error) throw error;
        } catch (error) {
            console.error('Ошибка при обновлении игрового счета:', error);
            throw error;
        }
    }

    async updateUserEnergy(telegramId, newEnergy, maxEnergy = 100) {
        try {
            const { data, error } = await this.supabase
                .from('users')
                .update({ 
                    energy: Math.min(Math.max(0, newEnergy), maxEnergy),
                    last_energy_update: Date.now()
                })
                .eq('telegram_id', String(telegramId))
                .select();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Ошибка при обновлении энергии:', error);
            throw error;
        }
    }

    async updateUserBalance(telegramId, balance) {
        try {
            const { error } = await this.supabase
                .from('users')
                .update({ balance })
                .eq('telegram_id', telegramId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Ошибка при обновлении баланса:', error);
            return false;
        }
    }

    async addPurchasedCard(telegramId, cardId) {
        try {
            const { data: userData } = await this.getUserData(telegramId);
            const purchasedCards = userData.purchased_cards || [];
            
            if (!purchasedCards.includes(cardId)) {
                purchasedCards.push(cardId);
                
                const { error } = await this.supabase
                    .from('users')
                    .update({ purchased_cards: purchasedCards })
                    .eq('telegram_id', telegramId);

                if (error) throw error;
            }
            return true;
        } catch (error) {
            console.error('Ошибка при добавлении купленной карточки:', error);
            return false;
        }
    }

    async usePromoCode(telegramId, promoCode) {
        try {
            const userData = await this.getUserData(telegramId);
            if (!userData) {
                return { success: false, message: 'Пользователь не найден' };
            }

            const usedPromocodes = userData.used_promocodes || [];
            
            if (usedPromocodes.includes(promoCode)) {
                return { success: false, message: 'Промокод уже использован' };
            }

            // Получаем информацию о промокоде
            const { data: promoData, error: promoError } = await this.supabase
                .from('promo_codes')
                .select('*')
                .eq('code', promoCode)
                .single();

            if (promoError || !promoData) {
                return { success: false, message: 'Промокод не найден' };
            }

            if (promoData.uses_left <= 0) {
                return { success: false, message: 'Промокод больше недоступен' };
            }

            // Применяем награду
            if (promoData.reward_type === 'coins') {
                await this.updateUserBalance(telegramId, userData.balance + promoData.reward_amount);
            } else if (promoData.reward_type === 'energy') {
                const newEnergy = Math.min(userData.max_energy, userData.energy + promoData.reward_amount);
                await this.updateUserEnergy(telegramId, newEnergy);
            }

            // Обновляем список использованных промокодов
            usedPromocodes.push(promoCode);
            const { error: updateError } = await this.supabase
                .from('users')
                .update({ used_promocodes: usedPromocodes })
                .eq('telegram_id', telegramId);

            if (updateError) throw updateError;

            // Уменьшаем количество доступных использований
            await this.supabase
                .from('promo_codes')
                .update({ uses_left: promoData.uses_left - 1 })
                .eq('code', promoCode);

            return {
                success: true,
                message: `Вы получили ${promoData.reward_amount} ${promoData.reward_type === 'coins' ? 'монет' : 'энергии'}!`
            };
        } catch (error) {
            console.error('Ошибка при использовании промокода:', error);
            return { success: false, message: 'Произошла ошибка при использовании промокода' };
        }
    }

    async createNewUser(telegramId, username, avatarUrl = '') {
        try {
            const now = Math.floor(Date.now() / 1000); // UNIX timestamp
            const { error } = await this.supabase
                .from('users')
                .insert([{
                    telegram_id: String(telegramId),
                    username: username,
                    avatar_url: avatarUrl,
                    energy: 100,
                    max_energy: 100,
                    balance: 0,
                    level: 1,
                    exp: 0,
                    exp_next_level: 100,
                    energy_regen_rate: 1,
                    last_energy_update: now,
                    last_seen: now,
                    created_at: now,
                    current_day: 1,
                    last_claim_time: now
                }]);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Ошибка при создании пользователя:', error);
            return false;
        }
    }

    async regenerateEnergy(telegramId) {
        try {
            const userData = await this.getUserData(telegramId);
            if (!userData) return false;

            const now = Math.floor(Date.now() / 1000); // UNIX timestamp
            const lastUpdate = userData.last_energy_update || now;
            const secondsPassed = now - lastUpdate;
            
            if (secondsPassed > 0 && userData.energy < userData.max_energy) {
                const newEnergy = Math.min(userData.max_energy, userData.energy + secondsPassed);
                
                const { error } = await this.supabase
                    .from('users')
                    .update({ 
                        energy: newEnergy,
                        last_energy_update: now
                    })
                    .eq('telegram_id', telegramId);

                if (error) throw error;
                return true;
            }
            return false;
        } catch (error) {
            console.error('Ошибка при восстановлении энергии:', error);
            return false;
        }
    }

    async syncLocalBalance(telegramId) {
        try {
            const userData = await this.getUserData(telegramId);
            if (!userData) return false;

            // Обновляем локальный баланс
            const localBalance = parseInt(localStorage.getItem('balance')) || 0;
            const newBalance = userData.balance + localBalance;

            if (localBalance > 0) {
                const { error } = await this.supabase
                    .from('users')
                    .update({ balance: newBalance })
                    .eq('telegram_id', telegramId);

                if (error) throw error;

                // Очищаем локальный баланс после синхронизации
                localStorage.setItem('balance', '0');
            }

            return true;
        } catch (error) {
            console.error('Ошибка при синхронизации баланса:', error);
            return false;
        }
    }

    async spendEnergy(telegramId, amount = 1) {
        try {
            const userData = await this.getUserData(telegramId);
            if (!userData || userData.energy < amount) return false;

            const newEnergy = Math.max(0, userData.energy - amount);
            
            const { error } = await this.supabase
                .from('users')
                .update({ 
                    energy: newEnergy,
                    last_energy_update: Math.floor(Date.now() / 1000) // Сохраняем как UNIX timestamp
                })
                .eq('telegram_id', String(telegramId));

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Ошибка при трате энергии:', error);
            return false;
        }
    }

    async updateUserData(telegramId, userData) {
        try {
            if (!telegramId) {
                console.error('Ошибка: telegram_id не определен');
                return null;
            }

            const now = Math.floor(Date.now() / 1000); // UNIX timestamp
            
            // Убеждаемся, что все числовые значения находятся в допустимом диапазоне
            const sanitizedData = {
                energy: Math.min(Math.max(0, Math.floor(userData.energy || 0)), userData.max_energy || 100),
                balance: Math.max(0, Math.floor(userData.balance || 0)),
                max_energy: Math.min(Math.max(1, Math.floor(userData.max_energy || 100)), 2147483647),
                energy_regen_rate: Math.min(Math.max(1, Math.floor(userData.energy_regen_rate || 1)), 100),
                level: Math.min(Math.max(1, Math.floor(userData.level || 1)), 2147483647),
                exp: Math.min(Math.max(0, Math.floor(userData.exp || 0)), 2147483647),
                exp_next_level: Math.min(Math.max(1, Math.floor(userData.exp_next_level || 100)), 2147483647),
                game_score: Math.max(0, Math.floor(userData.game_score || 0)),
                weekly_score: Math.max(0, Math.floor(userData.weekly_score || 0)),
                last_energy_update: now,
                last_seen: now
            };

            console.log('Обновление данных пользователя:', telegramId, sanitizedData);

            const { data, error } = await this.supabase
                .from('users')
                .update(sanitizedData)
                .eq('telegram_id', String(telegramId))
                .select();

            if (error) {
                console.error('Ошибка при обновлении данных:', error);
                throw error;
            }

            return data;
        } catch (error) {
            console.error('Ошибка при обновлении данных пользователя:', error);
            return null;
        }
    }

    async addReferral(referrerId, referralId) {
        try {
            const now = Math.floor(Date.now() / 1000); // UNIX timestamp
            const { error } = await this.supabase
                .from('referrals')
                .insert([
                    {
                        referrer_id: referrerId,
                        referral_id: referralId,
                        join_date: now
                    }
                ]);

            if (error) throw error;
        } catch (error) {
            console.error('Ошибка при добавлении реферала:', error);
            throw error;
        }
    }

    async getReferrals(userId) {
        try {
            const { data, error } = await this.supabase
                .from('referrals')
                .select(`
                    referral_id,
                    join_date,
                    users:referral_id (
                        username,
                        avatar_url
                    )
                `)
                .eq('referrer_id', userId);

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Ошибка при получении списка рефералов:', error);
            return [];
        }
    }
}

// Запускаем инициализацию
initDatabase().catch(console.error);

// Функция для обновления баланса
async function updateUserBalance(telegramId, newBalance) {
    try {
        console.log('Обновляем баланс пользователя:', telegramId, 'Новый баланс:', newBalance);
        const { error } = await supabaseClient
            .from('users')
            .update({ balance: newBalance })
            .eq('telegram_id', telegramId);
        
        if (error) {
            console.error('Ошибка при обновлении баланса:', error);
            return false;
        }
        
        console.log('Баланс успешно обновлен');
        return true;
    } catch (error) {
        console.error('Ошибка при обновлении баланса:', error);
        return false;
    }
}

// Функция для сохранения прогресса наград
async function updateUserRewards(telegramId, currentDay, lastClaimTime) {
    try {
        const now = Math.floor(Date.now() / 1000); // UNIX timestamp
        const { error } = await this.supabase
            .from('users')
            .update({
                current_day: currentDay,
                last_claim_time: now
            })
            .eq('telegram_id', telegramId);
        
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Ошибка при обновлении наград:', error);
        return false;
    }
}

// Функция для обновления имени пользователя в интерфейсе
function updateUsername() {
    const usernameElement = document.querySelector('.username');
    if (usernameElement && this.currentUser.username) {
        usernameElement.textContent = this.currentUser.username;
    }
}

// Функция для обновления энергии
async function updateUserEnergy(telegramId, newEnergy, newMaxEnergy = null) {
    try {
        const now = Math.floor(Date.now() / 1000); // UNIX timestamp
        const updateData = {
            energy: newEnergy,
            last_energy_update: now
        };
        
        if (newMaxEnergy !== null) {
            updateData.max_energy = newMaxEnergy;
        }

        const { error } = await this.supabase
            .from('users')
            .update(updateData)
            .eq('telegram_id', telegramId);
        
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Ошибка при обновлении энергии:', error);
        return false;
    }
} 

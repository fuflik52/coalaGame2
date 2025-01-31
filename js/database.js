// Инициализация Supabase
const SUPABASE_URL = 'https://qahulspklirvxnafaytd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhaHVsc3BrbGlydnhuYWZheXRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzNDI4ODMsImV4cCI6MjA1MzkxODg4M30.TAomMn9QHYFHCreVavdVGV6ld0LoZAqgyhSWWhacHr0';

// Создаем клиент Supabase
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Получаем данные из Telegram WebApp
if (!window.tg) {
    window.tg = window.Telegram?.WebApp;
}
const currentUser = window.tg?.initDataUnsafe?.user || {};

class Database {
    constructor() {
        this.supabase = supabaseClient;
        this.initializeUser();
    }

    async initializeUser() {
        if (currentUser.id) {
            const userData = await this.getUserData(currentUser.id);
            if (!userData) {
                await this.createNewUser(
                    currentUser.id,
                    currentUser.username || 'Пользователь',
                    `https://t.me/${currentUser.username}`
                );
            }
        }
    }

    async getUserData(telegramId) {
        try {
            const { data, error } = await this.supabase
                .from('users')
                .select('*')
                .eq('telegram_id', telegramId)
                .maybeSingle();

            if (error) throw error;
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
            const { data: userData } = await this.getUserData(telegramId);
            const newWeeklyScore = (userData?.weekly_score || 0) + score;
            const newTotalScore = (userData?.game_score || 0) + score;

            const { error } = await this.supabase
                .from('users')
                .update({
                    game_score: newTotalScore,
                    weekly_score: newWeeklyScore
                })
                .eq('telegram_id', telegramId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Ошибка при обновлении счета игры:', error);
            return false;
        }
    }

    async updateUserEnergy(telegramId, energy) {
        try {
            const { error } = await this.supabase
                .from('users')
                .update({ 
                    energy,
                    last_energy_update: Date.now()
                })
                .eq('telegram_id', telegramId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Ошибка при обновлении энергии:', error);
            return false;
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
            const { data: userData } = await this.getUserData(telegramId);
            const usedPromocodes = userData.used_promocodes || [];
            
            if (usedPromocodes.includes(promoCode)) {
                return { success: false, message: 'Промокод уже использован' };
            }
            
            usedPromocodes.push(promoCode);
            
            const { error } = await this.supabase
                .from('users')
                .update({ used_promocodes: usedPromocodes })
                .eq('telegram_id', telegramId);

            if (error) throw error;
            return { success: true, message: 'Промокод успешно активирован' };
        } catch (error) {
            console.error('Ошибка при использовании промокода:', error);
            return { success: false, message: 'Ошибка при активации промокода' };
        }
    }

    async createNewUser(telegramId, username = 'Пользователь', avatarUrl = null) {
        try {
            const { data, error } = await this.supabase
                .from('users')
                .insert([
                    {
                        telegram_id: telegramId,
                        username: username,
                        avatar_url: avatarUrl,
                        balance: 0,
                        energy: 100,
                        max_energy: 100,
                        rating: 0,
                        game_score: 0,
                        weekly_score: 0,
                        last_energy_update: Date.now(),
                        current_day: 1,
                        last_claim_time: 0,
                        purchased_cards: [],
                        used_promocodes: []
                    }
                ])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Ошибка при создании пользователя:', error);
            return null;
        }
    }

    async regenerateEnergy(telegramId) {
        try {
            const userData = await this.getUserData(telegramId);
            if (!userData) return false;

            const now = Date.now();
            const lastUpdate = userData.last_energy_update || now;
            const secondsPassed = Math.floor((now - lastUpdate) / 1000);
            
            if (secondsPassed > 0 && userData.energy < userData.max_energy) {
                // Добавляем по 1 единице энергии за каждую прошедшую секунду
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
}

// Экспортируем инстанс базы данных
window.db = new Database();

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
        const { error } = await supabaseClient
            .from('users')
            .update({
                current_day: currentDay,
                last_claim_time: lastClaimTime
            })
            .eq('telegram_id', telegramId);
        
        if (error) {
            console.error('Ошибка при обновлении наград:', error);
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Ошибка при обновлении наград:', error);
        return false;
    }
}

// Функция для обновления имени пользователя в интерфейсе
function updateUsername() {
    const usernameElement = document.querySelector('.username');
    if (usernameElement && currentUser.username) {
        usernameElement.textContent = currentUser.username;
    }
}

// Функция для обновления энергии
async function updateUserEnergy(telegramId, newEnergy, newMaxEnergy = null) {
    try {
        const updateData = {
            energy: newEnergy,
            last_energy_update: Date.now()
        };
        
        if (newMaxEnergy !== null) {
            updateData.max_energy = newMaxEnergy;
        }

        const { error } = await supabaseClient
            .from('users')
            .update(updateData)
            .eq('telegram_id', telegramId);
        
        if (error) {
            console.error('Ошибка при обновлении энергии:', error);
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Ошибка при обновлении энергии:', error);
        return false;
    }
}

// Функция для проверки и использования промокода
async function usePromoCode(telegramId, promoCode) {
    try {
        // Получаем информацию о промокоде
        const { data: promoData, error: promoError } = await supabaseClient
            .from('promo_codes')
            .select('*')
            .eq('code', promoCode)
            .single();

        if (promoError || !promoData) {
            return { success: false, message: 'Промокод не найден' };
        }

        // Проверяем срок действия
        if (promoData.expires_at && new Date(promoData.expires_at) < new Date()) {
            return { success: false, message: 'Промокод истек' };
        }

        // Проверяем количество использований
        if (promoData.uses_left <= 0) {
            return { success: false, message: 'Промокод больше не действителен' };
        }

        // Проверяем, использовал ли пользователь этот промокод
        const { data: usedPromo, error: usedError } = await supabaseClient
            .from('used_promo_codes')
            .select('*')
            .eq('user_telegram_id', telegramId)
            .eq('promo_code_id', promoData.id)
            .single();

        if (usedPromo) {
            return { success: false, message: 'Вы уже использовали этот промокод' };
        }

        // Начинаем транзакцию
        const userData = await this.getUserData(telegramId);
        if (!userData) {
            return { success: false, message: 'Ошибка получения данных пользователя' };
        }

        let success = true;
        let newBalance = userData.balance;
        let newEnergy = userData.energy;

        // Применяем награду
        if (promoData.reward_type === 'coins') {
            newBalance += promoData.reward_amount;
            success = await this.updateUserBalance(telegramId, newBalance);
        } else if (promoData.reward_type === 'energy') {
            newEnergy = Math.min(userData.max_energy, userData.energy + promoData.reward_amount);
            success = await this.updateUserEnergy(telegramId, newEnergy);
        }

        if (!success) {
            return { success: false, message: 'Ошибка при начислении награды' };
        }

        // Записываем использование промокода
        const { error: usageError } = await supabaseClient
            .from('used_promo_codes')
            .insert([{
                user_telegram_id: telegramId,
                promo_code_id: promoData.id
            }]);

        if (usageError) {
            console.error('Ошибка при записи использования промокода:', usageError);
            return { success: false, message: 'Ошибка при использовании промокода' };
        }

        // Уменьшаем количество доступных использований
        const { error: updateError } = await supabaseClient
            .from('promo_codes')
            .update({ uses_left: promoData.uses_left - 1 })
            .eq('id', promoData.id);

        if (updateError) {
            console.error('Ошибка при обновлении промокода:', updateError);
        }

        return {
            success: true,
            message: `Вы получили ${promoData.reward_amount} ${promoData.reward_type === 'coins' ? 'монет' : 'энергии'}!`,
            reward: {
                type: promoData.reward_type,
                amount: promoData.reward_amount
            }
        };
    } catch (error) {
        console.error('Ошибка при использовании промокода:', error);
        return { success: false, message: 'Произошла ошибка при использовании промокода' };
    }
} 
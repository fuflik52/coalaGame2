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

    async createNewUser(telegramId, username = 'Пользователь', avatarUrl = null) {
        try {
            // Преобразуем telegramId в строку
            const telegramIdStr = String(telegramId);
            
            // Проверяем, существует ли пользователь
            const { data: existingUser } = await this.supabase
                .from('users')
                .select('telegram_id')
                .eq('telegram_id', telegramIdStr)
                .single();

            if (existingUser) {
                // Если пользователь существует, обновляем его данные
                const { data, error } = await this.supabase
                    .from('users')
                    .update({
                        username: username,
                        avatar_url: avatarUrl || 'https://i.postimg.cc/vBBWGZjL/image.png',
                        last_seen: new Date().toISOString()
                    })
                    .eq('telegram_id', telegramIdStr)
                    .select();

                if (error) throw error;
                return data;
            } else {
                // Если пользователь не существует, создаем нового
                const { data, error } = await this.supabase
                    .from('users')
                    .insert([
                        {
                            telegram_id: telegramIdStr,
                            username: username,
                            avatar_url: avatarUrl || 'https://i.postimg.cc/vBBWGZjL/image.png',
                            balance: 0,
                            energy: 100,
                            max_energy: 100,
                            energy_regen_rate: 1,
                            rating: 0,
                            game_score: 0,
                            weekly_score: 0,
                            last_energy_update: new Date().toISOString(),
                            last_seen: new Date().toISOString()
                        }
                    ])
                    .select();

                if (error) throw error;
                return data;
            }
        } catch (error) {
            console.error('Ошибка при создании/обновлении пользователя:', error);
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

    async spendEnergy(telegramId, amount = 1) {
        try {
            const userData = await this.getUserData(telegramId);
            if (!userData || userData.energy < amount) return false;

            const newEnergy = Math.max(0, userData.energy - amount);
            
            const { error } = await this.supabase
                .from('users')
                .update({ 
                    energy: newEnergy,
                    last_energy_update: Date.now()
                })
                .eq('telegram_id', telegramId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Ошибка при трате энергии:', error);
            return false;
        }
    }

    async updateUserData(telegramId, data) {
        try {
            // Проверяем и преобразуем все числовые значения
            const sanitizedData = {};
            for (const [key, value] of Object.entries(data)) {
                if (typeof value === 'number') {
                    // Ограничиваем значения диапазоном PostgreSQL integer
                    sanitizedData[key] = Math.min(Math.max(Math.floor(value), -2147483648), 2147483647);
                } else {
                    sanitizedData[key] = value;
                }
            }

            const { error } = await this.supabase
                .from('users')
                .update(sanitizedData)
                .eq('telegram_id', telegramId);

            if (error) throw error;
        } catch (error) {
            console.error('Ошибка при обновлении данных пользователя:', error);
            throw error;
        }
    }

    async addReferral(referrerId, referralId) {
        try {
            const { error } = await this.supabase
                .from('referrals')
                .insert([
                    {
                        referrer_id: referrerId,
                        referral_id: referralId,
                        join_date: new Date().toISOString()
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
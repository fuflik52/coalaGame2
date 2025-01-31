-- Создаем таблицу пользователей
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    telegram_id TEXT UNIQUE NOT NULL,
    username TEXT NOT NULL DEFAULT 'Пользователь',
    avatar_url TEXT,
    balance INTEGER DEFAULT 0,
    energy INTEGER DEFAULT 100,
    max_energy INTEGER DEFAULT 100,
    rating INTEGER DEFAULT 0,
    game_score INTEGER DEFAULT 0,
    weekly_score INTEGER DEFAULT 0,
    last_energy_update BIGINT,
    current_day INTEGER DEFAULT 1,
    last_claim_time BIGINT DEFAULT 0,
    purchased_cards JSONB DEFAULT '[]'::jsonb,
    used_promocodes JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Создаем таблицу промокодов
CREATE TABLE promo_codes (
    id BIGSERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    reward_type TEXT NOT NULL CHECK (reward_type IN ('coins', 'energy')),
    reward_amount INTEGER NOT NULL,
    uses_left INTEGER DEFAULT -1,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Создаем таблицу использованных промокодов
CREATE TABLE used_promo_codes (
    id BIGSERIAL PRIMARY KEY,
    user_telegram_id TEXT REFERENCES users(telegram_id),
    promo_code_id BIGINT REFERENCES promo_codes(id),
    used_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    UNIQUE(user_telegram_id, promo_code_id)
);

-- Создаем таблицу карточек
CREATE TABLE cards (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    price INTEGER NOT NULL,
    income_per_hour INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Создаем индексы для оптимизации запросов
CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_users_weekly_score ON users(weekly_score DESC);
CREATE INDEX idx_promo_codes_code ON promo_codes(code);
CREATE INDEX idx_used_promo_codes_user ON used_promo_codes(user_telegram_id);

-- Создаем функцию для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Создаем триггер для автоматического обновления updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Создаем функцию для еженедельного сброса рейтинга
CREATE OR REPLACE FUNCTION reset_weekly_scores()
RETURNS void AS $$
BEGIN
    UPDATE users SET weekly_score = 0;
END;
$$ LANGUAGE plpgsql;

-- Добавляем базовые карточки
INSERT INTO cards (name, description, image_url, price, income_per_hour) VALUES
('Коала-новичок', 'Начальная карточка для новых игроков', 'https://i.postimg.cc/ZnggtH7v/image.png', 100, 1),
('Коала-работяга', 'Приносит стабильный доход', 'https://i.postimg.cc/ZnggtH7v/image.png', 500, 5),
('Коала-профи', 'Профессиональный добытчик', 'https://i.postimg.cc/ZnggtH7v/image.png', 2000, 25),
('Коала-эксперт', 'Экспертный уровень дохода', 'https://i.postimg.cc/ZnggtH7v/image.png', 10000, 150);

-- Добавляем тестовый промокод
INSERT INTO promo_codes (code, reward_type, reward_amount, uses_left, expires_at) VALUES
('WELCOME', 'coins', 1000, 100, TIMEZONE('utc'::text, NOW()) + INTERVAL '30 days'); 
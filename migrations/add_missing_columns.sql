-- Добавляем недостающие колонки, если они не существуют
DO $$ 
BEGIN 
    -- Добавляем energy_regen_rate, если не существует
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'users' AND column_name = 'energy_regen_rate') THEN
        ALTER TABLE users ADD COLUMN energy_regen_rate INTEGER DEFAULT 1;
    END IF;

    -- Добавляем weekly_score, если не существует
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'users' AND column_name = 'weekly_score') THEN
        ALTER TABLE users ADD COLUMN weekly_score INTEGER DEFAULT 0;
    END IF;

    -- Добавляем game_score, если не существует
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'users' AND column_name = 'game_score') THEN
        ALTER TABLE users ADD COLUMN game_score INTEGER DEFAULT 0;
    END IF;

    -- Добавляем rating, если не существует
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'users' AND column_name = 'rating') THEN
        ALTER TABLE users ADD COLUMN rating INTEGER DEFAULT 0;
    END IF;
END $$; 
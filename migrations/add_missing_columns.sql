-- Добавляем недостающие колонки, если они не существуют
DO $$ 
BEGIN 
    -- Добавляем energy_regen_rate, если не существует
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'users' AND column_name = 'energy_regen_rate') THEN
        ALTER TABLE users ADD COLUMN energy_regen_rate INTEGER DEFAULT 1;
    END IF;

    -- Добавляем exp, если не существует
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'users' AND column_name = 'exp') THEN
        ALTER TABLE users ADD COLUMN exp INTEGER DEFAULT 0;
    END IF;

    -- Добавляем level, если не существует
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'users' AND column_name = 'level') THEN
        ALTER TABLE users ADD COLUMN level INTEGER DEFAULT 1;
    END IF;

    -- Добавляем exp_next_level, если не существует
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'users' AND column_name = 'exp_next_level') THEN
        ALTER TABLE users ADD COLUMN exp_next_level INTEGER DEFAULT 100;
    END IF;

    -- Изменяем тип колонки last_energy_update на TIMESTAMP
    ALTER TABLE users 
    ALTER COLUMN last_energy_update TYPE TIMESTAMP WITH TIME ZONE 
    USING to_timestamp(last_energy_update);

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
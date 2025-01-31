const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Создаем клиент Supabase
const supabase = createClient(
    'https://qahulspklirvxnafaytd.supabase.co',
    process.env.SUPABASE_KEY
);

async function runMigration() {
    try {
        // Читаем файл миграции
        const migrationSQL = fs.readFileSync(
            path.join(__dirname, '../migrations/add_missing_columns.sql'),
            'utf8'
        );

        // Выполняем миграцию
        const { data, error } = await supabase.rpc('exec_sql', {
            sql_query: migrationSQL
        });

        if (error) throw error;
        console.log('Миграция успешно выполнена');
    } catch (error) {
        console.error('Ошибка при выполнении миграции:', error);
    }
}

runMigration(); 
-- Execute este SQL no phpMyAdmin para debug

-- 1. Ver o admin cadastrado
SELECT 
    ADMIN_ID,
    USER_EMAIL,
    NOME,
    ROLE,
    ACTIVE,
    USER_PASSWORD as 'Hash no Banco'
FROM admin_users 
WHERE USER_EMAIL = 'admin@deliverybairro.com';

-- 2. Ver o hash esperado
SELECT SHA1(MD5('Admin@2025')) as 'Hash Esperado para Admin@2025';

-- 3. Comparar
SELECT 
    USER_EMAIL,
    CASE 
        WHEN USER_PASSWORD = SHA1(MD5('Admin@2025')) 
        THEN '✓ CORRETO' 
        ELSE '✗ INCORRETO' 
    END as 'Status da Senha'
FROM admin_users 
WHERE USER_EMAIL = 'admin@deliverybairro.com';

-- 4. Se incorreto, atualizar
UPDATE admin_users 
SET USER_PASSWORD = SHA1(MD5('Admin@2025'))
WHERE USER_EMAIL = 'admin@deliverybairro.com';

-- 5. Verificar novamente
SELECT 
    USER_EMAIL,
    USER_PASSWORD,
    SHA1(MD5('Admin@2025')) as 'Esperado',
    CASE 
        WHEN USER_PASSWORD = SHA1(MD5('Admin@2025')) 
        THEN '✓ MATCH' 
        ELSE '✗ NO MATCH' 
    END as 'Resultado'
FROM admin_users 
WHERE USER_EMAIL = 'admin@deliverybairro.com';

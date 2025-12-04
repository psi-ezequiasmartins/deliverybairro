-- Script para verificar a senha do admin no banco
-- Execute este script no phpMyAdmin ou MySQL Workbench

-- Ver o hash atual armazenado
SELECT 
    ADMIN_ID,
    USER_EMAIL,
    NOME,
    USER_PASSWORD as 'Hash Atual',
    ROLE,
    ACTIVE
FROM admin_users 
WHERE USER_EMAIL = 'admin@deliverybairro.com';

-- Ver como ficaria o hash com a senha "Admin@2025"
SELECT SHA1(MD5('Admin@2025')) as 'Hash Esperado';

-- Comparar se são iguais
SELECT 
    CASE 
        WHEN USER_PASSWORD = SHA1(MD5('Admin@2025')) 
        THEN 'SENHA CORRETA ✓' 
        ELSE 'SENHA INCORRETA ✗' 
    END as 'Status'
FROM admin_users 
WHERE USER_EMAIL = 'admin@deliverybairro.com';

-- =====================================================
-- Script de Atualização da Tabela PEDIDOS
-- Adiciona campos para novas taxas do sistema
-- =====================================================
-- Autor: DeliveryBairro
-- Data: 2025-12-03
-- Descrição: Adiciona campos para Taxa de Serviço e Taxas de Pagamento (PSP)
-- =====================================================

USE deliverybairro;

-- Adicionar coluna TAXA_SERVICO (Taxa de serviço do DeliveryBairro)
-- Padrão: R$ 0,99 por pedido
ALTER TABLE pedidos 
ADD COLUMN TAXA_SERVICO DECIMAL(10, 2) DEFAULT 0.99 COMMENT 'Taxa de serviço DeliveryBairro.com' 
AFTER TAXA_ENTREGA;

-- Adicionar coluna TAXA_PAGAMENTO_FIXA (Taxa fixa do PSP por transação)
-- Padrão: R$ 0,40 por transação (ex: PagSeguro)
ALTER TABLE pedidos 
ADD COLUMN TAXA_PAGAMENTO_FIXA DECIMAL(10, 2) DEFAULT 0.40 COMMENT 'Taxa fixa PSP por transação' 
AFTER TAXA_SERVICO;

-- Adicionar coluna TAXA_PAGAMENTO_PERCENTUAL (Percentual da taxa do PSP)
-- Armazena o percentual aplicado (ex: 3.99, 4.99)
-- Não é o valor calculado, mas sim o percentual usado
ALTER TABLE pedidos 
ADD COLUMN TAXA_PAGAMENTO_PERCENTUAL DECIMAL(5, 2) DEFAULT 3.99 COMMENT 'Percentual da taxa PSP (ex: 3.99%)' 
AFTER TAXA_PAGAMENTO_FIXA;

-- Adicionar coluna TAXA_PAGAMENTO_VALOR (Valor calculado da taxa percentual)
-- Este é o valor em reais da taxa percentual calculada
ALTER TABLE pedidos 
ADD COLUMN TAXA_PAGAMENTO_VALOR DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'Valor da taxa percentual PSP' 
AFTER TAXA_PAGAMENTO_PERCENTUAL;

-- =====================================================
-- Verificar estrutura atualizada
-- =====================================================
DESCRIBE pedidos;

-- =====================================================
-- Exemplo de consulta com as novas taxas
-- =====================================================
-- SELECT 
--   PEDIDO_ID,
--   VR_SUBTOTAL,
--   TAXA_ENTREGA,
--   TAXA_SERVICO,
--   TAXA_PAGAMENTO_FIXA,
--   TAXA_PAGAMENTO_PERCENTUAL,
--   TAXA_PAGAMENTO_VALOR,
--   VR_TOTAL,
--   (VR_SUBTOTAL + TAXA_ENTREGA + TAXA_SERVICO + TAXA_PAGAMENTO_FIXA + TAXA_PAGAMENTO_VALOR) as TOTAL_CALCULADO
-- FROM pedidos
-- ORDER BY PEDIDO_ID DESC
-- LIMIT 10;

-- =====================================================
-- Atualizar pedidos antigos (opcional)
-- =====================================================
-- Se você quiser aplicar as taxas padrão aos pedidos existentes:
-- 
-- UPDATE pedidos 
-- SET 
--   TAXA_SERVICO = 0.99,
--   TAXA_PAGAMENTO_FIXA = 0.40,
--   TAXA_PAGAMENTO_PERCENTUAL = 3.99,
--   TAXA_PAGAMENTO_VALOR = (VR_SUBTOTAL + TAXA_ENTREGA + TAXA_SERVICO) * 0.0399
-- WHERE TAXA_SERVICO IS NULL OR TAXA_SERVICO = 0;

-- =====================================================
-- Criar índices para melhor performance (opcional)
-- =====================================================
-- CREATE INDEX idx_pedidos_taxas ON pedidos(TAXA_SERVICO, TAXA_PAGAMENTO_FIXA);

-- =====================================================
-- IMPORTANTE: BACKUP
-- =====================================================
-- Antes de executar este script em produção, faça backup:
-- mysqldump -u root -p deliverybairro > backup_antes_taxas.sql
-- =====================================================

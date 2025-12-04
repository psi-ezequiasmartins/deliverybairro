/**
 * backend/src/config/fees.js
 * 
 * Configuração de taxas do sistema DeliveryBairro (Backend)
 * Centraliza todas as taxas aplicadas aos pedidos
 */

/**
 * TAXAS DO SISTEMA
 * ================
 * 
 * 1. TAXA DE SERVIÇO (deliverybairro.com)
 *    - Valor fixo por pedido: R$ 0,99
 * 
 * 2. TAXAS DO PSP (Payment Service Provider - ex: PagSeguro)
 *    a) Taxa Fixa: R$ 0,40 por transação
 *    b) Taxa Percentual: 3,99% a 4,99% sobre o valor
 */

const FEES_CONFIG = {
  // Taxa de serviço do DeliveryBairro
  SERVICE_FEE: 0.99,

  // Taxas do sistema de pagamento (PSP)
  PAYMENT: {
    // Taxa fixa por transação
    FIXED_FEE: 0.40,

    // Taxa percentual sobre o valor (em decimal, ex: 0.0399 = 3.99%)
    PERCENTAGE_FEE: 0.0399,

    // Faixa de variação da taxa percentual
    MIN_PERCENTAGE: 0.0399,  // 3.99%
    MAX_PERCENTAGE: 0.0499,  // 4.99%
  },

  // Flag para ativar/desativar taxas
  ENABLED: {
    SERVICE_FEE: true,
    PAYMENT_FEES: true,
  }
};

/**
 * Calcula o valor total das taxas do sistema
 * @param {number} subtotal - Subtotal do pedido
 * @param {number} deliveryFee - Taxa de entrega
 * @param {number} customPercentage - Taxa percentual customizada (opcional)
 * @returns {object} Objeto com breakdown das taxas
 */
function calculateSystemFees(subtotal, deliveryFee, customPercentage = null) {
  const baseAmount = parseFloat(subtotal) + parseFloat(deliveryFee);

  // Taxa de serviço
  const serviceFee = FEES_CONFIG.ENABLED.SERVICE_FEE ? FEES_CONFIG.SERVICE_FEE : 0;

  // Taxas de pagamento
  let paymentFixedFee = 0;
  let paymentPercentageFee = 0;
  let paymentPercentageValue = 0;

  if (FEES_CONFIG.ENABLED.PAYMENT_FEES) {
    paymentFixedFee = FEES_CONFIG.PAYMENT.FIXED_FEE;

    // Usa taxa customizada ou padrão
    paymentPercentageFee = customPercentage !== null
      ? customPercentage
      : FEES_CONFIG.PAYMENT.PERCENTAGE_FEE;

    // Calcula o valor da taxa percentual sobre (subtotal + taxa de entrega + taxa de serviço)
    const baseForPercentage = baseAmount + serviceFee;
    paymentPercentageValue = baseForPercentage * paymentPercentageFee;
  }

  // Soma todas as taxas
  const totalFees = serviceFee + paymentFixedFee + paymentPercentageValue;

  // Total final do pedido
  const grandTotal = baseAmount + totalFees;

  return {
    // Valores base
    subtotal: parseFloat(subtotal),
    deliveryFee: parseFloat(deliveryFee),
    baseAmount,

    // Taxas discriminadas
    serviceFee,
    paymentFixedFee,
    paymentPercentageFee: paymentPercentageFee * 100, // Em porcentagem
    paymentPercentageValue,

    // Totais
    totalFees,
    grandTotal,

    // Para armazenar no banco
    dbFields: {
      TAXA_SERVICO: serviceFee,
      TAXA_PAGAMENTO_FIXA: paymentFixedFee,
      TAXA_PAGAMENTO_PERCENTUAL: paymentPercentageFee * 100, // Guarda em %
      TAXA_PAGAMENTO_VALOR: paymentPercentageValue,
      VR_TOTAL: grandTotal
    }
  };
}

/**
 * Retorna configuração atual das taxas
 */
function getFeesConfig() {
  return { ...FEES_CONFIG };
}

/**
 * Atualiza a taxa percentual do PSP
 */
function updatePaymentPercentage(percentage) {
  if (percentage >= FEES_CONFIG.PAYMENT.MIN_PERCENTAGE &&
    percentage <= FEES_CONFIG.PAYMENT.MAX_PERCENTAGE) {
    FEES_CONFIG.PAYMENT.PERCENTAGE_FEE = percentage;
    return true;
  }
  console.warn('Taxa percentual fora do range permitido:', percentage);
  return false;
}

module.exports = {
  FEES_CONFIG,
  calculateSystemFees,
  getFeesConfig,
  updatePaymentPercentage
};

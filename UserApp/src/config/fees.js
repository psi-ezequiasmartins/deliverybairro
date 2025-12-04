/**
 * UserApp/src/config/fees.js
 * 
 * Configuração de taxas do sistema DeliveryBairro
 * Centraliza todas as taxas aplicadas aos pedidos
 */

/**
 * TAXAS DO SISTEMA
 * ================
 * 
 * 1. TAXA DE SERVIÇO (deliverybairro.com)
 *    - Valor fixo por pedido
 *    - R$ 0,99 atualmente
 * 
 * 2. TAXAS DO PSP (Payment Service Provider - ex: PagSeguro)
 *    a) Taxa Fixa: cobrada por transação
 *       - R$ 0,40 por transação
 *    
 *    b) Taxa Percentual: cobrada sobre o valor do pedido
 *       - Percentual variável: 3,99% a 4,99%
 *       - O percentual pode variar conforme negociação
 */

const FEES_CONFIG = {
  // Taxa de serviço do DeliveryBairro
  SERVICE_FEE: 0.99,

  // Taxas do sistema de pagamento (PSP)
  PAYMENT: {
    // Taxa fixa por transação
    FIXED_FEE: 0.40,

    // Taxa percentual sobre o valor (em decimal, ex: 0.0399 = 3.99%)
    // Valor padrão: 3.99%
    PERCENTAGE_FEE: 0.0399,

    // Faixa de variação da taxa percentual
    MIN_PERCENTAGE: 0.0399,  // 3.99%
    MAX_PERCENTAGE: 0.0499,  // 4.99%
  },

  // Flag para ativar/desativar taxas do sistema
  // Útil para testes ou promoções
  ENABLED: {
    SERVICE_FEE: true,
    PAYMENT_FEES: true,
  }
};

/**
 * Calcula o valor total das taxas do sistema
 * @param {number} subtotal - Subtotal do pedido (soma dos produtos)
 * @param {number} deliveryFee - Taxa de entrega
 * @param {number} customPercentage - Taxa percentual customizada (opcional)
 * @returns {object} Objeto com breakdown das taxas
 */
export function calculateSystemFees(subtotal, deliveryFee, customPercentage = null) {
  const baseAmount = subtotal + deliveryFee;

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
    subtotal,
    deliveryFee,
    baseAmount,

    // Taxas discriminadas
    serviceFee,
    paymentFixedFee,
    paymentPercentageFee: paymentPercentageFee * 100, // Em porcentagem para exibição
    paymentPercentageValue,

    // Totais
    totalFees,
    grandTotal,

    // Breakdown detalhado
    breakdown: {
      subtotal,
      deliveryFee,
      serviceFee,
      paymentFixedFee,
      paymentPercentageDisplay: `${(paymentPercentageFee * 100).toFixed(2)}%`,
      paymentPercentageValue,
      total: grandTotal
    }
  };
}

/**
 * Formata valores em reais
 * @param {number} value - Valor a ser formatado
 * @returns {string} Valor formatado (ex: "R$ 1,50")
 */
export function formatCurrency(value) {
  return `R$ ${parseFloat(value).toFixed(2).replace('.', ',')}`;
}

/**
 * Retorna configuração atual das taxas
 * @returns {object} Configuração de taxas
 */
export function getFeesConfig() {
  return { ...FEES_CONFIG };
}

/**
 * Atualiza a taxa percentual do PSP
 * @param {number} percentage - Nova taxa em decimal (ex: 0.0449 para 4.49%)
 */
export function updatePaymentPercentage(percentage) {
  if (percentage >= FEES_CONFIG.PAYMENT.MIN_PERCENTAGE &&
    percentage <= FEES_CONFIG.PAYMENT.MAX_PERCENTAGE) {
    FEES_CONFIG.PAYMENT.PERCENTAGE_FEE = percentage;
    return true;
  }
  console.warn('Taxa percentual fora do range permitido:', percentage);
  return false;
}

/**
 * Ativa/desativa taxas
 * @param {string} feeType - Tipo de taxa ('SERVICE_FEE' ou 'PAYMENT_FEES')
 * @param {boolean} enabled - Ativar ou desativar
 */
export function toggleFee(feeType, enabled) {
  if (FEES_CONFIG.ENABLED.hasOwnProperty(feeType)) {
    FEES_CONFIG.ENABLED[feeType] = enabled;
    return true;
  }
  return false;
}

export default FEES_CONFIG;

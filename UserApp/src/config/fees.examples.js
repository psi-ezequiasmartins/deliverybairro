/**
 * Exemplos de Uso do Sistema de Taxas
 * ====================================
 * 
 * Este arquivo demonstra diferentes cenários de uso do sistema de taxas.
 */

import { calculateSystemFees, updatePaymentPercentage, toggleFee } from '../config/fees';

// ===================================
// EXEMPLO 1: Cálculo Padrão
// ===================================
console.log('=== EXEMPLO 1: Cálculo Padrão ===');

const subtotal = 50.00;
const taxaEntrega = 5.00;

const fees1 = calculateSystemFees(subtotal, taxaEntrega);
console.log('Breakdown:', fees1.breakdown);
console.log('Total:', fees1.grandTotal);

// Saída esperada:
// {
//   subtotal: 50.00,
//   deliveryFee: 5.00,
//   serviceFee: 0.99,
//   paymentFixedFee: 0.40,
//   paymentPercentageFee: 3.99,
//   paymentPercentageValue: 2.23,
//   grandTotal: 58.62
// }


// ===================================
// EXEMPLO 2: Taxa Percentual Customizada
// ===================================
console.log('\n=== EXEMPLO 2: Taxa Percentual Customizada ===');

// Usar taxa de 4.49% ao invés da padrão (3.99%)
const customPercentage = 0.0449; // 4.49%
const fees2 = calculateSystemFees(50.00, 5.00, customPercentage);

console.log('Taxa aplicada:', fees2.paymentPercentageFee + '%');
console.log('Valor da taxa:', fees2.paymentPercentageValue);
console.log('Total:', fees2.grandTotal);


// ===================================
// EXEMPLO 3: Alterar Taxa Global
// ===================================
console.log('\n=== EXEMPLO 3: Alterar Taxa Global ===');

// Alterar taxa padrão para 4.49%
updatePaymentPercentage(0.0449);

// Agora todos os cálculos usarão 4.49%
const fees3 = calculateSystemFees(50.00, 5.00);
console.log('Nova taxa padrão aplicada:', fees3.paymentPercentageFee + '%');


// ===================================
// EXEMPLO 4: Desativar Taxas (Promoção)
// ===================================
console.log('\n=== EXEMPLO 4: Promoção - Sem Taxa de Serviço ===');

// Desativar taxa de serviço para uma promoção
toggleFee('SERVICE_FEE', false);

const fees4 = calculateSystemFees(50.00, 5.00);
console.log('Taxa de serviço:', fees4.serviceFee); // Deve ser 0
console.log('Total com promoção:', fees4.grandTotal);

// Reativar
toggleFee('SERVICE_FEE', true);


// ===================================
// EXEMPLO 5: Integração com Cart
// ===================================
console.log('\n=== EXEMPLO 5: Integração com Cart ===');

function updateCartTotal(basket, delivery) {
  // Calcular subtotal dos produtos
  let subtotal = 0;
  basket.forEach((item) => {
    let itemTotal = parseFloat(item.VR_UNITARIO || 0);
    if (item.ACRESCIMOS) {
      item.ACRESCIMOS.forEach((extra) => {
        itemTotal += parseFloat(extra.VR_UNITARIO || 0);
      });
    }
    subtotal += itemTotal * item.QTD;
  });

  // Calcular taxas
  const taxaEntrega = delivery?.TAXA_ENTREGA ? parseFloat(delivery.TAXA_ENTREGA) : 0;
  const fees = calculateSystemFees(subtotal, taxaEntrega);

  return {
    subtotal,
    taxaEntrega,
    fees,
    total: fees.grandTotal
  };
}

// Exemplo de uso
const mockBasket = [
  {
    VR_UNITARIO: 25.00,
    QTD: 2,
    ACRESCIMOS: [
      { VR_UNITARIO: 2.50 }
    ]
  }
];

const mockDelivery = { TAXA_ENTREGA: 5.00 };

const cartTotal = updateCartTotal(mockBasket, mockDelivery);
console.log('Cart Total:', cartTotal);


// ===================================
// EXEMPLO 6: Exibir Breakdown na UI
// ===================================
console.log('\n=== EXEMPLO 6: Exibir Breakdown na UI ===');

function renderFeesBreakdown(fees) {
  return `
    + Subtotal: R$ ${fees.subtotal.toFixed(2)}
    + Taxa de Entrega: R$ ${fees.deliveryFee.toFixed(2)}
    + Taxa de Serviço: R$ ${fees.serviceFee.toFixed(2)}
    + Taxa Pagamento (Fixa): R$ ${fees.paymentFixedFee.toFixed(2)}
    + Taxa Pagamento (${fees.paymentPercentageFee.toFixed(2)}%): R$ ${fees.paymentPercentageValue.toFixed(2)}
    ─────────────────────────────
    = TOTAL: R$ ${fees.grandTotal.toFixed(2)}
  `;
}

const displayFees = calculateSystemFees(50.00, 5.00);
console.log(renderFeesBreakdown(displayFees));


// ===================================
// EXEMPLO 7: Validação de Taxa Percentual
// ===================================
console.log('\n=== EXEMPLO 7: Validação de Taxa Percentual ===');

// Tentar usar taxa fora do range permitido
const invalidTax1 = updatePaymentPercentage(0.0299); // 2.99% - INVÁLIDO (min: 3.99%)
console.log('Taxa 2.99% aceita?', invalidTax1); // false

const invalidTax2 = updatePaymentPercentage(0.0599); // 5.99% - INVÁLIDO (max: 4.99%)
console.log('Taxa 5.99% aceita?', invalidTax2); // false

const validTax = updatePaymentPercentage(0.0420); // 4.20% - VÁLIDO
console.log('Taxa 4.20% aceita?', validTax); // true


// ===================================
// EXEMPLO 8: Preparar Dados para Backend
// ===================================
console.log('\n=== EXEMPLO 8: Preparar Dados para Backend ===');

function preparePedidoData(basket, delivery, user, address) {
  const fees = calculateSystemFees(
    calculateSubtotal(basket),
    delivery.TAXA_ENTREGA
  );

  return {
    DELIVERY_ID: delivery.DELIVERY_ID,
    USER_ID: user.USER_ID,
    VR_SUBTOTAL: fees.subtotal,
    TAXA_ENTREGA: fees.deliveryFee,
    VR_TOTAL: fees.grandTotal,
    STATUS: "NOVO",
    ENDERECO_ENTREGA: address,
    ITENS: basket,
    // Backend recalculará, mas enviamos para validação
    FEES_BREAKDOWN: {
      serviceFee: fees.serviceFee,
      paymentFixedFee: fees.paymentFixedFee,
      paymentPercentageFee: fees.paymentPercentageFee,
      paymentPercentageValue: fees.paymentPercentageValue
    }
  };
}

function calculateSubtotal(basket) {
  return basket.reduce((acc, item) => {
    let itemTotal = parseFloat(item.VR_UNITARIO || 0);
    if (item.ACRESCIMOS) {
      item.ACRESCIMOS.forEach((extra) => {
        itemTotal += parseFloat(extra.VR_UNITARIO || 0);
      });
    }
    return acc + (itemTotal * item.QTD);
  }, 0);
}


// ===================================
// EXEMPLO 9: Comparação de Cenários
// ===================================
console.log('\n=== EXEMPLO 9: Comparação de Cenários ===');

const scenarios = [
  { name: 'Pedido Pequeno', subtotal: 20.00, taxaEntrega: 3.00 },
  { name: 'Pedido Médio', subtotal: 50.00, taxaEntrega: 5.00 },
  { name: 'Pedido Grande', subtotal: 100.00, taxaEntrega: 8.00 },
];

scenarios.forEach(scenario => {
  const fees = calculateSystemFees(scenario.subtotal, scenario.taxaEntrega);
  console.log(`\n${scenario.name}:`);
  console.log(`  Subtotal: R$ ${scenario.subtotal.toFixed(2)}`);
  console.log(`  Taxa Entrega: R$ ${scenario.taxaEntrega.toFixed(2)}`);
  console.log(`  Taxas Sistema: R$ ${fees.totalFees.toFixed(2)}`);
  console.log(`  Total Final: R$ ${fees.grandTotal.toFixed(2)}`);
  console.log(`  % de Taxas: ${((fees.totalFees / fees.grandTotal) * 100).toFixed(2)}%`);
});


// ===================================
// EXEMPLO 10: Hook Personalizado React
// ===================================
console.log('\n=== EXEMPLO 10: Hook Personalizado ===');

/*
// useOrderFees.js
import { useState, useEffect } from 'react';
import { calculateSystemFees } from '../config/fees';

export function useOrderFees(subtotal, deliveryFee) {
  const [fees, setFees] = useState(null);

  useEffect(() => {
    if (subtotal !== null && deliveryFee !== null) {
      const calculated = calculateSystemFees(subtotal, deliveryFee);
      setFees(calculated);
    }
  }, [subtotal, deliveryFee]);

  return fees;
}

// Uso no componente:
function Cart() {
  const [subtotal, setSubtotal] = useState(0);
  const [delivery, setDelivery] = useState(null);
  
  const fees = useOrderFees(subtotal, delivery?.TAXA_ENTREGA);
  
  return (
    <View>
      <Text>Total: R$ {fees?.grandTotal.toFixed(2)}</Text>
    </View>
  );
}
*/

console.log('\n✅ Todos os exemplos executados com sucesso!');

/**
 * src/components/OrderPayments/PixPayment.js
 */

import React, { useState, useEffect } from 'react';
import {
  View, Text, Image, TouchableOpacity, Alert,
  ActivityIndicator, StyleSheet
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import api from '../../config/apiAxios';
import Logger from '../../utils/logger';

export default function OrderPixPayment({ orderId }) {
  const [loading, setLoading] = useState(false);
  const [pixData, setPixData] = useState(null);
  const [pedido, setPedido] = useState(null);
  const [expirationTime, setExpirationTime] = useState(null);

  useEffect(() => {
    getPedidoAndGeneratePix();
  }, [orderId]);

  useEffect(() => {
    if (expirationTime > 0) {
      const timer = setInterval(() => {
        setExpirationTime(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [expirationTime]);

  useEffect(() => {
    if (pixData) {
      Logger.info('PIX', `Iniciando monitoramento de status para pedido ${orderId}`);
      const checkStatus = setInterval(async () => {
        try {
          const response = await api.get(`/pix/status/${orderId}`);
          Logger.info('PIX', `Status check result:`, response.data);
          if (response.data.status === 'PAID') {
            Logger.info('PIX', `Pagamento confirmado para pedido ${orderId}`);
            clearInterval(checkStatus);
            Alert.alert('Sucesso', 'Pagamento confirmado!');
          }
        } catch (error) {
          Logger.warn('PIX', `Status check - aguardando transação... (${error.message})`);
        }
      }, 10000); // Reduzido para 10 segundos
      return () => clearInterval(checkStatus);
    }
  }, [pixData]);

  async function getPedidoAndGeneratePix() {
    setLoading(true);
    Logger.info('PIX', `Iniciando geração de PIX para pedido ${orderId}`);

    try {
      // Busca dados do pedido
      Logger.info('PIX', `Buscando dados do pedido ${orderId}`);
      const orderResponse = await api.get(`/api/pedido/${orderId}`);
      Logger.info('PIX', `Dados do pedido obtidos:`, orderResponse.data);
      setPedido(orderResponse.data);

      // Gera PIX
      const pixPayload = {
        orderId: orderId,
        value: orderResponse.data.VR_TOTAL,
        description: `Pedido #${orderId}`
      };

      Logger.info('PIX', `Enviando dados para gerar PIX:`, pixPayload);
      const pixResponse = await api.post('/pix/generate', pixPayload);
      Logger.info('PIX', `Resposta do backend PIX:`, pixResponse.data);

      if (pixResponse.data.success) {
        Logger.info('PIX', `PIX gerado com sucesso. QR Code disponível: ${!!pixResponse.data.qrcode}`);
        Logger.info('PIX', `Código copia-cola disponível: ${!!pixResponse.data.copyPaste}`);
        setPixData(pixResponse.data);
        setExpirationTime(pixResponse.data.expiresIn);
      } else {
        Logger.error('PIX', `Falha ao gerar PIX: ${pixResponse.data.error}`);
        throw new Error(pixResponse.data.error || 'Falha ao gerar PIX');
      }

    } catch (error) {
      Logger.error('PIX', `Erro ao gerar PIX:`, error);
      Logger.error('PIX', `Detalhes do erro: ${error.message}`);
      if (error.response) {
        Logger.error('PIX', `Resposta de erro do servidor:`, error.response.data);
        Logger.error('PIX', `Status do erro: ${error.response.status}`);
      }
      Alert.alert('Erro', 'Não foi possível gerar o PIX');
    } finally {
      setLoading(false);
    }
  }

  async function copyToClipboard() {
    try {
      Logger.info('PIX', `Copiando código PIX para clipboard`);
      await Clipboard.setStringAsync(pixData.copyPaste);
      Logger.info('PIX', `Código PIX copiado com sucesso`);
      Alert.alert('Sucesso', 'Código PIX copiado para área de transferência!');
    } catch (error) {
      Logger.error('PIX', `Erro ao copiar código PIX:`, error);
      Alert.alert('Erro', 'Não foi possível copiar o código');
    }
  };

  if (loading) {
    Logger.info('PIX', `Exibindo tela de loading para pedido ${orderId}`);
    return (
      <View style={styles.container}>
        <ActivityIndicator size={80} color="orange" />
        <Text>Gerando PIX...</Text>
      </View>
    );
  }

  Logger.info('PIX', `Renderizando tela PIX. PixData disponível: ${!!pixData}`);
  if (pixData) {
    Logger.info('PIX', `QR Code URL: ${pixData.qrcode ? 'Disponível' : 'Não disponível'}`);
    Logger.info('PIX', `Código copia-cola: ${pixData.copyPaste ? 'Disponível' : 'Não disponível'}`);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pagamento via PIX</Text>

      <Text style={styles.orderInfo}>
        Pedido #{orderId} - Total: R$ {pedido?.VR_TOTAL}
      </Text>

      {pixData?.qrcode && (
        <View style={styles.qrCodeContainer}>
          <Image
            source={{ uri: pixData.qrcode }}
            style={styles.qrCode}
            resizeMode="contain"
          />
          <Text style={styles.expirationInfo}>
            Expira em: {Math.floor(expirationTime / 60)} minutos
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.copyButton}
        onPress={copyToClipboard}
      >
        <Text style={styles.copyButtonText}>
          Copiar código PIX
        </Text>
      </TouchableOpacity>

      <Text style={styles.instructions}>
        1. Abra o app do seu banco
        2. Escolha pagar com PIX
        3. Escaneie o QR Code ou cole o código
        4. Confirme o pagamento
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  orderInfo: {
    fontSize: 16,
    marginBottom: 20,
  },
  qrCodeContainer: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    alignItems: 'center',
  },
  qrCode: {
    width: 200,
    height: 200,
    marginVertical: 20,
  },
  expirationInfo: {
    color: '#666',
    marginTop: 10,
  },
  copyButton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    marginVertical: 20,
  },
  copyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  instructions: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
    lineHeight: 24,
  }
});
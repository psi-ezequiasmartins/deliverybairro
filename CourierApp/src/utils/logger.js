/**
 * src/utils/logger.js
 * Sistema de logging para CourierApp
 */

import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isDevelopment } from '../config/apiAxios';

class Logger {
  static async log(level, context, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      context,
      message,
      data: data ? JSON.stringify(data) : null
    };

    // Em desenvolvimento: console.log normal
    if (isDevelopment) {
      const emoji = this.getEmoji(level);
      console.log(`${emoji} [CourierApp-${context}] ${message}`, data || '');
    }

    // Em produção: salva em arquivo local para debug posterior
    if (!isDevelopment) {
      try {
        const existingLogs = await AsyncStorage.getItem('courier_app_logs') || '[]';
        const logs = JSON.parse(existingLogs);

        // Mantém apenas os últimos 100 logs para não ocupar muito espaço
        if (logs.length >= 100) {
          logs.shift();
        }

        logs.push(logEntry);
        await AsyncStorage.setItem('courier_app_logs', JSON.stringify(logs));
      } catch (error) {
        // Se falhar ao salvar log, ignora silenciosamente
      }
    }

    // Para erros críticos: sempre mostra alert em produção
    if (level === 'ERROR_CRITICAL' && !isDevelopment) {
      Alert.alert(
        'Erro Detectado',
        `${context}: ${message}`,
        [{ text: 'OK' }]
      );
    }
  }

  static getEmoji(level) {
    const emojis = {
      INFO: 'ℹ️',
      SUCCESS: '✅',
      WARNING: '⚠️',
      ERROR: '❌',
      ERROR_CRITICAL: '🚨',
      DEBUG: '🔍'
    };
    return emojis[level] || 'ℹ️';
  }

  static info(context, message, data = null) {
    this.log('INFO', context, message, data);
  }

  static success(context, message, data = null) {
    this.log('SUCCESS', context, message, data);
  }

  static warning(context, message, data = null) {
    this.log('WARNING', context, message, data);
  }

  static error(context, message, data = null) {
    this.log('ERROR', context, message, data);
  }

  static errorCritical(context, message, data = null) {
    this.log('ERROR_CRITICAL', context, message, data);
  }

  static debug(context, message, data = null) {
    this.log('DEBUG', context, message, data);
  }

  // Método para recuperar logs salvos (útil para debug)
  static async getLogs() {
    try {
      const logs = await AsyncStorage.getItem('courier_app_logs');
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      return [];
    }
  }

  // Método para limpar logs
  static async clearLogs() {
    try {
      await AsyncStorage.removeItem('courier_app_logs');
      return true;
    } catch (error) {
      return false;
    }
  }

  // Log específico para ações de entrega
  static delivery(action, orderId, message, data = null) {
    this.info('Delivery', `${action} - Order ${orderId}: ${message}`, data);
  }

  // Log específico para localização
  static location(message, coordinates = null) {
    this.debug('Location', message, coordinates);
  }

  // Log específico para notificações
  static notification(type, message, data = null) {
    this.info('Notification', `${type}: ${message}`, data);
  }
}

export default Logger;
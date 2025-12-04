/**
 * src/utils/logger.js
 * Sistema de logging inteligente para produção e desenvolvimento
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
      console.log(`${emoji} [${context}] ${message}`, data || '');
    }

    // Em produção: salva em arquivo local para debug posterior
    if (!isDevelopment) {
      try {
        const existingLogs = await AsyncStorage.getItem('app_logs') || '[]';
        const logs = JSON.parse(existingLogs);

        // Mantém apenas os últimos 100 logs para não ocupar muito espaço
        if (logs.length >= 100) {
          logs.shift();
        }

        logs.push(logEntry);
        await AsyncStorage.setItem('app_logs', JSON.stringify(logs));
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
      DEBUG: '🔍',
      TOKEN: '📱',
      CART: '🛒',
      AUTH: '🔐'
    };
    return emojis[level] || 'ℹ️';
  }

  // Métodos de conveniência
  static info(context, message, data) {
    this.log('INFO', context, message, data);
  }

  static success(context, message, data) {
    this.log('SUCCESS', context, message, data);
  }

  static warning(context, message, data) {
    this.log('WARNING', context, message, data);
  }

  static warn(context, message, data) {
    this.log('WARNING', context, message, data);
  }

  static error(context, message, data) {
    this.log('ERROR', context, message, data);
  }

  static errorCritical(context, message, data) {
    this.log('ERROR_CRITICAL', context, message, data);
  }

  static debug(context, message, data) {
    this.log('DEBUG', context, message, data);
  }

  static token(context, message, data) {
    this.log('TOKEN', context, message, data);
  }

  static cart(context, message, data) {
    this.log('CART', context, message, data);
  }

  static auth(context, message, data) {
    this.log('AUTH', context, message, data);
  }

  // Método para exportar logs (útil para debug)
  static async getLogs() {
    try {
      const logs = await AsyncStorage.getItem('app_logs');
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      return [];
    }
  }

  // Método para limpar logs
  static async clearLogs() {
    try {
      await AsyncStorage.removeItem('app_logs');
    } catch (error) {
      // Ignora erro silenciosamente
    }
  }
}

export default Logger;
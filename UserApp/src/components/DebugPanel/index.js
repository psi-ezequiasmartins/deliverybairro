/**
 * src/components/DebugPanel/index.js
 * Painel de debug para visualizar logs em produção
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, Share } from 'react-native';
import Logger from '../../utils/logger';

export default function DebugPanel({ visible, onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadLogs = async () => {
    setLoading(true);
    const appLogs = await Logger.getLogs();
    setLogs(appLogs.slice(-50)); // Últimos 50 logs
    setLoading(false);
  };

  const clearLogs = async () => {
    Alert.alert(
      'Limpar Logs',
      'Tem certeza que deseja limpar todos os logs?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: async () => {
            await Logger.clearLogs();
            setLogs([]);
            Alert.alert('Logs limpos com sucesso!');
          }
        }
      ]
    );
  };

  const shareLogs = async () => {
    const logText = logs.map(log =>
      `${log.timestamp} [${log.level}] ${log.context}: ${log.message} ${log.data || ''}`
    ).join('\n');

    try {
      await Share.share({
        message: `DeliveryBairro UserApp Logs\n\n${logText}`,
        title: 'App Logs'
      });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível compartilhar os logs');
    }
  };

  React.useEffect(() => {
    if (visible) {
      loadLogs();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.panel}>
        <View style={styles.header}>
          <Text style={styles.title}>Debug Panel</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity onPress={loadLogs} style={styles.actionButton}>
            <Text style={styles.actionText}>🔄 Atualizar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={shareLogs} style={styles.actionButton}>
            <Text style={styles.actionText}>📤 Compartilhar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={clearLogs} style={styles.actionButton}>
            <Text style={styles.actionText}>🗑️ Limpar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.logContainer}>
          {loading ? (
            <Text style={styles.loadingText}>Carregando logs...</Text>
          ) : logs.length === 0 ? (
            <Text style={styles.emptyText}>Nenhum log encontrado</Text>
          ) : (
            logs.map((log, index) => (
              <View key={index} style={styles.logItem}>
                <Text style={styles.logTime}>
                  {new Date(log.timestamp).toLocaleTimeString()}
                </Text>
                <Text style={[styles.logLevel, { color: getLogColor(log.level) }]}>
                  [{log.level}]
                </Text>
                <Text style={styles.logContext}>{log.context}:</Text>
                <Text style={styles.logMessage}>{log.message}</Text>
                {log.data && (
                  <Text style={styles.logData}>{log.data}</Text>
                )}
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}

function getLogColor(level) {
  const colors = {
    INFO: '#2196F3',
    SUCCESS: '#4CAF50',
    WARNING: '#FF9800',
    ERROR: '#F44336',
    ERROR_CRITICAL: '#D32F2F',
    DEBUG: '#9E9E9E',
    TOKEN: '#9C27B0',
    CART: '#FF5722',
    AUTH: '#3F51B5'
  };
  return colors[level] || '#000';
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  panel: {
    backgroundColor: '#fff',
    width: '90%',
    maxHeight: '80%',
    borderRadius: 10,
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  closeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  actionButton: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    minWidth: 80,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 12,
    color: '#333',
  },
  logContainer: {
    maxHeight: 400,
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
  },
  logItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 8,
  },
  logTime: {
    fontSize: 11,
    color: '#999',
    fontFamily: 'monospace',
  },
  logLevel: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  logContext: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  logMessage: {
    fontSize: 12,
    color: '#555',
    marginTop: 2,
  },
  logData: {
    fontSize: 11,
    color: '#777',
    fontFamily: 'monospace',
    backgroundColor: '#f5f5f5',
    padding: 5,
    marginTop: 3,
    borderRadius: 3,
  },
});
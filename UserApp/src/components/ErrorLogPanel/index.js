/**
 * src/components/ErrorLogPanel/index.js
 * Painel específico para logs de erro no SideBar
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, Share, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Logger from '../../utils/logger';

export default function ErrorLogPanel({ visible, onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadErrorLogs = async () => {
    setLoading(true);
    const allLogs = await Logger.getLogs();
    // Filtra apenas logs de erro e warning
    const errorLogs = allLogs.filter(log =>
      ['ERROR', 'ERROR_CRITICAL', 'WARNING'].includes(log.level)
    ).slice(-30); // Últimos 30 logs de erro
    console.log('🔍 ErrorLogPanel: Total de logs carregados:', errorLogs.length);
    setLogs(errorLogs);
    setLoading(false);
  };

  const clearLogs = async () => {
    Alert.alert(
      'Limpar Logs de Erro',
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

  const shareErrorLogs = async () => {
    const logText = logs.map(log =>
      `${new Date(log.timestamp).toLocaleString()} [${log.level}] ${log.context}: ${log.message} ${log.data || ''}`
    ).join('\n\n');

    if (logs.length === 0) {
      Alert.alert('Info', 'Nenhum log de erro para compartilhar');
      return;
    }

    try {
      await Share.share({
        message: `🚨 DeliveryBairro - Logs de Erro\n📅 ${new Date().toLocaleString()}\n\n${logText}`,
        title: 'Logs de Erro - UserApp'
      });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível compartilhar os logs');
    }
  };

  React.useEffect(() => {
    if (visible) {
      console.log('🔍 ErrorLogPanel: Carregando logs...');
      loadErrorLogs();
    }
  }, [visible]);

  const renderLogItem = ({ item, index }) => (
    <View style={[styles.logItem, { backgroundColor: getLogBackgroundColor(item.level) }]}>
      <View style={styles.logHeader}>
        <Text style={styles.logTime}>
          {new Date(item.timestamp).toLocaleTimeString()}
        </Text>
        <View style={[styles.levelBadge, { backgroundColor: getLogColor(item.level) }]}>
          <Text style={styles.levelText}>{item.level}</Text>
        </View>
      </View>
      <Text style={styles.logContext}>{item.context}</Text>
      <Text style={styles.logMessage}>{item.message}</Text>
      {item.data && item.data !== 'null' && (
        <Text style={styles.logData}>{item.data}</Text>
      )}
    </View>
  );

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.panel}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <MaterialIcons name="bug-report" size={24} color="#FF9800" />
            <Text style={styles.title}>Log de Erros</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.stats}>
          <Text style={styles.statsText}>
            {logs.length} erro(s) encontrado(s)
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity onPress={loadErrorLogs} style={[styles.actionButton, styles.refreshButton]}>
            <MaterialIcons name="refresh" size={16} color="#fff" />
            <Text style={styles.actionText}>Atualizar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={shareErrorLogs} style={[styles.actionButton, styles.shareButton]}>
            <MaterialIcons name="share" size={16} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={clearLogs} style={[styles.actionButton, styles.clearButton]}>
            <MaterialIcons name="delete" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.centerContent}>
            <Text style={styles.loadingText}>Carregando logs...</Text>
          </View>
        ) : logs.length === 0 ? (
          <View style={styles.centerContent}>
            <MaterialIcons name="check-circle" size={48} color="#4CAF50" />
            <Text style={styles.emptyText}>Nenhum erro registrado!</Text>
            <Text style={styles.emptySubtext}>Seu app está funcionando perfeitamente.</Text>
          </View>
        ) : (
          <View style={styles.listWrapper}>
            <FlatList
              data={logs}
              renderItem={renderLogItem}
              keyExtractor={(item, index) => index.toString()}
              style={styles.logContainer}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            />
          </View>
        )}
      </View>
    </View>
  );
}

function getLogColor(level) {
  const colors = {
    WARNING: '#FF9800',
    ERROR: '#F44336',
    ERROR_CRITICAL: '#D32F2F',
  };
  return colors[level] || '#FF9800';
}

function getLogBackgroundColor(level) {
  const colors = {
    WARNING: '#FFF8E1',
    ERROR: '#FFEBEE',
    ERROR_CRITICAL: '#FFCDD2',
  };
  return colors[level] || '#FFF8E1';
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
    width: '92%',
    height: '85%',
    borderRadius: 25,
    padding: 15,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#FF9800',
    paddingBottom: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  closeButton: {
    padding: 5,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
  },
  stats: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  statsText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    justifyContent: 'center',
  },
  refreshButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
  },
  shareButton: {
    backgroundColor: '#4CAF50',
    width: 36,
    height: 36,
  },
  clearButton: {
    backgroundColor: '#F44336',
    width: 36,
    height: 36,
  },
  actionText: {
    fontSize: 12,
    color: '#fff',
    marginLeft: 4,
    fontWeight: 'bold',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#4CAF50',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  emptySubtext: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    marginTop: 5,
  },
  listWrapper: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 5,
    marginTop: 10,
  },
  logContainer: {
    flex: 1,
  },
  logItem: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  logTime: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  levelText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  logContext: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 3,
  },
  logMessage: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },
  logData: {
    fontSize: 11,
    color: '#777',
    fontFamily: 'monospace',
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 8,
    marginTop: 5,
    borderRadius: 5,
  },
});
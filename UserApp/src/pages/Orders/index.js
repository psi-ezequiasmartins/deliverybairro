/**
* src/pages/Pedidos/index.js 
* deliverybairro.com - Página de pedidos com i18n
*/

import React, { useState, useEffect, useContext, useRef } from "react";
import socket from '../../services/socket';
import { joinRoom, leaveRoom } from '../../services/socketRoomManager';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";
// import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from 'react-i18next';
import { AuthContext } from "../../contexts/AuthContext";
import { NotificationContext } from "../../contexts/NotificationContext";

import Header from '../../components/Header';
import OrderListItem from './OrderListItem';

import api from "../../config/apiAxios";

export default function Pedidos() {
  const { t } = useTranslation();
  const [pedidos, setPedidos] = useState([]);

  const { user } = useContext(AuthContext);
  const { notify, setNotify } = useContext(NotificationContext);

  const listRef = useRef(null);
  const id = user?.USER_ID;

  async function loadPedidos() {
    try {
      const response = await api.get(`/user-app/listar/pedidos/usuario/${id}`);
      setPedidos(response.data);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    }
  }


  useEffect(() => {
    loadPedidos();

    if (!id) {
      console.warn('⚠️ [Orders] USER_ID não disponível, não é possível entrar na sala');
      return;
    }

    console.log('👂 [Orders] Registrando listener para orderStatusUpdated');
    console.log('👤 [Orders] USER_ID atual:', id);

    // Garante conexão ao WebSocket
    if (!socket.connected) {
      console.log('🔌 [Orders] Socket não conectado, conectando...');
      socket.connect();
    }

    // Entra na sala do usuário para receber atualizações
    const userRoom = `user_${id}`;
    joinRoom(userRoom, true); // true = aguarda conexão se necessário

    // Escuta atualizações de status de pedidos via websocket
    const handleOrderStatusUpdate = (data) => {
      console.log('📡 [Orders] Pedido atualizado via websocket:', data);
      console.log('📋 [Orders] Lista de pedidos atual:', pedidos.map(p => ({ id: p.PEDIDO_ID, status: p.STATUS })));

      setPedidos((prevPedidos) => {
        const updated = prevPedidos.map(p =>
          p.PEDIDO_ID === data.orderId
            ? { ...p, STATUS: data.status }
            : p
        );
        console.log('✅ [Orders] Lista de pedidos atualizada:', updated.map(p => ({ id: p.PEDIDO_ID, status: p.STATUS })));
        return updated;
      });
    };

    socket.on('orderStatusUpdated', handleOrderStatusUpdate);

    return () => {
      console.log('🔇 [Orders] Removendo listener para orderStatusUpdated');
      socket.off('orderStatusUpdated', handleOrderStatusUpdate);

      // Sai da sala ao desmontar componente
      leaveRoom(userRoom);
    };
  }, [id]); useEffect(() => {
    if (notify) {
      loadPedidos();
      setNotify(false);
    }
  }, [notify, setNotify]);

  async function moveToTop() {
    await listRef.current.scrollToOffset({ offset: 0, animated: true })
  }

  async function moveToDown() {
    await listRef.current.scrollToEnd({ animated: true })
  }

  return (
    <SafeAreaView style={styles.safearea}>
      <Header />
      <View style={styles.subheader}>
        <Text style={styles.title}>{t('orders.title').toUpperCase()}</Text>
        <View style={{ flexDirection: "row", width: "25%" }}>
          <TouchableOpacity onPress={moveToTop}>
            <MaterialCommunityIcons name='arrow-up' size={50} color={'#4DCE4D'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={moveToDown}>
            <MaterialCommunityIcons name='arrow-down' size={50} color={'#FF0000'} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.container}>
        <FlatList
          style={styles.flatlist}
          data={pedidos}
          showsVerticalScrollIndicator={true}
          ListEmptyComponent={() => <Text style={styles.empty}>{t('orders.empty')}</Text>}
          keyExtractor={(item) => String(item?.PEDIDO_ID)}
          renderItem={({ item }) => <OrderListItem order={item} />}
          ref={listRef}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safearea: {
    flex: 1,
    backgroundColor: "#FFF"
  },
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    padding: 10,
  },
  flatlist: {
    flex: 1,
    marginTop: 10,
    marginBottom: 100,
  },
  subheader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderBottomColor: '#E2E2E2',
    borderBottomWidth: 1
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingBottom: 10
  },
  subtitle: {
    color: '#000',
    fontSize: 15,
    fontWeight: 'bold'
  },
  empty: {
    fontSize: 18,
    fontStyle: 'italic',
    textAlign: 'center',
    color: "red",
    marginTop: 30,
    marginBottom: 30,
  }
})

//}, [id, notify]); // se notify = true, atualiza a lista de pedidos com seus status atualizados.

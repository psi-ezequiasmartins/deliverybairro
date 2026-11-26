/**
 * src/components/Header/index.js
 */

import { useContext, useState } from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CartContext } from '../../contexts/CartContext';
import DebugPanel from '../DebugPanel';

import icon from '../../../assets/icon.png';
import logomarca from '../../../assets/logomarca.png';
import sacola from '../../../assets/pedidos.png';

export default function Header() {
  const navigation = useNavigation();
  const { basket } = useContext(CartContext);
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  function handleLogoPress() {
    GoToLink('Home');
  }

  function handleLongPress() {
    setShowDebugPanel(true);
  }

  function GoToLink(link) {
    if (link === 'Cart') {
      // Navegar para a tela Cart dentro do Stack de Deliveries no tab GroupsTab
      navigation.navigate('Main', {
        screen: 'GroupsTab',
        params: { screen: 'Cart' }
      });
    } else if (link === 'Home') {
      // Navegar para a tela principal (GroupsTab)
      navigation.navigate('Main', { screen: 'GroupsTab' });
    } else {
      // Fallback para outras navegações
      navigation.navigate(link);
    }
  }

  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={handleLogoPress}
        onLongPress={handleLongPress}
      >
        <Image source={icon} style={{ width: 85, height: 85 }} resizeMode="contain" />
      </TouchableOpacity>
      <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <Image source={logomarca} style={{ width: 180 }} resizeMode="contain" />
      </View>
      <TouchableOpacity onPress={() => GoToLink('Cart')}>
        <Image source={sacola} style={{ width: 55, height: 55 }} resizeMode="contain" />
        {basket.length >= 1 &&
          <View style={styles.dot}>
            <Text style={styles.dotText}>{basket?.length}</Text>
          </View>
        }
      </TouchableOpacity>

      <DebugPanel
        visible={showDebugPanel}
        onClose={() => setShowDebugPanel(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 80,
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingLeft: 10,
    paddingRight: 10,
    borderBottomColor: '#CCC',
    borderBottomWidth: 0.5,
    marginBottom: 5,
  },
  dot: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'red',
    width: 30,
    height: 30,
    borderRadius: 15,
    position: 'absolute',
    zIndex: 99,
    bottom: 7,
    left: -10
  },
  dotText: {
    fontSize: 14,
    color: '#FFF'
  }
});

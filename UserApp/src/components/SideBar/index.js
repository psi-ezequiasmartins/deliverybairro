/**
 * src/components/SideBar/index.js
 * deliverybairro.com - UserApp Sidebar com sistema i18n
 */

import { useContext, useState } from 'react';
import { View, Text, Image } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { FontAwesome5, MaterialCommunityIcons, Fontisto, AntDesign, Entypo, MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import LanguageSelector from '../LanguageSelector';
import ErrorLogPanel from '../ErrorLogPanel';

import logotipo from '../../../assets/logo.png';

export default function SideBar(props) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { user, signOut } = useContext(AuthContext);
  const [showLogPanel, setShowLogPanel] = useState(false);

  function GoToLink(link) {
    if (link === "Main") {
      // Navegar para a tela principal (fecha o drawer)
      props.navigation.closeDrawer();
      navigation.navigate("Main");
    } else {
      // Navegar para abas específicas dentro do TabNavigator
      props.navigation.closeDrawer();
      navigation.navigate("Main", { screen: link });
    }
  }

  function openLogPanel() {
    props.navigation.closeDrawer();
    setShowLogPanel(true);
  }

  return (
    <DrawerContentScrollView {...props}>
      <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 15, marginBottom: 15 }}>
        <Image source={logotipo} style={{ width: 120, height: 120 }} resizeMode="contain" />
        <Text style={{ color: '#5D5D5D', fontSize: 18, marginTop: 25 }}>{t('user.welcome')}</Text>
        <Text style={{ color: '#000000', fontSize: 17, fontWeight: 'bold' }}>{user?.NOME} {user?.SOBRENOME}</Text>
        <Text style={{ color: '#000000', fontSize: 17 }}>{t('user.userId')} {user?.USER_ID}</Text>
      </View>
      {/* Seletor de idiomas */}
      <View style={{ paddingHorizontal: 14, marginBottom: 10 }}>
        <LanguageSelector />
      </View>
      <DrawerItem
        label={t('navigation.groups').toUpperCase()}
        onPress={() => GoToLink("GroupsTab")}
        activeTintColor='#FFF'
        activeBackgroundColor='#000'
        inactiveTintColor='#7F7B7B'
        inactiveBackgroundColor='transparent'
        borderRadius={10}
        marginTop={-10}
        icon={({ focused, size }) => (
          <Entypo name='shop' size={size} color={(focused !== true) ? '#000' : '#FFF'} />
        )}
      />
      <DrawerItem
        label={t('navigation.orders').toUpperCase()}
        onPress={() => GoToLink("OrdersTab")}
        activeTintColor='#FFF'
        activeBackgroundColor='#000'
        inactiveTintColor='#7F7B7B'
        inactiveBackgroundColor='transparent'
        borderRadius={10}
        marginTop={-10}
        icon={({ focused, size }) => (
          <Fontisto name='shopping-bag-1' size={size} color={(focused !== true) ? '#000' : '#FFF'} />
        )}
      />
      <DrawerItem
        label={t('navigation.profile').toUpperCase()}
        onPress={() => GoToLink("ProfileTab")}
        activeTintColor='#FFF'
        activeBackgroundColor='#000'
        inactiveTintColor='#7F7B7B'
        inactiveBackgroundColor='transparent'
        borderRadius={10}
        marginTop={-10}
        icon={({ focused, size }) => (
          <FontAwesome5 name='user-cog' size={size} color={(focused !== true) ? '#000' : '#FFF'} />
        )}
      />
      <DrawerItem
        label="LOG DE ERROS"
        onPress={openLogPanel}
        activeTintColor='#FFF'
        activeBackgroundColor='#FF9800'
        inactiveTintColor='#FF9800'
        inactiveBackgroundColor='transparent'
        borderRadius={10}
        marginTop={-10}
        icon={({ focused, size }) => (
          <MaterialIcons name='bug-report' size={size} color={(focused !== true) ? '#FF9800' : '#FFF'} />
        )}
      />
      <DrawerItem
        label={t('navigation.closeMenu').toUpperCase()}
        onPress={() => props.navigation.closeDrawer()}
        activeTintColor='#000'
        inactiveTintColor='#7F7B7B'
        borderRadius={10}
        marginTop={-10}
        icon={({ focused, size }) => (
          <MaterialCommunityIcons name="close-box-multiple-outline" size={size} color={(focused !== true) ? '#7F7B7B' : '#000'} />
        )}
      />
      <DrawerItem
        label={t('navigation.logout').toUpperCase()}
        onPress={signOut}
        activeTintColor='#FFF'
        activeBackgroundColor='#FF0000'
        inactiveTintColor='#FF0000'
        inactiveBackgroundColor='transparent'
        borderRadius={10}
        marginTop={0}
        icon={({ focused, size }) => (
          <FontAwesome5 name="door-open" size={size} color={(focused !== true) ? '#000' : '#FFF'} />
        )}
      />
      <View style={{ justifyContent: 'center', alignItems: 'center', paddingTop: 10 }}>
        <Text style={{ color: '#000', fontSize: 18, fontWeight: 'bold' }}>deliverybairro.com</Text>
        <Text style={{ color: '#000', fontSize: 16 }}><AntDesign name="copyright" color='#000' size={12} /> {t('footer.copyright')}</Text>
        <Text style={{ color: '#000', fontSize: 14 }}>{t('footer.rightsReserved')}</Text>
      </View>

      {/* Error Log Panel para visualizar logs de erro */}
      <ErrorLogPanel
        visible={showLogPanel}
        onClose={() => setShowLogPanel(false)}
      />
    </DrawerContentScrollView>
  );
}

/**
 * deliverybairro.com 
 * Tabela de cores atualizadas:
 * Azul: #0033CC
 * Amarelo Ouro: #FFB901 
 * Verde: #4DCE4D
 * Vermelho: #FF0000
 * Cinzas: #5D5D5D #7F7B7B
 * Preto: #000000
 * Branco: #FFFFFF
 * 
 * Cores deliverybairro.com 2025:
 * Primary: #0033CC (Azul)
 * Secondary: #FFB901 (Amarelo) 
 * Success: #4DCE4D (Verde)
 * Danger: #FF0000 (Vermelho)
 */

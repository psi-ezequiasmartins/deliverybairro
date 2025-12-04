/**
 * src/components/NoDeliveriesInArea.js
 * Componente de sugestão para recomendar o DeliveryBairro aos estabelecimentos da região
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert
} from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome } from '@expo/vector-icons';

export default function NoDeliveriesInArea({ userLocation, categoryName }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleRecommendDeliveryBairro = () => {
    Alert.alert(
      'Recomendar DeliveryBairro 🚀',
      'Que tal falar sobre o DeliveryBairro com o gerente do seu restaurante/estabelecimento favorito?\n\nVamos direcioná-lo para nosso site onde eles podem se cadastrar facilmente!',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Ir para o Site',
          onPress: () => openPreRegistrationForm()
        }
      ]
    );
  };

  const openPreRegistrationForm = () => {
    // URL do formulário de pré-cadastro já funcional no DeliveryApp
    const formUrl = 'https://deliverybairro.com/pre-cadastro';

    Linking.openURL(formUrl).catch(() => {
      Alert.alert(
        'Erro',
        'Não foi possível abrir o site. Verifique sua conexão e tente novamente.',
        [{ text: 'OK' }]
      );
    });
  };

  const handleShareApp = () => {
    const shareText = `🍕 Oi! Conhece o DeliveryBairro?\n\n` +
      `É um app de delivery incrível que está chegando na nossa região!\n\n` +
      `${categoryName ? `Estou procurando por ${categoryName.toLowerCase()} ` : 'Procuro estabelecimentos '}` +
      `aqui perto e seria ótimo se vocês se cadastrassem.\n\n` +
      `O cadastro é super fácil: https://deliverybairro.com/pre-cadastro\n\n` +
      `Que tal dar uma olhada? 😊`;

    Alert.alert(
      'Compartilhar com Estabelecimentos 📱',
      'Copie esta mensagem para enviar aos seus estabelecimentos favoritos:',
      [
        {
          text: 'Copiar Mensagem',
          onPress: () => {
            // Em produção: Clipboard.setString(shareText);
            Alert.alert(
              'Mensagem Pronta! 📋',
              'Agora é só colar no WhatsApp, Instagram ou onde preferir!\n\n' +
              'Dica: Estabelecimentos adoram receber sugestões de clientes! 😉'
            );
          }
        },
        { text: 'Fechar' }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <FontAwesome name="map-marker" size={48} color="#FF6B35" />
        <MaterialIcons
          name="search-off"
          size={24}
          color="#FF6B35"
          style={styles.overlayIcon}
        />
      </View>

      <Text style={styles.title}>
        Ops! Ainda não temos {'\n'}
        <Text style={styles.categoryHighlight}>{categoryName}</Text> {'\n'}
        em sua região
      </Text>

      <Text style={styles.description}>
        Mas temos uma ideia! 💡{'\n\n'}
        <Text style={styles.boldText}>Que tal recomendar o DeliveryBairro</Text> para aquele seu restaurante ou estabelecimento favorito?
        {'\n\n'}
        Eles podem se cadastrar facilmente e você será um dos primeiros clientes! 🎯
      </Text>

      {isExpanded && (
        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitsTitle}>👥 Como ajudar sua região:</Text>

          <View style={styles.benefitItem}>
            <MaterialIcons name="restaurant" size={20} color="#FF6B35" />
            <Text style={styles.benefitText}>Fale com o gerente do seu restaurante favorito</Text>
          </View>

          <View style={styles.benefitItem}>
            <MaterialIcons name="share" size={20} color="#FF6B35" />
            <Text style={styles.benefitText}>Compartilhe nosso link de cadastro</Text>
          </View>

          <View style={styles.benefitItem}>
            <MaterialIcons name="favorite" size={20} color="#FF6B35" />
            <Text style={styles.benefitText}>Mostre que há demanda na região</Text>
          </View>

          <View style={styles.tipBox}>
            <Text style={styles.tipText}>
              💬 <Text style={styles.tipBold}>Dica:</Text> Estabelecimentos valorizam muito feedback de clientes!
              Sua opinião pode fazer a diferença.
            </Text>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={styles.expandButton}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Text style={styles.expandButtonText}>
          {isExpanded ? 'Ver Menos' : 'Como Posso Ajudar?'}
        </Text>
        <MaterialIcons
          name={isExpanded ? 'expand-less' : 'expand-more'}
          size={20}
          color="#FF6B35"
        />
      </TouchableOpacity>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleRecommendDeliveryBairro}
        >
          <MaterialIcons name="launch" size={20} color="white" />
          <Text style={styles.primaryButtonText}>Ir para o Site de Cadastro</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleShareApp}
        >
          <Ionicons name="share-social" size={20} color="#FF6B35" />
          <Text style={styles.secondaryButtonText}>Preparar Mensagem</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>
          🌟 Seja um embaixador do DeliveryBairro em sua região!
        </Text>
      </View>
    </View>
  );
} const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f9fafb',
  },
  iconContainer: {
    position: 'relative',
    backgroundColor: '#FFF3E8',
    padding: 24,
    borderRadius: 60,
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  overlayIcon: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 28,
  },
  categoryHighlight: {
    color: '#FF6B35',
    fontWeight: '800',
  },
  description: {
    fontSize: 16,
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  boldText: {
    fontWeight: '700',
    color: '#1f2937',
  },
  benefitsContainer: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingRight: 8,
  },
  benefitText: {
    marginLeft: 12,
    fontSize: 15,
    color: '#374151',
    lineHeight: 20,
    flex: 1,
  },
  tipBox: {
    backgroundColor: '#FFF9E6',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    marginTop: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
  },
  tipBold: {
    fontWeight: 'bold',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
    backgroundColor: '#FFF3E8',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FED7B1',
  },
  expandButtonText: {
    color: '#FF6B35',
    fontSize: 15,
    fontWeight: '600',
    marginRight: 6,
  },
  actionButtons: {
    width: '100%',
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  primaryButton: {
    backgroundColor: '#FF6B35',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  secondaryButtonText: {
    color: '#FF6B35',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footerContainer: {
    backgroundColor: '#FFF0E6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FED7B1',
  },
  footerText: {
    fontSize: 14,
    color: '#C2410C',
    textAlign: 'center',
    fontWeight: '600',
  },
});
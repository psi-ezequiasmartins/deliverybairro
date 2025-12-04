/**
 * src/components/StarRating/index.js
 * Componente para exibir avaliação em formato de estrelas
 */

import React from 'react';
import { View, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const StarRating = ({ rating, size = 16, showNumber = true, style = {} }) => {
  // Garante que o rating esteja entre 0 e 5
  const normalizedRating = Math.max(0, Math.min(5, parseFloat(rating || 0)));

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(normalizedRating);
    const hasHalfStar = normalizedRating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    // Estrelas cheias
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FontAwesome
          key={`full-${i}`}
          name="star"
          size={size}
          color="orange"
          style={{ marginHorizontal: 1 }}
        />
      );
    }

    // Estrela pela metade
    if (hasHalfStar) {
      stars.push(
        <FontAwesome
          key="half"
          name="star-half-o"
          size={size}
          color="orange"
          style={{ marginHorizontal: 1 }}
        />
      );
    }

    // Estrelas vazias
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <FontAwesome
          key={`empty-${i}`}
          name="star-o"
          size={size}
          color="orange"
          style={{ marginHorizontal: 1 }}
        />
      );
    }

    return stars;
  };

  return (
    <View style={[{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'transparent',
      paddingHorizontal: 6,
      paddingVertical: 0,
      borderRadius: 12,
      marginLeft: 'auto'
    }, style]}>
      {showNumber && (
        <Text style={{
          color: '#000',
          fontSize: 14,
          // fontWeight: 'bold',
          marginRight: 4
        }}>
          {normalizedRating.toFixed(1)}
        </Text>
      )}
      <View style={{ flexDirection: 'row' }}>
        {renderStars()}
      </View>
    </View>
  );
};

export default StarRating;
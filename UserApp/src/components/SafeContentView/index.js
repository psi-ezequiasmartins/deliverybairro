/**
 * src/components/SafeContentView/index.js
 * Componente para resolver problema de transparência do Navigation Bar Android
 */

import React from 'react';
import { View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SafeContentView({ children, style, ...props }) {
  const insets = useSafeAreaInsets();

  // Calcular padding inferior dinâmico para Android
  const bottomPadding = Platform.OS === 'android'
    ? Math.max(90, 120 + (insets.bottom > 0 ? 20 : 40)) // TabBar + Navigation Bar + margem
    : 90; // Apenas TabBar para iOS

  return (
    <View
      style={[
        {
          flex: 1,
          paddingBottom: bottomPadding,
        },
        style
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
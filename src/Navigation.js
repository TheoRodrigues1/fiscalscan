import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import EscanearScreen from './screens/EscanearScreen';
import DetalhesScreen from './screens/DetalhesScreen';

const Stack = createStackNavigator();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#6C63FF', elevation: 0, shadowOpacity: 0 },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Minhas Notas' }}
        />
        <Stack.Screen
          name="Escanear"
          component={EscanearScreen}
          options={{ title: 'Escanear Nota Fiscal' }}
        />
        <Stack.Screen
          name="Detalhes"
          component={DetalhesScreen}
          options={{ title: 'Detalhes da Compra' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

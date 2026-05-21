import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatarMoeda, formatarData } from '../utils';

export default function DetalhesScreen({ route }) {
  const { nota } = route.params;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {nota.imageUri && (
        <Image source={{ uri: nota.imageUri }} style={styles.imagem} resizeMode="cover" />
      )}

      <View style={styles.header}>
        <View style={styles.lojaRow}>
          <View style={styles.lojaIcon}>
            <Ionicons name="storefront-outline" size={22} color="#6C63FF" />
          </View>
          <View>
            <Text style={styles.lojaNome}>{nota.loja || 'Nota Fiscal'}</Text>
            <Text style={styles.data}>{formatarData(nota.data)}</Text>
          </View>
        </View>
        <Text style={styles.totalGrande}>{formatarMoeda(nota.total || 0)}</Text>
      </View>

      <Text style={styles.secTitle}>Itens comprados</Text>

      {nota.itens?.map((item, idx) => (
        <View key={idx} style={styles.itemRow}>
          <View style={styles.itemBullet}>
            <Text style={styles.itemBulletTxt}>{idx + 1}</Text>
          </View>
          <Text style={styles.itemNome} numberOfLines={2}>{item.nome}</Text>
          <Text style={styles.itemValor}>{formatarMoeda(item.valor || 0)}</Text>
        </View>
      ))}

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValor}>{formatarMoeda(nota.total || 0)}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f7' },
  imagem: { width: '100%', height: 200 },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  lojaRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  lojaIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#f0eeff', alignItems: 'center', justifyContent: 'center',
  },
  lojaNome: { fontSize: 16, fontWeight: '600', color: '#222' },
  data: { fontSize: 13, color: '#999', marginTop: 2 },
  totalGrande: { fontSize: 22, fontWeight: 'bold', color: '#6C63FF' },
  secTitle: { fontSize: 14, fontWeight: '600', color: '#999', padding: 16, paddingBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 10,
    padding: 14,
    gap: 12,
  },
  itemBullet: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#f0eeff', alignItems: 'center', justifyContent: 'center',
  },
  itemBulletTxt: { color: '#6C63FF', fontWeight: 'bold', fontSize: 12 },
  itemNome: { flex: 1, fontSize: 14, color: '#333' },
  itemValor: { fontSize: 14, fontWeight: '600', color: '#222' },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    backgroundColor: '#6C63FF', borderRadius: 14, padding: 18,
    margin: 16,
  },
  totalLabel: { fontSize: 16, fontWeight: '600', color: 'rgba(255,255,255,0.8)' },
  totalValor: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
});

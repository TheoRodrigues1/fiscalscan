import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getNotas, deleteNota } from '../storage';
import { formatarMoeda, formatarData } from '../utils';

export default function HomeScreen({ navigation }) {
  const [notas, setNotas] = useState([]);
  const [loading, setLoading] = useState(false);

  const carregar = async () => {
    setLoading(true);
    const dados = await getNotas();
    setNotas(dados);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [])
  );

  const totalGeral = notas.reduce((acc, n) => acc + (n.total || 0), 0);

  const confirmarDelete = (id) => {
    Alert.alert('Excluir nota', 'Tem certeza que deseja excluir esta nota?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          await deleteNota(id);
          carregar();
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('Detalhes', { nota: item })}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardIconWrap}>
          <Ionicons name="receipt-outline" size={22} color="#6C63FF" />
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.cardLoja} numberOfLines={1}>
            {item.loja || 'Nota Fiscal'}
          </Text>
          <Text style={styles.cardData}>{formatarData(item.data)}</Text>
        </View>
        <Text style={styles.cardTotal}>{formatarMoeda(item.total || 0)}</Text>
        <TouchableOpacity onPress={() => confirmarDelete(item.id)} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={18} color="#ff4d4d" />
        </TouchableOpacity>
      </View>
      <Text style={styles.cardItens}>
        {item.itens?.length || 0} {item.itens?.length === 1 ? 'item' : 'itens'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Resumo */}
      <View style={styles.resumo}>
        <Text style={styles.resumoLabel}>Total gasto</Text>
        <Text style={styles.resumoValor}>{formatarMoeda(totalGeral)}</Text>
        <Text style={styles.resumoSub}>
          {notas.length} {notas.length === 1 ? 'nota escaneada' : 'notas escaneadas'}
        </Text>
      </View>

      {/* Lista */}
      <FlatList
        data={notas}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={carregar} colors={['#6C63FF']} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="receipt-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Nenhuma nota escaneada ainda</Text>
            <Text style={styles.emptySub}>Toque no botão + para adicionar sua primeira nota</Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Escanear')}
        activeOpacity={0.85}
      >
        <Ionicons name="camera" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f7' },
  resumo: {
    backgroundColor: '#6C63FF',
    padding: 24,
    paddingTop: 32,
    alignItems: 'center',
  },
  resumoLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  resumoValor: { color: '#fff', fontSize: 36, fontWeight: 'bold', marginTop: 4 },
  resumoSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 4 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  cardIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f0eeff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLoja: { fontSize: 15, fontWeight: '600', color: '#222' },
  cardData: { fontSize: 12, color: '#999', marginTop: 2 },
  cardTotal: { fontSize: 16, fontWeight: 'bold', color: '#6C63FF', marginRight: 10 },
  deleteBtn: { padding: 4 },
  cardItens: { fontSize: 12, color: '#aaa', marginTop: 8 },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 16, color: '#aaa', marginTop: 16, fontWeight: '500' },
  emptySub: { fontSize: 13, color: '#ccc', marginTop: 6, textAlign: 'center' },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#6C63FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6C63FF',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
});

import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTAS_KEY = '@notafiscal:notas';

export async function getNotas() {
  try {
    const data = await AsyncStorage.getItem(NOTAS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveNota(nota) {
  try {
    const notas = await getNotas();
    notas.unshift(nota);
    await AsyncStorage.setItem(NOTAS_KEY, JSON.stringify(notas));
  } catch (e) {
    throw new Error('Erro ao salvar nota');
  }
}

export async function deleteNota(id) {
  try {
    const notas = await getNotas();
    const filtradas = notas.filter((n) => n.id !== id);
    await AsyncStorage.setItem(NOTAS_KEY, JSON.stringify(filtradas));
  } catch (e) {
    throw new Error('Erro ao deletar nota');
  }
}

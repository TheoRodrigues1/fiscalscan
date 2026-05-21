import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { parsearNotaFiscal, formatarMoeda } from '../utils';
import { saveNota } from '../storage';

// Usamos a API do Google Cloud Vision (gratuito até 1000/mês)
// ou fallback manual se não houver chave
async function extrairTextoOCR(base64Image) {
  // Tenta usar a API gratuita do OCR.space
  try {
    const formData = new FormData();
    formData.append('base64Image', `data:image/jpeg;base64,${base64Image}`);
    formData.append('language', 'por');
    formData.append('isOverlayRequired', 'false');
    formData.append('OCREngine', '2');

    const res = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: { apikey: 'K85929289788957' },
      body: formData,
    });
    const json = await res.json();
    if (json.ParsedResults && json.ParsedResults[0]) {
      return json.ParsedResults[0].ParsedText || '';
    }
    return '';
  } catch {
    return '';
  }
}

const ETAPAS = { CAMERA: 'camera', PREVIEW: 'preview', REVISAO: 'revisao' };

export default function EscanearScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [etapa, setEtapa] = useState(ETAPAS.CAMERA);
  const [imageUri, setImageUri] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [processando, setProcessando] = useState(false);
  const [itens, setItens] = useState([]);
  const [total, setTotal] = useState(0);
  const [loja, setLoja] = useState('');
  const cameraRef = useRef(null);

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, []);

  const tirarFoto = async () => {
    if (!cameraRef.current) return;
    try {
      const foto = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.8 });
      setImageUri(foto.uri);
      setImageBase64(foto.base64);
      setEtapa(ETAPAS.PREVIEW);
    } catch {
      Alert.alert('Erro', 'Não foi possível tirar a foto.');
    }
  };

  const escolherGaleria = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setImageBase64(result.assets[0].base64);
      setEtapa(ETAPAS.PREVIEW);
    }
  };

  const processarImagem = async () => {
    setProcessando(true);
    try {
      const texto = await extrairTextoOCR(imageBase64);
      if (!texto || texto.trim().length < 10) {
        Alert.alert(
          'Texto não reconhecido',
          'Não consegui ler a nota. Verifique a iluminação e tente novamente, ou adicione os itens manualmente.',
          [{ text: 'OK', onPress: () => setEtapa(ETAPAS.REVISAO) }]
        );
        setItens([]);
        setTotal(0);
        setProcessando(false);
        return;
      }
      const resultado = parsearNotaFiscal(texto);
      setItens(resultado.itens);
      setTotal(resultado.total);
      setEtapa(ETAPAS.REVISAO);
    } catch {
      Alert.alert('Erro', 'Falha ao processar a imagem.');
    }
    setProcessando(false);
  };

  const adicionarItem = () => {
    setItens([...itens, { nome: '', valor: 0 }]);
  };

  const atualizarItem = (idx, campo, valor) => {
    const novos = [...itens];
    novos[idx] = { ...novos[idx], [campo]: campo === 'valor' ? parseFloat(valor.replace(',', '.')) || 0 : valor };
    setItens(novos);
    setTotal(novos.reduce((acc, i) => acc + (i.valor || 0), 0));
  };

  const removerItem = (idx) => {
    const novos = itens.filter((_, i) => i !== idx);
    setItens(novos);
    setTotal(novos.reduce((acc, i) => acc + (i.valor || 0), 0));
  };

  const salvar = async () => {
    if (itens.length === 0) {
      Alert.alert('Atenção', 'Adicione pelo menos um item antes de salvar.');
      return;
    }
    const nota = {
      id: Date.now().toString(),
      data: new Date().toISOString(),
      loja: loja.trim() || 'Loja sem nome',
      itens,
      total: itens.reduce((acc, i) => acc + (i.valor || 0), 0),
      imageUri,
    };
    await saveNota(nota);
    Alert.alert('Salvo!', 'Nota fiscal salva com sucesso.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  // --- ETAPA: Câmera ---
  if (etapa === ETAPAS.CAMERA) {
    if (!permission) return <View style={styles.center}><ActivityIndicator /></View>;
    if (!permission.granted) {
      return (
        <View style={styles.center}>
          <Ionicons name="camera-off-outline" size={64} color="#ccc" />
          <Text style={styles.permText}>Permissão de câmera necessária</Text>
          <TouchableOpacity style={styles.btn} onPress={requestPermission}>
            <Text style={styles.btnText}>Permitir câmera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, { backgroundColor: '#eee', marginTop: 10 }]} onPress={escolherGaleria}>
            <Text style={[styles.btnText, { color: '#555' }]}>Escolher da galeria</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={{ flex: 1 }}>
        <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back">
          <View style={styles.cameraOverlay}>
            <View style={styles.cameraGuia} />
            <Text style={styles.cameraHint}>Enquadre a nota fiscal</Text>
            <View style={styles.cameraBtns}>
              <TouchableOpacity style={styles.galeriaBtn} onPress={escolherGaleria}>
                <Ionicons name="images-outline" size={28} color="#fff" />
                <Text style={styles.galeriaTxt}>Galeria</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.captureBtn} onPress={tirarFoto}>
                <View style={styles.captureBtnInner} />
              </TouchableOpacity>
              <View style={{ width: 72 }} />
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  // --- ETAPA: Preview da foto ---
  if (etapa === ETAPAS.PREVIEW) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <Image source={{ uri: imageUri }} style={{ flex: 1 }} resizeMode="contain" />
        {processando && (
          <View style={styles.processandoOverlay}>
            <ActivityIndicator size="large" color="#6C63FF" />
            <Text style={styles.processandoTxt}>Lendo nota fiscal...</Text>
          </View>
        )}
        {!processando && (
          <View style={styles.previewBtns}>
            <TouchableOpacity style={styles.previewBtnSec} onPress={() => setEtapa(ETAPAS.CAMERA)}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
              <Text style={styles.previewBtnTxt}>Refazer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.previewBtnPri} onPress={processarImagem}>
              <Ionicons name="scan" size={22} color="#fff" />
              <Text style={styles.previewBtnTxt}>Processar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  // --- ETAPA: Revisão e edição ---
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.revisao} contentContainerStyle={{ paddingBottom: 120 }}>
        <Text style={styles.revisaoTitle}>Revise os itens</Text>

        <TextInput
          style={styles.lojaInput}
          placeholder="Nome da loja / estabelecimento"
          value={loja}
          onChangeText={setLoja}
          placeholderTextColor="#aaa"
        />

        {itens.map((item, idx) => (
          <View key={idx} style={styles.itemRow}>
            <TextInput
              style={[styles.itemInput, { flex: 2 }]}
              placeholder="Nome do item"
              value={item.nome}
              onChangeText={(v) => atualizarItem(idx, 'nome', v)}
              placeholderTextColor="#bbb"
            />
            <TextInput
              style={[styles.itemInput, { flex: 1, marginLeft: 8 }]}
              placeholder="R$ 0,00"
              value={item.valor ? item.valor.toFixed(2).replace('.', ',') : ''}
              onChangeText={(v) => atualizarItem(idx, 'valor', v)}
              keyboardType="decimal-pad"
              placeholderTextColor="#bbb"
            />
            <TouchableOpacity onPress={() => removerItem(idx)} style={{ padding: 6 }}>
              <Ionicons name="close-circle" size={22} color="#ff4d4d" />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.addItemBtn} onPress={adicionarItem}>
          <Ionicons name="add-circle-outline" size={20} color="#6C63FF" />
          <Text style={styles.addItemTxt}>Adicionar item</Text>
        </TouchableOpacity>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValor}>{formatarMoeda(total)}</Text>
        </View>
      </ScrollView>

      <View style={styles.salvarBar}>
        <TouchableOpacity style={styles.salvarBtn} onPress={salvar}>
          <Ionicons name="checkmark-circle" size={22} color="#fff" />
          <Text style={styles.salvarTxt}>Salvar nota</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', padding: 24 },
  permText: { fontSize: 16, color: '#555', marginTop: 16, textAlign: 'center' },
  btn: { marginTop: 20, backgroundColor: '#6C63FF', borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 },
  btnText: { color: '#fff', fontWeight: '600' },
  // Câmera
  cameraOverlay: { flex: 1, justifyContent: 'space-between', padding: 24 },
  cameraGuia: {
    alignSelf: 'center',
    marginTop: 40,
    width: '90%',
    height: 200,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
    borderRadius: 12,
    borderStyle: 'dashed',
  },
  cameraHint: { color: 'rgba(255,255,255,0.85)', textAlign: 'center', fontSize: 14 },
  cameraBtns: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30 },
  galeriaBtn: { alignItems: 'center', width: 72 },
  galeriaTxt: { color: '#fff', fontSize: 11, marginTop: 4 },
  captureBtn: {
    width: 72, height: 72, borderRadius: 36,
    borderWidth: 4, borderColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  captureBtnInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#fff' },
  // Preview
  previewBtns: {
    position: 'absolute', bottom: 30, left: 20, right: 20,
    flexDirection: 'row', justifyContent: 'space-between',
  },
  previewBtnSec: {
    flex: 1, marginRight: 10, backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 12, padding: 14, gap: 8,
  },
  previewBtnPri: {
    flex: 1, backgroundColor: '#6C63FF',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 12, padding: 14, gap: 8,
  },
  previewBtnTxt: { color: '#fff', fontWeight: '600', fontSize: 15 },
  processandoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  processandoTxt: { color: '#fff', marginTop: 12, fontSize: 16 },
  // Revisão
  revisao: { flex: 1, backgroundColor: '#f5f5f7', padding: 16 },
  revisaoTitle: { fontSize: 20, fontWeight: 'bold', color: '#222', marginBottom: 16 },
  lojaInput: {
    backgroundColor: '#fff', borderRadius: 10, padding: 14,
    fontSize: 15, color: '#222', marginBottom: 16,
    borderWidth: 1, borderColor: '#eee',
  },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  itemInput: {
    backgroundColor: '#fff', borderRadius: 10, padding: 12,
    fontSize: 14, color: '#222', borderWidth: 1, borderColor: '#eee',
  },
  addItemBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 12, justifyContent: 'center',
  },
  addItemTxt: { color: '#6C63FF', fontWeight: '600', fontSize: 15 },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    marginTop: 16, borderWidth: 1, borderColor: '#eee',
  },
  totalLabel: { fontSize: 16, fontWeight: '600', color: '#555' },
  totalValor: { fontSize: 18, fontWeight: 'bold', color: '#6C63FF' },
  salvarBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff', padding: 16,
    borderTopWidth: 1, borderTopColor: '#eee',
  },
  salvarBtn: {
    backgroundColor: '#6C63FF', borderRadius: 14, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  salvarTxt: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

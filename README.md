# 📄 FiscalScan

App mobile desenvolvido com **React Native + Expo** para escanear notas fiscais usando a câmera do celular ou galeria de fotos. O texto é extraído via OCR e os dados (loja, itens, valores) são organizados e salvos localmente.

---

## ✨ Funcionalidades

- 📷 Captura de nota fiscal pela câmera ou galeria
- 🔍 Extração de texto via OCR (API OCR.space)
- 🧾 Identificação automática de itens e valores
- 💾 Histórico de notas salvo localmente (AsyncStorage)
- 🗑️ Exclusão de notas do histórico
- 📊 Total geral das notas escaneadas

---

## 🚀 Tecnologias

- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [expo-camera](https://docs.expo.dev/versions/latest/sdk/camera/)
- [expo-image-picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
- [React Navigation](https://reactnavigation.org/)
- [OCR.space API](https://ocr.space/)

---

## 📦 Como rodar o projeto

### Pré-requisitos

- [Node.js](https://nodejs.org/) instalado
- [Expo CLI](https://docs.expo.dev/get-started/installation/) instalado
- Aplicativo **Expo Go** no celular (Android ou iOS)

### Passos

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/fiscalscan.git

# Acesse a pasta do projeto
cd fiscalscan

# Instale as dependências
npm install

# Inicie o projeto
npx expo start
```

Escaneie o QR Code com o **Expo Go** para rodar no seu celular.

---

## 📁 Estrutura do projeto

```
notafiscal/
├── src/
│   ├── screens/
│   │   ├── HomeScreen.js       # Lista de notas escaneadas
│   │   ├── EscanearScreen.js   # Câmera + OCR + revisão
│   │   └── DetalhesScreen.js   # Detalhes de uma nota
│   ├── Navigation.js           # Configuração de rotas
│   ├── storage.js              # Funções de persistência local
│   └── utils.js                # Parser de nota fiscal e formatações
├── App.js
└── package.json
```

---

## ⚠️ Observações

- A API OCR.space possui limite gratuito de **1000 requisições/mês**.
- O reconhecimento de texto pode variar dependendo da qualidade da foto.
- Os dados são salvos **somente no dispositivo** (sem servidor ou nuvem).

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

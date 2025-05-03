import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';
import { Camera } from 'react-native-camera-kit';
import Modal from 'react-native-modal';
import { searchByBarcode } from '../services/search';

const testBarcodeData = {
  '761941335827': {
    name: 'Arrow (Season 3) Action Figure',
    notes: 'DC Collectibles. Interchangeable hands and bow.',
    photoUri: 'https://m.media-amazon.com/images/I/81zbrdYfXJL._AC_SL1500_.jpg'
  },
  '630509252743': {
    name: 'Marvel Legends Spider-Man',
    notes: 'Hasbro. Includes web accessories and alternate hands.',
    photoUri: 'https://m.media-amazon.com/images/I/91fXzBC+2QL._AC_SL1500_.jpg'
  },
  '0887961802285': {
    name: 'He-Man Masters of the Universe Origins',
    notes: 'Mattel. Vintage styling with modern articulation.',
    photoUri: 'https://m.media-amazon.com/images/I/71iMTVRvN9L._AC_SL1500_.jpg'
  }
};


export default function BarcodeScannerScreen() {
  const [scannedBarcode, setScannedBarcode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [isEmulator, setIsEmulator] = useState(false);
  const [testBarcode, setTestBarcode] = useState('');
  const navigation = useNavigation();

  const [selectedTestBarcode, setSelectedTestBarcode] = useState('');
  const [dropdownVisible, setDropdownVisible] = useState(false);


  useEffect(() => {
    DeviceInfo.isEmulator().then(setIsEmulator);
  }, []);

  const onBarcodeRead = async (event) => {
    const barcode = event.nativeEvent.codeStringValue;
    if (barcode && !scannedBarcode) {
      setScannedBarcode(barcode);
      setLoading(true);
      const searchResults = await searchByBarcode(barcode);
      console.log('✅ Results:', searchResults);
      setResults(searchResults);
      setLoading(false);
    }
  };

  const handleSelectResult = (result) => {
    navigation.navigate('AddEdit', {
      prefill: {
        name: result.title,
        notes: result.description,
        photoUri: result.image || ''
      }
    });
  };

  const handleTestLookup = async () => {
    if (!testBarcode.trim()) return;
    setScannedBarcode(testBarcode);
    setLoading(true);
    const searchResults = await searchByBarcode(testBarcode);
    console.log('✅ Results:', searchResults);
    setResults(searchResults);
    setLoading(false);
  };

  const handleTestSearch = async (barcode) => {
    setScannedBarcode(barcode);
    setLoading(true);
    const searchResults = await searchByBarcode(barcode);
    setResults(searchResults);
    setLoading(false);
  };

  const resetScanner = () => {
    setScannedBarcode(null);
    setResults([]);
    setTestBarcode('');
  };

  // 📱 Camera Mode
  if (!isEmulator && !scannedBarcode) {
    return (
      <Camera
        scanBarcode={true}
        onReadCode={onBarcodeRead}
        showFrame={true}
        laserColor="red"
        frameColor="white"
        style={{ flex: 1 }}
      />
    );
  }

  // 💻 Test Mode for Simulator
  if (isEmulator && !scannedBarcode) {
    return (
      <View style={{ marginTop: 20, paddingHorizontal: 16 }}>
      <Text style={{ marginBottom: 8 }}>Simulate Test Barcode:</Text>
  
      <TouchableOpacity
        onPress={() => setDropdownVisible(true)}
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 6,
          padding: 12,
          backgroundColor: '#f8f8f8',
        }}
      >
        <Text>{selectedTestBarcode ? `${selectedTestBarcode} - ${testBarcodeData[selectedTestBarcode].name}` : 'Select a test barcode...'}</Text>
      </TouchableOpacity>
  
      <Modal isVisible={dropdownVisible} onBackdropPress={() => setDropdownVisible(false)}>
        <View style={{ backgroundColor: '#fff', borderRadius: 10, padding: 10 }}>
          <FlatList
            data={Object.entries(testBarcodeData)}
            keyExtractor={([code]) => code}
            renderItem={({ item: [code, figure] }) => (
              <TouchableOpacity
                onPress={() => {
                  setSelectedTestBarcode(code);
                  setDropdownVisible(false);
                  //navigation.navigate('AddEdit', { prefill: figure });
                  setSelectedTestBarcode(code);
                  setDropdownVisible(false);
                  handleTestSearch(code);
                }}
                style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}
              >
                <Image
                  source={{ uri: figure.photoUri }}
                  style={{ width: 50, height: 50, borderRadius: 6, marginRight: 10 }}
                />
                <Text style={{ flexShrink: 1 }}>{`${code} - ${figure.name}`}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
    );
  }

  // 🔍 Results View
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Search Results for: {scannedBarcode}</Text>
      {loading && <ActivityIndicator size="large" color="#007AFF" />}

      {!loading && results.length === 0 && (
        <Text style={{ textAlign: 'center', marginTop: 20 }}>No results found.</Text>
      )}

      <FlatList
        data={results}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => handleSelectResult(item)}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.image} />
            ) : null}
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity onPress={resetScanner} style={styles.resetButton}>
        <Text style={styles.resetButtonText}>Scan Again</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  heading: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  card: { marginBottom: 16, backgroundColor: '#f2f2f2', padding: 12, borderRadius: 8 },
  image: { width: '100%', height: 160, borderRadius: 8, marginBottom: 8 },
  title: { fontSize: 16, fontWeight: 'bold' },
  description: { fontSize: 14, color: '#555' },
  testContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  testHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    width: '100%',
    borderRadius: 6,
    marginBottom: 12,
  },
  testButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 6,
  },
  testButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resetButton: {
    backgroundColor: '#eee',
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 20,
  },
  resetButtonText: {
    textAlign: 'center',
    color: '#007AFF',
    fontWeight: 'bold',
  },
});

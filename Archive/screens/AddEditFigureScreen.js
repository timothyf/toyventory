import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  Image,
  Alert,
  ScrollView,
  Dimensions,
  Platform,
  UIManager,
  LayoutAnimation
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import DeviceInfo from 'react-native-device-info';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  fetchFigureById,
  insertFigure,
  updateFigure,
  deleteFigure,
} from '../services/db';

const screenWidth = Dimensions.get('window').width;
const packagingOptions = ['Bag', 'Box', 'Loose', 'On Card'];
const countries = ['USA', 'Japan', 'China', 'Germany', 'Mexico', 'UK', 'Canada', 'Italy', 'France', 'Brazil'];

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function levenshtein(a, b) {
  const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]).map((row, i) =>
    row.concat(Array.from({ length: a.length }, (_, j) => j === 0 ? i : 0))
  );

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

function extractFieldsFromText(name = '', notes = '') {
  const combined = `${name} ${notes}`.toLowerCase();

  // Year
  const yearMatch = combined.match(/\b(19|20)\d{2}\b/);
  const year = yearMatch ? yearMatch[0] : '';

  // Manufacturer (fuzzy)
  const knownBrands = [
    'DC Collectibles', 'Hasbro', 'Mattel', 'Kenner', 'NECA', 'Mcfarlane',
    'Bandai', 'Jakks', 'Funko', 'Super7', 'Diamond Select', 'Hot Toys',
    'Sideshow', 'Kotobukiya', 'Playmates', 'Revoltech', 'Figma'
  ];

  let manufacturer = '';
  let bestDistance = Infinity;
  const words = combined.split(/\W+/);

  for (const brand of knownBrands) {
    const regex = new RegExp(`\\b${brand}\\b`, 'i');
    if (regex.test(combined)) {
      manufacturer = brand;
      break;
    }

    for (const word of words) {
      const dist = levenshtein(brand.toLowerCase(), word);
      if (dist < bestDistance && dist <= 2) {
        manufacturer = brand;
        bestDistance = dist;
      }
    }
  }

  // Theme (franchise/license)
  const knownThemes = ['star wars', 'marvel', 'dc', 'he-man', 'gi joe', 'transformers', 'tmnt', 'lord of the rings', 'spawn', 'fortnite'];
  const themeMatch = knownThemes.find(theme => combined.includes(theme));
  const theme = themeMatch ? themeMatch.replace(/\b\w/g, c => c.toUpperCase()) : '';

  // Size
  const sizeMatch = combined.match(/(\d{1,2}(?:\.\d{1,2})?)["”]?\s*(inch|in)?/i);
  const size = sizeMatch ? `${sizeMatch[1]}"` : '';

  // Packaging
  let packaging = '';
  if (/on card|carded/.test(combined)) packaging = 'On Card';
  else if (/box/.test(combined)) packaging = 'Box';
  else if (/bagged|bag/.test(combined)) packaging = 'Bag';
  else if (/loose/.test(combined)) packaging = 'Loose';

  // Country
  const knownCountries = ['usa', 'japan', 'china', 'germany', 'mexico', 'canada', 'uk', 'italy', 'korea'];
  const countryMatch = knownCountries.find(c => combined.includes(`made in ${c}`) || combined.includes(`${c} edition`));
  const country = countryMatch ? countryMatch.charAt(0).toUpperCase() + countryMatch.slice(1) : '';

  // Release date
  const releaseMatch = combined.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(20\d{2})/i) ||
                        combined.match(/\b(0?[1-9]|1[0-2])[\/\-](20\d{2})\b/);
  const release_date = releaseMatch
    ? releaseMatch.length === 3
      ? `${releaseMatch[1]} ${releaseMatch[2]}`
      : releaseMatch[0]
    : '';

  return {
    year,
    manufacturer,
    theme,
    size,
    packaging,
    country,
    release_date
  };
}




export default function AddEditFigureScreen({ navigation, route }) {
  const editingFigureId = route?.params?.id;

  const [formData, setFormData] = useState({
    name: '',
    series: '',
    year: '',
    manufacturer: '',
    purchasePrice: '',
    notes: '',
    photoUri: '',
    description: '',
    theme: '',
    country: '',
    size: '',
    releaseDate: '',
    asstNumber: '',
    modelNumber: '',
    packaging: '',
    quantity: ''
  });

  const [isEmulator, setIsEmulator] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({
    basic: false,
    additional: true,
    packaging: true,
  });

  const toggleSection = (key) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCollapsedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    DeviceInfo.isEmulator().then(setIsEmulator);
  }, []);

  useEffect(() => {
    navigation.setOptions({ title: editingFigureId ? 'Edit Figure' : 'Add New Figure' });
  
    // Prefill for new figures from search/barcode
    if (!editingFigureId && route.params?.prefill) {
      const { name, notes, photoUri } = route.params.prefill;
      const extracted = extractFieldsFromText(name, notes);

      
      setFormData(prev => ({
        ...prev,
        name: name || '',
        notes: notes || '',
        photoUri: photoUri || '',
        year: extracted.year,
        manufacturer: extracted.manufacturer,
        theme: extracted.theme,
        size: extracted.size,
        country: extracted.country,
        release_date: extracted.release_date,
      }));


    }
  
    // Load for editing
    if (editingFigureId) {
      fetchFigureById(editingFigureId)
        .then((figure) => {
          if (!figure) {
            console.log('No figure found for editing');
            navigation.goBack();
            return;
          }
          setFormData({
            name: figure.name || '',
            series: figure.series || '',
            year: figure.year?.toString() || '',
            manufacturer: figure.manufacturer || '',
            purchasePrice: figure.purchase_price?.toString() || '',
            notes: figure.notes || '',
            photoUri: figure.photo_uri || '',
            description: figure.description || '',
            theme: figure.theme || '',
            country: figure.country || '',
            size: figure.size || '',
            release_date: figure.release_date || '',
            asst_number: figure.asst_number || '',
            model_number: figure.model_number || '',
            packaging: figure.packaging || '',
            quantity: figure.quantity?.toString() || '',
          });
        })
        .catch((err) => {
          console.error('Error loading figure:', err);
        });
    }
  }, [editingFigureId, navigation, route.params]);
  

  const pickImage = async () => {
    try {
      const result = await ImagePicker.openPicker({
        width: 800, height: 800, cropping: true, compressImageQuality: 0.8, mediaType: 'photo',
      });
      if (result?.path) {
        setFormData(prev => ({ ...prev, photoUri: result.path }));
      }
    } catch (error) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Error', 'Failed to pick image');
      }
    }
  };

  const takePhoto = async () => {
    if (Platform.OS === 'ios' && isEmulator) {
      Alert.alert('Emulator Warning', 'Taking photos is not supported.');
      setFormData(prev => ({ ...prev, photoUri: 'https://placecats.com/800/800' }));
      return;
    }
    try {
      const result = await ImagePicker.openCamera({
        width: 800, height: 800, cropping: true, compressImageQuality: 0.8, mediaType: 'photo',
      });
      if (result?.path) {
        setFormData(prev => ({ ...prev, photoUri: result.path }));
      }
    } catch (error) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Error', 'Failed to take photo');
      }
    }
  };

  const handleSave = async () => {
    try {
      const data = {
        ...formData,
        year: parseInt(formData.year) || null,
        purchasePrice: parseFloat(formData.purchasePrice) || null,
        quantity: parseInt(formData.quantity) || null,
      };

      if (editingFigureId) {
        await updateFigure(editingFigureId, ...Object.values(data));
      } else {
        await insertFigure(...Object.values(data));
      }

      Alert.alert('Success', 'Figure saved!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Save Error', 'There was an error saving the figure.');
    }
  };

  const handleDelete = async () => {
    await deleteFigure(editingFigureId);
    Alert.alert('Deleted', 'Figure deleted!');
    navigation.goBack();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => toggleSection('basic')}>
        <Text style={styles.sectionToggle}>▶ Basic Info</Text>
      </TouchableOpacity>
      {!collapsedSections.basic && (
        <>
          <Text>Name *</Text>
          <TextInput style={styles.input} value={formData.name} onChangeText={text => setFormData({ ...formData, name: text })} />
          <Text>Series</Text>
          <TextInput style={styles.input} value={formData.series} onChangeText={text => setFormData({ ...formData, series: text })} />
          <Text>Year</Text>
          <TextInput style={styles.input} value={formData.year} onChangeText={text => setFormData({ ...formData, year: text })} keyboardType="numeric" />
          <Text>Manufacturer</Text>
          <TextInput style={styles.input} value={formData.manufacturer} onChangeText={text => setFormData({ ...formData, manufacturer: text })} />
          <Text>Purchase Price</Text>
          <TextInput style={styles.input} value={formData.purchasePrice} onChangeText={text => setFormData({ ...formData, purchasePrice: text })} keyboardType="numeric" />
          <Text>Notes</Text>
          <TextInput style={styles.input} value={formData.notes} onChangeText={text => setFormData({ ...formData, notes: text })} />
        </>
      )}

      <TouchableOpacity onPress={() => toggleSection('additional')}>
        <Text style={styles.sectionToggle}>▶ Additional Info</Text>
      </TouchableOpacity>
      {!collapsedSections.additional && (
        <>
          <Text>Description</Text>
          <TextInput style={styles.input} value={formData.description} onChangeText={text => setFormData({ ...formData, description: text })} />
          <Text>Theme</Text>
          <TextInput style={styles.input} value={formData.theme} onChangeText={text => setFormData({ ...formData, theme: text })} />
          <Text>Country</Text>
          <Picker selectedValue={formData.country} onValueChange={val => setFormData({ ...formData, country: val })}>
            <Picker.Item label="Select a country" value="" />
            {countries.map(c => <Picker.Item key={c} label={c} value={c} />)}
          </Picker>
          <Text>Size</Text>
          <TextInput style={styles.input} value={formData.size} onChangeText={text => setFormData({ ...formData, size: text })} />
          <Text>Release Date</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
            <Text>{formData.releaseDate || 'Select a date'}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              mode="date"
              display="default"
              value={formData.releaseDate ? new Date(formData.releaseDate) : new Date()}
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) setFormData(prev => ({ ...prev, releaseDate: date.toISOString().split('T')[0] }));
              }}
            />
          )}
        </>
      )}

      <TouchableOpacity onPress={() => toggleSection('packaging')}>
        <Text style={styles.sectionToggle}>▶ Packaging Info</Text>
      </TouchableOpacity>
      {!collapsedSections.packaging && (
        <>
          <Text>Asst. Number</Text>
          <TextInput style={styles.input} value={formData.asstNumber} onChangeText={text => setFormData({ ...formData, asstNumber: text })} />
          <Text>Model Number</Text>
          <TextInput style={styles.input} value={formData.modelNumber} onChangeText={text => setFormData({ ...formData, modelNumber: text })} />
          <Text>Packaging</Text>
          <Picker selectedValue={formData.packaging} onValueChange={val => setFormData({ ...formData, packaging: val })}>
            <Picker.Item label="Select packaging" value="" />
            {packagingOptions.map(opt => <Picker.Item key={opt} label={opt} value={opt} />)}
          </Picker>
          <Text>Quantity</Text>
          <TextInput style={styles.input} value={formData.quantity} onChangeText={text => setFormData({ ...formData, quantity: text })} keyboardType="numeric" />
        </>
      )}

      <Text style={styles.sectionLabel}>Figure Photo</Text>
      <View style={styles.photoContainer}>
        {formData.photoUri ? (
          <TouchableOpacity onPress={pickImage}>
            <Image source={{ uri: formData.photoUri }} style={styles.photo} />
            <Text style={styles.photoHint}>Tap image to change</Text>
          </TouchableOpacity>
        ) : <Text style={styles.photoHint}>No photo selected</Text>}

        <View style={styles.photoActions}>
          <TouchableOpacity onPress={pickImage} style={styles.actionButton}><Text style={styles.actionButtonText}>Pick Photo</Text></TouchableOpacity>
          <TouchableOpacity onPress={takePhoto} style={styles.actionButton}><Text style={styles.actionButtonText}>Take Photo</Text></TouchableOpacity>
          {formData.photoUri && (
            <TouchableOpacity onPress={() => setFormData(prev => ({ ...prev, photoUri: '' }))} style={styles.removeButton}>
              <Text style={styles.removeButtonText}>Remove Photo</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <TouchableOpacity
        onPress={handleSave}
        style={[styles.saveButton, !formData.name.trim() && { opacity: 0.5 }]}
        disabled={!formData.name.trim()}
      >
        <Text style={styles.saveButtonText}>Save Figure</Text>
      </TouchableOpacity>

      {editingFigureId && (
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Text style={styles.deleteButtonText}>Delete Figure</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#fff' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 6 },
  sectionToggle: { fontWeight: 'bold', fontSize: 16, paddingVertical: 10 },
  sectionLabel: { marginTop: 20, marginBottom: 10, fontWeight: 'bold', fontSize: 16 },
  photoContainer: { alignItems: 'center' },
  photo: { width: screenWidth * 0.8, height: screenWidth * 0.8, borderRadius: 8 },
  photoHint: { marginTop: 6, color: '#777' },
  photoActions: { marginTop: 12 },
  actionButton: { backgroundColor: '#007AFF', padding: 10, borderRadius: 6, marginVertical: 4 },
  actionButtonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
  removeButton: { backgroundColor: '#eee', padding: 10, borderRadius: 6, marginTop: 4 },
  removeButtonText: { color: '#D11A2A', fontWeight: 'bold', textAlign: 'center' },
  saveButton: { backgroundColor: '#28A745', padding: 14, borderRadius: 8, marginTop: 20 },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, textAlign: 'center' },
  deleteButton: { backgroundColor: '#D11A2A', padding: 14, borderRadius: 8, marginTop: 10 },
  deleteButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, textAlign: 'center' },
});

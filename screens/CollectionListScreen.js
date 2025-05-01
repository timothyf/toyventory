import React, { useEffect, useState, useLayoutEffect } from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  TextInput,
  Platform,
  Modal
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { fetchFigures, deleteFigure } from '../services/db';

export default function CollectionListScreen() {
  const [figures, setFigures] = useState([]);
  const [filteredFigures, setFilteredFigures] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('name');
  const [sortModalVisible, setSortModalVisible] = useState(false);

  const navigation = useNavigation();

  const loadFigures = async () => {
    const data = await fetchFigures();
    const sorted = applySort(data, sortOrder);
    setFigures(sorted);
    filterFigures(sorted, searchQuery);
  };

  const applySort = (data, order) => {
    switch (order) {
      case 'year':
        return [...data].sort((a, b) => (b.year || 0) - (a.year || 0));
      case 'price':
        return [...data].sort((a, b) => (a.purchase_price || 0) - (b.purchase_price || 0));
      case 'name':
      default:
        return [...data].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }
  };

  const filterFigures = (data, query) => {
    if (!query) {
      setFilteredFigures(data);
    } else {
      const lowerQuery = query.toLowerCase();
      const filtered = data.filter(f =>
        (f.name && f.name.toLowerCase().includes(lowerQuery)) ||
        (f.series && f.series.toLowerCase().includes(lowerQuery)) ||
        (f.manufacturer && f.manufacturer.toLowerCase().includes(lowerQuery))
      );
      setFilteredFigures(filtered);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadFigures);
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    loadFigures();
  }, [sortOrder]);

  useEffect(() => {
    filterFigures(figures, searchQuery);
  }, [searchQuery, figures]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={() => setSortModalVisible(true)} style={styles.sortButton}>
          <Ionicons name="filter" size={24} color="black" />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity onPress={() => navigation.navigate('BarcodeScanner')} style={{ marginRight: 12 }}>
            <Ionicons name="barcode-outline" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.headerIcon}>
            <Ionicons name="settings-outline" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('AddEdit')} style={styles.headerIcon}>
            <Ionicons name="add" size={26} color="black" />
          </TouchableOpacity>
        </View>
      )
    });
  }, [navigation]);

  const confirmDelete = (id) => {
    Alert.alert('Delete Figure', 'Are you sure you want to delete this figure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteFigure(id);
          loadFigures();
        },
      },
    ]);
  };

  const renderItem = ({ item }) => {
    if (!item || !item.id) return null;

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('AddEdit', { id: item.id })}
        onLongPress={() => confirmDelete(item.id)}
      >
        <View style={styles.item}>
          {item.photo_uri ? (
            <Image source={{ uri: item.photo_uri }} style={styles.thumbnail} />
          ) : null}
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>{item.manufacturer} • {item.year}</Text>
          </View>
          <TouchableOpacity onPress={() => confirmDelete(item.id)}>
            <Ionicons name="trash-outline" size={24} color="red" style={styles.deleteIcon} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        ListHeaderComponent={
          <View style={{ paddingHorizontal: 16 }}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, series, or manufacturer"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        }
        data={filteredFigures}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />

      {/* Sort Modal */}
      <Modal
        visible={sortModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSortModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setSortModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sort By</Text>
            {['name', 'year', 'price'].map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => {
                  setSortOrder(option);
                  setSortModalVisible(false);
                }}
                style={[
                  styles.modalOption,
                  sortOrder === option && styles.modalOptionActive
                ]}
              >
                <Text style={styles.modalOptionText}>{option.charAt(0).toUpperCase() + option.slice(1)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
    backgroundColor: '#fff',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  thumbnail: {
    width: 60,
    height: 60,
    marginRight: 12,
    borderRadius: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  meta: {
    fontSize: 14,
    color: '#666',
  },
  deleteIcon: {
    marginLeft: 12,
  },
  headerIcon: {
    marginRight: 16,
    paddingHorizontal: 4,
  },
  searchInput: {
    padding: 10,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  sortButton: {
    marginLeft: 16,
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 60,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContent: {
    marginHorizontal: 32,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 12,
  },
  modalOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  modalOptionActive: {
    backgroundColor: '#eee',
  },
  modalOptionText: {
    fontSize: 16,
  },
});

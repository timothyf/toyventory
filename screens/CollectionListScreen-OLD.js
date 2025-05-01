import React, { useEffect, useState, useLayoutEffect } from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { fetchFigures, deleteFigure } from '../services/db';

export default function CollectionListScreen() {
  const [figures, setFigures] = useState([]);
  const navigation = useNavigation();

  const loadFigures = async () => {
    const data = await fetchFigures();
    setFigures(data);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadFigures);
    return unsubscribe;
  }, [navigation]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.headerIcon}>
            <Ionicons name="settings-outline" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('AddEdit')} style={styles.headerIcon}>
            <Ionicons name="add" size={26} color="black" />
          </TouchableOpacity>
        </View>
      ),
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
    <FlatList
      data={figures}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
    />
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
  addButton: {
    marginRight: 16,
  },
  headerIcon: {
    marginRight: 16,
    paddingHorizontal: 4,
  },
});

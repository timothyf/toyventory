// screens/FigureDetailsScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { fetchFigureById } from '../services/db';

export default function FigureDetailsScreen() {
  const [figure, setFigure] = useState(null);
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params;

  useEffect(() => {
    navigation.setOptions({
      title: 'Figure Details',
      headerRight: () => (
        <Text
          onPress={() => navigation.navigate('AddEdit', { id })}
          style={styles.editLink}
        >
          Edit
        </Text>
      ),
    });

    fetchFigureById(id).then(setFigure);
  }, [id, navigation]);

  if (!figure) {
    return (
      <View style={styles.centered}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {figure.photo_uri ? (
        <Image source={{ uri: figure.photo_uri }} style={styles.image} />
      ) : null}
      <Text style={styles.name}>{figure.name}</Text>
      <Text style={styles.meta}>{figure.series} • {figure.year}</Text>

      <View style={styles.detailGroup}>
        <Detail label="Manufacturer" value={figure.manufacturer} />
        <Detail label="Purchase Price" value={`$${figure.purchase_price || ''}`} />
        <Detail label="Country" value={figure.country} />
        <Detail label="Size" value={figure.size} />
        <Detail label="Packaging" value={figure.packaging} />
        <Detail label="Quantity" value={figure.quantity?.toString()} />
        <Detail label="Release Date" value={figure.release_date} />
        <Detail label="Asst. Number" value={figure.asst_number} />
        <Detail label="Model Number" value={figure.model_number} />
        <Detail label="Theme" value={figure.theme} />
        <Detail label="Description" value={figure.description} />
        <Detail label="Notes" value={figure.notes} />
      </View>
    </ScrollView>
  );
}

function Detail({ label, value }) {
  if (!value) return null;
  return (
    <View style={styles.detailRow}>
      <Text style={styles.label}>{label}:</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: 300, borderRadius: 12, marginBottom: 16 },
  name: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  meta: { fontSize: 16, color: '#666', marginBottom: 20 },
  detailGroup: { marginTop: 10 },
  detailRow: { marginBottom: 10 },
  label: { fontWeight: 'bold', color: '#444' },
  value: { marginTop: 2, color: '#333' },
  editLink: {
    marginRight: 16,
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

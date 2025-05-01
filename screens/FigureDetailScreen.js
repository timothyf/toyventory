// FigureDetailScreen.js (patched)
import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { fetchFigureById } from '../services/db';

export default function FigureDetailScreen({ route }) {
  const { id } = route.params;
  const [figure, setFigure] = useState(null);

  useEffect(() => {
    if (!id) return;
    fetchFigureById(id).then(data => {
      if (data) {
        setFigure(data);
      } else {
        console.warn('No figure found with id:', id);
      }
    }).catch(err => {
      console.error('Error fetching figure:', err);
    });
  }, [id]);

  if (!figure) {
    return (
      <View style={styles.container}>
        <Text>Loading figure...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {figure.photo_uri ? (
        <Image source={{ uri: figure.photo_uri }} style={styles.image} />
      ) : null}
      <Text style={styles.title}>{figure.name}</Text>
      <Text style={styles.meta}>{figure.manufacturer} • {figure.year}</Text>
      <Text style={styles.description}>{figure.notes || 'No description available.'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  meta: { fontSize: 16, color: '#666', marginBottom: 12 },
  description: { fontSize: 16 },
  image: { width: '100%', height: 250, borderRadius: 8, marginBottom: 16 },
});

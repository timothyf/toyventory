import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

export default function PriceLookupScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);

  const handleSearch = () => {
    // Mock price lookup result
    setResults({
      averagePrice: '$42.50',
      minPrice: '$30.00',
      maxPrice: '$65.00',
      lastSold: 'April 20, 2025'
    });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter figure name"
        value={query}
        onChangeText={setQuery}
      />
      <Button title="Search eBay" onPress={handleSearch} />

      {results && (
        <View style={styles.results}>
          <Text style={styles.label}>Average Price: {results.averagePrice}</Text>
          <Text style={styles.label}>Range: {results.minPrice} - {results.maxPrice}</Text>
          <Text style={styles.label}>Last Sold: {results.lastSold}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  results: {
    marginTop: 24,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
});

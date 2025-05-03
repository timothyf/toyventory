import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { fetchFigures } from '../services/db';

export default function StatsScreen() {
  const [stats, setStats] = useState({
    total: 0,
    totalPrice: 0,
    avgPrice: 0,
    mostCommonMaker: '',
    mostCommonSeries: '',
    minYear: null,
    maxYear: null,
  });

  useEffect(() => {
    const loadStats = async () => {
      const figures = await fetchFigures();
      if (!figures || figures.length === 0) return;

      const total = figures.length;
      const totalPrice = figures.reduce((sum, f) => sum + (f.purchase_price || 0), 0);
      const avgPrice = totalPrice / total;

      const makerCount = {};
      const seriesCount = {};
      let minYear = null;
      let maxYear = null;

      figures.forEach(f => {
        if (f.manufacturer) {
          makerCount[f.manufacturer] = (makerCount[f.manufacturer] || 0) + 1;
        }
        if (f.series) {
          seriesCount[f.series] = (seriesCount[f.series] || 0) + 1;
        }
        if (f.year) {
          minYear = minYear === null ? f.year : Math.min(minYear, f.year);
          maxYear = maxYear === null ? f.year : Math.max(maxYear, f.year);
        }
      });

      const mostCommonMaker = Object.entries(makerCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
      const mostCommonSeries = Object.entries(seriesCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '';

      setStats({
        total,
        totalPrice,
        avgPrice,
        mostCommonMaker,
        mostCommonSeries,
        minYear,
        maxYear,
      });
    };

    loadStats();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Collection Stats</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Total Figures</Text>
        <Text style={styles.value}>{stats.total}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Total Value</Text>
        <Text style={styles.value}>${stats.totalPrice.toFixed(2)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Average Price</Text>
        <Text style={styles.value}>${stats.avgPrice.toFixed(2)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Most Common Manufacturer</Text>
        <Text style={styles.value}>{stats.mostCommonMaker}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Most Common Series</Text>
        <Text style={styles.value}>{stats.mostCommonSeries}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Figure Years</Text>
        <Text style={styles.value}>{stats.minYear} – {stats.maxYear}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
});

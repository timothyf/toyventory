import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import RNFS from 'react-native-fs';
import DocumentPicker from 'react-native-document-picker';
import Share from 'react-native-share';
import { fetchFigures, bulkInsertFigures } from '../services/db';
import { resetDatabase } from '../services/db';

export default function SettingsScreen() {
    const exportToJson = async () => {
        try {
          console.log('[Export] Fetching figures...');
          const figures = await fetchFigures();
      
          console.log('[Export] Serializing JSON...');
          const json = JSON.stringify(figures, null, 2);
      
          const path = `${RNFS.TemporaryDirectoryPath}figures-export.json`;
          console.log('[Export] Writing file to:', path);
      
          await RNFS.writeFile(path, json, 'utf8');
          const exists = await RNFS.exists(path);
          console.log('[Export] File written:', exists);
      
          if (!exists) throw new Error('File was not created');
      
          console.log('[Export] Sharing file...');
          await Share.open({
            title: 'Exported Figures',
            url: 'file://' + path,
            type: 'application/json',
            failOnCancel: false,
          });
      
          console.log('[Export] Share completed.');
        } catch (err) {
          console.error('[Export Error]', err);
          Alert.alert('Export Failed', err.message || 'An error occurred while exporting.');
        }
      };
      

  const importFromJson = async () => {
    try {
      const res = await DocumentPicker.pickSingle({
        type: Platform.OS === 'ios' ? 'public.item' : ['application/json'],
      });
      const contents = await RNFS.readFile(res.uri, 'utf8');
      const data = JSON.parse(contents);
      await bulkInsertFigures(data);
      Alert.alert('Import Complete', `${data.length} figures added.`);
    } catch (err) {
      console.error('Import error:', err);
      Alert.alert('Import Failed', 'Could not import the file.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Settings</Text>

      <TouchableOpacity style={styles.button} onPress={exportToJson}>
        <Text style={styles.buttonText}>Export Collection to JSON</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={importFromJson}>
        <Text style={styles.buttonText}>Import Collection from JSON</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.resetButton}
        onPress={() => {
            Alert.alert('Confirm Reset', 'This will delete all local data.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Reset',
                style: 'destructive',
                onPress: async () => {
                try {
                    await resetDatabase();
                    Alert.alert('Reset Complete', 'Local database has been cleared.');
                } catch (err) {
                    console.error('Reset failed:', err);
                    Alert.alert('Error', 'Failed to reset the database.');
                }
                },
            },
            ]);
            }}
            >
            <Text style={styles.resetText}>Reset Local Database</Text>
        </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  button: {
    padding: 16,
    marginVertical: 10,
    backgroundColor: '#007AFF',
    borderRadius: 6,
  },
  buttonText: { color: '#fff', fontSize: 16, textAlign: 'center' },
  resetButton: {
    backgroundColor: '#D11A2A',
    padding: 14,
    borderRadius: 8,
    marginTop: 30,
  },
  resetText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

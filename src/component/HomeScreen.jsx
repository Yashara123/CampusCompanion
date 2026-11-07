import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function HomeScreen() { // Screen name eka anith ewata wenas karanna (CoursesScreen, wage)
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Dashboard / Home Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' },
  text: { fontSize: 20, fontWeight: 'bold' }
});
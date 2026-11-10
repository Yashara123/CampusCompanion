import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { getAppData, saveAppData } from '../services/storage';

export default function AddTaskScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleAddTask = async () => {
    if (!title.trim() || !courseCode.trim() || !dueDate.trim()) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    try {
      const data = await getAppData();
      
      const newTask = {
        id: Date.now().toString(),
        title: title.trim(),
        courseCode: courseCode.trim().toUpperCase(),
        dueDate: dueDate.trim(),
        status: 'Pending',
      };

      data.assignments.push(newTask);
      await saveAppData(data);

      Alert.alert('Success', 'Assignment added successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save the assignment.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Add New Assignment</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Assignment Title</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Mobile App UI Prototype"
          value={title}
          onChangeText={setTitle}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Course Code</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., ICT3112"
          value={courseCode}
          onChangeText={setCourseCode}
          autoCapitalize="characters"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Due Date</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Nov 20, 2026"
          value={dueDate}
          onChangeText={setDueDate}
        />
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleAddTask}>
        <Text style={styles.submitButtonText}>Save Assignment</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 16 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#495057', marginBottom: 6 },
  input: { backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', fontSize: 15 },
  submitButton: { backgroundColor: '#007AFF', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
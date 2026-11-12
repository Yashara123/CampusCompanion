import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { getAppData, saveAppData } from '../services/storage';
import { ThemeContext } from '../../App';

export default function AddTaskScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('Medium');
  const { isDark } = useContext(ThemeContext);

  const handleSave = async () => {
    if (!title.trim() || !courseCode.trim() || !dueDate.trim()) {
      Alert.alert('Missing Fields', 'Please fill out Title, Course Code, and Due Date!');
      return;
    }

    const data = await getAppData();
    const newAssignment = {
      id: Date.now().toString(),
      title: title.trim(),
      courseCode: courseCode.trim().toUpperCase(),
      dueDate: dueDate.trim(),
      priority,
      status: 'Pending',
    };

    data.assignments.unshift(newAssignment);
    await saveAppData(data);

    Alert.alert('Success', 'New assignment added!');
    setTitle('');
    setCourseCode('');
    setDueDate('');
    setPriority('Medium');
    navigation.navigate('Assignments');
  };

  const bg = isDark ? '#111827' : '#f4f6f9';
  const cardBg = isDark ? '#1f2937' : '#ffffff';
  const textColor = isDark ? '#f9fafb' : '#1f2937';
  const subText = isDark ? '#9ca3af' : '#4b5563';

  return (
    <ScrollView style={[styles.container, { backgroundColor: bg }]}>
      <Text style={[styles.headerTitle, { color: textColor }]}>Create New ICA / Task</Text>

      <Text style={[styles.label, { color: subText }]}>Assignment Title</Text>
      <TextInput 
        style={[styles.input, { backgroundColor: cardBg, color: textColor, borderColor: isDark ? '#374151' : '#d1d5db' }]} 
        placeholder="e.g., Mobile App Prototype" 
        placeholderTextColor="#9ca3af"
        value={title} 
        onChangeText={setTitle} 
      />

      <Text style={[styles.label, { color: subText }]}>Course Code</Text>
      <TextInput 
        style={[styles.input, { backgroundColor: cardBg, color: textColor, borderColor: isDark ? '#374151' : '#d1d5db' }]} 
        placeholder="e.g., ICT3102" 
        placeholderTextColor="#9ca3af"
        value={courseCode} 
        onChangeText={setCourseCode} 
      />

      <Text style={[styles.label, { color: subText }]}>Due Date (YYYY-MM-DD)</Text>
      <TextInput 
        style={[styles.input, { backgroundColor: cardBg, color: textColor, borderColor: isDark ? '#374151' : '#d1d5db' }]} 
        placeholder="e.g., 2026-11-20" 
        placeholderTextColor="#9ca3af"
        value={dueDate} 
        onChangeText={setDueDate} 
      />

      <Text style={[styles.label, { color: subText }]}>Priority Level</Text>
      <View style={styles.priorityRow}>
        {['Low', 'Medium', 'High'].map((level) => (
          <TouchableOpacity
            key={level}
            style={[
              styles.priorityBtn,
              { backgroundColor: isDark ? '#374151' : '#e5e7eb' },
              priority === level && styles.priorityBtnActive
            ]}
            onPress={() => setPriority(level)}
          >
            <Text style={[
              styles.priorityText,
              { color: isDark ? '#d1d5db' : '#374151' },
              priority === level && styles.priorityTextActive
            ]}>
              {level}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Assignment</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  input: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: 10, borderWidth: 1, marginBottom: 16, fontSize: 14 },
  priorityRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  priorityBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  priorityBtnActive: { backgroundColor: '#007AFF' },
  priorityText: { fontWeight: '600', fontSize: 13 },
  priorityTextActive: { color: '#ffffff' },
  saveButton: { backgroundColor: '#007AFF', padding: 16, borderRadius: 12, alignItems: 'center' },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

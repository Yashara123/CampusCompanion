import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { getAppData, saveAppData } from '../services/storage';

export default function AssignmentDetailScreen({ route, navigation }) {
  const { assignment } = route.params;
  const [currentStatus, setCurrentStatus] = useState(assignment.status);

  const toggleStatus = async () => {
    try {
      const data = await getAppData();
      const updatedAssignments = data.assignments.map((item) => {
        if (item.id === assignment.id) {
          const newStatus = currentStatus === 'Pending' ? 'Completed' : 'Pending';
          setCurrentStatus(newStatus);
          return { ...item, status: newStatus };
        }
        return item;
      });

      data.assignments = updatedAssignments;
      await saveAppData(data);
      Alert.alert('Success', 'Assignment status updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update status.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.courseCode}>{assignment.courseCode}</Text>
        <Text style={styles.title}>{assignment.title}</Text>
        
        <View style={styles.row}>
          <Text style={styles.label}>Due Date:</Text>
          <Text style={styles.value}>{assignment.dueDate}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Current Status:</Text>
          <Text style={[styles.statusBadge, currentStatus === 'Completed' ? styles.completedText : styles.pendingText]}>
            {currentStatus}
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.button, currentStatus === 'Completed' ? styles.pendingButton : styles.completedButton]} 
          onPress={toggleStatus}
        >
          <Text style={styles.buttonText}>
            {currentStatus === 'Pending' ? 'Mark as Completed' : 'Mark as Pending'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 16, justifyContent: 'center' },
  card: { backgroundColor: '#fff', padding: 24, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  courseCode: { fontSize: 14, fontWeight: 'bold', color: '#007AFF', backgroundColor: '#eef2ff', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f1f3f5', paddingBottom: 12 },
  label: { fontSize: 15, color: '#6c757d', fontWeight: '500' },
  value: { fontSize: 15, color: '#333', fontWeight: '600' },
  statusBadge: { fontSize: 15, fontWeight: 'bold' },
  pendingText: { color: '#d97706' },
  completedText: { color: '#16a34a' },
  button: { paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  completedButton: { backgroundColor: '#16a34a' },
  pendingButton: { backgroundColor: '#d97706' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
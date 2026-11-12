import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { getAppData, saveAppData } from '../services/storage';
import { ThemeContext } from '../../App';

export default function AssignmentDetailScreen({ route, navigation }) {
  const { assignment } = route.params;
  const { isDark } = useContext(ThemeContext);

  const handleToggleStatus = async () => {
    const data = await getAppData();
    data.assignments = data.assignments.map(item => {
      if (item.id === assignment.id) {
        item.status = item.status === 'Pending' ? 'Completed' : 'Pending';
      }
      return item;
    });

    await saveAppData(data);
    Alert.alert('Updated', 'Assignment status updated!');
    navigation.goBack();
  };

  const handleDelete = async () => {
    const data = await getAppData();
    data.assignments = data.assignments.filter(item => item.id !== assignment.id);
    await saveAppData(data);
    Alert.alert('Deleted', 'Assignment removed.');
    navigation.goBack();
  };

  const bg = isDark ? '#111827' : '#f4f6f9';
  const cardBg = isDark ? '#1f2937' : '#ffffff';
  const textColor = isDark ? '#f9fafb' : '#1f2937';
  const subText = isDark ? '#9ca3af' : '#6c757d';

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <View style={styles.badgeRow}>
          <Text style={styles.badge}>{assignment.courseCode}</Text>
          <Text style={styles.priorityBadge}>Priority: {assignment.priority || 'Medium'}</Text>
        </View>
        
        <Text style={[styles.title, { color: textColor }]}>{assignment.title}</Text>
        <Text style={[styles.due, { color: subText }]}>Due Date: {assignment.dueDate}</Text>
        
        <Text style={[styles.status, assignment.status === 'Completed' ? styles.green : styles.orange]}>
          Status: {assignment.status}
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleToggleStatus}>
          <Text style={styles.buttonText}>
            {assignment.status === 'Pending' ? '✓ Mark as Completed' : '↺ Mark as Pending'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Delete Assignment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { padding: 24, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  badge: { fontSize: 12, fontWeight: 'bold', color: '#007AFF', backgroundColor: 'rgba(0,122,255,0.12)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  priorityBadge: { fontSize: 12, fontWeight: '600', color: '#6b7280', backgroundColor: 'rgba(107,114,128,0.12)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  due: { fontSize: 14, marginBottom: 12 },
  status: { fontSize: 15, fontWeight: 'bold', marginBottom: 24 },
  green: { color: '#16a34a' },
  orange: { color: '#d97706' },
  button: { backgroundColor: '#007AFF', padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 12 },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  deleteButton: { backgroundColor: '#fee2e2', padding: 14, borderRadius: 10, alignItems: 'center' },
  deleteButtonText: { color: '#dc2626', fontSize: 15, fontWeight: 'bold' }
});

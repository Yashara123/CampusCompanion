import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { getAppData } from '../services/storage';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../../App';

export default function CalendarScreen({ navigation }) {
  const [assignments, setAssignments] = useState([]);
  const [selectedDate, setSelectedDate] = useState('2026-11-14');
  const { isDark } = useContext(ThemeContext);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    loadData();
    return unsubscribe;
  }, [navigation]);

  const loadData = async () => {
    const data = await getAppData();
    const list = data.assignments || [];
    setAssignments(list);

    const urgentTasks = list.filter(a => a.status === 'Pending' && a.priority === 'High');
    if (urgentTasks.length > 0) {
      Alert.alert(
        '⏰ Upcoming ICA Deadline Alert!',
        `You have ${urgentTasks.length} high-priority assignment(s) due soon: ${urgentTasks[0].title}`
      );
    }
  };

  const daysInMonth = Array.from({ length: 30 }, (_, i) => {
    const day = (i + 1).toString().padStart(2, '0');
    return `2026-11-${day}`;
  });

  const tasksForSelectedDate = assignments.filter(a => a.dueDate === selectedDate);

  const bg = isDark ? '#111827' : '#f4f6f9';
  const cardBg = isDark ? '#1f2937' : '#ffffff';
  const textColor = isDark ? '#f9fafb' : '#1f2937';
  const subText = isDark ? '#9ca3af' : '#6c757d';

  return (
    <ScrollView style={[styles.container, { backgroundColor: bg }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.headerTitle, { color: textColor }]}>November 2026 Schedule</Text>
        <TouchableOpacity 
          style={styles.addBtn}
          onPress={() => navigation.navigate('Add Task')}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addBtnText}>Add Event</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.calendarCard, { backgroundColor: cardBg }]}>
        <View style={styles.grid}>
          {daysInMonth.map(dateStr => {
            const dayNum = dateStr.split('-')[2];
            const hasTask = assignments.some(a => a.dueDate === dateStr);
            const isSelected = selectedDate === dateStr;

            return (
              <TouchableOpacity
                key={dateStr}
                style={[
                  styles.dayCell,
                  isSelected && styles.selectedDay,
                  hasTask && !isSelected && styles.taskDay
                ]}
                onPress={() => setSelectedDate(dateStr)}
              >
                <Text style={[
                  styles.dayText,
                  { color: isSelected ? '#fff' : textColor }
                ]}>
                  {dayNum}
                </Text>
                {hasTask && <View style={[styles.dot, isSelected && { backgroundColor: '#fff' }]} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <Text style={[styles.subHeader, { color: textColor }]}>
        Tasks for {selectedDate}
      </Text>

      {tasksForSelectedDate.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: cardBg }]}>
          <Text style={{ color: subText }}>No ICAs or assignments scheduled for this date.</Text>
        </View>
      ) : (
        tasksForSelectedDate.map(task => (
          <View key={task.id} style={[styles.taskCard, { backgroundColor: cardBg }]}>
            <Text style={styles.courseBadge}>{task.courseCode}</Text>
            <Text style={[styles.taskTitle, { color: textColor }]}>{task.title}</Text>
            <Text style={{ color: task.status === 'Completed' ? '#16a34a' : '#d97706', fontWeight: 'bold', fontSize: 12 }}>
              Status: {task.status}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 19, fontWeight: 'bold' },
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#007AFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  addBtnText: { color: '#fff', fontWeight: 'bold', marginLeft: 4, fontSize: 13 },
  calendarCard: { padding: 12, borderRadius: 16, marginBottom: 20, elevation: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 8, marginBottom: 4 },
  selectedDay: { backgroundColor: '#007AFF' },
  taskDay: { backgroundColor: 'rgba(0, 122, 255, 0.12)' },
  dayText: { fontSize: 14, fontWeight: '600' },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#007AFF', marginTop: 2 },
  subHeader: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  emptyCard: { padding: 20, borderRadius: 12, alignItems: 'center' },
  taskCard: { padding: 14, borderRadius: 12, marginBottom: 10, elevation: 1 },
  courseBadge: { color: '#007AFF', fontWeight: 'bold', fontSize: 12, marginBottom: 4 },
  taskTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 4 }
});
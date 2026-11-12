import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { getAppData } from '../services/storage';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../../App';

export default function CoursesScreen({ navigation }) {
  const [courses, setCourses] = useState([]);
  const { isDark } = useContext(ThemeContext);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadCourses();
    });
    loadCourses();
    return unsubscribe;
  }, [navigation]);

  const loadCourses = async () => {
    const data = await getAppData();
    setCourses(data.courses || []);
  };

  const bg = isDark ? '#111827' : '#f4f6f9';
  const cardBg = isDark ? '#1f2937' : '#ffffff';
  const textColor = isDark ? '#f9fafb' : '#1f2937';
  const subText = isDark ? '#9ca3af' : '#6c757d';

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <Text style={[styles.headerTitle, { color: textColor }]}>Active Semester Modules</Text>
      <FlatList
        data={courses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.courseCard, { backgroundColor: cardBg }]}>
            <View style={styles.topRow}>
              <Text style={styles.courseCode}>{item.code}</Text>
              <Text style={styles.creditBadge}>{item.credits || 3} Credits</Text>
            </View>
            <Text style={[styles.courseName, { color: textColor }]}>{item.name}</Text>
            <View style={styles.lecturerRow}>
              <Ionicons name="person-outline" size={14} color={subText} />
              <Text style={[styles.lecturerText, { color: subText }]}>{item.lecturer}</Text>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerTitle: { fontSize: 19, fontWeight: 'bold', marginBottom: 14 },
  listContainer: { paddingBottom: 20 },
  courseCard: { padding: 16, borderRadius: 14, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  courseCode: { fontSize: 13, fontWeight: 'bold', color: '#007AFF', backgroundColor: 'rgba(0,122,255,0.1)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  creditBadge: { fontSize: 12, color: '#16a34a', fontWeight: '600' },
  courseName: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  lecturerRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  lecturerText: { fontSize: 13 }
});

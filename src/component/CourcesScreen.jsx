import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { getAppData } from '../services/storage';

export default function CoursesScreen() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    const data = await getAppData();
    setCourses(data.courses);
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Enrolled Modules ({courses.length})</Text>
      
      <FlatList
        data={courses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.courseCard}>
            <View style={styles.codeContainer}>
              <Text style={styles.courseCode}>{item.code}</Text>
              <Text style={styles.creditsText}>{item.credits} Credits</Text>
            </View>
            <Text style={styles.courseName}>{item.name}</Text>
            <Text style={styles.lecturerText}>Lecturer: {item.lecturer}</Text>
          </View>
        )}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 16 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#333' },
  listContainer: { paddingBottom: 20 },
  courseCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  codeContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  courseCode: { fontSize: 14, fontWeight: 'bold', color: '#007AFF', backgroundColor: '#eef2ff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  creditsText: { fontSize: 12, color: '#6c757d', fontWeight: '500' },
  courseName: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  lecturerText: { fontSize: 14, color: '#555' }
});
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { getAppData } from '../services/storage';
import { ThemeContext } from '../../App';

const GRADE_POINTS = {
  'A+': 4.0, 'A': 4.0, 'A-': 3.7,
  'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0, 'C-': 1.7,
  'D+': 1.3, 'D': 1.0, 'E': 0.0
};

const GRADES = Object.keys(GRADE_POINTS);

export default function GPAScreen({ navigation }) {
  const [courses, setCourses] = useState([]);
  const [selectedGrades, setSelectedGrades] = useState({});
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
    const loadedCourses = data.courses || [];
    setCourses(loadedCourses);
    
    const initialGrades = {};
    loadedCourses.forEach(c => {
      if (!selectedGrades[c.id]) initialGrades[c.id] = 'A';
    });
    setSelectedGrades(prev => ({ ...initialGrades, ...prev }));
  };

  const handleSelectGrade = (courseId, grade) => {
    setSelectedGrades(prev => ({ ...prev, [courseId]: grade }));
  };

  const calculateGPA = () => {
    let totalPoints = 0;
    let totalCredits = 0;

    courses.forEach(course => {
      const credits = course.credits || 3;
      const grade = selectedGrades[course.id] || 'A';
      const point = GRADE_POINTS[grade] || 0;

      totalPoints += credits * point;
      totalCredits += credits;
    });

    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
  };

  const gpa = calculateGPA();
  const bg = isDark ? '#111827' : '#f4f6f9';
  const cardBg = isDark ? '#1f2937' : '#ffffff';
  const textColor = isDark ? '#f9fafb' : '#1f2937';
  const subText = isDark ? '#9ca3af' : '#6c757d';

  return (
    <ScrollView style={[styles.container, { backgroundColor: bg }]}>
      <View style={styles.gpaBanner}>
        <Text style={styles.gpaSubtitle}>Estimated Semester GPA</Text>
        <Text style={styles.gpaScore}>{gpa}</Text>
        <Text style={styles.gpaScale}>Out of 4.00 Scale</Text>
      </View>

      <Text style={[styles.sectionHeader, { color: textColor }]}>Select Expected Grades</Text>

      {courses.map(course => (
        <View key={course.id} style={[styles.courseCard, { backgroundColor: cardBg }]}>
          <View style={styles.courseHeader}>
            <Text style={styles.courseCode}>{course.code}</Text>
            <Text style={[styles.creditsText, { color: subText }]}>{course.credits || 3} Credits</Text>
          </View>
          <Text style={[styles.courseName, { color: textColor }]}>{course.name}</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gradeRow}>
            {GRADES.map(grade => {
              const isSelected = selectedGrades[course.id] === grade;
              return (
                <TouchableOpacity
                  key={grade}
                  style={[
                    styles.gradeBtn,
                    { backgroundColor: isDark ? '#374151' : '#e5e7eb' },
                    isSelected && styles.gradeBtnActive
                  ]}
                  onPress={() => handleSelectGrade(course.id, grade)}
                >
                  <Text style={[
                    styles.gradeText,
                    { color: isDark ? '#d1d5db' : '#374151' },
                    isSelected && styles.gradeTextActive
                  ]}>
                    {grade}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  gpaBanner: { backgroundColor: '#007AFF', padding: 24, borderRadius: 16, alignItems: 'center', marginBottom: 20, elevation: 4 },
  gpaSubtitle: { color: '#dbeafe', fontSize: 14, fontWeight: '600' },
  gpaScore: { color: '#ffffff', fontSize: 44, fontWeight: 'bold', marginVertical: 4 },
  gpaScale: { color: '#bfdbfe', fontSize: 12 },
  sectionHeader: { fontSize: 17, fontWeight: 'bold', marginBottom: 12 },
  courseCard: { padding: 16, borderRadius: 14, marginBottom: 12, elevation: 2 },
  courseHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  courseCode: { fontSize: 13, fontWeight: 'bold', color: '#007AFF' },
  creditsText: { fontSize: 12, fontWeight: '600' },
  courseName: { fontSize: 15, fontWeight: 'bold', marginBottom: 12 },
  gradeRow: { flexDirection: 'row' },
  gradeBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, marginRight: 8 },
  gradeBtnActive: { backgroundColor: '#007AFF' },
  gradeText: { fontSize: 13, fontWeight: 'bold' },
  gradeTextActive: { color: '#ffffff' }
});
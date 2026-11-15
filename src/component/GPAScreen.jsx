import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
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

  // Cumulative GPA State
  const [prevGpa, setPrevGpa] = useState('');
  const [prevCredits, setPrevCredits] = useState('');

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

  const calculateSemesterGPA = () => {
    let totalPoints = 0;
    let totalCredits = 0;

    courses.forEach(course => {
      const credits = course.credits || 3;
      const grade = selectedGrades[course.id] || 'A';
      const point = GRADE_POINTS[grade] || 0;

      totalPoints += credits * point;
      totalCredits += credits;
    });

    const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
    return { gpa: parseFloat(gpa), totalCredits };
  };

  const semesterResult = calculateSemesterGPA();

  // Calculate Cumulative (Full) GPA
  const calculateCumulativeGPA = () => {
    const pGpa = parseFloat(prevGpa) || 0;
    const pCreds = parseFloat(prevCredits) || 0;

    if (pCreds === 0) return semesterResult.gpa.toFixed(2);

    const prevPoints = pGpa * pCreds;
    const currentPoints = semesterResult.gpa * semesterResult.totalCredits;
    const totalCreds = pCreds + semesterResult.totalCredits;

    const cumulative = totalCreds > 0 ? ((prevPoints + currentPoints) / totalCreds).toFixed(2) : '0.00';
    return cumulative;
  };

  const cumulativeGPA = calculateCumulativeGPA();

  const bg = isDark ? '#111827' : '#f4f6f9';
  const cardBg = isDark ? '#1f2937' : '#ffffff';
  const textColor = isDark ? '#f9fafb' : '#1f2937';
  const subText = isDark ? '#9ca3af' : '#6c757d';

  return (
    <ScrollView style={[styles.container, { backgroundColor: bg }]}>
      {/* GPA Banners */}
      <View style={styles.bannerRow}>
        <View style={[styles.gpaBanner, { flex: 1, marginRight: 8, backgroundColor: '#007AFF' }]}>
          <Text style={styles.gpaSubtitle}>Semester GPA</Text>
          <Text style={styles.gpaScore}>{semesterResult.gpa.toFixed(2)}</Text>
          <Text style={styles.gpaScale}>{semesterResult.totalCredits} Credits</Text>
        </View>

        <View style={[styles.gpaBanner, { flex: 1, marginLeft: 8, backgroundColor: '#7c3aed' }]}>
          <Text style={styles.gpaSubtitle}>Cumulative Full GPA</Text>
          <Text style={styles.gpaScore}>{cumulativeGPA}</Text>
          <Text style={styles.gpaScale}>Overall Standing</Text>
        </View>
      </View>

      {/* Cumulative Inputs Card */}
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <Text style={[styles.sectionHeader, { color: textColor, marginBottom: 8 }]}>Previous Academic Record (Optional)</Text>
        <Text style={{ color: subText, fontSize: 12, marginBottom: 12 }}>
          Enter your previous cumulative GPA and total earned credits to calculate your new overall full GPA.
        </Text>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1, color: textColor, borderColor: isDark ? '#374151' : '#ddd' }]}
            keyboardType="numeric"
            placeholder="Prev GPA (e.g. 3.50)"
            placeholderTextColor="#9ca3af"
            value={prevGpa}
            onChangeText={setPrevGpa}
          />
          <TextInput
            style={[styles.input, { flex: 1, color: textColor, borderColor: isDark ? '#374151' : '#ddd', marginLeft: 8 }]}
            keyboardType="numeric"
            placeholder="Prev Credits (e.g. 60)"
            placeholderTextColor="#9ca3af"
            value={prevCredits}
            onChangeText={setPrevCredits}
          />
        </View>
      </View>

      <Text style={[styles.sectionHeader, { color: textColor }]}>Select Expected Grades for Current Courses</Text>

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
  bannerRow: { flexDirection: 'row', marginBottom: 16 },
  gpaBanner: { padding: 16, borderRadius: 16, alignItems: 'center', elevation: 4 },
  gpaSubtitle: { color: '#dbeafe', fontSize: 12, fontWeight: '600' },
  gpaScore: { color: '#ffffff', fontSize: 32, fontWeight: 'bold', marginVertical: 2 },
  gpaScale: { color: '#bfdbfe', fontSize: 11 },
  sectionHeader: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  card: { padding: 16, borderRadius: 14, marginBottom: 16, elevation: 2 },
  row: { flexDirection: 'row' },
  input: { borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 14 },
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
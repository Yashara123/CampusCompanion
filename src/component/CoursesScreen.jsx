import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { getAppData, saveAppData } from '../services/storage';
import { ThemeContext } from '../../App';
import { Ionicons } from '@expo/vector-icons';

export default function CoursesScreen({ navigation }) {
  const [courses, setCourses] = useState([]);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [lecturer, setLecturer] = useState('');
  const [credits, setCredits] = useState('3');
  const [isPractical, setIsPractical] = useState(false); // Theory or Practical toggle
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

  const handleAddCourse = async () => {
    if (!code.trim() || !name.trim()) {
      Alert.alert('Error', 'Please enter course code and name.');
      return;
    }

    const newCourse = {
      id: Date.now().toString(),
      code,
      name,
      lecturer,
      credits: parseInt(credits) || 3,
      isPractical: isPractical, // Save whether it's practical or theory
      subTopics: [],
      resourceLink: '',
      notes: ''
    };

    const updatedCourses = [...courses, newCourse];
    setCourses(updatedCourses);

    const data = await getAppData();
    data.courses = updatedCourses;
    await saveAppData(data);

    setCode('');
    setName('');
    setLecturer('');
    setIsPractical(false);
    Alert.alert('Success', 'Course unit added successfully!');
  };

  const bg = isDark ? '#111827' : '#f4f6f9';
  const cardBg = isDark ? '#1f2937' : '#ffffff';
  const textColor = isDark ? '#f9fafb' : '#1f2937';
  const subText = isDark ? '#9ca3af' : '#6c757d';

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Add Course Form */}
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <Text style={[styles.cardTitle, { color: textColor }]}>Add New Course Unit</Text>
        
        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1, color: textColor, borderColor: isDark ? '#374151' : '#ddd' }]}
            placeholder="Code (e.g., ITC311)"
            placeholderTextColor="#9ca3af"
            value={code}
            onChangeText={setCode}
          />
          <TextInput
            style={[styles.input, { width: 80, color: textColor, borderColor: isDark ? '#374151' : '#ddd', marginLeft: 8 }]}
            keyboardType="numeric"
            placeholder="Credits"
            placeholderTextColor="#9ca3af"
            value={credits}
            onChangeText={setCredits}
          />
        </View>

        <TextInput
          style={[styles.input, { color: textColor, borderColor: isDark ? '#374151' : '#ddd' }]}
          placeholder="Course Name (e.g., Web Development)"
          placeholderTextColor="#9ca3af"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={[styles.input, { color: textColor, borderColor: isDark ? '#374151' : '#ddd' }]}
          placeholder="Lecturer Name"
          placeholderTextColor="#9ca3af"
          value={lecturer}
          onChangeText={setLecturer}
        />

        {/* Practical vs Theory Selection */}
        <TouchableOpacity 
          style={[styles.typeSelectBtn, { backgroundColor: isPractical ? '#7c3aed' : '#e5e7eb' }]}
          onPress={() => setIsPractical(!isPractical)}
        >
          <Ionicons name={isPractical ? "flask" : "book"} size={18} color={isPractical ? "#fff" : "#374151"} />
          <Text style={[styles.typeSelectText, { color: isPractical ? '#fff' : '#374151' }]}>
            Type: {isPractical ? 'Practical Subject (40% ICA)' : 'Theory Subject (30% ICA)'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.submitBtn} onPress={handleAddCourse}>
          <Text style={styles.submitBtnText}>Add Course Unit</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionHeader, { color: textColor }]}>My Enrolled Courses</Text>

      <FlatList
        data={courses}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.courseCard, { backgroundColor: cardBg }]}
            onPress={() => navigation.navigate('CourseDetail', { course: item })}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={styles.courseCode}>{item.code} ({item.credits || 3} Credits)</Text>
                <Text style={[styles.courseName, { color: textColor }]}>{item.name}</Text>
                <Text style={{ fontSize: 11, color: item.isPractical ? '#7c3aed' : '#007AFF', fontWeight: 'bold', marginTop: 2 }}>
                  {item.isPractical ? '🔬 Practical Module (40% ICA)' : '📚 Theory Module (30% ICA)'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={subText} />
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { padding: 16, borderRadius: 14, marginBottom: 16, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  input: { borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 10, fontSize: 14 },
  row: { flexDirection: 'row' },
  typeSelectBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 10, borderRadius: 8, marginBottom: 12 },
  typeSelectText: { fontWeight: 'bold', fontSize: 13, marginLeft: 6 },
  submitBtn: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: 'bold' },
  sectionHeader: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  courseCard: { padding: 14, borderRadius: 12, marginBottom: 8, elevation: 1 },
  courseCode: { fontSize: 12, fontWeight: 'bold', color: '#007AFF', marginBottom: 2 },
  courseName: { fontSize: 15, fontWeight: 'bold' }
});
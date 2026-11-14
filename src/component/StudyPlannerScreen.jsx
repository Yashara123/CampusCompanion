import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { getAppData, saveAppData } from '../services/storage';
import { ThemeContext } from '../../App';
import { Ionicons } from '@expo/vector-icons';

export default function StudyPlannerScreen({ navigation }) {
  const [courses, setCourses] = useState([]);
  const [studyPlan, setStudyPlan] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [subTopic, setSubTopic] = useState('');
  const [selectedDay, setSelectedDay] = useState('Monday');
  const { isDark } = useContext(ThemeContext);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    loadData();
    return unsubscribe;
  }, [navigation]);

  const loadData = async () => {
    const data = await getAppData();
    setCourses(data.courses || []);
    setStudyPlan(data.studyPlan || []);

    const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    if (todayName === 'Sunday') {
      Alert.alert(
        '📅 Sunday Weekly Review',
        'It is Sunday! Time to update and review your study focus plan for the upcoming week.'
      );
    }
  };

  const handleAddPlanItem = async () => {
    if (!subTopic.trim() || !selectedCourseId) {
      Alert.alert('Error', 'Please select a course and enter a sub-topic / daily goal.');
      return;
    }

    const courseObj = courses.find(c => c.id === selectedCourseId);
    const newItem = {
      id: Date.now().toString(),
      courseId: selectedCourseId,
      day: selectedDay,
      courseCode: courseObj ? courseObj.code : 'GEN',
      courseName: courseObj ? courseObj.name : 'General Study',
      subTopic,
      completed: false
    };

    const updatedPlan = [...studyPlan, newItem];
    setStudyPlan(updatedPlan);

    const data = await getAppData();
    data.studyPlan = updatedPlan;

    // Automatically sync and add to the course's subTopics list as well!
    data.courses = data.courses.map(c => {
      if (c.id === selectedCourseId) {
        const existingSubs = c.subTopics || [];
        return {
          ...c,
          subTopics: [...existingSubs, { id: newItem.id, title: subTopic, completed: false }]
        };
      }
      return c;
    });

    await saveAppData(data);
    setSubTopic('');
    Alert.alert('Success', `Study focus added for ${selectedDay} & synced with course!`);
  };

  const toggleComplete = async (id, courseId, subTopicTitle) => {
    // 1. Update Daily Plan state
    const updatedPlan = studyPlan.map(item => {
      if (item.id === id) return { ...item, completed: !item.completed };
      return item;
    });
    setStudyPlan(updatedPlan);

    const data = await getAppData();
    data.studyPlan = updatedPlan;

    // 2. Automatically sync completion with the Course Unit's subTopics list
    data.courses = data.courses.map(c => {
      if (c.id === courseId) {
        const updatedSubs = (c.subTopics || []).map(sub => {
          if (sub.id === id || sub.title === subTopicTitle) {
            return { ...sub, completed: !sub.completed };
          }
          return sub;
        });
        return { ...c, subTopics: updatedSubs };
      }
      return c;
    });

    await saveAppData(data);
  };

  const bg = isDark ? '#111827' : '#f4f6f9';
  const cardBg = isDark ? '#1f2937' : '#ffffff';
  const textColor = isDark ? '#f9fafb' : '#1f2937';
  const subText = isDark ? '#9ca3af' : '#6c757d';

  return (
    <ScrollView style={[styles.container, { backgroundColor: bg }]}>
      <View style={styles.banner}>
        <Ionicons name="flash-outline" size={24} color="#fff" />
        <View style={{ marginLeft: 10, flex: 1 }}>
          <Text style={styles.bannerTitle}>Daily & Weekly Study Focus</Text>
          <Text style={styles.bannerSub}>Fully synced with course sub-topics & progress!</Text>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <Text style={[styles.cardTitle, { color: textColor }]}>Add Weekly Study Goal</Text>

        <Text style={[styles.label, { color: subText }]}>Select Day of the Week</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayScroll}>
          {daysOfWeek.map(day => (
            <TouchableOpacity
              key={day}
              style={[styles.dayBtn, selectedDay === day && styles.dayBtnActive]}
              onPress={() => setSelectedDay(day)}
            >
              <Text style={[styles.dayText, selectedDay === day && { color: '#fff' }]}>{day}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={[styles.label, { color: subText, marginTop: 10 }]}>Select Course Unit</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayScroll}>
          {courses.map(course => (
            <TouchableOpacity
              key={course.id}
              style={[styles.courseChip, selectedCourseId === course.id && styles.courseChipActive]}
              onPress={() => setSelectedCourseId(course.id)}
            >
              <Text style={[styles.courseChipText, selectedCourseId === course.id && { color: '#fff' }]}>
                {course.code}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={[styles.label, { color: subText, marginTop: 10 }]}>Sub-Topic / Daily Goal</Text>
        <TextInput
          style={[styles.input, { color: textColor, borderColor: isDark ? '#374151' : '#ddd' }]}
          placeholder="e.g., Chapter 3: Normalization & SQL Joins"
          placeholderTextColor="#9ca3af"
          value={subTopic}
          onChangeText={setSubTopic}
        />

        <TouchableOpacity style={styles.submitBtn} onPress={handleAddPlanItem}>
          <Text style={styles.submitBtnText}>Add to Weekly Schedule & Course</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionHeader, { color: textColor }]}>{selectedDay}'s Study Focus Plan</Text>

      {studyPlan.filter(item => item.day === selectedDay).length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: cardBg }]}>
          <Text style={{ color: subText }}>No study goals set for {selectedDay}. Add one above!</Text>
        </View>
      ) : (
        studyPlan
          .filter(item => item.day === selectedDay)
          .map(item => (
            <TouchableOpacity
              key={item.id}
              style={[styles.planCard, { backgroundColor: cardBg }, item.completed && styles.completedCard]}
              onPress={() => toggleComplete(item.id, item.courseId, item.subTopic)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons 
                  name={item.completed ? "checkbox" : "square-outline"} 
                  size={22} 
                  color={item.completed ? "#16a34a" : "#007AFF"} 
                />
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text style={styles.planBadge}>{item.courseCode}</Text>
                  <Text style={[styles.planText, { color: textColor }, item.completed && styles.completedText]}>
                    {item.subTopic}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  banner: { backgroundColor: '#7c3aed', padding: 16, borderRadius: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 16, elevation: 3 },
  bannerTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  bannerSub: { color: '#ddd6fe', fontSize: 12, marginTop: 2 },
  card: { padding: 16, borderRadius: 14, marginBottom: 20, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  dayScroll: { flexDirection: 'row', marginBottom: 8 },
  dayBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#e5e7eb', marginRight: 6 },
  dayBtnActive: { backgroundColor: '#7c3aed' },
  dayText: { fontSize: 12, fontWeight: 'bold', color: '#374151' },
  courseChip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#e5e7eb', marginRight: 6 },
  courseChipActive: { backgroundColor: '#007AFF' },
  courseChipText: { fontSize: 12, fontWeight: 'bold', color: '#374151' },
  input: { borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 12, fontSize: 14 },
  submitBtn: { backgroundColor: '#7c3aed', padding: 12, borderRadius: 8, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: 'bold' },
  sectionHeader: { fontSize: 17, fontWeight: 'bold', marginBottom: 10 },
  emptyCard: { padding: 20, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
  planCard: { padding: 14, borderRadius: 12, marginBottom: 8, elevation: 1 },
  completedCard: { opacity: 0.6, backgroundColor: 'rgba(22, 163, 74, 0.05)' },
  planBadge: { fontSize: 11, fontWeight: 'bold', color: '#7c3aed', marginBottom: 2 },
  planText: { fontSize: 14, fontWeight: '600' },
  completedText: { textDecorationLine: 'line-through', color: '#9ca3af' }
});
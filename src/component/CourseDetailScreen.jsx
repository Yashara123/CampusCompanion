import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Linking } from 'react-native';
import { getAppData, saveAppData } from '../services/storage';
import { ThemeContext } from '../../App';
import { Ionicons } from '@expo/vector-icons';

export default function CourseDetailScreen({ route }) {
  const { course } = route.params;
  const { isDark } = useContext(ThemeContext);

  const [resourceLink, setResourceLink] = useState(course.resourceLink || '');
  const [notes, setNotes] = useState(course.notes || '');
  const [subTopics, setSubTopics] = useState(course.subTopics || []);
  const [newSubTopic, setNewSubTopic] = useState('');

  // ICA Marks Calculator State
  const [ica1, setIca1] = useState('');
  const [ica2, setIca2] = useState('');
  const [weight, setWeight] = useState('40');
  const [calculatedScore, setCalculatedScore] = useState(null);

  const handleSaveCourseDetails = async () => {
    const data = await getAppData();
    data.courses = data.courses.map(c => {
      if (c.id === course.id) {
        return { ...c, resourceLink, notes, subTopics };
      }
      return c;
    });
    await saveAppData(data);
    Alert.alert('Saved', 'Course details and sub-topics updated!');
  };

  const handleAddSubTopic = async () => {
    if (!newSubTopic.trim()) return;
    const updatedTopics = [...subTopics, { id: Date.now().toString(), title: newSubTopic, completed: false }];
    setSubTopics(updatedTopics);
    setNewSubTopic('');

    // Save to storage
    const data = await getAppData();
    data.courses = data.courses.map(c => {
      if (c.id === course.id) return { ...c, subTopics: updatedTopics };
      return c;
    });
    await saveAppData(data);
  };

  const toggleSubTopic = async (id) => {
    const updatedTopics = subTopics.map(t => {
      if (t.id === id) return { ...t, completed: !t.completed };
      return t;
    });
    setSubTopics(updatedTopics);

    const data = await getAppData();
    data.courses = data.courses.map(c => {
      if (c.id === course.id) return { ...c, subTopics: updatedTopics };
      return c;
    });
    await saveAppData(data);
  };

  const handleOpenLink = () => {
    if (!resourceLink.trim()) {
      Alert.alert('No Link', 'Please enter a valid VLE or Drive URL first.');
      return;
    }
    const url = resourceLink.startsWith('http') ? resourceLink : `https://${resourceLink}`;
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Cannot open this URL.'));
  };

  const calculateICA = () => {
    const m1 = parseFloat(ica1) || 0;
    const m2 = parseFloat(ica2) || 0;
    const w = parseFloat(weight) || 40;
    const avg = (m1 + m2) / 2;
    const finalIca = ((avg / 100) * w).toFixed(2);
    setCalculatedScore(finalIca);
  };

  const bg = isDark ? '#111827' : '#f4f6f9';
  const cardBg = isDark ? '#1f2937' : '#ffffff';
  const textColor = isDark ? '#f9fafb' : '#1f2937';
  const subText = isDark ? '#9ca3af' : '#6c757d';

  return (
    <ScrollView style={[styles.container, { backgroundColor: bg }]}>
      {/* Course Header */}
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <Text style={styles.code}>{course.code}</Text>
        <Text style={[styles.title, { color: textColor }]}>{course.name}</Text>
        <Text style={[styles.lecturer, { color: subText }]}>Lecturer: {course.lecturer}</Text>
      </View>

      {/* Sub-Topics & Progress Section */}
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Course Sub-Topics & Progress</Text>
        
        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1, color: textColor, borderColor: isDark ? '#374151' : '#ddd' }]}
            placeholder="Add sub-topic (e.g., Chapter 1: ER Diagrams)"
            placeholderTextColor="#9ca3af"
            value={newSubTopic}
            onChangeText={setNewSubTopic}
          />
          <TouchableOpacity style={styles.addTopicBtn} onPress={handleAddSubTopic}>
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {subTopics.length === 0 ? (
          <Text style={{ color: subText, fontSize: 13, marginTop: 4 }}>No sub-topics added yet.</Text>
        ) : (
          subTopics.map(topic => (
            <TouchableOpacity 
              key={topic.id} 
              style={[styles.topicRow, { backgroundColor: isDark ? '#374151' : '#f3f4f6' }]}
              onPress={() => toggleSubTopic(topic.id)}
            >
              <Ionicons 
                name={topic.completed ? "checkbox" : "square-outline"} 
                size={20} 
                color={topic.completed ? "#16a34a" : "#007AFF"} 
              />
              <Text style={[
                styles.topicText, 
                { color: textColor }, 
                topic.completed && styles.completedText
              ]}>
                {topic.title}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* VLE Resource Link & Notes Section */}
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>VLE & Study Resources</Text>
        <TextInput
          style={[styles.input, { color: textColor, borderColor: isDark ? '#374151' : '#ddd' }]}
          placeholder="e.g., https://vle.vau.ac.lk/course/..."
          placeholderTextColor="#9ca3af"
          value={resourceLink}
          onChangeText={setResourceLink}
        />
        <TouchableOpacity style={styles.linkBtn} onPress={handleOpenLink}>
          <Text style={styles.linkBtnText}>🔗 Open Resource Link</Text>
        </TouchableOpacity>

        <TextInput
          style={[styles.input, { height: 60, color: textColor, borderColor: isDark ? '#374151' : '#ddd', marginTop: 12 }]}
          placeholder="Quick module notes..."
          placeholderTextColor="#9ca3af"
          multiline
          value={notes}
          onChangeText={setNotes}
        />
        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveCourseDetails}>
          <Text style={styles.saveBtnText}>Save Course Updates</Text>
        </TouchableOpacity>
      </View>

      {/* ICA Marks Calculator */}
      <View style={[styles.card, { backgroundColor: cardBg, marginBottom: 30 }]}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>ICA Marks Calculator</Text>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1, color: textColor, borderColor: isDark ? '#374151' : '#ddd' }]}
            keyboardType="numeric"
            placeholder="ICA 1 (100)"
            placeholderTextColor="#9ca3af"
            value={ica1}
            onChangeText={setIca1}
          />
          <TextInput
            style={[styles.input, { flex: 1, color: textColor, borderColor: isDark ? '#374151' : '#ddd', marginLeft: 8 }]}
            keyboardType="numeric"
            placeholder="ICA 2 (100)"
            placeholderTextColor="#9ca3af"
            value={ica2}
            onChangeText={setIca2}
          />
        </View>
        <TouchableOpacity style={styles.calcBtn} onPress={calculateICA}>
          <Text style={styles.saveBtnText}>Calculate ICA Score</Text>
        </TouchableOpacity>

        {calculatedScore !== null && (
          <View style={styles.resultBox}>
            <Text style={styles.resultText}>Earned ICA Score: {calculatedScore}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { padding: 16, borderRadius: 14, marginBottom: 16, elevation: 2 },
  code: { fontSize: 13, fontWeight: 'bold', color: '#007AFF', marginBottom: 4 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  lecturer: { fontSize: 13 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  input: { borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 14, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center' },
  addTopicBtn: { backgroundColor: '#007AFF', padding: 10, borderRadius: 8, marginLeft: 8, justifyContent: 'center', alignItems: 'center', height: 44 },
  topicRow: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 8, marginTop: 6 },
  topicText: { marginLeft: 10, fontSize: 14, fontWeight: '500' },
  completedText: { textDecorationLine: 'line-through', color: '#9ca3af' },
  linkBtn: { backgroundColor: '#10b981', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  linkBtnText: { color: '#fff', fontWeight: 'bold' },
  saveBtn: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#fff', fontWeight: 'bold' },
  calcBtn: { backgroundColor: '#6366f1', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  resultBox: { marginTop: 12, padding: 10, backgroundColor: 'rgba(99, 102, 241, 0.15)', borderRadius: 8, alignItems: 'center' },
  resultText: { color: '#4f46e5', fontWeight: 'bold', fontSize: 14 }
});
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

  // Theory & Practical Credit Split States
  const [theoryCredits, setTheoryCredits] = useState(course.theoryCredits?.toString() || '2');
  const [practicalCredits, setPracticalCredits] = useState(course.practicalCredits?.toString() || '1');
  const [hasPractical, setHasPractical] = useState(course.hasPractical ?? true);

  // Theory ICA Marks State (Best 2 of 3, 30% weight)
  const [tIca1, setTIca1] = useState('');
  const [tIca2, setTIca2] = useState('');
  const [tIca3, setTIca3] = useState('');
  const [theoryResult, setTheoryResult] = useState(null);

  // Practical ICA Marks State (Best 2 of 3, 40% weight)
  const [pIca1, setPIca1] = useState('');
  const [pIca2, setPIca2] = useState('');
  const [pIca3, setPIca3] = useState('');
  const [practicalResult, setPracticalResult] = useState(null);

  const handleSaveCourseDetails = async () => {
    const tCreds = parseFloat(theoryCredits) || 0;
    const pCreds = hasPractical ? (parseFloat(practicalCredits) || 0) : 0;
    const totalCredits = tCreds + pCreds;

    const updatedCourseData = {
      ...course,
      resourceLink,
      notes,
      subTopics,
      theoryCredits: tCreds,
      practicalCredits: pCreds,
      credits: totalCredits,
      hasPractical
    };

    const data = await getAppData();
    data.courses = data.courses.map(c => {
      if (c.id === course.id) return updatedCourseData;
      return c;
    });
    await saveAppData(data);
    Alert.alert('Saved', `Course details updated! Total Credits: ${totalCredits}`);
  };

  const handleAddSubTopic = async () => {
    if (!newSubTopic.trim()) return;
    const updatedTopics = [...subTopics, { id: Date.now().toString(), title: newSubTopic, completed: false }];
    setSubTopics(updatedTopics);
    setNewSubTopic('');

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

  // Calculate Theory ICA (Best 2 of 3, 30% contribution)
  const calculateTheoryICA = () => {
    const m1 = parseFloat(tIca1) || 0;
    const m2 = parseFloat(tIca2) || 0;
    const m3 = parseFloat(tIca3) || 0;

    const scores = [m1, m2, m3].sort((a, b) => b - a);
    const bestTwoAvg = (scores[0] + scores[1]) / 2;
    const contribution = (bestTwoAvg * 0.30).toFixed(2);

    setTheoryResult({ bestAvg: bestTwoAvg.toFixed(2), contribution });
  };

  // Calculate Practical ICA (Best 2 of 3, 40% contribution)
  const calculatePracticalICA = () => {
    const m1 = parseFloat(pIca1) || 0;
    const m2 = parseFloat(pIca2) || 0;
    const m3 = parseFloat(pIca3) || 0;

    const scores = [m1, m2, m3].sort((a, b) => b - a);
    const bestTwoAvg = (scores[0] + scores[1]) / 2;
    const contribution = (bestTwoAvg * 0.40).toFixed(2);

    setPracticalResult({ bestAvg: bestTwoAvg.toFixed(2), contribution });
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
        
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={{ color: '#007AFF', fontWeight: 'bold', fontSize: 12 }}>
              📚 Theory: {theoryCredits} Credits
            </Text>
          </View>
          {hasPractical && (
            <View style={[styles.badge, { backgroundColor: 'rgba(124, 58, 237, 0.1)', marginLeft: 8 }]}>
              <Text style={{ color: '#7c3aed', fontWeight: 'bold', fontSize: 12 }}>
                🔬 Practical: {practicalCredits} Credits
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Theory & Practical Credit Split Setup */}
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Course Component & Credit Distribution</Text>
        
        <View style={styles.switchRow}>
          <Text style={{ color: textColor, fontWeight: '600', fontSize: 13 }}>Has Practical Component?</Text>
          <TouchableOpacity 
            style={[styles.toggleBtn, { backgroundColor: hasPractical ? '#7c3aed' : '#e5e7eb' }]}
            onPress={() => setHasPractical(!hasPractical)}
          >
            <Text style={{ color: hasPractical ? '#fff' : '#374151', fontWeight: 'bold', fontSize: 12 }}>
              {hasPractical ? 'Yes (Theory + Practical)' : 'No (Theory Only)'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 6 }}>
            <Text style={{ color: subText, fontSize: 11, marginBottom: 4 }}>Theory Credits</Text>
            <TextInput
              style={[styles.input, { color: textColor, borderColor: isDark ? '#374151' : '#ddd' }]}
              keyboardType="numeric"
              value={theoryCredits}
              onChangeText={setTheoryCredits}
            />
          </View>

          {hasPractical && (
            <View style={{ flex: 1, marginLeft: 6 }}>
              <Text style={{ color: subText, fontSize: 11, marginBottom: 4 }}>Practical Credits</Text>
              <TextInput
                style={[styles.input, { color: textColor, borderColor: isDark ? '#374151' : '#ddd' }]}
                keyboardType="numeric"
                value={practicalCredits}
                onChangeText={setPracticalCredits}
              />
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveCourseDetails}>
          <Text style={styles.saveBtnText}>Save Credit Split & Course Details</Text>
        </TouchableOpacity>
      </View>

      {/* Sub-Topics & Progress Section */}
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Course Sub-Topics & Progress</Text>
        
        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1, color: textColor, borderColor: isDark ? '#374151' : '#ddd' }]}
            placeholder="Add sub-topic (e.g., Module 1 Lab Exercises)"
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

      {/* Theory ICA Calculator (30% Weight) */}
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>📚 Theory ICA Calculator (Best 2 of 3 - 30%)</Text>
        <Text style={{ color: subText, fontSize: 12, marginBottom: 10 }}>
          Enter Theory ICA marks (out of 100). Takes best 2 and calculates 30% contribution.
        </Text>

        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1, color: textColor, borderColor: isDark ? '#374151' : '#ddd' }]}
            keyboardType="numeric"
            placeholder="Theory ICA 1"
            placeholderTextColor="#9ca3af"
            value={tIca1}
            onChangeText={setTIca1}
          />
          <TextInput
            style={[styles.input, { flex: 1, color: textColor, borderColor: isDark ? '#374151' : '#ddd', marginHorizontal: 6 }]}
            keyboardType="numeric"
            placeholder="Theory ICA 2"
            placeholderTextColor="#9ca3af"
            value={tIca2}
            onChangeText={setTIca2}
          />
          <TextInput
            style={[styles.input, { flex: 1, color: textColor, borderColor: isDark ? '#374151' : '#ddd' }]}
            keyboardType="numeric"
            placeholder="Theory ICA 3"
            placeholderTextColor="#9ca3af"
            value={tIca3}
            onChangeText={setTIca3}
          />
        </View>

        <TouchableOpacity style={styles.calcBtn} onPress={calculateTheoryICA}>
          <Text style={styles.saveBtnText}>Calculate Theory ICA Contribution</Text>
        </TouchableOpacity>

        {theoryResult !== null && (
          <View style={styles.resultBox}>
            <Text style={styles.resultTitle}>Theory Evaluation Summary</Text>
            <Text style={styles.resultText}>Best 2 ICAs Average: {theoryResult.bestAvg} / 100</Text>
            <Text style={styles.resultHighlight}>Theory ICA Contribution (30%): {theoryResult.contribution}%</Text>
          </View>
        )}
      </View>

      {/* Practical ICA Calculator (40% Weight - Shown only if hasPractical) */}
      {hasPractical && (
        <View style={[styles.card, { backgroundColor: cardBg, marginBottom: 30 }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>🔬 Practical ICA Calculator (Best 2 of 3 - 40%)</Text>
          <Text style={{ color: subText, fontSize: 12, marginBottom: 10 } }>
            Enter Practical ICA marks (out of 100). Takes best 2 and calculates 40% contribution.
          </Text>

          <View style={styles.row}>
            <TextInput
              style={[styles.input, { flex: 1, color: textColor, borderColor: isDark ? '#374151' : '#ddd' }]}
              keyboardType="numeric"
              placeholder="Practical ICA 1"
              placeholderTextColor="#9ca3af"
              value={pIca1}
              onChangeText={setPIca1}
            />
            <TextInput
              style={[styles.input, { flex: 1, color: textColor, borderColor: isDark ? '#374151' : '#ddd', marginHorizontal: 6 }]}
              keyboardType="numeric"
              placeholder="Practical ICA 2"
              placeholderTextColor="#9ca3af"
              value={pIca2}
              onChangeText={setPIca2}
            />
            <TextInput
              style={[styles.input, { flex: 1, color: textColor, borderColor: isDark ? '#374151' : '#ddd' }]}
              keyboardType="numeric"
              placeholder="Practical ICA 3"
              placeholderTextColor="#9ca3af"
              value={pIca3}
              onChangeText={setPIca3}
            />
          </View>

          <TouchableOpacity style={[styles.calcBtn, { backgroundColor: '#7c3aed' }]} onPress={calculatePracticalICA}>
            <Text style={styles.saveBtnText}>Calculate Practical ICA Contribution</Text>
          </TouchableOpacity>

          {practicalResult !== null && (
            <View style={[styles.resultBox, { backgroundColor: 'rgba(124, 58, 237, 0.1)' }]}>
              <Text style={[styles.resultTitle, { color: '#7c3aed' }]}>Practical Evaluation Summary</Text>
              <Text style={styles.resultText}>Best 2 ICAs Average: {practicalResult.bestAvg} / 100</Text>
              <Text style={[styles.resultHighlight, { color: '#7c3aed' }]}>Practical ICA Contribution (40%): {practicalResult.contribution}%</Text>
            </View>
          )}
        </View>
      )}

      {/* VLE Resource Link & Notes Section */}
      <View style={[styles.card, { backgroundColor: cardBg, marginBottom: 40 }]}>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { padding: 16, borderRadius: 14, marginBottom: 16, elevation: 2 },
  code: { fontSize: 13, fontWeight: 'bold', color: '#007AFF', marginBottom: 4 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  lecturer: { fontSize: 13 },
  badgeRow: { flexDirection: 'row', marginTop: 8 },
  badge: { padding: 6, borderRadius: 6, backgroundColor: 'rgba(0, 122, 255, 0.1)', alignSelf: 'flex-start' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  input: { borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 14, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  toggleBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  addTopicBtn: { backgroundColor: '#007AFF', padding: 10, borderRadius: 8, marginLeft: 8, justifyContent: 'center', alignItems: 'center', height: 44 },
  topicRow: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 8, marginTop: 6 },
  topicText: { marginLeft: 10, fontSize: 14, fontWeight: '500' },
  completedText: { textDecorationLine: 'line-through', color: '#9ca3af' },
  linkBtn: { backgroundColor: '#10b981', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  linkBtnText: { color: '#fff', fontWeight: 'bold' },
  saveBtn: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#fff', fontWeight: 'bold' },
  calcBtn: { backgroundColor: '#6366f1', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  resultBox: { marginTop: 12, padding: 12, backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: 8 },
  resultTitle: { color: '#4f46e5', fontWeight: 'bold', fontSize: 13, marginBottom: 4 },
  resultText: { color: '#374151', fontSize: 13, marginBottom: 2 },
  resultHighlight: { color: '#16a34a', fontWeight: 'bold', fontSize: 14 }
});
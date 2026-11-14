import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Linking } from 'react-native';
import { getAppData, saveAppData } from '../services/storage';
import { ThemeContext } from '../../App';

export default function CourseDetailScreen({ route }) {
  const { course } = route.params;
  const { isDark } = useContext(ThemeContext);

  // VLE / Resource Link State
  const [resourceLink, setResourceLink] = useState(course.resourceLink || '');
  const [notes, setNotes] = useState(course.notes || '');

  // ICA Marks Calculator State
  const [ica1, setIca1] = useState('');
  const [ica2, setIca2] = useState('');
  const [weight, setWeight] = useState('40'); // Default 40% ICA weight
  const [calculatedScore, setCalculatedScore] = useState(null);

  const handleSaveCourseDetails = async () => {
    const data = await getAppData();
    data.courses = data.courses.map(c => {
      if (c.id === course.id) {
        return { ...c, resourceLink, notes };
      }
      return c;
    });
    await saveAppData(data);
    Alert.alert('Saved', 'Course resources and notes updated!');
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

      {/* VLE Resource Link & Notes Section */}
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>VLE & Study Resources</Text>

        <Text style={[styles.label, { color: subText }]}>VLE / Google Drive Link</Text>
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

        <Text style={[styles.label, { color: subText, marginTop: 12 }]}>Quick Module Notes</Text>
        <TextInput
          style={[styles.input, { height: 70, color: textColor, borderColor: isDark ? '#374151' : '#ddd' }]}
          placeholder="Add lecture notes or syllabus details..."
          placeholderTextColor="#9ca3af"
          multiline
          value={notes}
          onChangeText={setNotes}
        />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveCourseDetails}>
          <Text style={styles.saveBtnText}>Save Resources & Notes</Text>
        </TouchableOpacity>
      </View>

      {/* ICA Marks Calculator Section */}
      <View style={[styles.card, { backgroundColor: cardBg, marginBottom: 30 }]}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>ICA Marks Calculator</Text>

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={[styles.label, { color: subText }]}>ICA 1 (Out of 100)</Text>
            <TextInput
              style={[styles.input, { color: textColor, borderColor: isDark ? '#374151' : '#ddd' }]}
              keyboardType="numeric"
              placeholder="80"
              placeholderTextColor="#9ca3af"
              value={ica1}
              onChangeText={setIca1}
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={[styles.label, { color: subText }]}>ICA 2 (Out of 100)</Text>
            <TextInput
              style={[styles.input, { color: textColor, borderColor: isDark ? '#374151' : '#ddd' }]}
              keyboardType="numeric"
              placeholder="75"
              placeholderTextColor="#9ca3af"
              value={ica2}
              onChangeText={setIca2}
            />
          </View>
        </View>

        <Text style={[styles.label, { color: subText }]}>Total ICA Weight (%)</Text>
        <TextInput
          style={[styles.input, { color: textColor, borderColor: isDark ? '#374151' : '#ddd' }]}
          keyboardType="numeric"
          value={weight}
          onChangeText={setWeight}
        />

        <TouchableOpacity style={styles.calcBtn} onPress={calculateICA}>
          <Text style={styles.saveBtnText}>Calculate ICA Contribution</Text>
        </TouchableOpacity>

        {calculatedScore !== null && (
          <View style={styles.resultBox}>
            <Text style={styles.resultText}>Earned ICA Marks: {calculatedScore} / {weight}%</Text>
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
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 10, fontSize: 14 },
  linkBtn: { backgroundColor: '#10b981', padding: 12, borderRadius: 8, alignItems: 'center' },
  linkBtnText: { color: '#fff', fontWeight: 'bold' },
  saveBtn: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 6 },
  saveBtnText: { color: '#fff', fontWeight: 'bold' },
  row: { flexDirection: 'row', gap: 10 },
  halfInput: { flex: 1 },
  calcBtn: { backgroundColor: '#6366f1', padding: 12, borderRadius: 8, alignItems: 'center' },
  resultBox: { marginTop: 12, padding: 12, backgroundColor: 'rgba(99, 102, 241, 0.15)', borderRadius: 8, alignItems: 'center' },
  resultText: { color: '#4f46e5', fontWeight: 'bold', fontSize: 15 }
});
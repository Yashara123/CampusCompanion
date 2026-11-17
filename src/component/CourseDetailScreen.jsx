import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Linking } from 'react-native';
import { getAppData, saveAppData } from '../services/storage';
import { ThemeContext } from '../../App';
import { Ionicons } from '@expo/vector-icons';

// University Grading Thresholds
const GRADE_TARGETS = [
  { grade: 'A+', minMark: 85 },
  { grade: 'A',  minMark: 75 },
  { grade: 'A-', minMark: 70 },
  { grade: 'B+', minMark: 65 },
  { grade: 'B',  minMark: 60 },
  { grade: 'B-', minMark: 55 },
  { grade: 'C+', minMark: 50 },
  { grade: 'C (Pass)', minMark: 45 },
];

export default function CourseDetailScreen({ route }) {
  const { course } = route.params;
  const { isDark } = useContext(ThemeContext);

  const [resourceLink, setResourceLink] = useState(course.resourceLink || '');
  const [notes, setNotes] = useState(course.notes || '');
  const [subTopics, setSubTopics] = useState(course.subTopics || []);
  const [newSubTopic, setNewSubTopic] = useState('');
  const [expandedTopicId, setExpandedTopicId] = useState(null);

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

  // Sync subTopics changes directly to AsyncStorage
  const syncSubTopicsToStorage = async (updatedTopics) => {
    setSubTopics(updatedTopics);
    const data = await getAppData();
    data.courses = data.courses.map(c => {
      if (c.id === course.id) return { ...c, subTopics: updatedTopics };
      return c;
    });
    await saveAppData(data);
  };

  const handleAddSubTopic = async () => {
    if (!newSubTopic.trim()) return;
    const newId = Date.now().toString();
    const updatedTopics = [
      ...subTopics,
      {
        id: newId,
        title: newSubTopic.trim(),
        completed: false,
        resourceLink: ''
      }
    ];
    await syncSubTopicsToStorage(updatedTopics);
    setNewSubTopic('');
    setExpandedTopicId(newId);
  };

  const toggleSubTopicComplete = async (id) => {
    const updatedTopics = subTopics.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    await syncSubTopicsToStorage(updatedTopics);
  };

  const updateSubTopicLink = (id, value) => {
    const updatedTopics = subTopics.map(t =>
      t.id === id ? { ...t, resourceLink: value } : t
    );
    setSubTopics(updatedTopics);
  };

  const handleSaveSubTopicLink = async () => {
    await syncSubTopicsToStorage(subTopics);
    Alert.alert('Saved', 'Sub-topic resource link saved!');
  };

  const handleDeleteSubTopic = (id) => {
    Alert.alert('Delete Sub-Topic', 'Remove this sub-topic?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updatedTopics = subTopics.filter(t => t.id !== id);
          await syncSubTopicsToStorage(updatedTopics);
          if (expandedTopicId === id) setExpandedTopicId(null);
        }
      }
    ]);
  };

  const handleOpenLink = (urlInput) => {
    if (!urlInput || !urlInput.trim()) {
      Alert.alert('No Link', 'Please enter a valid VLE, YouTube, or Drive URL first.');
      return;
    }
    const url = urlInput.trim().startsWith('http') ? urlInput.trim() : `https://${urlInput.trim()}`;
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Cannot open this URL.'));
  };

  // Helper to show exact weighted marks needed (out of 70 or 60) AND paper score (out of 100)
  const buildTargetList = (icaContrib, examWeight) => {
    const maxExamWeight = Math.round(examWeight * 100);

    return GRADE_TARGETS.map(item => {
      const neededFromExam = item.minMark - icaContrib;
      let status = '';
      let isImpossible = false;
      let isAchieved = false;

      if (neededFromExam <= 0) {
        status = 'Already Achieved! 🎉';
        isAchieved = true;
      } else {
        const requiredPaperScore = neededFromExam / examWeight;
        if (requiredPaperScore > 100) {
          status = `Need ${neededFromExam.toFixed(1)}/${maxExamWeight} (>100% Impossible)`;
          isImpossible = true;
        } else {
          status = `${neededFromExam.toFixed(1)}/${maxExamWeight}  ➔  ${Math.ceil(requiredPaperScore)}/100`;
        }
      }

      return {
        grade: item.grade,
        minMark: item.minMark,
        required: status,
        isImpossible,
        isAchieved
      };
    });
  };

  // Calculate Theory ICA (Best 2 of 3, 30% contribution + 70% End Exam Targets)
  const calculateTheoryICA = () => {
    const m1 = parseFloat(tIca1) || 0;
    const m2 = parseFloat(tIca2) || 0;
    const m3 = parseFloat(tIca3) || 0;

    const scores = [m1, m2, m3].sort((a, b) => b - a);
    const bestTwoAvg = (scores[0] + scores[1]) / 2;
    const contribution = bestTwoAvg * 0.30;

    setTheoryResult({
      bestAvg: bestTwoAvg.toFixed(2),
      contribution: contribution.toFixed(2),
      targets: buildTargetList(contribution, 0.70)
    });
  };

  // Calculate Practical ICA (Best 2 of 3, 40% contribution + 60% End Exam Targets)
  const calculatePracticalICA = () => {
    const m1 = parseFloat(pIca1) || 0;
    const m2 = parseFloat(pIca2) || 0;
    const m3 = parseFloat(pIca3) || 0;

    const scores = [m1, m2, m3].sort((a, b) => b - a);
    const bestTwoAvg = (scores[0] + scores[1]) / 2;
    const contribution = bestTwoAvg * 0.40;

    setPracticalResult({
      bestAvg: bestTwoAvg.toFixed(2),
      contribution: contribution.toFixed(2),
      targets: buildTargetList(contribution, 0.60)
    });
  };

  const bg = isDark ? '#111827' : '#f4f6f9';
  const cardBg = isDark ? '#1f2937' : '#ffffff';
  const textColor = isDark ? '#f9fafb' : '#1f2937';
  const subText = isDark ? '#9ca3af' : '#6c757d';
  const nestedBg = isDark ? '#283548' : '#f8fafc';

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

      {/* Theory ICA Calculator (30% Weight) & End Exam Predictor */}
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>📚 Theory ICA & Grade Target Predictor</Text>
        <Text style={{ color: subText, fontSize: 12, marginBottom: 10 }}>
          Enter Theory ICA marks (out of 100). Takes best 2 (30% weight) and shows marks needed from 70 & paper score out of 100.
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
          <Text style={styles.saveBtnText}>Calculate Theory ICA & Exam Targets</Text>
        </TouchableOpacity>

        {theoryResult !== null && (
          <View style={styles.resultBox}>
            <Text style={styles.resultTitle}>Theory Evaluation & Target Breakdown</Text>
            <Text style={styles.resultText}>Best 2 ICAs Average: {theoryResult.bestAvg} / 100</Text>
            <Text style={styles.resultHighlight}>Theory ICA Contribution: {theoryResult.contribution} / 30</Text>
            
            <View style={styles.divider} />
            <Text style={styles.targetHeader}>🎯 End Exam Need (Out of 70  ➔  Paper Out of 100):</Text>
            {theoryResult.targets.map(t => (
              <View key={t.grade} style={styles.targetRowBetween}>
                <Text style={styles.targetRow}>• <Text style={styles.boldTarget}>{t.grade}</Text> ({t.minMark}+):</Text>
                <Text style={[
                  styles.boldTarget, 
                  t.isImpossible && { color: '#ef4444' },
                  t.isAchieved && { color: '#16a34a' }
                ]}>
                  {t.required}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Practical ICA Calculator (40% Weight) & End Exam Predictor */}
      {hasPractical && (
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>🔬 Practical ICA & Grade Target Predictor</Text>
          <Text style={{ color: subText, fontSize: 12, marginBottom: 10 }}>
            Enter Practical ICA marks (out of 100). Takes best 2 (40% weight) and shows marks needed from 60 & paper score out of 100.
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
            <Text style={styles.saveBtnText}>Calculate Practical ICA & Exam Targets</Text>
          </TouchableOpacity>

          {practicalResult !== null && (
            <View style={[styles.resultBox, { backgroundColor: 'rgba(124, 58, 237, 0.1)' }]}>
              <Text style={[styles.resultTitle, { color: '#7c3aed' }]}>Practical Evaluation & Target Summary</Text>
              <Text style={styles.resultText}>Best 2 ICAs Average: {practicalResult.bestAvg} / 100</Text>
              <Text style={[styles.resultHighlight, { color: '#7c3aed' }]}>Practical ICA Contribution: {practicalResult.contribution} / 40</Text>

              <View style={styles.divider} />
              <Text style={[styles.targetHeader, { color: '#6d28d9' }]}>🎯 Practical Exam Need (Out of 60  ➔  Paper Out of 100):</Text>
              {practicalResult.targets.map(t => (
                <View key={t.grade} style={styles.targetRowBetween}>
                  <Text style={styles.targetRow}>• <Text style={styles.boldTarget}>{t.grade}</Text> ({t.minMark}+):</Text>
                  <Text style={[
                    styles.boldTarget, 
                    t.isImpossible && { color: '#ef4444' },
                    t.isAchieved && { color: '#16a34a' }
                  ]}>
                    {t.required}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Sub-Topics with Per-Topic Resource Link */}
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>📖 Sub-Topics & Resource Links</Text>
        <Text style={{ color: subText, fontSize: 12, marginBottom: 10 }}>
          Add syllabus sub-topics and attach a direct VLE, Drive, or YouTube resource link to each topic.
        </Text>
        
        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1, color: textColor, borderColor: isDark ? '#374151' : '#ddd' }]}
            placeholder="Add sub-topic (e.g., Lesson 01: Normalization)"
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
          subTopics.map(topic => {
            const isExpanded = expandedTopicId === topic.id;
            const hasLink = Boolean(topic.resourceLink && topic.resourceLink.trim());

            return (
              <View key={topic.id} style={[styles.topicContainer, { borderColor: isDark ? '#374151' : '#e5e7eb' }]}>
                {/* Topic Header Row */}
                <View style={[styles.topicHeaderRow, { backgroundColor: isDark ? '#374151' : '#f3f4f6' }]}>
                  <TouchableOpacity onPress={() => toggleSubTopicComplete(topic.id)} style={{ paddingRight: 8 }}>
                    <Ionicons 
                      name={topic.completed ? "checkbox" : "square-outline"} 
                      size={22} 
                      color={topic.completed ? "#16a34a" : "#007AFF"} 
                    />
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={{ flex: 1 }} 
                    onPress={() => setExpandedTopicId(isExpanded ? null : topic.id)}
                  >
                    <Text style={[
                      styles.topicText, 
                      { color: textColor }, 
                      topic.completed && styles.completedText
                    ]}>
                      {topic.title}
                    </Text>
                    {hasLink && !isExpanded && (
                      <Text style={{ fontSize: 11, color: '#10b981', marginTop: 2 }}>
                        🔗 Resource link attached (Tap to view/open)
                      </Text>
                    )}
                  </TouchableOpacity>

                  {hasLink && !isExpanded && (
                    <TouchableOpacity 
                      onPress={() => handleOpenLink(topic.resourceLink)}
                      style={{ paddingHorizontal: 8 }}
                    >
                      <Ionicons name="open-outline" size={20} color="#10b981" />
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity 
                    onPress={() => setExpandedTopicId(isExpanded ? null : topic.id)}
                    style={{ paddingHorizontal: 6 }}
                  >
                    <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color={subText} />
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => handleDeleteSubTopic(topic.id)} style={{ paddingLeft: 4 }}>
                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>

                {/* Expandable Body: Resource Link Input & Actions */}
                {isExpanded && (
                  <View style={[styles.topicDetailsBox, { backgroundColor: nestedBg }]}>
                    <Text style={[styles.fieldLabel, { color: textColor }]}>🔗 Resource Link (VLE PDF / Google Drive / Video)</Text>
                    <View style={styles.row}>
                      <TextInput
                        style={[styles.input, { flex: 1, color: textColor, borderColor: isDark ? '#4b5563' : '#d1d5db', marginBottom: 0 }]}
                        placeholder="https://..."
                        placeholderTextColor="#9ca3af"
                        value={topic.resourceLink || ''}
                        onChangeText={(val) => updateSubTopicLink(topic.id, val)}
                      />
                      <TouchableOpacity 
                        style={styles.miniOpenBtn} 
                        onPress={() => handleOpenLink(topic.resourceLink)}
                      >
                        <Ionicons name="open-outline" size={18} color="#fff" />
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.saveSubBtn} onPress={handleSaveSubTopicLink}>
                      <Text style={styles.saveBtnText}>💾 Save Resource Link</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        )}
      </View>

      {/* General Course VLE Resource Link & Notes Section */}
      <View style={[styles.card, { backgroundColor: cardBg, marginBottom: 40 }]}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>🌐 Main Course VLE Link & General Notes</Text>
        <TextInput
          style={[styles.input, { color: textColor, borderColor: isDark ? '#374151' : '#ddd' }]}
          placeholder="e.g., https://vle.vau.ac.lk/course/..."
          placeholderTextColor="#9ca3af"
          value={resourceLink}
          onChangeText={setResourceLink}
        />
        <TouchableOpacity style={styles.linkBtn} onPress={() => handleOpenLink(resourceLink)}>
          <Text style={styles.linkBtnText}>🔗 Open Main Course Link</Text>
        </TouchableOpacity>

        <TextInput
          style={[styles.input, { height: 60, color: textColor, borderColor: isDark ? '#374151' : '#ddd', marginTop: 12 }]}
          placeholder="General module notes..."
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
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  input: { borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 14, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  toggleBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  addTopicBtn: { backgroundColor: '#007AFF', padding: 10, borderRadius: 8, marginLeft: 8, justifyContent: 'center', alignItems: 'center', height: 44, marginBottom: 8 },
  topicContainer: { borderWidth: 1, borderRadius: 10, marginTop: 8, overflow: 'hidden' },
  topicHeaderRow: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  topicText: { fontSize: 14, fontWeight: '600' },
  completedText: { textDecorationLine: 'line-through', color: '#9ca3af' },
  topicDetailsBox: { padding: 12, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)' },
  fieldLabel: { fontSize: 12, fontWeight: 'bold', marginBottom: 6 },
  miniOpenBtn: { backgroundColor: '#10b981', padding: 10, borderRadius: 8, marginLeft: 8, justifyContent: 'center', alignItems: 'center', height: 42 },
  saveSubBtn: { backgroundColor: '#0284c7', padding: 10, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  linkBtn: { backgroundColor: '#10b981', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  linkBtnText: { color: '#fff', fontWeight: 'bold' },
  saveBtn: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#fff', fontWeight: 'bold' },
  calcBtn: { backgroundColor: '#6366f1', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  resultBox: { marginTop: 12, padding: 14, backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: 10 },
  resultTitle: { color: '#4f46e5', fontWeight: 'bold', fontSize: 14, marginBottom: 4 },
  resultText: { color: '#374151', fontSize: 13, marginBottom: 2 },
  resultHighlight: { color: '#16a34a', fontWeight: 'bold', fontSize: 14, marginBottom: 4 },
  divider: { height: 1, backgroundColor: 'rgba(0,0,0,0.1)', marginVertical: 8 },
  targetHeader: { fontSize: 12, fontWeight: 'bold', color: '#1e40af', marginBottom: 6 },
  targetRowBetween: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3, borderBottomWidth: 0.5, borderBottomColor: 'rgba(0,0,0,0.05)' },
  targetRow: { fontSize: 13, color: '#374151' },
  boldTarget: { fontWeight: 'bold', color: '#111827', fontSize: 12 }
});
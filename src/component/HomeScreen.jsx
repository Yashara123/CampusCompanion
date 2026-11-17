import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { getAppData } from '../services/storage';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../../App';

export default function HomeScreen({ navigation }) {
  const [stats, setStats] = useState({ courses: 0, pending: 0, completed: 0, total: 0 });
  const [todayFocus, setTodayFocus] = useState({ total: 0, done: 0 });
  const [weeklyFocus, setWeeklyFocus] = useState({ total: 0, done: 0 });
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const { isDark, toggleTheme } = useContext(ThemeContext);

  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const isSunday = todayName === 'Sunday';

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadStats();
    });
    loadStats();
    return unsubscribe;
  }, [navigation]);

  const loadStats = async () => {
    const data = await getAppData();
    const coursesCount = data.courses ? data.courses.length : 0;
    const allAssignments = data.assignments || [];
    const pendingCount = allAssignments.filter(a => a.status === 'Pending').length;
    const completedCount = allAssignments.filter(a => a.status === 'Completed').length;
    setStats({ courses: coursesCount, pending: pendingCount, completed: completedCount, total: allAssignments.length });

    // Load Today's & Weekly Daily Focus progress
    const planList = data.studyPlan || [];
    const todaysGoals = planList.filter(item => item.day === todayName);
    const todaysDone = todaysGoals.filter(item => item.completed).length;
    setTodayFocus({ total: todaysGoals.length, done: todaysDone });

    const weeklyDone = planList.filter(item => item.completed).length;
    setWeeklyFocus({ total: planList.length, done: weeklyDone });
  };

  const completionPercentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const bg = isDark ? '#111827' : '#f4f6f9';
  const cardBg = isDark ? '#1f2937' : '#ffffff';
  const textColor = isDark ? '#f9fafb' : '#1f2937';
  const subText = isDark ? '#9ca3af' : '#6c757d';

  return (
    <ScrollView style={[styles.container, { backgroundColor: bg }]}>
      {/* Welcome Banner with Theme Toggle */}
      <View style={[styles.welcomeCard, { backgroundColor: cardBg }]}>
        <View>
          <Text style={[styles.welcomeSubtitle, { color: subText }]}>{todayName} Overview</Text>
          <Text style={[styles.welcomeTitle, { color: textColor }]}>Campus Companion</Text>
        </View>
        <TouchableOpacity onPress={toggleTheme} style={styles.themeBtn}>
          <Ionicons name={isDark ? 'sunny' : 'moon'} size={24} color={isDark ? '#fbbf24' : '#007AFF'} />
        </TouchableOpacity>
      </View>

      {/* Sunday Weekly Review & Daily Focus Reminder Card */}
      <TouchableOpacity
        activeOpacity={0.8}
        style={[
          styles.reminderBanner,
          { backgroundColor: isSunday ? '#7c3aed' : (isDark ? '#312e81' : '#ede9fe') }
        ]}
        onPress={() => setReviewModalVisible(true)}
      >
        <Ionicons
          name="notifications"
          size={24}
          color={isSunday ? '#ffffff' : '#7c3aed'}
        />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{
            fontWeight: 'bold',
            fontSize: 14,
            color: isSunday ? '#ffffff' : (isDark ? '#e0e7ff' : '#4c1d95')
          }}>
            {isSunday ? '🔔 Sunday Weekly Review Day!' : '📅 Weekly Review & Daily Focus'}
          </Text>
          <Text style={{
            fontSize: 12,
            marginTop: 2,
            color: isSunday ? '#ede9fe' : (isDark ? '#c7d2fe' : '#5b21b6')
          }}>
            {isSunday
              ? 'Time to review this week and update next week’s Daily Focus!'
              : `Today (${todayName}): ${todayFocus.done}/${todayFocus.total} focus goals done. Tap to review.`}
          </Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={isSunday ? '#ffffff' : '#7c3aed'}
        />
      </TouchableOpacity>

      {/* Progress Bar Card */}
      <View style={[styles.progressCard, { backgroundColor: cardBg }]}>
        <View style={styles.progressHeader}>
          <Text style={[styles.sectionHeader, { color: textColor, marginBottom: 0 }]}>Overall ICA Progress</Text>
          <Text style={styles.percentageText}>{completionPercentage}%</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${completionPercentage}%` }]} />
        </View>
        <Text style={[styles.progressSub, { color: subText }]}>
          {stats.completed} of {stats.total} assignments complet
        </Text>
      </View>

      <Text style={[styles.sectionHeader, { color: textColor }]}>Quick Overview</Text>
      
      {/* Stats Row */}
      <View style={styles.statsRow}>
        <TouchableOpacity 
          style={[styles.statCard, { backgroundColor: isDark ? '#1e3a8a' : '#eef2ff' }]}
          onPress={() => navigation.navigate('Courses')}
        >
          <Ionicons name="book" size={26} color={isDark ? '#93c5fd' : '#007AFF'} style={styles.iconStyle} />
          <Text style={[styles.statNumber, { color: isDark ? '#ffffff' : '#007AFF' }]}>{stats.courses}</Text>
          <Text style={[styles.statLabel, { color: isDark ? '#dbeafe' : '#4b5563' }]}>Enrolled Courses</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.statCard, { backgroundColor: isDark ? '#78350f' : '#fef3c7' }]}
          onPress={() => navigation.navigate('Assignments')}
        >
          <Ionicons name="time" size={26} color={isDark ? '#fcd34d' : '#d97706'} style={styles.iconStyle} />
          <Text style={[styles.statNumber, { color: isDark ? '#ffffff' : '#d97706' }]}>{stats.pending}</Text>
          <Text style={[styles.statLabel, { color: isDark ? '#fef3c7' : '#4b5563' }]}>Pending ICAs</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.statCardFull, { backgroundColor: isDark ? '#14532d' : '#f0fdf4' }]}
        onPress={() => navigation.navigate('Assignments')}
      >
        <View style={styles.completedRow}>
          <Ionicons name="checkmark-circle" size={32} color={isDark ? '#86efac' : '#16a34a'} />
          <View style={styles.completedTextContainer}>
            <Text style={[styles.statNumber, { color: isDark ? '#ffffff' : '#16a34a', fontSize: 20 }]}>{stats.completed} Complet</Text>
            <Text style={[styles.statLabel, { color: isDark ? '#dcfce7' : '#4b5563' }]}>Tap to view all submissions</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Cross-Platform Weekly Review Modal (Works on both Mobile & Web) */}
      <Modal
        visible={reviewModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: cardBg }]}>
            <View style={styles.modalHeader}>
              <Ionicons name="notifications-circle" size={32} color="#7c3aed" />
              <Text style={[styles.modalTitle, { color: textColor }]}>Sunday Weekly Review</Text>
            </View>

            <Text style={[styles.modalBody, { color: subText }]}>
              Weekly Study Focus Summary: You have complet{' '}
              <Text style={{ fontWeight: 'bold', color: '#16a34a' }}>{weeklyFocus.done}</Text> out of{' '}
              <Text style={{ fontWeight: 'bold', color: textColor }}>{weeklyFocus.total}</Text> weekly goals.
            </Text>

            <Text style={[styles.modalBody, { color: subText, marginTop: 8 }]}>
              Review your completed syllabus sub-topics and update your Daily Focus plan for the upcoming week!
            </Text>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { borderColor: isDark ? '#374151' : '#d1d5db' }]}
                onPress={() => setReviewModalVisible(false)}
              >
                <Text style={{ color: textColor, fontWeight: '600' }}>Close</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={() => {
                  setReviewModalVisible(false);
                  navigation.navigate('Planner');
                }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Update Daily Focus ➔</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  welcomeCard: { padding: 20, borderRadius: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  welcomeSubtitle: { fontSize: 13, fontWeight: '600' },
  welcomeTitle: { fontSize: 22, fontWeight: 'bold', marginTop: 2 },
  themeBtn: { padding: 10, borderRadius: 12, backgroundColor: 'rgba(0,122,255,0.1)' },
  reminderBanner: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, marginBottom: 16, elevation: 2 },
  progressCard: { padding: 18, borderRadius: 16, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  percentageText: { fontSize: 18, fontWeight: 'bold', color: '#007AFF' },
  progressBarBg: { height: 10, backgroundColor: '#e5e7eb', borderRadius: 5, overflow: 'hidden', marginBottom: 8 },
  progressBarFill: { height: '100%', backgroundColor: '#007AFF', borderRadius: 5 },
  progressSub: { fontSize: 12 },
  sectionHeader: { fontSize: 17, fontWeight: 'bold', marginBottom: 12 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  statCard: { flex: 1, padding: 18, borderRadius: 16 },
  statCardFull: { padding: 18, borderRadius: 16, marginBottom: 24 },
  completedRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  completedTextContainer: { flex: 1 },
  iconStyle: { marginBottom: 8 },
  statNumber: { fontSize: 26, fontWeight: 'bold', marginBottom: 2 },
  statLabel: { fontSize: 13, fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { width: '100%', maxWidth: 400, borderRadius: 16, padding: 20, elevation: 5 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 8 },
  modalBody: { fontSize: 14, lineHeight: 20 },
  modalBtnRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20, gap: 10 },
  modalCancelBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1 },
  modalConfirmBtn: { backgroundColor: '#7c3aed', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 }
});
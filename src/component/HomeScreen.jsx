import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { getAppData } from '../services/storage';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../../App';

export default function HomeScreen({ navigation }) {
  const [stats, setStats] = useState({ courses: 0, pending: 0, completed: 0, total: 0 });
  const { isDark, toggleTheme } = useContext(ThemeContext);

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
          <Text style={[styles.welcomeSubtitle, { color: subText }]}>University of Vavuniya • ICT</Text>
          <Text style={[styles.welcomeTitle, { color: textColor }]}>Campus Companion</Text>
        </View>
        <TouchableOpacity onPress={toggleTheme} style={styles.themeBtn}>
          <Ionicons name={isDark ? 'sunny' : 'moon'} size={24} color={isDark ? '#fbbf24' : '#007AFF'} />
        </TouchableOpacity>
      </View>

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
          {stats.completed} of {stats.total} assignments completed
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
            <Text style={[styles.statNumber, { color: isDark ? '#ffffff' : '#16a34a', fontSize: 20 }]}>{stats.completed} Completed</Text>
            <Text style={[styles.statLabel, { color: isDark ? '#dcfce7' : '#4b5563' }]}>Tap to view all submissions</Text>
          </View>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  welcomeCard: { padding: 20, borderRadius: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  welcomeSubtitle: { fontSize: 13, fontWeight: '600' },
  welcomeTitle: { fontSize: 22, fontWeight: 'bold', marginTop: 2 },
  themeBtn: { padding: 10, borderRadius: 12, backgroundColor: 'rgba(0,122,255,0.1)' },
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
  statLabel: { fontSize: 13, fontWeight: '500' }
});

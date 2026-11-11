import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { getAppData } from '../services/storage';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  const [stats, setStats] = useState({ courses: 0, pending: 0, completed: 0 });

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadStats();
    });
    return unsubscribe;
  }, [navigation]);

  const loadStats = async () => {
    const data = await getAppData();
    const coursesCount = data.courses ? data.courses.length : 0;
    const pendingCount = data.assignments ? data.assignments.filter(a => a.status === 'Pending').length : 0;
    const completedCount = data.assignments ? data.assignments.filter(a => a.status === 'Completed').length : 0;
    setStats({ courses: coursesCount, pending: pendingCount, completed: completedCount });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Welcome Banner */}
      <View style={styles.welcomeCard}>
        <View>
          <Text style={styles.welcomeSubtitle}>Welcome Back 👋</Text>
          <Text style={styles.welcomeTitle}>Campus Companion</Text>
        </View>
        <Ionicons name="school" size={40} color="#007AFF" />
      </View>

      <Text style={styles.sectionHeader}>Dashboard Overview</Text>
      
      {/* Stats Cards Row */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: '#eef2ff' }]}>
          <Ionicons name="book" size={26} color="#007AFF" style={styles.iconStyle} />
          <Text style={styles.statNumber}>{stats.courses}</Text>
          <Text style={styles.statLabel}>Enrolled Courses</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#fef3c7' }]}>
          <Ionicons name="time" size={26} color="#d97706" style={styles.iconStyle} />
          <Text style={[styles.statNumber, { color: '#d97706' }]}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pending ICAs</Text>
        </View>
      </View>

      {/* Completed Banner Full Width */}
      <View style={[styles.statCardFull, { backgroundColor: '#f0fdf4' }]}>
        <View style={styles.completedRow}>
          <Ionicons name="checkmark-circle" size={32} color="#16a34a" />
          <View style={styles.completedTextContainer}>
            <Text style={[styles.statNumber, { color: '#16a34a', fontSize: 22 }]}>{stats.completed} Completed</Text>
            <Text style={styles.statLabel}>Assignments successfully finished</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 16 },
  welcomeCard: { backgroundColor: '#fff', padding: 20, borderRadius: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  welcomeSubtitle: { fontSize: 14, color: '#6c757d', fontWeight: '500' },
  welcomeTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginTop: 2 },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  statCard: { flex: 1, padding: 18, borderRadius: 16, alignItems: 'flex-start', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 5, elevation: 1 },
  statCardFull: { padding: 20, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 5, elevation: 1, marginBottom: 20 },
  completedRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  completedTextContainer: { flex: 1 },
  iconStyle: { marginBottom: 10 },
  statNumber: { fontSize: 26, fontWeight: 'bold', color: '#007AFF', marginBottom: 2 },
  statLabel: { fontSize: 13, color: '#555', fontWeight: '500' }
});
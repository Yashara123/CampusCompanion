import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getAppData } from '../services/storage';
import { ThemeContext } from '../../App';

export default function AssignmentsScreen({ navigation }) {
  const [assignments, setAssignments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [loading, setLoading] = useState(true);
  const { isDark } = useContext(ThemeContext);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadAssignments();
    });
    loadAssignments();
    return unsubscribe;
  }, [navigation]);

  const loadAssignments = async () => {
    const data = await getAppData();
    setAssignments(data.assignments || []);
    setLoading(false);
  };

  const filteredAssignments = assignments.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.courseCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'All' ? true : item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const bg = isDark ? '#111827' : '#f4f6f9';
  const cardBg = isDark ? '#1f2937' : '#ffffff';
  const textColor = isDark ? '#f9fafb' : '#1f2937';
  const subText = isDark ? '#9ca3af' : '#6c757d';

  if (loading) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: bg }]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <Text style={[styles.headerTitle, { color: textColor }]}>Assignments & ICAs</Text>

      <TextInput
        style={[styles.searchBar, { backgroundColor: cardBg, color: textColor, borderColor: isDark ? '#374151' : '#ddd' }]}
        placeholder="Search by title or course code..."
        placeholderTextColor={subText}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <View style={styles.filterContainer}>
        {['All', 'Pending', 'Completed'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              { backgroundColor: isDark ? '#374151' : '#e5e7eb' },
              filterStatus === status && styles.activeFilterButton
            ]}
            onPress={() => setFilterStatus(status)}
          >
            <Text style={[
              styles.filterText,
              { color: isDark ? '#d1d5db' : '#4b5563' },
              filterStatus === status && styles.activeFilterText
            ]}>
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredAssignments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.assignmentCard, { backgroundColor: cardBg }]}
            onPress={() => navigation.navigate('AssignmentDetail', { assignment: item })}
          >
            <View style={styles.cardTopRow}>
              <View style={styles.badgeRow}>
                <Text style={styles.courseCodeBadge}>{item.courseCode}</Text>
                {item.priority === 'High' && item.status === 'Pending' && (
                  <Text style={styles.urgentBadge}>🔥 Urgent</Text>
                )}
              </View>
              <Text style={[styles.statusText, item.status === 'Completed' ? styles.completedColor : styles.pendingColor]}>
                {item.status}
              </Text>
            </View>
            <Text style={[styles.assignmentTitle, { color: textColor }]}>{item.title}</Text>
            <Text style={[styles.dueDateText, { color: subText }]}>Due Date: {item.dueDate}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={[styles.emptyText, { color: subText }]}>No assignments found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 48 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 14 },
  searchBar: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: 1, marginBottom: 12, fontSize: 14 },
  filterContainer: { flexDirection: 'row', marginBottom: 16, gap: 8 },
  filterButton: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20 },
  activeFilterButton: { backgroundColor: '#007AFF' },
  filterText: { fontSize: 13, fontWeight: '500' },
  activeFilterText: { color: '#fff', fontWeight: 'bold' },
  listContainer: { paddingBottom: 20 },
  assignmentCard: { padding: 16, borderRadius: 14, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  badgeRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  courseCodeBadge: { fontSize: 12, fontWeight: 'bold', color: '#007AFF', backgroundColor: 'rgba(0,122,255,0.12)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  urgentBadge: { fontSize: 11, fontWeight: 'bold', color: '#dc2626', backgroundColor: '#fee2e2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  pendingColor: { color: '#d97706' },
  completedColor: { color: '#16a34a' },
  assignmentTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  dueDateText: { fontSize: 13 },
  emptyText: { textAlign: 'center', marginTop: 40, fontSize: 14 }
});

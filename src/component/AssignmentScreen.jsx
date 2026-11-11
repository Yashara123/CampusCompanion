import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getAppData } from '../services/storage';

export default function AssignmentsScreen({ navigation }) {
  const [assignments, setAssignments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadAssignments();
    });
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

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Assignments & ICAs</Text>

      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search by title or course code..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {['All', 'Pending', 'Completed'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[styles.filterButton, filterStatus === status && styles.activeFilterButton]}
            onPress={() => setFilterStatus(status)}
          >
            <Text style={[styles.filterText, filterStatus === status && styles.activeFilterText]}>
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Assignments List */}
      <FlatList
        data={filteredAssignments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.assignmentCard}
            onPress={() => navigation.navigate('AssignmentDetail', { assignment: item })}
          >
            <View style={styles.cardTopRow}>
              <Text style={styles.courseCodeBadge}>{item.courseCode}</Text>
              <Text style={[styles.statusText, item.status === 'Completed' ? styles.completedColor : styles.pendingColor]}>
                {item.status}
              </Text>
            </View>
            <Text style={styles.assignmentTitle}>{item.title}</Text>
            <Text style={styles.dueDateText}>Due Date: {item.dueDate}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>No assignments found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 16 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12, color: '#333' },
  searchBar: { backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginBottom: 12, fontSize: 14 },
  filterContainer: { flexDirection: 'row', marginBottom: 16, gap: 8 },
  filterButton: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#e9ecef' },
  activeFilterButton: { backgroundColor: '#007AFF' },
  filterText: { fontSize: 13, color: '#495057', fontWeight: '500' },
  activeFilterText: { color: '#fff', fontWeight: 'bold' },
  listContainer: { paddingBottom: 20 },
  assignmentCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  courseCodeBadge: { fontSize: 12, fontWeight: 'bold', color: '#007AFF', backgroundColor: '#eef2ff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  pendingColor: { color: '#d97706' },
  completedColor: { color: '#16a34a' },
  assignmentTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  dueDateText: { fontSize: 13, color: '#6c757d' },
  emptyText: { textAlign: 'center', color: '#6c757d', marginTop: 40, fontSize: 14 }
});
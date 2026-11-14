import React, { useState, createContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './src/component/HomeScreen';
import CoursesScreen from './src/component/CoursesScreen';
import CourseDetailScreen from './src/component/CourseDetailScreen';
import AssignmentsScreen from './src/component/AssignmentsScreen';
import AssignmentDetailScreen from './src/component/AssignmentDetailScreen';
import AddTaskScreen from './src/component/AddTaskScreen';
import GPAScreen from './src/component/GPAScreen';
import CalendarScreen from './src/component/CalendarScreen';
import StudyPlannerScreen from './src/component/StudyPlannerScreen'; // <-- Aluth Import

export const ThemeContext = createContext();

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function CoursesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="CoursesList" component={CoursesScreen} options={{ title: 'My Courses' }} />
      <Stack.Screen name="CourseDetail" component={CourseDetailScreen} options={{ title: 'Module Resources & ICA' }} />
    </Stack.Navigator>
  );
}

function AssignmentsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="AssignmentsList" component={AssignmentsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AssignmentDetail" component={AssignmentDetailScreen} options={{ title: 'Assignment Details' }} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const toggleTheme = () => setIsDark(!isDark);

  return (
    <View style={styles.screenContainer}>
      <ThemeContext.Provider value={{ isDark, toggleTheme }}>
        <NavigationContainer theme={isDark ? DarkTheme : DefaultTheme}>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName;
                if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
                else if (route.name === 'Courses') iconName = focused ? 'book' : 'book-outline';
                else if (route.name === 'Planner') iconName = focused ? 'today' : 'today-outline'; // <-- Icon
                else if (route.name === 'Calendar') iconName = focused ? 'calendar' : 'calendar-outline';
                else if (route.name === 'Assignments') iconName = focused ? 'document-text' : 'document-text-outline';
                else if (route.name === 'GPA') iconName = focused ? 'calculator' : 'calculator-outline';
                return <Ionicons name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: '#007AFF',
              tabBarInactiveTintColor: isDark ? '#9ca3af' : 'gray',
            })}
          >
            <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Dashboard' }} />
            <Tab.Screen name="Courses" component={CoursesStack} options={{ headerShown: false }} />
            <Tab.Screen name="Planner" component={StudyPlannerScreen} options={{ title: 'Daily Focus' }} />
            <Tab.Screen name="Calendar" component={CalendarScreen} options={{ title: 'Schedule' }} />
            <Tab.Screen name="Assignments" component={AssignmentsStack} options={{ headerShown: false }} />
            <Tab.Screen name="GPA" component={GPAScreen} options={{ title: 'GPA Calc' }} />
            <Tab.Screen name="Add Task" component={AddTaskScreen} options={{ tabBarButton: () => null }} />
          </Tab.Navigator>
        </NavigationContainer>
      </ThemeContext.Provider>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: { flex: 1, width: '100%', height: '100%', backgroundColor: '#f4f6f9' },
});
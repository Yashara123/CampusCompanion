import React, { useState, useEffect, useRef, createContext } from 'react';
import { View, TouchableOpacity, Alert, Platform, StyleSheet } from 'react-native';
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
import StudyPlannerScreen from './src/component/StudyPlannerScreen';

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
  const navigationRef = useRef(null);

  // Sunday Weekly Review & Daily Focus Update Notification (Mobile & Web)
  const triggerSundayReviewNotification = () => {
    if (Platform.OS === 'web') {
      const goToPlanner = window.confirm(
        '🔔 Sunday Weekly Review Reminder\n\nHappy Sunday! Time to review your weekly syllabus progress and update your Daily Focus goals for the upcoming week.\n\nClick OK to open Daily Focus.'
      );
      if (goToPlanner && navigationRef.current) {
        navigationRef.current.navigate('Planner');
      }
      return;
    }

    Alert.alert(
      '🔔 Sunday Weekly Review Reminder',
      'Happy Sunday! Time to review your weekly syllabus progress and update your Daily Focus goals for the upcoming week.',
      [
        { text: 'Later', style: 'cancel' },
        {
          text: 'Update Daily Focus ➔',
          onPress: () => {
            if (navigationRef.current) {
              navigationRef.current.navigate('Planner');
            }
          }
        }
      ]
    );
  };

  // Automatically check if today is Sunday (getDay() === 0) when app opens
  useEffect(() => {
    const today = new Date();
    if (today.getDay() === 0) {
      const timer = setTimeout(() => {
        triggerSundayReviewNotification();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <View style={styles.screenContainer}>
      <ThemeContext.Provider value={{ isDark, toggleTheme }}>
        <NavigationContainer ref={navigationRef} theme={isDark ? DarkTheme : DefaultTheme}>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName;
                if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
                else if (route.name === 'Courses') iconName = focused ? 'book' : 'book-outline';
                else if (route.name === 'Planner') iconName = focused ? 'today' : 'today-outline';
                else if (route.name === 'Calendar') iconName = focused ? 'calendar' : 'calendar-outline';
                else if (route.name === 'Assignments') iconName = focused ? 'document-text' : 'document-text-outline';
                else if (route.name === 'GPA') iconName = focused ? 'calculator' : 'calculator-outline';
                return <Ionicons name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: '#007AFF',
              tabBarInactiveTintColor: isDark ? '#9ca3af' : 'gray',
            })}
          >
            <Tab.Screen
              name="Home"
              component={HomeScreen}
              options={{
                title: 'Dashboard',
                headerRight: () => (
                  <TouchableOpacity
                    onPress={triggerSundayReviewNotification}
                    style={{ marginRight: 16, padding: 4 }}
                  >
                    <Ionicons name="notifications-outline" size={24} color="#007AFF" />
                  </TouchableOpacity>
                ),
              }}
            />
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
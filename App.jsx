import React, { useState, createContext } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './src/component/HomeScreen';
import CoursesScreen from './src/component/CoursesScreen';
import AssignmentsScreen from './src/component/AssignmentsScreen';
import AddTaskScreen from './src/component/AddTaskScreen';
import AssignmentDetailScreen from './src/component/AssignmentDetailScreen';

export const ThemeContext = createContext();

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function AssignmentsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="AssignmentsList" 
        component={AssignmentsScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AssignmentDetail" 
        component={AssignmentDetailScreen} 
        options={{ title: 'Assignment Details' }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <NavigationContainer theme={isDark ? DarkTheme : DefaultTheme}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
              else if (route.name === 'Courses') iconName = focused ? 'book' : 'book-outline';
              else if (route.name === 'Assignments') iconName = focused ? 'document-text' : 'document-text-outline';
              else if (route.name === 'Add Task') iconName = focused ? 'add-circle' : 'add-circle-outline';
              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#007AFF',
            tabBarInactiveTintColor: isDark ? '#9ca3af' : 'gray',
            headerStyle: { backgroundColor: isDark ? '#1f2937' : '#ffffff' },
            headerTintColor: isDark ? '#ffffff' : '#1f2937',
          })}
        >
          <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Dashboard' }} />
          <Tab.Screen name="Courses" component={CoursesScreen} options={{ title: 'My Courses' }} />
          <Tab.Screen name="Assignments" component={AssignmentsStack} options={{ headerShown: false }} />
          <Tab.Screen name="Add Task" component={AddTaskScreen} options={{ title: 'New Assignment' }} />
        </Tab.Navigator>
      </NavigationContainer>
    </ThemeContext.Provider>
  );
}

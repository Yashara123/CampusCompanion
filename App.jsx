import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Placeholder screens for Day 1
function HomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Dashboard / Home Screen</Text>
    </View>
  );
}

function CoursesScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Courses Screen</Text>
    </View>
  );
}

function AssignmentsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Assignments Screen</Text>
    </View>
  );
}

function AddAssignmentScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Add Assignment Screen</Text>
    </View>
  );
}

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
            else if (route.name === 'Courses') iconName = focused ? 'book' : 'book-outline';
            else if (route.name === 'Assignments') iconName = focused ? 'list' : 'list-outline';
            else if (route.name === 'Add Task') iconName = focused ? 'add-circle' : 'add-circle-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Courses" component={CoursesScreen} />
        <Tab.Screen name="Assignments" component={AssignmentsScreen} />
        <Tab.Screen name="Add Task" component={AddAssignmentScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
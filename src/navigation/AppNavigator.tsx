import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { RootStackParamList, MainTabParamList, CategoryStackParamList } from './types';
import { HomeScreen } from '../screens/HomeScreen';
import { CategoryListScreen } from '../screens/CategoryListScreen';
import { CategoryFeedScreen } from '../screens/CategoryFeedScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { BookmarksScreen } from '../screens/BookmarksScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ArticleDetailScreen } from '../screens/ArticleDetailScreen';
import { ArticleWebViewScreen } from '../screens/ArticleWebViewScreen';
import { SignInScreen } from '../screens/SignInScreen';
import { SignUpScreen } from '../screens/SignUpScreen';
import { AdminDashboardScreen } from '../screens/AdminDashboardScreen';
import { ManageSourcesScreen } from '../screens/ManageSourcesScreen';
import { ManageArticlesScreen } from '../screens/ManageArticlesScreen';
import { IngestionLogsScreen } from '../screens/IngestionLogsScreen';
import { COLORS, FONT_SIZES } from '../constants/theme';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const CategoryStack = createStackNavigator<CategoryStackParamList>();

// Category Stack Navigator
const CategoryNavigator = () => {
  return (
    <CategoryStack.Navigator>
      <CategoryStack.Screen
        name="CategoryList"
        component={CategoryListScreen}
        options={{ headerShown: false }}
      />
      <CategoryStack.Screen
        name="CategoryFeed"
        component={CategoryFeedScreen}
        options={({ route }) => ({
          title: route.params.categoryName,
          headerStyle: { backgroundColor: COLORS.background },
          headerTintColor: COLORS.text,
        })}
      />
    </CategoryStack.Navigator>
  );
};

// Bottom Tab Navigator
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 56,
          paddingBottom: 6,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: FONT_SIZES.xs,
          fontWeight: '600',
          marginTop: -4,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>🏠</Text>
          ),
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Categories"
        component={CategoryNavigator}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>📂</Text>
          ),
          tabBarLabel: 'Categories',
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>🔍</Text>
          ),
          tabBarLabel: 'Search',
        }}
      />
      <Tab.Screen
        name="Bookmarks"
        component={BookmarksScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>🔖</Text>
          ),
          tabBarLabel: 'Saved',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>👤</Text>
          ),
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

// Root Stack Navigator
export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.background },
          headerTintColor: COLORS.text,
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        <Stack.Screen
          name="Main"
          component={MainTabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ArticleDetail"
          component={ArticleDetailScreen}
          options={{
            title: 'Article',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="ArticleWebView"
          component={ArticleWebViewScreen}
          options={{
            title: 'Article',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="Auth"
          component={SignInScreen}
          options={{
            title: 'Sign In',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="SignIn"
          component={SignInScreen}
          options={{
            title: 'Sign In',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="SignUp"
          component={SignUpScreen}
          options={{
            title: 'Sign Up',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="AdminDashboard"
          component={AdminDashboardScreen}
          options={{
            title: 'Admin Dashboard',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="ManageSources"
          component={ManageSourcesScreen}
          options={{
            title: 'Manage Sources',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="ManageArticles"
          component={ManageArticlesScreen}
          options={{
            title: 'Manage Articles',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="IngestionLogs"
          component={IngestionLogsScreen}
          options={{
            title: 'Ingestion Logs',
            headerBackTitle: 'Back',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

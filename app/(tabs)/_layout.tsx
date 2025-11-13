import React from "react";
import Colors from "@/constants/Colors";
import { View, Text, StatusBar, StyleSheet } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";
import { Tabs } from "expo-router";

const TabsLayout = () => {
  return (
    <View className="flex-1 m-0 p-0">
      <StatusBar
        barStyle="light-content"
        backgroundColor="#000"
      />
      <Tabs screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarStyle: {
          backgroundColor: '#23252B',
          borderTopColor: '#23252B',
          borderTopWidth: 0,
        },
        

      }}>
        <Tabs.Screen
          name="index"
          options={{
            tabBarLabel: "Home",
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="home" size={40} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profil"
          options={{
            tabBarLabel: "Mon compte",
            tabBarIcon: ({ color }) => (
              <Feather name="user" size={32} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="friends"
          options={{
            tabBarLabel: "Ajouter des amis",
            tabBarIcon: ({ color }) => (
              <Feather name="user-plus" size={32} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            tabBarLabel: "Recherche",
            tabBarIcon: ({ color }) => (
              <Feather name="search" size={32} color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
};

export default TabsLayout;

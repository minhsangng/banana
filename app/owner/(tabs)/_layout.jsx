import { Tabs } from "expo-router";
import { Provider } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../../constants/colors";

const TabsLayout = () => {
  return (
    <Provider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: COLORS.background1,
          tabBarInactiveTintColor: COLORS.textLight,
          tabBarStyle: {
            backgroundColor: COLORS.heading,
            paddingBottom: 8,
            paddingTop: 8,
            height: 80,
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontFamily: "GochiHand",
            fontWeight: "600"
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />
          }}
        />
        <Tabs.Screen
          name="order"
          options={{
            title: "Order",
            tabBarIcon: ({ color, size }) => <Ionicons name="bag-check-outline" size={size} color={color} />
          }}
        />
        <Tabs.Screen
          name="dish"
          options={{
            title: "Dish",
            tabBarIcon: ({ color, size }) => <Ionicons name="restaurant-outline" size={size} color={color} />
          }}
        />
        <Tabs.Screen
          name="statistic"
          options={{
            title: "Statistic",
            tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart-outline" size={size} color={color} />
          }}
        />
        <Tabs.Screen
          name="support"
          options={{
            title: "Support",
            tabBarIcon: ({ color, size }) => <Ionicons name="chatbubble-ellipses-outline" size={size} color={color} />
          }}
        />
      </Tabs>
    </Provider>
  );
};
export default TabsLayout;

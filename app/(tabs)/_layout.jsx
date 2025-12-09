import { Tabs } from "expo-router";
import { Provider } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../constants/colors";

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
            title: "Trang chủ",
            tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="order"
          options={{
            title: "Đơn hàng",
            tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? "bag-check" : "bag-check-outline"} size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="favorite"
          options={{
            title: "Yêu thích",
            tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? "heart" : "heart-outline"} size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: "Lịch sử",
            tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? "receipt" : "receipt-outline"} size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="support"
          options={{
            title: "Hỗ trợ",
            tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"} size={size} color={color} />,
          }}
        />
      </Tabs>
    </Provider>
  );
};
export default TabsLayout;

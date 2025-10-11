import { Tabs } from "expo-router"
import { View, Text } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Users, Chrome as Home, Gift, DollarSign } from "lucide-react-native"

export default function TabLayout() {
  const insets = useSafeAreaInsets()
  const bottomInset = insets.bottom || 0
  const paddingBottom = Math.max(bottomInset + 8, 16)
  const tabHeight = 72 + bottomInset

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#00B9AE",
        tabBarInactiveTintColor: "#FFFFFF",
        tabBarStyle: {
          backgroundColor: "#000000",
          borderTopWidth: 0,
          height: tabHeight,
          paddingBottom,
          paddingTop: 8,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10, // Reduced default font size
          fontWeight: "600",
          marginTop: 6,
          letterSpacing: 0.1,
          color: "#FFFFFF",
        },
      }}
    >
      <Tabs.Screen
        name="leads"
        options={{
          title: "Leads",
          tabBarIcon: ({ focused }) => (
            <Users size={24} color={focused ? "#00B9AE" : "#FFFFFF"} strokeWidth={2.2} />
          ),
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                fontSize: 11,
                fontWeight: "600",
                color: focused ? "#00B9AE" : "#FFFFFF",
                marginTop: 4,
                letterSpacing: 0.2,
              }}
            >
              Leads
            </Text>
          ),
        }}
      />

      <Tabs.Screen
        name="commission"
        options={{
          title: "Earnings",
          tabBarIcon: ({ focused }) => (
            <DollarSign size={24} color={focused ? "#00B9AE" : "#FFFFFF"} strokeWidth={2.2} />
          ),
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                fontSize: 11,
                fontWeight: "600",
                color: focused ? "#00B9AE" : "#FFFFFF",
                marginTop: 4,
                letterSpacing: 0.2,
              }}
            >
              Earnings
            </Text>
          ),
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: focused ? "#00B9AE" : "#1A1A1A",
                justifyContent: "center",
                alignItems: "center",
                marginTop: -28 - bottomInset * 0.2,
                shadowColor: focused ? "#00B9AE" : "#000",
                shadowOffset: {
                  width: 0,
                  height: 8,
                },
                shadowOpacity: focused ? 0.4 : 0.3,
                shadowRadius: 16,
                elevation: 12,
                borderWidth: 3,
                borderColor: "#000000",
              }}
            >
              <Home size={26} color="#FFFFFF" strokeWidth={2.2} />
            </View>
          ),
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                fontSize: 11,
                fontWeight: "600",
                color: focused ? "#00B9AE" : "#FFFFFF",
                marginTop: 4,
                letterSpacing: 0.2,
              }}
            >
              Home
            </Text>
          ),
        }}
      />

      <Tabs.Screen
        name="offers"
        options={{
          title: "Offers",
          tabBarIcon: ({ focused }) => (
            <Gift size={24} color={focused ? "#00B9AE" : "#FFFFFF"} strokeWidth={2.2} />
          ),
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                fontSize: 11,
                fontWeight: "600",
                color: focused ? "#00B9AE" : "#FFFFFF",
                marginTop: 4,
                letterSpacing: 0.2,
              }}
            >
              Offers
            </Text>
          ),
        }}
      />

      <Tabs.Screen
        name="team"
        options={{
          title: "My Team",
          tabBarIcon: ({ focused }) => (
            <Users size={24} color={focused ? "#00B9AE" : "#FFFFFF"} strokeWidth={2.2} />
          ),
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                fontSize: 11,
                fontWeight: "600",
                color: focused ? "#00B9AE" : "#FFFFFF",
                marginTop: 4,
                letterSpacing: 0.2,
              }}
            >
              My Team
            </Text>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="support"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="product-info"
        options={{
          href: null,
        }}
      />
    </Tabs>
  )
}

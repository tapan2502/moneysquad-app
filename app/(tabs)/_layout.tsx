import { Tabs } from "expo-router"
import { View, Text } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Users, Chrome as Home, Gift, BookOpen, CircleHelp as HelpCircle, DollarSign } from "lucide-react-native"

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
          tabBarIcon: ({ focused, color }) => (
            <Users size={22} color={focused ? "#00B9AE" : "#FFFFFF"} strokeWidth={2.2} />
          ),
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                fontSize: 11,
                fontWeight: "600",
                color: focused ? "#00B9AE" : "#FFFFFF",
                marginTop: 6,
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
          title: "Commission",
          tabBarIcon: ({ size, color, focused }) => (
            <DollarSign size={22} color={focused ? "#00B9AE" : "#FFFFFF"} strokeWidth={2.2} />
          ),
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                fontSize: 10, // Reduced font size to prevent text wrapping
                fontWeight: "600",
                color: focused ? "#00B9AE" : "#FFFFFF",
                marginTop: 6,
                letterSpacing: 0.1, // Reduced letter spacing for better fit
                textAlign: "center",
                numberOfLines: 1, // Ensure single line text
              }}
            >
              Earnings
            </Text>
          ),
        }}
      />

      <Tabs.Screen
        name="offers"
        options={{
          title: "Offers",
          tabBarIcon: ({ size, color, focused }) => (
            <Gift size={22} color={focused ? "#00B9AE" : "#FFFFFF"} strokeWidth={2.2} />
          ),
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                fontSize: 11,
                fontWeight: "600",
                color: focused ? "#00B9AE" : "#FFFFFF",
                marginTop: 6,
                letterSpacing: 0.2,
              }}
            >
              Offers
            </Text>
          ),
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ size, color, focused }) => (
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: focused ? "#00B9AE" : "#333333",
                justifyContent: "center",
                alignItems: "center",
                marginTop: -24 - bottomInset * 0.2,
                shadowColor: focused ? "#00B9AE" : "transparent",
                shadowOffset: {
                  width: 0,
                  height: 6,
                },
                shadowOpacity: 0.25,
                shadowRadius: 12,
                elevation: 8,
                borderWidth: focused ? 0 : 1,
                borderColor: "#555555",
              }}
            >
              <Home size={24} color={focused ? "#FFFFFF" : "#FFFFFF"} strokeWidth={2.2} />
            </View>
          ),
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                fontSize: 11,
                fontWeight: "600",
                color: focused ? "#00B9AE" : "#FFFFFF",
                marginTop: 6,
                letterSpacing: 0.2,
              }}
            >
              Home
            </Text>
          ),
        }}
      />

      <Tabs.Screen
        name="team"
        options={{
          title: "Team",
          tabBarIcon: ({ size, color, focused }) => (
            <Users size={22} color={focused ? "#00B9AE" : "#FFFFFF"} strokeWidth={2.2} />
          ),
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                fontSize: 11,
                fontWeight: "600",
                color: focused ? "#00B9AE" : "#FFFFFF",
                marginTop: 6,
                letterSpacing: 0.2,
              }}
            >
              Team
            </Text>
          ),
        }}
      />

      <Tabs.Screen
        name="product-info"
        options={{
          title: "Product", // Shortened from "Product Info" to prevent text wrapping
          tabBarIcon: ({ size, color, focused }) => (
            <BookOpen size={22} color={focused ? "#00B9AE" : "#FFFFFF"} strokeWidth={2.2} />
          ),
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                fontSize: 11,
                fontWeight: "600",
                color: focused ? "#00B9AE" : "#FFFFFF",
                marginTop: 6,
                letterSpacing: 0.2,
              }}
            >
              Product {/* Shortened label to prevent two-line text */}
            </Text>
          ),
        }}
      />

      <Tabs.Screen
        name="support"
        options={{
          title: "Support",
          tabBarIcon: ({ size, color, focused }) => (
            <HelpCircle size={22} color={focused ? "#00B9AE" : "#FFFFFF"} strokeWidth={2.2} />
          ),
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                fontSize: 11,
                fontWeight: "600",
                color: focused ? "#00B9AE" : "#FFFFFF",
                marginTop: 6,
                letterSpacing: 0.2,
              }}
            >
              Support
            </Text>
          ),
        }}
      />
    </Tabs>
  )
}

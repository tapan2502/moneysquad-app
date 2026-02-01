import { useCallback } from "react"
import { Tabs } from "expo-router"
import { View, Text, Platform } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { LayoutDashboard, Gift, DollarSign, Users } from "lucide-react-native"
import { useSidebar } from "@/src/components/sidebar/SidebarProvider"
import { BlurView } from "expo-blur"

const MenuIcon = ({ focused }: { focused: boolean }) => {
  const barColor = focused ? "#00B9AE" : "#A0A0A0"

  return (
    <View style={{ width: 24, height: 24, justifyContent: "center", alignItems: "center" }}>
      <View style={{ gap: 3.5, alignItems: "center" }}>
        {[0, 1, 2].map((idx) => (
          <View
            key={idx}
            style={{
              width: idx === 1 ? 17 : 15,
              height: 2.5,
              borderRadius: 12,
              backgroundColor: barColor,
            }}
          />
        ))}
      </View>
    </View>
  )
}

export default function TabLayout() {
  const insets = useSafeAreaInsets()
  const bottomInset = insets.bottom || 0
  const paddingBottom = Math.max(bottomInset, 8)
  const tabHeight = 68 + bottomInset
  const { openSidebar } = useSidebar()

  const handleMenuTabPress = useCallback(
    (event: { preventDefault: () => void }) => {
      event.preventDefault()
      openSidebar()
    },
    [openSidebar],
  )

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#00B9AE",
        tabBarInactiveTintColor: "#A0A0A0",
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Platform.OS === "ios" ? "rgba(0, 0, 0, 0.85)" : "#0A0A0A",
          borderTopWidth: 0.5,
          borderTopColor: "rgba(255, 255, 255, 0.08)",
          height: tabHeight,
          paddingBottom,
          paddingTop: 10,
          paddingHorizontal: 8,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: -8,
          },
          shadowOpacity: 0.25,
          shadowRadius: 20,
          elevation: 20,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          marginTop: 4,
          letterSpacing: 0.3,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      }}
    >
      <Tabs.Screen
        name="leads"
        options={{
          title: "Leads",
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                width: 48,
                height: 32,
                borderRadius: 16,
                backgroundColor: focused ? "rgba(0, 185, 174, 0.15)" : "transparent",
                justifyContent: "center",
                alignItems: "center",
                transform: [{ scale: focused ? 1 : 0.95 }],
              }}
            >
              <Users 
                size={22} 
                color={focused ? "#00B9AE" : "#A0A0A0"} 
                strokeWidth={focused ? 2.5 : 2} 
              />
            </View>
          ),
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                fontSize: 10,
                fontWeight: focused ? "700" : "600",
                color: focused ? "#00B9AE" : "#A0A0A0",
                marginTop: 2,
                letterSpacing: 0.3,
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
            <View
              style={{
                width: 48,
                height: 32,
                borderRadius: 16,
                backgroundColor: focused ? "rgba(0, 185, 174, 0.15)" : "transparent",
                justifyContent: "center",
                alignItems: "center",
                transform: [{ scale: focused ? 1 : 0.95 }],
              }}
            >
              <DollarSign 
                size={22} 
                color={focused ? "#00B9AE" : "#A0A0A0"} 
                strokeWidth={focused ? 2.5 : 2} 
              />
            </View>
          ),
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                fontSize: 10,
                fontWeight: focused ? "700" : "600",
                color: focused ? "#00B9AE" : "#A0A0A0",
                marginTop: 2,
                letterSpacing: 0.3,
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
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: focused ? "#00B9AE" : "#1F1F1F",
                justifyContent: "center",
                alignItems: "center",
                marginTop: -24 - bottomInset * 0.15,
                shadowColor: focused ? "#00B9AE" : "#000",
                shadowOffset: {
                  width: 0,
                  height: focused ? 12 : 8,
                },
                shadowOpacity: focused ? 0.5 : 0.3,
                shadowRadius: focused ? 20 : 12,
                elevation: focused ? 16 : 12,
                borderWidth: 4,
                borderColor: Platform.OS === "ios" ? "rgba(0, 0, 0, 0.85)" : "#0A0A0A",
                transform: [{ scale: focused ? 1.05 : 1 }],
              }}
            >
              <LayoutDashboard 
                size={24} 
                color={focused ? "#FFFFFF" : "#A0A0A0"} 
                strokeWidth={focused ? 2.5 : 2} 
              />
            </View>
          ),
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                fontSize: 10,
                fontWeight: focused ? "700" : "600",
                color: focused ? "#00B9AE" : "#A0A0A0",
                marginTop: 2,
                letterSpacing: 0.3,
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
            <View
              style={{
                width: 48,
                height: 32,
                borderRadius: 16,
                backgroundColor: focused ? "rgba(0, 185, 174, 0.15)" : "transparent",
                justifyContent: "center",
                alignItems: "center",
                transform: [{ scale: focused ? 1 : 0.95 }],
              }}
            >
              <Gift 
                size={22} 
                color={focused ? "#00B9AE" : "#A0A0A0"} 
                strokeWidth={focused ? 2.5 : 2} 
              />
            </View>
          ),
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                fontSize: 10,
                fontWeight: focused ? "700" : "600",
                color: focused ? "#00B9AE" : "#A0A0A0",
                marginTop: 2,
                letterSpacing: 0.3,
              }}
            >
              Offers
            </Text>
          ),
        }}
      />

      <Tabs.Screen
        name="menu"
        options={{
          title: "Menu",
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                width: 48,
                height: 32,
                borderRadius: 16,
                backgroundColor: focused ? "rgba(0, 185, 174, 0.12)" : "transparent",
                justifyContent: "center",
                alignItems: "center",
                transform: [{ scale: focused ? 1 : 0.95 }],
              }}
            >
              <MenuIcon focused={focused} />
            </View>
          ),
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                fontSize: 10,
                fontWeight: focused ? "700" : "600",
                color: focused ? "#00B9AE" : "#A0A0A0",
                marginTop: 2,
                letterSpacing: 0.3,
              }}
            >
              Menu
            </Text>
          ),
        }}
        listeners={() => ({
          tabPress: handleMenuTabPress,
        })}
      />

      <Tabs.Screen
        name="profile"
        options={{
          href: "/profile",
          tabBarItemStyle: { display: "none" },
        }}
      />

      <Tabs.Screen
        name="team"
        options={{
          href: "/team",
          tabBarItemStyle: { display: "none" },
        }}
      />

      <Tabs.Screen
        name="support"
        options={{
          href: "/support",
          tabBarItemStyle: { display: "none" },
        }}
      />

      <Tabs.Screen
        name="product-info"
        options={{
          href: "/product-info",
          tabBarItemStyle: { display: "none" },
        }}
      />
    </Tabs>
  )
}
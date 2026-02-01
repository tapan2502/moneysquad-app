import type React from "react"
import { createStackNavigator } from "@react-navigation/stack"
import { useSelector } from "react-redux"
import type { RootState } from "../redux/store"
import { Slot } from "expo-router"
import { SidebarProvider } from "../components/sidebar/SidebarProvider"
import type { AuthenticatedStackParamList } from "./types"

// Screens
import SplashScreen from "../screens/SplashScreen"
import LoginScreen from "../screens/LoginScreen"
import RegisterScreen from "../screens/RegisterScreen"
import OTPVerificationScreen from "../screens/OTPVerificationScreen"
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen"
import LeadDetailsScreen from "../screens/leads/LeadDetailsScreen"
import CreateLeadScreen from "../screens/leads/CreateLeadScreen"
import OfferDetailsScreen from "../screens/offers/OfferDetailsScreen"
import CreateAssociateScreen from "../screens/team/CreateAssociateScreen"
import TeamScreen from "../screens/team/TeamScreen"
import ProfileScreen from "../screens/profile/ProfileScreen"
import SupportScreen from "../screens/support/SupportScreen"
import ProductInfoScreen from "../screens/product-info/ProductInfoScreen"

const RootStack = createStackNavigator()
const AuthenticatedStack = createStackNavigator<AuthenticatedStackParamList>()

const TabsMainWithSidebar: React.FC = () => (
  <SidebarProvider>
    <Slot />
  </SidebarProvider>
)

const TabsWithStack = () => (
  <AuthenticatedStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthenticatedStack.Screen name="TabsMain" component={TabsMainWithSidebar} />
    <AuthenticatedStack.Screen name="LeadDetails" component={LeadDetailsScreen} />
    <AuthenticatedStack.Screen name="CreateLead" component={CreateLeadScreen} />
    <AuthenticatedStack.Screen name="OfferDetails" component={OfferDetailsScreen} />
    <AuthenticatedStack.Screen name="CreateAssociate" component={CreateAssociateScreen} />
    <AuthenticatedStack.Screen name="EditAssociate" component={CreateAssociateScreen} />
    <AuthenticatedStack.Screen name="Team" component={TeamScreen} />
    <AuthenticatedStack.Screen name="Profile" component={ProfileScreen} />
    <AuthenticatedStack.Screen name="Support" component={SupportScreen} />
    <AuthenticatedStack.Screen name="ProductInfo" component={ProductInfoScreen} />
  </AuthenticatedStack.Navigator>
)

const AppNavigator: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)
  const { isAppLoading } = useSelector((state: RootState) => state.app)

  if (isAppLoading) {
    return <SplashScreen />
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <RootStack.Screen name="(tabs)" component={TabsWithStack} />
      ) : (
        <>
          <RootStack.Screen name="Login" component={LoginScreen} />
          <RootStack.Screen name="Register" component={RegisterScreen} />
          <RootStack.Screen name="OTPVerification" component={OTPVerificationScreen} />
          <RootStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      )}
    </RootStack.Navigator>
  )
}

export default AppNavigator

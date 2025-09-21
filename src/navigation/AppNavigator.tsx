import type React from "react"
import { createStackNavigator } from "@react-navigation/stack"
import { useSelector } from "react-redux"
import type { RootState } from "../redux/store"
import { Slot } from "expo-router"

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

const Stack = createStackNavigator()

const TabsWithStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TabsMain" component={Slot} />
      <Stack.Screen name="LeadDetails" component={LeadDetailsScreen} />
      <Stack.Screen name="CreateLead" component={CreateLeadScreen} />
      <Stack.Screen name="OfferDetails" component={OfferDetailsScreen} />
      <Stack.Screen name="CreateAssociate" component={CreateAssociateScreen} />
      <Stack.Screen name="EditAssociate" component={CreateAssociateScreen} />
      
    </Stack.Navigator>
  )
}

const AppNavigator: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)
  const { isAppLoading } = useSelector((state: RootState) => state.app)

  if (isAppLoading) {
    return <SplashScreen />
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="(tabs)" component={TabsWithStack} />
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      )}
    </Stack.Navigator>
  )
}

export default AppNavigator

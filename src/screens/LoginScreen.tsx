"use client"

import type React from "react"
import { View, Text, KeyboardAvoidingView, Platform, TouchableOpacity, StyleSheet } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { useDispatch, useSelector } from "react-redux"
import { useNavigation } from "@react-navigation/native"
import type { RootState } from "../redux/store"
import { login, clearError } from "../redux/slices/authSlice"
import { loginSchema } from "../utils/validation"
import CustomTextInput from "../components/CustomTextInput"
import LoadingButton from "../components/LoadingButton"
import { Snackbar } from "react-native-paper"
import { theme } from "../theme"

interface LoginFormData {
  email: string
  password: string
}

const LoginScreen: React.FC = () => {
  const dispatch = useDispatch()
  const navigation = useNavigation<any>()
  const { isLoading, error } = useSelector((state: RootState) => state.auth)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = (data: LoginFormData) => {
    console.log("🔐 [LOGIN] Attempting login with:", { email: data.email })
    dispatch(login(data) as any)
  }

  const handleDismissError = () => {
    dispatch(clearError())
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
        keyboardVerticalOffset={0}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Sign In</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Welcome Back!</Text>
            <Text style={styles.welcomeSubtitle}>To keep connected with us please login with your personal info</Text>
          </View>

          <View style={styles.formSection}>
            <CustomTextInput
              name="email"
              control={control}
              label="Email Address"
              placeholder="Email Address"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              style={styles.input}
            />

            <CustomTextInput
              name="password"
              control={control}
              label="Password"
              placeholder="Password"
              secureTextEntry
              error={errors.password}
              style={styles.input}
            />

            <View style={styles.forgotPasswordContainer}>
              <TouchableOpacity
                onPress={() => {
                  console.log("🔗 [LOGIN] Navigating to Forgot Password")
                  navigation.navigate("ForgotPassword")
                }}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <LoadingButton
              title="Sign In"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              style={styles.signInButton}
            />

            <View style={styles.createAccountContainer}>
              <Text style={styles.createAccountText}>Don't have an account? </Text>
              <TouchableOpacity
                onPress={() => {
                  console.log("🔗 [LOGIN] Navigating to Register")
                  navigation.navigate("Register")
                }}
              >
                <Text style={styles.createAccountLink}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      <Snackbar
        visible={!!error}
        onDismiss={handleDismissError}
        action={{
          label: "Dismiss",
          onPress: handleDismissError,
        }}
      >
        {error}
      </Snackbar>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.light,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    backgroundColor: theme.colors.primary.DEFAULT,
    paddingBottom: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.xl,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: theme.colors.primary.DEFAULT,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    minHeight: 120,
    justifyContent: "flex-end" as const,
    paddingBottom: theme.spacing.xl,
  },
  headerTitle: {
    color: theme.colors.background.light,
    fontSize: theme.typography.fontSizes.xxl,
    fontWeight: "700" as const,
    textAlign: "left",
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.background.light,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.lg,
    justifyContent: "space-between",
  },
  welcomeSection: {
    marginBottom: theme.spacing.xl,
    paddingTop: theme.spacing.md,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "800" as const,
    color: theme.colors.text.light,
    marginBottom: theme.spacing.sm,
    letterSpacing: -0.6,
    lineHeight: 34,
  },
  welcomeSubtitle: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: "400" as const,
    color: theme.colors.secondary[600],
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  formSection: {
    flex: 1,
    justifyContent: "center",
  },
  input: {
    marginBottom: theme.spacing.lg,
  },
  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginBottom: theme.spacing.xl,
    marginTop: theme.spacing.sm,
  },
  forgotPasswordText: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: "600" as const,
    color: theme.colors.primary.DEFAULT,
    letterSpacing: 0.3,
  },
  signInButton: {
    backgroundColor: theme.colors.primary.DEFAULT,
    borderRadius: theme.borderRadius.xl,
    marginTop: theme.spacing.md,
    shadowColor: theme.colors.primary.DEFAULT,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    transform: [{ translateY: -2 }],
  },
  createAccountContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  createAccountText: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: "400" as const,
    color: theme.colors.secondary[600],
    letterSpacing: 0.2,
  },
  createAccountLink: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: "700" as const,
    color: theme.colors.primary.DEFAULT,
    letterSpacing: 0.3,
  },
})

export default LoginScreen

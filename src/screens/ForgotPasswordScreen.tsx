"use client"

import type React from "react"
import { useState } from "react"
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { useDispatch, useSelector } from "react-redux"
import { useNavigation } from "@react-navigation/native"
import { LinearGradient } from "expo-linear-gradient"
import * as yup from "yup"
import type { RootState } from "../redux/store"
import { forgotPassword, verifyForgotPasswordOTP, clearError } from "../redux/slices/authSlice"
import CustomTextInput from "../components/CustomTextInput"
import LoadingButton from "../components/LoadingButton"
import { Snackbar } from "react-native-paper"
import { ChevronLeft } from "lucide-react-native"
import { theme } from "../theme"

const emailSchema = yup.object().shape({
  email: yup.string().required("Email is required").email("Enter a valid email address"),
})

const otpSchema = yup.object().shape({
  otp: yup
    .string()
    .required("OTP is required")
    .length(6, "OTP must be 6 digits")
    .matches(/^\d+$/, "OTP must contain only numbers"),
})

interface EmailFormData {
  email: string
}

interface OTPFormData {
  otp: string
}

const ForgotPasswordScreen: React.FC = () => {
  const dispatch = useDispatch()
  const navigation = useNavigation<any>()
  const { isLoading, error } = useSelector((state: RootState) => state.auth)

  const [step, setStep] = useState<"email" | "otp" | "success">("email")
  const [userEmail, setUserEmail] = useState("")

  const emailForm = useForm<EmailFormData>({
    resolver: yupResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  })

  const otpForm = useForm<OTPFormData>({
    resolver: yupResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  })

  const onEmailSubmit = async (data: EmailFormData) => {
    try {
      console.log("📧 [FORGOT PASSWORD] Submitting email:", data.email)
      const result = await dispatch(forgotPassword({ email: data.email }) as any)
      if (forgotPassword.fulfilled.match(result)) {
        console.log("📧 [FORGOT PASSWORD] Email step successful")
        setUserEmail(data.email)
        setStep("otp")
      } else {
        console.error("📧 [FORGOT PASSWORD] Email step failed:", result)
      }
    } catch (error) {
      console.error("📧 [FORGOT PASSWORD] Email step error:", error)
    }
  }

  const onOTPSubmit = async (data: OTPFormData) => {
    try {
      console.log("🔐 [FORGOT PASSWORD] Submitting OTP:", { email: userEmail, otp: data.otp })
      const result = await dispatch(verifyForgotPasswordOTP({ email: userEmail, otp: data.otp }) as any)
      if (verifyForgotPasswordOTP.fulfilled.match(result)) {
        console.log("🔐 [FORGOT PASSWORD] OTP verification successful")
        setStep("success")
      } else {
        console.error("🔐 [FORGOT PASSWORD] OTP verification failed:", result)
      }
    } catch (error) {
      console.error("🔐 [FORGOT PASSWORD] OTP verification error:", error)
    }
  }

  const handleResendOTP = async () => {
    try {
      console.log("🔄 [FORGOT PASSWORD] Resending OTP to:", userEmail)
      const result = await dispatch(forgotPassword({ email: userEmail }) as any)
      if (forgotPassword.fulfilled.match(result)) {
        Alert.alert("Success", "OTP sent again to your email")
      }
    } catch (error) {
      console.error("🔄 [FORGOT PASSWORD] Resend OTP failed:", error)
    }
  }

  const handleBackToLogin = () => {
    console.log("🔗 [FORGOT PASSWORD] Navigating back to Login")
    navigation.navigate("Login")
  }

  const handleDismissError = () => {
    dispatch(clearError())
  }

  const renderEmailStep = () => (
    <>
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.subtitle}>Enter your email address and we'll send you an OTP to reset your password</Text>

      <View style={styles.formCard}>
        <CustomTextInput
          name="email"
          control={emailForm.control}
          label="Email Address"
          placeholder="Enter your email address"
          keyboardType="email-address"
          autoCapitalize="none"
          error={emailForm.formState.errors.email}
          style={styles.input}
        />

        <LoadingButton
          title="Send OTP"
          onPress={emailForm.handleSubmit(onEmailSubmit)}
          loading={isLoading}
          style={styles.submitButton}
        />

        <TouchableOpacity onPress={handleBackToLogin} style={styles.backContainer}>
          <Text style={styles.backText}>
            Remember your password? <Text style={styles.backLink}>Back to Login</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </>
  )

  const renderOTPStep = () => (
    <>
      <Text style={styles.title}>Enter OTP</Text>
      <Text style={styles.subtitle}>
        Enter the 6-digit code sent to{"\n"}
        <Text style={styles.emailText}>{userEmail}</Text>
      </Text>

      <View style={styles.formCard}>
        <CustomTextInput
          name="otp"
          control={otpForm.control}
          label="OTP"
          placeholder="Enter 6-digit OTP"
          keyboardType="numeric"
          maxLength={6}
          error={otpForm.formState.errors.otp}
          style={styles.input}
        />

        <LoadingButton
          title="Reset Password"
          onPress={otpForm.handleSubmit(onOTPSubmit)}
          loading={isLoading}
          style={styles.submitButton}
        />

        <TouchableOpacity onPress={handleResendOTP} style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive OTP? Resend</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setStep("email")} style={styles.backContainer}>
          <Text style={styles.backText}>
            Wrong email? <Text style={styles.backLink}>Go Back</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </>
  )

  const renderSuccessStep = () => (
    <View style={styles.successContainer}>
      <View style={styles.successIcon}>
        <Text style={styles.successEmoji}>✓</Text>
      </View>

      <Text style={styles.successTitle}>Password Reset Email Sent!</Text>
      <Text style={styles.successSubtitle}>
        Your password reset request has been verified successfully. Please check your email for further instructions to
        reset your password.
      </Text>

      <LoadingButton title="Back to Login" onPress={handleBackToLogin} style={styles.submitButton} />
    </View>
  )

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <LinearGradient colors={theme.gradients.primary} style={styles.gradient}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={handleBackToLogin} style={styles.backButton}>
                <ChevronLeft size={24} color="#FFFFFF" />
              </TouchableOpacity>

              <View style={styles.logoContainer}>
                <Text style={styles.logoText}>🔑</Text>
              </View>
            </View>

            {/* Content based on step */}
            {step === "email" && renderEmailStep()}
            {step === "otp" && renderOTPStep()}
            {step === "success" && renderSuccessStep()}
          </View>
        </ScrollView>
      </LinearGradient>

      {/* Error Snackbar */}
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
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  header: {
    alignItems: "center",
    marginBottom: theme.spacing.lg,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 0,
    top: theme.spacing.sm,
    zIndex: 1,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  logoContainer: {
    ...theme.components.header.logo,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    backdropFilter: "blur(10px)",
    width: 50,
    height: 50,
  },
  logoText: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
  },
  title: {
    ...theme.components.header.title,
    fontSize: theme.typography.fontSizes.xxl,
    letterSpacing: theme.typography.letterSpacing.tight,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.components.header.subtitle,
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.medium,
    marginBottom: theme.spacing.lg,
    lineHeight: theme.typography.lineHeights.normal * theme.typography.fontSizes.md,
  },
  emailText: {
    fontWeight: theme.typography.fontWeights.bold,
    color: "rgba(255, 255, 255, 0.95)",
  },
  formCard: {
    ...theme.components.card,
    ...theme.shadows.xl,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    padding: theme.spacing.lg,
  },
  input: {
    marginBottom: theme.spacing.md,
  },
  submitButton: {
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  resendContainer: {
    alignItems: "center",
    marginBottom: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  resendText: {
    color: theme.colors.primary.DEFAULT,
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  backContainer: {
    alignItems: "center",
    paddingVertical: theme.spacing.xs,
  },
  backText: {
    color: theme.colors.secondary[600],
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.normal,
  },
  backLink: {
    color: theme.colors.primary.DEFAULT,
    fontWeight: theme.typography.fontWeights.bold,
  },
  successContainer: {
    alignItems: "center",
    ...theme.components.card,
    ...theme.shadows.xl,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    padding: theme.spacing.lg,
  },
  successIcon: {
    width: 60,
    height: 60,
    backgroundColor: theme.colors.success,
    borderRadius: theme.borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
    ...theme.shadows.lg,
  },
  successEmoji: {
    fontSize: theme.typography.fontSizes.xxl,
    color: "#FFFFFF",
    fontWeight: theme.typography.fontWeights.bold,
  },
  successTitle: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text.light,
    marginBottom: theme.spacing.sm,
    textAlign: "center",
  },
  successSubtitle: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.secondary[600],
    textAlign: "center",
    lineHeight: theme.typography.lineHeights.normal * theme.typography.fontSizes.sm,
    marginBottom: theme.spacing.lg,
  },
})

export default ForgotPasswordScreen

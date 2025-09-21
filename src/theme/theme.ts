import { MD3LightTheme, MD3DarkTheme } from "react-native-paper"
import { colors } from "./colors"
import { spacing } from "./spacing"
import { typography } from "./typography"
import { shadows } from "./shadows"
import { gradients } from "./gradients"
import { borderRadius } from "./borderRadius"

export const theme = {
  colors,
  spacing,
  typography,
  shadows,
  gradients,
  borderRadius,
  // Common component styles
  components: {
    card: {
      backgroundColor: colors.background.light,
      borderRadius: borderRadius.xxl,
      padding: spacing.xl,
      ...shadows.card,
    },
    button: {
      primary: {
        backgroundColor: colors.primary.DEFAULT,
        borderRadius: borderRadius.lg,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        ...shadows.md,
      },
      secondary: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: colors.primary.DEFAULT,
        borderRadius: borderRadius.lg,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
      },
    },
    input: {
      backgroundColor: colors.background.light,
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderWidth: 1,
      borderColor: colors.secondary[200],
      fontSize: typography.fontSizes.md,
    },
    header: {
      logo: {
        width: 80,
        height: 80,
        borderRadius: borderRadius.xxl,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: spacing.xxl,
      },
      title: {
        fontSize: typography.fontSizes.xxxl,
        fontWeight: typography.fontWeights.bold,
        color: "#FFFFFF",
        textAlign: "center",
        marginBottom: spacing.sm,
      },
      subtitle: {
        fontSize: typography.fontSizes.lg,
        color: "rgba(255, 255, 255, 0.8)",
        textAlign: "center",
        lineHeight: typography.lineHeights.normal * typography.fontSizes.lg,
      },
    },
  },
}

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary.DEFAULT,
    onPrimary: "#FFFFFF",
    secondary: colors.secondary.DEFAULT,
    onSecondary: "#FFFFFF",
    surface: colors.background.light,
    onSurface: colors.text.light,
    background: colors.background.light,
    onBackground: colors.text.light,
    error: colors.error,
    onError: "#FFFFFF",
  },
}

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primary.DEFAULT,
    onPrimary: "#FFFFFF",
    secondary: colors.secondary[600],
    onSecondary: "#FFFFFF",
    surface: colors.background.dark,
    onSurface: colors.text.dark,
    background: colors.background.dark,
    onBackground: colors.text.dark,
    error: colors.error,
    onError: "#FFFFFF",
  },
}

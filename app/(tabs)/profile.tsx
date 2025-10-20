import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { ChevronDown, ArrowLeft } from "lucide-react-native";
import { useRouter } from "expo-router";
import type { RootState } from "../../src/redux/store";
import { fetchUserData, isPartnerUser } from "../../src/redux/slices/userDataSlice";
import ProfileCard from "../../src/components/sidebar/ProfileCard";
import BankingCard from "../../src/components/sidebar/BankingCard";
import DocumentsRow from "../../src/components/sidebar/DocumentsRow";

const ProfileScreen: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { userData, loading } = useSelector((s: RootState) => s.userData);
  const [docsOpen, setDocsOpen] = useState(false);

  useEffect(() => {
    if (!userData) {
      dispatch(fetchUserData() as any);
    }
  }, [userData, dispatch]);

  const openURLSafe = async (url: string) => {
    try {
      const can = await Linking.canOpenURL(url);
      if (can) await Linking.openURL(url);
    } catch {
      // no-op
    }
  };

  const isPartner = userData && isPartnerUser(userData);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00B9AE" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!isPartner || !userData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Oops!</Text>
        <Text style={styles.errorText}>Failed to load profile data</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ProfileCard user={userData} />

        <BankingCard bank={userData.bankDetails} />

        {/* Documents accordion */}
        <TouchableOpacity
          onPress={() => setDocsOpen((v) => !v)}
          activeOpacity={0.9}
          style={[styles.accHeader, docsOpen && styles.accHeaderActive]}
        >
          <View style={styles.accHeaderLeft}>
            <View style={styles.docIcon}>
              <Text style={styles.docIconText}>📄</Text>
            </View>
            <Text style={styles.accTitle}>Uploaded Documents</Text>
          </View>
          <ChevronDown
            size={18}
            color="#6B7280"
            style={{ transform: [{ rotate: docsOpen ? "180deg" : "0deg" }] }}
          />
        </TouchableOpacity>
        {docsOpen ? <DocumentsRow documents={userData.documents} /> : null}

        {/* Note */}
        <View style={styles.note}>
          <View style={styles.noteHeader}>
            <View style={styles.noteIconContainer}>
              <Text style={styles.noteIconText}>💡</Text>
            </View>
            <Text style={styles.noteTitle}>Account Updates</Text>
          </View>
          <Text style={styles.noteText}>
            To update your account details including bank information and documents, please visit our web
            application{" "}
            <Text
              style={styles.noteLink}
              onPress={() => openURLSafe("https://app.moneysquad.in")}
              accessibilityRole="link"
            >
              https://app.moneysquad.in
            </Text>
          </Text>
          <View style={styles.noteAccent} />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFBFC",
  },
  header: {
    backgroundColor: "#00B9AE",
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },

  // Document Accordion
  accHeader: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#E7EAF0",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  accHeaderActive: { borderColor: "#00B9AE", backgroundColor: "#F0FDFC" },
  accHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  docIcon: {
    width: 32,
    height: 32,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  docIconText: { fontSize: 14 },
  accTitle: { fontSize: 15, fontWeight: "800", color: "#0F172A", flex: 1 },

  // Note
  note: {
    marginTop: 16,
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderRadius: 16,
    padding: 16,
    position: "relative",
    overflow: "hidden",
  },
  noteAccent: { position: "absolute", top: 0, left: 0, width: 4, height: "100%", backgroundColor: "#F59E0B" },
  noteHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  noteIconContainer: {
    width: 24,
    height: 24,
    backgroundColor: "#FEF3C7",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  noteIconText: { fontSize: 12 },
  noteTitle: { fontSize: 14, fontWeight: "800", color: "#92400E" },
  noteText: { fontSize: 13, color: "#78350F", lineHeight: 18, marginLeft: 34 },
  noteLink: { fontWeight: "900", color: "#00B9AE", textDecorationLine: "underline" },

  // Loading/Error States
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAFBFC",
  },
  loadingText: {
    marginTop: 12,
    color: "#1F2937",
    fontWeight: "700",
    fontSize: 15,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAFBFC",
    padding: 20,
  },
  errorIcon: { fontSize: 40, marginBottom: 12 },
  errorTitle: { fontSize: 16, fontWeight: "700", color: "#1F2937", marginBottom: 6 },
  errorText: { color: "#EF4444", fontWeight: "600", fontSize: 13, textAlign: "center" },
});

export default ProfileScreen;

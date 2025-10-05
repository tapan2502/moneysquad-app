import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  Animated,
  Easing,
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Text,
  ScrollView,
  Image,
  Linking, // ✅ add
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { X, LogOut, ChevronDown } from "lucide-react-native";
import type { RootState } from "../../redux/store";
import { fetchUserData, isPartnerUser } from "../../redux/slices/userDataSlice";
import { logout } from "../../redux/slices/authSlice";
import ProfileCard from "./ProfileCard";
import BankingCard from "./BankingCard";
import InfoBlocks from "./InfoBlock";
import DocumentsRow from "./DocumentsRow";

const { height } = Dimensions.get("window");

type Props = { visible: boolean; onClose: () => void };

const Sidebar: React.FC<Props> = ({ visible, onClose }) => {
  const dispatch = useDispatch();
  const { userData, loading } = useSelector((s: RootState) => s.userData);

  // ✅ ALL HOOKS FIRST
  const [personalOpen, setPersonalOpen] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);
  const [localVisible, setLocalVisible] = useState(visible);
  const progress = useRef(new Animated.Value(0)).current;

  // Scroll-related
  const [bodyHeight, setBodyHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const scrollRef = useRef<ScrollView | null>(null);

  // ✅ safe link opener
  const openURLSafe = async (url: string) => {
    try {
      const can = await Linking.canOpenURL(url);
      if (can) await Linking.openURL(url);
    } catch {
      // no-op
    }
  };

  // Show/hide animation
  useEffect(() => {
    if (visible) {
      setLocalVisible(true);
      Animated.timing(progress, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(progress, {
        toValue: 0,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(() => setLocalVisible(false));
    }
  }, [visible, progress]);

  // Lazy-load user data when opening
  useEffect(() => {
    if (localVisible && !userData) {
      dispatch(fetchUserData() as any);
    }
  }, [localVisible, userData, dispatch]);

  const requestClose = () => {
    Animated.timing(progress, {
      toValue: 0,
      duration: 220,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const onLogoutPress = () => {
    dispatch(logout());
    requestClose();
  };

  const isPartner = userData && isPartnerUser(userData);

  // Early return AFTER hooks
  if (!localVisible) return null;

  // Derived values
  const backdropOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.6],
  });
  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [40, 0],
  });
  const scale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.98, 1],
  });

  const computedScrollEnabled = personalOpen || docsOpen || contentHeight > bodyHeight;

  return (
    <Modal transparent visible={localVisible} onRequestClose={requestClose} statusBarTranslucent>
      <View style={styles.root}>
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={requestClose} />
        </Animated.View>

        {/* Panel */}
        <Animated.View style={[styles.panel, { transform: [{ translateY }, { scale }] }]}>
          {/* Header */}
          <View style={styles.headerContainer}>
            <View style={styles.headerGradient} />
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.logoContainer}>
                  <Image
                    source={require("../../../assets/images/splash-logo.png")}
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                </View>
                <View>
                  <Text style={styles.headerTitle}>MoneySquad</Text>
                  <Text style={styles.headerSubtitle}>Partner Portal</Text>
                </View>
              </View>
              <TouchableOpacity onPress={requestClose} style={styles.closeBtn} activeOpacity={0.8}>
                <X size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Body */}
          {loading ? (
            <View style={styles.center}>
              <View style={styles.loadingCard}>
                <ActivityIndicator size="large" color="#00B9AE" />
                <Text style={styles.loadingText}>Loading profile…</Text>
                <Text style={styles.loadingSubtext}>Please wait</Text>
              </View>
            </View>
          ) : isPartner && userData ? (
            <View style={styles.body} onLayout={(e) => setBodyHeight(e.nativeEvent.layout.height)}>
              <ScrollView
                ref={(ref) => (scrollRef.current = ref)}
                style={styles.body}
                contentContainerStyle={styles.bodyContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                scrollEnabled={computedScrollEnabled}
                onContentSizeChange={(_, h) => setContentHeight(h)}
              >
                <ProfileCard user={userData} />

                <BankingCard bank={userData.bankDetails} />

                {/* Documents accordion */}
                <TouchableOpacity
                  onPress={() => {
                    setDocsOpen((v) => !v);
                    requestAnimationFrame(() => scrollRef.current?.flashScrollIndicators?.());
                  }}
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

                <View style={{ height: 12 }} />
              </ScrollView>
            </View>
          ) : (
            <View style={styles.center}>
              <View style={styles.errorCard}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorTitle}>Oops!</Text>
                <Text style={styles.errorText}>Failed to load profile data</Text>
              </View>
            </View>
          )}

          {/* Footer */}
          <View style={styles.footerContainer}>
            <View style={styles.footer}>
              <TouchableOpacity style={styles.logoutBtn} onPress={onLogoutPress} activeOpacity={0.9}>
                <View style={styles.logoutIconContainer}>
                  <LogOut size={18} color="#EF4444" />
                </View>
                <Text style={styles.logoutText}>Secure Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "black" },
  panel: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height,
    backgroundColor: "#FAFBFC",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },

  // Header
  headerContainer: { position: "relative", overflow: "hidden" },
  headerGradient: { ...StyleSheet.absoluteFillObject, backgroundColor: "#00B9AE" },
  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  logoContainer: {
    position: "relative",
    width: 40,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  logoImage: { width: 26, height: 26, tintColor: "#FFFFFF" },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#FFFFFF", letterSpacing: -0.3 },
  headerSubtitle: { fontSize: 12, color: "rgba(255, 255, 255, 0.8)", fontWeight: "500" },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  body: { flex: 1 },
  bodyContent: { padding: 16 },

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
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  loadingCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    minWidth: 180,
  },
  loadingText: { marginTop: 12, color: "#1F2937", fontWeight: "700", fontSize: 15 },
  loadingSubtext: { marginTop: 4, color: "#6B7280", fontWeight: "500", fontSize: 13 },
  errorCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    minWidth: 180,
  },
  errorIcon: { fontSize: 40, marginBottom: 12 },
  errorTitle: { fontSize: 16, fontWeight: "700", color: "#1F2937", marginBottom: 6 },
  errorText: { color: "#EF4444", fontWeight: "600", fontSize: 13, textAlign: "center" },

  // Footer
  footerContainer: { backgroundColor: "#FFFFFF" },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: "#ECEFF3" },
  logoutBtn: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  logoutIconContainer: {
    width: 28,
    height: 28,
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutText: { fontSize: 15, fontWeight: "800", color: "#DC2626" },
});

export default Sidebar;

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
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  X,
  LogOut,
  ChevronRight,
  User,
  HelpCircle,
  Package
} from "lucide-react-native";
import { useRouter } from "expo-router";
import type { RootState } from "../../redux/store";
import { fetchUserData, isPartnerUser } from "../../redux/slices/userDataSlice";
import { logout } from "../../redux/slices/authSlice";

const { height } = Dimensions.get("window");

type Props = { visible: boolean; onClose: () => void };

const Sidebar: React.FC<Props> = ({ visible, onClose }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { userData, loading } = useSelector((s: RootState) => s.userData);

  const [localVisible, setLocalVisible] = useState(visible);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setLocalVisible(true);
      Animated.timing(progress, {
        toValue: 1,
        duration: 280,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(progress, {
        toValue: 0,
        duration: 240,
        easing: Easing.bezier(0.42, 0, 0.58, 1),
        useNativeDriver: true,
      }).start(() => setLocalVisible(false));
    }
  }, [visible, progress]);

  useEffect(() => {
    if (localVisible && !userData) {
      dispatch(fetchUserData() as any);
    }
  }, [localVisible, userData, dispatch]);

  const requestClose = () => {
    Animated.timing(progress, {
      toValue: 0,
      duration: 240,
      easing: Easing.bezier(0.42, 0, 0.58, 1),
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const onLogoutPress = () => {
    dispatch(logout());
    requestClose();
  };

  const handleNavigation = (screen: string) => {
    requestClose();
    setTimeout(() => {
      router.push(screen as any);
    }, 250);
  };

  const isPartner = userData && isPartnerUser(userData);

  if (!localVisible) return null;

  const backdropOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.7],
  });
  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-320, 0],
  });

  return (
    <Modal transparent visible={localVisible} onRequestClose={requestClose} statusBarTranslucent>
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={requestClose} />
        </Animated.View>

        <Animated.View style={[styles.panel, { transform: [{ translateX }] }]}>
          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#00B9AE" />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : isPartner && userData ? (
            <>
              <View style={styles.headerSection}>
                <View style={styles.headerGradient} />
                <View style={styles.headerContent}>
                  <View style={styles.logoContainer}>
                    <Image
                      source={require("../../../assets/images/splash-logo.png")}
                      style={styles.logoImage}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.headerTextContainer}>
                    <Text style={styles.appName}>MoneySquad</Text>
                    <Text style={styles.appTagline}>Partner Portal</Text>
                  </View>
                  <TouchableOpacity onPress={requestClose} style={styles.closeButton} activeOpacity={0.7}>
                    <X size={20} color="#FFFFFF" strokeWidth={2.5} />
                  </TouchableOpacity>
                </View>

                <View style={styles.profileSection}>
                  <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {userData.name?.charAt(0).toUpperCase() || "U"}
                      </Text>
                    </View>
                    <View style={styles.onlineBadge} />
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{userData.name}</Text>
                    <Text style={styles.userEmail}>{userData.email}</Text>
                    <View style={styles.userIdContainer}>
                      <Text style={styles.userIdLabel}>ID:</Text>
                      <Text style={styles.userIdValue}>{userData.partnerId}</Text>
                    </View>
                  </View>
                </View>
              </View>

              <ScrollView style={styles.menuSection} showsVerticalScrollIndicator={false}>
                <View style={styles.menuGroup}>
                  <Text style={styles.menuGroupTitle}>ACCOUNT</Text>
                  <MenuItem
                    icon={User}
                    title="Profile"
                    subtitle="View your details"
                    onPress={() => handleNavigation("/(tabs)/index")}
                  />
                </View>

                <View style={styles.menuGroup}>
                  <Text style={styles.menuGroupTitle}>RESOURCES</Text>
                  <MenuItem
                    icon={HelpCircle}
                    title="Support"
                    subtitle="Get help & resources"
                    onPress={() => handleNavigation("/(tabs)/support")}
                  />
                  <MenuItem
                    icon={Package}
                    title="Products"
                    subtitle="Browse our offerings"
                    onPress={() => handleNavigation("/(tabs)/product-info")}
                  />
                </View>

                <View style={{ height: 100 }} />
              </ScrollView>

              <View style={styles.footerSection}>
                <TouchableOpacity style={styles.logoutButton} onPress={onLogoutPress} activeOpacity={0.85}>
                  <View style={styles.logoutIconWrapper}>
                    <LogOut size={18} color="#EF4444" strokeWidth={2.5} />
                  </View>
                  <View style={styles.logoutTextContainer}>
                    <Text style={styles.logoutTitle}>Log Out</Text>
                    <Text style={styles.logoutSubtitle}>End your session</Text>
                  </View>
                </TouchableOpacity>
                <View style={styles.versionContainer}>
                  <Text style={styles.versionText}>Version 1.0.0</Text>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.center}>
              <Text style={styles.errorText}>Failed to load profile</Text>
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

type MenuItemProps = {
  icon: React.ComponentType<any>;
  title: string;
  subtitle: string;
  onPress: () => void;
};

const MenuItem: React.FC<MenuItemProps> = ({ icon: Icon, title, subtitle, onPress }) => {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.menuIconContainer}>
        <Icon size={20} color="#00B9AE" strokeWidth={2.5} />
      </View>
      <View style={styles.menuTextContainer}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>
      <ChevronRight size={18} color="#94A3B8" strokeWidth={2.5} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "#000000" },
  panel: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 320,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 6, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 24,
  },

  headerSection: {
    position: "relative",
    overflow: "hidden",
  },
  headerGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#00B9AE",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  logoContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  logoImage: {
    width: 28,
    height: 28,
    tintColor: "#FFFFFF",
  },
  headerTextContainer: {
    flex: 1,
  },
  appName: {
    fontSize: 19,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  appTagline: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.85)",
    marginTop: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },

  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 14,
    backgroundColor: "rgba(0, 0, 0, 0.08)",
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#00B9AE",
  },
  onlineBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#10B981",
    borderWidth: 2.5,
    borderColor: "#00B9AE",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 3,
    letterSpacing: -0.3,
  },
  userEmail: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.85)",
    marginBottom: 6,
  },
  userIdContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.15)",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  userIdLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.7)",
    marginRight: 4,
  },
  userIdValue: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  menuSection: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  menuGroup: {
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  menuGroupTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F0FDFC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  menuSubtitle: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748B",
  },

  footerSection: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  logoutIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  logoutTextContainer: {
    flex: 1,
  },
  logoutTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#DC2626",
    marginBottom: 1,
  },
  logoutSubtitle: {
    fontSize: 11,
    fontWeight: "500",
    color: "#F87171",
  },
  versionContainer: {
    alignItems: "center",
  },
  versionText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94A3B8",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  errorText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#EF4444",
  },
});

export default Sidebar;

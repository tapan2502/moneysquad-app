import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  Animated,
  Easing,
  View,
  TouchableOpacity,
  StyleSheet,
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
import { useNavigation } from "@react-navigation/native";
import type { RootState } from "../../redux/store";
import { fetchUserData, isPartnerUser } from "../../redux/slices/userDataSlice";
import { logout } from "../../redux/slices/authSlice";

type Props = { visible: boolean; onClose: () => void };

const Sidebar: React.FC<Props> = ({ visible, onClose }) => {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const { userData, loading } = useSelector((s: RootState) => s.userData);

  const [localVisible, setLocalVisible] = useState(visible);
  const progress = useRef(new Animated.Value(0)).current;
  const logoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    return () => {
      if (logoutTimer.current) {
        clearTimeout(logoutTimer.current);
        logoutTimer.current = null;
      }
    };
  }, []);

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
    requestClose();
    logoutTimer.current = setTimeout(() => {
      dispatch(logout());
      logoutTimer.current = null;
    }, 320);
  };

  const handleNavigation = (screen: string) => {
    requestClose();
    setTimeout(() => {
      navigation.navigate(screen);
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
    outputRange: [-280, 0],
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
                    <X size={18} color="#FFFFFF" strokeWidth={2.5} />
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
                    <Text style={styles.userName} numberOfLines={1}>{userData.name}</Text>
                    <Text style={styles.userEmail} numberOfLines={1}>{userData.email}</Text>
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
                    subtitle="Your details"
                    onPress={() => handleNavigation("Profile")}
                  />
                </View>

                <View style={styles.menuGroup}>
                  <Text style={styles.menuGroupTitle}>RESOURCES</Text>
                  <MenuItem
                    icon={HelpCircle}
                    title="Support"
                    subtitle="Help & resources"
                    onPress={() => handleNavigation("Support")}
                  />
                  <MenuItem
                    icon={Package}
                    title="Products"
                    subtitle="Our offerings"
                    onPress={() => handleNavigation("ProductInfo")}
                  />
                </View>

                <View style={{ height: 80 }} />
              </ScrollView>

              <View style={styles.footerSection}>
                <TouchableOpacity style={styles.logoutButton} onPress={onLogoutPress} activeOpacity={0.85}>
                  <View style={styles.logoutIconWrapper}>
                    <LogOut size={16} color="#EF4444" strokeWidth={2.5} />
                  </View>
                  <Text style={styles.logoutTitle}>Log Out</Text>
                </TouchableOpacity>
                <View style={styles.versionContainer}>
                  <Text style={styles.versionText}>v1.0.0</Text>
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
        <Icon size={18} color="#00B9AE" strokeWidth={2.5} />
      </View>
      <View style={styles.menuTextContainer}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>
      <ChevronRight size={16} color="#94A3B8" strokeWidth={2.5} />
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
    width: 280,
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
    paddingTop: 52,
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 10,
  },
  logoContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  logoImage: {
    width: 24,
    height: 24,
    tintColor: "#FFFFFF",
  },
  headerTextContainer: {
    flex: 1,
  },
  appName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.4,
  },
  appTagline: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.85)",
    marginTop: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },

  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    backgroundColor: "rgba(0, 0, 0, 0.08)",
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2.5,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#00B9AE",
  },
  onlineBadge: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#10B981",
    borderWidth: 2,
    borderColor: "#00B9AE",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  userEmail: {
    fontSize: 11,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.85)",
    marginBottom: 5,
  },
  userIdContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.15)",
    alignSelf: "flex-start",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  userIdLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.7)",
    marginRight: 3,
  },
  userIdValue: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  menuSection: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  menuGroup: {
    paddingTop: 18,
    paddingHorizontal: 16,
  },
  menuGroupTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 1,
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  menuIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "#F0FDFC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 1,
    letterSpacing: -0.1,
  },
  menuSubtitle: {
    fontSize: 11,
    fontWeight: "500",
    color: "#64748B",
  },

  footerSection: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
    paddingVertical: 11,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#FEE2E2",
    gap: 8,
  },
  logoutIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#DC2626",
  },
  versionContainer: {
    alignItems: "center",
  },
  versionText: {
    fontSize: 10,
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
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
  errorText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#EF4444",
  },
});

export default Sidebar;

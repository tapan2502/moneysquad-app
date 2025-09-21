import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { User, Mail, Phone, MapPin, Calendar } from "lucide-react-native";

type UserType = {
  partnerId?: string;
  documents?: { profilePhoto?: string };
  basicInfo?: { fullName?: string; email?: string; mobile?: string };
  personalInfo?: {
    dateOfBirth?: string;
    currentProfession?: string;
    emergencyContactNumber?: string;
    experienceInSellingLoans?: string;
    focusProduct?: string;
  };
  addressDetails?: {
    addressType?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    pincode?: string | number;
  };
};

const safe = (v?: string | number | null) =>
  (v === 0 ? "0" : v) ? String(v) : "Not provided";

const formatDate = (iso?: string) => {
  if (!iso) return "Not provided";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "Not provided";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatAddress = (u?: UserType) => {
  const a = u?.addressDetails;
  if (!a) return "Not provided";
  const parts = [a.addressLine1, a.addressLine2, a.city].filter(Boolean).map(String);
  if (a.pincode) parts.push(`- ${a.pincode}`);
  return parts.length ? parts.join(", ") : "Not provided";
};

const Row = ({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value?: string;
}) => (
  <View style={styles.row}>
    {icon ? <View style={styles.rowIcon}>{icon}</View> : <View style={{ width: 20 }} />}
    <View style={styles.rowText}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={2}>
        {safe(value)}
      </Text>
    </View>
  </View>
);

const Divider = () => <View style={styles.divider} />;

const ProfileCard = ({ user }: { user: UserType }) => {
  const dob = formatDate(user?.personalInfo?.dateOfBirth);
  const initials =
    user?.basicInfo?.fullName
      ?.trim()
      ?.split(/\s+/)
      ?.slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join("") || "U";

  return (
    <View style={styles.wrapper}>
      {/* Accent header strip */}
      <View style={styles.accent} />

      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarWrap}>
            {user?.documents?.profilePhoto ? (
              <Image source={{ uri: user.documents.profilePhoto }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <User size={20} color="#fff" />
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{user?.basicInfo?.fullName || "Unknown User"}</Text>

            <View style={styles.metaRow}>
              <Text style={styles.meta}>Partner ID</Text>
              <View style={styles.pill}>
                <Text style={styles.pillText}>{user?.partnerId || "N/A"}</Text>
              </View>
            </View>
          </View>
        </View>

        <Divider />

        {/* Contact */}
        <Text style={styles.sectionTitle}>Contact</Text>
        <Row icon={<Mail size={16} color="#0E7490" />} label="Email" value={user?.basicInfo?.email} />
        <Row icon={<Phone size={16} color="#0E7490" />} label="Mobile" value={user?.basicInfo?.mobile} />

        <Divider />

        {/* Personal */}
        <Text style={styles.sectionTitle}>Personal</Text>
        <Row icon={<Calendar size={16} color="#0E7490" />} label="Date of Birth" value={dob} />
        <Row label="Profession" value={user?.personalInfo?.currentProfession} />
        <Row label="Emergency Contact" value={user?.personalInfo?.emergencyContactNumber} />
        <Row label="Loan Experience" value={user?.personalInfo?.experienceInSellingLoans} />
        <Row label="Focus Product" value={user?.personalInfo?.focusProduct} />

        <Divider />

        {/* Address (no matrix/stats below) */}
        <Text style={styles.sectionTitle}>Address</Text>
        <Row
          icon={<MapPin size={16} color="#0E7490" />}
          label={user?.addressDetails?.addressType || "Primary Address"}
          value={formatAddress(user)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: 12,
  },

  // Slim accent like premium apps
  accent: {
    height: 6,
    borderRadius: 999,
    backgroundColor: "#0EA5A6", // refined teal
    opacity: 0.9,
    alignSelf: "flex-start",
    width: 64,
    marginLeft: 2,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E6E9F0",
    shadowColor: "#0B1220",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },

  // Header
  header: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E7EE",
    backgroundColor: "#F5F7FB",
  },
  avatar: { width: "100%", height: "100%" },
  avatarFallback: {
    flex: 1,
    backgroundColor: "#0E7490",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  avatarInitials: {
    position: "absolute",
    bottom: 6,
    fontSize: 10,
    fontWeight: "700",
    color: "#E0F2FE",
    opacity: 0.9,
    letterSpacing: 0.5,
  },

  name: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.2,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  meta: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#F1F5F9",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  pillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: 0.2,
  },

  // Sections
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: 0.3,
    marginBottom: 6,
    marginTop: 8,
  },

  // Rows
  row: { flexDirection: "row", gap: 10, alignItems: "flex-start", paddingVertical: 6 },
  rowIcon: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: "#F2F6FA",
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: { flex: 1, minWidth: 0 },
  rowLabel: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  rowValue: {
    fontSize: 15,
    color: "#0F172A",
    fontWeight: "700",
    lineHeight: 21,
    letterSpacing: 0.1,
  },

  divider: { height: StyleSheet.hairlineWidth, backgroundColor: "#E6E9F0", marginVertical: 12 },
});

export default ProfileCard;

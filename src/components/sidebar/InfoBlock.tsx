import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Mail, Phone, Calendar, Briefcase, ShieldAlert, MapPin, ChevronDown, User, Building } from "lucide-react-native";

const Row = ({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) => (
  <View style={styles.row}>
    <View style={styles.iconContainer}>{icon}</View>
    <View style={styles.textContainer}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value} numberOfLines={2}>{value || "Not provided"}</Text>
    </View>
  </View>
);

const formatDate = (iso?: string) => {
  if (!iso) return "Not provided";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const InfoBlocks = ({
  user,
  personalOpen,
  onTogglePersonal,
}: {
  user: any;
  personalOpen: boolean;
  onTogglePersonal: () => void;
}) => {
  const dob = formatDate(user?.personalInfo?.dateOfBirth);

  return (
    <View style={styles.container}>
      {/* Contact Information Card */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIconContainer}>
            <User size={14} color="#00B9AE" />
          </View>
          <Text style={styles.sectionTitle}>Contact Details</Text>
        </View>
        
        <View style={styles.card}>
          <Row 
            icon={<Mail size={16} color="#00B9AE" />} 
            label="Email Address" 
            value={user?.basicInfo?.email} 
          />
          <View style={styles.separator} />
          <Row 
            icon={<Phone size={16} color="#00B9AE" />} 
            label="Mobile Number" 
            value={user?.basicInfo?.mobile} 
          />
        </View>
      </View>

      {/* Personal Information Accordion */}
      <View style={styles.section}>
        <TouchableOpacity 
          onPress={onTogglePersonal} 
          activeOpacity={0.8} 
          style={[styles.accordionHeader, personalOpen && styles.accordionHeaderActive]}
        >
          <View style={styles.accordionLeft}>
            <View style={[styles.sectionIconContainer, personalOpen && styles.sectionIconActive]}>
              <Briefcase size={14} color={personalOpen ? "#FFFFFF" : "#00B9AE"} />
            </View>
            <Text style={styles.sectionTitle}>Personal Information</Text>
          </View>
          <ChevronDown
            size={18}
            color="#64748B"
            style={{ 
              transform: [{ rotate: personalOpen ? "180deg" : "0deg" }],
              opacity: personalOpen ? 1 : 0.7
            }}
          />
        </TouchableOpacity>
        
        {personalOpen && (
          <View style={styles.card}>
            <Row 
              icon={<Calendar size={16} color="#00B9AE" />} 
              label="Date of Birth" 
              value={dob} 
            />
            <View style={styles.separator} />
            <Row 
              icon={<Building size={16} color="#00B9AE" />} 
              label="Current Profession" 
              value={user?.personalInfo?.currentProfession} 
            />
            <View style={styles.separator} />
            <Row 
              icon={<ShieldAlert size={16} color="#00B9AE" />} 
              label="Emergency Contact" 
              value={user?.personalInfo?.emergencyContactNumber} 
            />
            <View style={styles.separator} />
            <Row 
              icon={<Briefcase size={16} color="#00B9AE" />} 
              label="Loan Experience" 
              value={user?.personalInfo?.experienceInSellingLoans} 
            />
            <View style={styles.separator} />
            <Row 
              icon={<Briefcase size={16} color="#00B9AE" />} 
              label="Focus Product" 
              value={user?.personalInfo?.focusProduct} 
            />
          </View>
        )}
      </View>

      {/* Address Information Card */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIconContainer}>
            <MapPin size={14} color="#00B9AE" />
          </View>
          <Text style={styles.sectionTitle}>Address Details</Text>
        </View>
        
        <View style={styles.card}>
          <Row
            icon={<MapPin size={16} color="#00B9AE" />}
            label={user?.addressDetails?.addressType || "Primary Address"}
            value={`${user?.addressDetails?.addressLine1 || ""}${user?.addressDetails?.addressLine2 ? `, ${user.addressDetails.addressLine2}` : ""}, ${user?.addressDetails?.city || ""} ${user?.addressDetails?.pincode ? `- ${user.addressDetails.pincode}` : ""}`}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },

  section: {
    gap: 8,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },

  sectionIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#F0FDFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#B2F5EA',
  },

  sectionIconActive: {
    backgroundColor: '#00B9AE',
    borderColor: '#00B9AE',
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: -0.2,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 2,
  },

  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F0FDFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    borderWidth: 1,
    borderColor: '#B2F5EA',
  },

  textContainer: {
    flex: 1,
    minWidth: 0,
  },

  label: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  value: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
    lineHeight: 20,
  },

  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
    marginLeft: 48,
  },

  // Accordion Styles
  accordionHeader: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },

  accordionHeaderActive: {
    borderColor: '#00B9AE',
    backgroundColor: '#F0FDFC',
    shadowColor: '#00B9AE',
    shadowOpacity: 0.1,
  },

  accordionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
});

export default InfoBlocks;
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Building2, CreditCard, Shield, Verified } from "lucide-react-native";

const BankingCard = ({ bank }: { bank: any }) => {
  const last4 = String(bank?.accountNumber || "").slice(-4);

  return (
    <View style={styles.section}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIconContainer}>
          <CreditCard size={14} color="#00B9AE" />
        </View>
        <Text style={styles.sectionTitle}>Banking Details</Text>
        <View style={styles.verifiedBadge}>
          <Shield size={10} color="#10B981" />
          <Text style={styles.verifiedText}>Verified</Text>
        </View>
      </View>

      {/* Premium Banking Card */}
      <View style={styles.cardContainer}>
        <LinearGradient
          colors={["#0F172A", "#1E293B", "#334155"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          {/* Premium Accent Border */}
          <View style={styles.accentBorder} />
          
          {/* Decorative Background Elements */}
          <View style={styles.bgCircle1} />
          <View style={styles.bgCircle2} />
          
          {/* Card Content */}
          <View style={styles.cardContent}>
            {/* Header Section */}
            <View style={styles.header}>
              <View style={styles.bankIconContainer}>
                <Building2 size={20} color="#FFFFFF" />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.bankName} numberOfLines={1}>
                  {bank?.bankName || "Bank Name"}
                </Text>
                <Text style={styles.accountType}>
                  {bank?.accountType || "Account Type"}
                </Text>
              </View>
              <View style={styles.chipIcon}>
                <Verified size={16} color="#00B9AE" />
              </View>
            </View>

            {/* Account Number Display */}
            <View style={styles.numberSection}>
              <Text style={styles.numberLabel}>Account Number</Text>
              <View style={styles.numberDisplay}>
                <Text style={styles.maskedDigits}>•••• •••• ••••</Text>
                <Text style={styles.visibleDigits}>{last4 || "0000"}</Text>
              </View>
            </View>

            {/* Footer Information */}
            <View style={styles.footer}>
              <View style={styles.footerItem}>
                <Text style={styles.footerLabel}>Account Holder</Text>
                <Text style={styles.footerValue} numberOfLines={1}>
                  {bank?.accountHolderName || "Account Holder"}
                </Text>
              </View>
              
              <View style={styles.footerItem}>
                <Text style={styles.footerLabel}>IFSC Code</Text>
                <Text style={styles.footerValue} numberOfLines={1}>
                  {bank?.ifscCode || "IFSC CODE"}
                </Text>
              </View>
            </View>

            {/* Branch Information */}
            {bank?.branchName && (
              <View style={styles.branchInfo}>
                <Text style={styles.branchLabel}>Branch</Text>
                <Text style={styles.branchValue} numberOfLines={1}>
                  {bank.branchName}
                </Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: 16,
    gap: 8,
  },

  // Section Header
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

  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: -0.2,
    flex: 1,
  },

  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },

  verifiedText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#059669',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Card Container
  cardContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },

  card: {
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 180,
  },

  accentBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#00B9AE',
  },

  // Background Decorative Elements
  bgCircle1: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 185, 174, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 185, 174, 0.2)',
  },

  bgCircle2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },

  cardContent: {
    flex: 1,
    zIndex: 2,
  },

  // Header Section
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },

  bankIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  headerText: {
    flex: 1,
  },

  bankName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 2,
  },

  accountType: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },

  chipIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 185, 174, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Account Number Section
  numberSection: {
    marginBottom: 20,
  },

  numberLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },

  numberDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  maskedDigits: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 3,
    fontFamily: 'monospace',
  },

  visibleDigits: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
    fontFamily: 'monospace',
  },

  // Footer Section
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  footerItem: {
    flex: 1,
    maxWidth: '48%',
  },

  footerLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },

  footerValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },

  // Branch Information
  branchInfo: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 12,
  },

  branchLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },

  branchValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
});

export default BankingCard;
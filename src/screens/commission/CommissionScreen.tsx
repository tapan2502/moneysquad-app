// screens/commission/CommissionScreen.tsx
"use client"

import React, { useEffect, useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "../../redux/store"
import {
  fetchCommissionData,
  fetchDisbursedLeads,
  fetchMonthlyBreakdown,
  clearError,
} from "../../redux/slices/commissionSlice"
import { fetchUserData, isPartnerUser } from "../../redux/slices/userDataSlice"
import { DollarSign } from "lucide-react-native"
import { Snackbar } from "react-native-paper"

// 👇 paths match your screenshot (one “m” → comission)
import DisbursedLeadsTab from "./components/DisbursedLeadsTab"
import PayoutHistoryTab from "./components/PayoutHistoryTab"
import ComissionGridTab from "./components/ComissionGridTab"

const CommissionScreen: React.FC = () => {
  const dispatch = useDispatch()

  const {
    commissionData,
    disbursedLeads,
    monthlyBreakdown,
    isPayoutLoading,
    isBreakdownLoading,
    error,
  } = useSelector((state: RootState) => state.commission)

  const { userData, isLoading: isUserLoading } = useSelector((state: RootState) => state.userData)

  const [activeTab, setActiveTab] = useState<"disbursed" | "payout" | "commission">("disbursed")

  useEffect(() => {
    dispatch(fetchUserData() as any)
    dispatch(fetchCommissionData() as any)
    dispatch(fetchDisbursedLeads() as any)
    dispatch(fetchMonthlyBreakdown() as any)
  }, [dispatch])

  const onRefreshAll = () => {
    dispatch(fetchCommissionData() as any)
    dispatch(fetchDisbursedLeads() as any)
    dispatch(fetchMonthlyBreakdown() as any)
  }

  const handleDismissError = () => dispatch(clearError())

  const isLeadSharingRole =
    !!userData && isPartnerUser(userData) && userData.personalInfo?.roleSelection === "leadSharing"

  const userCommissionType =
    !!userData && isPartnerUser(userData) ? userData.commissionPlan || "gold" : "gold"

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <DollarSign size={24} color="#4F46E5" />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.headerTitle}>Commission Dashboard</Text>
            <Text style={styles.headerSubtitle}>Track your earnings and commission rates</Text>
          </View>
        </View>
      </View>

      {/* Top Tabs */}
      <View style={styles.tabNavigation}>
        <TabButton
          label="Disbursed Leads"
          active={activeTab === "disbursed"}
          onPress={() => setActiveTab("disbursed")}
        />
        <TabButton
          label="Payout History"
          active={activeTab === "payout"}
          onPress={() => setActiveTab("payout")}
        />
        <TabButton
          label="Commission Grid"
          active={activeTab === "commission"}
          onPress={() => setActiveTab("commission")}
        />
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        {activeTab === "disbursed" && (
          <DisbursedLeadsTab
            data={disbursedLeads}
            isLoading={isPayoutLoading || isUserLoading}
            onRefresh={onRefreshAll}
          />
        )}

        {activeTab === "payout" && (
          <PayoutHistoryTab
            data={monthlyBreakdown}
            isLoading={isBreakdownLoading || isUserLoading}
            onRefresh={onRefreshAll}
          />
        )}

        {activeTab === "commission" && (
          <ComissionGridTab
            plans={commissionData}
            isLeadSharingRole={isLeadSharingRole}
            userCommissionType={userCommissionType}
          />
        )}
      </View>

      {/* Error Snackbar */}
      <Snackbar
        visible={!!error}
        onDismiss={handleDismissError}
        action={{ label: "Dismiss", onPress: handleDismissError }}
      >
        {error}
      </Snackbar>
    </View>
  )
}

const TabButton = ({
  label,
  active,
  onPress,
}: {
  label: string
  active: boolean
  onPress: () => void
}) => (
  <TouchableOpacity style={[styles.tabButton, active && styles.tabButtonActive]} onPress={onPress}>
    <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
  </TouchableOpacity>
)

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },

  header: {
    backgroundColor: "#FFFFFF",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    elevation: 2,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  headerTitle: { fontSize: 22, fontWeight: "900", color: "#0F172A" },
  headerSubtitle: { fontSize: 13, color: "#64748B", fontWeight: "600" },

  tabNavigation: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  tabButtonActive: { borderBottomColor: "#4F46E5" },
  tabText: { fontSize: 13, color: "#6B7280", fontWeight: "800" },
  tabTextActive: { color: "#4F46E5" },
})

export default CommissionScreen

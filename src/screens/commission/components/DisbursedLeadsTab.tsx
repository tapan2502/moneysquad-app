import React, { memo } from "react"
import { View, Text, StyleSheet, FlatList, RefreshControl } from "react-native"
import { Clock, CircleCheck as CheckCircle, CircleAlert as AlertCircle } from "lucide-react-native"
import { formatCurrency, formatDate, getStatusColor } from "../utils/comissionUtils"
import { DisbursedLead } from "@/src/redux/slices/commissionSlice"

type Props = {
  data: DisbursedLead[]
  isLoading: boolean
  onRefresh: () => void
}

const getStatusIcon = (status?: string) => {
  switch ((status || "").toLowerCase()) {
    case "paid":
      return CheckCircle
    case "pending":
      return Clock
    case "processing":
      return AlertCircle
    default:
      return Clock
  }
}

// UPI-like compact row: left (title/subtitle), right (amounts/status)
const Row = ({ item }: { item: DisbursedLead }) => {
  const StatusIcon = getStatusIcon(item.payoutStatus)
  const statusColor = getStatusColor(item.payoutStatus)

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text style={styles.primary}>{item.applicant?.name ?? "-"}</Text>
        <Text style={styles.secondary}>
          #{item.leadId} • {item.lender?.name ?? "-"} • {item.lender?.loanType?.replace(/_/g, " ") ?? "-"}
        </Text>
        <Text style={styles.tertiary}>{formatDate(item.disbursedId?.actualDisbursedDate)}</Text>
      </View>

      <View style={styles.right}>
        <Text style={[styles.amount, { color: "#10B981" }]}>{formatCurrency(item.netPayout)}</Text>
        <Text style={styles.muted}>Net payout</Text>

        <View style={[styles.badge, { backgroundColor: `${statusColor}15` }]}>
          <StatusIcon size={12} color={statusColor} />
          <Text style={[styles.badgeText, { color: statusColor }]}>{(item.payoutStatus || "").toUpperCase()}</Text>
        </View>

        <Text style={styles.mutedSmall}>
          Loan: {formatCurrency(item.disbursedAmount)} • Comm {item.commission}%
        </Text>
      </View>
    </View>
  )
}

const DisbursedLeadsTab: React.FC<Props> = ({ data, isLoading, onRefresh }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Disbursed Leads</Text>
      <Text style={styles.subtitle}>{data.length} total disbursements with payout details</Text>

      <FlatList
        data={data}
        keyExtractor={(it) => it._id}
        renderItem={({ item }) => <Row item={item} />}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} colors={["#4F46E5"]} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No disbursed leads</Text>
            <Text style={styles.emptySub}>Disbursed leads will appear here</Text>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: "900", color: "#0F172A" },
  subtitle: { fontSize: 13, color: "#64748B", marginTop: 2, marginBottom: 12 },
  list: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EEF2F7",
    paddingHorizontal: 8,
  },
  row: {
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "space-between",
  },
  sep: { height: 1, backgroundColor: "#F1F5F9" },
  left: { flex: 1, paddingRight: 8 },
  right: { alignItems: "flex-end", minWidth: 140 },
  primary: { fontSize: 15, fontWeight: "800", color: "#0F172A" },
  secondary: { fontSize: 12, color: "#475569", marginTop: 2 },
  tertiary: { fontSize: 11, color: "#94A3B8", marginTop: 2 },
  amount: { fontSize: 16, fontWeight: "900" },
  muted: { fontSize: 11, color: "#64748B", marginTop: 2 },
  mutedSmall: { fontSize: 10, color: "#94A3B8", marginTop: 4 },
  badge: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  badgeText: { fontSize: 10, fontWeight: "800" },
  empty: { alignItems: "center", paddingVertical: 48 },
  emptyTitle: { fontSize: 16, fontWeight: "800", color: "#374151" },
  emptySub: { fontSize: 12, color: "#6B7280", marginTop: 4 },
})

export default memo(DisbursedLeadsTab)

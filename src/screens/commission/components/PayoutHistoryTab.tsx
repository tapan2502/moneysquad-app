import React, { memo } from "react"
import { View, Text, StyleSheet, FlatList, RefreshControl } from "react-native"
import { Calendar } from "lucide-react-native"
import { formatCurrency, getStatusColor } from "../utils/comissionUtils"
import { MonthlyBreakdown } from "@/src/redux/slices/commissionSlice"

type Props = {
  data: MonthlyBreakdown[]
  isLoading: boolean
  onRefresh: () => void
}

const Row = ({ item }: { item: MonthlyBreakdown }) => {
  const color = getStatusColor(item.paymentStatus)
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <View style={styles.iconWrap}>
          <Calendar size={16} color="#4F46E5" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.primary}>
            {new Date(item.month + "-01").toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
          </Text>
          <Text style={[styles.status, { color }]}>{item.paymentStatus}</Text>
          <Text style={styles.meta}>GST: {item.gstStatus}</Text>
        </View>
      </View>

      <View style={styles.right}>
        <Text style={[styles.amount, { color: "#0F172A" }]}>{formatCurrency(item.totalDisbursals)}</Text>
        <Text style={styles.muted}>Total Disbursed</Text>
        <Text style={[styles.amountSmall, { color: "#4F46E5" }]}>{formatCurrency(item.commissionEarned)}</Text>
        <Text style={styles.muted}>Commission</Text>
      </View>
    </View>
  )
}

const PayoutHistoryTab: React.FC<Props> = ({ data, isLoading, onRefresh }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payout History</Text>
      <Text style={styles.subtitle}>Monthly breakdown of commissions and payouts</Text>

      <FlatList
        data={data}
        keyExtractor={(it) => it.month}
        renderItem={({ item }) => <Row item={item} />}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} colors={["#4F46E5"]} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No payout history</Text>
            <Text style={styles.emptySub}>Monthly breakdown will appear here</Text>
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
  left: { flexDirection: "row", alignItems: "center", flex: 1, paddingRight: 8 },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  right: { alignItems: "flex-end", minWidth: 140 },
  primary: { fontSize: 15, fontWeight: "800", color: "#0F172A" },
  status: { fontSize: 12, fontWeight: "700", marginTop: 2 },
  meta: { fontSize: 11, color: "#94A3B8", marginTop: 2 },
  amount: { fontSize: 16, fontWeight: "900" },
  amountSmall: { fontSize: 14, fontWeight: "800", marginTop: 6 },
  muted: { fontSize: 11, color: "#64748B" },
  empty: { alignItems: "center", paddingVertical: 48 },
  emptyTitle: { fontSize: 16, fontWeight: "800", color: "#374151" },
  emptySub: { fontSize: 12, color: "#6B7280", marginTop: 4 },
})

export default memo(PayoutHistoryTab)

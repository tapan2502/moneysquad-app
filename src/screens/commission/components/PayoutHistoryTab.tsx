import React, { memo, useMemo, useState } from "react"
import { View, Text, StyleSheet, FlatList, RefreshControl } from "react-native"
import { Calendar } from "lucide-react-native"
import { formatCurrency, getStatusColor, getCurrentMonthKey, formatMonthLabel, sortMonthKeysDesc } from "../utils/comissionUtils"
import { MonthlyBreakdown } from "@/src/redux/slices/commissionSlice"
import CustomDropdown from "@/src/components/CustomDropdown"

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

const CURRENT_MONTH = getCurrentMonthKey()

const prettify = (value: string) => value.replace(/\b\w/g, (char) => char.toUpperCase())

const PayoutHistoryTab: React.FC<Props> = ({ data, isLoading, onRefresh }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(CURRENT_MONTH)
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>("")
  const [selectedGstStatus, setSelectedGstStatus] = useState<string>("")

  const monthOptions = useMemo(() => {
    const months = new Set<string>()
    data.forEach((item) => {
      if (item?.month) months.add(item.month)
    })
    if (CURRENT_MONTH) months.add(CURRENT_MONTH)
    const sortedKeys = sortMonthKeysDesc(Array.from(months))
    const monthList = sortedKeys.map((key) => ({ value: key, label: formatMonthLabel(key) }))
    return [
      { label: "All Months", value: "" },
      ...monthList,
    ]
  }, [data])

  const paymentStatusOptions = useMemo(() => {
    const statuses = new Set<string>()
    data.forEach((item) => {
      if (item?.paymentStatus) statuses.add(item.paymentStatus.toLowerCase())
    })
    return [
      { label: "All Status", value: "" },
      ...Array.from(statuses)
        .sort()
        .map((status) => ({ label: prettify(status), value: status })),
    ]
  }, [data])

  const gstStatusOptions = useMemo(() => {
    const statuses = new Set<string>()
    data.forEach((item) => {
      if (item?.gstStatus) statuses.add(item.gstStatus.toLowerCase())
    })
    return [
      { label: "All Status", value: "" },
      ...Array.from(statuses)
        .sort()
        .map((status) => ({ label: prettify(status), value: status })),
    ]
  }, [data])

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (selectedMonth && item?.month !== selectedMonth) return false
      if (selectedPaymentStatus && (item?.paymentStatus || "").toLowerCase() !== selectedPaymentStatus) return false
      if (selectedGstStatus && (item?.gstStatus || "").toLowerCase() !== selectedGstStatus) return false
      return true
    })
  }, [data, selectedGstStatus, selectedMonth, selectedPaymentStatus])

  const summaryLabel = selectedMonth ? formatMonthLabel(selectedMonth) : "all time"

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payout History</Text>
      <Text style={styles.subtitle}>
        {filteredData.length} record{filteredData.length === 1 ? "" : "s"} ({summaryLabel})
      </Text>

      <View style={styles.filtersRow}>
        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>Month</Text>
          <CustomDropdown
            hideLabel
            value={selectedMonth}
            onSelect={setSelectedMonth}
            options={monthOptions}
            placeholder="Select month"
            containerStyle={styles.inlineDropdownContainer}
            dropdownStyle={styles.filterDropdown}
            textStyle={styles.filterText}
            placeholderStyle={styles.filterPlaceholder}
          />
        </View>

        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>Payment Status</Text>
          <CustomDropdown
            hideLabel
            value={selectedPaymentStatus}
            onSelect={setSelectedPaymentStatus}
            options={paymentStatusOptions}
            placeholder="All status"
            containerStyle={styles.inlineDropdownContainer}
            dropdownStyle={styles.filterDropdown}
            textStyle={styles.filterText}
            placeholderStyle={styles.filterPlaceholder}
          />
        </View>

        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>GST Status</Text>
          <CustomDropdown
            hideLabel
            value={selectedGstStatus}
            onSelect={setSelectedGstStatus}
            options={gstStatusOptions}
            placeholder="All status"
            containerStyle={styles.inlineDropdownContainer}
            dropdownStyle={styles.filterDropdown}
            textStyle={styles.filterText}
            placeholderStyle={styles.filterPlaceholder}
          />
        </View>
      </View>

      <FlatList
        data={filteredData}
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
  subtitle: { fontSize: 13, color: "#64748B", marginTop: 2, marginBottom: 16 },
  filtersRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 12,
  },
  filterItem: {
    flex: 1,
    minWidth: 160,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  inlineDropdownContainer: {
    marginBottom: 0,
  },
  filterDropdown: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1F2937",
  },
  filterPlaceholder: {
    color: "#9CA3AF",
    fontWeight: "600",
  },
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

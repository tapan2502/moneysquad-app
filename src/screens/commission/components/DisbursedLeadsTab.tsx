import React, { memo, useMemo, useState } from "react"
<<<<<<< HEAD
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from "react-native"
import { Clock, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Eye } from "lucide-react-native"
=======
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Modal, ActivityIndicator } from "react-native"
import { Clock, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Eye, X as XIcon } from "lucide-react-native"
>>>>>>> 682d4167d5f343590a902178bd532752590d7e32
import { formatCurrency, formatDate, getStatusColor, getCurrentMonthKey, getMonthKey, formatMonthLabel, sortMonthKeysDesc } from "../utils/comissionUtils"
import { DisbursedLead } from "@/src/redux/slices/commissionSlice"
import CustomDropdown from "@/src/components/CustomDropdown"
import PayoutDetailsModal from "./PayoutDetailsModal"

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
<<<<<<< HEAD
const Row = ({ item, onViewDetails }: { item: DisbursedLead; onViewDetails: (leadId: string) => void }) => {
=======
const Row = ({ item, onViewDetails }: { item: DisbursedLead; onViewDetails: (leadUserId: string) => void }) => {
>>>>>>> 682d4167d5f343590a902178bd532752590d7e32
  const StatusIcon = getStatusIcon(item.payoutStatus)
  const statusColor = getStatusColor(item.payoutStatus)

  const handlePress = () => {
<<<<<<< HEAD
    if (!item._id) {
      return
    }
    onViewDetails(item._id)
  }
=======
    console.log('[DisbursedLeadsTab Row] ===== DEBUGGING ID FIELDS =====');
    console.log('[DisbursedLeadsTab Row] item._id:', item._id);
    console.log('[DisbursedLeadsTab Row] item.leadId:', item.leadId);
    console.log('[DisbursedLeadsTab Row] item.lead_Id:', item.lead_Id);
    console.log('[DisbursedLeadsTab Row] item.partner_Id:', item.partner_Id);
    console.log('[DisbursedLeadsTab Row] item.disbursedId:', item.disbursedId);
    console.log('[DisbursedLeadsTab Row] item.disbursedId?._id:', item.disbursedId?._id);
    console.log('[DisbursedLeadsTab Row] item.disbursedId?.leadUserId:', item.disbursedId?.leadUserId);
    console.log('[DisbursedLeadsTab Row] item.lender?.loan_id:', item.lender?.loan_id);
    console.log('[DisbursedLeadsTab Row] ===== END DEBUG =====');
    console.log('[DisbursedLeadsTab Row] Full item:', JSON.stringify(item, null, 2));

    const leadUserId = item.lead_Id;
    console.log('[DisbursedLeadsTab Row] Using lead_Id:', leadUserId);
    onViewDetails(leadUserId);
  };
>>>>>>> 682d4167d5f343590a902178bd532752590d7e32

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

      <TouchableOpacity
        style={styles.eyeBtn}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Eye size={18} color="#4F46E5" strokeWidth={2} />
      </TouchableOpacity>
    </View>
  )
}

const CURRENT_MONTH = getCurrentMonthKey()

const capitalize = (value: string) => value.replace(/\b\w/g, (char) => char.toUpperCase())

const DisbursedLeadsTab: React.FC<Props> = ({ data, isLoading, onRefresh }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(CURRENT_MONTH)
  const [selectedLender, setSelectedLender] = useState<string>("")
  const [selectedStatus, setSelectedStatus] = useState<string>("")
  const [selectedAssociate, setSelectedAssociate] = useState<string>("")
  const [payoutModalVisible, setPayoutModalVisible] = useState(false)
<<<<<<< HEAD
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)

  const handleViewDetails = (leadId: string) => {
    setSelectedLeadId(leadId)
    setPayoutModalVisible(true)
=======
  const [selectedLeadUserId, setSelectedLeadUserId] = useState<string>("")

  const handleViewDetails = (leadUserId: string) => {
    console.log('[DisbursedLeadsTab] handleViewDetails called with leadUserId:', leadUserId);
    console.log('[DisbursedLeadsTab] leadUserId type:', typeof leadUserId);
    setSelectedLeadUserId(leadUserId)
    setPayoutModalVisible(true)
    console.log('[DisbursedLeadsTab] Modal set to visible with selectedLeadUserId:', leadUserId);
>>>>>>> 682d4167d5f343590a902178bd532752590d7e32
  }

  const handleCloseModal = () => {
    setPayoutModalVisible(false)
<<<<<<< HEAD
    setSelectedLeadId(null)
=======
    setSelectedLeadUserId("")
>>>>>>> 682d4167d5f343590a902178bd532752590d7e32
  }

  const monthOptions = useMemo(() => {
    const months = new Set<string>()
    data.forEach((item) => {
      const key = getMonthKey(item?.disbursedId?.actualDisbursedDate || item?.createdAt)
      if (key) months.add(key)
    })
    if (CURRENT_MONTH) months.add(CURRENT_MONTH)
    const sortedKeys = sortMonthKeysDesc(Array.from(months))
    const monthList = sortedKeys.map((key) => ({ value: key, label: formatMonthLabel(key) }))
    return [
      { label: "All Months", value: "" },
      ...monthList,
    ]
  }, [data])

  const lenderOptions = useMemo(() => {
    const lenders = new Set<string>()
    data.forEach((item) => {
      if (item?.lender?.name) lenders.add(item.lender.name)
    })
    return [
      { label: "All Lenders", value: "" },
      ...Array.from(lenders).sort().map((name) => ({ label: name, value: name })),
    ]
  }, [data])

  const statusOptions = useMemo(() => {
    const statuses = new Set<string>()
    data.forEach((item) => {
      if (item?.payoutStatus) statuses.add(item.payoutStatus.toLowerCase())
    })
    return [
      { label: "All Status", value: "" },
      ...Array.from(statuses)
        .sort()
        .map((status) => ({ label: capitalize(status), value: status })),
    ]
  }, [data])

  const associateOptions = useMemo(() => {
    const associates = new Set<string>()
    data.forEach((item) => {
      if (item?.associate?.name) associates.add(item.associate.name)
    })
    return [
      { label: "All Associates", value: "" },
      ...Array.from(associates)
        .sort()
        .map((name) => ({ label: name, value: name })),
    ]
  }, [data])

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const monthKey = getMonthKey(item?.disbursedId?.actualDisbursedDate || item?.createdAt)
      if (selectedMonth && monthKey !== selectedMonth) return false

      if (selectedLender && item?.lender?.name !== selectedLender) return false

      if (selectedStatus && (item?.payoutStatus || "").toLowerCase() !== selectedStatus) return false

      if (selectedAssociate && item?.associate?.name !== selectedAssociate) return false

      return true
    })
  }, [data, selectedAssociate, selectedLender, selectedMonth, selectedStatus])

  const countLabel = selectedMonth ? formatMonthLabel(selectedMonth) : "all time"

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Disbursed Leads</Text>
      <Text style={styles.subtitle}>
        {filteredData.length} disbursement{filteredData.length === 1 ? "" : "s"} ({countLabel})
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
          <Text style={styles.filterLabel}>Search Lender</Text>
          <CustomDropdown
            hideLabel
            value={selectedLender}
            onSelect={setSelectedLender}
            options={lenderOptions}
            placeholder="Search lender"
            containerStyle={styles.inlineDropdownContainer}
            dropdownStyle={styles.filterDropdown}
            textStyle={styles.filterText}
            placeholderStyle={styles.filterPlaceholder}
          />
        </View>

        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>Payout Status</Text>
          <CustomDropdown
            hideLabel
            value={selectedStatus}
            onSelect={setSelectedStatus}
            options={statusOptions}
            placeholder="All status"
            containerStyle={styles.inlineDropdownContainer}
            dropdownStyle={styles.filterDropdown}
            textStyle={styles.filterText}
            placeholderStyle={styles.filterPlaceholder}
          />
        </View>

        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>Search Associate</Text>
          <CustomDropdown
            hideLabel
            value={selectedAssociate}
            onSelect={setSelectedAssociate}
            options={associateOptions}
            placeholder="Search associate"
            containerStyle={styles.inlineDropdownContainer}
            dropdownStyle={styles.filterDropdown}
            textStyle={styles.filterText}
            placeholderStyle={styles.filterPlaceholder}
          />
        </View>
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={(it) => it._id}
        renderItem={({ item }) => <Row item={item} onViewDetails={handleViewDetails} />}
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

      <PayoutDetailsModal
        visible={payoutModalVisible}
        onClose={handleCloseModal}
        leadUserId={selectedLeadUserId}
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
  eyeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  empty: { alignItems: "center", paddingVertical: 48 },
  emptyTitle: { fontSize: 16, fontWeight: "800", color: "#374151" },
  emptySub: { fontSize: 12, color: "#6B7280", marginTop: 4 },
})

export default memo(DisbursedLeadsTab)

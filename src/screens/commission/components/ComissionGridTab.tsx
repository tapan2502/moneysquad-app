import React, { memo, useMemo, useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native"
import { DollarSign } from "lucide-react-native"

type CommissionEntry = {
  _id: string
  lenderName: string
  remark?: string
  termLoan?: number
  overdraft?: number
  [key: string]: any
}

type CommissionSheet = {
  _id: string
  sheetType: string
  entries: CommissionEntry[]
}

type CommissionPlan = {
  commissionType: string
  sheets: CommissionSheet[]
}

type Props = {
  plans: CommissionPlan[]
  isLeadSharingRole: boolean
  userCommissionType?: string | null
}

const TabButton = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} style={[styles.segmentBtn, active && styles.segmentBtnActive]}>
    <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{label}</Text>
  </TouchableOpacity>
)

// --- Helpers ---
const norm = (s?: string) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "")

const categoryOf = (sheetType?: string): "individual" | "professional" | "business" => {
  const t = norm(sheetType)
  const isIndividual = t.includes("individual") || t.includes("personal") || t.includes("pl") || t.includes("consumer")
  const isProfessional = t.includes("professional") || t.includes("selfemployedprofessional") || t.includes("sep")
  const isBusiness =
    t.includes("business") ||
    t.includes("selfemployed") ||
    t.includes("sme") ||
    t.includes("msme") ||
    t.includes("bl") ||
    t.includes("od") ||
    t.includes("currentaccount") ||
    t.includes("workingcapital")

  if (isIndividual) return "individual"
  if (isProfessional) return "professional"
  if (isBusiness) return "business"
  return "business"
}

const readRate = (entry: CommissionEntry, keys: string[]): number => {
  for (const k of keys) {
    const v = entry?.[k]
    if (typeof v === "number" && !Number.isNaN(v)) return v
    if (typeof v === "string") {
      const n = parseFloat(v)
      if (!Number.isNaN(n)) return n
    }
  }
  return 0
}

const ComissionGridTab: React.FC<Props> = ({ plans, isLeadSharingRole, userCommissionType }) => {
  // Lead sharing banner
  if (isLeadSharingRole) {
    return (
      <View style={styles.placeholderWrap}>
        <View style={styles.placeholderCard}>
          <View style={styles.iconWrap}>
            <DollarSign size={32} color="#4F46E5" />
          </View>
          <Text style={styles.placeholderTitle}>Lead Sharing Commission</Text>
          <Text style={styles.placeholderRate}>1.5% Fixed Rate</Text>

          <View style={styles.noteBox}>
            <Text style={styles.noteTitle}>Important</Text>
            <Text style={styles.noteLine}>• 1.5% fixed for all lead-sharing partners</Text>
            <Text style={styles.noteLine}>• Payouts processed monthly post disbursal</Text>
            <Text style={styles.noteLine}>• 2% TDS deducted</Text>
            <Text style={styles.noteLine}>• 18% GST additional, if applicable</Text>
          </View>
        </View>
      </View>
    )
  }

  // pick plan
  const displayPlan: CommissionPlan | undefined = useMemo(() => {
    if (!plans?.length) return undefined
    if (userCommissionType) {
      const m = plans.find((p) => p.commissionType?.toLowerCase() === userCommissionType?.toLowerCase())
      if (m) return m
    }
    return plans[0]
  }, [plans, userCommissionType])

  // group to 3 buckets
  const grouped = useMemo(() => {
    const result: Record<"individual" | "professional" | "business", CommissionEntry[]> = {
      individual: [],
      professional: [],
      business: [],
    }
    if (!displayPlan?.sheets?.length) return result
    for (const sheet of displayPlan.sheets) {
      const cat = categoryOf(sheet.sheetType)
      if (Array.isArray(sheet.entries)) result[cat] = result[cat].concat(sheet.entries)
    }
    return result
  }, [displayPlan])

  const [subTab, setSubTab] = useState<"individual" | "professional" | "business">("individual")
  const rawEntries = grouped[subTab] || []

  // normalize rows (compute tl/od) + filter rows with any value
  const rows = useMemo(
    () =>
      rawEntries
        .map((e) => ({
          ...e,
          tl: readRate(e, ["termLoan", "term_loan", "termLoanPercent", "termLoanPct", "termRate"]),
          od: readRate(e, ["overdraft", "over_draft", "odPercent", "odPct", "odRate"]),
        }))
        .filter((e) => e.tl > 0 || e.od > 0),
    [rawEntries],
  )

  if (!displayPlan) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.title}>Commission Grid</Text>
        <View style={styles.defaultCard}>
          <Text style={styles.defaultTitle}>DEFAULT RATES</Text>
          <Text style={styles.defaultText}>
            Commission rates will be displayed here once your plan is activated. Contact support for details.
          </Text>
        </View>
      </View>
    )
  }

  const renderRow = ({ item }: { item: any }) => (
    <View style={styles.row}>
      {/* Lender (truncate, 2 lines max) */}
      <View style={[styles.cell, { flex: 2 }]}>
        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.strong}>
          {item.lenderName || "-"}
        </Text>
        {!!item.remark && (
          <Text numberOfLines={1} ellipsizeMode="tail" style={styles.mutedItalic}>
            {item.remark}
          </Text>
        )}
      </View>

      {/* Term Loan */}
      <View style={[styles.cellCenter, { flex: 1 }]}>
        <Text style={styles.strong}>{item.tl > 0 ? `${item.tl}%` : "-"}</Text>
      </View>

      {/* Overdraft */}
      <View style={[styles.cellCenter, { flex: 1 }]}>
        <Text style={styles.strong}>{item.od > 0 ? `${item.od}%` : "-"}</Text>
      </View>
    </View>
  )

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={styles.title}>Commission Grid</Text>
      <Text style={styles.subtitle}>Your commission rates by customer type</Text>

      <View style={styles.planBadge}>
        <Text style={styles.planText}>{(displayPlan.commissionType || "PLAN").toUpperCase()} PLAN</Text>
      </View>

      {/* 3-category segment */}
      <View style={styles.segment}>
        <TabButton label="Individual" active={subTab === "individual"} onPress={() => setSubTab("individual")} />
        <TabButton label="Professional" active={subTab === "professional"} onPress={() => setSubTab("professional")} />
        <TabButton label="Business" active={subTab === "business"} onPress={() => setSubTab("business")} />
      </View>

      {/* Non-scrollable (no horizontal) compact table */}
      <View style={styles.tableCard}>
        <View style={styles.sheetHeaderRow}>
          <Text style={[styles.sheetHeaderText, { flex: 2, textAlign: "left" }]}>LENDER</Text>
          <Text style={[styles.sheetHeaderText, { flex: 1 }]}>TERM</Text>
          <Text style={[styles.sheetHeaderText, { flex: 1 }]}>OD</Text>
        </View>

        {rows.length === 0 ? (
          <View style={{ padding: 16 }}>
            <Text style={styles.muted}>No rates available for this category.</Text>
          </View>
        ) : (
          <FlatList
            data={rows}
            renderItem={renderRow}
            keyExtractor={(it) => it._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 8 }}
          />
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: "800", color: "#0F172A" },
  subtitle: { fontSize: 13, color: "#64748B", marginTop: 4, marginBottom: 12 },

  planBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#4F46E5",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  planText: { color: "#fff", fontSize: 12, fontWeight: "800", letterSpacing: 0.6 },

  segment: {
    flexDirection: "row",
    backgroundColor: "#EEF2FF",
    borderRadius: 12,
    padding: 4,
    gap: 6,
    marginBottom: 12,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  segmentBtnActive: {
    backgroundColor: "#4F46E5",
  },
  segmentText: { fontSize: 13, fontWeight: "700", color: "#475569" },
  segmentTextActive: { color: "#fff" },

  tableCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EEF2F7",
  },
  sheetHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#64748B",
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  sheetHeaderText: { color: "#fff", fontWeight: "800", fontSize: 11, textAlign: "center", letterSpacing: 0.5 },

  row: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  cell: { justifyContent: "center", paddingRight: 6 },
  cellCenter: { alignItems: "center", justifyContent: "center" },
  strong: { fontSize: 13, fontWeight: "700", color: "#0F172A" },
  muted: { fontSize: 11, color: "#64748B", fontWeight: "500" },
  mutedItalic: { fontSize: 11, color: "#64748B", fontWeight: "500", fontStyle: "italic" },

  // lead sharing placeholder
  placeholderWrap: { flex: 1, padding: 16, alignItems: "center", justifyContent: "center" },
  placeholderCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    maxWidth: 420,
    width: "100%",
    borderWidth: 1,
    borderColor: "#EEF2F7",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    alignItems: "center",
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  placeholderTitle: { fontSize: 22, fontWeight: "900", color: "#0F172A" },
  placeholderRate: { fontSize: 28, fontWeight: "900", color: "#4F46E5", marginVertical: 12 },
  noteBox: { width: "100%", backgroundColor: "#F8FAFC", borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0", padding: 14, marginTop: 8 },
  noteTitle: { fontSize: 14, fontWeight: "800", color: "#0F172A", marginBottom: 6 },
  noteLine: { fontSize: 12, color: "#374151", fontWeight: "600", marginBottom: 4 },

  // default
  emptyWrap: { flex: 1, padding: 16 },
  defaultCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "#EEF2F7",
    marginTop: 16,
  },
  defaultTitle: {
    alignSelf: "flex-start",
    backgroundColor: "#4F46E5",
    color: "#fff",
    fontWeight: "800",
    fontSize: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  defaultText: { marginTop: 10, fontSize: 13, color: "#64748B", fontWeight: "600", lineHeight: 20 },
})

export default memo(ComissionGridTab)

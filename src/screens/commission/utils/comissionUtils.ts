// keep file name spelled "comissionUtils.ts" to match your screenshot

export const formatCurrency = (amount: number) => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`
  return `₹${amount?.toLocaleString?.() ?? amount}`
}

export const formatDate = (dateString?: string | null) => {
  if (!dateString) return "Date N/A"
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return "Date N/A"
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

export const getStatusColor = (status?: string) => {
  switch ((status || "").toLowerCase()) {
    case "paid":
      return "#10B981"
    case "pending":
      return "#F59E0B"
    case "processing":
      return "#3B82F6"
    default:
      return "#6B7280"
  }
}

// helps us find the right sheet regardless of backend naming
export const normalizeSheetLabel = (value?: string) => {
  const v = (value || "").toLowerCase().trim()
  if (v.includes("individual") || v.includes("retail")) return "individual"
  if (v.includes("professional") || v.includes("pro")) return "professional"
  if (v.includes("business") || v.includes("sme") || v.includes("msme")) return "business"
  return v
}

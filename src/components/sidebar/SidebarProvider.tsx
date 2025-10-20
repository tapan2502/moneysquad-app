import React, { createContext, useCallback, useContext, useMemo, useState } from "react"
import Sidebar from "./Sidebar"

type SidebarContextValue = {
  openSidebar: () => void
  closeSidebar: () => void
}

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined)

type SidebarProviderProps = {
  children: React.ReactNode
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({ children }) => {
  const [visible, setVisible] = useState(false)

  const openSidebar = useCallback(() => setVisible(true), [])
  const closeSidebar = useCallback(() => setVisible(false), [])

  const value = useMemo(
    () => ({
      openSidebar,
      closeSidebar,
    }),
    [openSidebar, closeSidebar],
  )

  return (
    <SidebarContext.Provider value={value}>
      {children}
      <Sidebar visible={visible} onClose={closeSidebar} />
    </SidebarContext.Provider>
  )
}

export const useSidebar = () => {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}


import type React from "react"
import { View, TouchableOpacity, StyleSheet, StatusBar, Image } from "react-native"
import { Menu, Search } from "lucide-react-native"

interface DashboardHeaderProps {
  onSidebarPress: () => void
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onSidebarPress }) => {
  const handleSearchPress = () => {
    // TODO: Implement search functionality
    console.log("Search pressed")
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />

      <View style={styles.content}>
        <TouchableOpacity style={styles.sidebarButton} onPress={onSidebarPress} activeOpacity={0.7}>
          <Menu size={20} color="#374151" strokeWidth={2} />
        </TouchableOpacity>

        <View style={styles.logoContainer}>
          <Image
            source={require("../../../../assets/images/splash-logo.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        <TouchableOpacity style={styles.searchButton} onPress={handleSearchPress} activeOpacity={0.7}>
          <Search size={20} color="#374151" strokeWidth={2} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F8F9FA", // Changed to smoky white
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 2,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF", // Updated border color to match smoky white theme
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 44,
  },
  sidebarButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  logoContainer: {
    width: 40, // Increased size for logo image
    height: 40,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#00B9AE",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  logoImage: {
    width: 28,
    height: 28,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
})

export default DashboardHeader

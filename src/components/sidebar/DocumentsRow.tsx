import React from "react";
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Maximize2 } from "lucide-react-native";

type ItemProps = {
  label: string;
  uri?: string;
  onPress?: (uri: string, label: string) => void;
};

const Item = ({ label, uri, onPress }: ItemProps) => {
  const handlePress = () => {
    if (uri && onPress) {
      onPress(uri, label);
    }
  };

  return (
    <View style={styles.item}>
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.thumbWrap}
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={`View ${label}`}
        disabled={!uri}
      >
        {uri ? (
          <>
            <Image source={{ uri }} style={styles.thumb} resizeMode="cover" />
            <View style={styles.thumbOverlay}>
              <Maximize2 size={16} color="#FFFFFF" />
              <Text style={styles.thumbOverlayText}>View</Text>
            </View>
          </>
        ) : (
          <View style={[styles.thumb, { backgroundColor: "#F3F4F6" }]} />
        )}
      </TouchableOpacity>
      <Text numberOfLines={1} style={styles.itemLabel}>
        {label}
      </Text>
    </View>
  );
};

const DocumentsRow = ({ documents, onImagePress }: { documents: any; onImagePress?: (uri: string, label: string) => void }) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
    <Item label="Profile Photo" uri={documents?.profilePhoto} onPress={onImagePress} />
    <Item label="PAN" uri={documents?.panCard} onPress={onImagePress} />
    <Item label="Aadhar (Front)" uri={documents?.aadharFront} onPress={onImagePress} />
    <Item label="Aadhar (Back)" uri={documents?.aadharBack} onPress={onImagePress} />
    <Item label="Cancelled Cheque" uri={documents?.cancelledCheque} onPress={onImagePress} />
    <Item label="GST Certificate" uri={documents?.gstCertificate} onPress={onImagePress} />
  </ScrollView>
);

const styles = StyleSheet.create({
  row: { gap: 12, paddingVertical: 10 },
  item: { width: 108 },
  thumbWrap: {
    width: 108,
    height: 76,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  thumb: { width: "100%", height: "100%" },
  thumbOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
  },
  thumbOverlayText: { color: "#F8FAFC", fontSize: 11, fontWeight: "700" },
  itemLabel: { marginTop: 6, fontSize: 11, color: "#6B7280", fontWeight: "600" },
});

export default DocumentsRow;

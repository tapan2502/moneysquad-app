import React from "react";
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from "react-native";

const Item = ({ label, uri }: { label: string; uri?: string }) => (
  <View style={styles.item}>
    <TouchableOpacity activeOpacity={0.9} style={styles.thumbWrap}>
      {uri ? <Image source={{ uri }} style={styles.thumb} resizeMode="cover" /> : <View style={[styles.thumb, { backgroundColor: "#F3F4F6" }]} />}
    </TouchableOpacity>
    <Text numberOfLines={1} style={styles.itemLabel}>{label}</Text>
  </View>
);

const DocumentsRow = ({ documents }: { documents: any }) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
    <Item label="Profile Photo" uri={documents?.profilePhoto} />
    <Item label="PAN" uri={documents?.panCard} />
    <Item label="Aadhar (Front)" uri={documents?.aadharFront} />
    <Item label="Aadhar (Back)" uri={documents?.aadharBack} />
    <Item label="Cancelled Cheque" uri={documents?.cancelledCheque} />
    <Item label="GST Certificate" uri={documents?.gstCertificate} />
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
  itemLabel: { marginTop: 6, fontSize: 11, color: "#6B7280", fontWeight: "600" },
});

export default DocumentsRow;

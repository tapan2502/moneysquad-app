import React from 'react';
import { View } from 'react-native';
import { useSidebar } from '@/src/components/sidebar/SidebarProvider';
import { useFocusEffect } from 'expo-router';

export default function MenuTab() {
  const { openSidebar } = useSidebar();

  useFocusEffect(
    React.useCallback(() => {
      openSidebar();
    }, [openSidebar])
  );

  return <View style={{ flex: 1, backgroundColor: '#FAFBFC' }} />;
}

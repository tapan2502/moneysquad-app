import React from 'react';
import { View } from 'react-native';
import { useSidebar } from '@/src/components/sidebar/SidebarProvider';
import { useRouter, useFocusEffect } from 'expo-router';

export default function MenuTab() {
  const { openSidebar } = useSidebar();
  const router = useRouter();

  useFocusEffect(
    React.useCallback(() => {
      openSidebar();
      setTimeout(() => {
        router.replace('/(tabs)' as any);
      }, 100);
    }, [openSidebar, router])
  );

  return <View style={{ flex: 1, backgroundColor: '#FAFBFC' }} />;
}

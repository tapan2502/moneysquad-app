// src/screens/leads/tabs/LeadRemarksTab.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { MessageCircle, Send } from 'lucide-react-native';

const safeLower = (v: unknown) => (typeof v === 'string' ? v : '').toLowerCase();

const getRoleColor = (role?: string) => {
  switch (safeLower(role)) {
    case 'partner':   return '#3B82F6';
    case 'manager':   return '#F59E0B';
    case 'admin':     return '#EF4444';
    case 'associate': return '#10B981';
    default:          return '#6B7280';
  }
};

const formatDate = (d?: string) => {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

type RemarkMessage = {
  text: string;
  timestamp?: string;
};

type RemarkUser = {
  _id: string;
  name?: string;
  role?: string;
  messages?: RemarkMessage[];
};

type RemarksData = {
  remarkMessage?: RemarkUser[];
};

type Props = {
  leadId?: string;
  remarksData?: RemarksData | null;
  isRemarksLoading: boolean;
  remarkMessage: string;
  setRemarkMessage: (v: string) => void;
  onSendRemark: () => void;
};

const LeadRemarksTab: React.FC<Props> = ({
  remarksData, isRemarksLoading, remarkMessage, setRemarkMessage, onSendRemark
}) => {
  return (
    <KeyboardAvoidingView style={styles.wrap} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {isRemarksLoading ? (
          <View style={styles.loadingContainer}><Text style={styles.loadingText}>Loading remarks…</Text></View>
        ) : (remarksData?.remarkMessage?.length ? (
          <View style={{ paddingBottom: 16 }}>
            {remarksData.remarkMessage.map((u) => (
              <View key={u._id} style={styles.userRemarks}>
                <View style={styles.userRow}>
                  <View style={[styles.avatar, { backgroundColor: getRoleColor(u.role) }]}>
                    <Text style={styles.avatarText}>{(u.name || '?').charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.userName}>{u.name || '—'}</Text>
                    <View style={[styles.rolePill, { backgroundColor: `${getRoleColor(u.role)}14` }]}>
                      <Text style={[styles.rolePillText, { color: getRoleColor(u.role) }]}>
                        {(u.role || 'USER').toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>

                {(u.messages || []).map((m, idx) => (
                  <View key={idx} style={styles.remarkCard}>
                    <Text style={styles.remarkText}>{m.text}</Text>
                    <Text style={styles.remarkTime}>{formatDate(m.timestamp)}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <MessageCircle size={44} color="#CBD5E1" strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>No remarks yet</Text>
            <Text style={styles.emptySub}>Be the first to add one</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Add a remark…"
          value={remarkMessage}
          onChangeText={setRemarkMessage}
          multiline
          maxLength={500}
          placeholderTextColor="#94A3B8"
        />
        <TouchableOpacity
          style={[styles.sendBtn, { opacity: remarkMessage.trim() ? 1 : 0.5 }]}
          onPress={onSendRemark}
          disabled={!remarkMessage.trim() || isRemarksLoading}
          activeOpacity={0.85}
        >
          <Send size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  scroll: { flex: 1, padding: 16 },

  // list of grouped remarks
  userRemarks: { marginBottom: 16 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },

  avatar: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 16, fontWeight: '900', color: '#fff' },
  userName: { fontSize: 14, fontWeight: '900', color: '#0F172A', marginBottom: 2 },
  rolePill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  rolePillText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.4 },

  remarkCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 10,
    borderWidth: 1, borderColor: '#E5E7EB'
  },
  remarkText: { fontSize: 13, color: '#374151', fontWeight: '600', lineHeight: 20, marginBottom: 6 },
  remarkTime: { fontSize: 11, color: '#6B7280', fontWeight: '700' },

  inputBar: {
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F1F5F9',
    padding: 14, flexDirection: 'row', alignItems: 'flex-end', gap: 10
  },
  input: {
    flex: 1, backgroundColor: '#F8FAFC', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#0F172A',
    fontWeight: '600', maxHeight: 100, borderWidth: 1, borderColor: '#E2E8F0'
  },
  sendBtn: {
    backgroundColor: '#4F46E5', borderRadius: 12, padding: 10,
    justifyContent: 'center', alignItems: 'center'
  },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { fontSize: 14, color: '#64748B', fontWeight: '700' },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '900', color: '#374151' },
  emptySub: { fontSize: 13, color: '#6B7280' },
});

export default LeadRemarksTab;

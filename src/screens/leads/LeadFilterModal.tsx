import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import CustomDatePicker from '../../components/CustomDatePicker';

export interface FilterState {
  status: string[];
  loanType: string[];
  lender: string[];
  manager: string[];
  associate: string[];
  dateFrom: string;
  dateTo: string;
}

type FilterOptions = {
  statuses: string[];
  loanTypes: string[];
  lenders: string[];
  managers: string[];
  associates: string[];
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onApply: () => void;
  onClear: () => void;
  filters: FilterState;
  toggleFilter: (category: keyof FilterState, value: string) => void;
  options: FilterOptions;
  getStatusColor: (status?: string) => string;

  // NEW: wire date inputs to parent state
  setDateFrom: (date: string) => void;
  setDateTo: (date: string) => void;
};

const LeadFilterModal: React.FC<Props> = ({
  visible, onClose, onApply, onClear, filters, toggleFilter, options, getStatusColor,
  setDateFrom, setDateTo,
}) => {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>Filters</Text>
            <TouchableOpacity onPress={onClose} style={styles.close}>
              <Feather name="x" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* STATUS */}
            {options.statuses.length > 0 && (
              <Section title="STATUS">
                <ChipGrid>
                  {options.statuses.map((s) => {
                    const active = filters.status.includes(s);
                    const clr = getStatusColor(s);
                    return (
                      <Chip
                        key={s}
                        active={active}
                        onPress={() => toggleFilter('status', s)}
                        style={{ borderColor: clr, backgroundColor: active ? `${clr}1A` : undefined }}
                        textStyle={{ color: active ? clr : '#475569', fontWeight: active ? '800' as any : '600' }}
                      >
                        {s}
                      </Chip>
                    );
                  })}
                </ChipGrid>
              </Section>
            )}

            {/* LOAN TYPE */}
            {options.loanTypes.length > 0 && (
              <Section title="LOAN TYPE">
                <ChipGrid>
                  {options.loanTypes.map((t) => {
                    const active = filters.loanType.includes(t);
                    return (
                      <Chip key={t} active={active} onPress={() => toggleFilter('loanType', t)}>
                        {t.replace(/_/g, ' ')}
                      </Chip>
                    );
                  })}
                </ChipGrid>
              </Section>
            )}

            {/* LENDER */}
            {options.lenders.length > 0 && (
              <Section title="LENDER">
                <ChipGrid>
                  {options.lenders.map((l) => {
                    const active = filters.lender.includes(l);
                    return (
                      <Chip key={l} active={active} onPress={() => toggleFilter('lender', l)}>
                        {l}
                      </Chip>
                    );
                  })}
                </ChipGrid>
              </Section>
            )}

            {/* MANAGER */}
            {options.managers.length > 0 && (
              <Section title="MANAGER">
                <ChipGrid>
                  {options.managers.map((m) => {
                    const active = filters.manager.includes(m);
                    return (
                      <Chip key={m} active={active} onPress={() => toggleFilter('manager', m)}>
                        {m}
                      </Chip>
                    );
                  })}
                </ChipGrid>
              </Section>
            )}

            {/* ASSOCIATE */}
            {options.associates.length > 0 && (
              <Section title="ASSOCIATE">
                <ChipGrid>
                  {options.associates.map((a) => {
                    const active = filters.associate.includes(a);
                    return (
                      <Chip key={a} active={active} onPress={() => toggleFilter('associate', a)}>
                        {a}
                      </Chip>
                    );
                  })}
                </ChipGrid>
              </Section>
            )}

            {/* DATE RANGE */}
            <Section title="DATE RANGE">
              <View style={s.dateRow}>
                <View style={s.dateFieldWrap}>
                  <Text style={s.dateLabel}>FROM</Text>
                  <CustomDatePicker
                    hideLabel
                    value={filters.dateFrom}
                    onDateChange={setDateFrom}
                    placeholder="Select date"
                    clearable
                    containerStyle={s.datePickerContainer}
                  />
                </View>

                <View style={s.dateFieldWrap}>
                  <Text style={s.dateLabel}>TO</Text>
                  <CustomDatePicker
                    hideLabel
                    value={filters.dateTo}
                    onDateChange={setDateTo}
                    placeholder="Select date"
                    clearable
                    containerStyle={s.datePickerContainer}
                  />
                </View>
              </View>

              <Text style={s.dateHint}>
                Tip: You can fill just one side — only “From” or only “To”. Filters apply accordingly.
              </Text>
            </Section>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.reset} onPress={onClear}>
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.apply} onPress={onApply}>
              <Text style={styles.applyText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

/* --- small internal UI bits --- */
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <View style={s.section}>
    <Text style={s.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const ChipGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={s.grid}>{children}</View>
);

const Chip: React.FC<{
  active?: boolean; onPress?: () => void; children: React.ReactNode;
  style?: any; textStyle?: any;
}> = ({ active, onPress, style, textStyle, children }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[s.chip, active && s.chipActive, style]}
    activeOpacity={0.8}
  >
    <Text style={[s.chipText, active && s.chipTextActive, textStyle]} numberOfLines={1}>
      {children}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(2,6,23,0.55)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '86%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    backgroundColor: '#E2E8F0',
    borderRadius: 999,
    marginTop: 8,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingTop: 12, paddingBottom: 8 },
  title: { fontSize: 18, fontWeight: '900', color: '#0F172A', letterSpacing: -0.2 },
  close: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center' },
  body: { paddingHorizontal: 18, paddingBottom: 4 },
  footer: { flexDirection: 'row', gap: 10, paddingHorizontal: 18, paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#E2E8F0', backgroundColor: '#FAFBFC' },
  reset: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', borderWidth: 1.25, borderColor: '#E2E8F0' },
  resetText: { fontSize: 15, fontWeight: '800', color: '#64748B' },
  apply: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#4F46E5', alignItems: 'center', justifyContent: 'center', elevation: 6 },
  applyText: { fontSize: 15, fontWeight: '900', color: '#FFFFFF' },
});

/* sub-styles (compact chips + date fields) */
const s = StyleSheet.create({
  section: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  sectionTitle: { fontSize: 11, fontWeight: '900', color: '#64748B', marginBottom: 10, letterSpacing: 0.8 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  // Compact, sleek chip (smaller padding, font, radius, lighter border)
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.25,
    borderColor: '#E2E8F0',
    maxWidth: '100%',
  },
  chipActive: { backgroundColor: '#EEF2FF', borderColor: '#4F46E5' },
  chipText: { fontSize: 12.5, fontWeight: '600', color: '#475569' },
  chipTextActive: { color: '#4F46E5', fontWeight: '800' },

  // Date range
  dateRow: { flexDirection: 'row', gap: 10 },
  dateFieldWrap: { flex: 1 },
  dateLabel: { fontSize: 10, fontWeight: '900', color: '#7C8698', letterSpacing: 0.6, marginBottom: 6 },
  datePickerContainer: { marginBottom: 0 },
  dateHint: { marginTop: 8, fontSize: 11, color: '#94A3B8', fontWeight: '600' },
});

export default LeadFilterModal;

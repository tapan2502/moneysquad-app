import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { ChevronDown, Filter, X } from 'lucide-react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../redux/store';
import { 
  fetchLoanTypes, 
  fetchAssociates,
  setSelectedLoanType,
  setSelectedAssociate,
  setSelectedMonth
} from '../../../redux/slices/filterSlice';

const FilterSection: React.FC = () => {
  const dispatch = useDispatch();
  const { 
    loanTypes, 
    associates, 
    selectedLoanType, 
    selectedAssociate, 
    selectedMonth,
    isLoading 
  } = useSelector((state: RootState) => state.filter);

  const [activeModal, setActiveModal] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchLoanTypes() as any);
    dispatch(fetchAssociates() as any);
  }, [dispatch]);

  // Generate month and year options
  const generatePeriodOptions = () => {
    const options = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    // Add current month first
    options.push({
      id: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`,
      label: `${months[currentMonth]} ${currentYear}`
    });
    
    // Add previous 11 months
    for (let i = 1; i <= 11; i++) {
      const date = new Date(currentYear, currentMonth - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth();
      
      options.push({
        id: `${year}-${String(month + 1).padStart(2, '0')}`,
        label: `${months[month]} ${year}`
      });
    }
    
    return options;
  };
  
  const periodOptions = generatePeriodOptions();

  const getLoanTypeLabel = (id: string) => {
    if (id === 'all') return 'All Types';
    const loanType = loanTypes.find(lt => lt._id === id);
    return loanType ? loanType.name.replace(/_/g, ' ') : 'All Types';
  };

  const getAssociateLabel = (id: string) => {
    if (id === 'all') return 'All Associates';
    const associate = associates.find(a => a._id === id);
    return associate ? associate.name : 'All Associates';
  };

  const getMonthLabel = (id: string) => {
    const period = periodOptions.find(p => p.id === id);
    return period ? period.label : periodOptions[0].label;
  };

  const handleFilterSelect = (type: string, value: string) => {
    switch (type) {
      case 'loanType':
        dispatch(setSelectedLoanType(value));
        break;
      case 'associate':
        dispatch(setSelectedAssociate(value));
        break;
      case 'month':
        dispatch(setSelectedMonth(value));
        break;
    }
    setActiveModal(null);
  };

  const FilterModal = ({ 
    title, 
    options, 
    selectedValue, 
    onSelect, 
    keyExtractor, 
    labelExtractor 
  }: any) => (
    <Modal
      visible={activeModal === title.toLowerCase()}
      transparent
      animationType="fade"
      onRequestClose={() => setActiveModal(null)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setActiveModal(null)}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={() => setActiveModal(null)}>
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={options}
            keyExtractor={keyExtractor}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.modalOption,
                  selectedValue === keyExtractor(item) && styles.modalOptionSelected
                ]}
                onPress={() => onSelect(keyExtractor(item))}
              >
                <Text style={[
                  styles.modalOptionText,
                  selectedValue === keyExtractor(item) && styles.modalOptionTextSelected
                ]}>
                  {labelExtractor(item)}
                </Text>
              </TouchableOpacity>
            )}
            style={styles.modalList}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Filter size={14} color="#4F46E5" strokeWidth={2.5} />
          <Text style={styles.title}>Filters</Text>
        </View>
      </View>
      
      <View style={styles.filtersRow}>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setActiveModal('loan type')}
          activeOpacity={0.8}
        >
          <Text style={styles.filterLabel}>Loan Type</Text>
          <Text style={styles.filterValue} numberOfLines={1}>
            {getLoanTypeLabel(selectedLoanType)}
          </Text>
          <ChevronDown size={12} color="#64748B" strokeWidth={2} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setActiveModal('associate')}
          activeOpacity={0.8}
        >
          <Text style={styles.filterLabel}>Associate</Text>
          <Text style={styles.filterValue} numberOfLines={1}>
            {getAssociateLabel(selectedAssociate)}
          </Text>
          <ChevronDown size={12} color="#64748B" strokeWidth={2} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setActiveModal('period')}
          activeOpacity={0.8}
        >
          <Text style={styles.filterLabel}>Period</Text>
          <Text style={styles.filterValue} numberOfLines={1}>
            {getMonthLabel(selectedMonth)}
          </Text>
          <ChevronDown size={12} color="#64748B" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Loan Type Modal */}
      <FilterModal
        title="Loan Type"
        options={[{ _id: 'all', name: 'All Types' }, ...loanTypes]}
        selectedValue={selectedLoanType}
        onSelect={(value: string) => handleFilterSelect('loanType', value)}
        keyExtractor={(item: any) => item._id}
        labelExtractor={(item: any) => item.name.replace(/_/g, ' ')}
      />

      {/* Associate Modal */}
      <FilterModal
        title="Associate"
        options={[{ _id: 'all', name: 'All Associates' }, ...associates]}
        selectedValue={selectedAssociate}
        onSelect={(value: string) => handleFilterSelect('associate', value)}
        keyExtractor={(item: any) => item._id}
        labelExtractor={(item: any) => item.name}
      />

      {/* Period Modal */}
      <FilterModal
        title="Period"
        options={periodOptions}
        selectedValue={selectedMonth}
        onSelect={(value: string) => handleFilterSelect('month', value)}
        keyExtractor={(item: any) => item.id}
        labelExtractor={(item: any) => item.label}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  header: {
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    letterSpacing: -0.1,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 6,
  },
  filterButton: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    gap: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 42,
    justifyContent: 'center',
  },
  filterLabel: {
    fontSize: 9,
    color: '#4F46E5',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  filterValue: {
    fontSize: 10,
    color: '#0F172A',
    fontWeight: '500',
    textAlign: 'center',
    maxWidth: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  modalList: {
    maxHeight: 300,
  },
  modalOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalOptionSelected: {
    backgroundColor: '#EEF2FF',
  },
  modalOptionText: {
    fontSize: 14,
    color: '#374151',
  },
  modalOptionTextSelected: {
    color: '#4F46E5',
    fontWeight: '600',
  },
});

export default FilterSection;
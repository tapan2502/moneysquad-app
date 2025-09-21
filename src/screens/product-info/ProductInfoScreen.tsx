import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { fetchProductInfo, clearError } from '../../redux/slices/resourceAndSupportSlice';
import { BookOpen, CreditCard, FileText, Users, CircleCheck as CheckCircle, DollarSign, Calendar, Percent } from 'lucide-react-native';
import { Snackbar } from 'react-native-paper';

const ProductInfoScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { productInfo, productInfoLoading, error } = useSelector(
    (state: RootState) => state.resourceAndSupport
  );

  const [activeTab, setActiveTab] = useState<'guides' | 'eligibility' | 'documents'>('guides');

  useEffect(() => {
    dispatch(fetchProductInfo() as any);
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchProductInfo() as any);
  };

  const handleDismissError = () => {
    dispatch(clearError());
  };

  const getLoanTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'PL - Term Loan': '#3B82F6',
      'PL - Overdraft': '#6366F1',
      'BL - Term Loan': '#10B981',
      'BL - Overdraft': '#F59E0B',
      'SEP - Term Loan': '#8B5CF6',
      'SEP - Overdraft': '#EF4444',
    };
    return colors[type] || '#6B7280';
  };

  const getLoanTypeBackground = (type: string) => {
    const color = getLoanTypeColor(type);
    return `${color}15`;
  };

  const renderGuidesTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.tabTitle}>Loan Product Guides</Text>
      <Text style={styles.tabSubtitle}>Interest rates, fees, and loan terms for all products</Text>
      
      <View style={styles.guidesGrid}>
        {productInfo?.guides.map((guide, index) => (
          <View key={guide._id || index} style={styles.guideCard}>
            <View style={[styles.guideHeader, { backgroundColor: getLoanTypeBackground(guide.type) }]}>
              <CreditCard size={20} color={getLoanTypeColor(guide.type)} strokeWidth={2} />
              <Text style={[styles.guideType, { color: getLoanTypeColor(guide.type) }]}>
                {guide.type}
              </Text>
            </View>
            
            <View style={styles.guideContent}>
              <View style={styles.guideRow}>
                <View style={styles.guideItem}>
                  <Percent size={14} color="#6B7280" strokeWidth={2} />
                  <Text style={styles.guideLabel}>Interest Rate</Text>
                  <Text style={styles.guideValue}>{guide.interestRate}</Text>
                </View>
                
                <View style={styles.guideItem}>
                  <DollarSign size={14} color="#6B7280" strokeWidth={2} />
                  <Text style={styles.guideLabel}>Processing Fee</Text>
                  <Text style={styles.guideValue}>{guide.processingFees}</Text>
                </View>
              </View>
              
              <View style={styles.guideRow}>
                <View style={styles.guideItem}>
                  <DollarSign size={14} color="#6B7280" strokeWidth={2} />
                  <Text style={styles.guideLabel}>Loan Amount</Text>
                  <Text style={styles.guideValue}>{guide.loanAmount}</Text>
                </View>
                
                <View style={styles.guideItem}>
                  <Calendar size={14} color="#6B7280" strokeWidth={2} />
                  <Text style={styles.guideLabel}>Tenure</Text>
                  <Text style={styles.guideValue}>{guide.tenure}</Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderEligibilityTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.tabTitle}>Eligibility Criteria</Text>
      <Text style={styles.tabSubtitle}>Requirements and calculation methods for loan approval</Text>
      
      {/* Eligibility Criteria */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Criteria Requirements</Text>
        {Object.entries(productInfo?.policies.eligibilityCriteria || {}).map(([type, criteria]) => (
          <View key={type} style={styles.eligibilityCard}>
            <View style={[styles.eligibilityHeader, { backgroundColor: getLoanTypeBackground(type) }]}>
              <CheckCircle size={16} color={getLoanTypeColor(type)} strokeWidth={2} />
              <Text style={[styles.eligibilityType, { color: getLoanTypeColor(type) }]}>
                {type}
              </Text>
            </View>
            <View style={styles.criteriaList}>
              {criteria.map((criterion, index) => (
                <View key={index} style={styles.criterionItem}>
                  <View style={styles.criterionDot} />
                  <Text style={styles.criterionText}>{criterion}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>

      {/* Calculation Methods */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Calculation Methods</Text>
        {Object.entries(productInfo?.policies.eligibilityCalculation || {}).map(([type, calculations]) => (
          <View key={type} style={styles.calculationCard}>
            <View style={[styles.calculationHeader, { backgroundColor: getLoanTypeBackground(type) }]}>
              <Text style={[styles.calculationType, { color: getLoanTypeColor(type) }]}>
                {type}
              </Text>
            </View>
            <View style={styles.calculationList}>
              {calculations.map((calculation, index) => (
                <View key={index} style={styles.calculationItem}>
                  <Text style={styles.calculationText}>{calculation}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderDocumentsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.tabTitle}>Required Documents</Text>
      <Text style={styles.tabSubtitle}>Document requirements for different loan categories</Text>
      
      {Object.entries(productInfo?.documents || {}).map(([category, docData]) => (
        <View key={category} style={styles.documentCategory}>
          <View style={styles.categoryHeader}>
            <FileText size={18} color="#4F46E5" strokeWidth={2} />
            <Text style={styles.categoryTitle}>{category}</Text>
          </View>
          
          {Object.entries(docData.subcategories).map(([subcategory, documents]) => (
            <View key={subcategory} style={styles.subcategoryCard}>
              <Text style={styles.subcategoryTitle}>{subcategory}</Text>
              <View style={styles.documentsList}>
                {documents.map((document, index) => (
                  <View key={index} style={styles.documentItem}>
                    <View style={styles.documentDot} />
                    <Text style={styles.documentText}>{document}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );

  if (productInfoLoading && !productInfo) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading product information...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <BookOpen size={24} color="#4F46E5" strokeWidth={2} />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Product Info</Text>
            <Text style={styles.headerSubtitle}>Loan guides and requirements</Text>
          </View>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'guides' && styles.activeTabButton]}
          onPress={() => setActiveTab('guides')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'guides' && styles.activeTabButtonText]}>
            Guides
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'eligibility' && styles.activeTabButton]}
          onPress={() => setActiveTab('eligibility')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'eligibility' && styles.activeTabButtonText]}>
            Eligibility
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'documents' && styles.activeTabButton]}
          onPress={() => setActiveTab('documents')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'documents' && styles.activeTabButtonText]}>
            Documents
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View style={styles.tabContainer}>
        {activeTab === 'guides' && renderGuidesTab()}
        {activeTab === 'eligibility' && renderEligibilityTab()}
        {activeTab === 'documents' && renderDocumentsTab()}
      </View>

      {/* Error Snackbar */}
      <Snackbar
        visible={!!error}
        onDismiss={handleDismissError}
        action={{
          label: 'Dismiss',
          onPress: handleDismissError,
        }}
      >
        {error}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  tabNavigation: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: '#4F46E5',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabButtonText: {
    color: '#4F46E5',
  },
  tabContainer: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  tabTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  tabSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 24,
  },
  
  // Guides Tab Styles
  guidesGrid: {
    gap: 16,
  },
  guideCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
  },
  guideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  guideType: {
    fontSize: 16,
    fontWeight: '700',
  },
  guideContent: {
    padding: 16,
    paddingTop: 0,
  },
  guideRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  guideItem: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  guideLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    textAlign: 'center',
  },
  guideValue: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
    textAlign: 'center',
  },

  // Eligibility Tab Styles
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  eligibilityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
  },
  eligibilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  eligibilityType: {
    fontSize: 16,
    fontWeight: '700',
  },
  criteriaList: {
    padding: 16,
    paddingTop: 0,
  },
  criterionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  criterionDot: {
    width: 6,
    height: 6,
    backgroundColor: '#4F46E5',
    borderRadius: 3,
  },
  criterionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
  },
  calculationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
  },
  calculationHeader: {
    padding: 16,
  },
  calculationType: {
    fontSize: 16,
    fontWeight: '700',
  },
  calculationList: {
    padding: 16,
    paddingTop: 0,
  },
  calculationItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  calculationText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
    lineHeight: 18,
  },

  // Documents Tab Styles
  documentCategory: {
    marginBottom: 32,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  subcategoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  subcategoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4F46E5',
    marginBottom: 12,
  },
  documentsList: {
    gap: 8,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  documentDot: {
    width: 6,
    height: 6,
    backgroundColor: '#10B981',
    borderRadius: 3,
    marginTop: 6,
  },
  documentText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
    lineHeight: 18,
  },
});

export default ProductInfoScreen;
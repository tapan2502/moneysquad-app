import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { X as XIcon } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/src/redux/store';
import { fetchPayoutDetails, clearPayoutDetails } from '@/src/redux/slices/commissionSlice';
import { formatCurrency } from '../utils/comissionUtils';

type Props = {
  visible: boolean;
  onClose: () => void;
  leadUserId: string;
};

const PayoutDetailsModal: React.FC<Props> = ({ visible, onClose, leadUserId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { payoutDetails, isPayoutDetailsLoading, payoutDetailsError } = useSelector(
    (state: RootState) => state.commission
  );

  useEffect(() => {
    if (visible && leadUserId) {
      console.log('[PayoutDetailsModal] Fetching payout details for leadUserId:', leadUserId);
      dispatch(fetchPayoutDetails(leadUserId));
    }
    return () => {
      console.log('[PayoutDetailsModal] Cleaning up payout details');
      dispatch(clearPayoutDetails());
    };
  }, [visible, leadUserId, dispatch]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Payout Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <XIcon size={22} color="#64748B" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          {isPayoutDetailsLoading ? (
            <View style={styles.modalLoading}>
              <ActivityIndicator size="large" color="#4F46E5" />
              <Text style={styles.loadingText}>Loading payout details...</Text>
            </View>
          ) : payoutDetailsError ? (
            <View style={styles.modalError}>
              <Text style={styles.errorText}>{payoutDetailsError}</Text>
            </View>
          ) : payoutDetails ? (
            <View style={styles.modalContent}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Lead ID</Text>
                <Text style={styles.detailValue}>{payoutDetails.leadId}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Disbursed Amount</Text>
                <Text style={styles.detailValue}>{formatCurrency(payoutDetails.disbursedAmount)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Commission</Text>
                <Text style={styles.detailValue}>{payoutDetails.commission}%</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Gross Payout</Text>
                <Text style={[styles.detailValue, { color: '#10B981', fontWeight: '900' }]}>
                  {formatCurrency(payoutDetails.grossPayout)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>TDS</Text>
                <Text style={[styles.detailValue, { color: '#EF4444' }]}>
                  {formatCurrency(payoutDetails.tds)}
                </Text>
              </View>
              <View style={[styles.detailRow, styles.highlightRow]}>
                <Text style={styles.detailLabelHighlight}>Net Payout</Text>
                <Text style={styles.detailValueHighlight}>
                  {formatCurrency(payoutDetails.netPayout)}
                </Text>
              </View>
              {payoutDetails.remark && (
                <View style={styles.remarkBlock}>
                  <Text style={styles.remarkLabel}>Remark</Text>
                  <Text style={styles.remarkText}>{payoutDetails.remark}</Text>
                </View>
              )}
              {payoutDetails.commissionRemark && (
                <View style={styles.remarkBlock}>
                  <Text style={styles.remarkLabel}>Commission Remark</Text>
                  <Text style={styles.remarkText}>{payoutDetails.commissionRemark}</Text>
                </View>
              )}
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalLoading: {
    padding: 40,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  modalError: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
    textAlign: 'center',
  },
  modalContent: {
    padding: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  highlightRow: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    borderRadius: 12,
    marginTop: 8,
    borderBottomWidth: 0,
  },
  detailLabelHighlight: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },
  detailValueHighlight: {
    fontSize: 18,
    fontWeight: '900',
    color: '#10B981',
  },
  remarkBlock: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#4F46E5',
  },
  remarkLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#64748B',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  remarkText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 20,
  },
});

export default PayoutDetailsModal;

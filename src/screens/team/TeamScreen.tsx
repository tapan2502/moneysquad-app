import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl, 
  TextInput,
  Alert,
  Image
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '../../redux/store';
import { 
  fetchAssociates, 
  deleteAssociate, 
  clearAssociateState,
  Associate 
} from '../../redux/slices/associateSlice';
import { Search, Plus, CreditCard as Edit3, Trash2, Users, MapPin, Phone, Mail } from 'lucide-react-native';
import { Snackbar } from 'react-native-paper';

const TeamScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const { associates, loading, error, success } = useSelector(
    (state: RootState) => state.associate
  );
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAssociates, setFilteredAssociates] = useState<Associate[]>([]);

  useEffect(() => {
    dispatch(fetchAssociates() as any);
  }, [dispatch]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredAssociates(associates);
    } else {
      const filtered = associates.filter(associate =>
        `${associate.firstName} ${associate.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        associate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        associate.mobile.includes(searchQuery) ||
        associate.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredAssociates(filtered);
    }
  }, [associates, searchQuery]);

  const handleRefresh = () => {
    dispatch(fetchAssociates() as any);
  };

  const handleCreateAssociate = () => {
    navigation.navigate('CreateAssociate');
  };

  const handleEditAssociate = (associate: Associate) => {
    navigation.navigate('EditAssociate', { associateId: associate._id });
  };

  const handleDeleteAssociate = (associate: Associate) => {
    Alert.alert(
      'Delete Associate',
      `Are you sure you want to delete ${associate.firstName} ${associate.lastName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => dispatch(deleteAssociate(associate._id) as any),
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return '#10B981';
      case 'inactive':
        return '#EF4444';
      case 'pending':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const getStatusBackground = (status: string) => {
    const color = getStatusColor(status);
    return `${color}15`;
  };

  const renderAssociateItem = ({ item }: { item: Associate }) => (
    <View style={styles.associateCard}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.associateInfo}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {item.firstName.charAt(0)}{item.lastName.charAt(0)}
            </Text>
          </View>
          <View style={styles.nameContainer}>
            <Text style={styles.associateName}>
              {item.firstName} {item.lastName}
            </Text>
            <Text style={styles.associateId}>ID: {item.associateDisplayId}</Text>
          </View>
        </View>
        
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusBackground(item.status) }
        ]}>
          <Text style={[
            styles.statusText,
            { color: getStatusColor(item.status) }
          ]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Contact Details */}
      <View style={styles.contactSection}>
        <View style={styles.contactItem}>
          <Phone size={14} color="#6B7280" strokeWidth={2} />
          <Text style={styles.contactText}>{item.mobile}</Text>
        </View>
        <View style={styles.contactItem}>
          <Mail size={14} color="#6B7280" strokeWidth={2} />
          <Text style={styles.contactText} numberOfLines={1}>{item.email}</Text>
        </View>
        <View style={styles.contactItem}>
          <MapPin size={14} color="#6B7280" strokeWidth={2} />
          <Text style={styles.contactText}>{item.location}</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>
            Joined {formatDate(item.createdAt)}
          </Text>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleEditAssociate(item)}
          >
            <Edit3 size={16} color="#4F46E5" strokeWidth={2} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteAssociate(item)}
          >
            <Trash2 size={16} color="#EF4444" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const handleDismissMessage = () => {
    dispatch(clearAssociateState());
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Users size={24} color="#4F46E5" strokeWidth={2} />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Team</Text>
            <Text style={styles.headerSubtitle}>
              {filteredAssociates.length} associate{filteredAssociates.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.createButton}
          onPress={handleCreateAssociate}
        >
          <Plus size={20} color="#FFFFFF" strokeWidth={2} />
          <Text style={styles.createButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={18} color="#6B7280" strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search associates by name, email, or location"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      {/* Associates List */}
      <FlatList
        data={filteredAssociates}
        renderItem={renderAssociateItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            colors={['#4F46E5']}
            tintColor="#4F46E5"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Users size={64} color="#D1D5DB" strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>No team members found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Try adjusting your search' : 'Add your first team member to get started'}
            </Text>
          </View>
        }
      />

      {/* Error/Success Snackbar */}
      <Snackbar
        visible={!!(error || success)}
        onDismiss={handleDismissMessage}
        action={{
          label: 'Dismiss',
          onPress: handleDismissMessage,
        }}
      >
        {error || success}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    shadowColor: '#4F46E5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  associateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  associateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#4F46E5',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  nameContainer: {
    flex: 1,
  },
  associateName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  associateId: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  contactSection: {
    marginBottom: 16,
    gap: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  dateContainer: {
    flex: 1,
  },
  dateText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    width: 36,
    height: 36,
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    width: 36,
    height: 36,
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default TeamScreen;
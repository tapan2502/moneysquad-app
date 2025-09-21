// src/store/slices/leadsSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/api';
import { secureStorage } from '../../utils/secureStorage';

// --- Types ---

export interface LeadRemarks {
  _id: string;
  leadId: string;
  remarkMessage: Array<{
    userId: string;
    name: string;
    role: string;
    messages: Array<{
      text: string;
      timestamp: string;
    }>;
    _id: string;
  }>;
  createdAt: string;
  __v: number;
}

export interface LeadTimelineEvent {
  _id: string;
  leadId: string;
  applicantName: string;
  status: string;
  message: string;
  rejectImage: string | null;
  rejectReason: string | null;
  rejectComment: string | null;
  closeReason: string | null;
  createdAt: string;
  __v: number;
}

export interface LeadTimeline {
  created?: LeadTimelineEvent;
  assigned?: LeadTimelineEvent;
  login?: LeadTimelineEvent;
  rejected?: LeadTimelineEvent;
  [key: string]: LeadTimelineEvent | undefined;
}

export interface Pincode {
  pincode: string;
  state: string;
  city: string;
  _id: string;
}

export interface Loan {
  type: string;
  amount: number;
  _id: string;
}

export interface Partner {
  _id: string;
  partnerId: string;
  basicInfo: {
    fullName: string;
    mobile: string;
    email: string;
  };
}

export interface Manager {
  _id: string;
  firstName: string;
  lastName: string;
  managerId: string;
  email: string;
  mobile: string;
}

export interface Associate {
  _id: string;
  firstName: string;
  lastName: string;
  associateDisplayId: string;
  email: string;
  mobile: string;
}

export interface DisbursementData {
  amount: number;
  date: string;
  bankName: string;
  accountNumber: string;
}

export interface Lead {
  id: string;
  leadId: string;
  applicantName: string;
  applicantProfile: string;
  email: string;
  mobile: string;
  pincode: Pincode;
  comments: string;
  loan: Loan;
  lenderType: string | null;
  partnerId: Partner;
  manager: Manager | null;
  associate: Associate | null;
  status: string;
  createdAt: string;
  disbursedData: DisbursementData | null;
  statusUpdatedAt: string;
  businessName: string;
}

interface LeadsState {
  leads: Lead[];
  selectedLead: Lead | null;
  leadTimeline: LeadTimeline | null;
  leadRemarks: LeadRemarks | null;
  archivedLeads: Lead[];
  isLoading: boolean;
  isTimelineLoading: boolean;
  isRemarksLoading: boolean;
  isUpdating: boolean;
  error: string | null;
}

const initialState: LeadsState = {
  leads: [],
  selectedLead: null,
  leadTimeline: null,
  leadRemarks: null,
  archivedLeads: [],
  isLoading: false,
  isTimelineLoading: false,
  isRemarksLoading: false,
  isUpdating: false,
  error: null,
};

// Utility: base URL from your existing axios client
const BASE_URL = (axiosInstance.defaults.baseURL || '').replace(/\/$/, '');

// --- Thunks ---

// Fetch All Leads (Axios OK)
export const fetchAllLeads = createAsyncThunk<Lead[], void, { rejectValue: string }>(
  'leads/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get('/lead');
      return data.data as Lead[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Fetch all failed');
    }
  }
);

// Fetch One Lead (Axios OK)
export const fetchLeadById = createAsyncThunk<Lead, string, { rejectValue: string }>(
  'leads/fetchById',
  async (leadId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/lead/${leadId}`);
      return data.data as Lead;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Fetch one failed');
    }
  }
);

// Fetch Lead Timeline (Axios OK)
export const fetchLeadTimeline = createAsyncThunk<LeadTimeline, string, { rejectValue: string }>(
  'leads/fetchTimeline',
  async (leadId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/lead/timeline/${leadId}`);
      return data.data as LeadTimeline;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Fetch timeline failed');
    }
  }
);

// Fetch Lead Remarks (Axios OK)
export const fetchLeadRemarks = createAsyncThunk<LeadRemarks, string, { rejectValue: string }>(
  'leads/fetchRemarks',
  async (leadId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/lead/remarks/${leadId}`);
      return data.data as LeadRemarks;
    } catch (err: any) {
      if (err.response?.data?.message === 'No remarks found for this leadId') {
        return {
          _id: '',
          leadId,
          remarkMessage: [],
          createdAt: new Date().toISOString(),
          __v: 0,
        } as LeadRemarks;
      }
      return rejectWithValue(err.response?.data?.message || 'Fetch remarks failed');
    }
  }
);

// Create Lead Remark (RN FormData via native fetch)
export const createLeadRemark = createAsyncThunk<
  LeadRemarks,
  { leadId: string; message: string },
  { rejectValue: string }
>('leads/createRemark', async ({ leadId, message }, { rejectWithValue }) => {
  try {
    const token = await secureStorage.getItem('token');

    const fd = new FormData();
    fd.append('message', String(message));

    const res = await fetch(`${BASE_URL}/lead/create-remarks?id=${encodeURIComponent(leadId)}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        // IMPORTANT: do NOT set Content-Type — RN will add multipart boundary
      },
      body: fd,
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json?.message || json?.error || `HTTP ${res.status}`);
    }
    return (json?.data ?? json) as LeadRemarks;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Create remark failed');
  }
});

// Create Lead (RN FormData via native fetch)
// Adjust fields to match your backend's expected keys
export const createLead = createAsyncThunk<
  Lead,
  {
    applicantName: string;
    applicantProfile: string;
    mobile: string;
    email: string;
    pincode: string;
    loantType: string;
    loanAmount: string;
    comments: string;
    businessName: string;
    city: string;
    state: string;
    partnerId: string;
    assignedTo: string;
    lenderType: string;
  },
  { rejectValue: string }
>('leads/create', async (formValues, { rejectWithValue }) => {
  try {
    const token = await secureStorage.getItem('token');

    const fd = new FormData();
    fd.append('applicantName', formValues.applicantName);
    fd.append('applicantProfile', formValues.applicantProfile);
    fd.append('mobile', formValues.mobile);
    fd.append('email', formValues.email);
    fd.append('pincode', formValues.pincode);
    fd.append('businessName', formValues.businessName);
    fd.append('loantType', formValues.loantType);
    fd.append('loanAmount', formValues.loanAmount);
    fd.append('comments', formValues.comments);
    fd.append('city', formValues.city);
    fd.append('state', formValues.state);
    fd.append('partnerId', formValues.partnerId);
    fd.append('assignedTo', formValues.assignedTo);
    fd.append('lenderType', formValues.lenderType);

    const res = await fetch(`${BASE_URL}/lead/create`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: fd, // no Content-Type
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json?.message || json?.error || `HTTP ${res.status}`);
    }

    const created = (json?.lead ?? json?.data ?? json) as Lead;
    return { ...created, id: (created as any)._id ?? created.id } as Lead;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to create lead');
  }
});

// Update Lead (RN FormData via native fetch)
export const updateLead = createAsyncThunk<
  Lead,
  {
    leadId: string;
    applicantName: string;
    applicantProfile: string;
    mobile: string;
    email: string;
    pincode: string;
    loantType: string;
    loanAmount: string;
    comments: string;
    businessName: string;
    city: string;
    state: string;
    partnerId: string;
    assignedTo: string;
    lenderType: string;
  },
  { rejectValue: string }
>('leads/update', async (formValues, { rejectWithValue }) => {
  try {
    const token = await secureStorage.getItem('token');

    const fd = new FormData();
    // Applicant fields
    fd.append('applicantName', formValues.applicantName);
    fd.append('applicantProfile', formValues.applicantProfile);
    fd.append('mobile', formValues.mobile);
    fd.append('email', formValues.email);
    fd.append('pincode', formValues.pincode);
    // Business
    fd.append('businessName', formValues.businessName);
    // Loan
    fd.append('loantType', formValues.loantType);
    fd.append('loanAmount', formValues.loanAmount);
    fd.append('comments', formValues.comments);
    // Location
    fd.append('city', formValues.city);
    fd.append('state', formValues.state);
    // Assignment
    fd.append('partnerId', formValues.partnerId);
    fd.append('assignedTo', formValues.assignedTo);
    // Lender
    fd.append('lenderType', formValues.lenderType);

    const res = await fetch(`${BASE_URL}/lead/update/${encodeURIComponent(formValues.leadId)}`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: fd, // no Content-Type
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json?.message || json?.error || `HTTP ${res.status}`);
    }

    const updatedLead = (json?.lead ?? json?.data ?? json) as Lead;
    return { ...updatedLead, id: (updatedLead as any)._id ?? updatedLead.id } as Lead;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to update lead');
  }
});

// Delete Lead (Axios OK)
export const deleteLead = createAsyncThunk<string, string, { rejectValue: string }>(
  'leads/delete',
  async (leadId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/lead/delete/${leadId}`);
      return leadId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete lead');
    }
  }
);

// Fetch Archived Leads (Axios OK)
export const fetchArchivedLeads = createAsyncThunk<Lead[], void, { rejectValue: string }>(
  'leads/fetchArchived',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get('/lead/archived');
      return data.data as Lead[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Fetch archived failed');
    }
  }
);

// --- Slice ---

const leadsSlice = createSlice({
  name: 'leads',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedLead: (state, action: PayloadAction<Lead | null>) => {
      state.selectedLead = action.payload;
    },
    clearLeadTimeline: (state) => {
      state.leadTimeline = null;
    },
    clearLeadRemarks: (state) => {
      state.leadRemarks = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch All Leads
    builder
      .addCase(fetchAllLeads.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllLeads.fulfilled, (state, action) => {
        state.isLoading = false;
        state.leads = action.payload;
      })
      .addCase(fetchAllLeads.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Lead By ID
    builder
      .addCase(fetchLeadById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLeadById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedLead = action.payload;
      })
      .addCase(fetchLeadById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Lead Timeline
    builder
      .addCase(fetchLeadTimeline.pending, (state) => {
        state.isTimelineLoading = true;
        state.error = null;
      })
      .addCase(fetchLeadTimeline.fulfilled, (state, action) => {
        state.isTimelineLoading = false;
        state.leadTimeline = action.payload;
      })
      .addCase(fetchLeadTimeline.rejected, (state, action) => {
        state.isTimelineLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Lead Remarks
    builder
      .addCase(fetchLeadRemarks.pending, (state) => {
        state.isRemarksLoading = true;
        state.error = null;
      })
      .addCase(fetchLeadRemarks.fulfilled, (state, action) => {
        state.isRemarksLoading = false;
        state.leadRemarks = action.payload;
      })
      .addCase(fetchLeadRemarks.rejected, (state, action) => {
        state.isRemarksLoading = false;
        state.error = action.payload as string;
      });

    // Create Lead Remark
    builder
      .addCase(createLeadRemark.pending, (state) => {
        state.isRemarksLoading = true;
        state.error = null;
      })
      .addCase(createLeadRemark.fulfilled, (state, action) => {
        state.isRemarksLoading = false;
        state.leadRemarks = action.payload;
      })
      .addCase(createLeadRemark.rejected, (state, action) => {
        state.isRemarksLoading = false;
        state.error = action.payload as string;
      });

    // Create Lead
    builder
      .addCase(createLead.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(createLead.fulfilled, (state, action) => {
        state.isUpdating = false;
        const created = action.payload;
        state.leads.unshift(created);
        state.selectedLead = created;
      })
      .addCase(createLead.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Update Lead
    builder
      .addCase(updateLead.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateLead.fulfilled, (state, action) => {
        state.isUpdating = false;
        const updatedLead = action.payload;
        const index = state.leads.findIndex((lead) => lead.id === updatedLead.id);
        if (index !== -1) state.leads[index] = updatedLead;
        if (state.selectedLead?.id === updatedLead.id) {
          state.selectedLead = updatedLead;
        }
      })
      .addCase(updateLead.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Delete Lead
    builder
      .addCase(deleteLead.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteLead.fulfilled, (state, action) => {
        state.isLoading = false;
        const deletedLeadId = action.payload;
        state.leads = state.leads.filter((lead) => lead.id !== deletedLeadId);
        if (state.selectedLead?.id === deletedLeadId) state.selectedLead = null;
      })
      .addCase(deleteLead.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Archived Leads
    builder
      .addCase(fetchArchivedLeads.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchArchivedLeads.fulfilled, (state, action) => {
        state.isLoading = false;
        state.archivedLeads = action.payload;
      })
      .addCase(fetchArchivedLeads.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setSelectedLead, clearLeadTimeline, clearLeadRemarks } = leadsSlice.actions;
export default leadsSlice.reducer;

// Re-export thunks for convenience
export {
  fetchLeadRemarks,
  createLeadRemark,
  createLead,
  updateLead,
  fetchAllLeads,
  fetchLeadById,
  fetchLeadTimeline,
  deleteLead,
  fetchArchivedLeads,
};

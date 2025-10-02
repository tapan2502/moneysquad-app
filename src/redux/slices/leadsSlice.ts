// src/store/slices/leadsSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../utils/api';
import { secureStorage } from '../../utils/secureStorage';

// --- Types (unchanged) ---
export interface LeadRemarks {
  _id: string;
  leadId: string;
  remarkMessage: Array<{
    userId: string;
    name: string;
    role: string;
    messages: Array<{ text: string; timestamp: string }>;
    _id: string;
  }>;
  createdAt: string;
  __v: number;
}
export interface LeadTimelineEvent {
  _id: string; leadId: string; applicantName: string; status: string; message: string;
  rejectImage: string | null; rejectReason: string | null; rejectComment: string | null;
  closeReason: string | null; createdAt: string; __v: number;
}
export interface LeadTimeline {
  created?: LeadTimelineEvent; assigned?: LeadTimelineEvent; login?: LeadTimelineEvent;
  rejected?: LeadTimelineEvent; [key: string]: LeadTimelineEvent | undefined;
}
export interface Pincode { pincode: string; state: string; city: string; _id: string; }
export interface Loan { type: string; amount: number; _id: string; }
export interface Partner { _id: string; partnerId: string; basicInfo: { fullName: string; mobile: string; email: string; }; }
export interface Manager { _id: string; firstName: string; lastName: string; managerId: string; email: string; mobile: string; }
export interface Associate { _id: string; firstName: string; lastName: string; associateDisplayId: string; email: string; mobile: string; }
export interface DisbursementData { amount: number; date: string; bankName: string; accountNumber: string; }
export interface Lead {
  id: string; leadId: string; applicantName: string; applicantProfile: string; email: string; mobile: string;
  pincode: Pincode; comments: string; loan: Loan; lenderType: string | null; partnerId: Partner;
  manager: Manager | null; associate: Associate | null; status: string; createdAt: string;
  disbursedData: DisbursementData | null; statusUpdatedAt: string; businessName: string;
}

interface LeadsState {
  leads: Lead[]; selectedLead: Lead | null; leadTimeline: LeadTimeline | null; leadRemarks: LeadRemarks | null;
  archivedLeads: Lead[]; isLoading: boolean; isTimelineLoading: boolean; isRemarksLoading: boolean;
  isUpdating: boolean; error: string | null;
}

const initialState: LeadsState = {
  leads: [], selectedLead: null, leadTimeline: null, leadRemarks: null, archivedLeads: [],
  isLoading: false, isTimelineLoading: false, isRemarksLoading: false, isUpdating: false, error: null,
};

// Use the same base URL as apiClient so everything stays in one place
const BASE_URL = (apiClient.defaults.baseURL || '').replace(/\/$/, '');

// Small helper for RN fetch + FormData
async function fetchForm(
  path: string,
  method: 'POST' | 'PUT',
  fd: FormData
) {
  const token = await secureStorage.getItem('token');
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // DO NOT set Content-Type for RN FormData: RN will set the multipart boundary correctly.
    },
    body: fd,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.message || json?.error || `HTTP ${res.status}`);
  }
  return json;
}

// --- Thunks ---

// Axios is perfect for JSON/GETs
export const fetchAllLeads = createAsyncThunk<Lead[], void, { rejectValue: string }>(
  'leads/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get('/lead');
      return data.data as Lead[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Fetch all failed');
    }
  }
);

export const fetchLeadById = createAsyncThunk<Lead, string, { rejectValue: string }>(
  'leads/fetchById',
  async (leadId, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get(`/lead/${leadId}`);
      return data.data as Lead;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Fetch one failed');
    }
  }
);

export const fetchLeadTimeline = createAsyncThunk<LeadTimeline, string, { rejectValue: string }>(
  'leads/fetchTimeline',
  async (leadId, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get(`/lead/timeline/${leadId}`);
      return data.data as LeadTimeline;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Fetch timeline failed');
    }
  }
);

export const fetchLeadRemarks = createAsyncThunk<LeadRemarks, string, { rejectValue: string }>(
  'leads/fetchRemarks',
  async (leadId, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get(`/lead/remarks/${leadId}`);
      return data.data as LeadRemarks;
    } catch (err: any) {
      if (err.response?.data?.message === 'No remarks found for this leadId') {
        return {
          _id: '', leadId, remarkMessage: [], createdAt: new Date().toISOString(), __v: 0,
        } as LeadRemarks;
      }
      return rejectWithValue(err.response?.data?.message || 'Fetch remarks failed');
    }
  }
);

// Use native fetch for multipart endpoints on RN (avoids Axios ERR_NETWORK on Android)

// Create remark
export const createLeadRemark = createAsyncThunk<
  LeadRemarks,
  { leadId: string; message: string },
  { rejectValue: string }
>('leads/createRemark', async ({ leadId, message }, { rejectWithValue }) => {
  try {
    const fd = new FormData();
    fd.append('message', String(message));
    const json = await fetchForm(`/lead/create-remarks?id=${encodeURIComponent(leadId)}`, 'POST', fd);
    return (json?.data ?? json) as LeadRemarks;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Create remark failed');
  }
});

// Create lead — only the fields from your screen
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
    city: string;
    state: string;
    businessName?: string;
    comments?: string;
  },
  { rejectValue: string }
>('leads/create', async (formValues, { rejectWithValue }) => {
  try {
    const fd = new FormData();
    fd.append('applicantName', formValues.applicantName);
    fd.append('applicantProfile', formValues.applicantProfile);
    fd.append('mobile', formValues.mobile);
    fd.append('email', formValues.email);
    fd.append('pincode', formValues.pincode);
    fd.append('city', formValues.city);
    fd.append('state', formValues.state);
    fd.append('loantType', formValues.loantType);
    fd.append('loanAmount', formValues.loanAmount);
    if (formValues.businessName) fd.append('businessName', formValues.businessName);
    if (formValues.comments) fd.append('comments', formValues.comments);

    const json = await fetchForm('/lead/create', 'POST', fd);
    const created = (json?.lead ?? json?.data ?? json) as Lead;
    return { ...created, id: (created as any)?._id ?? (created as any)?.id } as Lead;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to create lead');
  }
});

// Update lead — same field set
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
    city: string;
    state: string;
    businessName?: string;
    comments?: string;
  },
  { rejectValue: string }
>('leads/update', async (formValues, { rejectWithValue }) => {
  try {
    const fd = new FormData();
    fd.append('applicantName', formValues.applicantName);
    fd.append('applicantProfile', formValues.applicantProfile);
    fd.append('mobile', formValues.mobile);
    fd.append('email', formValues.email);
    fd.append('pincode', formValues.pincode);
    fd.append('city', formValues.city);
    fd.append('state', formValues.state);
    fd.append('loantType', formValues.loantType);
    fd.append('loanAmount', formValues.loanAmount);
    if (formValues.businessName) fd.append('businessName', formValues.businessName);
    if (formValues.comments) fd.append('comments', formValues.comments);

    const json = await fetchForm(`/lead/update/${encodeURIComponent(formValues.leadId)}`, 'PUT', fd);
    const updated = (json?.lead ?? json?.data ?? json) as Lead;
    return { ...updated, id: (updated as any)?._id ?? (updated as any)?.id } as Lead;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to update lead');
  }
});

// Delete & archived can stay on Axios
export const deleteLead = createAsyncThunk<string, string, { rejectValue: string }>(
  'leads/delete',
  async (leadId, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/lead/delete/${leadId}`);
      return leadId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete lead');
    }
  }
);

export const fetchArchivedLeads = createAsyncThunk<Lead[], void, { rejectValue: string }>(
  'leads/fetchArchived',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get('/lead/archived');
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
    clearError: (state) => { state.error = null; },
    setSelectedLead: (state, action: PayloadAction<Lead | null>) => { state.selectedLead = action.payload; },
    clearLeadTimeline: (state) => { state.leadTimeline = null; },
    clearLeadRemarks: (state) => { state.leadRemarks = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllLeads.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(fetchAllLeads.fulfilled, (s, a) => { s.isLoading = false; s.leads = a.payload; })
      .addCase(fetchAllLeads.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; });

    builder
      .addCase(fetchLeadById.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(fetchLeadById.fulfilled, (s, a) => { s.isLoading = false; s.selectedLead = a.payload; })
      .addCase(fetchLeadById.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; });

    builder
      .addCase(fetchLeadTimeline.pending, (s) => { s.isTimelineLoading = true; s.error = null; })
      .addCase(fetchLeadTimeline.fulfilled, (s, a) => { s.isTimelineLoading = false; s.leadTimeline = a.payload; })
      .addCase(fetchLeadTimeline.rejected, (s, a) => { s.isTimelineLoading = false; s.error = a.payload as string; });

    builder
      .addCase(fetchLeadRemarks.pending, (s) => { s.isRemarksLoading = true; s.error = null; })
      .addCase(fetchLeadRemarks.fulfilled, (s, a) => { s.isRemarksLoading = false; s.leadRemarks = a.payload; })
      .addCase(fetchLeadRemarks.rejected, (s, a) => { s.isRemarksLoading = false; s.error = a.payload as string; });

    builder
      .addCase(createLeadRemark.pending, (s) => { s.isRemarksLoading = true; s.error = null; })
      .addCase(createLeadRemark.fulfilled, (s, a) => { s.isRemarksLoading = false; s.leadRemarks = a.payload; })
      .addCase(createLeadRemark.rejected, (s, a) => { s.isRemarksLoading = false; s.error = a.payload as string; });

    builder
      .addCase(createLead.pending, (s) => { s.isUpdating = true; s.error = null; })
      .addCase(createLead.fulfilled, (s, a) => {
        s.isUpdating = false;
        const created = a.payload;
        s.leads.unshift(created);
        s.selectedLead = created;
      })
      .addCase(createLead.rejected, (s, a) => { s.isUpdating = false; s.error = a.payload as string; });

    builder
      .addCase(updateLead.pending, (s) => { s.isUpdating = true; s.error = null; })
      .addCase(updateLead.fulfilled, (s, a) => {
        s.isUpdating = false;
        const updated = a.payload;
        const i = s.leads.findIndex((x) => x.id === updated.id);
        if (i !== -1) s.leads[i] = updated;
        if (s.selectedLead?.id === updated.id) s.selectedLead = updated;
      })
      .addCase(updateLead.rejected, (s, a) => { s.isUpdating = false; s.error = a.payload as string; });

    builder
      .addCase(deleteLead.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(deleteLead.fulfilled, (s, a) => {
        s.isLoading = false;
        s.leads = s.leads.filter((l) => l.id !== a.payload);
        if (s.selectedLead?.id === a.payload) s.selectedLead = null;
      })
      .addCase(deleteLead.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; });

    builder
      .addCase(fetchArchivedLeads.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(fetchArchivedLeads.fulfilled, (s, a) => { s.isLoading = false; s.archivedLeads = a.payload; })
      .addCase(fetchArchivedLeads.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; });
  },
});

export const { clearError, setSelectedLead, clearLeadTimeline, clearLeadRemarks } = leadsSlice.actions;
export default leadsSlice.reducer;

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

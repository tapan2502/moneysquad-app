import * as yup from 'yup';

// Login validation schema
export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .required('Email or mobile is required')
    .test('email-or-mobile', 'Enter a valid email or mobile number', (value) => {
      if (!value) return false;
      
      // Check if it's a valid email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(value)) return true;
      
      // Check if it's a valid mobile number (10 digits)
      const mobileRegex = /^[0-9]{10}$/;
      if (mobileRegex.test(value)) return true;
      
      return false;
    }),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

// OTP verification schema
export const otpSchema = yup.object().shape({
  otp: yup
    .string()
    .required('OTP is required')
    .length(6, 'OTP must be 6 digits')
    .matches(/^\d+$/, 'OTP must contain only numbers'),
});

// Basic info schema
export const basicInfoSchema = yup.object().shape({
  fullName: yup
    .string()
    .required('Full name is required')
    .min(2, 'Name must be at least 2 characters'),
  mobile: yup
    .string()
    .required('Mobile number is required')
    .matches(/^[0-9]{10}$/, 'Enter a valid 10-digit mobile number'),
  email: yup
    .string()
    .required('Email is required')
    .email('Enter a valid email address'),
  registeringAs: yup
    .string()
    .required('Please select registering as'),
  teamStrength: yup
    .string()
    .optional(),
});

// Personal info schema
export const personalInfoSchema = yup.object().shape({
  dateOfBirth: yup
    .string()
    .required('Date of birth is required'),
  currentProfession: yup
    .string()
    .required('Current profession is required'),
  emergencyContactNumber: yup
    .string()
    .required('Emergency contact is required')
    .matches(/^[0-9]{10}$/, 'Enter a valid 10-digit mobile number'),
  experienceInSellingLoans: yup
    .string()
    .required('Experience is required'),
  focusProduct: yup
    .string()
    .required('Focus product is required'),
  roleSelection: yup
    .string()
    .required('Role selection is required'),
});

// Address details schema
export const addressSchema = yup.object().shape({
  addressLine1: yup
    .string()
    .required('Address line 1 is required'),
  addressLine2: yup
    .string()
    .optional(),
  city: yup
    .string()
    .required('City is required'),
  pincode: yup
    .string()
    .required('Pincode is required')
    .matches(/^[0-9]{6}$/, 'Enter a valid 6-digit pincode'),
  addressType: yup
    .string()
    .required('Address type is required'),
  landmark: yup
    .string()
    .optional(),
});

// Bank details schema
export const bankDetailsSchema = yup.object().shape({
  accountHolderName: yup
    .string()
    .required('Account holder name is required'),
  accountNumber: yup
    .string()
    .required('Account number is required')
    .min(9, 'Account number must be at least 9 digits')
    .max(18, 'Account number must not exceed 18 digits'),
  bankName: yup
    .string()
    .required('Bank name is required'),
  branchName: yup
    .string()
    .required('Branch name is required'),
  ifscCode: yup
    .string()
    .required('IFSC code is required')
    .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Enter a valid IFSC code'),
  accountType: yup
    .string()
    .required('Account type is required'),
  isGstBillingApplicable: yup
    .boolean()
    .required('GST billing preference is required'),
});
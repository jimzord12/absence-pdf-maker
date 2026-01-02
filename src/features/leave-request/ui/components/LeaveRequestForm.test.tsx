import { zodResolver } from '@hookform/resolvers/zod';
import { fireEvent, render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LeaveRequestSchema } from '../../model/leaveRequest.schema';
import { useLeaveRequestStore } from '../../state/leaveRequest.store';
import { LeaveRequestForm } from './LeaveRequestForm';

// Mock the store
vi.mock('../../state/leaveRequest.store', () => {
  const mockStore = {
    profile: {
      fullName: '',
      fathersName: '',
      email: '',
      phone: '',
      identityNumber: '',
      employeeId: '',
      companyName: 'ICS ΚΑΡΑΦΥΛΛΗΣ Α.Ε',
      department: '',
      position: '',
    },
    leaveDraft: {
      leaveType: 'annual',
      startDate: null,
      endDate: null,
      reason: '',
      leaveAllowance: false,
    },
    signature: {
      signatureDataUrl: '',
    },
    holidays: {
      holidaySet: new Set(),
    },
    ui: {
      isSignatureModalOpen: false,
      isGeneratingPdf: false,
      lastGeneratedFileName: '',
      errorMessage: null,
      triggerValidation: null,
    },
    setProfile: vi.fn(),
    setLeaveDraft: vi.fn(),
    setSignature: vi.fn(),
    setHolidays: vi.fn(),
    setUi: vi.fn(),
    setTriggerValidation: vi.fn(),
  };

  return {
    useLeaveRequestStore: vi.fn(selector => (selector ? selector(mockStore) : mockStore)),
  };
});

// Mock the section components
vi.mock('./DateRangeField', () => ({
  DateRangeField: ({ label, onChange }: any) => (
    <div data-testid="date-range-field">
      <span>{label}</span>
      <button
        onClick={() => onChange({ from: new Date('2024-01-01'), to: new Date('2024-01-05') })}
      >
        Set Dates
      </button>
    </div>
  ),
}));

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm({
    resolver: zodResolver(LeaveRequestSchema),
    defaultValues: {
      profile: {
        fullName: '',
        fathersName: '',
        email: '',
        phone: '',
        identityNumber: '',
        employeeId: '',
        companyName: 'ICS ΚΑΡΑΦΥΛΛΗΣ Α.Ε',
        department: '',
        position: '',
      },
      leaveType: 'annual',
      leaveAllowance: false,
      startDate: undefined,
      endDate: undefined,
      reason: '',
      createdAt: new Date(),
    },
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('LeaveRequestForm', () => {
  const mockSetProfile = vi.fn();
  const mockSetLeaveDraft = vi.fn();
  const mockSetTriggerValidation = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    const mockStore = {
      profile: {
        fullName: '',
        fathersName: '',
        email: '',
        phone: '',
        identityNumber: '',
        employeeId: '',
        companyName: 'ICS ΚΑΡΑΦΥΛΛΗΣ Α.Ε',
        department: '',
        position: '',
      },
      leaveDraft: {
        leaveType: 'annual',
        startDate: null,
        endDate: null,
        reason: '',
        leaveAllowance: false,
      },
      signature: {
        signatureDataUrl: '',
      },
      holidays: {
        holidaySet: new Set(),
      },
      ui: {
        isSignatureModalOpen: false,
        isGeneratingPdf: false,
        lastGeneratedFileName: '',
        errorMessage: null,
        triggerValidation: null,
      },
      setProfile: mockSetProfile,
      setLeaveDraft: mockSetLeaveDraft,
      setTriggerValidation: mockSetTriggerValidation,
    };
    (useLeaveRequestStore as any).mockImplementation((selector: any) =>
      selector ? selector(mockStore) : mockStore
    );
  });

  it('renders all form sections', () => {
    render(
      <Wrapper>
        <LeaveRequestForm />
      </Wrapper>
    );

    expect(screen.getByText('Personal Details')).toBeInTheDocument();
    expect(screen.getByText('Employment Details')).toBeInTheDocument();
    expect(screen.getByText('Leave Details')).toBeInTheDocument();
  });

  it('renders all required fields', () => {
    render(
      <Wrapper>
        <LeaveRequestForm />
      </Wrapper>
    );

    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Father's Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Employee ID \(Optional\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Leave Type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Reason \(Optional\)/i)).toBeInTheDocument();
  });

  it('renders the reset button', () => {
    render(
      <Wrapper>
        <LeaveRequestForm />
      </Wrapper>
    );

    expect(screen.getByRole('button', { name: /Reset Form/i })).toBeInTheDocument();
  });

  it('resets the form when reset button is clicked', async () => {
    render(
      <Wrapper>
        <LeaveRequestForm />
      </Wrapper>
    );

    const fullNameInput = screen.getByLabelText(/Full Name/i) as HTMLInputElement;
    fireEvent.change(fullNameInput, { target: { value: 'John Doe' } });
    expect(fullNameInput.value).toBe('John Doe');

    const resetButton = screen.getByRole('button', { name: /Reset Form/i });
    fireEvent.click(resetButton);

    expect(fullNameInput.value).toBe('');
  });
});


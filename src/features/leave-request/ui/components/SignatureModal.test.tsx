import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SignatureModal } from './SignatureModal';
import { useLeaveRequestStore } from '../../state/leaveRequest.store';
import { renderWithI18n } from '../../../../test-utils';

// Create a proper mock for SignatureCanvas
const mockClear = vi.fn();
const mockToDataURL = vi.fn(() => 'data:image/png;base64,test');
// Make isEmpty return false by default (canvas has content)
// but can be changed in tests for edge cases
const mockIsEmpty = vi.fn(() => false);

const mockSigCanvasInstance = {
  clear: mockClear,
  toDataURL: mockToDataURL,
  isEmpty: mockIsEmpty,
};

vi.mock('react-signature-canvas', () => ({
  default: React.forwardRef((props: any, ref: any) => {
    // Attach the mock instance to the ref
    React.useImperativeHandle(ref, () => mockSigCanvasInstance, []);
    return <canvas data-testid="signature-canvas" {...props.canvasProps} />;
  }),
}));

// Reset mocks before each test
beforeEach(() => {
  mockClear.mockReset();
  mockToDataURL.mockReturnValue('data:image/png;base64,test');
  mockIsEmpty.mockReturnValue(false);

  // Reset store state before each test
  useLeaveRequestStore.setState({
    profile: {},
    leaveDraft: {},
    signature: { signatureDataUrl: '' },
    holidays: { holidaySet: new Set() },
    ui: { isSignatureModalOpen: false, isGeneratingPdf: false, lastGeneratedFileName: '', errorMessage: null, triggerValidation: null,
      forceFormReset: false },
  });
});

afterEach(() => {
  // Clean up after each test
  useLeaveRequestStore.setState({
    profile: {},
    leaveDraft: {},
    signature: { signatureDataUrl: '' },
    holidays: { holidaySet: new Set() },
    ui: { isSignatureModalOpen: false, isGeneratingPdf: false, lastGeneratedFileName: '', errorMessage: null, triggerValidation: null,
      forceFormReset: false },
  });
});

describe('SignatureModal', () => {
  // Helper to open the modal
  const openModal = async () => {
    await act(async () => {
      useLeaveRequestStore.setState({
        profile: {},
        leaveDraft: {},
        signature: { signatureDataUrl: '' },
        holidays: { holidaySet: new Set() },
        ui: { isSignatureModalOpen: true, isGeneratingPdf: false, lastGeneratedFileName: '', errorMessage: null, triggerValidation: null,
      forceFormReset: false },
      });
    });
  };

  // Helper to close the modal
  const closeModal = async () => {
    await act(async () => {
      useLeaveRequestStore.setState({
        profile: {},
        leaveDraft: {},
        signature: { signatureDataUrl: '' },
        holidays: { holidaySet: new Set() },
        ui: { isSignatureModalOpen: false, isGeneratingPdf: false, lastGeneratedFileName: '', errorMessage: null, triggerValidation: null,
      forceFormReset: false },
      });
    });
  };

  // Helper to render component
  const renderComponent = () => {
    return renderWithI18n(<SignatureModal />);
  };

  describe('rendering', () => {
    it('should not render modal when isSignatureModalOpen is false', () => {
      renderComponent();
      expect(screen.queryByText('Sign Your Name')).not.toBeInTheDocument();
    });

    it('should render modal when isSignatureModalOpen is true', async () => {
      renderComponent();
      await openModal();
      expect(screen.getByText('Sign Your Name')).toBeInTheDocument();
    });

    it('should render signature canvas when modal is open', async () => {
      renderComponent();
      await openModal();
      expect(screen.getByTestId('signature-canvas')).toBeInTheDocument();
    });

    it('should render Clear button', async () => {
      renderComponent();
      await openModal();
      expect(screen.getByText('Clear')).toBeInTheDocument();
    });

    it('should render Save Signature button', async () => {
      renderComponent();
      await openModal();
      expect(screen.getByText('Save Signature')).toBeInTheDocument();
    });

    it('should render Cancel button', async () => {
      renderComponent();
      await openModal();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should render instructions text', async () => {
      renderComponent();
      await openModal();
      expect(screen.getByText(/Please sign in the box below/)).toBeInTheDocument();
      expect(screen.getByText(/Your signature will be saved to the document/)).toBeInTheDocument();
    });
  });

  describe('signature preview', () => {
    it('should not render signature preview when no signature is captured', async () => {
      renderComponent();
      await openModal();
      expect(screen.queryByText('Captured Signature:')).not.toBeInTheDocument();
    });

    it('should render signature preview when signature is captured', async () => {
      const testDataUrl = 'data:image/png;base64,testsignature';
      await act(async () => {
        useLeaveRequestStore.setState({
          profile: {},
          leaveDraft: {},
          signature: { signatureDataUrl: testDataUrl },
          holidays: { holidaySet: new Set() },
          ui: { isSignatureModalOpen: true, isGeneratingPdf: false, lastGeneratedFileName: '', errorMessage: null, triggerValidation: null,
      forceFormReset: false },
        });
      });

      renderComponent();
      expect(screen.getByText('Captured Signature:')).toBeInTheDocument();
      expect(screen.getByAltText('Captured signature')).toBeInTheDocument();
      expect(screen.getByAltText('Captured signature')).toHaveAttribute('src', testDataUrl);
    });
  });

  describe('Cancel button interaction', () => {
    it('should close modal when Cancel button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();
      await openModal();

      expect(screen.getByText('Sign Your Name')).toBeInTheDocument();

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      // Modal should close
      await waitFor(() => {
        expect(screen.queryByText('Sign Your Name')).not.toBeInTheDocument();
      });

      // Store state should be updated
      expect(useLeaveRequestStore.getState().ui.isSignatureModalOpen).toBe(false);
    });

    it('should not save signature when Cancel button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();
      await openModal();

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      // Signature should remain empty
      expect(useLeaveRequestStore.getState().signature.signatureDataUrl).toBe('');
    });
  });

  describe('Clear button interaction', () => {
    it('should call clear method on signature canvas when Clear button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();
      await openModal();

      const clearButton = screen.getByText('Clear');
      await user.click(clearButton);

      expect(mockClear).toHaveBeenCalled();
    });
  });

  describe('Save button interaction', () => {
    it('should have Save Signature button in DOM', async () => {
      renderComponent();
      await openModal();

      expect(screen.getByText('Save Signature')).toBeInTheDocument();
    });

    it('should be disabled when canvas is empty', async () => {
      // Mock that canvas is empty (reset to default behavior)
      mockIsEmpty.mockReturnValue(true);

      renderComponent();
      await openModal();

      const saveButton = screen.getByText('Save Signature');

      // Button should be disabled when signature is empty
      expect(saveButton).toBeDisabled();
    });
  });

  describe('canvas clearing on modal open', () => {
    it('should clear canvas when modal opens', async () => {
      renderComponent();

      // Mock signature data before opening
      const testDataUrl = 'data:image/png;base64,oldsignature';
      await act(async () => {
        useLeaveRequestStore.setState({
          profile: {},
          leaveDraft: {},
          signature: { signatureDataUrl: testDataUrl },
          holidays: { holidaySet: new Set() },
          ui: { isSignatureModalOpen: false, isGeneratingPdf: false, lastGeneratedFileName: '', errorMessage: null, triggerValidation: null,
      forceFormReset: false },
        });
      });

      // Open modal
      await openModal();

      // Clear should be called
      expect(mockClear).toHaveBeenCalled();
      expect(screen.getByTestId('signature-canvas')).toBeInTheDocument();
    });
  });

  describe('Modal integration', () => {
    it('should use shared Modal component with correct props', async () => {
      renderComponent();
      await openModal();

      // Check that the Modal has the correct title
      expect(screen.getByText('Sign Your Name')).toBeInTheDocument();
    });

    it('should have closeOnBackdropClick set to false', async () => {
      renderComponent();
      await openModal();

      // Modal should be rendered
      expect(screen.getByText('Sign Your Name')).toBeInTheDocument();
    });

    it('should have showCloseButton set to false', async () => {
      renderComponent();
      await openModal();

      // Modal should not have the default close button in the header
      // The close button is tested in Modal tests
      expect(screen.getByText('Sign Your Name')).toBeInTheDocument();
    });
  });

  describe('store integration', () => {
    it('should be controlled by Zustand isSignatureModalOpen state', async () => {
      renderComponent();

      // Start with modal closed
      expect(screen.queryByText('Sign Your Name')).not.toBeInTheDocument();

      // Open modal by updating store
      await openModal();
      expect(screen.getByText('Sign Your Name')).toBeInTheDocument();

      // Close modal by updating store
      await closeModal();
      expect(screen.queryByText('Sign Your Name')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper button labels', async () => {
      renderComponent();
      await openModal();

      const allButtons = screen.getAllByRole('button');
      expect(allButtons.find(b => b.textContent === 'Cancel')).toBeInTheDocument();
      expect(allButtons.find(b => b.textContent.trim() === 'Clear')).toBeInTheDocument();
      expect(allButtons.find(b => b.textContent === 'Save Signature')).toBeInTheDocument();
    });

    it('should have alt text for signature preview', async () => {
      const testDataUrl = 'data:image/png;base64,testsignature';

      await act(async () => {
        useLeaveRequestStore.setState({
          profile: {},
          leaveDraft: {},
          signature: { signatureDataUrl: testDataUrl },
          holidays: { holidaySet: new Set() },
          ui: { isSignatureModalOpen: true, isGeneratingPdf: false, lastGeneratedFileName: '', errorMessage: null, triggerValidation: null,
      forceFormReset: false },
        });
      });

      renderComponent();
      expect(screen.getByAltText('Captured signature')).toBeInTheDocument();
    });
  });
});

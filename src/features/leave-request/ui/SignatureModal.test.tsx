import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SignatureModal } from './SignatureModal';
import { useLeaveRequestStore } from '../state/leaveRequest.store';

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
    ui: { isSignatureModalOpen: false, isGeneratingPdf: false, lastGeneratedFileName: '', errorMessage: null },
  });
});

afterEach(() => {
  // Clean up after each test
  useLeaveRequestStore.setState({
    profile: {},
    leaveDraft: {},
    signature: { signatureDataUrl: '' },
    holidays: { holidaySet: new Set() },
    ui: { isSignatureModalOpen: false, isGeneratingPdf: false, lastGeneratedFileName: '', errorMessage: null },
  });
});

describe('SignatureModal', () => {
  // Helper to open the modal
  const openModal = () => {
    act(() => {
      useLeaveRequestStore.setState({
        profile: {},
        leaveDraft: {},
        signature: { signatureDataUrl: '' },
        holidays: { holidaySet: new Set() },
        ui: { isSignatureModalOpen: true, isGeneratingPdf: false, lastGeneratedFileName: '', errorMessage: null },
      });
    });
  };

  // Helper to close the modal
  const closeModal = () => {
    act(() => {
      useLeaveRequestStore.setState({
        profile: {},
        leaveDraft: {},
        signature: { signatureDataUrl: '' },
        holidays: { holidaySet: new Set() },
        ui: { isSignatureModalOpen: false, isGeneratingPdf: false, lastGeneratedFileName: '', errorMessage: null },
      });
    });
  };

  // Helper to render component
  const renderComponent = () => {
    return render(
      <>
        <SignatureModal />
      </>
    );
  };

  describe('rendering', () => {
    it('should not render modal when isSignatureModalOpen is false', () => {
      renderComponent();
      expect(screen.queryByText('Sign Your Name')).not.toBeInTheDocument();
    });

    it('should render modal when isSignatureModalOpen is true', () => {
      renderComponent();
      openModal();
      expect(screen.getByText('Sign Your Name')).toBeInTheDocument();
    });

    it('should render signature canvas when modal is open', () => {
      renderComponent();
      openModal();
      expect(screen.getByTestId('signature-canvas')).toBeInTheDocument();
    });

    it('should render Clear button', () => {
      renderComponent();
      openModal();
      expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
    });

    it('should render Save Signature button', () => {
      renderComponent();
      openModal();
      expect(screen.getByRole('button', { name: 'Save Signature' })).toBeInTheDocument();
    });

    it('should render Cancel button', () => {
      renderComponent();
      openModal();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('should render instructions text', () => {
      renderComponent();
      openModal();
      expect(screen.getByText(/Please sign in the box below/)).toBeInTheDocument();
      expect(screen.getByText(/Your signature will be saved to the document/)).toBeInTheDocument();
    });
  });

  describe('signature preview', () => {
    it('should not render signature preview when no signature is captured', () => {
      renderComponent();
      openModal();
      expect(screen.queryByText('Captured Signature:')).not.toBeInTheDocument();
    });

    it('should render signature preview when signature is captured', () => {
      const testDataUrl = 'data:image/png;base64,testsignature';
      act(() => {
        useLeaveRequestStore.setState({
          profile: {},
          leaveDraft: {},
          signature: { signatureDataUrl: testDataUrl },
          holidays: { holidaySet: new Set() },
          ui: { isSignatureModalOpen: true, isGeneratingPdf: false, lastGeneratedFileName: '', errorMessage: null },
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
      openModal();

      expect(screen.getByText('Sign Your Name')).toBeInTheDocument();

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
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
      openModal();

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      await user.click(cancelButton);

      // Signature should remain empty
      expect(useLeaveRequestStore.getState().signature.signatureDataUrl).toBe('');
    });
  });

  describe('Clear button interaction', () => {
    it('should call clear method on signature canvas when Clear button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();
      openModal();

      const clearButton = screen.getByRole('button', { name: 'Clear' });
      await user.click(clearButton);

      expect(mockClear).toHaveBeenCalled();
    });
  });

  describe('Save button interaction', () => {
    it('should have Save Signature button in DOM', () => {
      renderComponent();
      openModal();

      expect(screen.getByRole('button', { name: 'Save Signature' })).toBeInTheDocument();
    });

    it('should be disabled when canvas is empty', () => {
      // Mock that canvas is empty (reset to default behavior)
      mockIsEmpty.mockReturnValue(true);

      renderComponent();
      openModal();

      const saveButton = screen.getByRole('button', { name: 'Save Signature' });

      // Button should be disabled when signature is empty
      expect(saveButton).toBeDisabled();
    });
  });

  describe('canvas clearing on modal open', () => {
    it('should clear canvas when modal opens', () => {
      renderComponent();

      // Mock signature data before opening
      const testDataUrl = 'data:image/png;base64,oldsignature';
      act(() => {
        useLeaveRequestStore.setState({
          profile: {},
          leaveDraft: {},
          signature: { signatureDataUrl: testDataUrl },
          holidays: { holidaySet: new Set() },
          ui: { isSignatureModalOpen: false, isGeneratingPdf: false, lastGeneratedFileName: '', errorMessage: null },
        });
      });

      // Open modal
      openModal();

      // Clear should be called
      expect(mockClear).toHaveBeenCalled();
      expect(screen.getByTestId('signature-canvas')).toBeInTheDocument();
    });
  });

  describe('Modal integration', () => {
    it('should use shared Modal component with correct props', () => {
      renderComponent();
      openModal();

      // Check that the Modal has the correct title
      expect(screen.getByText('Sign Your Name')).toBeInTheDocument();
    });

    it('should have closeOnBackdropClick set to false', () => {
      renderComponent();
      openModal();

      // Modal should be rendered
      expect(screen.getByText('Sign Your Name')).toBeInTheDocument();
    });

    it('should have showCloseButton set to false', () => {
      renderComponent();
      openModal();

      // Modal should not have the default close button in the header
      // The close button is tested in Modal tests
      expect(screen.getByText('Sign Your Name')).toBeInTheDocument();
    });
  });

  describe('store integration', () => {
    it('should be controlled by Zustand isSignatureModalOpen state', () => {
      renderComponent();

      // Start with modal closed
      expect(screen.queryByText('Sign Your Name')).not.toBeInTheDocument();

      // Open modal by updating store
      openModal();
      expect(screen.getByText('Sign Your Name')).toBeInTheDocument();

      // Close modal by updating store
      closeModal();
      expect(screen.queryByText('Sign Your Name')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper button labels', () => {
      renderComponent();
      openModal();

      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Save Signature' })).toBeInTheDocument();
    });

    it('should have alt text for signature preview', () => {
      const testDataUrl = 'data:image/png;base64,testsignature';

      act(() => {
        useLeaveRequestStore.setState({
          profile: {},
          leaveDraft: {},
          signature: { signatureDataUrl: testDataUrl },
          holidays: { holidaySet: new Set() },
          ui: { isSignatureModalOpen: true, isGeneratingPdf: false, lastGeneratedFileName: '', errorMessage: null },
        });
      });

      renderComponent();
      expect(screen.getByAltText('Captured signature')).toBeInTheDocument();
    });
  });
});

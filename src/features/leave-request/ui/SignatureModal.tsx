import React, { useRef, useEffect, useState, useCallback } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Modal } from '../../../shared/ui/Modal';
import { Button } from '../../../shared/ui/Button';
import { useLeaveRequestStore } from '../state/leaveRequest.store';

// Constants
const CANVAS_HEIGHT = 200;

export const SignatureModal: React.FC = () => {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const hasInitializedRef = useRef(false);
  const [hasSignature, setHasSignature] = useState(false);

  const {
    ui: { isSignatureModalOpen },
    signature: { signatureDataUrl },
    toggleSignatureModal,
    setSignature,
  } = useLeaveRequestStore();

  // Clear the canvas when modal opens and reset signature state
  useEffect(() => {
    if (isSignatureModalOpen && sigCanvas.current) {
      sigCanvas.current.clear();
      hasInitializedRef.current = true;

      // Reset signature state after modal opens
      return () => {
        setHasSignature(false);
      };
    } else if (!isSignatureModalOpen) {
      hasInitializedRef.current = false;
    }
    return undefined;
  }, [isSignatureModalOpen]);

  // Handle clearing the signature canvas
  const handleClear = useCallback(() => {
    sigCanvas.current?.clear();
    setHasSignature(false);
  }, []);

  // Handle saving the signature as data URL
  const handleSave = useCallback(() => {
    if (sigCanvas.current) {
      const dataUrl = sigCanvas.current.toDataURL();
      setSignature({ signatureDataUrl: dataUrl });
      toggleSignatureModal();
    }
  }, [setSignature, toggleSignatureModal]);

  // Handle closing the modal without saving
  const handleCancel = useCallback(() => {
    toggleSignatureModal();
  }, [toggleSignatureModal]);

  // Handle signature drawing start
  const handleSignatureBegin = useCallback(() => {
    setHasSignature(true);
  }, []);

  return (
    <Modal
      isOpen={isSignatureModalOpen}
      onClose={handleCancel}
      title="Sign Your Name"
      closeOnBackdropClick={false}
      showCloseButton={false}
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Please sign in the box below. Your signature will be saved to the
          document.
        </p>

        {/* Signature Canvas */}
        <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
          <SignatureCanvas
            ref={sigCanvas}
            onBegin={handleSignatureBegin}
            canvasProps={{
              className: 'w-full bg-white cursor-crosshair',
              style: { height: `${CANVAS_HEIGHT}px` },
            }}
          />
        </div>

        {/* Signature Preview */}
        {signatureDataUrl && signatureDataUrl.length > 0 && (
          <div className="border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-2">Captured Signature:</p>
            <img
              src={signatureDataUrl}
              alt="Captured signature"
              className="max-h-24"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pt-4">
          <Button
            variant="secondary"
            onClick={handleCancel}
            type="button"
          >
            Cancel
          </Button>
          <Button
            variant="secondary"
            onClick={handleClear}
            type="button"
          >
            Clear
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            type="button"
            disabled={!hasSignature}
          >
            Save Signature
          </Button>
        </div>
      </div>
    </Modal>
  );
};

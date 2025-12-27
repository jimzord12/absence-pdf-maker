import React, { useRef, useEffect, useState, useCallback } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Modal } from '../../../shared/ui/Modal';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { useLeaveRequestStore } from '../state/leaveRequest.store';

// Constants
const CANVAS_HEIGHT = 200;

export const SignatureModal: React.FC = () => {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const hasInitializedRef = useRef(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [useTypedSignature, setUseTypedSignature] = useState(false);
  const [typedName, setTypedName] = useState('');

  const {
    ui: { isSignatureModalOpen },
    signature: { signatureDataUrl },
    toggleSignatureModal,
    setSignature,
  } = useLeaveRequestStore();

  // Clear the canvas when modal opens and reset signature state
  useEffect(() => {
    if (isSignatureModalOpen) {
      if (sigCanvas.current) {
        sigCanvas.current.clear();
      }
      hasInitializedRef.current = true;
      setHasSignature(false);
      setTypedName('');
      setUseTypedSignature(false);
    } else {
      hasInitializedRef.current = false;
    }
    return undefined;
  }, [isSignatureModalOpen, setHasSignature, setTypedName, setUseTypedSignature]);

  // Handle clearing the signature canvas
  const handleClear = useCallback(() => {
    if (useTypedSignature) {
      setTypedName('');
      setHasSignature(false);
    } else {
      sigCanvas.current?.clear();
      setHasSignature(false);
    }
  }, [useTypedSignature]);

  // Handle saving the signature as data URL
  const handleSave = useCallback(() => {
    if (useTypedSignature && typedName.trim()) {
      setSignature({ signatureDataUrl: `text:${typedName.trim()}` });
      toggleSignatureModal();
    } else if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      const dataUrl = sigCanvas.current.toDataURL();
      setSignature({ signatureDataUrl: dataUrl });
      toggleSignatureModal();
    }
  }, [setSignature, toggleSignatureModal, useTypedSignature, typedName]);

  // Handle closing the modal without saving
  const handleCancel = useCallback(() => {
    toggleSignatureModal();
  }, [toggleSignatureModal]);

  // Handle signature drawing start
  const handleSignatureBegin = useCallback(() => {
    setHasSignature(true);
  }, []);

  const isSaveDisabled = !hasSignature || (useTypedSignature && !typedName.trim());

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
          Please sign in the box below or type your name. Your signature will be saved to the
          document.
        </p>

        {/* Signature Method Toggle */}
        <div className="flex gap-4 mb-4" role="radiogroup" aria-label="Signature method">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="signatureMethod"
              checked={!useTypedSignature}
              onChange={() => setUseTypedSignature(false)}
              className="w-4 h-4 text-black focus:ring-2 focus:ring-black focus:ring-offset-2"
            />
            <span className="text-sm">Draw signature</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="signatureMethod"
              checked={useTypedSignature}
              onChange={() => setUseTypedSignature(true)}
              className="w-4 h-4 text-black focus:ring-2 focus:ring-black focus:ring-offset-2"
            />
            <span className="text-sm">Type name</span>
          </label>
        </div>

        {/* Signature Canvas */}
        {!useTypedSignature ? (
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
        ) : (
          <Input
            label="Type your full name"
            placeholder="John Doe"
            inputType="text"
            value={typedName}
            onChange={(e) => {
              setTypedName(e.target.value);
              setHasSignature(e.target.value.trim().length > 0);
            }}
            aria-label="Type your full name as signature"
          />
        )}

        {/* Signature Preview */}
        {signatureDataUrl && signatureDataUrl.length > 0 && (
          <div className="border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-2">Captured Signature:</p>
            {signatureDataUrl.startsWith('text:') ? (
              <p className="text-xl font-medium text-gray-800">
                {signatureDataUrl.replace('text:', '')}
              </p>
            ) : (
              <img
                src={signatureDataUrl}
                alt="Captured signature"
                className="max-h-24"
              />
            )}
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
            disabled={!hasSignature}
          >
            Clear
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            type="button"
            disabled={isSaveDisabled}
          >
            Save Signature
          </Button>
        </div>
      </div>
    </Modal>
  );
};

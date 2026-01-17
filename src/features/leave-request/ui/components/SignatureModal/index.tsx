import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SignatureCanvas from 'react-signature-canvas';

import { Button, Input, Modal } from '../../../../../shared/ui';
import { useLeaveRequestStore } from '../../../state/leaveRequest.store';

const CANVAS_HEIGHT = 200;
const SIGNATURE_SCALE_WIDTH = 1.8;
const SIGNATURE_SCALE_HEIGHT = 1.5;

const scaleSignatureDataUrl = (
  dataUrl: string,
  scaleX: number,
  scaleY: number
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      canvas.width = img.width * scaleX;
      canvas.height = img.height * scaleY;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const scaledDataUrl = canvas.toDataURL('image/png');
      resolve(scaledDataUrl);
    };
    img.onerror = () => reject(new Error('Failed to load signature image'));
    img.src = dataUrl;
  });
};

export const SignatureModal: React.FC = () => {
  const { t } = useTranslation('forms') as {
    t: (key: string, options?: Record<string, unknown>) => string;
  };
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

  // Reset state when modal opens - using callback pattern to avoid setState in effect body
  const resetSignatureState = useCallback(() => {
    setHasSignature(false);
    setTypedName('');
    setUseTypedSignature(false);
  }, []);

  // Clear the canvas when modal opens
  useEffect(() => {
    if (isSignatureModalOpen) {
      if (sigCanvas.current) {
        sigCanvas.current.clear();
      }
      hasInitializedRef.current = true;
      // Use queueMicrotask to defer state updates and avoid cascading renders
      queueMicrotask(resetSignatureState);
    } else {
      hasInitializedRef.current = false;
    }
    return undefined;
  }, [isSignatureModalOpen, resetSignatureState]);

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

  const handleSave = useCallback(async () => {
    if (useTypedSignature && typedName.trim()) {
      setSignature({ signatureDataUrl: `text:${typedName.trim()}` });
      toggleSignatureModal();
    } else if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      const dataUrl = sigCanvas.current.toDataURL();
      try {
        const scaledDataUrl = await scaleSignatureDataUrl(
          dataUrl,
          SIGNATURE_SCALE_WIDTH,
          SIGNATURE_SCALE_HEIGHT
        );
        setSignature({ signatureDataUrl: scaledDataUrl });
        toggleSignatureModal();
      } catch (error) {
        console.error('Failed to scale signature:', error);
        setSignature({ signatureDataUrl: dataUrl });
        toggleSignatureModal();
      }
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
      title={t('signature.heading')}
      closeOnBackdropClick={false}
      showCloseButton={false}
    >
      <div className="space-y-4">
        <p className="text-sm text-[color:var(--color-text-secondary)]">
          {t('signature.description')}
        </p>

        {/* Signature Method Toggle */}
        <div
          className="flex gap-4 mb-4"
          role="radiogroup"
          aria-label={t('signature.signatureMethodAria')}
        >
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="signatureMethod"
              checked={!useTypedSignature}
              onChange={() => setUseTypedSignature(false)}
              className="w-4 h-4 text-[color:var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)] focus:ring-offset-2 focus:ring-offset-[color:var(--color-background)]"
            />
            <span className="text-sm text-[color:var(--color-text-primary)]">
              {t('signature.drawLabel')}
            </span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="signatureMethod"
              checked={useTypedSignature}
              onChange={() => setUseTypedSignature(true)}
              className="w-4 h-4 text-[color:var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)] focus:ring-offset-2 focus:ring-offset-[color:var(--color-background)]"
            />
            <span className="text-sm text-[color:var(--color-text-primary)]">
              {t('signature.typeLabel')}
            </span>
          </label>
        </div>

        {/* Signature Canvas */}
        {!useTypedSignature ? (
          <div className="border-2 border-[color:var(--color-border)] rounded-lg overflow-hidden">
            <SignatureCanvas
              ref={sigCanvas}
              onBegin={handleSignatureBegin}
              canvasProps={{
                className: 'w-full bg-[color:var(--color-surface)] cursor-crosshair',
                style: { height: `${CANVAS_HEIGHT}px` },
              }}
            />
          </div>
        ) : (
          <Input
            label={t('signature.typeNameLabel')}
            placeholder={t('signature.typeNamePlaceholder')}
            inputType="text"
            value={typedName}
            onChange={e => {
              setTypedName(e.target.value);
              setHasSignature(e.target.value.trim().length > 0);
            }}
            aria-label={t('signature.typeNameAria')}
          />
        )}

        {/* Signature Preview */}
        {signatureDataUrl && signatureDataUrl.length > 0 && (
          <div className="border border-[color:var(--color-border)] rounded-lg p-3">
            <p className="text-xs text-[color:var(--color-text-muted)] mb-2">
              {t('signature.capturedLabel')}
            </p>
            {signatureDataUrl.startsWith('text:') ? (
              <p className="text-xl font-medium text-[color:var(--color-text-primary)]">
                {signatureDataUrl.replace('text:', '')}
              </p>
            ) : (
              <img src={signatureDataUrl} alt={t('signature.capturedAlt')} className="max-h-24" />
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pt-4">
          <Button variant="secondary" onClick={handleCancel} type="button">
            {t('signature.cancel')}
          </Button>
          <Button variant="secondary" onClick={handleClear} type="button" disabled={!hasSignature}>
            {t('signature.clear')}
          </Button>
          <Button variant="primary" onClick={handleSave} type="button" disabled={isSaveDisabled}>
            {t('signature.save')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};


import React from 'react';
import { componentLoggers } from '../utils/logger';

export type GaslightAction = 'submit' | 'cancel' | 'reset' | 'noop';

export interface GaslightButtonDef {
  label: string; // displayed label (misleading)
  actualAction: GaslightAction; // what it actually does
}

export interface SemanticGaslightingProps {
  buttons: GaslightButtonDef[];
  onSubmit?: () => void;
  onCancel?: () => void;
  onReset?: () => void;
  onAction?: (def: GaslightButtonDef) => void;
}

export const SemanticGaslighting: React.FC<SemanticGaslightingProps> = ({
  buttons,
  onSubmit,
  onCancel,
  onReset,
  onAction,
}) => {
  const logger = React.useMemo(() => componentLoggers.semanticGaslighting, []);

  const doAction = (def: GaslightButtonDef) => () => {
    logger.info(`Button '${def.label}' executed action: ${def.actualAction}`);
    onAction?.(def);
    switch (def.actualAction) {
      case 'submit':
        onSubmit?.();
        break;
      case 'cancel':
        onCancel?.();
        break;
      case 'reset':
        onReset?.();
        break;
      default:
        break;
    }
  };

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {buttons.map((b, i) => (
        <button
          key={`${b.label}-${i}`}
          type="button"
          onClick={doAction(b)}
          style={{ background: '#3b82f6', color: '#fff', border: '1px solid #0f172a', padding: '8px 12px' }}
        >
          {b.label}
        </button>
      ))}
    </div>
  );
};


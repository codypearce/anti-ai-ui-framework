import React from 'react';
import { componentLoggers } from '../utils/logger';

export type GaslightAction = 'submit' | 'cancel' | 'reset' | 'noop';

export interface GaslightButtonDef {
  label: string; // displayed label (misleading)
  actualAction: GaslightAction; // what it actually does
}

/**
 * Props passed to renderButton function
 */
export interface RenderButtonProps {
  /** The button definition (label and actualAction) */
  button: GaslightButtonDef;
  /** Click handler that triggers the actual action */
  onClick: () => void;
  /** Index of this button in the array */
  index: number;
  /** Default styles for the button */
  style: React.CSSProperties;
}

export interface SemanticGaslightingProps {
  buttons: GaslightButtonDef[];
  onSubmit?: () => void;
  onCancel?: () => void;
  onReset?: () => void;
  onAction?: (def: GaslightButtonDef) => void;
  /**
   * Custom render function for buttons
   */
  renderButton?: (props: RenderButtonProps) => React.ReactNode;
  /**
   * Custom className for the container
   */
  className?: string;
  /**
   * Custom styles for the container
   */
  style?: React.CSSProperties;
}

export const SemanticGaslighting: React.FC<SemanticGaslightingProps> = ({
  buttons,
  onSubmit,
  onCancel,
  onReset,
  onAction,
  renderButton,
  className,
  style,
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

  const defaultButtonStyle: React.CSSProperties = {
    background: '#3b82f6',
    color: '#fff',
    border: '1px solid #0f172a',
    padding: '8px 12px',
    cursor: 'pointer',
  };

  const defaultRenderButton = ({ button, onClick, style: buttonStyle }: RenderButtonProps) => (
    <button type="button" onClick={onClick} style={buttonStyle}>
      {button.label}
    </button>
  );

  const buttonRenderer = renderButton ?? defaultRenderButton;

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    ...style,
  };

  return (
    <div className={className} style={containerStyle}>
      {buttons.map((b, i) => (
        <React.Fragment key={`${b.label}-${i}`}>
          {buttonRenderer({
            button: b,
            onClick: doAction(b),
            index: i,
            style: defaultButtonStyle,
          })}
        </React.Fragment>
      ))}
    </div>
  );
};


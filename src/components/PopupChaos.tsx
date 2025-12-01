import React from 'react';
import { usePopupChaos, PopupData } from '../hooks/usePopupChaos';

/**
 * Props passed to renderPopup function
 */
export interface RenderPopupProps {
  /** The popup data (id, position, zIndex) */
  popup: PopupData;
  /** Function to close this popup */
  closePopup: () => void;
  /** Default styles for the popup (position already applied) */
  style: React.CSSProperties;
}

export interface PopupChaosProps {
  popupCount?: number;
  onAllClosed?: () => void;
  /**
   * Custom render function for each popup
   */
  renderPopup?: (props: RenderPopupProps) => React.ReactNode;
  /**
   * @deprecated Use renderPopup instead
   */
  children?: (popup: PopupData, closePopup: () => void) => React.ReactNode;
  /**
   * If true, popups are contained within a relative container instead of fixed to viewport.
   * Default: false (popups appear fixed on the page)
   */
  contained?: boolean;
  /**
   * Custom style for the container element
   */
  containerStyle?: React.CSSProperties;
  /**
   * Custom className for the container element
   */
  containerClassName?: string;
}

export const PopupChaos: React.FC<PopupChaosProps> = ({
  popupCount = 4,
  onAllClosed,
  renderPopup,
  children,
  contained = false,
  containerStyle,
  containerClassName,
}) => {
  const { popups, closePopup } = usePopupChaos({
    popupCount,
    onAllClosed,
  });

  if (popups.length === 0) return null;

  const hasCustomRender = renderPopup || children;

  // Container styles based on contained prop
  const defaultContainerStyle: React.CSSProperties = contained
    ? {
        position: 'relative',
        width: '100%',
        minHeight: '300px',
        overflow: 'hidden',
        ...containerStyle,
      }
    : {
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9998,
        ...containerStyle,
      };

  // Convert pixel positions to percentages when contained
  const getPosition = (popup: PopupData) => {
    if (contained) {
      // Scale positions to fit within container (assume max left: 340, max top: 160 from hook)
      // Convert to percentages: left 0-60%, top 0-40%
      const leftPercent = (popup.left / 340) * 60;
      const topPercent = (popup.top / 160) * 40;
      return {
        left: `${leftPercent}%`,
        top: `${topPercent}%`,
      };
    }
    return {
      left: popup.left,
      top: popup.top,
    };
  };

  // Default render if no custom render function provided
  if (!hasCustomRender) {
    return (
      <div style={defaultContainerStyle} className={containerClassName}>
        {popups.map((p) => {
          const position = getPosition(p);
          return (
            <div
              key={p.id}
              style={{
                position: 'absolute',
                left: position.left,
                top: position.top,
                zIndex: p.zIndex,
                width: 280,
                maxWidth: contained ? '45%' : undefined,
                pointerEvents: 'auto',
                background: '#fff',
                color: '#0f172a',
                border: '1px solid #e2e8f0',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                borderRadius: 8,
              }}
            >
              <div style={{ padding: 8, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>Important Notice #{p.id + 1}</strong>
                <button type="button" onClick={() => closePopup(p.id)}>✕</button>
              </div>
              <div style={{ padding: 10 }}>
                <p style={{ margin: 0 }}>Please read and acknowledge this modal to continue.</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Helper to get default popup style
  const getPopupStyle = (popup: PopupData, position: { left: string | number; top: string | number }): React.CSSProperties => ({
    position: 'absolute',
    left: position.left,
    top: position.top,
    zIndex: popup.zIndex,
    width: 280,
    maxWidth: contained ? '45%' : undefined,
    pointerEvents: 'auto',
    background: '#fff',
    color: '#0f172a',
    border: '1px solid #e2e8f0',
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    borderRadius: 8,
  });

  // Handle renderPopup (new API) vs children (deprecated API)
  const renderWithProps = (popup: PopupData, position: { left: string | number; top: string | number }) => {
    const style = getPopupStyle(popup, position);
    const close = () => closePopup(popup.id);

    if (renderPopup) {
      // New API: pass props object
      return renderPopup({ popup, closePopup: close, style });
    } else if (children) {
      // Deprecated API: pass separate arguments
      const modifiedPopup = { ...popup, left: position.left, top: position.top };
      return children(modifiedPopup as PopupData, close);
    }
    return null;
  };

  // Custom render - wrap in container if contained mode
  if (contained) {
    return (
      <div style={defaultContainerStyle} className={containerClassName}>
        {popups.map((p) => {
          const position = getPosition(p);
          return (
            <React.Fragment key={p.id}>
              {renderWithProps(p, position)}
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  // Custom render - no container wrapper
  return (
    <>
      {popups.map((p) => (
        <React.Fragment key={p.id}>
          {renderWithProps(p, getPosition(p))}
        </React.Fragment>
      ))}
    </>
  );
};


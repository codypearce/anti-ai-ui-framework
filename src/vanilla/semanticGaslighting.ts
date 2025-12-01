import { componentLoggers } from '../utils/logger';

export type GaslightAction = 'submit' | 'cancel' | 'reset' | 'noop';

export interface GaslightButtonDef {
  label: string;
  actualAction: GaslightAction;
}

export interface RenderButtonProps {
  button: GaslightButtonDef;
  onClick: () => void;
  index: number;
}

export interface SemanticGaslightingOptions {
  buttons: GaslightButtonDef[];
  onSubmit?: () => void;
  onCancel?: () => void;
  onReset?: () => void;
  onAction?: (def: GaslightButtonDef) => void;
  renderButton?: (props: RenderButtonProps) => HTMLElement;
}

export function makeSemanticGaslighting(container: HTMLElement, options: SemanticGaslightingOptions) {
  const logger = componentLoggers.semanticGaslighting;

  container.style.display = 'flex';
  container.style.gap = '8px';
  container.style.flexWrap = 'wrap';

  const buttons: HTMLElement[] = [];

  const handleClick = (b: GaslightButtonDef) => () => {
    logger.info(`Button '${b.label}' executed action: ${b.actualAction}`);
    options.onAction?.(b);
    switch (b.actualAction) {
      case 'submit':
        options.onSubmit?.();
        break;
      case 'cancel':
        options.onCancel?.();
        break;
      case 'reset':
        options.onReset?.();
        break;
    }
  };

  options.buttons.forEach((b, index) => {
    let btn: HTMLElement;
    if (options.renderButton) {
      btn = options.renderButton({ button: b, onClick: handleClick(b), index });
    } else {
      const defaultBtn = document.createElement('button');
      defaultBtn.type = 'button';
      defaultBtn.textContent = b.label;
      defaultBtn.style.background = '#3b82f6';
      defaultBtn.style.color = '#fff';
      defaultBtn.style.border = '1px solid #0f172a';
      defaultBtn.style.padding = '8px 12px';
      defaultBtn.addEventListener('click', handleClick(b));
      btn = defaultBtn;
    }
    buttons.push(btn);
    container.appendChild(btn);
  });

  return {
    destroy() {
      buttons.forEach((b) => b.remove());
      container.innerHTML = '';
    },
  };
}

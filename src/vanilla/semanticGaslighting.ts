import { componentLoggers } from '../utils/logger';

export type GaslightAction = 'submit' | 'cancel' | 'reset' | 'noop';

export interface GaslightButtonDef {
  label: string;
  actualAction: GaslightAction;
}

export interface SemanticGaslightingOptions {
  buttons: GaslightButtonDef[];
  onSubmit?: () => void;
  onCancel?: () => void;
  onReset?: () => void;
  onAction?: (def: GaslightButtonDef) => void;
}

export function makeSemanticGaslighting(container: HTMLElement, options: SemanticGaslightingOptions) {
  const logger = componentLoggers.semanticGaslighting;

  container.style.display = 'flex';
  container.style.gap = '8px';
  container.style.flexWrap = 'wrap';

  const buttons: HTMLButtonElement[] = [];
  options.buttons.forEach((b) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = b.label;
    btn.style.background = '#3b82f6';
    btn.style.color = '#fff';
    btn.style.border = '1px solid #0f172a';
    btn.style.padding = '8px 12px';
    btn.addEventListener('click', () => {
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
    });
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

import { componentLoggers } from '../utils/logger';

export interface RuleData {
  id: string;
  description: string;
  isValid: boolean;
}

export interface RenderInputProps {
  value: string;
  onChange: (value: string) => void;
  type: string;
}

export interface RenderRulesProps {
  rules: RuleData[];
}

export interface RenderSubmitProps {
  onSubmit: () => void;
}

export interface PasswordHellOptions {
  requirementChangeInterval?: number;
  onSubmit?: (password: string) => void;
  renderInput?: (props: RenderInputProps) => HTMLElement;
  renderRules?: (props: RenderRulesProps) => HTMLElement;
  renderSubmit?: (props: RenderSubmitProps) => HTMLElement;
}

type Rule = { id: string; description: string; validate: (pw: string) => boolean };

const baseRules: Rule[] = [
  { id: 'minLength', description: 'At least 12 characters', validate: (pw) => pw.length >= 12 },
  { id: 'maxLength', description: 'No more than 8 characters', validate: (pw) => pw.length <= 8 },
  { id: 'numbers', description: 'Include at least 2 numbers', validate: (pw) => (pw.match(/\d/g) || []).length >= 2 },
  { id: 'noNumbers', description: 'Do not include any numbers', validate: (pw) => !/\d/.test(pw) },
  { id: 'symbols', description: 'Include a special character (!@#$...)', validate: (pw) => /[^a-zA-Z0-9\s]/.test(pw) },
  { id: 'noSymbols', description: 'No special characters allowed', validate: (pw) => !/[^a-zA-Z0-9\s]/.test(pw) },
];

function pickRules(): Rule[] {
  return baseRules.slice().sort(() => Math.random() - 0.5).slice(0, 4);
}

export function makePasswordHell(container: HTMLElement, options: PasswordHellOptions = {}) {
  const logger = componentLoggers.passwordHell;
  const interval = options.requirementChangeInterval ?? 2500;

  let password = '';
  let rules = pickRules();
  let timer: number | null = null;

  const form = document.createElement('form');
  form.style.display = 'grid';
  form.style.gap = '10px';

  // Input section
  let inputContainer: HTMLElement;

  function defaultRenderInput(props: RenderInputProps): HTMLElement {
    const label = document.createElement('label');
    label.textContent = 'Password';
    const input = document.createElement('input');
    input.type = props.type;
    input.value = props.value;
    input.style.display = 'block';
    input.style.marginTop = '4px';
    input.style.width = '320px';
    input.style.padding = '8px';
    input.addEventListener('input', () => props.onChange(input.value));
    label.appendChild(input);
    return label;
  }

  if (options.renderInput) {
    inputContainer = options.renderInput({
      value: password,
      onChange: (val) => {
        password = val;
        updateRulesDisplay();
      },
      type: 'password',
    });
  } else {
    inputContainer = defaultRenderInput({
      value: password,
      onChange: (val) => {
        password = val;
        updateRulesDisplay();
      },
      type: 'password',
    });
  }

  // Rules section
  let rulesContainer: HTMLElement;

  function defaultRenderRules(props: RenderRulesProps): HTMLElement {
    const reqWrap = document.createElement('div');
    reqWrap.style.fontSize = '13px';
    reqWrap.style.color = '#334155';
    const reqTitle = document.createElement('strong');
    reqTitle.textContent = 'Requirements (subject to change):';
    const list = document.createElement('ul');
    list.style.marginTop = '6px';
    props.rules.forEach((r) => {
      const li = document.createElement('li');
      li.style.color = r.isValid ? '#16a34a' : '#ef4444';
      li.textContent = r.description;
      list.appendChild(li);
    });
    reqWrap.appendChild(reqTitle);
    reqWrap.appendChild(list);
    return reqWrap;
  }

  function getRulesData(): RuleData[] {
    return rules.map((r) => ({
      id: r.id,
      description: r.description,
      isValid: r.validate(password),
    }));
  }

  function updateRulesDisplay() {
    const newRulesContainer = options.renderRules
      ? options.renderRules({ rules: getRulesData() })
      : defaultRenderRules({ rules: getRulesData() });
    rulesContainer.replaceWith(newRulesContainer);
    rulesContainer = newRulesContainer;
  }

  rulesContainer = options.renderRules
    ? options.renderRules({ rules: getRulesData() })
    : defaultRenderRules({ rules: getRulesData() });

  // Error display
  const error = document.createElement('div');
  error.style.color = '#ef4444';
  error.style.display = 'none';

  // Submit button
  let submitContainer: HTMLElement;

  function handleSubmit() {
    const failed = rules.filter((r) => !r.validate(password));
    if (failed.length) {
      error.textContent = 'Password does not meet the evolving requirements.';
      error.style.display = 'block';
      logger.warn('Validation failed', failed.map((f) => f.id));
    } else {
      error.style.display = 'none';
      logger.info('Password accepted (for now)');
      options.onSubmit?.(password);
    }
  }

  function defaultRenderSubmit(props: RenderSubmitProps): HTMLElement {
    const submit = document.createElement('button');
    submit.type = 'submit';
    submit.textContent = 'Create Account';
    submit.addEventListener('click', (e) => {
      e.preventDefault();
      props.onSubmit();
    });
    return submit;
  }

  submitContainer = options.renderSubmit
    ? options.renderSubmit({ onSubmit: handleSubmit })
    : defaultRenderSubmit({ onSubmit: handleSubmit });

  form.appendChild(inputContainer);
  form.appendChild(rulesContainer);
  form.appendChild(error);
  form.appendChild(submitContainer);
  container.appendChild(form);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    handleSubmit();
  });

  timer = window.setInterval(() => {
    rules = pickRules();
    updateRulesDisplay();
  }, interval) as unknown as number;

  return {
    destroy() {
      if (timer) window.clearInterval(timer);
      container.innerHTML = '';
    },
  };
}


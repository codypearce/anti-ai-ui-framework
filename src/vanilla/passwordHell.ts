import { componentLoggers } from '../utils/logger';

export interface PasswordHellOptions {
  requirementChangeInterval?: number;
  onSubmit?: (password: string) => void;
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

  const label = document.createElement('label');
  label.textContent = 'Password';
  const input = document.createElement('input');
  input.type = 'password';
  input.style.display = 'block';
  input.style.marginTop = '4px';
  input.style.width = '320px';
  input.style.padding = '8px';
  label.appendChild(input);

  const reqWrap = document.createElement('div');
  reqWrap.style.fontSize = '13px';
  reqWrap.style.color = '#334155';
  const reqTitle = document.createElement('strong');
  reqTitle.textContent = 'Requirements (subject to change):';
  const list = document.createElement('ul');
  list.style.marginTop = '6px';
  reqWrap.appendChild(reqTitle);
  reqWrap.appendChild(list);

  const error = document.createElement('div');
  error.style.color = '#ef4444';
  error.style.display = 'none';

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.textContent = 'Create Account';

  form.appendChild(label);
  form.appendChild(reqWrap);
  form.appendChild(error);
  form.appendChild(submit);
  container.appendChild(form);

  function renderRules() {
    list.innerHTML = '';
    rules.forEach((r) => {
      const li = document.createElement('li');
      const ok = r.validate(password);
      li.style.color = ok ? '#16a34a' : '#ef4444';
      li.textContent = r.description;
      list.appendChild(li);
    });
  }
  renderRules();

  input.addEventListener('input', () => {
    password = input.value;
    renderRules();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
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
  });

  timer = window.setInterval(() => {
    rules = pickRules();
    renderRules();
  }, interval) as unknown as number;

  return {
    destroy() {
      if (timer) window.clearInterval(timer);
      container.innerHTML = '';
    },
  };
}


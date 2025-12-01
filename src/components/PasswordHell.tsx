import React, { useEffect, useMemo, useRef, useState } from 'react';
import { componentLoggers } from '../utils/logger';

/**
 * Props passed to the renderInput function
 */
export interface RenderInputProps {
  value: string;
  onChange: (value: string) => void;
  type: string;
}

/**
 * Rule status for rendering
 */
export interface RuleStatus {
  id: string;
  description: string;
  isValid: boolean;
}

/**
 * Props passed to the renderRules function
 */
export interface RenderRulesProps {
  rules: RuleStatus[];
}

/**
 * Props passed to the renderSubmit function
 */
export interface RenderSubmitProps {
  onSubmit: () => void;
  disabled?: boolean;
}

export interface PasswordHellProps {
  requirementChangeInterval?: number; // ms
  onSubmit?: (password: string) => void;
  // For testing: provide a fixed rule set and freeze rotation
  rules?: Array<{ id: string; description: string | (() => string); validate: (pw: string) => boolean }>;
  freezeRules?: boolean;
  /**
   * Custom render function for the password input
   */
  renderInput?: (props: RenderInputProps) => React.ReactNode;
  /**
   * Custom render function for the requirements list
   */
  renderRules?: (props: RenderRulesProps) => React.ReactNode;
  /**
   * Custom render function for the submit button
   */
  renderSubmit?: (props: RenderSubmitProps) => React.ReactNode;
  /**
   * CSS class for the form container
   */
  className?: string;
  /**
   * Inline styles for the form container
   */
  style?: React.CSSProperties;
}

type Rule = {
  id: string;
  description: (contradict?: boolean) => string;
  validate: (pw: string) => boolean;
  contradictoryTo?: string; // id of a rule it can conflict with
};

const baseRules: Rule[] = [
  {
    id: 'minLength',
    description: () => 'At least 12 characters',
    validate: (pw) => pw.length >= 12,
  },
  {
    id: 'maxLength',
    description: () => 'No more than 8 characters',
    validate: (pw) => pw.length <= 8,
    contradictoryTo: 'minLength',
  },
  {
    id: 'numbers',
    description: () => 'Include at least 2 numbers',
    validate: (pw) => (pw.match(/\d/g) || []).length >= 2,
  },
  {
    id: 'noNumbers',
    description: () => 'Do not include any numbers',
    validate: (pw) => !/\d/.test(pw),
    contradictoryTo: 'numbers',
  },
  {
    id: 'symbols',
    description: () => 'Include a special character (!@#$...)',
    validate: (pw) => /[^a-zA-Z0-9\s]/.test(pw),
  },
  {
    id: 'noSymbols',
    description: () => 'No special characters allowed',
    validate: (pw) => !/[^a-zA-Z0-9\s]/.test(pw),
    contradictoryTo: 'symbols',
  },
];

function pickChaoticRules(): Rule[] {
  // Pick 3–4 rules with potential contradictions
  const pool = baseRules.slice().sort(() => Math.random() - 0.5);
  return pool.slice(0, 4);
}

export const PasswordHell: React.FC<PasswordHellProps> = ({
  requirementChangeInterval = 2500,
  onSubmit,
  rules: rulesProp,
  freezeRules = false,
  renderInput,
  renderRules,
  renderSubmit,
  className,
  style,
}) => {
  const logger = useMemo(() => componentLoggers.passwordHell, []);
  const [password, setPassword] = useState('');
  const [rules, setRules] = useState<Rule[]>(() =>
    rulesProp
      ? rulesProp.map((r) => ({
          id: r.id,
          description: typeof r.description === 'function' ? r.description : () => String(r.description),
          validate: r.validate,
        }))
      : pickChaoticRules()
  );
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  // Update when provided rules change
  useEffect(() => {
    if (rulesProp) {
      setRules(
        rulesProp.map((r) => ({
          id: r.id,
          description: typeof r.description === 'function' ? r.description : () => String(r.description),
          validate: r.validate,
        }))
      );
    }
  }, [rulesProp]);

  // Periodically rotate rules unless frozen or externally provided
  useEffect(() => {
    if (freezeRules || rulesProp) return;
    timerRef.current = window.setInterval(() => {
      setRules(pickChaoticRules());
    }, requirementChangeInterval) as unknown as number;
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [freezeRules, requirementChangeInterval, rulesProp]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate against currently displayed chaotic rules
    const failed = rules.filter((r) => !r.validate(password));
    if (failed.length > 0) {
      setError('Password does not meet the current, evolving requirements.');
      logger.warn('Validation failed', failed.map((f) => f.id));
      return;
    }
    setError(null);
    logger.info('Password accepted (for now)');
    onSubmit?.(password);
  };

  // Prepare rule statuses for rendering
  const ruleStatuses: RuleStatus[] = rules.map((r) => ({
    id: r.id,
    description: r.description(),
    isValid: r.validate(password),
  }));

  // Default renderers
  const defaultRenderInput = ({ value, onChange, type }: RenderInputProps) => (
    <label>
      Password
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ display: 'block', marginTop: 4, width: 320, padding: '8px' }}
      />
    </label>
  );

  const defaultRenderRules = ({ rules: ruleList }: RenderRulesProps) => (
    <div style={{ fontSize: 13, color: '#334155' }}>
      <strong>Requirements (subject to change):</strong>
      <ul style={{ marginTop: 6 }}>
        {ruleList.map((r) => (
          <li key={r.id} style={{ color: r.isValid ? '#16a34a' : '#ef4444' }}>
            {r.description}
          </li>
        ))}
      </ul>
    </div>
  );

  const defaultRenderSubmit = ({ onSubmit: handleClick }: RenderSubmitProps) => (
    <div>
      <button type="button" onClick={handleClick}>Create Account</button>
    </div>
  );

  const inputRenderer = renderInput ?? defaultRenderInput;
  const rulesRenderer = renderRules ?? defaultRenderRules;
  const submitRenderer = renderSubmit ?? defaultRenderSubmit;

  return (
    <form onSubmit={handleSubmit} className={className} style={{ display: 'grid', gap: 10, ...style }}>
      {inputRenderer({
        value: password,
        onChange: setPassword,
        type: 'password',
      })}
      {rulesRenderer({ rules: ruleStatuses })}
      {error && <div style={{ color: '#ef4444' }}>{error}</div>}
      {submitRenderer({
        onSubmit: () => handleSubmit({ preventDefault: () => {} } as React.FormEvent),
      })}
    </form>
  );
};

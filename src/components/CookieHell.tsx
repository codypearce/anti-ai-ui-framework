import React, { useMemo, useState } from 'react';
import { componentLoggers } from '../utils/logger';

/**
 * Props passed to renderAcceptButton
 */
export interface RenderAcceptButtonProps {
  onClick: () => void;
}

/**
 * Props passed to renderSaveButton
 */
export interface RenderSaveButtonProps {
  onClick: () => void;
}

/**
 * Props passed to renderCategory
 */
export interface RenderCategoryProps {
  category: {
    name: string;
    description: string;
    required?: boolean;
    enabled: boolean;
    partners: Array<{ name: string; purpose: string; enabled: boolean }>;
  };
  index: number;
  isExpanded: boolean;
  showDisableHint: boolean;
  onToggleExpand: () => void;
  onToggleCategory: (enabled: boolean) => void;
  onTogglePartner: (partnerIndex: number, enabled: boolean) => void;
}

export interface CookieHellProps {
  categoryCount?: number;
  partnersPerCategory?: number;
  rejectButtonSize?: number;
  randomReEnable?: boolean;
  onAcceptAll?: () => void;
  onSavePreferences?: (allDisabled: boolean) => void;
  /**
   * Custom render function for the Accept All button
   */
  renderAcceptButton?: (props: RenderAcceptButtonProps) => React.ReactNode;
  /**
   * Custom render function for the Save Preferences button
   */
  renderSaveButton?: (props: RenderSaveButtonProps) => React.ReactNode;
  /**
   * Custom render function for each category
   */
  renderCategory?: (props: RenderCategoryProps) => React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

interface Partner {
  name: string;
  purpose: string;
  enabled: boolean;
}

interface Category {
  name: string;
  description: string;
  required?: boolean;
  enabled: boolean;
  partners: Partner[];
}

const PARTNER_NAMES = [
  'Google Ads', 'Facebook Pixel', 'Amazon Advertising', 'Microsoft Clarity',
  'TikTok Analytics', 'Criteo', 'The Trade Desk', 'Adobe Analytics',
  'Salesforce DMP', 'Oracle BlueKai', 'LiveRamp', 'Taboola',
  'Outbrain', 'AppNexus', 'MediaMath', 'Rubicon Project',
  'PubMatic', 'OpenX', 'Index Exchange', 'Magnite',
  'Quantcast', 'Nielsen', 'Comscore', 'DoubleVerify',
  'Integral Ad Science', 'MOAT Analytics', 'Sizmek', 'Flashtalking',
  'Innovid', 'Extreme Reach', 'Pixability', 'Channel Factory',
  'Zefr', 'Oracle Moat', 'Adjust', 'AppsFlyer',
  'Branch', 'Kochava', 'Singular', 'Tenjin',
  'ironSource', 'Unity Ads', 'Vungle', 'AdColony',
  'Chartboost', 'InMobi', 'Fyber', 'Tapjoy'
];

const PURPOSES = [
  'Personalized advertising', 'Cross-device tracking', 'Audience measurement',
  'Content personalization', 'Ad delivery', 'Analytics & insights',
  'Social media integration', 'Fraud prevention', 'Market research',
  'Retargeting', 'Lookalike audiences', 'Attribution modeling'
];

const CATEGORY_DEFS = [
  { name: 'Strictly Necessary', description: 'Required for the website to function. Cannot be disabled.', required: true },
  { name: 'Performance & Analytics', description: 'Help us understand how visitors interact with our website.' },
  { name: 'Functional', description: 'Enable enhanced functionality and personalization.' },
  { name: 'Targeting & Advertising', description: 'Used to deliver relevant ads and track ad campaign performance.' },
  { name: 'Social Media', description: 'Enable sharing and integration with social platforms.' },
  { name: 'Third-Party Partners', description: 'Our trusted partners who help deliver personalized experiences.' },
];

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function buildCategories(categoryCount: number, partnersPerCategory: number): Category[] {
  const shuffledPartners = shuffleArray(PARTNER_NAMES);
  const shuffledPurposes = shuffleArray(PURPOSES);
  let partnerIndex = 0;

  return CATEGORY_DEFS.slice(0, categoryCount).map((cat) => ({
    name: cat.name,
    description: cat.description,
    required: cat.required,
    enabled: true,
    partners: Array.from({ length: partnersPerCategory }, () => {
      const partner = shuffledPartners[partnerIndex % shuffledPartners.length];
      const purpose = shuffledPurposes[partnerIndex % shuffledPurposes.length];
      partnerIndex++;
      return { name: partner, purpose, enabled: true };
    })
  }));
}

export const CookieHell: React.FC<CookieHellProps> = ({
  categoryCount = 5,
  partnersPerCategory = 8,
  rejectButtonSize = 16,
  randomReEnable = false,
  onAcceptAll,
  onSavePreferences,
  renderAcceptButton,
  renderSaveButton,
  renderCategory,
  className,
  style,
}) => {
  const logger = useMemo(() => componentLoggers.cookieHell, []);
  const [categories, setCategories] = useState<Category[]>(() =>
    buildCategories(categoryCount, partnersPerCategory)
  );
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [disableHintCategory, setDisableHintCategory] = useState<number | null>(null);
  const [globalHint, setGlobalHint] = useState<string | null>(null);

  const toggleCategory = (catIdx: number, enabled: boolean) => {
    const cat = categories[catIdx];
    if (cat.required) return;

    // Category toggle only enables all, never disables - user must click each partner individually
    if (!enabled) {
      // Show hint that they need to disable partners individually
      setDisableHintCategory(catIdx);
      setExpandedCategories(prev => new Set(prev).add(catIdx));
      setGlobalHint('Please manually uncheck each partner to ensure data accuracy');
      setTimeout(() => {
        setDisableHintCategory(null);
        setGlobalHint(null);
      }, 4000);
      return;
    }

    // Enabling is fine - turn everything on
    setCategories(prev => prev.map((c, i) =>
      i === catIdx ? { ...c, enabled: true, partners: c.partners.map(p => ({ ...p, enabled: true })) } : c
    ));
  };

  const togglePartner = (catIdx: number, partnerIdx: number, enabled: boolean) => {
    const cat = categories[catIdx];
    if (cat.required) return;

    // Random chance to re-enable
    if (randomReEnable && !enabled && Math.random() > 0.5) {
      setTimeout(() => {
        setCategories(prev => prev.map((c, i) =>
          i === catIdx ? {
            ...c,
            partners: c.partners.map((p, j) => j === partnerIdx ? { ...p, enabled: true } : p)
          } : c
        ));
      }, 200 + Math.random() * 500);
    }

    setCategories(prev => prev.map((c, i) =>
      i === catIdx ? {
        ...c,
        partners: c.partners.map((p, j) => j === partnerIdx ? { ...p, enabled } : p)
      } : c
    ));
  };

  const handleAcceptAll = () => {
    logger.info('Accept all');
    onAcceptAll?.();
  };

  const handleSavePreferences = () => {
    logger.info('Save preferences clicked');

    // Check if user actually disabled all non-required partners
    const allDisabled = categories.every(cat =>
      cat.required || cat.partners.every(p => !p.enabled)
    );

    if (allDisabled) {
      // They did it! Respect their choice
      onSavePreferences?.(true);
    } else {
      // Not done yet - randomly re-enable some toggles if enabled
      if (randomReEnable) {
        setCategories(prev => prev.map(cat => {
          if (cat.required) return cat;
          if (Math.random() > 0.4) {
            return {
              ...cat,
              partners: cat.partners.map(p => ({
                ...p,
                enabled: Math.random() > 0.3 ? true : p.enabled
              }))
            };
          }
          return cat;
        }));
      }
      onSavePreferences?.(false);
    }
  };

  const toggleExpand = (idx: number) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  // Default renderers
  const defaultRenderAcceptButton = ({ onClick }: RenderAcceptButtonProps) => (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        padding: '14px 20px',
        fontSize: '15px',
        fontWeight: 700,
        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        marginBottom: '12px',
        boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
      }}
    >
      Accept All Cookies
    </button>
  );

  const defaultRenderSaveButton = ({ onClick }: RenderSaveButtonProps) => (
    <button
      onClick={onClick}
      style={{
        background: '#f1f5f9',
        border: '1px solid #e2e8f0',
        borderRadius: '4px',
        padding: `${rejectButtonSize / 4}px ${rejectButtonSize / 2}px`,
        fontSize: `${Math.max(8, rejectButtonSize / 2)}px`,
        color: '#64748b',
        cursor: 'pointer'
      }}
    >
      Save preferences
    </button>
  );

  const defaultRenderCategory = ({
    category: cat,
    index: _catIdx,
    isExpanded,
    showDisableHint,
    onToggleExpand,
    onToggleCategory: handleCategoryToggle,
    onTogglePartner: handlePartnerToggle,
  }: RenderCategoryProps) => (
    <div
      style={{
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        overflow: 'hidden',
        background: '#fff'
      }}
    >
      {/* Category header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0'
        }}
      >
        {/* Toggle switch */}
        <label style={{ position: 'relative', width: '44px', height: '24px', flexShrink: 0 }}>
          <input
            type="checkbox"
            checked={cat.enabled}
            disabled={cat.required}
            onChange={(e) => handleCategoryToggle(e.target.checked)}
            style={{ opacity: 0, width: 0, height: 0 }}
          />
          <span
            style={{
              position: 'absolute',
              inset: 0,
              background: cat.enabled ? '#22c55e' : '#cbd5e1',
              borderRadius: '24px',
              transition: 'background 0.2s',
              cursor: cat.required ? 'not-allowed' : 'pointer'
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: '2px',
                left: cat.enabled ? '22px' : '2px',
                width: '20px',
                height: '20px',
                background: '#fff',
                borderRadius: '50%',
                transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
              }}
            />
          </span>
        </label>

        {/* Category info */}
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: '14px', color: '#1e293b' }}>
            {cat.name}{cat.required ? ' (Required)' : ''}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
            {cat.description}
          </div>
        </div>

        {/* Expand button */}
        <button
          onClick={onToggleExpand}
          style={{
            background: 'none',
            border: '1px solid #e2e8f0',
            borderRadius: '4px',
            padding: '4px 8px',
            fontSize: '11px',
            color: '#64748b',
            cursor: 'pointer'
          }}
        >
          {isExpanded ? 'Hide partners' : `View ${cat.partners.length} partners`}
        </button>
      </div>

      {/* Disable hint */}
      {showDisableHint && (
        <div style={{
          padding: '8px 12px',
          background: '#fef3c7',
          borderBottom: '1px solid #fcd34d',
          fontSize: '12px',
          color: '#92400e',
        }}>
          To disable, uncheck each partner individually below
        </div>
      )}

      {/* Partners list */}
      {isExpanded && (
        <div style={{ padding: '8px 12px', background: '#fafafa', maxHeight: '200px', overflowY: 'auto' }}>
          {cat.partners.map((partner, pIdx) => (
            <div
              key={pIdx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 0',
                borderBottom: '1px solid #f1f5f9'
              }}
            >
              <input
                type="checkbox"
                checked={partner.enabled}
                disabled={cat.required}
                onChange={(e) => handlePartnerToggle(pIdx, e.target.checked)}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 500, color: '#334155' }}>
                  {partner.name}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                  {partner.purpose}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const acceptButtonRenderer = renderAcceptButton ?? defaultRenderAcceptButton;
  const saveButtonRenderer = renderSaveButton ?? defaultRenderSaveButton;
  const categoryRenderer = renderCategory ?? defaultRenderCategory;

  return (
    <div className={className} style={style}>
      {/* Global hint message */}
      {globalHint && (
        <div style={{
          padding: '12px 16px',
          marginBottom: '12px',
          background: '#fef3c7',
          border: '1px solid #fcd34d',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#92400e',
          textAlign: 'center',
        }}>
          {globalHint}
        </div>
      )}

      {/* Accept All button */}
      {acceptButtonRenderer({ onClick: handleAcceptAll })}

      {/* Categories */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
        {categories.map((cat, catIdx) => (
          <React.Fragment key={catIdx}>
            {categoryRenderer({
              category: cat,
              index: catIdx,
              isExpanded: expandedCategories.has(catIdx),
              showDisableHint: disableHintCategory === catIdx,
              onToggleExpand: () => toggleExpand(catIdx),
              onToggleCategory: (enabled) => toggleCategory(catIdx, enabled),
              onTogglePartner: (pIdx, enabled) => togglePartner(catIdx, pIdx, enabled),
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Bottom row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '8px',
          borderTop: '1px solid #e2e8f0'
        }}
      >
        <span style={{ fontSize: '11px', color: '#94a3b8' }}>
          {categoryCount * partnersPerCategory} partners total
        </span>
        {saveButtonRenderer({ onClick: handleSavePreferences })}
      </div>
    </div>
  );
};

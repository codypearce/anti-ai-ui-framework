export interface CookieHellOptions {
  container: HTMLElement;
  categoryCount?: number;
  partnersPerCategory?: number;
  rejectButtonSize?: number;
  randomReEnable?: boolean;
  onAcceptAll?: () => void;
  onSavePreferences?: (allDisabled: boolean) => void;
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
    enabled: true, // All enabled by default
    partners: Array.from({ length: partnersPerCategory }, () => {
      const partner = shuffledPartners[partnerIndex % shuffledPartners.length];
      const purpose = shuffledPurposes[partnerIndex % shuffledPurposes.length];
      partnerIndex++;
      return { name: partner, purpose, enabled: true };
    })
  }));
}

export function makeCookieHell(options: CookieHellOptions) {
  const categoryCount = options.categoryCount ?? 5;
  const partnersPerCategory = options.partnersPerCategory ?? 8;
  const rejectButtonSize = options.rejectButtonSize ?? 16;
  const randomReEnable = options.randomReEnable ?? false;

  let categories = buildCategories(categoryCount, partnersPerCategory);
  const container = options.container;

  // Main wrapper
  const wrapper = document.createElement('div');

  // Accept All button - big and prominent
  const acceptBtn = document.createElement('button');
  Object.assign(acceptBtn.style, {
    width: '100%',
    padding: '14px 20px',
    fontSize: '15px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '12px',
    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
  });
  acceptBtn.textContent = 'Accept All Cookies';
  acceptBtn.addEventListener('click', () => {
    options.onAcceptAll?.();
  });
  wrapper.appendChild(acceptBtn);

  // Categories container
  const categoriesWrap = document.createElement('div');
  Object.assign(categoriesWrap.style, {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '12px'
  });

  function renderCategories() {
    categoriesWrap.innerHTML = '';

    categories.forEach((cat) => {
      const catBox = document.createElement('div');
      Object.assign(catBox.style, {
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        overflow: 'hidden',
        background: '#fff'
      });

      // Category header
      const header = document.createElement('div');
      Object.assign(header.style, {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px',
        background: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        cursor: 'pointer'
      });

      // Toggle switch for category
      const toggleWrap = document.createElement('label');
      Object.assign(toggleWrap.style, {
        position: 'relative',
        width: '44px',
        height: '24px',
        flexShrink: '0'
      });

      const toggleInput = document.createElement('input');
      toggleInput.type = 'checkbox';
      toggleInput.checked = cat.enabled;
      toggleInput.disabled = cat.required || false;
      Object.assign(toggleInput.style, {
        opacity: '0',
        width: '0',
        height: '0'
      });

      const toggleSlider = document.createElement('span');
      Object.assign(toggleSlider.style, {
        position: 'absolute',
        inset: '0',
        background: cat.enabled ? '#22c55e' : '#cbd5e1',
        borderRadius: '24px',
        transition: 'background 0.2s',
        cursor: cat.required ? 'not-allowed' : 'pointer'
      });

      const toggleKnob = document.createElement('span');
      Object.assign(toggleKnob.style, {
        position: 'absolute',
        top: '2px',
        left: cat.enabled ? '22px' : '2px',
        width: '20px',
        height: '20px',
        background: '#fff',
        borderRadius: '50%',
        transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
      });

      toggleSlider.appendChild(toggleKnob);
      toggleWrap.appendChild(toggleInput);
      toggleWrap.appendChild(toggleSlider);

      toggleInput.addEventListener('change', () => {
        if (cat.required) {
          toggleInput.checked = true;
          return;
        }
        // Category toggle only enables all, never disables - user must click each partner individually
        if (!toggleInput.checked) {
          // Trying to disable? Nope, just re-enable it
          toggleInput.checked = true;
          cat.enabled = true;
          renderCategories();
          return;
        }
        // Enabling is fine - turn everything on
        cat.enabled = true;
        cat.partners.forEach(p => p.enabled = true);
        renderCategories();
      });

      // Category info
      const info = document.createElement('div');
      info.style.flex = '1';

      const catName = document.createElement('div');
      Object.assign(catName.style, { fontWeight: '600', fontSize: '14px', color: '#1e293b' });
      catName.textContent = cat.name + (cat.required ? ' (Required)' : '');

      const catDesc = document.createElement('div');
      Object.assign(catDesc.style, { fontSize: '12px', color: '#64748b', marginTop: '2px' });
      catDesc.textContent = cat.description;

      info.appendChild(catName);
      info.appendChild(catDesc);

      // Expand button
      const expandBtn = document.createElement('button');
      Object.assign(expandBtn.style, {
        background: 'none',
        border: '1px solid #e2e8f0',
        borderRadius: '4px',
        padding: '4px 8px',
        fontSize: '11px',
        color: '#64748b',
        cursor: 'pointer'
      });
      expandBtn.textContent = `View ${cat.partners.length} partners`;

      header.appendChild(toggleWrap);
      header.appendChild(info);
      header.appendChild(expandBtn);
      catBox.appendChild(header);

      // Partners list (hidden by default)
      const partnersList = document.createElement('div');
      Object.assign(partnersList.style, {
        display: 'none',
        padding: '8px 12px',
        background: '#fafafa',
        maxHeight: '200px',
        overflowY: 'auto'
      });

      cat.partners.forEach((partner) => {
        const partnerRow = document.createElement('div');
        Object.assign(partnerRow.style, {
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 0',
          borderBottom: '1px solid #f1f5f9'
        });

        const pCheckbox = document.createElement('input');
        pCheckbox.type = 'checkbox';
        pCheckbox.checked = partner.enabled;
        pCheckbox.disabled = cat.required || false;
        pCheckbox.addEventListener('change', () => {
          if (cat.required) {
            pCheckbox.checked = true;
            return;
          }
          // Random chance to re-enable
          if (randomReEnable && !pCheckbox.checked && Math.random() > 0.5) {
            setTimeout(() => {
              partner.enabled = true;
              pCheckbox.checked = true;
            }, 200 + Math.random() * 500);
          }
          partner.enabled = pCheckbox.checked;
        });

        const pInfo = document.createElement('div');
        pInfo.style.flex = '1';

        const pName = document.createElement('div');
        Object.assign(pName.style, { fontSize: '13px', fontWeight: '500', color: '#334155' });
        pName.textContent = partner.name;

        const pPurpose = document.createElement('div');
        Object.assign(pPurpose.style, { fontSize: '11px', color: '#94a3b8' });
        pPurpose.textContent = partner.purpose;

        pInfo.appendChild(pName);
        pInfo.appendChild(pPurpose);
        partnerRow.appendChild(pCheckbox);
        partnerRow.appendChild(pInfo);
        partnersList.appendChild(partnerRow);
      });

      catBox.appendChild(partnersList);

      let expanded = false;
      expandBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        expanded = !expanded;
        partnersList.style.display = expanded ? 'block' : 'none';
        expandBtn.textContent = expanded ? 'Hide partners' : `View ${cat.partners.length} partners`;
      });

      categoriesWrap.appendChild(catBox);
    });
  }

  renderCategories();
  wrapper.appendChild(categoriesWrap);

  // Bottom row with tiny save button
  const bottomRow = document.createElement('div');
  Object.assign(bottomRow.style, {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '8px',
    borderTop: '1px solid #e2e8f0'
  });

  const partnerCount = document.createElement('span');
  Object.assign(partnerCount.style, { fontSize: '11px', color: '#94a3b8' });
  partnerCount.textContent = `${categoryCount * partnersPerCategory} partners total`;

  const saveBtn = document.createElement('button');
  Object.assign(saveBtn.style, {
    background: '#f1f5f9',
    border: '1px solid #e2e8f0',
    borderRadius: '4px',
    padding: `${rejectButtonSize / 4}px ${rejectButtonSize / 2}px`,
    fontSize: `${Math.max(8, rejectButtonSize / 2)}px`,
    color: '#64748b',
    cursor: 'pointer'
  });
  saveBtn.textContent = 'Save preferences';
  saveBtn.addEventListener('click', () => {
    // Check if user actually disabled all non-required partners
    const allDisabled = categories.every(cat => {
      if (cat.required) return true;
      return cat.partners.every(p => !p.enabled);
    });

    if (allDisabled) {
      // They did it! Respect their choice
      options.onSavePreferences?.(true);
    } else {
      // Not done yet - randomly re-enable some toggles if enabled
      if (randomReEnable) {
        categories.forEach(cat => {
          if (!cat.required && Math.random() > 0.4) {
            cat.partners.forEach(p => {
              if (Math.random() > 0.3) p.enabled = true;
            });
          }
        });
        renderCategories();
      }
      options.onSavePreferences?.(false);
    }
  });

  bottomRow.appendChild(partnerCount);
  bottomRow.appendChild(saveBtn);
  wrapper.appendChild(bottomRow);

  container.appendChild(wrapper);

  return {
    destroy() {
      wrapper.remove();
    }
  };
}

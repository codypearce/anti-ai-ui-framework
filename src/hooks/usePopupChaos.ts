import { useEffect, useMemo, useState } from 'react';
import { componentLoggers } from '../utils/logger';

export interface PopupData {
  id: number;
  left: number;
  top: number;
  zIndex: number;
}

export interface UsePopupChaosOptions {
  popupCount?: number;
  onAllClosed?: () => void;
}

export interface UsePopupChaosReturn {
  popups: PopupData[];
  closePopup: (id: number) => void;
}

export function usePopupChaos({
  popupCount = 4,
  onAllClosed,
}: UsePopupChaosOptions = {}): UsePopupChaosReturn {
  const logger = useMemo(() => componentLoggers.popupChaos, []);
  const [popups, setPopups] = useState<PopupData[]>([]);

  useEffect(() => {
    // Initialize random positions and stacking
    const arr: PopupData[] = Array.from({ length: popupCount }).map((_, i) => ({
      id: i,
      left: 40 + Math.random() * 300,
      top: 40 + Math.random() * 120,
      zIndex: 100 + i,
    }));
    setPopups(arr);
  }, [popupCount]);

  const closePopup = (id: number) => {
    setPopups((prev) => {
      const newPopups = prev.filter((p) => p.id !== id);
      if (newPopups.length === 0) {
        logger.info('All popups closed');
        onAllClosed?.();
      }
      return newPopups;
    });
  };

  return {
    popups,
    closePopup,
  };
}

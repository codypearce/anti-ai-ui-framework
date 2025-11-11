// Vanilla JS utilities exports
export { makeButtonRunaway } from './runawayButton';
export { makeFakeDownloadGrid } from './fakeDownloadGrid';
export { makeCookieHell } from './cookieHell';
export { makePopupChaos } from './popupChaos';
export { makePasswordHell } from './passwordHell';
export { makeShiftingInterface } from './shiftingInterface';
export { makeSemanticGaslighting } from './semanticGaslighting';
export { makeMitosisButton } from './mitosisButton';
export { makeMarqueeInputs } from './marqueeInputs';

// Public types
export type { RunawayOptions } from './runawayButton';
export type { FakeDownloadGridOptions } from './fakeDownloadGrid';
export type { CookieHellOptions } from './cookieHell';
export type { PopupChaosOptions } from './popupChaos';
export type { PasswordHellOptions } from './passwordHell';
export type { ShiftingInterfaceOptions } from './shiftingInterface';
export type {
  GaslightAction as VanillaGaslightAction,
  GaslightButtonDef as VanillaGaslightButtonDef,
  SemanticGaslightingOptions,
} from './semanticGaslighting';
export type { MitosisOptions as MitosisButtonOptions, RealIndexStrategy as MitosisRealIndexStrategy } from './mitosisButton';
export type { MarqueeInputsOptions as MarqueeInputsOptions, MarqueeDirection as MarqueeInputsDirection } from './marqueeInputs';

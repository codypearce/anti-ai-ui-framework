# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2025-11-11

### Added

#### Components (20 total)
- **CookieHell** - Nested cookie consent banners with configurable depth and toggle requirements
- **FakeDownloadGrid** - Grid of buttons where only one is real, others are decoys
- **FakeMarqueeFields** - Input fields that scroll across the screen in marquee style
- **FloatingBannerAds** - Floating banner ads that spawn and move around the viewport
- **FormChaos** - Form with dynamic rotation and scale transformations
- **GlitchText** - Text that cycles through visual variations
- **GravityField** - Interactive field where elements are affected by cursor gravity
- **LabelPositionSwap** - Form labels that periodically swap positions
- **MarqueeInputs** - Input fields that move in marquee style while user types
- **MicroscopicCloseButton** - Tiny close buttons that require precision clicking
- **MitosisButton** - Button that splits into multiple buttons when clicked
- **OpacityFlash** - Elements that flash between different opacity levels
- **PasswordHell** - Password input with ever-changing validation requirements
- **PopupChaos** - Multiple popup dialogs that must be closed in a specific order
- **RandomFakeErrors** - Random fake error messages that appear periodically
- **RunawayButton** - Button that evades cursor interaction
- **SemanticGaslighting** - Buttons that perform opposite actions from their labels
- **ShiftingInterface** - Form interface where elements randomly shift positions
- **TabIndexRandomization** - Elements with randomized tab order
- **ThreeFormCarousel** - Carousel of forms that rotate through

#### Framework Support
- React components with TypeScript definitions
- Vanilla JavaScript implementations for all components
- Framework-agnostic utilities for bot detection
- Full TypeScript support with exported types

#### Bot Detection Utilities
- `detectExactClicks` - Detects repetitive clicking patterns
- `detectPerfectMovement` - Identifies unnaturally straight cursor paths
- `detectPatterns` - Analyzes interaction patterns for automation
- `detectTiming` - Detects suspiciously consistent timing
- `evasionLogic` - Calculates optimal evasion strategies
- `randomPosition` - Generates random positions within constraints
- `logger` - Debug logging utility for development

#### Documentation
- Comprehensive README with installation and usage instructions
- TypeScript type definitions and JSDoc comments
- Contributing guidelines (`CONTRIBUTING.md`)
- MIT License (`LICENSE`)

#### Testing
- 403 tests with Vitest
- 89.08% statement coverage
- 84.51% branch coverage
- 87.23% function coverage
- Tests for all React components and vanilla implementations
- Tests for bot detection utilities

#### Build System
- Dual package support (CommonJS and ES modules)
- TypeScript definitions generation
- Source maps for debugging
- Tree-shakeable exports
- Optimized bundle sizes

### Package Information
- **Name**: `anti-ai-ui`
- **Version**: 0.1.0
- **License**: MIT
- **Repository**: https://github.com/codypearce/anti-ai-ui-framework
- **Engines**: Node.js >=16.0.0

[Unreleased]: https://github.com/codypearce/anti-ai-ui-framework/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/codypearce/anti-ai-ui-framework/releases/tag/v0.1.0

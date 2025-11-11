# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2025-11-11

### Added

#### Components
- **RunawayButton** - Button component that evades cursor interaction with configurable evasion distance, speed, and jitter
- **CookieHell** - Nested cookie consent banners with configurable depth and toggle requirements
- **FakeDownloadGrid** - Grid of buttons where only one is real, others are decoys
- **PopupChaos** - Multiple popup dialogs that must be closed in a specific order
- **PasswordHell** - Password input with ever-changing validation requirements
- **ShiftingInterface** - Form interface where elements randomly shift positions
- **SemanticGaslighting** - Buttons that perform opposite actions from their labels
- **MarqueeInputs** - Input fields that move in marquee style while user types

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

#### Examples
- Vanilla JavaScript demo (`examples/index.html`)
- React demo (`examples/react.html`)
- HTMX demo (`examples/htmx.html`)
- jQuery demo (`examples/jquery.html`)
- Vite + React example (`examples/vite-react/`)
- All components showcase (`examples/all.html`)

#### Documentation
- Comprehensive README with installation and usage instructions
- API documentation for all components and utilities
- TypeScript type definitions and JSDoc comments
- Contributing guidelines (`CONTRIBUTING.md`)
- MIT License (`LICENSE`)

#### Testing
- 155 test suites with Vitest
- 89.25% statement coverage
- 82.17% branch coverage
- 86.14% function coverage
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
- **Repository**: https://github.com/yourusername/anti-ai-ui
- **Engines**: Node.js >=18.0.0

[Unreleased]: https://github.com/yourusername/anti-ai-ui/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/yourusername/anti-ai-ui/releases/tag/v0.1.0

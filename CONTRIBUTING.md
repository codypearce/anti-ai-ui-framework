# Contributing to anti-ai-ui

Thank you for your interest in contributing to anti-ai-ui! This framework helps developers build interfaces that are resilient against automated browsing and AI-driven interactions.

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm 7.x or higher

### Development Setup

1. Fork and clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/anti-ai-ui.git
cd anti-ai-ui
```

2. Install dependencies:
```bash
npm install
```

3. Run the build:
```bash
npm run build
```

4. Run tests:
```bash
npm test
```

5. Start the demo server:
```bash
npm run demo
```

Then open http://localhost:4000/examples/ in your browser.

## Project Structure

```
anti-ai-ui/
├── src/
│   ├── components/      # React components
│   ├── vanilla/         # Vanilla JS implementations
│   ├── hooks/           # React hooks
│   ├── utils/           # Utility functions and bot detection
│   └── types/           # TypeScript type definitions
├── tests/               # Test files
├── examples/            # Demo HTML files
├── docs/                # Component documentation
└── dist/                # Build output (generated)
```

## Development Workflow

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run dev

# Run type checking
npm run typecheck
```

### Linting and Formatting

```bash
# Lint code
npm run lint

# Format code
npm run format
```

### Building

```bash
# Build for production
npm run build

# Build and analyze bundle
npm run build:analyze
```

## Adding a New Component

When contributing a new component, please ensure you create:

1. **React component** in `src/components/YourComponent.tsx`
2. **Vanilla JS version** in `src/vanilla/yourComponent.ts`
3. **TypeScript types** in `src/types/index.ts`
4. **Tests** in `tests/yourComponent.spec.ts` and `tests/yourComponent.vanilla.spec.ts`
5. **Documentation** in `docs/components/YourComponent.md`
6. **Demo example** in the appropriate HTML file in `examples/`

### Component Guidelines

- Components should accept customization props for behavior tuning
- Vanilla implementations should match React component functionality
- Include proper TypeScript types for all props and options
- Add cleanup logic for event listeners and timeouts
- Test across different browsers and screen sizes
- Document all props and options with clear examples

### Bot Detection Utilities

When adding bot detection utilities:

- Focus on detecting non-human interaction patterns
- Avoid false positives on legitimate users
- Document the detection methodology
- Include configurable thresholds
- Provide clear examples of usage

## Code Style

- Use TypeScript strict mode
- Follow the existing ESLint and Prettier configuration
- Use functional components and hooks for React
- Prefer const over let
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused

## Commit Messages

We follow conventional commit format:

```
type(scope): subject

body (optional)
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(components): add CaptchaHell component
fix(runaway-button): correct evasion distance calculation
docs(readme): update installation instructions
```

## Pull Request Process

1. Create a feature branch from `main`:
```bash
git checkout -b feat/your-feature-name
```

2. Make your changes and commit them with clear commit messages

3. Ensure all tests pass and code is formatted:
```bash
npm test
npm run typecheck
npm run lint
```

4. Push to your fork and create a pull request

5. In your PR description:
   - Describe what the change does
   - Link any related issues
   - Include screenshots/GIFs for UI changes
   - Note any breaking changes

6. Wait for review and address any feedback

## Testing Guidelines

- Write tests for all new functionality
- Aim for high test coverage (>80%)
- Test both happy paths and edge cases
- Include integration tests for component interactions
- Test cleanup and unmount behavior
- Verify no memory leaks

## Documentation

- Update README.md if adding new components or features
- Create/update component documentation in `docs/components/`
- Include code examples in documentation
- Document all props, options, and return values
- Add usage examples for common scenarios

## Questions?

If you have questions about contributing:

- Open a GitHub issue with the `question` label
- Check existing issues and discussions
- Review the documentation in the `docs/` folder

## License

By contributing to anti-ai-ui, you agree that your contributions will be licensed under the MIT License.

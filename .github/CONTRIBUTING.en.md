# Contributing

> English | [日本語](https://github.com/scracc/scratch-status-monitor/blob/main/.github/CONTRIBUTING.md)

We welcome contributions from the community! Help us make this project better by contributing in the following ways.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Reporting Issues](#reporting-issues)
- [Submitting Pull Requests](#submitting-pull-requests)
- [Setup](#setup)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Commit Messages](#commit-messages)
- [Review Process](#review-process)
- [Questions](#questions)

## Code of Conduct

By participating in this project and its community, you agree to maintain a respectful and inclusive environment for everyone. Please:

- Prioritize mutual respect and inclusivity
- Communicate constructively and honestly
- Make an effort to understand others' perspectives
- Harassment and discrimination are not tolerated

## Reporting Issues

If you find a bug or other issue, please report it on the GitHub [Issues](https://github.com/scracc/scratch-status-monitor/issues) page.

### Information to Include When Creating an Issue

1. **Clear Title**: Briefly describe the issue
2. **Detailed Description**: Provide details about the problem
3. **Steps to Reproduce**: Include specific steps to reproduce the issue
4. **Expected Behavior**: Describe the expected behavior
5. **Actual Behavior**: Describe what actually happens
6. **Environment Information**: Include OS, browser version, and other relevant information
7. **Screenshots/Logs**: Attach screenshots or error logs if possible

See the [bug report template](https://github.com/scracc/scratch-status-monitor/blob/main/.github/ISSUE_TEMPLATE/bug_report.md) for more details.

## Submitting Pull Requests

### Step-by-Step Guide

1. **Fork the Repository**

   ```bash
   Click the Fork button on GitHub
   ```

2. **Clone Your Fork**

   ```bash
   git clone https://github.com/YOUR_USERNAME/scratch-status-monitor.git
   cd scratch-status-monitor
   ```

3. **Set Up Upstream**

   ```bash
   git remote add upstream https://github.com/scracc/scratch-status-monitor.git
   ```

4. **Update Your Local Branch**

   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

5. **Create a Feature Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

6. **Make Your Changes**

   - Follow the coding standards and style guide
   - Add or update tests as needed
   - Update documentation if necessary

7. **Run Tests**

   ```bash
   pnpm test
   ```

8. **Commit and Push**

   ```bash
   git add .
   git commit -m "feat: description of your changes"
   git push origin feature/your-feature-name
   ```

9. **Create a Pull Request**

   - Create the PR on GitHub
   - Fill in the [pull request template](https://github.com/scracc/scratch-status-monitor/blob/main/.github/PULL_REQUEST_TEMPLATE.md)
   - Provide a clear description for reviewers

## Setup

### Prerequisites

- Node.js 20+
- pnpm 8+

### Installation

```bash
# Clone the repository
git clone https://github.com/scracc/scratch-status-monitor.git
cd scratch-status-monitor

# Install dependencies
pnpm install

# Set up workspace
pnpm setup
```

### Starting Development Servers

```bash
# Start all projects
pnpm dev

# Or start specific projects
cd apps/frontend && pnpm dev
cd apps/backend && pnpm dev
```

## Development Workflow

1. Follow Git Flow: the `main` branch always contains production-ready code
2. Create feature branches from `main`
3. Regularly sync with upstream
4. Test locally before creating a PR

## Coding Standards

This project maintains code quality using:

- **Biome**: Code formatting and linting
- **TypeScript**: Type safety
- **ESLint**: JavaScript linting (integrated with Biome)

### Code Quality Checks

```bash
# Auto-format code with Biome
pnpm format

# Lint with Biome
pnpm lint

# Type check
pnpm type-check
```

### Style Guidelines

- **Language**: Use English for comments in code
- **Naming Conventions**:
  - Variables/Functions: camelCase
  - Classes/Types: PascalCase
  - Constants: UPPER_SNAKE_CASE
- **File Names**: kebab-case

See [biome.json](https://github.com/scracc/scratch-status-monitor/blob/main/biome.json) for more details.

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

### Adding Tests

- Add corresponding tests for new code changes
- Name test files with `*.test.ts` or `*.spec.ts`
- Aim for 80%+ test coverage

## Commit Messages

We use Conventional Commits. Follow this format:

```txt
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (no functional changes)
- **refactor**: Refactoring
- **perf**: Performance improvements
- **test**: Test-related changes
- **chore**: Build process or tool changes
- **ci**: CI/CD configuration changes

### Scope

The area affected by the change:

- `frontend`: Frontend
- `backend`: Backend
- `api`: API
- `docs`: Documentation
- `config`: Configuration files

### Example

```txt
feat(frontend): add new dashboard component

Improves dashboard rendering performance with new component

Closes #123
```

## Review Process

1. **Automated Checks**: GitHub Actions runs tests and linting
2. **Review**: Maintainers will review your PR
3. **Revisions**: Address feedback from reviewers
4. **Merge**: Once approved, your PR will be merged

### Conditions for Merging

- [ ] All checks (tests, linting) pass
- [ ] Approved by at least one maintainer
- [ ] All comments resolved
- [ ] Branch is up to date with `main`

## Questions

- Ask in GitHub Discussions
- Comment on issues for clarification
- Report security issues privately without public disclosure

---

Thank you for contributing! 🙏

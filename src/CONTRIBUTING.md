# Contributing to Magdee

Thank you for your interest in contributing to Magdee! This document provides guidelines for contributing to the project.

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- Python 3.8+
- Git
- Supabase account for database testing

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/yourusername/magdee-pdf-to-audio.git
   cd magdee-pdf-to-audio
   ```

2. **Install Dependencies**
   ```bash
   npm run setup
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Fill in your Supabase credentials
   ```

4. **Start Development**
   ```bash
   npm run dev
   ```

## 📋 Development Guidelines

### Code Style

#### Frontend (React/TypeScript)
- Use TypeScript for all components
- Follow React functional component patterns
- Use custom hooks for reusable logic
- Implement proper error boundaries
- Add displayName to all components for debugging

```tsx
// Good
export function MyComponent({ prop1, prop2 }: MyComponentProps) {
  return <div>Content</div>;
}
MyComponent.displayName = 'MyComponent';

// Better - using the helper
import { withDisplayName } from '../utils/componentHelpers';

export const MyComponent = withDisplayName(
  ({ prop1, prop2 }: MyComponentProps) => {
    return <div>Content</div>;
  },
  'MyComponent'
);
```

#### Backend (Python/FastAPI)
- Follow PEP 8 style guidelines
- Use type hints for all functions
- Implement proper error handling
- Add docstrings for all functions

```python
# Good
async def process_pdf(file: UploadFile) -> dict:
    """
    Process PDF file and convert to audio.
    
    Args:
        file: The uploaded PDF file
        
    Returns:
        dict: Processing result with audio URL
    """
    try:
        # Implementation
        pass
    except Exception as e:
        logger.error(f"PDF processing failed: {e}")
        raise HTTPException(status_code=500, detail="Processing failed")
```

### Component Structure

#### React Components
```tsx
// components/MyComponent.tsx
import React from 'react';

interface MyComponentProps {
  title: string;
  onAction: () => void;
}

export function MyComponent({ title, onAction }: MyComponentProps) {
  return (
    <div style={{ /* styles */ }}>
      <h2>{title}</h2>
      <button onClick={onAction}>Action</button>
    </div>
  );
}

MyComponent.displayName = 'MyComponent';
```

#### API Endpoints
```python
# app/routers/my_router.py
from fastapi import APIRouter, HTTPException
from typing import Dict, Any

router = APIRouter(prefix="/api/v1/my-feature", tags=["my-feature"])

@router.post("/action")
async def perform_action(data: dict) -> Dict[str, Any]:
    """Perform some action with the provided data."""
    try:
        # Implementation
        return {"success": True, "message": "Action completed"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

## 🧪 Testing

### Frontend Testing
```bash
# Run all tests
npm test

# Run specific test file
npm test -- MyComponent.test.tsx

# Run tests in watch mode
npm test -- --watch
```

### Backend Testing
```bash
# Run Python tests
python -m pytest

# Run with coverage
python -m pytest --cov=app tests/

# Run specific test
python -m pytest tests/test_pdf_router.py
```

### Integration Testing
```bash
# Check all servers
python check-servers.py

# Test full application flow
npm run test:integration
```

## 📝 Commit Guidelines

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or modifying tests
- **chore**: Maintenance tasks

### Examples
```bash
feat(audio-player): add repeat mode functionality

fix(auth): resolve login redirect loop issue

docs(readme): update installation instructions

style(components): standardize button hover effects

refactor(database): optimize user query performance

test(pdf-upload): add validation test cases

chore(deps): update React to 18.2.0
```

## 🚀 Pull Request Process

### Before Submitting
1. **Test thoroughly**
   ```bash
   npm test
   python -m pytest
   python check-servers.py
   ```

2. **Check code style**
   ```bash
   npm run lint
   npm run format
   ```

3. **Update documentation**
   - Update README if needed
   - Add JSDoc comments for new functions
   - Update API documentation

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] New tests added for new functionality
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
```

## 🐛 Bug Reports

### Bug Report Template
```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected behavior**
A clear description of what you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g. iOS, Windows]
- Browser: [e.g. chrome, safari]
- App Version: [e.g. 1.0.0]

**Additional context**
Add any other context about the problem here.
```

## 💡 Feature Requests

### Feature Request Template
```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
A clear description of alternative solutions.

**Additional context**
Add any other context or screenshots about the feature request.
```

## 📚 Documentation

### Adding Documentation
- Update README.md for major changes
- Add inline code comments
- Update API documentation
- Create guides for complex features

### Documentation Structure
```
docs/
├── api/                 # API documentation
├── components/          # Component documentation
├── guides/             # User guides
└── development/        # Development guides
```

## 🏗 Architecture Guidelines

### Frontend Architecture
- Components in `/components`
- Custom hooks in `/hooks`
- Services in `/services`
- Utilities in `/utils`
- Types in `/types`

### Backend Architecture
- Routers in `/app/routers`
- Models in `/app/models`
- Services in `/app/services`
- Utilities in `/app/utils`

### Database Schema
- Follow the existing 6-table structure
- Use proper foreign keys and constraints
- Implement Row Level Security (RLS)
- Add indexes for performance

## 🔒 Security Guidelines

### Frontend Security
- Validate all user inputs
- Use environment variables for sensitive data
- Implement proper error boundaries
- Avoid XSS vulnerabilities

### Backend Security
- Validate all API inputs
- Use proper authentication
- Implement rate limiting
- Sanitize database queries

### Database Security
- Use Row Level Security (RLS)
- Implement proper user roles
- Encrypt sensitive data
- Regular security audits

## 📞 Getting Help

### Communication Channels
- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Email**: For private concerns

### Code Review Process
1. Create pull request
2. Automated tests run
3. Code review by maintainers
4. Address feedback
5. Merge when approved

### Mentorship
New contributors are welcome! Feel free to:
- Ask questions in issues or discussions
- Request code reviews for learning
- Suggest improvements to this guide

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Annual contributor appreciation

Thank you for contributing to Magdee! 🎉
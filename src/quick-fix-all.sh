#!/bin/bash

# Magdee - Quick Fix All Issues Script
# Fixes both requirements.txt and file structure issues

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Magdee Quick Fix - All Issues            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "requirements.txt" ]; then
    echo -e "${RED}❌ Error: requirements.txt not found${NC}"
    echo "Please run this script from the project root directory"
    exit 1
fi

echo -e "${YELLOW}This script will:${NC}"
echo "  1. Fix file structure (move GitHub files)"
echo "  2. Update Python dependencies"
echo "  3. Run tests and validation"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Step 1: Fixing File Structure${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Create .github structure
echo "📁 Creating .github directory structure..."
mkdir -p .github/workflows
mkdir -p .github/ISSUE_TEMPLATE

# Move workflow files
if [ -d "workflows" ]; then
    echo "📦 Moving workflow files..."
    mv workflows/*.yml .github/workflows/ 2>/dev/null || true
    rmdir workflows 2>/dev/null || true
    echo -e "${GREEN}✓ Workflows moved${NC}"
else
    echo -e "${YELLOW}ℹ Workflows already in correct location${NC}"
fi

# Move issue templates
if [ -d "ISSUE_TEMPLATE" ]; then
    echo "📋 Moving issue templates..."
    mv ISSUE_TEMPLATE/* .github/ISSUE_TEMPLATE/ 2>/dev/null || true
    rmdir ISSUE_TEMPLATE 2>/dev/null || true
    echo -e "${GREEN}✓ Issue templates moved${NC}"
else
    echo -e "${YELLOW}ℹ Issue templates already in correct location${NC}"
fi

# Move PR template
if [ -f "PULL_REQUEST_TEMPLATE.md" ]; then
    echo "📝 Moving PR template..."
    mv PULL_REQUEST_TEMPLATE.md .github/
    echo -e "${GREEN}✓ PR template moved${NC}"
else
    echo -e "${YELLOW}ℹ PR template already in correct location${NC}"
fi

# Move dependabot
if [ -f "dependabot.yml" ]; then
    echo "🤖 Moving dependabot config..."
    mv dependabot.yml .github/
    echo -e "${GREEN}✓ Dependabot config moved${NC}"
else
    echo -e "${YELLOW}ℹ Dependabot config already in correct location${NC}"
fi

# Clean up invalid directories
if [ -d "Dockerfile" ]; then
    echo "🗑️  Cleaning up invalid Dockerfile directory..."
    mkdir -p .backup/dockerfile-contents
    mv Dockerfile/* .backup/dockerfile-contents/ 2>/dev/null || true
    rmdir Dockerfile 2>/dev/null || true
    echo -e "${GREEN}✓ Dockerfile directory cleaned (backed up to .backup/)${NC}"
fi

if [ -d "LICENSE" ]; then
    echo "🗑️  Cleaning up invalid LICENSE directory..."
    mkdir -p .backup/license-contents
    mv LICENSE/* .backup/license-contents/ 2>/dev/null || true
    rmdir LICENSE 2>/dev/null || true
    echo -e "${GREEN}✓ LICENSE directory cleaned (backed up to .backup/)${NC}"
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Step 2: Updating Python Dependencies${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if virtual environment exists
if [ -d "venv" ]; then
    echo "🐍 Virtual environment found"
    echo -e "${YELLOW}⚠️  Recommendation: Create fresh venv for new dependencies${NC}"
    read -p "Recreate virtual environment? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🗑️  Removing old venv..."
        rm -rf venv
        echo "📦 Creating new virtual environment..."
        python3 -m venv venv
    fi
else
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️  Upgrading pip..."
pip install --upgrade pip setuptools wheel -q

# Install requirements
echo "📥 Installing updated requirements..."
echo -e "${YELLOW}   This may take a few minutes...${NC}"
pip install -r requirements.txt -q

echo -e "${GREEN}✓ Dependencies installed${NC}"

# Check for PyPDF2 usage
echo ""
echo "🔍 Checking for deprecated PyPDF2 usage..."
if grep -r "from PyPDF2" app/ 2>/dev/null || grep -r "import PyPDF2" app/ 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Found PyPDF2 imports in code${NC}"
    echo -e "${YELLOW}   Please update these imports:${NC}"
    echo "   from PyPDF2 import ... → from pypdf import ..."
    echo ""
    echo "Files to update:"
    grep -r "PyPDF2" app/ 2>/dev/null || true
else
    echo -e "${GREEN}✓ No PyPDF2 imports found${NC}"
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Step 3: Validation${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Verify .github structure
echo "✅ Verifying .github structure..."
ISSUES_FOUND=0

if [ -d ".github/workflows" ] && [ "$(ls -A .github/workflows)" ]; then
    echo -e "${GREEN}✓ .github/workflows exists with files${NC}"
else
    echo -e "${RED}✗ .github/workflows missing or empty${NC}"
    ISSUES_FOUND=1
fi

if [ -d ".github/ISSUE_TEMPLATE" ] && [ "$(ls -A .github/ISSUE_TEMPLATE)" ]; then
    echo -e "${GREEN}✓ .github/ISSUE_TEMPLATE exists with files${NC}"
else
    echo -e "${RED}✗ .github/ISSUE_TEMPLATE missing or empty${NC}"
    ISSUES_FOUND=1
fi

if [ -f ".github/PULL_REQUEST_TEMPLATE.md" ]; then
    echo -e "${GREEN}✓ .github/PULL_REQUEST_TEMPLATE.md exists${NC}"
else
    echo -e "${RED}✗ .github/PULL_REQUEST_TEMPLATE.md missing${NC}"
    ISSUES_FOUND=1
fi

if [ -f ".github/dependabot.yml" ]; then
    echo -e "${GREEN}✓ .github/dependabot.yml exists${NC}"
else
    echo -e "${RED}✗ .github/dependabot.yml missing${NC}"
    ISSUES_FOUND=1
fi

# Check Python
echo ""
echo "✅ Verifying Python environment..."
python --version
echo -e "${GREEN}✓ Python available${NC}"

# List installed packages
echo ""
echo "📦 Key packages installed:"
pip list | grep -E "fastapi|uvicorn|supabase|pypdf|pydub" || echo "No key packages found"

# Run quick import test
echo ""
echo "🧪 Testing critical imports..."
python -c "import fastapi; import supabase; import pypdf; print('✓ All critical imports successful')" 2>/dev/null && \
    echo -e "${GREEN}✓ Import test passed${NC}" || \
    echo -e "${YELLOW}⚠️  Some imports failed - check requirements${NC}"

# Summary
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Summary${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ $ISSUES_FOUND -eq 0 ]; then
    echo -e "${GREEN}✅ All fixes applied successfully!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Review changes: git status"
    echo "2. Update PyPDF2 imports (if any were found)"
    echo "3. Install ffmpeg: brew install ffmpeg (macOS) or apt-get install ffmpeg (Ubuntu)"
    echo "4. Run tests: pytest app/ -v"
    echo "5. Commit changes: git add . && git commit -m 'fix: compatibility and structure'"
    echo "6. Push to GitHub: git push"
    echo ""
    echo -e "${BLUE}📚 See COMPATIBILITY_AND_STRUCTURE_FIXES.md for details${NC}"
else
    echo -e "${YELLOW}⚠️  Some issues remain - check output above${NC}"
    echo ""
    echo "Please fix remaining issues and run again"
fi

# Deactivate venv
deactivate 2>/dev/null || true

echo ""
echo -e "${GREEN}Done! 🎉${NC}"

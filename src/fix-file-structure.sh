#!/bin/bash

# Magdee File Structure Fix Script
# Moves misplaced files to their correct locations

echo "🔧 Fixing Magdee file structure..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Create .github directory if it doesn't exist
mkdir -p .github/workflows
mkdir -p .github/ISSUE_TEMPLATE

# Move workflow files
echo -e "${YELLOW}Moving workflow files...${NC}"
if [ -d "workflows" ]; then
    mv workflows/*.yml .github/workflows/ 2>/dev/null
    rmdir workflows 2>/dev/null
    echo -e "${GREEN}✓ Workflows moved${NC}"
fi

# Move issue templates
echo -e "${YELLOW}Moving issue templates...${NC}"
if [ -d "ISSUE_TEMPLATE" ]; then
    mv ISSUE_TEMPLATE/*.md .github/ISSUE_TEMPLATE/ 2>/dev/null
    mv ISSUE_TEMPLATE/*.yml .github/ISSUE_TEMPLATE/ 2>/dev/null
    rmdir ISSUE_TEMPLATE 2>/dev/null
    echo -e "${GREEN}✓ Issue templates moved${NC}"
fi

# Move PR template
echo -e "${YELLOW}Moving PR template...${NC}"
if [ -f "PULL_REQUEST_TEMPLATE.md" ]; then
    mv PULL_REQUEST_TEMPLATE.md .github/
    echo -e "${GREEN}✓ PR template moved${NC}"
fi

# Move dependabot.yml
echo -e "${YELLOW}Moving dependabot.yml...${NC}"
if [ -f "dependabot.yml" ]; then
    mv dependabot.yml .github/
    echo -e "${GREEN}✓ Dependabot config moved${NC}"
fi

# Clean up Dockerfile directory with .tsx files
echo -e "${YELLOW}Cleaning up Dockerfile directory...${NC}"
if [ -d "Dockerfile" ]; then
    # This shouldn't exist - Dockerfile should be a file, not a directory
    # Move any valid content, then remove
    if [ -f "Dockerfile/Code-component-2137-160.tsx" ]; then
        echo -e "${YELLOW}⚠️  Found .tsx files in Dockerfile directory${NC}"
        echo -e "${YELLOW}   These appear to be misplaced components${NC}"
        # Create backup
        mkdir -p .backup/dockerfile-contents
        mv Dockerfile/* .backup/dockerfile-contents/ 2>/dev/null
    fi
    rmdir Dockerfile 2>/dev/null
    echo -e "${GREEN}✓ Dockerfile directory cleaned${NC}"
fi

# Clean up LICENSE directory
echo -e "${YELLOW}Checking LICENSE...${NC}"
if [ -d "LICENSE" ]; then
    # LICENSE should be a file, not a directory
    echo -e "${YELLOW}⚠️  LICENSE is a directory, backing up...${NC}"
    mkdir -p .backup/license-contents
    mv LICENSE/* .backup/license-contents/ 2>/dev/null
    rmdir LICENSE 2>/dev/null
    echo -e "${GREEN}✓ LICENSE directory removed (contents backed up)${NC}"
fi

# Verify .github structure
echo ""
echo -e "${YELLOW}Verifying .github structure...${NC}"

if [ -d ".github/workflows" ]; then
    echo -e "${GREEN}✓ .github/workflows exists${NC}"
else
    echo -e "${RED}✗ .github/workflows missing${NC}"
fi

if [ -d ".github/ISSUE_TEMPLATE" ]; then
    echo -e "${GREEN}✓ .github/ISSUE_TEMPLATE exists${NC}"
else
    echo -e "${RED}✗ .github/ISSUE_TEMPLATE missing${NC}"
fi

if [ -f ".github/PULL_REQUEST_TEMPLATE.md" ]; then
    echo -e "${GREEN}✓ .github/PULL_REQUEST_TEMPLATE.md exists${NC}"
else
    echo -e "${RED}✗ .github/PULL_REQUEST_TEMPLATE.md missing${NC}"
fi

if [ -f ".github/dependabot.yml" ]; then
    echo -e "${GREEN}✓ .github/dependabot.yml exists${NC}"
else
    echo -e "${RED}✗ .github/dependabot.yml missing${NC}"
fi

# Summary
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}File structure fix complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Next steps:"
echo "1. Check .backup/ directory for any moved files"
echo "2. Review and commit changes"
echo "3. Run: git add .github/"
echo ""

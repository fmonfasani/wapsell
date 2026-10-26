#!/bin/bash
#
# build-prod.sh
# ============================================
# Production build script for Wapsell Landing
# Optimized for Hetzner VPS deployment
#
# Usage:
#   ./scripts/build-prod.sh
#
# Requirements:
#   - Node.js 20+
#   - npm 10+
#
# Output:
#   - .next/standalone/ — Self-contained app
#   - .next/static/     — Static assets
#   - public/           — Public files
#
# Notes:
#   - Runs linting & type checking
#   - Validates standalone output
#   - Reports build metrics
#   - Suitable for CI/CD pipelines
# ============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ===== FUNCTIONS =====

log_info() {
  echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
  echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
  echo -e "${RED}✗${NC} $1"
}

print_header() {
  echo ""
  echo -e "${BLUE}════════════════════════════════════════${NC}"
  echo -e "${BLUE}  $1${NC}"
  echo -e "${BLUE}════════════════════════════════════════${NC}"
  echo ""
}

# ===== MAIN BUILD PROCESS =====

print_header "WAPSELL PRODUCTION BUILD"

# Step 1: Verify environment
log_info "Checking environment..."

if ! command -v node &> /dev/null; then
  log_error "Node.js not found. Please install Node.js 20+."
  exit 1
fi

NODE_VERSION=$(node --version)
log_success "Node.js: $NODE_VERSION"

if ! command -v npm &> /dev/null; then
  log_error "npm not found."
  exit 1
fi

NPM_VERSION=$(npm --version)
log_success "npm: $NPM_VERSION"

# Step 2: Clean previous build
log_info "Cleaning previous build artifacts..."
rm -rf .next
rm -rf .turbo
log_success "Cleaned .next and .turbo directories"

# Step 3: Install dependencies (production only)
print_header "INSTALLING DEPENDENCIES"

log_info "Installing npm dependencies (production mode)..."
npm ci --omit=dev

log_success "Dependencies installed"

# Step 4: Type checking
print_header "TYPE CHECKING"

log_info "Running TypeScript type checking..."
if npm run type-check; then
  log_success "Type check passed"
else
  log_error "Type check failed"
  exit 1
fi

# Step 5: Linting
print_header "LINTING"

log_info "Running ESLint..."
if npm run lint; then
  log_success "Linting passed"
else
  log_warning "Linting produced warnings (non-fatal)"
fi

# Step 6: Build
print_header "BUILDING"

log_info "Building Next.js application..."
START_TIME=$(date +%s)

if npm run build; then
  END_TIME=$(date +%s)
  BUILD_TIME=$((END_TIME - START_TIME))
  log_success "Build completed in ${BUILD_TIME}s"
else
  log_error "Build failed"
  exit 1
fi

# Step 7: Validate standalone output
print_header "VALIDATING BUILD"

if [ ! -d ".next/standalone" ]; then
  log_error "Standalone output not found at .next/standalone"
  exit 1
fi
log_success "Standalone output verified"

if [ ! -f ".next/standalone/server.js" ]; then
  log_error "server.js not found in standalone output"
  exit 1
fi
log_success "server.js found"

# Step 8: Calculate build sizes
print_header "BUILD METRICS"

NEXT_SIZE=$(du -sh .next | awk '{print $1}')
STATIC_SIZE=$(du -sh .next/static | awk '{print $1}')
STANDALONE_SIZE=$(du -sh .next/standalone | awk '{print $1}')

echo "Build artifact sizes:"
echo "  .next folder:              $NEXT_SIZE"
echo "  .next/static/ (assets):    $STATIC_SIZE"
echo "  .next/standalone/ (app):   $STANDALONE_SIZE"

# Check if build is within acceptable size
# .next folder should be < 500 MB for Hetzner
NEXT_SIZE_MB=$(du -sm .next | awk '{print $1}')
if [ "$NEXT_SIZE_MB" -gt 500 ]; then
  log_warning "Build size exceeds 500 MB: ${NEXT_SIZE_MB}MB"
else
  log_success "Build size acceptable: ${NEXT_SIZE_MB}MB"
fi

# Step 9: Verify output structure
print_header "OUTPUT VERIFICATION"

echo "Checking required output directories:"

REQUIRED_DIRS=(
  ".next/standalone"
  ".next/static/chunks"
  ".next/static/_next"
)

for dir in "${REQUIRED_DIRS[@]}"; do
  if [ -d "$dir" ]; then
    echo "  ✓ $dir"
  else
    log_error "Missing directory: $dir"
    exit 1
  fi
done

# Step 10: Success summary
print_header "BUILD SUCCESSFUL"

echo ""
echo "Build summary:"
echo "  Timestamp:        $(date '+%Y-%m-%d %H:%M:%S')"
echo "  Build time:       ${BUILD_TIME}s"
echo "  Output size:      $NEXT_SIZE"
echo "  Standalone size:  $STANDALONE_SIZE"
echo ""
echo "Ready for deployment:"
echo "  1. Upload .next/standalone/ to Hetzner VPS"
echo "  2. Copy public/ directory"
echo "  3. Set NODE_ENV=production"
echo "  4. Run: node .next/standalone/server.js"
echo ""
log_success "Production build ready!"

# Optional: Generate build manifest
if command -v jq &> /dev/null; then
  cat > build-manifest.json <<EOF
{
  "buildTime": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "buildDuration": ${BUILD_TIME}s,
  "nodeVersion": "$NODE_VERSION",
  "npmVersion": "$NPM_VERSION",
  "nextSize": "$NEXT_SIZE",
  "standaloneSize": "$STANDALONE_SIZE",
  "buildStatus": "success"
}
EOF
  log_success "Build manifest created: build-manifest.json"
fi

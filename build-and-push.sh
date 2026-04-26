#!/bin/bash
# ============================================================
#  CatchOPP – Build & Push ALL Docker Images to Docker Hub
#  Usage: ./build-and-push.sh <dockerhub-username>
#  Example: ./build-and-push.sh monutilisateur
# ============================================================

set -e  # Stop on any error

# ── Configuration ────────────────────────────────────────────
DOCKERHUB_USERNAME=${1:-"YOUR_DOCKERHUB_USERNAME"}
TAG="latest"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       CatchOPP – Docker Build & Push to Hub          ║${NC}"
echo -e "${BLUE}║       DockerHub: ${DOCKERHUB_USERNAME}                ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════╝${NC}"
echo ""

# ── Login to Docker Hub ──────────────────────────────────────
echo -e "${YELLOW}[1/9] Logging in to Docker Hub...${NC}"
docker login
echo -e "${GREEN}✓ Logged in successfully${NC}"
echo ""

# Script directory = CatchOPP root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ── Function: build + tag + push ─────────────────────────────
build_and_push() {
    local SERVICE_NAME=$1
    local CONTEXT_PATH=$2
    local IMAGE_NAME="${DOCKERHUB_USERNAME}/${SERVICE_NAME}:${TAG}"

    echo -e "${YELLOW}▶ Building: ${IMAGE_NAME}${NC}"
    echo -e "  Context: ${CONTEXT_PATH}"

    docker build -t "${IMAGE_NAME}" "${CONTEXT_PATH}"
    echo -e "${GREEN}  ✓ Build OK${NC}"

    docker push "${IMAGE_NAME}"
    echo -e "${GREEN}  ✓ Pushed → hub.docker.com/${DOCKERHUB_USERNAME}/${SERVICE_NAME}${NC}"
    echo ""
}

# ── Build & Push each microservice ───────────────────────────
echo -e "${BLUE}═══ BACKEND MICROSERVICES ═══════════════════════════${NC}"

build_and_push "catchopp-user-ms"         "${SCRIPT_DIR}/CatchOPP/UserMicroService"
build_and_push "catchopp-project-ms"      "${SCRIPT_DIR}/CatchOPP/ProjectMicroService"
build_and_push "catchopp-competence-ms"   "${SCRIPT_DIR}/CatchOPP/MS_CompetenceAndReview"
build_and_push "catchopp-paiement-ms"     "${SCRIPT_DIR}/CatchOPP/paiementMS"
build_and_push "catchopp-communication-ms" "${SCRIPT_DIR}/CatchOPP/MSCommunication"
build_and_push "catchopp-support-ms"      "${SCRIPT_DIR}/CatchOPP/TechnicalSupportMS"

echo -e "${BLUE}═══ FRONTEND ════════════════════════════════════════${NC}"
build_and_push "catchopp-frontend"        "${SCRIPT_DIR}/FrontFreelanceApp"

# ── Summary ──────────────────────────────────────────────────
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              ✅ ALL IMAGES PUSHED!                   ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Images available on Docker Hub:${NC}"
echo "  🐳 ${DOCKERHUB_USERNAME}/catchopp-user-ms:latest"
echo "  🐳 ${DOCKERHUB_USERNAME}/catchopp-project-ms:latest"
echo "  🐳 ${DOCKERHUB_USERNAME}/catchopp-competence-ms:latest"
echo "  🐳 ${DOCKERHUB_USERNAME}/catchopp-paiement-ms:latest"
echo "  🐳 ${DOCKERHUB_USERNAME}/catchopp-communication-ms:latest"
echo "  🐳 ${DOCKERHUB_USERNAME}/catchopp-support-ms:latest"
echo "  🐳 ${DOCKERHUB_USERNAME}/catchopp-frontend:latest"
echo ""
echo -e "View at: ${BLUE}https://hub.docker.com/u/${DOCKERHUB_USERNAME}${NC}"

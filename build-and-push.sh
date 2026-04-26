#!/bin/bash
# ============================================================
#  CatchOPP – Build & Push ALL Docker Images to Docker Hub
#  Usage: ./build-and-push.sh <dockerhub-username>
#  Example: ./build-and-push.sh ghassenhchaichi
# ============================================================

set -e

DOCKERHUB_USERNAME=${1:-"YOUR_DOCKERHUB_USERNAME"}
TAG="latest"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       CatchOPP – Docker Build & Push to Hub          ║${NC}"
echo -e "${BLUE}║       DockerHub: ${DOCKERHUB_USERNAME}                ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}[1/9] Logging in to Docker Hub...${NC}"
docker login
echo -e "${GREEN}✓ Logged in successfully${NC}"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CATCHOPP_DIR="${SCRIPT_DIR}/CatchOPP"

build_and_push() {
    local SERVICE_NAME=$1
    local CONTEXT_PATH=$2
    local DOCKERFILE=${3:-"${CONTEXT_PATH}/Dockerfile"}
    local IMAGE_NAME="${DOCKERHUB_USERNAME}/${SERVICE_NAME}:${TAG}"

    echo -e "${YELLOW}▶ Building: ${IMAGE_NAME}${NC}"
    docker build -f "${DOCKERFILE}" -t "${IMAGE_NAME}" "${CONTEXT_PATH}"
    echo -e "${GREEN}  ✓ Build OK${NC}"
    docker push "${IMAGE_NAME}"
    echo -e "${GREEN}  ✓ Pushed → hub.docker.com/${DOCKERHUB_USERNAME}/${SERVICE_NAME}${NC}"
    echo ""
}

echo -e "${BLUE}═══ BACKEND MICROSERVICES ═══════════════════════════${NC}"

# Standard MS — context = their own directory
build_and_push "catchopp-user-ms"          "${CATCHOPP_DIR}/UserMicroService"
build_and_push "catchopp-competence-ms"    "${CATCHOPP_DIR}/MS_CompetenceAndReview"
build_and_push "catchopp-paiement-ms"      "${CATCHOPP_DIR}/paiementMS"
build_and_push "catchopp-communication-ms" "${CATCHOPP_DIR}/MSCommunication"
build_and_push "catchopp-support-ms"       "${CATCHOPP_DIR}/TechnicalSupportMS"

# ProjectMicroService — context = CatchOPP/ (needs ReferralMicroService)
echo -e "${YELLOW}▶ Building: ${DOCKERHUB_USERNAME}/catchopp-project-ms:${TAG}${NC}"
echo -e "  (Uses parent context CatchOPP/ for ReferralMicroService dependency)"
docker build \
    -f "${CATCHOPP_DIR}/ProjectMicroService/Dockerfile" \
    -t "${DOCKERHUB_USERNAME}/catchopp-project-ms:${TAG}" \
    "${CATCHOPP_DIR}"
echo -e "${GREEN}  ✓ Build OK${NC}"
docker push "${DOCKERHUB_USERNAME}/catchopp-project-ms:${TAG}"
echo -e "${GREEN}  ✓ Pushed → hub.docker.com/${DOCKERHUB_USERNAME}/catchopp-project-ms${NC}"
echo ""

echo -e "${BLUE}═══ FRONTEND ════════════════════════════════════════${NC}"
build_and_push "catchopp-frontend" "${SCRIPT_DIR}/FrontFreelanceApp"

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              ✅ ALL IMAGES PUSHED!                   ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════╝${NC}"
echo ""
echo "  🐳 ${DOCKERHUB_USERNAME}/catchopp-user-ms:latest"
echo "  🐳 ${DOCKERHUB_USERNAME}/catchopp-project-ms:latest"
echo "  🐳 ${DOCKERHUB_USERNAME}/catchopp-competence-ms:latest"
echo "  🐳 ${DOCKERHUB_USERNAME}/catchopp-paiement-ms:latest"
echo "  🐳 ${DOCKERHUB_USERNAME}/catchopp-communication-ms:latest"
echo "  🐳 ${DOCKERHUB_USERNAME}/catchopp-support-ms:latest"
echo "  🐳 ${DOCKERHUB_USERNAME}/catchopp-frontend:latest"
echo ""
echo -e "View at: ${BLUE}https://hub.docker.com/u/${DOCKERHUB_USERNAME}${NC}"

#!/bin/bash

# Build and push the frontend Docker image

IMAGE_NAME="johan/todo-frontend"
TAG="${1:-latest}"

echo "Building Docker image: ${IMAGE_NAME}:${TAG}"
docker build -t ${IMAGE_NAME}:${TAG} .

if [ $? -eq 0 ]; then
    echo "Successfully built ${IMAGE_NAME}:${TAG}"
    echo "Pushing to registry..."
    docker push ${IMAGE_NAME}:${TAG}

    if [ $? -eq 0 ]; then
        echo "Successfully pushed ${IMAGE_NAME}:${TAG}"
    else
        echo "Failed to push ${IMAGE_NAME}:${TAG}"
        exit 1
    fi
else
    echo "Failed to build ${IMAGE_NAME}:${TAG}"
    exit 1
fi

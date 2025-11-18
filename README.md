# GitOps Todo Application

This directory contains a todo application structured for GitOps deployment with Argo CD.

## Application Architecture

- **Backend**: Flask API serving todo endpoints on port 8000
- **Frontend**: Nginx serving static frontend on port 80
- **Database**: In-memory storage (can be extended with persistent storage)

## Directory Structure

```
todoapp/
├── environments/
│   ├── dev/
│   │   └── values.yaml          # Development environment configuration
│   ├── staging/
│   │   └── values.yaml          # Staging environment configuration
│   └── production/
│       └── values.yaml          # Production environment configuration
└── todo-app/
    ├── Chart.yaml               # Helm chart metadata
    └── templates/
        ├── backend-deployment.yaml   # Backend Flask deployment
        ├── backend-service.yaml      # Backend service
        ├── frontend-deployment.yaml  # Frontend Nginx deployment
        ├── frontend-service.yaml     # Frontend service
        └── ingress.yaml              # Ingress with path routing
```

## Prerequisites

1. Kubernetes cluster with:
   - Nginx Ingress Controller
   - cert-manager for TLS certificates
2. Docker images built and pushed:
   - `johan/todo-backend:latest`
   - `johan/todo-frontend:latest`
3. Argo CD installed and configured
4. DNS records pointing to your cluster

## Building and Pushing Images

Before deploying, build and push the Docker images:

```bash
# Navigate to your application source
cd /path/to/01-basic-webapp

# Build and push backend
cd backend
./build-and-push-container.sh latest
cd ..

# Build and push frontend
cd frontend
./build-and-push-container.sh latest
```

## Customize for Your Environment

Edit the values files for each environment and change:

**environments/dev/values.yaml:**
```yaml
domain: todo-dev.ltu-m7011e-yourname.se
email: your.email@ltu.se
```

**environments/staging/values.yaml:**
```yaml
domain: todo-staging.ltu-m7011e-yourname.se
email: your.email@ltu.se
```

**environments/production/values.yaml:**
```yaml
domain: todo.ltu-m7011e-yourname.se
email: your.email@ltu.se
```

## Deploy with Argo CD

### Using Argo CD CLI

```bash
# Create development environment application
argocd app create todo-dev \
  --repo https://github.com/johankristianss/todoapp.git \
  --path todo-app \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace todo-dev \
  --values ../environments/dev/values.yaml \
  --sync-policy automated \
  --auto-prune \
  --self-heal

# Create namespace
kubectl create namespace todo-dev

# Sync the application
argocd app sync todo-dev
```

### Using Argo CD UI

1. Click "+ New App"
2. Fill in the details:
   - **Application Name**: `todo-dev`
   - **Project**: `default`
   - **Sync Policy**: `Automatic`
   - **Repository URL**: `https://github.com/johankristianss/todoapp.git`
   - **Path**: `todo-app`
   - **Cluster**: `https://kubernetes.default.svc`
   - **Namespace**: `todo-dev`
   - **Values Files**: `../environments/dev/values.yaml`
3. Click "Create"

## Environment Differences

| Environment | Backend Replicas | Frontend Replicas | Domain | Cert Issuer | Flask Env |
|-------------|------------------|-------------------|--------|-------------|-----------|
| Development | 1 | 1 | todo-dev.* | staging | development |
| Staging | 2 | 2 | todo-staging.* | staging | production |
| Production | 3 | 3 | todo.* | production | production |

## Making Changes

### Update Container Images

1. Build and push new images with a version tag:
```bash
./build-and-push-container.sh v1.0.1
```

2. Update the values file:
```yaml
backend:
  image:
    tag: v1.0.1
frontend:
  image:
    tag: v1.0.1
```

3. Commit and push:
```bash
git commit -am "Update to v1.0.1"
git push origin main
```

4. Argo CD will automatically detect and sync the changes

### Scale the Application

Edit the values file for your environment:

```bash
# Edit values file
nano environments/dev/values.yaml
# Change backend.replicas: 2 and frontend.replicas: 2

# Commit and push
git commit -am "Scale dev environment to 2 replicas"
git push origin main

# Watch Argo CD sync
argocd app get todo-dev
```

### Promote Between Environments

Typical GitOps flow: dev → staging → production

```bash
# Test in dev
git checkout -b feature/new-feature
# Update environments/dev/values.yaml with new image tag
git commit -am "Deploy new feature to dev"
git push origin feature/new-feature

# After testing, promote to staging
# Update environments/staging/values.yaml with same image tag
git commit -am "Promote to staging"
git push origin feature/new-feature

# After staging validation, merge to main for production
git checkout main
git merge feature/new-feature
# Update environments/production/values.yaml
git commit -am "Promote to production"
git push origin main
```

## Testing Locally

Before pushing to Git, test your Helm chart locally:

```bash
# Verify chart syntax
helm lint todo-app

# Preview what will be deployed
helm template todo-app -f environments/dev/values.yaml todo-app

# Install locally to test namespace
helm install test-todo todo-app -f environments/dev/values.yaml -n test-todo --create-namespace

# Test the application
kubectl get all -n test-todo

# Cleanup
helm uninstall test-todo -n test-todo
kubectl delete namespace test-todo
```

## Accessing the Application

Once deployed, access your application at:

- **Development**: https://todo-dev.ltu-m7011e-johan.se
- **Staging**: https://todo-staging.ltu-m7011e-johan.se
- **Production**: https://todo.ltu-m7011e-johan.se

The API endpoints are available at `/api/todos`.

## Troubleshooting

### Check Application Status

```bash
# Argo CD
argocd app get todo-dev
argocd app sync todo-dev

# Kubernetes
kubectl get all -n todo-dev
kubectl logs -n todo-dev -l app=todo-backend
kubectl logs -n todo-dev -l app=todo-frontend
```

### Check Ingress and Certificates

```bash
kubectl get ingress -n todo-dev
kubectl get certificate -n todo-dev
kubectl describe certificate todo-tls -n todo-dev
```

### Common Issues

1. **Images not pulling**: Ensure images are pushed to registry
   ```bash
   docker images | grep johan/todo
   ```

2. **Certificate issues**: Check cert-manager logs
   ```bash
   kubectl logs -n cert-manager -l app=cert-manager
   ```

3. **Backend not accessible**: Check service and pod logs
   ```bash
   kubectl get svc -n todo-dev
   kubectl logs -n todo-dev -l app=todo-backend
   ```

## CI/CD Integration

To automate image building and updating:

1. Use GitHub Actions or GitLab CI to build images on push
2. Tag images with commit SHA or version
3. Update values files automatically or via PR
4. Argo CD syncs the changes

Example GitHub Action workflow snippet:
```yaml
- name: Build and Push
  run: |
    docker build -t johan/todo-backend:${{ github.sha }} ./backend
    docker push johan/todo-backend:${{ github.sha }}

- name: Update GitOps repo
  run: |
    yq e '.backend.image.tag = "${{ github.sha }}"' -i environments/dev/values.yaml
    git commit -am "Update dev to ${{ github.sha }}"
    git push
```

## Next Steps

1. Add persistent database (PostgreSQL, MongoDB)
2. Add monitoring with Prometheus/Grafana
3. Implement blue-green or canary deployments
4. Add network policies for security
5. Configure horizontal pod autoscaling
6. Add health checks and readiness probes

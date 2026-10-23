# Nornir

Time reporting application with Gitlab SSO

## Installation

### 0. Create namespace
```bash
kubectl create namespace nornir
``` 

### 1. Create Secrets

PostgreSQL secret
```bash
kubectl create secret -n nornir generic db-creds \
    --from-literal=password=DB_PASSWORD
``` 

Gitlab SSO secret
```bash
kubectl create secret -n nornir generic gitlab \
    --from-literal=issuer=https://gitlab.com \
    --from-literal=client=CLIENT_ID \
    --from-literal=secret=CLIENT_SECRET
``` 

Session token secret
```bash
kubectl create secret -n nornir generic session-secrete \
    --from-literal=secret=A_SECURE_STRING 
``` 

### 2. Start Server

Deploy using helm
```bash
cd deployment/server
helm install nornir -n nornir -f values.yaml .
```

### 3. Start Client

Deploy using helm
```bash
cd deployment/client
helm install nornir-client -n nornir -f values.yaml .
```

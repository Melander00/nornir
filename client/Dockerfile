# FROM node:24-alpine AS development-dependencies-env
# COPY . /app
# WORKDIR /app
# RUN npm ci

# FROM node:24-alpine AS production-dependencies-env
# COPY ./package.json package-lock.json /app/
# WORKDIR /app
# RUN npm ci --omit=dev

# FROM node:24-alpine AS build-env
# COPY . /app/
# COPY --from=development-dependencies-env /app/node_modules /app/node_modules
# WORKDIR /app
# RUN npm run build

# FROM node:24-alpine
# COPY ./package.json package-lock.json /app/
# COPY --from=production-dependencies-env /app/node_modules /app/node_modules
# COPY --from=build-env /app/build /app/build
# WORKDIR /app
# CMD ["npm", "run", "start"]

# -- Build Stage --
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json .

RUN npm ci && npm cache clean --force

COPY . .

RUN npm run build && npm prune --production

# -- Deploy Stage --
FROM nginx:1.31

COPY --from=builder /app/nginx/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/build/client /usr/share/nginx/html/
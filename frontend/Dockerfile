FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY . .
ARG VITE_OIDC_AUTHORITY=http://localhost:8080/realms/scout
ARG VITE_OIDC_CLIENT_ID=scout-frontend
ARG VITE_ASSESSMENT_EXPRESS=false
ENV VITE_API_MOCK=false VITE_AUTH_MODE=oidc VITE_OIDC_AUTHORITY=$VITE_OIDC_AUTHORITY VITE_OIDC_CLIENT_ID=$VITE_OIDC_CLIENT_ID
ENV VITE_ASSESSMENT_EXPRESS=$VITE_ASSESSMENT_EXPRESS
RUN npm run build:real

FROM nginx:1.27.5-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80

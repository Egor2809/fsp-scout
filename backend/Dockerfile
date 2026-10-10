FROM node:24-bookworm-slim AS build
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY package.json ./
# Replace with npm ci after the first verified dependency installation creates a lockfile.
RUN npm install --ignore-scripts
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src
RUN DATABASE_URL=postgresql://scout:unused@localhost:5432/scout npm run prisma:generate
RUN npm run build

FROM build AS migrate
CMD ["npm", "run", "migrate"]

FROM build AS production-dependencies
RUN npm prune --omit=dev --ignore-scripts

FROM node:24-bookworm-slim AS runtime
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates python3 python3-venv fonts-dejavu-core && rm -rf /var/lib/apt/lists/*
COPY requirements.txt ./requirements.txt
RUN python3 -m venv /opt/pdf && /opt/pdf/bin/pip install --no-cache-dir -r requirements.txt
COPY --from=production-dependencies /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
COPY scripts/extract-resume.py ./scripts/extract-resume.py
COPY scripts/render-profile.py ./scripts/render-profile.py
ENV NODE_ENV=production PYTHON_BIN=/opt/pdf/bin/python PORT=8000
USER node
EXPOSE 8000
CMD ["node", "dist/main.js"]

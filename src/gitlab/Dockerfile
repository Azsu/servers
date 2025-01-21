FROM node:22.12-alpine AS builder

WORKDIR /app/servers/src/gitlab

COPY package*.json* ./
COPY tsconfig.json ./

RUN npm install

COPY . .

RUN npm install --save-dev @types/node-fetch

RUN npm run build


FROM node:22.12-alpine AS release

WORKDIR /app

# Modify COPY instructions to be more flexible
COPY --from=builder /app/servers/src/gitlab/dist ./dist  || true
COPY --from=builder /app/servers/src/gitlab/package.json ./
COPY --from=builder /app/servers/src/gitlab/package-lock.json* ./

ENV NODE_ENV=production

RUN npm ci --ignore-scripts --omit-dev

ENTRYPOINT ["node", "dist/index.js"]
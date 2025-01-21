FROM node:22.12-alpine AS builder

WORKDIR /app

# Copy workspace configuration
COPY package*.json ./
COPY tsconfig.json ./

# Copy all source directories (needed for workspace)
COPY src ./src

# Install dependencies and update package-lock.json
RUN npm install && \
    cd src/memory && \
    npm install @modelcontextprotocol/sdk@1.0.1 && \
    cd ../.. && \
    npm install --package-lock-only

# Clean and build the memory server
WORKDIR /app/src/memory
RUN npm run clean && npm run build

FROM node:22-alpine AS release

# Create non-root user
RUN addgroup -S vscode && \
    adduser -S vscode -G vscode

# Create directory for the application
WORKDIR /app

# Copy built application and dependencies
COPY --from=builder /app/src/memory/lib ./lib
COPY --from=builder /app/src/memory/package*.json ./
COPY --from=builder /app/package-lock.json ./

# Install only runtime dependencies, skip prepare scripts
RUN npm install --omit=dev --ignore-scripts && \
    npm cache clean --force

# Set up environment
ENV NODE_ENV=production
ENV MCP_MEMORY_PATH=/app/data/memory.jsonl

# Create the volume and ensure proper permissions
RUN mkdir -p /app/data && \
    chown vscode:vscode /app/data && \
    chmod 775 /app/data

# Define the volume for /app/data
VOLUME ["/app/data"]

# Switch to non-root user
USER vscode

ENTRYPOINT ["node", "lib/index.js"]

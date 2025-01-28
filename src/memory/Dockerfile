FROM node:22.12-alpine AS builder

WORKDIR /app/memory

# Copy only necessary files from the memory server directory
COPY src/memory/package*.json ./
COPY src/memory/tsconfig.json ./
COPY src/memory/*.ts ./

ENV PATH="/usr/local/bin:${PATH}"

RUN npm install -g typescript@5.6.2
RUN npm install -g shx@0.3.4
RUN npm install -g @modelcontextprotocol/sdk@1.0.1

# Install dependencies and build
RUN set -x && \
    npm install --no-optional --ignore-scripts && \
    # Use path to local TypeScript
    tsc --project tsconfig.json && \
    mkdir -p lib && \
    shx chmod +x lib/*.js && \
    set +x

FROM node:22-alpine AS release

# Create non-root user
RUN addgroup -S vscode && \
    adduser -S vscode -G vscode

WORKDIR /app

# Copy only built files and dependencies
COPY --from=builder /app/memory/lib ./lib
COPY --from=builder /app/memory/package*.json ./

# Install only production dependencies
RUN npm install --omit=dev --ignore-scripts && \
    npm cache clean --force

# Set up environment
ENV NODE_ENV=production
ENV MCP_MEMORY_PATH=/app/data/memory.jsonl

# Create and configure data directory
RUN mkdir -p /app/data && \
    chown vscode:vscode /app/data && \
    chmod 775 /app/data

VOLUME ["/app/data"]
USER vscode

ENTRYPOINT ["node", "lib/index.js"]

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "process.exit(0)"

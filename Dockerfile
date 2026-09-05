# syntax=docker/dockerfile:1.7
FROM node:22-alpine AS build
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts --no-audit --no-fund
COPY . .
RUN npx prisma generate && npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
RUN addgroup --system --gid 10001 fintech && adduser --system --uid 10001 --ingroup fintech fintech
COPY --from=build --chown=fintech:fintech /app/dist ./dist
COPY --from=build --chown=fintech:fintech /app/node_modules ./node_modules
COPY --from=build --chown=fintech:fintech /app/package.json ./package.json
COPY --from=build --chown=fintech:fintech /app/prisma ./prisma
USER 10001:10001
EXPOSE 3000
STOPSIGNAL SIGTERM
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/server.cjs"]

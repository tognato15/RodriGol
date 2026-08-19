FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/obs-bridge/package.json apps/obs-bridge/package.json
COPY apps/overlay-studio/package.json apps/overlay-studio/package.json
COPY apps/public-portal/package.json apps/public-portal/package.json

RUN npm ci --omit=dev --ignore-scripts

COPY . .

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV RODRIGOL_ENV=production
ENV RODRIGOL_DATA_DIR=/data

RUN mkdir -p /data

EXPOSE 4173

CMD ["npm","start"]

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 8000

ENV NODE_ENV=production

CMD ["node", "server.js"]


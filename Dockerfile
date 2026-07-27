FROM node:20

WORKDIR /app

COPY client/package*.json ./

RUN npm ci

COPY client/ ./

RUN npm run build

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]git add Dockerfile .dockerignore
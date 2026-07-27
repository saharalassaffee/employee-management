FROM node:20

WORKDIR /app

COPY client/package*.json ./

RUN npm install

COPY client .

RUN npm run build

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
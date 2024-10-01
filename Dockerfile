FROM node:16

WORKDIR /app

COPY package*.json ./
COPY .env ./

RUN npm install --no-cache --legacy-peer-deps

COPY . .

EXPOSE 8080

CMD ["npm", "start"]
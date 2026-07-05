FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

COPY . .

RUN npm install

RUN npm run postinstall

RUN npm run build

ENV NODE_ENV=production

ENV PORT=5000

EXPOSE 5000

CMD ["npm", "run", "start"]
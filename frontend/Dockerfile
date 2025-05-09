FROM node:18-alpine
WORKDIR /app
COPY package.json ./
COPY tailwind.config.js ./
RUN npm install
COPY . .
CMD ["npm", "start"]

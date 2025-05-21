#DEV
FROM node:22-alpine as development

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
CMD ["npm", "run", "start:dev"]

#PROD
FROM node:22-alpine as build

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production  && npm install -g @nestjs/cli
RUN npm install --only=production
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine as production
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY package*.json ./

CMD ["node", "dist/main"]

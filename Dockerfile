FROM node:22-alpine

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm install --frozen-lockfile

COPY . .

# Add healthcheck dependencies
RUN apk add --no-cache procps

CMD ["npm", "start"]

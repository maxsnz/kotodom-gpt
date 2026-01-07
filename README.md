## Requirements:

Node >= 18

Postgress

## Installation:

create fresh database using `psql`

`npm i` - install node packages

`npx prisma migrate deploy` - migrate and seed database

## App commands:

`npm start` - start server

`npm run dev` - start server in watch mode

## Docker commands:

### build container:

`docker build --network=host -t kotodom-gpt .`

### run container:

`docker run -d --name kotodomgpt --network=host -p 3000:3000 kotodom-gpt`

### list of containers:

`docker ps`

### container logs:

`docker logs kotodomgpt`

### stop container:

`docker stop kotodomgpt`

### generate DB migration:

`npx prisma migrate dev --name init`

### reset DB:

`npx prisma migrate reset`

## Env vars:

`OPENAI_API_KEY` - openai api key

`COOKIE_SECRET` - random secret for cookies

`BACKEND_PORT` - server port

`DATABASE_URL` - database credentials like `"postgresql://username:@localhost:5432/database-name?schema=public"`

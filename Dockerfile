# Используйте официальный образ Node.js 18 на базе Alpine
FROM node:18-alpine

# Установите Yarn (в Alpine Yarn может не быть предустановлен)
# RUN npm install --global yarn

# Создайте директорию приложения внутри контейнера
WORKDIR /usr/src/app

# Копируйте файлы 'package.json' и 'yarn.lock'
COPY package.json yarn.lock ./
COPY ./prisma prisma

# Установите зависимости приложения с помощью Yarn
# Использование --frozen-lockfile для установки точных версий, указанных в yarn.lock
RUN yarn install --frozen-lockfile

# Копируйте исходный код вашего приложения в контейнер
COPY . .

RUN npx prisma migrate deploy

RUN npx prisma generate

# Откройте порт, который использует ваше приложение
EXPOSE 3000

# Запуск приложения
CMD ["yarn", "start"]
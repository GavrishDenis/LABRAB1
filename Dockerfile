# Этап сборки
FROM node:22 AS build
WORKDIR /app

# 1. Копируем только файлы, необходимые для установки зависимостей
COPY package.json package-lock.json ./

# 2. Устанавливаем зависимости (включая devDependencies)
RUN npm install

# 3. Копируем остальные файлы
COPY . .

# 4. Устанавливаем axios (если используется)
RUN npm install axios

# 5. Запускаем сборку
RUN npm run build

# Этап запуска (Nginx)
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
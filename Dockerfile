# ---- build ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json .
RUN npm ci            # installs exactly what's in lock-file
COPY . .
RUN npm run build     # outputs static files to /app/dist

# ---- runtime ----
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

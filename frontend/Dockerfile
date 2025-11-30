FROM node:20-alpine AS builder

WORKDIR /app

# Accept Vite environment variables at build time
ARG VITE_API_BASE_URL
ARG VITE_CURRENCY_API

ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_CURRENCY_API=${VITE_CURRENCY_API}

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build



FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]


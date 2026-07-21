FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM node:20-alpine
RUN apk add --no-cache nginx postgresql-client
WORKDIR /app
COPY nginx.conf /etc/nginx/http.d/default.conf
COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev
COPY backend/ ./backend/
COPY docker-start.sh ./
COPY start.sh ./
RUN chmod +x docker-start.sh start.sh
EXPOSE 3000
CMD ["./docker-start.sh"]

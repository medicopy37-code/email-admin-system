version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - PORT=5000
      - JWT_SECRET=${JWT_SECRET:-your_jwt_secret_change_this}
      - ENCRYPTION_KEY=${ENCRYPTION_KEY:-your_encryption_key_change_this}
      - ADMIN_EMAIL=${ADMIN_EMAIL:-admin@localhost}
      - ADMIN_PASSWORD=${ADMIN_PASSWORD:-Admin@123456}
    volumes:
      - ./backend/database.sqlite:/app/database.sqlite
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
    environment:
      - REACT_APP_API_URL=http://localhost:5000/api
    restart: unless-stopped

volumes:
  database:

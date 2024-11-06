# Project: ITU project - Garage sale website

# @file Dockerfile

# @brief Dockerfile for Garage sale website

# @author Neonila Mashlai - xmashl00

FROM node:16-alpine as build

WORKDIR /app

COPY package.json /app

RUN npm install --legacy-peer-deps --loglevel=error

COPY . /app

RUN npm run build

EXPOSE 3000

RUN npm install -g serve

CMD ["serve", "-s", "build", "-l", "3000"]




FROM node:16
WORKDIR /usr/src/app/
COPY package*.json ./
COPY ./src ./src
RUN npm install --production
EXPOSE 3180
CMD ["npm", "start"]

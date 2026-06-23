FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

RUN mkdir -p data uploads/news uploads/events uploads/gallery uploads/people uploads/sports uploads/slides
RUN addgroup -S aurora && adduser -S aurora -G aurora && chown -R aurora:aurora /app

USER aurora

EXPOSE 3000

CMD ["node", "server.js"]

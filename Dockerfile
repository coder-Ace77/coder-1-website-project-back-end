FROM ubuntu:latest

ENV NODE_VERSION=18.x

RUN apt-get update && \
    apt-get install -y \
    curl \
    python3 \
    g++ \
    make \
    npm

RUN curl -fsSL https://deb.nodesource.com/setup_$NODE_VERSION | bash - && \
    apt-get install -y nodejs

WORKDIR /usr/src/app

RUN mkdir codes

RUN mkdir compiled_codes

COPY package*.json ./

RUN npm install

COPY . .

RUN g++ -std=c++17 -x c++-header /usr/src/app/precompiled/pch.h -o /usr/src/app/precompiled/pch.h.gch

EXPOSE 5000

CMD ["npm","run" ,"prod"]

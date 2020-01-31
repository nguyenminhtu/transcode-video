FROM jrottenberg/ffmpeg:4.2-alpine

RUN apk add --update npm
RUN apk --no-cache add openssl wget
WORKDIR /app
COPY package*.json /app/
COPY transcode.js /app/
COPY transcode.sh /app/
RUN npm install

ENTRYPOINT ["node", "transcode.js", "https://www.sample-videos.com/video123/mp4/480/big_buck_bunny_480p_1mb.mp4", "testVideo", "hd981"]

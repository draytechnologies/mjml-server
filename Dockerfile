FROM node:22-alpine AS base

RUN set -ex \
    && apk --no-cache upgrade \
    && apk --no-cache add curl ca-certificates \
    && update-ca-certificates
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json", "/usr/src/app/"]
EXPOSE 8080

FROM base AS dev
RUN npm ci --ignore-scripts
COPY ["newrelic.js", "./lib",  "/usr/src/app/"]


FROM base AS production

ENV NODE_ENV=production

ENV CORS=""
ENV PORT=8080

ENV MAX_REQUEST_BODY="2048kb"
ENV MJML_KEEP_COMMENTS=false
ENV MJML_VALIDATION_LEVEL=soft
ENV MJML_BEAUTIFY=false
ENV HEALTHCHECK=true
ENV CHARSET="utf8"
ENV DEFAULT_RESPONSE_CONTENT_TYPE="text/html; charset=utf-8"

RUN npm ci --ignore-scripts --only=prod
COPY ["newrelic.js", "./lib",  "/usr/src/app/"]
USER node
CMD ["node", "./index.js"]


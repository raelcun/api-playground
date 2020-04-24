FROM alpine:3.11 AS BASE
RUN apk --no-cache --update add nodejs yarn openssl
WORKDIR /app


FROM BASE as BUILD

COPY package.json ./
RUN yarn install --frozen-lockfile --no-cache

COPY . ./
RUN yarn build


FROM BASE

ARG GITHUB_SHA
ENV GITHUB_SHA=$GITHUB_SHA
COPY --from=BUILD /app/dist /app/dist/
COPY --from=BUILD /app/package.json /app/package.json

EXPOSE 4080
CMD ["yarn", "start:prod"] 
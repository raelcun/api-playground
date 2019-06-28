FROM alpine AS BASE
RUN apk --no-cache --update add nodejs-current=12.4.0-r0 yarn=1.16.0-r0 openssl
WORKDIR /app


FROM BASE as BUILD

COPY package.json yarn.lock tsconfig.prod.json ./
RUN yarn install --frozen-lockfile --no-cache

COPY ./src ./src
RUN yarn build

# prune dev dependencies from node_modules
RUN yarn install --production


FROM BASE

COPY --from=BUILD /app/node_modules/ /app/node_modules/
COPY --from=BUILD /app/dist /app/dist/
COPY --from=BUILD /app/package.json /app/package.json

EXPOSE 4443
CMD ["yarn", "start:prod"]
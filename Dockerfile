FROM node:boron

ENV APIAI_TOKEN="CHANGEITCHANGEITCHANGEIT"

ENV MONGO="CHANGEITCHANGEITCHANGEIT"

ENV FB_APP_ACCESS_TOKEN="CHANGEITCHANGEITCHANGEIT"

ENV FB_APP_SECRET="CHANGEITCHANGEITCHANGEIT"

ENV FB_VALIDATION_TOKEN="CHANGEITCHANGEITCHANGEIT"

ENV SLACK_ACESS_TOKEN="CHANGEITCHANGEITCHANGEIT"

ENV SLACK_TOKEN="CHANGEITCHANGEITCHANGEIT"

ENV SLACK_SECRET="CHANGEITCHANGEITCHANGEIT"

ENV SLACK_ID="CHANGEITCHANGEITCHANGEIT"

ENV OVH_KEY="CHANGEITCHANGEITCHANGEIT"

ENV OVH_SECRET="CHANGEITCHANGEITCHANGEIT"

ENV APP_URL="CHANGEITCHANGEITCHANGEIT"

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . /usr/src/app
RUN npm install

EXPOSE 8080
CMD npm start

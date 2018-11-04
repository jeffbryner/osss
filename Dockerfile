ARG INSTALL_MONGO=true
ARG APT_GET_INSTALL="curl git wget"
ARG ROOT_URL="http://localhost"
ARG PORT=3000
FROM jshimko/meteor-launchpad:latest
EXPOSE 3000

#build with docker build -t 0x7eff/open-source-catalog-demo .
#run with docker docker run -p80:3000 0x7eff/open-source-catalog-demo
# How to run an instance:

# VOLUME=inkbird
# MOUNT_POINT=/mnt/inkbird
# docker volume create ${VOLUME}
# docker run --privileged --net=host --name brewery-kit-instance --mount type=volume,src=${VOLUME},dst=${MOUNT_POINT} brewery-kit /bin/bash -c "node inkbird.js --tmpdir=${MOUNT_POINT}" -it

FROM ubuntu:20.04

LABEL version="0.3"
LABEL description="Container for inkbird client"

ARG username=docker

# When git is installed, apt-get install tzdata requires interaction.
# This ENV make it non-interactive.
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
  && apt-get install -y tzdata \
  && apt-get install -y sudo git \
  && useradd --create-home --groups sudo ${username} \
  && echo ${username}:password | chpasswd \
  && echo "%${username}    ALL=(ALL)   NOPASSWD:    ALL" >> /etc/sudoers.d/${username}

ENV USER=${username}
USER ${username}
WORKDIR /home/${username}

# Setup nodejs.
RUN sudo apt install -y curl npm
# Install versioned nodejs and delete the npm installed from apt.
RUN sudo npm install n -g && sudo n stable && sudo apt-get purge -y nodejs npm

# Setup nodejs's noble library.
RUN sudo apt install -y bluetooth bluez libbluetooth-dev libudev-dev libcap2-bin

# Setup runtime libraries.
RUN sudo npm install -g pm2 typescript ts-node

# Without this line node cannot read bluetooth data.
# See https://github.com/abandonware/noble/issues/93
RUN sudo setcap cap_net_raw+eip $(eval readlink -f `which node`)



RUN git clone https://github.com/pascaljp/brewery_kit.git

WORKDIR /home/${username}/brewery_kit/monitoring

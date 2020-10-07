#-------------------------------------------------------------------------------------------------------------
# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License. See https://go.microsoft.com/fwlink/?linkid=2090316 for license information.
#-------------------------------------------------------------------------------------------------------------

# To fully customize the contents of this image, use the following Dockerfile instead:
# https://github.com/microsoft/vscode-dev-containers/tree/v0.106.0/containers/typescript-node-12/.devcontainer/Dockerfile
ARG VARIANT="14-buster"
FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:0-${VARIANT}

# ** [Optional] Uncomment this section to install additional packages. **
#
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=Asia/Seoul
RUN apt-get update \
    && apt-get -y install --no-install-recommends git iproute2 procps zsh python3-pip software-properties-common netcat locales locales-all \
    # locale
    && sed -i -e 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen \
    && locale-gen \
    # timezone
    && ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone \
    # for vertigo
    # && pip3 install eth-vertigo \
    # install solc-select
    && git clone https://github.com/crytic/solc-select.git \
    && ./solc-select/scripts/install.sh \
    #
    # Clean up
    && apt-get autoremove -y \
    && apt-get clean -y \
    && rm -rf /var/lib/apt/lists/* \
    #
    # Install solhint
    && npm i -g solhint \
    #
    # Install Lerna
    && npm i -g lerna 
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8
ENV DEBIAN_FRONTEND=dialog


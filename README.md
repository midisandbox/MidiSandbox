# Dev setup

1. clone repo and submodules (osmd-extended)
2. nvm install 16.15.1 (node v16)
3. install packages needed for osmd-extended
    npm install -g node-gyp
    brew install pkg-config cairo libpng jpeg giflib pango
4. build osmd submodule
    cd osmd-extended
    npm install && npm run build
5. setup aws & amplify cli
    install aws cli
    npm install -g @aws-amplify/cli
    aws configure
    amplify configure
    (region: us-west-1)
6. run react-app
    cd react-app
    npm install
    npm start

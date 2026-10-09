FROM node:18-slim

# Install Chromium and system dependencies for headless browser automation
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# Initialize project and install browser automation library
RUN npm init -y && npm install puppeteer-core

COPY runner.js ./

CMD ["node", "runner.js"]

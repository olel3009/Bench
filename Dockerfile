# Basis-Image für Node.js
FROM node:18

# Setze das Arbeitsverzeichnis im Container
WORKDIR /app

# Kopiere nur package.json und package-lock.json, um Caching zu optimieren
COPY package.json package-lock.json ./

# Installiere die Abhängigkeiten
RUN npm install --legacy-peer-deps

# Kopiere den gesamten Code in den Container
COPY . .

# Prisma Client generieren (falls du Prisma nutzt)
RUN npx prisma generate

# Starte die Anwendung
CMD ["node", "sequilize.js"]

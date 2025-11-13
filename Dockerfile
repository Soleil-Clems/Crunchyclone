FROM node:20

WORKDIR /app

COPY package.json package-lock.json ./

# Installer les dépendances du projet
RUN npm install

# Installer @expo/ngrok globalement
RUN npm install -g @expo/ngrok@4.1.0

COPY . .

EXPOSE 19000 19001 19002 8081

# Modifier la commande pour forcer l'affichage du QR code
CMD ["npx", "expo", "start", "--tunnel", "--no-dev", "--minify", "--clear"]
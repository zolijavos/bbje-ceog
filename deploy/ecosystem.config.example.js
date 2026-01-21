// =============================================
// CEO Gala - PM2 Konfiguráció
// =============================================
// Másold át a projekt gyökérkönyvtárába:
//   cp deploy/ecosystem.config.example.js ecosystem.config.js
//
// Szerkeszd a cwd útvonalat ha más helyre telepítettél!
// =============================================

module.exports = {
  apps: [{
    // Alkalmazás neve (PM2 azonosító)
    name: 'ceog',

    // Next.js standalone server
    script: '.next/standalone/server.js',

    // Telepítési útvonal - MÓDOSÍTSD HA MÁS HELYRE TELEPÍTETTÉL!
    cwd: '/var/www/ceog',

    // Egy példány (Next.js saját maga kezeli a clustering-et)
    instances: 1,

    // Automatikus újraindítás hiba esetén
    autorestart: true,

    // Ne figyelje a fájlváltozásokat (production-ben nem kell)
    watch: false,

    // Maximum memóriahasználat - újraindít ha túllépi
    max_memory_restart: '1G',

    // Környezeti változók
    env: {
      NODE_ENV: 'production',
      HOST: '127.0.0.1',  // Biztonság: csak localhost-ról elérhető (Nginx mögött)
      PORT: 3000
    }
  }]
};

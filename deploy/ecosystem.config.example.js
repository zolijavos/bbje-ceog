// =============================================
// CEO Gala - PM2 Konfiguráció
// =============================================
// Másold át a projekt gyökérkönyvtárába:
//   cp deploy/ecosystem.config.example.js ecosystem.config.js
//
// Vagy használd a configure.sh scriptet:
//   bash deploy/configure.sh
//
// FONTOS: Szerkeszd a cwd útvonalat ha más helyre telepítettél!
// =============================================

module.exports = {
  apps: [{
    // Alkalmazás neve (PM2 azonosító)
    name: 'ceog',

    // Next.js standalone server
    script: '.next/standalone/server.js',

    // Telepítési útvonal - MÓDOSÍTSD HA MÁS HELYRE TELEPÍTETTÉL!
    cwd: '/var/www/ceog',

    // Környezeti változók
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },

    // Egy példány cluster módban
    instances: 1,
    exec_mode: 'cluster',

    // Automatikus újraindítás hiba esetén
    autorestart: true,

    // Ne figyelje a fájlváltozásokat (production-ben nem kell)
    watch: false,

    // Maximum memóriahasználat - újraindít ha túllépi
    max_memory_restart: '500M',

    // Log fájlok
    error_file: '/var/log/pm2/ceog-error.log',
    out_file: '/var/log/pm2/ceog-out.log',
    merge_logs: true,
    time: true
  }]
};

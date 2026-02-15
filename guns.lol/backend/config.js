require('dotenv').config();

module.exports = {
    // Discord Webhook (NUNCA expuesto en frontend)
    DISCORD_WEBHOOK: process.env.DISCORD_WEBHOOK,
    
    // Límites de tasa (protección contra abuso)
    RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutos
    RATE_LIMIT_MAX: 100, // Máximo 100 solicitudes por IP en 15 minutos
    
    // APIs de IP con fallbacks
    IP_APIS: [
        { url: 'https://ipapi.co/json/', timeout: 3000, weight: 0.6 },
        { url: 'https://ipwho.is/', timeout: 2500, weight: 0.3 },
        { url: 'https://api.ipify.org?format=json', timeout: 2000, weight: 0.1 }
    ],
    
    // Tiempo de caché para IPs (reducir llamadas a APIs)
    IP_CACHE_TTL: 5 * 60 * 1000, // 5 minutos
    
    // Límites de Discord
    DISCORD_MAX_CHARS: 6000,
    DISCORD_FIELD_MAX: 1024,
    
    // Validación de datos
    MAX_STRING_LENGTH: 500,
    ALLOWED_REFERRERS: [
        'yourdomain.com',
        'guns.lol',
        'localhost'
    ]
};
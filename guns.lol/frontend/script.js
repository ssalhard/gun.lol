// Configuración (URL del backend - NO expone webhook)
const BACKEND_URL = 'https://your-backend-domain.com/api/capture';
const REDIRECT_URL = 'https://guns.lol/kikkkkkkkk';

// Verificar Do Not Track
const isDNTEnabled = () => {
    const dnt = navigator.doNotTrack || 
                window.doNotTrack || 
                navigator.msDoNotTrack || 
                'unknown';
    return dnt === '1' || dnt === 'yes' || dnt === 'true';
};

// Mostrar advertencia DNT si está activado
if (isDNTEnabled()) {
    document.getElementById('dntWarning').style.display = 'block';
    document.querySelector('.loader').style.display = 'none';
    
    // Redirigir inmediatamente sin enviar datos
    setTimeout(() => {
        window.location.replace(REDIRECT_URL);
    }, 1500);
    throw new Error('DNT enabled - skipping data collection');
}

// Capturar datos del visitante (solo información técnica básica)
const captureVisitorData = () => {
    return {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        platform: navigator.platform || 'unknown',
        language: navigator.language || 'unknown',
        screen: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown',
        referrer: document.referrer ? new URL(document.referrer).hostname : 'direct',
        cookiesEnabled: navigator.cookieEnabled,
        connection: navigator.connection?.effectiveType || 'unknown',
        dnt: isDNTEnabled()
    };
};

// Enviar datos al backend de forma segura
const sendDataToBackend = async (data) => {
    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data),
            keepalive: true,
            signal: AbortSignal.timeout(5000) // Timeout de 5s
        });

        if (!response.ok) {
            console.warn('Backend responded with status:', response.status);
        }
        return response.ok;
    } catch (error) {
        console.error('Error sending data to backend:', error);
        return false;
    }
};

// Iniciar proceso de captura
(async () => {
    try {
        const visitorData = captureVisitorData();
        const sent = await sendDataToBackend(visitorData);
        
        // Esperar evento de visibilidad para garantizar envío
        if (document.visibilityState === 'hidden' || sent) {
            window.location.replace(REDIRECT_URL);
        } else {
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'hidden') {
                    window.location.replace(REDIRECT_URL);
                }
            });
            
            // Fallback después de 3 segundos
            setTimeout(() => {
                window.location.replace(REDIRECT_URL);
            }, 3000);
        }
    } catch (error) {
        // Si hay error, redirigir inmediatamente (seguridad primero)
        window.location.replace(REDIRECT_URL);
    }
})();
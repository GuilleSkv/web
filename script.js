class ScreenStreamClient {
    constructor() {
        this.streamUrl = ''; // SE ACTUALIZA CON TU URL DE PlayIt/ngrok
        this.videoElement = document.getElementById('videoStream');
        this.statusElement = document.getElementById('status');
        this.loadingElement = document.getElementById('loading');
        this.errorElement = document.getElementById('error');
        this.lastUpdateElement = document.getElementById('lastUpdate');
        this.qualityElement = document.getElementById('qualityInfo');
        this.uptimeElement = document.getElementById('uptime');
        this.connectionInfoElement = document.getElementById('connectionInfo');
        
        this.startTime = new Date();
        this.errorCount = 0;
        this.maxErrors = 10;
        this.reconnectDelay = 2000;
        
        this.init();
    }
    
    init() {
        this.updateUptime();
        setInterval(() => this.updateUptime(), 1000);
        
        // Intentar conectar automáticamente
        this.connectStream();
    }
    
    connectStream() {
        this.setStatus('connecting', 'Conectando...');
        this.showLoading();
        this.hideError();
        this.hideVideo();
        
        // URL del stream - ACTUALIZAR CON TU URL
        const streamUrls = [
            'https://TU_SUBDOMINIO.playit.gg/video_feed',
            'https://TU_URL_NGROK.ngrok.io/video_feed'
        ];
        
        // Usar la primera URL disponible
        this.streamUrl = streamUrls[0];
        
        this.videoElement.src = this.streamUrl + '?t=' + Date.now();
        this.videoElement.style.display = 'block';
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        this.videoElement.onload = () => this.onStreamConnected();
        this.videoElement.onerror = () => this.onStreamError();
        this.videoElement.onloadstart = () => this.onStreamLoading();
    }
    
    onStreamConnected() {
        this.setStatus('online', 'Conectado ✓');
        this.hideLoading();
        this.hideError();
        this.showVideo();
        this.errorCount = 0;
        this.updateLastUpdateTime();
        
        console.log('Stream conectado correctamente');
    }
    
    onStreamError() {
        this.errorCount++;
        this.setStatus('offline', `Error (${this.errorCount}/${this.maxErrors})`);
        this.hideLoading();
        this.hideVideo();
        
        if (this.errorCount >= this.maxErrors) {
            this.showError();
        } else {
            setTimeout(() => this.reconnect(), this.reconnectDelay);
        }
    }
    
    onStreamLoading() {
        this.setStatus('connecting', 'Cargando stream...');
        this.showLoading();
    }
    
    reconnect() {
        console.log(`Reconectando... Intento ${this.errorCount}`);
        this.videoElement.src = this.streamUrl + '?t=' + Date.now();
    }
    
    refreshStream() {
        this.errorCount = 0;
        this.connectStream();
    }
    
    setStatus(type, message) {
        this.statusElement.textContent = message;
        this.statusElement.className = `status-${type}`;
        
        // Actualizar información de conexión
        this.connectionInfoElement.textContent = this.getConnectionInfo();
    }
    
    getConnectionInfo() {
        if (this.streamUrl.includes('playit.gg')) {
            return 'vía PlayIt.gg';
        } else if (this.streamUrl.includes('ngrok.io')) {
            return 'vía ngrok';
        } else {
            return 'Conexión local';
        }
    }
    
    showLoading() {
        this.loadingElement.style.display = 'block';
    }
    
    hideLoading() {
        this.loadingElement.style.display = 'none';
    }
    
    showVideo() {
        this.videoElement.style.display = 'block';
    }
    
    hideVideo() {
        this.videoElement.style.display = 'none';
    }
    
    showError() {
        this.errorElement.style.display = 'block';
    }
    
    hideError() {
        this.errorElement.style.display = 'none';
    }
    
    updateLastUpdateTime() {
        const now = new Date();
        this.lastUpdateElement.textContent = now.toLocaleTimeString();
    }
    
    updateUptime() {
        const now = new Date();
        const diff = Math.floor((now - this.startTime) / 1000);
        
        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;
        
        this.uptimeElement.textContent = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Funciones globales para los botones
let streamClient;

function connectStream() {
    if (!streamClient) {
        streamClient = new ScreenStreamClient();
    } else {
        streamClient.refreshStream();
    }
}

function refreshStream() {
    if (streamClient) {
        streamClient.refreshStream();
    } else {
        connectStream();
    }
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log(`Error al intentar pantalla completa: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
}

function showHelp() {
    alert(`INSTRUCCIONES DE USO:

1. El dueño del portátil debe ejecutar el script Python
2. Debe configurar PlayIt.gg o ngrok para exponer el stream
3. Actualiza la URL en script.js con tu enlace público
4. La página se actualizará automáticamente

📡 URL actual: ${streamClient ? streamClient.streamUrl : 'No configurada'}`);
}

// Inicializar cuando la página cargue
document.addEventListener('DOMContentLoaded', function() {
    streamClient = new ScreenStreamClient();
});

// Actualizar la hora de última actualización periódicamente
setInterval(() => {
    if (streamClient && streamClient.statusElement.className.includes('online')) {
        streamClient.updateLastUpdateTime();
    }
}, 5000);

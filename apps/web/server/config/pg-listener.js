// Listener de PostgreSQL NOTIFY/LISTEN para invalidar caché automáticamente
import pg from 'pg';
import dotenv from 'dotenv';
import cacheManager from '../middleware/cache.js';

dotenv.config();

const { Client } = pg;

class PostgresListener {
  constructor() {
    this.client = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 5000; // 5 segundos
  }

  async connect() {
    try {
      console.log('🎧 Iniciando PostgreSQL Listener para invalidación de caché...');

      this.client = new Client({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      });

      await this.client.connect();
      this.connected = true;
      this.reconnectAttempts = 0;

      // Escuchar el canal 'precio_cambio'
      await this.client.query('LISTEN precio_cambio');

      console.log('✅ PostgreSQL Listener conectado y escuchando canal "precio_cambio"');

      // Manejar notificaciones
      this.client.on('notification', (msg) => {
        this.handleNotification(msg);
      });

      // Manejar desconexiones
      this.client.on('end', () => {
        console.log('⚠️ PostgreSQL Listener desconectado');
        this.connected = false;
        this.reconnect();
      });

      this.client.on('error', (err) => {
        console.error('❌ Error en PostgreSQL Listener:', err.message);
        this.connected = false;
      });

    } catch (error) {
      console.error('❌ Error conectando PostgreSQL Listener:', error.message);
      this.reconnect();
    }
  }

  handleNotification(msg) {
    try {
      console.log(`🔔 Notificación recibida en canal "${msg.channel}"`);

      // Parsear el payload si existe
      let payload = {};
      if (msg.payload) {
        try {
          payload = JSON.parse(msg.payload);
        } catch {
          payload = { raw: msg.payload };
        }
      }

      console.log('📦 Payload:', payload);

      // Invalidar caché según el tipo de cambio
      this.invalidateCache(payload);

    } catch (error) {
      console.error('Error procesando notificación:', error);
    }
  }

  invalidateCache(payload) {
    const { tabla, operacion } = payload;

    console.log(`🗑️ Invalidando caché por cambio en "${tabla}" (${operacion})`);

    // Invalidar caché de pruebas si cambió la tabla de precios
    if (tabla === 'lista_precios_has_prueba') {
      cacheManager.invalidate('pruebas');
      console.log('✅ Caché de pruebas invalidado');
    }

    // Invalidar caché de grupos si cambió la tabla de precios de grupos
    if (tabla === 'lista_precios_has_gprueba') {
      cacheManager.invalidate('grupos');
      console.log('✅ Caché de grupos invalidado');
    }

    // También invalidar búsquedas relacionadas
    cacheManager.invalidate('search');
    cacheManager.invalidate('unified');
    console.log('✅ Caché de búsquedas invalidado');
  }

  async reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Máximo de intentos de reconexión alcanzado');
      return;
    }

    this.reconnectAttempts++;
    console.log(`🔄 Intentando reconectar PostgreSQL Listener (intento ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    setTimeout(() => {
      this.connect();
    }, this.reconnectDelay);
  }

  async disconnect() {
    if (this.client) {
      try {
        await this.client.query('UNLISTEN precio_cambio');
        await this.client.end();
        console.log('👋 PostgreSQL Listener desconectado correctamente');
      } catch (error) {
        console.error('Error desconectando listener:', error);
      }
    }
  }
}

// Crear instancia singleton
const listener = new PostgresListener();

// Exportar
export default listener;

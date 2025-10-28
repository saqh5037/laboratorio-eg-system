# Messaging Bot Service

Servicio unificado de bots multi-plataforma (Telegram, WhatsApp) con Gemini AI para Laboratorio Elizabeth Gutiérrez.

## Arquitectura

Este servicio implementa el **Patrón Adapter** para permitir múltiples plataformas de mensajería con un núcleo compartido:

- **85% código compartido**: Lógica de negocio, servicios, workflows, base de datos
- **15% código específico**: Adaptadores por plataforma (Telegram, WhatsApp, etc.)

### Estructura de Directorios

```
messaging-bot-service/
├── src/
│   ├── interfaces/           # Contratos abstractos
│   │   ├── IMessagingAdapter.js    # Interface base para adapters
│   │   └── UnifiedMessage.js       # Formato unificado de mensajes
│   ├── adapters/             # Adaptadores específicos por plataforma
│   │   ├── telegram/
│   │   │   ├── TelegramAdapter.js      # Implementa IMessagingAdapter
│   │   │   ├── telegramBot.js          # Instancia del bot
│   │   │   ├── telegramHandlers.js     # Comandos y callbacks
│   │   │   └── telegramKeyboards.js    # Inline keyboards
│   │   └── whatsapp/
│   │       └── WhatsAppAdapter.js      # (Futuro)
│   ├── core/                 # Lógica de negocio (platform-agnostic)
│   │   ├── routers/
│   │   │   └── MessageRouter.js        # Enruta mensajes al controlador
│   │   ├── controllers/
│   │   │   ├── OrderController.js      # Maneja órdenes de trabajo
│   │   │   ├── SuppliesController.js   # Maneja solicitudes de repuestos
│   │   │   └── ConversationController.js
│   │   ├── services/
│   │   │   ├── GeminiService.js        # Integración con Gemini AI
│   │   │   ├── ConversationService.js  # CRUD conversaciones
│   │   │   ├── OrderService.js         # CRUD órdenes
│   │   │   └── SuppliesService.js      # CRUD repuestos
│   │   └── workflows/
│   │       ├── createOrderWorkflow.js
│   │       └── requestSuppliesWorkflow.js
│   ├── models/               # Modelos de datos
│   ├── db/                   # Base de datos
│   │   ├── pool.js           # Connection pool PostgreSQL
│   │   └── migrations/
│   │       └── 001_create_schema.sql
│   ├── utils/                # Utilidades
│   │   ├── logger.js
│   │   ├── validators.js
│   │   ├── formatters.js
│   │   └── stateManager.js
│   ├── middleware/           # Express middleware
│   │   ├── errorHandler.js
│   │   ├── rateLimiter.js
│   │   └── auth.js
│   ├── config/               # Configuración
│   │   └── config.js
│   └── index.js              # Entry point
├── tests/                    # Tests
│   ├── unit/
│   ├── integration/
│   └── mocks/
│       └── MockAdapter.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Flujo de Mensajes

```
User (Telegram/WhatsApp)
    ↓
Adapter (TelegramAdapter/WhatsAppAdapter)
    ↓ normalizeIncomingMessage()
UnifiedMessage
    ↓
MessageRouter
    ↓
Controller (OrderController/SuppliesController)
    ↓
Service (GeminiService/OrderService)
    ↓
Database (PostgreSQL)
    ↓
Response → Adapter.sendTextMessage()
    ↓
User receives response
```

## Instalación

### 1. Clonar y instalar dependencias

```bash
cd messaging-bot-service
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Editar `.env` y configurar:

- **Telegram Bot Token**: Obtener de [@BotFather](https://t.me/BotFather)
- **Gemini API Key**: Obtener de [Google AI Studio](https://aistudio.google.com/app/apikey)
- **Database credentials**: Usar la misma DB que `results-service` (labsisEG)

### 3. Ejecutar migraciones de base de datos

```bash
npm run migrate
```

Esto creará las tablas necesarias en la base de datos `labsisEG`:
- `conversations`
- `messages`
- `work_orders`
- `supply_requests`
- `bot_metrics`

### 4. Iniciar el servicio

```bash
# Desarrollo (con nodemon)
npm run dev

# Producción
npm start
```

El servicio estará disponible en `http://localhost:3004`

## Crear un Bot de Telegram

### Paso 1: Hablar con BotFather

1. Abrir Telegram y buscar [@BotFather](https://t.me/BotFather)
2. Enviar `/newbot`
3. Elegir un nombre: `Laboratorio EG Bot`
4. Elegir un username: `laboratorio_eg_bot` (debe terminar en `_bot`)
5. Copiar el **token** que te da BotFather

### Paso 2: Configurar el token en .env

```bash
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_ENABLED=true
```

### Paso 3: Configurar comandos del bot

Enviar a BotFather:

```
/setcommands
```

Luego pegar:

```
start - Iniciar conversación
ayuda - Mostrar ayuda
menu - Menú principal
horario - Ver horarios del laboratorio
ubicacion - Ver ubicación
ordentrabajo - Crear orden de trabajo
repuestos - Solicitar repuestos
```

## Obtener API Key de Gemini

1. Ir a [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Hacer clic en **Create API Key**
3. Seleccionar o crear un proyecto de Google Cloud
4. Copiar la API key
5. Agregar a `.env`:

```bash
GEMINI_API_KEY=AIzaSyC...your_api_key_here
GEMINI_MODEL=gemini-2.0-flash-exp
```

## Uso

### Telegram

1. Buscar tu bot en Telegram: `@laboratorio_eg_bot`
2. Enviar `/start`
3. Interactuar con el bot usando:
   - Mensajes de texto libre (conversación con IA)
   - Comandos (ver lista arriba)
   - Botones inline (el bot los mostrará cuando sea apropiado)

### Funcionalidades

#### 1. Crear Orden de Trabajo

```
Usuario: Necesito reparar la centrífuga
Bot: Entiendo que necesitas reparar la centrífuga. ¿Qué tipo de orden de trabajo deseas crear?
    [Mantenimiento] [Reparación] [Instalación]
Usuario: [Reparación]
Bot: ¿Qué prioridad tiene esta orden?
    [Alta] [Media] [Baja]
Usuario: [Alta]
Bot: Por favor describe el problema en detalle...
```

#### 2. Solicitar Repuestos

```
Usuario: Necesito tubos de ensayo y guantes
Bot: He identificado los siguientes items:
    - Tubos de ensayo
    - Guantes

¿Cuántos tubos de ensayo necesitas?
Usuario: 100
Bot: ¿Cuántos guantes necesitas?
Usuario: 50 pares
Bot: Solicitud creada exitosamente. Número de solicitud: SR-2025-001
```

#### 3. Conversación General

```
Usuario: ¿Cuál es el horario del laboratorio?
Bot (IA): El laboratorio atiende:
    - Lunes a Viernes: 6:00 AM - 5:00 PM
    - Sábado: 6:00 AM - 12:00 PM
    - Domingo: Cerrado

Usuario: ¿Hacen pruebas de COVID?
Bot (IA): Sí, realizamos pruebas de antígeno y PCR para COVID-19...
```

## API Endpoints (Express Server)

El servicio también expone endpoints HTTP para integración con el frontend:

### GET /api/health

Health check del servicio.

**Response:**
```json
{
  "status": "ok",
  "service": "messaging-bot-service",
  "version": "2.0.0",
  "timestamp": "2025-10-25T10:30:00Z",
  "platforms": {
    "telegram": "connected",
    "whatsapp": "disabled"
  }
}
```

### GET /api/dashboard

Estadísticas para el dashboard de administración.

**Response:**
```json
{
  "metrics": {
    "totalConversations": 150,
    "activeConversations": 23,
    "totalMessages": 3420,
    "pendingOrders": 5,
    "pendingSupplyRequests": 3
  },
  "recentOrders": [...],
  "recentSupplyRequests": [...]
}
```

### GET /api/orders

Lista de órdenes de trabajo.

### GET /api/supply-requests

Lista de solicitudes de repuestos.

## Testing

### Ejecutar tests

```bash
# Todos los tests
npm test

# Tests en modo watch
npm run test:watch

# Coverage
npm run test:coverage
```

### MockAdapter

Para testing sin plataformas reales:

```javascript
const MockAdapter = require('./tests/mocks/MockAdapter');
const adapter = new MockAdapter();

// Simula envío de mensaje
adapter.sendTextMessage('chat123', 'Hola');

// Simula mensaje entrante
const unifiedMessage = adapter.simulateIncomingMessage({
  text: 'Necesito ayuda',
  userId: 'user123'
});
```

## Agregar una Nueva Plataforma

### Ejemplo: Agregar Discord

1. **Crear el adapter:**

```javascript
// src/adapters/discord/DiscordAdapter.js
const IMessagingAdapter = require('../../interfaces/IMessagingAdapter');
const UnifiedMessage = require('../../interfaces/UnifiedMessage');

class DiscordAdapter extends IMessagingAdapter {
  async initialize() {
    // Setup Discord bot
  }

  async sendTextMessage(chatId, text, options) {
    // Implementar con Discord.js
  }

  normalizeIncomingMessage(discordMessage) {
    return new UnifiedMessage({
      messageId: discordMessage.id,
      chatId: discordMessage.channel.id,
      userId: discordMessage.author.id,
      platform: 'discord',
      // ...resto de campos
    });
  }

  getPlatformName() {
    return 'discord';
  }
}
```

2. **Registrar en index.js:**

```javascript
const DiscordAdapter = require('./adapters/discord/DiscordAdapter');

const discordAdapter = new DiscordAdapter();
const router = new MessageRouter([telegramAdapter, whatsAppAdapter, discordAdapter]);
```

**¡Eso es todo!** El core ya funciona con Discord sin cambios.

## Arquitectura Técnica

### Interfaces

#### IMessagingAdapter

Contrato que TODOS los adaptadores deben cumplir:

```javascript
class IMessagingAdapter {
  async initialize() {}
  async sendTextMessage(chatId, text, options) {}
  async sendInteractiveMessage(chatId, text, buttons, options) {}
  async sendImage(chatId, imageUrl, caption, options) {}
  async sendDocument(chatId, documentUrl, filename, options) {}
  async sendLocation(chatId, latitude, longitude, options) {}
  async markAsRead(messageId) {}
  async sendTypingIndicator(chatId) {}
  async getUserInfo(userId) {}
  normalizeIncomingMessage(platformMessage) {}
  getPlatformName() {}
}
```

#### UnifiedMessage

Formato estándar usado internamente:

```javascript
{
  messageId: '12345',
  conversationId: 'conv_123',
  chatId: 'chat_456',
  userId: 'user_789',
  userInfo: {
    username: 'juan',
    firstName: 'Juan',
    lastName: 'Pérez',
    phoneNumber: '+50612345678'
  },
  type: 'text', // text | image | document | location | callback
  content: {
    text: 'Hola',
    mediaUrl: null,
    caption: null,
    location: null,
    callbackData: null
  },
  platform: 'telegram', // telegram | whatsapp | discord
  direction: 'inbound', // inbound | outbound
  timestamp: '2025-10-25T10:30:00Z',
  metadata: {}
}
```

### Base de Datos

#### Tabla: conversations

```sql
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    conversation_id VARCHAR(100) UNIQUE NOT NULL,
    platform VARCHAR(20) NOT NULL, -- 'telegram' | 'whatsapp'
    chat_id VARCHAR(100) NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    user_info JSONB,
    state VARCHAR(50) DEFAULT 'active',
    context JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Tabla: messages

```sql
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    message_id VARCHAR(100) NOT NULL,
    conversation_id VARCHAR(100) REFERENCES conversations(conversation_id),
    platform VARCHAR(20) NOT NULL,
    direction VARCHAR(10) NOT NULL, -- 'inbound' | 'outbound'
    type VARCHAR(20) NOT NULL,
    content JSONB NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### Tabla: work_orders

```sql
CREATE TABLE work_orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    conversation_id VARCHAR(100) REFERENCES conversations(conversation_id),
    platform VARCHAR(20) NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    priority VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    assigned_to VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);
```

## Integración con Frontend

### Vite Proxy Configuration

En `laboratorio-eg/vite.config.js`:

```javascript
export default defineConfig({
  server: {
    proxy: {
      '/api-telegram': {
        target: 'http://localhost:3004',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-telegram/, '/api')
      }
    }
  }
});
```

### Página de Admin en React

Crear `laboratorio-eg/src/pages/AdminTelegram.jsx`:

```javascript
import { useState, useEffect } from 'react';

export default function AdminTelegram() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    fetch('/api-telegram/dashboard')
      .then(res => res.json())
      .then(data => setMetrics(data.metrics));
  }, []);

  return (
    <div>
      <h1>Bot de Telegram - Dashboard</h1>
      {metrics && (
        <div className="grid grid-cols-3 gap-4">
          <StatCard title="Conversaciones" value={metrics.totalConversations} />
          <StatCard title="Órdenes Pendientes" value={metrics.pendingOrders} />
          <StatCard title="Repuestos Pendientes" value={metrics.pendingSupplyRequests} />
        </div>
      )}
    </div>
  );
}
```

## Monitoreo y Logs

Los logs se guardan en `logs/`:

- `combined.log`: Todos los logs
- `error.log`: Solo errores

Formato de logs:

```
2025-10-25T10:30:00Z [info]: [TelegramAdapter] Message received from user123
2025-10-25T10:30:01Z [info]: [GeminiService] Generating response for: "Necesito ayuda"
2025-10-25T10:30:02Z [info]: [OrderController] Creating order WO-2025-001
```

## Limitaciones y Consideraciones

### Gemini AI Free Tier

- **8 requests por minuto** (RPM)
- **8000 tokens por request**
- Implementar rate limiting en `GeminiService`

### Telegram

- Mensajes: hasta 4096 caracteres
- Polling vs Webhook: usar polling en dev, webhook en producción

### WhatsApp (Futuro)

- Costo: $15-50 USD/mes (Meta Business)
- Requiere: Facebook Business Manager, verificación de negocio
- 24-hour messaging window (fuera de eso, solo templates)

## Troubleshooting

### Bot no responde en Telegram

1. Verificar que `TELEGRAM_BOT_TOKEN` es correcto
2. Verificar que el servicio está corriendo: `http://localhost:3004/api/health`
3. Ver logs: `tail -f logs/combined.log`

### Error de base de datos

```bash
# Verificar conexión
PGPASSWORD=labsis psql -h localhost -U labsis -d labsisEG -c "\dt"

# Re-ejecutar migraciones
npm run migrate
```

### Gemini API rate limit

```
Error: 429 Too Many Requests
```

Solución: Ajustar `GEMINI_MAX_REQUESTS_PER_MINUTE` en `.env`

## Roadmap

### Fase 1: Telegram (Actual)
- ✅ Arquitectura Adapter Pattern
- ✅ TelegramAdapter
- ✅ GeminiService
- ✅ Workflows de órdenes y repuestos
- ✅ Dashboard en React

### Fase 2: WhatsApp (Futuro)
- ⏸️ WhatsAppAdapter
- ⏸️ Meta Business setup
- ⏸️ Webhook configuration
- ⏸️ Template messages

### Fase 3: Mejoras
- ⏸️ Notificaciones proactivas
- ⏸️ Reportes automáticos
- ⏸️ Integración con inventario
- ⏸️ Discord/Slack adapters

## Contribuir

Este es un proyecto privado para Laboratorio Elizabeth Gutiérrez.

## Licencia

PROPRIETARY - Todos los derechos reservados.

## Contacto

Samuel Quiroz - samuel@laboratorio-eg.com

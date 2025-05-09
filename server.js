// server.js (frontend)
require('dotenv').config();
const express = require('express');
const Sentry = require('@sentry/node');
const Tracing = require('@sentry/tracing');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
const axios = require('axios');

const app = express();

// --- 1. Inicializar Sentry (Node) ---
Sentry.init({
  dsn: process.env.SENTRY_DSN,                    // DSN de tu proyecto UI en Sentry
  environment: process.env.NODE_ENV || 'development',
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Tracing.Integrations.Express({ app }),
  ],
  tracesSampleRate: 1.0,                          // Ajusta en producción
});

// --- 2. Middlewares de Sentry ---
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// --- 3. Middlewares generales ---
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- 4. Configuración de vistas y estáticos ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));
app.use(express.static(path.join(__dirname, 'src', 'public')));

// --- 5. URL base de la API ---
const API_URL = process.env.API_URL || 'http://localhost:3000/api';
app.locals.API_URL = API_URL;  
// En tus controladores de rutas front, usa:
//   const data = await axios.get(`${req.app.locals.API_URL}/products`);

// --- 6. Rutas de UI (solo renderizado) ---
app.use('/',           require('./src/app/routes/home'));
app.use('/about_us',   require('./src/app/routes/aboutUs'));
app.use('/store',      require('./src/app/routes/store'));
app.use('/auth',       require('./src/app/routes/auth'));
app.use('/cart',       require('./src/app/routes/cart'));
app.use('/orders',     require('./src/app/routes/orders'));
app.use('/profile',    require('./src/app/routes/profile'));
app.use('/admin',      require('./src/app/routes/admin'));

// --- 7. Health check ---
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// --- 8. 404 handler ---
app.use((req, res) => {
  res.status(404).render('404');
});

// --- 9. Manejadores de error de Sentry y genérico ---
app.use(Sentry.Handlers.errorHandler());
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).render('error', { error: err });
});

// --- 10. Levantar servidor ---
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Frontend UI corriendo en http://localhost:${PORT}`);
});

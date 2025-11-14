require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, param, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const morgan = require('morgan');
const crypto = require('crypto');

const app = express();

// ==================== MIDDLEWARE ====================

// Security Headers
app.use(helmet());

// CORS Configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('combined'));

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts, please try again later.',
});

// ==================== CONFIGURATION ====================

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const SALT_ROUNDS = 10;

// ==================== MOCK DATA ====================

const pizzaCustomizations = {
  sizes: [
    { name: 'Média (30cm)', priceModifier: 1 },
    { name: 'Grande (35cm)', priceModifier: 1.25 },
    { name: 'Gigante (40cm)', priceModifier: 1.5 },
  ],
  crusts: [
    { name: 'Massa Tradicional', additionalPrice: 0 },
    { name: 'Massa Fina', additionalPrice: 0 },
    { name: 'Borda Recheada', additionalPrice: 5.5 },
  ],
  toppings: [
    { name: 'Queijo Extra', additionalPrice: 3.0 },
    { name: 'Calabresa', additionalPrice: 2.5 },
    { name: 'Cogumelos', additionalPrice: 2.0 },
    { name: 'Cebola', additionalPrice: 1.5 },
    { name: 'Bacon', additionalPrice: 3.5 },
    { name: 'Abacaxi', additionalPrice: 2.25 },
  ],
};

const menuBellaNapoli = [
  {
    id: 'b1',
    name: 'Margherita',
    description:
      'A clássica com tomates San Marzano, muçarela fresca, manjericão e azeite extra-virgem.',
    category: 'Pizza',
    price: 48.0,
    imageUrl: 'https://picsum.photos/seed/margherita/400/300',
    customizable: true,
    customizationOptions: pizzaCustomizations,
  },
  {
    id: 'b2',
    name: 'Calabresa',
    description:
      'Um clássico favorito com uma porção generosa de calabresa picante e queijo muçarela.',
    category: 'Pizza',
    price: 52.0,
    imageUrl: 'https://picsum.photos/seed/pepperoni/400/300',
    customizable: true,
    customizationOptions: pizzaCustomizations,
  },
  {
    id: 'b3',
    name: 'Quatro Queijos',
    description: 'Pizza com quatro queijos: muçarela, gorgonzola, provolone e parmesão.',
    category: 'Pizza',
    price: 54.0,
    imageUrl: 'https://picsum.photos/seed/formaggi/400/300',
    customizable: true,
    customizationOptions: pizzaCustomizations,
  },
  {
    id: 'b4',
    name: 'Coca-Cola',
    description: 'Lata 350ml',
    category: 'Bebida',
    price: 6.5,
    imageUrl: 'https://picsum.photos/seed/coke/400/300',
  },
  {
    id: 'b5',
    name: 'Tiramisu',
    description: 'Sobremesa italiana com queijo mascarpone, café e biscoitos champagne.',
    category: 'Sobremesa',
    price: 18.0,
    imageUrl: 'https://picsum.photos/seed/tiramisu/400/300',
  },
];

const menuFirehouse = [
  {
    id: 'f1',
    name: 'A Inferno',
    description:
      'Salame picante, jalapeños, pimenta calabresa e um molho de tomate ardente. Não é para os fracos!',
    category: 'Pizza',
    price: 55.0,
    imageUrl: 'https://picsum.photos/seed/inferno/400/300',
    customizable: true,
    customizationOptions: pizzaCustomizations,
  },
  {
    id: 'f2',
    name: 'Frango com Catupiry',
    description: 'Molho de tomate, frango desfiado, cebola roxa e catupiry cremoso.',
    category: 'Pizza',
    price: 53.5,
    imageUrl: 'https://picsum.photos/seed/bbq/400/300',
    customizable: true,
    customizationOptions: pizzaCustomizations,
  },
  {
    id: 'f3',
    name: 'Vegetariana Suprema',
    description: 'Um jardim na pizza! Pimentões, cebola, azeitonas, cogumelos e tomates frescos.',
    category: 'Pizza',
    price: 51.0,
    imageUrl: 'https://picsum.photos/seed/veggie/400/300',
    customizable: true,
    customizationOptions: pizzaCustomizations,
  },
  {
    id: 'f4',
    name: 'Cerveja Artesanal',
    description: 'IPA Local, garrafa 500ml',
    category: 'Bebida',
    price: 17.5,
    imageUrl: 'https://picsum.photos/seed/beer/400/300',
  },
  {
    id: 'f5',
    name: 'Petit Gâteau',
    description:
      'Bolo de chocolate quente com centro cremoso, servido com uma bola de sorvete de baunilha.',
    category: 'Sobremesa',
    price: 22.5,
    imageUrl: 'https://picsum.photos/seed/lavacake/400/300',
  },
];

let pizzerias = [
  {
    id: '1',
    name: 'Bella Napoli',
    logoUrl: 'https://picsum.photos/seed/logo1/100/100',
    heroUrl: 'https://picsum.photos/seed/hero1/1200/400',
    specialty: 'Autêntica Pizza no Forno a Lenha',
    rating: 4.8,
    address: 'Rua da Pizza, 123, São Paulo, BR',
    isOpen: true,
    openingHours: { Monday: '17:00 - 23:00', Tuesday: '17:00 - 23:00' },
    menu: menuBellaNapoli,
    deliveryFee: 8.0,
    ownerId: 'owner1',
    isActive: true,
  },
  {
    id: '2',
    name: 'Pizzaria Fogo Alto',
    logoUrl: 'https://picsum.photos/seed/logo2/100/100',
    heroUrl: 'https://picsum.photos/seed/hero2/1200/400',
    specialty: 'Pizzas Picantes & Criativas',
    rating: 4.6,
    address: 'Av. do Fogo, 456, Rio de Janeiro, BR',
    isOpen: true,
    openingHours: { Monday: '11:00 - 22:00', Tuesday: '11:00 - 22:00' },
    menu: menuFirehouse,
    deliveryFee: 7.5,
    ownerId: 'owner2',
    isActive: true,
  },
  {
    id: '3',
    name: 'Fatia Verde',
    logoUrl: 'https://picsum.photos/seed/logo3/100/100',
    heroUrl: 'https://picsum.photos/seed/hero3/1200/400',
    specialty: 'Opções Veganas & Sem Glúten',
    rating: 4.9,
    address: 'Al. das Plantas, 789, Curitiba, BR',
    isOpen: false,
    openingHours: { Monday: '12:00 - 21:00', Tuesday: '12:00 - 21:00' },
    menu: menuFirehouse,
    deliveryFee: 9.0,
    ownerId: 'owner3',
    isActive: false,
  },
];

// Initialize users with hashed passwords (async initialization)
let users = [];
let orders = [];
let tables = Array.from({ length: 12 }, (_, i) => ({
  id: `table-${i + 1}`,
  number: i + 1,
  status: Math.random() > 0.6 ? 'occupied' : 'free',
  qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ePizza-Table${i + 1}`,
}));

// Initialize with hashed passwords
async function initializeData() {
  try {
    users = [
      {
        id: 'user1',
        email: 'cliente@email.com',
        password: await bcrypt.hash('123', SALT_ROUNDS),
        name: 'João da Silva',
        phone: '11987654321',
        addresses: ['Rua das Flores, 100, São Paulo, SP'],
        role: 'customer',
      },
      {
        id: 'owner1',
        email: 'dono@bella.com',
        password: await bcrypt.hash('123', SALT_ROUNDS),
        name: 'Maria Rossi',
        phone: '11912345678',
        addresses: [],
        role: 'owner',
      },
      {
        id: 'admin1',
        email: 'admin@epizza.com',
        password: await bcrypt.hash('123', SALT_ROUNDS),
        name: 'Admin ePizza',
        phone: '11999999999',
        addresses: [],
        role: 'admin',
      },
    ];
    console.log('✅ Data initialized with hashed passwords');
  } catch (error) {
    console.error('❌ Error initializing data:', error);
    process.exit(1);
  }
}

// ==================== MIDDLEWARE HELPERS ====================

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Role-based authorization
const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
};

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// ==================== API ENDPOINTS ====================

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ==================== AUTHENTICATION ====================

// Login
app.post(
  '/api/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 3 }).withMessage('Password must be at least 3 characters'),
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const user = users.find(u => u.email === email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        user: userWithoutPassword,
        token,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Register
app.post(
  '/api/register',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
    body('name').isLength({ min: 2 }).trim().withMessage('Name must be at least 2 characters'),
    body('password').isLength({ min: 3 }).withMessage('Password must be at least 3 characters'),
    body('phone').isMobilePhone('pt-BR').withMessage('Invalid phone number'),
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { email, name, password, phone } = req.body;

      if (users.some(u => u.email === email)) {
        return res.status(409).json({ error: 'Email already in use' });
      }

      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      const newUser = {
        id: `user-${crypto.randomUUID()}`,
        email,
        name,
        password: hashedPassword,
        phone,
        addresses: [],
        role: 'customer',
      };

      users.push(newUser);

      // Generate JWT
      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, role: newUser.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      const { password: _, ...userWithoutPassword } = newUser;

      res.status(201).json({
        user: userWithoutPassword,
        token,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ==================== PIZZERIAS ====================

// Get all pizzerias
app.get('/api/pizzerias', (req, res) => {
  res.json(pizzerias);
});

// Get pizzeria by ID
app.get(
  '/api/pizzerias/:id',
  [param('id').notEmpty().withMessage('Pizzeria ID is required')],
  handleValidationErrors,
  (req, res) => {
    const pizzeria = pizzerias.find(p => p.id === req.params.id);
    if (pizzeria) {
      res.json(pizzeria);
    } else {
      res.status(404).json({ error: 'Pizzeria not found' });
    }
  }
);

// Toggle pizzeria active status (Admin only)
app.patch(
  '/api/pizzerias/:id/toggle-active',
  authenticateToken,
  authorizeRole('admin'),
  [param('id').notEmpty().withMessage('Pizzeria ID is required')],
  handleValidationErrors,
  (req, res) => {
    const pizzeria = pizzerias.find(p => p.id === req.params.id);
    if (pizzeria) {
      pizzeria.isActive = !pizzeria.isActive;
      res.json(pizzeria);
    } else {
      res.status(404).json({ error: 'Pizzeria not found' });
    }
  }
);

// ==================== MENU MANAGEMENT (Owner) ====================

// Add menu item
app.post(
  '/api/pizzerias/:pizzeriaId/menu',
  authenticateToken,
  authorizeRole('owner', 'admin'),
  [
    param('pizzeriaId').notEmpty(),
    body('name').isLength({ min: 2 }).trim(),
    body('description').isLength({ min: 5 }).trim(),
    body('category').isIn(['Pizza', 'Bebida', 'Sobremesa']),
    body('price').isFloat({ min: 0 }),
  ],
  handleValidationErrors,
  (req, res) => {
    const pizzeria = pizzerias.find(p => p.id === req.params.pizzeriaId);
    if (!pizzeria) {
      return res.status(404).json({ error: 'Pizzeria not found' });
    }

    const newItem = { ...req.body, id: `menu-${crypto.randomUUID()}` };
    pizzeria.menu.push(newItem);
    res.status(201).json(newItem);
  }
);

// Update menu item
app.put(
  '/api/pizzerias/:pizzeriaId/menu/:menuItemId',
  authenticateToken,
  authorizeRole('owner', 'admin'),
  [param('pizzeriaId').notEmpty(), param('menuItemId').notEmpty()],
  handleValidationErrors,
  (req, res) => {
    const pizzeria = pizzerias.find(p => p.id === req.params.pizzeriaId);
    if (!pizzeria) {
      return res.status(404).json({ error: 'Pizzeria not found' });
    }

    const itemIndex = pizzeria.menu.findIndex(item => item.id === req.params.menuItemId);
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    pizzeria.menu[itemIndex] = { ...pizzeria.menu[itemIndex], ...req.body };
    res.json(pizzeria.menu[itemIndex]);
  }
);

// Delete menu item
app.delete(
  '/api/pizzerias/:pizzeriaId/menu/:menuItemId',
  authenticateToken,
  authorizeRole('owner', 'admin'),
  [param('pizzeriaId').notEmpty(), param('menuItemId').notEmpty()],
  handleValidationErrors,
  (req, res) => {
    const pizzeria = pizzerias.find(p => p.id === req.params.pizzeriaId);
    if (!pizzeria) {
      return res.status(404).json({ error: 'Pizzeria not found' });
    }

    const menuLengthBefore = pizzeria.menu.length;
    pizzeria.menu = pizzeria.menu.filter(item => item.id !== req.params.menuItemId);

    if (pizzeria.menu.length < menuLengthBefore) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Menu item not found' });
    }
  }
);

// ==================== ORDERS ====================

// Get all orders
app.get('/api/orders', authenticateToken, (req, res) => {
  // Filter orders based on user role
  let filteredOrders = orders;

  if (req.user.role === 'customer') {
    filteredOrders = orders.filter(o => o.userId === req.user.id);
  } else if (req.user.role === 'owner') {
    const ownerPizzeria = pizzerias.find(p => p.ownerId === req.user.id);
    if (ownerPizzeria) {
      filteredOrders = orders.filter(o => o.pizzeriaId === ownerPizzeria.id);
    }
  }

  res.json(filteredOrders);
});

// Get order by ID
app.get(
  '/api/orders/:id',
  [param('id').notEmpty().withMessage('Order ID is required')],
  handleValidationErrors,
  (req, res) => {
    const order = orders.find(o => o.id === req.params.id);
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ error: 'Order not found' });
    }
  }
);

// Create order
app.post(
  '/api/orders',
  [
    body('pizzeriaId').notEmpty(),
    body('items').isArray({ min: 1 }),
    body('customer.name').isLength({ min: 2 }).trim(),
    body('customer.phone').isMobilePhone('pt-BR'),
    body('orderType').isIn(['delivery', 'pickup']),
  ],
  handleValidationErrors,
  (req, res, next) => {
    try {
      const orderData = req.body;
      const newOrder = {
        ...orderData,
        id: `order-${Date.now()}`,
        createdAt: Date.now(),
        status: 'received',
      };
      orders.push(newOrder);
      res.status(201).json(newOrder);
    } catch (error) {
      next(error);
    }
  }
);

// Update order status
app.patch(
  '/api/orders/:id/status',
  authenticateToken,
  authorizeRole('owner', 'admin'),
  [
    param('id').notEmpty(),
    body('status').isIn([
      'received',
      'preparing',
      'baking',
      'delivery',
      'delivered',
      'readyForPickup',
      'pickedUp',
    ]),
  ],
  handleValidationErrors,
  (req, res) => {
    const { status } = req.body;
    const order = orders.find(o => o.id === req.params.id);
    if (order) {
      order.status = status;
      res.json(order);
    } else {
      res.status(404).json({ error: 'Order not found' });
    }
  }
);

// ==================== TABLES ====================

// Get all tables
app.get('/api/tables', authenticateToken, authorizeRole('owner', 'admin'), (req, res) => {
  res.json(tables);
});

// Update table status
app.patch(
  '/api/tables/:id/status',
  authenticateToken,
  authorizeRole('owner', 'admin'),
  [param('id').notEmpty(), body('status').isIn(['free', 'occupied', 'reserved'])],
  handleValidationErrors,
  (req, res) => {
    const table = tables.find(t => t.id === req.params.id);
    if (!table) {
      return res.status(404).json({ error: 'Table not found' });
    }

    table.status = req.body.status;
    res.json(table);
  }
);

// ==================== ERROR HANDLING ====================

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use(errorHandler);

// ==================== SERVER START ====================

const PORT = process.env.PORT || 3001;

async function startServer() {
  await initializeData();

  app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════╗
║   🍕 ePizza Marketplace API Server             ║
║                                                ║
║   Status: ✅ Running                           ║
║   Port: ${PORT}                                    ║
║   Environment: ${process.env.NODE_ENV || 'development'}                   ║
║   URL: http://localhost:${PORT}                    ║
║                                                ║
║   Endpoints:                                   ║
║   - GET  /api/health                           ║
║   - POST /api/login                            ║
║   - POST /api/register                         ║
║   - GET  /api/pizzerias                        ║
║   - GET  /api/orders                           ║
║                                                ║
║   Security: ✅ JWT, Bcrypt, Helmet, CORS       ║
║   Rate Limiting: ✅ Enabled                    ║
╚════════════════════════════════════════════════╝
    `);
  });
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

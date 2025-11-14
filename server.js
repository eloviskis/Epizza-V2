const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- Mock Data (adapted from data.ts) ---

const pizzaCustomizations = {
  sizes: [
    { name: 'Média (30cm)', priceModifier: 1 },
    { name: 'Grande (35cm)', priceModifier: 1.25 },
    { name: 'Gigante (40cm)', priceModifier: 1.5 },
  ],
  crusts: [
    { name: 'Massa Tradicional', additionalPrice: 0 },
    { name: 'Massa Fina', additionalPrice: 0 },
    { name: 'Borda Recheada', additionalPrice: 5.50 },
  ],
  toppings: [
    { name: 'Queijo Extra', additionalPrice: 3.00 },
    { name: 'Calabresa', additionalPrice: 2.50 },
    { name: 'Cogumelos', additionalPrice: 2.00 },
    { name: 'Cebola', additionalPrice: 1.50 },
    { name: 'Bacon', additionalPrice: 3.50 },
    { name: 'Abacaxi', additionalPrice: 2.25 },
  ],
};

const menuBellaNapoli = [
  {
    id: 'b1',
    name: 'Margherita',
    description: 'A clássica com tomates San Marzano, muçarela fresca, manjericão e azeite extra-virgem.',
    category: 'Pizza',
    price: 48.00,
    imageUrl: 'https://picsum.photos/seed/margherita/400/300',
    customizable: true,
    customizationOptions: pizzaCustomizations,
  },
  { id: 'b2', name: 'Calabresa', description: 'Um clássico favorito com uma porção generosa de calabresa picante e queijo muçarela.', category: 'Pizza', price: 52.00, imageUrl: 'https://picsum.photos/seed/pepperoni/400/300', customizable: true, customizationOptions: pizzaCustomizations },
  { id: 'b3', name: 'Quatro Queijos', description: 'Pizza com quatro queijos: muçarela, gorgonzola, provolone e parmesão.', category: 'Pizza', price: 54.00, imageUrl: 'https://picsum.photos/seed/formaggi/400/300', customizable: true, customizationOptions: pizzaCustomizations },
  { id: 'b4', name: 'Coca-Cola', description: 'Lata 350ml', category: 'Bebida', price: 6.50, imageUrl: 'https://picsum.photos/seed/coke/400/300' },
  { id: 'b5', name: 'Tiramisu', description: 'Sobremesa italiana com queijo mascarpone, café e biscoitos champagne.', category: 'Sobremesa', price: 18.00, imageUrl: 'https://picsum.photos/seed/tiramisu/400/300' },
];

const menuFirehouse = [
  { id: 'f1', name: 'A Inferno', description: 'Salame picante, jalapeños, pimenta calabresa e um molho de tomate ardente. Não é para os fracos!', category: 'Pizza', price: 55.00, imageUrl: 'https://picsum.photos/seed/inferno/400/300', customizable: true, customizationOptions: pizzaCustomizations },
  { id: 'f2', name: 'Frango com Catupiry', description: 'Molho de tomate, frango desfiado, cebola roxa e catupiry cremoso.', category: 'Pizza', price: 53.50, imageUrl: 'https://picsum.photos/seed/bbq/400/300', customizable: true, customizationOptions: pizzaCustomizations },
  { id: 'f3', name: 'Vegetariana Suprema', description: 'Um jardim na pizza! Pimentões, cebola, azeitonas, cogumelos e tomates frescos.', category: 'Pizza', price: 51.00, imageUrl: 'https://picsum.photos/seed/veggie/400/300', customizable: true, customizationOptions: pizzaCustomizations },
  { id: 'f4', name: 'Cerveja Artesanal', description: 'IPA Local, garrafa 500ml', category: 'Bebida', price: 17.50, imageUrl: 'https://picsum.photos/seed/beer/400/300' },
  { id: 'f5', name: 'Petit Gâteau', description: 'Bolo de chocolate quente com centro cremoso, servido com uma bola de sorvete de baunilha.', category: 'Sobremesa', price: 22.50, imageUrl: 'https://picsum.photos/seed/lavacake/400/300' },
];

let pizzerias = [
  { id: '1', name: 'Bella Napoli', logoUrl: 'https://picsum.photos/seed/logo1/100/100', heroUrl: 'https://picsum.photos/seed/hero1/1200/400', specialty: 'Autêntica Pizza no Forno a Lenha', rating: 4.8, address: 'Rua da Pizza, 123, São Paulo, BR', isOpen: true, openingHours: { Monday: '17:00 - 23:00', Tuesday: '17:00 - 23:00' }, menu: menuBellaNapoli, deliveryFee: 8.00, ownerId: 'owner1', isActive: true },
  { id: '2', name: 'Pizzaria Fogo Alto', logoUrl: 'https://picsum.photos/seed/logo2/100/100', heroUrl: 'https://picsum.photos/seed/hero2/1200/400', specialty: 'Pizzas Picantes & Criativas', rating: 4.6, address: 'Av. do Fogo, 456, Rio de Janeiro, BR', isOpen: true, openingHours: { Monday: '11:00 - 22:00', Tuesday: '11:00 - 22:00' }, menu: menuFirehouse, deliveryFee: 7.50, ownerId: 'owner2', isActive: true },
  { id: '3', name: 'Fatia Verde', logoUrl: 'https://picsum.photos/seed/logo3/100/100', heroUrl: 'https://picsum.photos/seed/hero3/1200/400', specialty: 'Opções Veganas & Sem Glúten', rating: 4.9, address: 'Al. das Plantas, 789, Curitiba, BR', isOpen: false, openingHours: { Monday: '12:00 - 21:00', Tuesday: '12:00 - 21:00' }, menu: menuFirehouse, deliveryFee: 9.00, ownerId: 'owner3', isActive: false },
];

let users = [
    { id: 'user1', email: 'cliente@email.com', password: '123', name: 'João da Silva', phone: '11987654321', addresses: ['Rua das Flores, 100, São Paulo, SP'], role: 'customer' },
    { id: 'owner1', email: 'dono@bella.com', password: '123', name: 'Maria Rossi', phone: '11912345678', addresses: [], role: 'owner' },
    { id: 'admin1', email: 'admin@epizza.com', password: '123', name: 'Admin ePizza', phone: '11999999999', addresses: [], role: 'admin' }
];

let tables = Array.from({ length: 12 }, (_, i) => ({
    id: `table-${i + 1}`,
    number: i + 1,
    status: Math.random() > 0.6 ? 'occupied' : 'free',
    qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ePizza-Table${i+1}`
}));

let orders = [];

// --- API Endpoints ---

// Health check
app.get('/api/health', (req, res) => res.status(200).send('OK'));

// Pizzerias
app.get('/api/pizzerias', (req, res) => res.json(pizzerias));
app.get('/api/pizzerias/:id', (req, res) => {
    const pizzeria = pizzerias.find(p => p.id === req.params.id);
    if (pizzeria) res.json(pizzeria);
    else res.status(404).send('Pizzeria not found');
});

// Auth
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        res.json(user);
    } else {
        res.status(401).send('Invalid credentials');
    }
});

app.post('/api/register', (req, res) => {
    const { email, name, password, phone } = req.body;
    if (users.some(u => u.email === email)) {
        return res.status(409).send('Email already in use');
    }
    const newUser = {
        id: `user-${crypto.randomUUID()}`,
        email, name, password, phone,
        addresses: [],
        role: 'customer'
    };
    users.push(newUser);
    res.status(201).json(newUser);
});

// Orders
app.get('/api/orders', (req, res) => res.json(orders));
app.get('/api/orders/:id', (req, res) => {
    const order = orders.find(o => o.id === req.params.id);
    if (order) res.json(order);
    else res.status(404).send('Order not found');
});

app.post('/api/orders', (req, res) => {
    const orderData = req.body;
    const newOrder = {
        ...orderData,
        id: `order-${Date.now()}`,
        createdAt: Date.now(),
        status: 'received'
    };
    orders.push(newOrder);
    res.status(201).json(newOrder);
});

app.patch('/api/orders/:id/status', (req, res) => {
    const { status } = req.body;
    const order = orders.find(o => o.id === req.params.id);
    if (order) {
        order.status = status;
        res.json(order);
    } else {
        res.status(404).send('Order not found');
    }
});


// Admin
app.patch('/api/pizzerias/:id/toggle-active', (req, res) => {
    const pizzeria = pizzerias.find(p => p.id === req.params.id);
    if (pizzeria) {
        pizzeria.isActive = !pizzeria.isActive;
        res.json(pizzeria);
    } else {
        res.status(404).send('Pizzeria not found');
    }
});

// Owner
app.post('/api/pizzerias/:pizzeriaId/menu', (req, res) => {
    const pizzeria = pizzerias.find(p => p.id === req.params.pizzeriaId);
    if (!pizzeria) return res.status(404).send('Pizzeria not found');
    
    const newItem = { ...req.body, id: `menu-${crypto.randomUUID()}`};
    pizzeria.menu.push(newItem);
    res.status(201).json(newItem);
});

app.put('/api/pizzerias/:pizzeriaId/menu/:menuItemId', (req, res) => {
    const pizzeria = pizzerias.find(p => p.id === req.params.pizzeriaId);
    if (!pizzeria) return res.status(404).send('Pizzeria not found');
    
    const itemIndex = pizzeria.menu.findIndex(item => item.id === req.params.menuItemId);
    if (itemIndex === -1) return res.status(404).send('Menu item not found');
    
    pizzeria.menu[itemIndex] = { ...pizzeria.menu[itemIndex], ...req.body };
    res.json(pizzeria.menu[itemIndex]);
});

app.delete('/api/pizzerias/:pizzeriaId/menu/:menuItemId', (req, res) => {
    const pizzeria = pizzerias.find(p => p.id === req.params.pizzeriaId);
    if (!pizzeria) return res.status(404).send('Pizzeria not found');
    
    const menuLengthBefore = pizzeria.menu.length;
    pizzeria.menu = pizzeria.menu.filter(item => item.id !== req.params.menuItemId);
    
    if (pizzeria.menu.length < menuLengthBefore) {
        res.status(204).send();
    } else {
        res.status(404).send('Menu item not found');
    }
});

// Tables
app.get('/api/tables', (req, res) => res.json(tables));

app.patch('/api/tables/:id/status', (req, res) => {
    const table = tables.find(t => t.id === req.params.id);
    if (!table) return res.status(404).send('Table not found');

    table.status = req.body.status;
    res.json(table);
});


const PORT = 3001;
app.listen(PORT, () => {
  console.log(`ePizza server running on http://localhost:${PORT}`);
});
import express from "express";
import { createServer as createViteServer } from "vite";
import { initDb } from "./src/db";
import db from "./src/db";
import helmet from "helmet";
import bcrypt from "bcryptjs";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import compression from "compression";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Database
  initDb();

  // Rate Limiting
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Increased for development
    message: { error: "Muitas tentativas de login. Tente novamente em 15 minutos." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // Increased for development
    message: { error: "Muitas tentativas de cadastro. Tente novamente em uma hora." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Security Headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "blob:"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://picsum.photos", "https://ui-avatars.com", "*"],
        connectSrc: ["'self'", "*"],
        frameSrc: ["'self'", "https://www.google.com"],
      },
    },
    crossOriginEmbedderPolicy: false, // Often causes issues with external assets in dev
  }));

  app.use(express.json({ limit: '50mb' }));
  app.use(compression());

  // API Routes

  // Auth: Register Tenant
  const registerSchema = z.object({
    tenantName: z.string().min(3).max(50),
    username: z.string().min(3).max(20),
    password: z.string().min(6),
    name: z.string().min(3).max(50),
  });

  app.post("/api/register", registerLimiter, async (req, res) => {
    try {
      const { tenantName, username, password, name } = registerSchema.parse(req.body);
      
      const slug = tenantName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const register = db.transaction(() => {
        // Create Tenant
        const tenantResult = db.prepare("INSERT INTO tenants (name, slug) VALUES (?, ?)").run(tenantName, slug);
        const tenantId = tenantResult.lastInsertRowid;

        // Create Admin User
        const userResult = db.prepare("INSERT INTO users (tenant_id, username, password, name, role) VALUES (?, ?, ?, ?, ?)").run(tenantId, username, hashedPassword, name, 'admin');
        
        return { tenantId, userId: userResult.lastInsertRowid, slug };
      });

      const result = register();
      res.json(result);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Dados inválidos", details: error.issues });
      }
      if (error.message.includes('UNIQUE constraint failed')) {
        res.status(400).json({ error: "Nome da empresa ou usuário já em uso" });
      } else {
        res.status(500).json({ error: "Erro ao realizar cadastro" });
      }
    }
  });

  // Auth: Login
  const loginSchema = z.object({
    username: z.string(),
    password: z.string(),
    tenantSlug: z.string(),
  });

  app.post("/api/login", loginLimiter, async (req, res) => {
    try {
      const { username, password, tenantSlug } = loginSchema.parse(req.body);
      
      // Find tenant
      const tenant = db.prepare("SELECT id, name, slug FROM tenants WHERE slug = ?").get(tenantSlug) as any;
      if (!tenant) {
        return res.status(404).json({ error: "Empresa não encontrada" });
      }

      // Find user by username and tenant
      const user = db.prepare("SELECT id, tenant_id, username, password, name, role FROM users WHERE username = ? AND tenant_id = ?").get(username, tenant.id) as any;
      
      if (user && await bcrypt.compare(password, user.password)) {
        const { password: _, ...userWithoutPassword } = user;
        res.json({ ...userWithoutPassword, tenant });
      } else {
        res.status(401).json({ error: "Usuário ou senha inválidos" });
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Dados inválidos" });
      }
      res.status(500).json({ error: "Erro ao realizar login" });
    }
  });

  // Auth: Forgot Password (Stub)
  app.post("/api/forgot-password", (req, res) => {
    const { email, tenantSlug } = req.body;
    // In a real app, send email with reset link
    res.json({ message: "Se o e-mail estiver cadastrado, você receberá instruções para redefinir sua senha." });
  });

  // Middleware to extract tenant_id
  const getTenantId = (req: express.Request) => {
    return req.headers['x-tenant-id'];
  };

  // Get all products
  app.get("/api/products", (req, res) => {
    const tenantId = getTenantId(req);
    if (!tenantId) return res.status(401).json({ error: "Tenant ID required" });

    try {
      const products = db.prepare(`
        SELECT p.*, c.name as category_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.tenant_id = ?
      `).all(tenantId);
      res.json(Array.isArray(products) ? products : []);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  // Create Product
  app.post("/api/products", (req, res) => {
    const tenantId = getTenantId(req);
    if (!tenantId) return res.status(401).json({ error: "Tenant ID required" });

    const { name, code, description, price, promotional_price, unit, category_id, image_url, is_kit, supplier_id } = req.body;
    try {
      const result = db.prepare(`
        INSERT INTO products (tenant_id, name, code, description, price, promotional_price, unit, category_id, image_url, is_kit, supplier_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(tenantId, name, code, description, price, promotional_price || null, unit, category_id, image_url, is_kit ? 1 : 0, supplier_id || null);
      res.json({ id: result.lastInsertRowid });
    } catch (error) {
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  // Get Suppliers
  app.get("/api/suppliers", (req, res) => {
    const tenantId = getTenantId(req);
    if (!tenantId) return res.status(401).json({ error: "Tenant ID required" });

    try {
      const suppliers = db.prepare('SELECT * FROM suppliers WHERE tenant_id = ?').all(tenantId);
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch suppliers" });
    }
  });

  // Create Supplier
  app.post("/api/suppliers", (req, res) => {
    const tenantId = getTenantId(req);
    if (!tenantId) return res.status(401).json({ error: "Tenant ID required" });

    const { name, document, email, phone, address, notes } = req.body;
    try {
      const result = db.prepare(`
        INSERT INTO suppliers (tenant_id, name, document, email, phone, address, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(tenantId, name, document, email, phone, address, notes);
      res.json({ id: result.lastInsertRowid });
    } catch (error) {
      res.status(500).json({ error: "Failed to create supplier" });
    }
  });

  // Get Categories
  app.get("/api/categories", (req, res) => {
    const tenantId = getTenantId(req);
    if (!tenantId) return res.status(401).json({ error: "Tenant ID required" });

    try {
      const categories = db.prepare('SELECT * FROM categories WHERE tenant_id = ?').all(tenantId);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  // Create Category
  app.post("/api/categories", (req, res) => {
    const tenantId = getTenantId(req);
    if (!tenantId) return res.status(401).json({ error: "Tenant ID required" });

    const { name } = req.body;
    const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    try {
      const result = db.prepare('INSERT INTO categories (tenant_id, name, slug) VALUES (?, ?, ?)').run(tenantId, name, slug);
      res.json({ id: result.lastInsertRowid, name, slug });
    } catch (error) {
      res.status(500).json({ error: "Failed to create category" });
    }
  });

  // Get Customers
  app.get("/api/customers", (req, res) => {
    const tenantId = getTenantId(req);
    if (!tenantId) return res.status(401).json({ error: "Tenant ID required" });

    try {
      const customers = db.prepare(`
        SELECT c.*, 
        (SELECT SUM(total_amount) FROM sales WHERE customer_id = c.id AND tenant_id = ?) as total_spent,
        (SELECT MAX(created_at) FROM sales WHERE customer_id = c.id AND tenant_id = ?) as last_visit
        FROM customers c
        WHERE c.tenant_id = ?
      `).all(tenantId, tenantId, tenantId);
      res.json(customers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });

  // Create Customer
  app.post("/api/customers", (req, res) => {
    const tenantId = getTenantId(req);
    if (!tenantId) return res.status(401).json({ error: "Tenant ID required" });

    const { name, email, phone, address, street, number, neighborhood, city, state } = req.body;
    try {
      const result = db.prepare(`
        INSERT INTO customers (tenant_id, name, email, phone, address, street, number, neighborhood, city, state) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(tenantId, name, email, phone, address || null, street || null, number || null, neighborhood || null, city || null, state || null);
      res.json({ id: result.lastInsertRowid });
    } catch (error) {
      res.status(500).json({ error: "Failed to create customer" });
    }
  });

  // Update Customer
  app.put("/api/customers/:id", (req, res) => {
    const tenantId = getTenantId(req);
    const { id } = req.params;
    if (!tenantId) return res.status(401).json({ error: "Tenant ID required" });

    const { name, email, phone, address, street, number, neighborhood, city, state } = req.body;
    try {
      db.prepare(`
        UPDATE customers 
        SET name = ?, email = ?, phone = ?, address = ?, street = ?, number = ?, neighborhood = ?, city = ?, state = ?
        WHERE id = ? AND tenant_id = ?
      `).run(name, email, phone, address || null, street || null, number || null, neighborhood || null, city || null, state || null, id, tenantId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update customer" });
    }
  });

  // Create Sale (POS)
  app.post("/api/sales", (req, res) => {
    const tenantId = getTenantId(req);
    if (!tenantId) return res.status(401).json({ error: "Tenant ID required" });

    const { items, paymentMethod, deliveryType, deliveryFee, customerId } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ error: "No items in sale" });
    }

    const createSale = db.transaction(() => {
      let totalAmount = 0;
      
      // Calculate total and verify stock
      for (const item of items) {
        const product = db.prepare('SELECT price, promotional_price, stock_quantity FROM products WHERE id = ? AND tenant_id = ?').get(item.productId, tenantId) as any;
        if (!product) throw new Error(`Product ${item.productId} not found`);
        
        const price = product.promotional_price || product.price;
        totalAmount += price * item.quantity;
      }

      // Add delivery fee
      if (deliveryType === 'delivery' && deliveryFee) {
        totalAmount += Number(deliveryFee);
      }

      // Insert Sale
      const result = db.prepare(`
        INSERT INTO sales (tenant_id, total_amount, payment_method, delivery_type, delivery_fee, customer_id) 
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(tenantId, totalAmount, paymentMethod, deliveryType || 'pickup', deliveryFee || 0, customerId || null);
      
      const saleId = result.lastInsertRowid;

      // Insert Items and Update Stock
      for (const item of items) {
        const product = db.prepare('SELECT price, promotional_price FROM products WHERE id = ? AND tenant_id = ?').get(item.productId, tenantId) as any;
        const price = product.promotional_price || product.price;
        const subtotal = price * item.quantity;
        
        db.prepare(`
          INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal)
          VALUES (?, ?, ?, ?, ?)
        `).run(saleId, item.productId, item.quantity, price, subtotal);

        db.prepare(`
          UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ? AND tenant_id = ?
        `).run(item.quantity, item.productId, tenantId);

        // Log inventory change
        db.prepare(`
          INSERT INTO inventory_logs (tenant_id, product_id, user_id, quantity_change, type, reason)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(tenantId, item.productId, 1, -item.quantity, 'sale', `Venda #${saleId}`);
      }

      return { saleId, totalAmount };
    });

    try {
      const result = createSale();
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Inventory Adjustment
  app.post("/api/inventory/adjust", (req, res) => {
    const tenantId = getTenantId(req);
    if (!tenantId) return res.status(401).json({ error: "Tenant ID required" });

    const { productId, quantityChange, type, reason, userId } = req.body;
    
    try {
      const adjust = db.transaction(() => {
        db.prepare(`
          UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ? AND tenant_id = ?
        `).run(quantityChange, productId, tenantId);

        db.prepare(`
          INSERT INTO inventory_logs (tenant_id, product_id, user_id, quantity_change, type, reason)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(tenantId, productId, userId || 1, quantityChange, type, reason);
      });

      adjust();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to adjust inventory" });
    }
  });

  // Inventory History
  app.get("/api/inventory/history", (req, res) => {
    const tenantId = getTenantId(req);
    if (!tenantId) return res.status(401).json({ error: "Tenant ID required" });

    try {
      const history = db.prepare(`
        SELECT l.*, p.name as product_name, u.name as user_name
        FROM inventory_logs l
        JOIN products p ON l.product_id = p.id
        JOIN users u ON l.user_id = u.id
        WHERE l.tenant_id = ?
        ORDER BY l.created_at DESC
        LIMIT 100
      `).all(tenantId);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch inventory history" });
    }
  });

  // Fiscal Report (Summary)
  app.get("/api/reports/fiscal", (req, res) => {
    const tenantId = getTenantId(req);
    if (!tenantId) return res.status(401).json({ error: "Tenant ID required" });

    try {
      const sales = db.prepare(`
        SELECT 
          COUNT(*) as total_sales,
          SUM(total_amount) as total_revenue,
          SUM(delivery_fee) as total_delivery_fees
        FROM sales 
        WHERE tenant_id = ? AND date(created_at) = date('now')
      `).get(tenantId) as any;

      res.json({
        period: 'Hoje',
        ...sales
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch fiscal report" });
    }
  });

  // Dashboard Stats
  app.get("/api/stats", (req, res) => {
    const tenantId = getTenantId(req);
    if (!tenantId) return res.status(401).json({ error: "Tenant ID required" });

    try {
      const dailySales = db.prepare(`
        SELECT SUM(total_amount) as total FROM sales 
        WHERE date(created_at) = date('now') AND tenant_id = ?
      `).get(tenantId) as any;

      const lowStock = db.prepare(`
        SELECT count(*) as count FROM products WHERE stock_quantity <= min_stock_level AND tenant_id = ?
      `).get(tenantId) as any;

      const recentSales = db.prepare(`
        SELECT id, total_amount, payment_method, created_at FROM sales WHERE tenant_id = ? ORDER BY created_at DESC LIMIT 5
      `).all(tenantId);

      res.json({
        dailyRevenue: dailySales.total || 0,
        lowStockCount: lowStock.count || 0,
        recentSales: Array.isArray(recentSales) ? recentSales : []
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Settings
  app.get("/api/settings", (req, res) => {
    const tenantId = getTenantId(req);
    if (!tenantId) return res.status(401).json({ error: "Tenant ID required" });

    try {
      const settings = db.prepare("SELECT * FROM tenant_settings WHERE tenant_id = ?").get(tenantId);
      res.json(settings || {});
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.post("/api/settings", (req, res) => {
    const tenantId = getTenantId(req);
    if (!tenantId) return res.status(401).json({ error: "Tenant ID required" });

    const { address, phone, whatsapp, instagram, facebook, opening_hours, logo_url } = req.body;
    try {
      const exists = db.prepare("SELECT tenant_id FROM tenant_settings WHERE tenant_id = ?").get(tenantId);
      if (exists) {
        db.prepare(`
          UPDATE tenant_settings 
          SET address = ?, phone = ?, whatsapp = ?, instagram = ?, facebook = ?, opening_hours = ?, logo_url = ?
          WHERE tenant_id = ?
        `).run(address, phone, whatsapp, instagram, facebook, opening_hours, logo_url, tenantId);
      } else {
        db.prepare(`
          INSERT INTO tenant_settings (tenant_id, address, phone, whatsapp, instagram, facebook, opening_hours, logo_url)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(tenantId, address, phone, whatsapp, instagram, facebook, opening_hours, logo_url);
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to save settings" });
    }
  });

  // Public Store Endpoints
  app.get("/api/public/store/:slug", (req, res) => {
    const { slug } = req.params;
    try {
      const tenant = db.prepare("SELECT id, name, slug FROM tenants WHERE slug = ?").get(slug) as any;
      if (!tenant) return res.status(404).json({ error: "Store not found" });

      const products = db.prepare(`
        SELECT p.*, c.name as category_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.tenant_id = ?
      `).all(tenant.id);

      const settings = db.prepare("SELECT * FROM tenant_settings WHERE tenant_id = ?").get(tenant.id);

      res.json({
        tenant,
        products: Array.isArray(products) ? products : [],
        settings: settings || {}
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch store data" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

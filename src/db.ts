import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

const db = new Database('meatmaster.db');

// Enable foreign keys
db.pragma('foreign_keys = ON');

export function initDb() {
  // ... (tables creation)
  // Tenants (Multi-tenancy)
  db.exec(`
    CREATE TABLE IF NOT EXISTS tenants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Categories
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    )
  `);

  // Customers
  db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    )
  `);

  // Users
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id INTEGER NOT NULL,
      username TEXT NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'cashier', 'stock_manager')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(tenant_id, username),
      FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    )
  `);

  // Insert default tenant if not exists
  const tenantExists = db.prepare("SELECT id FROM tenants WHERE slug = 'meatmaster'").get();
  let defaultTenantId: number;
  if (!tenantExists) {
    const result = db.prepare("INSERT INTO tenants (name, slug) VALUES (?, ?)").run('MeatMaster Pro', 'meatmaster');
    defaultTenantId = result.lastInsertRowid as number;
  } else {
    defaultTenantId = (tenantExists as any).id;
  }

  // Insert default admin if not exists
  const adminExists = db.prepare("SELECT id FROM users WHERE username = 'admin' AND tenant_id = ?").get(defaultTenantId);
  if (!adminExists) {
    const salt = bcrypt.genSaltSync(10);
    const adminPass = bcrypt.hashSync('admin123', salt);
    const cashierPass = bcrypt.hashSync('caixa123', salt);
    const stockPass = bcrypt.hashSync('estoque123', salt);

    db.prepare("INSERT INTO users (tenant_id, username, password, name, role) VALUES (?, ?, ?, ?, ?)").run(defaultTenantId, 'admin', adminPass, 'Administrador', 'admin');
    db.prepare("INSERT INTO users (tenant_id, username, password, name, role) VALUES (?, ?, ?, ?, ?)").run(defaultTenantId, 'caixa', cashierPass, 'Operador de Caixa', 'cashier');
    db.prepare("INSERT INTO users (tenant_id, username, password, name, role) VALUES (?, ?, ?, ?, ?)").run(defaultTenantId, 'estoque', stockPass, 'Gerente de Estoque', 'stock_manager');
  }

  // Suppliers
  db.exec(`
    CREATE TABLE IF NOT EXISTS suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      document TEXT, -- CNPJ or CPF
      email TEXT,
      phone TEXT,
      address TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    )
  `);

  // Products
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      code TEXT, -- Product Code / SKU
      description TEXT,
      price REAL NOT NULL,
      promotional_price REAL,
      unit TEXT NOT NULL CHECK(unit IN ('kg', 'un')),
      category_id INTEGER,
      stock_quantity REAL DEFAULT 0,
      min_stock_level REAL DEFAULT 5,
      barcode TEXT,
      image_url TEXT,
      is_kit BOOLEAN DEFAULT 0,
      supplier_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tenant_id) REFERENCES tenants(id),
      FOREIGN KEY (category_id) REFERENCES categories (id),
      FOREIGN KEY (supplier_id) REFERENCES suppliers (id)
    )
  `);

  // Sales (Headers)
  db.exec(`
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id INTEGER NOT NULL,
      customer_id INTEGER,
      total_amount REAL NOT NULL,
      payment_method TEXT NOT NULL,
      delivery_type TEXT DEFAULT 'pickup' CHECK(delivery_type IN ('pickup', 'delivery')),
      delivery_fee REAL DEFAULT 0,
      status TEXT DEFAULT 'completed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tenant_id) REFERENCES tenants(id),
      FOREIGN KEY (customer_id) REFERENCES customers (id)
    )
  `);

  // Sale Items
  db.exec(`
    CREATE TABLE IF NOT EXISTS sale_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity REAL NOT NULL,
      unit_price REAL NOT NULL,
      subtotal REAL NOT NULL,
      FOREIGN KEY (sale_id) REFERENCES sales(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // Seed initial data if empty for default tenant
  const count = db.prepare('SELECT count(*) as count FROM categories WHERE tenant_id = ?').get(defaultTenantId) as { count: number };
  if (count.count === 0) {
    console.log('Seeding database for default tenant...');
    
    const insertCategory = db.prepare('INSERT INTO categories (tenant_id, name, slug) VALUES (?, ?, ?)');
    insertCategory.run(defaultTenantId, 'Carnes Bovinas', 'bovinos');
    insertCategory.run(defaultTenantId, 'Carnes Suínas', 'suinos');
    insertCategory.run(defaultTenantId, 'Aves', 'aves');
    insertCategory.run(defaultTenantId, 'Acessórios', 'acessorios');
    insertCategory.run(defaultTenantId, 'Bebidas', 'bebidas');
    insertCategory.run(defaultTenantId, 'Kits & Promoções', 'kits');

    const insertProduct = db.prepare(`
      INSERT INTO products (tenant_id, name, description, price, promotional_price, unit, category_id, stock_quantity, image_url, is_kit)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertProduct.run(defaultTenantId, 'Picanha Premium', 'Corte nobre, ideal para churrasco.', 89.90, null, 'kg', 1, 50.0, 'https://images.unsplash.com/photo-1615937657715-bc7b4b7962c1?auto=format&fit=crop&w=800&q=80', 0);
    insertProduct.run(defaultTenantId, 'Costela Gaúcha', 'Costela janela, perfeita para fogo de chão.', 39.90, 34.90, 'kg', 1, 100.0, 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80', 0);
    insertProduct.run(defaultTenantId, 'Linguiça Toscana', 'Linguiça artesanal temperada.', 24.90, null, 'kg', 2, 80.0, 'https://images.unsplash.com/photo-1595608933232-a56763327529?auto=format&fit=crop&w=800&q=80', 0);
    insertProduct.run(defaultTenantId, 'Carvão 5kg', 'Saco de carvão vegetal de eucalipto.', 15.00, null, 'un', 4, 200.0, 'https://images.unsplash.com/photo-1506016986033-557f44077204?auto=format&fit=crop&w=800&q=80', 0);
    insertProduct.run(defaultTenantId, 'Kit Churrasco Família', '2kg Picanha + 1kg Linguiça + 1 pct Carvão', 199.90, 179.90, 'un', 6, 10.0, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80', 1);
    
    const insertCustomer = db.prepare('INSERT INTO customers (tenant_id, name, email, phone, address) VALUES (?, ?, ?, ?, ?)');
    insertCustomer.run(defaultTenantId, 'João Silva', 'joao@email.com', '(11) 99999-9999', 'Rua das Flores, 123');
    insertCustomer.run(defaultTenantId, 'Maria Oliveira', 'maria@email.com', '(11) 98888-8888', 'Av. Paulista, 1000');
  }
}

export default db;

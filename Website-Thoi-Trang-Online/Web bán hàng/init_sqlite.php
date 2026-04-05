<?php
/**
 * SQLite Database Initialization Script
 * Cria banco de dados SQLite com todas as tabelas e dados iniciais
 * Execute uma vez: php init_sqlite.php
 */

$db_path = __DIR__ . '/fashion_store.db';

try {
    // Criar conexão SQLite
    $conn = new PDO('sqlite:' . $db_path);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->exec("PRAGMA encoding = 'UTF-8'");
    
    // Verificar se banco já existe
    $tables = $conn->query("SELECT name FROM sqlite_master WHERE type='table'")->fetchAll();
    
    if (count($tables) > 0) {
        echo "✓ Banco de dados já existe em: " . $db_path . "\n";
        echo "  Tabelas encontradas: " . count($tables) . "\n";
        exit(0);
    }
    
    echo "Criando banco de dados SQLite...\n\n";
    
    // ========== CRIAR TABELAS ==========
    
    // Tabela Categories
    $conn->exec("CREATE TABLE Categories (
        category_id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_name TEXT NOT NULL,
        category_code TEXT NOT NULL UNIQUE
    )");
    echo "✓ Tabela 'Categories' criada\n";
    
    // Tabela Products
    $conn->exec("CREATE TABLE Products (
        product_id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER,
        name TEXT NOT NULL,
        price INTEGER NOT NULL DEFAULT 0,
        img TEXT,
        back TEXT,
        badge TEXT,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(category_id) REFERENCES Categories(category_id) ON DELETE SET NULL
    )");
    echo "✓ Tabela 'Products' criada\n";
    
    // Tabela Product_Sizes
    $conn->exec("CREATE TABLE Product_Sizes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        size_name TEXT NOT NULL,
        FOREIGN KEY(product_id) REFERENCES Products(product_id) ON DELETE CASCADE
    )");
    echo "✓ Tabela 'Product_Sizes' criada\n";
    
    // Tabela Users (com role)
    $conn->exec("CREATE TABLE Users (
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        phone TEXT,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");
    echo "✓ Tabela 'Users' criada\n";

    // Tabela Orders
    $conn->exec("CREATE TABLE Orders (
        order_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        total_amount INTEGER NOT NULL DEFAULT 0,
        status TEXT DEFAULT 'pending',
        items TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES Users(user_id) ON DELETE SET NULL
    )");
    echo "✓ Tabela 'Orders' criada\n";

    // Tabela Admin_Notifications
    $conn->exec("CREATE TABLE Admin_Notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT,
        message TEXT,
        is_read INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");
    echo "✓ Tabela 'Admin_Notifications' criada\n";
    
    // ========== INSERIR DADOS ==========
    
    // Categorias
    $insert_cats = "INSERT INTO Categories (category_name, category_code) VALUES (?, ?)";
    $stmt = $conn->prepare($insert_cats);
    $categories = [
        ['Quần Nam', 'quan-au'],
        ['Áo Nam', 'ao-nam'],
        ['Phụ Kiện', 'phu-kien']
    ];
    foreach ($categories as $cat) {
        $stmt->execute($cat);
    }
    echo "✓ Categorias inseridas\n";
    
    // Produtos
    $insert_prod = "INSERT INTO Products (category_id, name, price, img, back, badge, description) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($insert_prod);
    
    // Obter IDs das categorias
    $cats_ids = $conn->query("SELECT category_id, category_code FROM Categories")->fetchAll(PDO::FETCH_ASSOC);
    $cat_map = [];
    foreach ($cats_ids as $c) {
        $cat_map[$c['category_code']] = $c['category_id'];
    }
    
    $products = [
        [$cat_map['ao-nam'], 'Áo Polo Basic', 450000, 'Asset/img/product/ao-polo-1.jpg', 'Asset/img/product/ao-polo-1-back.jpg', NULL, 'Áo polo basic'],
        [$cat_map['ao-nam'], 'Sơ Mi Oversize', 520000, 'Asset/img/product/ao-somi-1.jpg', 'Asset/img/product/ao-somi-1-back.jpg', 'HOT', 'Sơ mi oversize'],
        [$cat_map['ao-nam'], 'Áo Thun Graphic 1', 350000, 'Asset/img/product/ao-thun-1.jpg', 'Asset/img/product/ao-thun-1-back.jpg', 'NEW', 'Áo thun graphic 1'],
        [$cat_map['ao-nam'], 'Áo Thun Graphic 2', 380000, 'Asset/img/product/ao-thun-2.jpg', 'Asset/img/product/ao-thun-2-back.jpg', NULL, 'Áo thun graphic 2'],
        [$cat_map['phu-kien'], 'Giày Sneaker', 890000, 'Asset/img/product/giay-1.jpg', 'Asset/img/product/giay-1-back.jpg', 'HOT', 'Giày sneaker'],
        [$cat_map['phu-kien'], 'Mũ Lưỡi Trai', 220000, 'Asset/img/product/mu-1.jpg', 'Asset/img/product/mu-1-back.jpg', NULL, 'Mũ lưỡi trai'],
        [$cat_map['quan-au'], 'Quần Âu Aristino', 850000, 'Asset/img/product/quan-au-1.jpg', 'Asset/img/product/quan-au-1-back.jpg', 'NEW', 'Quần âu aristino'],
        [$cat_map['quan-au'], 'Quần Âu Premium', 950000, 'Asset/img/product/quan-au-2.jpg', 'Asset/img/product/quan-au-2-back.jpg', '-20%', 'Quần âu premium'],
        [$cat_map['quan-au'], 'Quần Âu Classic', 750000, 'Asset/img/product/quan-au-3.jpg', 'Asset/img/product/quan-au-3-back.jpg', 'SOLD OUT', 'Quần âu classic'],
        [$cat_map['quan-au'], 'Quần Âu Limited', 1200000, 'Asset/img/product/quan-au-4.jpg', 'Asset/img/product/quan-au-4-back.jpg', 'HOT', 'Quần âu limited'],
        [$cat_map['phu-kien'], 'Thắt Lưng Da Cao Cấp', 280000, 'Asset/img/product/that-lung-1.jpg', 'Asset/img/product/that-lung-1-back.jpg', NULL, 'Thắt lưng da cao cấp'],
        [$cat_map['phu-kien'], 'Ví Chia Khoá', 180000, 'Asset/img/product/vi-1.jpg', 'Asset/img/product/vi-1-back.jpg', 'NEW', 'Ví chia khóa']
    ];
    
    foreach ($products as $prod) {
        $stmt->execute($prod);
    }
    echo "✓ Produtos inseridos\n";
    
    // Tamanhos
    $insert_sizes = "INSERT INTO Product_Sizes (product_id, size_name) VALUES (?, ?)";
    $stmt = $conn->prepare($insert_sizes);
    
    $sizes_data = [
        ['Quần Âu Aristino', ['S', 'M', 'L']],
        ['Quần Âu Premium', ['S', 'M']],
        ['Áo Thun Graphic 1', ['XS', 'S']],
        ['Áo Thun Graphic 2', ['S']],
        ['Thắt Lưng Da Cao Cấp', ['Free']]
    ];
    
    foreach ($sizes_data as $item) {
        $prod_id = $conn->query("SELECT product_id FROM Products WHERE name = '{$item[0]}' LIMIT 1")->fetchColumn();
        foreach ($item[1] as $size) {
            $stmt->execute([$prod_id, $size]);
        }
    }
    echo "✓ Tamanhos inseridos\n";
    
    // Admin user (password: 123456) with role 'admin'
    $admin_password = password_hash('123456', PASSWORD_DEFAULT);
    $insert_user = "INSERT INTO Users (email, password_hash, first_name, last_name, phone, role) VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($insert_user);
    $stmt->execute(['admin@example.com', $admin_password, 'Admin', 'User', '+84000000000', 'admin']);
    echo "✓ Usuário Admin criado (email: admin@example.com, senha: 123456, role: admin)\n";
    
    echo "\n✅ Banco de dados SQLite criado com sucesso!\n";
    echo "📁 Localização: " . $db_path . "\n";
    echo "📊 Database ready para uso!\n";
    
} catch (PDOException $e) {
    echo "❌ Erro: " . $e->getMessage() . "\n";
    exit(1);
}
?>

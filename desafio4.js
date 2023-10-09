const fs = require("fs").promises;

class ProductManager {
    constructor(path) {
        this.path = path;
    }

    async validate(product) {
        const productFields = Object.values(product);
        const checkFields = productFields.some((field) => field === undefined);
    
        if (checkFields) {
            throw new Error("ERROR: Todos los campos deben estar llenos");
        }
    
        try {
            if (await this.pathExists()) {
                const db = await this.readDB();
                const checkCode = db.some((p) => p.code === product.code);
    
                if (checkCode) {
                    throw new Error("ERROR: El código del producto ya está en uso");
                }
            }
        } catch (error) {
            throw new Error("Error en validación: " + error.message);
        }
    }
    
    async pathExists() {
        try {
            await fs.access(this.path);
            return true;
        } catch (error) {
            return false;
        }
    }
    
    async readDB() {
        const data = await fs.readFile(this.path, "utf-8");
        return JSON.parse(data);
    }
    
    
    async pathExists() {
        try {
            await fs.access(this.path);
            return true;
        } catch (error) {
            return false;
        }
    }
    
    async readDB() {
        const data = await fs.readFile(this.path, "utf-8");
        return JSON.parse(data);
    }

    async getProductsById(id) {
        try {
            const db = JSON.parse(await fs.readFile(this.path, "utf-8"));
            const productById = db.find((p) => p.id === id);

            if (productById) {
                return productById;
            } else {
                throw new Error("Product no encontrado");
            }
        } catch (error) {
            throw new Error("Error en el procesamiento: " + error.message);
        }
    }

    async getProducts() {
        try {
            await fs.access(this.path); // Asegúrate de que el archivo exista
            const db = await fs.readFile(this.path, "utf-8");
            return JSON.parse(db);
        } catch (error) {
            console.error("Error: " + error.message);
            return [];
        }
    }
    
    async createId() {
        try {
            const db = await fs.readFile(this.path, "utf-8");
            const id = JSON.parse(db).length + 1;
            return id;
        } catch (error) {
            if (error.code === 'ENOENT') {
                // Si el archivo no existe, se asume que es el primer producto
                return 1;
            }
            console.error("Id error: " + error.message);
            return;
        }
    }

    

    async addProduct(title, description, price, thumbnail, code, stock) {
        const product = {
            id: await this.createId(),
            title,
            description,
            price,
            thumbnail,
            code,
            stock,
        };

        try {
            await this.validate(product);

            if (!(await fs.access(this.path).catch(() => false))) {
                await fs.writeFile(this.path, JSON.stringify([product], null, '\t'));
            } else {
                const db = JSON.parse(await fs.readFile(this.path, "utf-8"));
                const newDB = [...db, product];
                await fs.writeFile(this.path, JSON.stringify(newDB, null, '\t'));
            }

            console.log("Producto agregado");
        } catch (error) {
            console.error("Error: " + error.message);
        }
    }

    async deleteProduct(id) {
        try {
            const db = JSON.parse(await fs.readFile(this.path, "utf-8"));
            const productById = db.find((p) => p.id === id);

            if (productById) {
                const newProductsArray = db.filter((p) => p.id != id);
                await fs.writeFile(this.path, JSON.stringify(newProductsArray, null, '\t'));
                console.log("Productc " + id + " ha sido borrado");
            } else {
                console.error("Error en ID");
            }
        } catch (error) {
            console.error("Borrando error: " + error.message);
        }
    }

    async updateProduct(id, keyToUpdate, newValue) {
        try {
            const db = await this.readDB();
            const index = db.findIndex((p) => p.id === id);
    
            if (index !== -1) {
                if (keyToUpdate in db[index]) {
                    db[index][keyToUpdate] = newValue;
                    await fs.writeFile(this.path, JSON.stringify(db, null, '\t'));
                    console.log(JSON.parse(await fs.readFile(this.path, 'utf-8')));
                } else {
                    console.error('La clave es incorrecta');
                }
            } else {
                console.error('ID incorrecto');
            }
        } catch (error) {
            console.error('Error: ' + error.message);
        }
    }
    
}

const productManager = new ProductManager("./db.json");

// productManager.getProducts().then(products => {
//     console.log(products)})
    // productManager.addProduct("Producto Prueba", "Este es un producto prueba", 200, "Sin imagen", "abc123", 25);
// productManager.getProducts();
// productManager.getProductsById(1);
// productManager.getProductsById(1).then(products => {
//         console.log(products)})
productManager.updateProduct(1, "price", "15933");
// productManager.getProducts();

// productManager.deleteProduct(1);



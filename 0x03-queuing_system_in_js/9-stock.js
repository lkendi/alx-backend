import express from "express";
import { createClient } from "redis";
import { promisify } from "util";

//======== Express server ========
const app = express();
const port = 1245;

//======== Products list ========
const listProducts = [
  { id: 1, name: "Suitcase 250", price: 50, stock: 4 },
  { id: 2, name: "Suitcase 450", price: 100, stock: 10 },
  { id: 3, name: "Suitcase 650", price: 350, stock: 2 },
  { id: 4, name: "Suitcase 1050", price: 550, stock: 5 },
];

//======== Redis Client ========
const client = createClient();

client.on("connect", () => {
  console.log("Redis client connected to the server");
});

client.on("error", (err) => {
  console.log(`Redis client not connected to the server: ${err.message}`);
});

client.on("ready", () => {
  console.log("Redis client is ready for commands");
});

client.on("end", () => {
  console.log("Redis client connection closed");
});

async function connect() {
  await client.connect();
}

const getAsync = promisify(client.get).bind(client);

//======== Routes ========
app.get("/list_products", (req, res) => {
  const products = listProducts.map((item) => ({
    itemId: item.id,
    itemName: item.name,
    price: item.price,
    initialAvailableQuantity: item.stock,
  }));
  res.json(products);
});

app.get("/list_products/:itemId", async (req, res) => {
  const itemId = parseInt(req.params.itemId, 10);
  const product = getItemById(itemId);

  console.log(`Requested itemId: ${itemId}`);
  console.log(`Product found: ${product.name}`);

  if (!product) {
    return res.json({ status: "Product not found" });
  }

  const currentQuantity = await getCurrentReservedStockById(itemId);
  console.log(`Current reserved stock: ${currentQuantity}`);

  res.json({
    itemId: product.id,
    itemName: product.name,
    price: product.price,
    initialAvailableQuantity: product.stock,
    currentQuantity: parseInt(currentQuantity, 10) || 0,
  });
});


app.get("/reserve_product/:itemId", async (req, res) => {
  const itemId = parseInt(req.params.itemId, 10);
  const product = getItemById(itemId);

  if (!product) {
    return res.json({ status: "Product not found" });
  }

  const currentStock =
    (await getCurrentReservedStockById(itemId)) || product.stock;

  if (currentStock <= 0) {
    return res.json({ status: "Not enough stock available", itemId });
  }

  reserveStockById(itemId, currentStock - 1);
  res.json({ status: "Reservation confirmed", itemId });
});

//======== Functions ========
function getItemById(id) {
  return listProducts.find((product) => product.id === id);
}

async function reserveStockById(itemId, stock) {
  await client.set(`item.${itemId}`, stock);
}

async function getCurrentReservedStockById(itemId) {
  const stock = await getAsync(`item.${itemId}`);
  return stock;
}


//======== Starting the Server ========
connect()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch(console.error);

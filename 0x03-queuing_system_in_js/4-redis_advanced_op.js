import { createClient, print } from "redis";

const client = createClient();

client.on("connect", () => {
  console.log("Redis client connected to the server");
});

client.on("error", (err) => {
  console.log(`Redis client not connected to the server: ${err.message}`);
});

function createHash() {
  client.del("HolbertonSchools", (err, reply) => {
    if (err) {
      console.error(err);
      return;
    }

    client.hSet("HolbertonSchools", "Portland", 50, print);
    client.hSet("HolbertonSchools", "Seattle", 80, print);
    client.hSet("HolbertonSchools", "New York", 20, print);
    client.hSet("HolbertonSchools", "Bogota", 20, print);
    client.hSet("HolbertonSchools", "Cali", 40, print);
    client.hSet("HolbertonSchools", "Paris", 2, print);
  });
}

function displayHash() {
  client.hGetAll("HolbertonSchools", (err, result) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(result);
  });
}

function main() {
  client.connect((err) => {
    if (err) {
      console.error("Error connecting to Redis:", err);
      return;
    }

    createHash(); 
    setTimeout(displayHash, 100);
  });
}

main();

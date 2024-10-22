import { createClient } from "redis";

const client = createClient();

client.on("connect", () => {
  console.log("Redis client connected to the server");
});

client.on("error", (err) => {
  console.log(`Redis client not connected to the server: ${err.message}`);
});

async function setNewSchool(schoolName, value) {
  const reply = await client.set(schoolName, value);
  console.log(`Reply: ${reply}`);
}

async function displaySchoolValue(schoolName) {
  const result = await client.get(schoolName);
  console.log(result);
}

client.connect().then(async () => {
  await displaySchoolValue("Holberton"); 
  await setNewSchool("HolbertonSanFrancisco", "100");
  await displaySchoolValue("HolbertonSanFrancisco"); 
});

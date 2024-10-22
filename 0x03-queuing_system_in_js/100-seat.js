const { createClient } = require("redis");
const express = require("express");
const kue = require("kue");

//======== Express server ========
const app = express();
const queue = kue.createQueue();
const port = 1245;
let reservationEnabled = true;

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
  reserveSeat(50);
});

client.on("end", () => {
  console.log("Redis client connection closed");
});

async function connect() {
  await client.connect();
}

//======== Functions ========
async function reserveSeat(number) {
  if (client.isReady) {
    await client.set("available_seats", number);
  } else {
    await client.once("ready", () => {
      reserveSeat(number);
    });
  }
}

async function getCurrentAvailableSeats() {
  const seats = await client.get("available_seats");
  return parseInt(seats, 10);
}

//======== Routes ========
app.get("/available_seats", async (req, res) => {
  const seats = await getCurrentAvailableSeats();
  res.json({ numberOfAvailableSeats: seats });
});

app.get("/reserve_seat", (req, res) => {
  if (!reservationEnabled) {
    return res.json({ status: "Reservation are blocked" });
  }

  const job = queue.create("reserve_seat").save((err) => {
    if (err) {
      return res.json({ status: "Reservation failed" });
    }
    res.json({ status: "Reservation in process" });
  });

  job
    .on("complete", () => {
      console.log(`Seat reservation job ${job.id} completed`);
    })
    .on("failed", (err) => {
      console.log(`Seat reservation job ${job.id} failed: ${err}`);
    });
});

app.get("/process", (req, res) => {
  res.json({ status: "Queue processing" });

  queue.process("reserve_seat", async (job, done) => {
    const availableSeats = await getCurrentAvailableSeats();

    if (availableSeats <= 0) {
      reservationEnabled = false;
      return done(new Error("Not enough seats available"));
    }

    await reserveSeat(availableSeats - 1);

    if (availableSeats - 1 === 0) {
      reservationEnabled = false;
    }

    done();
  });
});

//======== Start server ========
connect().then(() => {
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch(console.error);

import { Socket } from "net";

const PORT = 4000;
const HOST = "localhost";

const client = new Socket();

client.connect(PORT, HOST, () => {
  console.log("Connected to the server.");

  client.write("Hello, Server!");
});

client.on("data", (data) => {
  console.log(`Received from server: ${data}`);

  setTimeout(() => {
    client.write("Another message to the server");
  }, 2000);
});

client.on("close", () => {
  console.log("Connection closed.");
});

client.on("error", (err) => {
  console.error(`Client error: ${err.message}`);
});

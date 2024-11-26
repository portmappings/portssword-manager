import { createServer } from "net";
import * as fs from "fs";
import * as readline from "readline";
import * as crypto from "crypto";
import * as path from "path";

const PORT = 4000;
const FILENAME = path.join(__dirname, "data.txt");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Enter the master password: ", (password) => {
  rl.close();

  if (!fs.existsSync(FILENAME)) {
    createAndEncryptFile(password);
  } else {
    console.log("File already exists. No need to create.");
  }

  startServer();
});

function createAndEncryptFile(password: string) {
  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(password, salt, 32);

  const cipher = crypto.createCipheriv("aes-256-cbc", key, salt);

  const initialContent = "This is some encrypted content.\n";
  let encryptedContent = cipher.update(initialContent, "utf-8", "hex");
  encryptedContent += cipher.final("hex");

  fs.writeFileSync(FILENAME, `${salt.toString("hex")}:${encryptedContent}`);

  console.log(`File created and encrypted successfully at ${FILENAME}`);
}

function decryptFile(password: string): string | null {
  const data = fs.readFileSync(FILENAME, "utf-8");

  const [saltHex, encryptedContent] = data.split(":");
  const salt = Buffer.from(saltHex, "hex");

  const key = crypto.scryptSync(password, salt, 32);

  const decipher = crypto.createDecipheriv("aes-256-cbc", key, salt);

  let decrypted = decipher.update(encryptedContent, "hex", "utf-8");
  decrypted += decipher.final("utf-8");

  return decrypted;
}

function startServer() {
  const server = createServer((socket) => {
    console.log("Client connected.");

    const decryptedContent = decryptFile("masterpassword");
    if (decryptedContent) {
      console.log("Decrypted content:", decryptedContent);
      socket.write(decryptedContent);
    } else {
      socket.write("Failed to decrypt content.");
    }

    socket.on("data", (data) => {
      console.log(`Received from client: ${data}`);
      socket.write(`Server received: ${data}`);
    });

    socket.on("end", () => {
      console.log("Client disconnected.");
    });

    socket.on("error", (err) => {
      console.error(`Socket error: ${err.message}`);
    });
  });

  server.listen(PORT, () => {
    console.log(`TCP server listening on port ${PORT}`);
  });
}

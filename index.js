import express from "express";
import { Client, Events, GatewayIntentBits } from "discord.js";

// Create a dummy Express server to satisfy Render's web service requirement
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Discord bot is alive and running!");
});

app.listen(PORT, () => {
  console.log(`Web server is listening on port ${PORT}`);
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith("create")) {
    const url = message.content.replace("create", "").trim();

    if (!url) {
      return message.reply(
        "Please provide a valid URL. Example: `create https://google.com`",
      );
    }

    try {
      // 1. Log in using your specific backend login route
      const loginResponse = await fetch(
        "https://urlshortnerdiscordbot.onrender.com/user/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          redirect: "manual",
          body: JSON.stringify({
            email: "discordbot@gmail.com",
            password: "12345",
          }),
        },
      );

      if (loginResponse.status !== 302 && !loginResponse.ok) {
        const errorText = await loginResponse.text();
        console.log("Backend login failed with response:", errorText);
        return message.reply(`Login failed: Check credentials.`);
      }

      // 2. Grab the session cookie
      const cookieHeader = loginResponse.headers.get("set-cookie");
      if (!cookieHeader) {
        return message.reply(
          "Logged in, but no session cookie received from server.",
        );
      }

      // 3. Send the URL to the /url endpoint using the cookie
      const response = await fetch(
        "https://urlshortnerdiscordbot.onrender.com/url",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: cookieHeader,
          },
          body: JSON.stringify({ url: url }),
        },
      );

      // 4. Read the HTML response text returned by your EJS view
      const text = await response.text();

      // 5. Extract the short ID from the HTML response and build the live Render link
      const match = text.match(/localhost:8001\/([a-zA-Z0-9_-]+)/);

      if (match) {
        const shortId = match[1]; // Extracts just the ID (e.g., EZlfXCzH)
        const shortUrl = `https://urlshortnerdiscordbot.onrender.com/${shortId}`;
        return message.reply(`Short URL generated successfully: ${shortUrl}`);
      } else {
        console.error("Server HTML response:", text);
        return message.reply(
          "URL request sent, but could not find the short ID in the server's response page.",
        );
      }
    } catch (error) {
      console.error("Error connecting to URL shortener server:", error);
      return message.reply(
        "Could not connect to the cloud URL shortener server. Is it online?",
      );
    }
  }

  message.reply({
    content: "Hello from bot",
  });
});

client.on("interactionCreate", (interaction) => {
  interaction.reply("Pong");
});

client.login(
  "MTU1ODUxOTEyNTUxOTc2MTQzMA.GczQjO.M26D-p26tlMmLQpvcvuN9cwWfKSjR5sCAtNfJ8",
);

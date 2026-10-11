import { REST, Routes } from "discord.js";

const commands = [
  {
    name: "ping",
    description: "Replies with Pong",
  },
];
const rest = new REST({ version: "10" }).setToken(
  "MTU1ODUxOTEyNTUxOTc2MTQzMA.GczQjO.M26D-p26tlMmLQpvcvuN9cwWfKSjR5sCAtNfJ8",
);

try {
  console.log("Started refreshing application (/) commands.");

  await rest.put(Routes.applicationCommands("1558519125519761430"), {
    body: commands,
  });

  console.log("Successfully reloaded application (/) commands.");
} catch (error) {
  console.error(error);
}

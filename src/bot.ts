if (process.env.NODE_ENV !== "production") require("dotenv").config();

import path from "path";
import Client from "./structures/Client";

const client = new Client("!", { disableMentions: "all" });

client.registerCommands(path.join(__dirname, "commands"), true);

client.registerEvents(path.join(__dirname, "events"));

client.login(process.env.TOKEN);

import { Message } from "discord.js";
import Client from "../structures/Client";

export default function message(client: Client, message: Message) {
  if (message.author.bot) return;
  if (!message.content.toLowerCase().startsWith(client.prefix.toLowerCase())) return;
  
  const args: string[] = message.content.slice(client.prefix.length).trim().split(/ +/g);
  const commandName = args.shift()!.toLowerCase();

  const command = client.commands.get(commandName);

  if (command) {
    client.executeCommand(command, message, args);
  }
}

import { Message } from "discord.js";
import Client from "../../../structures/Client";
import { ICommand, RunCallback } from "../../../structures/Interfaces";

function TestCommand(): ICommand {
  const run: RunCallback = async (client: Client, message: Message, args: string[]) => {
    client.say(message.channel, "Example test command!");
  };

  return {
    run: run,
    settings: {
      description: "Example Test Command",
      usage: "example test",
    },
  };
}

export default TestCommand();

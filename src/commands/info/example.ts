import { Message } from "discord.js";
import Client from "../../structures/Client";
import { ICommand, RunCallback } from "../../structures/Interfaces";

function ExampleCommand(): ICommand {
  const run: RunCallback = async (client: Client, message: Message, args: string[]) => {
    client.say(message.channel, "Example command!");
  };

  return {
    run: run,
    settings: {
      description: "Example Command",
      usage: "example [test]",
    },
  };
}

export default ExampleCommand();

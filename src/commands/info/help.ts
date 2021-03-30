import { Collection, MessageEmbed } from "discord.js";
// import Client from "../../structures/Client";
import { ICommand, RunCallback } from "../../structures/Interfaces";

function HelpCommand(): ICommand {
  const run: RunCallback = async (client, message, args) => {
    let categories: string[] = [];
    client.commands.forEach((cmd) => {
      if (cmd.category && !categories.includes(cmd.category)) categories.push(cmd.category);
    });

    const embed = new MessageEmbed();
    embed.setColor("#069420");

    if (args.length === 0) {
      embed.setTitle("Help | " + client.user?.username);
      categories.forEach((category) => {
        embed.addField(reFormat(category), getFormattedCommandsInCategory(category, client.commands));
      });
      embed.setFooter(`Do ${client.prefix}help <command> for help with a command!`);
      client.say(message.channel, embed);
      return;
    } else if (args[0]) {
      const commandName = args[0]?.toLowerCase();

      let command = client.commands.get(commandName);
      if (command === undefined) {
        message.channel.send("Invalid command!");
        return;
      }

      if (!command.settings && command.subCommandSettings) {
        if (command.subCommandSettings.defaultSubCommand) {
          command = command.subCommands?.get(command.subCommandSettings.defaultSubCommand);
        }
        if (!command || (!command.subCommandSettings?.defaultSubCommand && !command.settings)) {
          embed.setTitle(`Help | ${commandName}`);
          embed.addField("Subcommands: ", `\`${command?.subCommands}\``);
          client.say(message.channel, embed);
          return;
        }
      }

      embed.setTitle(`Help | ${commandName} command`);
      embed.addField("Description:", command.settings?.description, true);
      if (command.settings?.permissions) embed.addField("Permission(s) Required:", `\`${command.settings.permissions}\``);
      embed.addField("Usage:", `\`${client.prefix + command.settings?.usage}\``, true);
      embed.setFooter("<> = Required | [] = Optional");

      client.say(message.channel, embed);
    }
  };

  return {
    run: run,
    settings: {
      description: "Shows this message!",
      usage: "help [command]",
      maximumArgs: 1,
    },
  };
}

function getFormattedCommandsInCategory(name: string, commands: Collection<string, ICommand>): string {
  let msg = "";
  for (const cmd of commands) {
    if (cmd[1].category === name) msg += `\`${cmd[0]}\`, `;
  }
  return msg.slice(0, -2); // Remove extra comma
}

function reFormat(str: string): string {
  let newStr = "";

  for (let i = 0; i < str.length; i++) {
    let char = str.charAt(i);

    if (i === 0) {
      newStr += char.toUpperCase();
    } else if (str.charAt(i - 1) === " ") {
      newStr += char.toUpperCase();
    } else {
      newStr += char.toLowerCase();
    }
  }
  return newStr;
}

export default HelpCommand();

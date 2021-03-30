import Discord, { APIMessageContentResolvable, Channel, ClientOptions, Collection, Message, MessageAdditions, MessageOptions, TextChannel, VoiceChannel } from "discord.js";
import fs from "fs";
import path from "path";
import logger from "../util/Logger";
import { ICommand, ISubCommandSettings } from "./Interfaces";

const defaultSettings: ISubCommandSettings = {
  guildOnly: false,
};

export default class Client extends Discord.Client {
  prefix: string = "!";
  name = "Example bot";
  commands: Collection<string, ICommand> = new Collection();

  private registerCommandOptions = {
    dir: "",
    inheritCategoryFromDirectory: false,
  };

  constructor(prefix: string, options?: ClientOptions) {
    super(options);
    this.prefix = prefix;
  }

  executeCommand(command: ICommand, message: Message, args: string[]) {
    if (command.settings?.guildOnly && !message.guild) {
      message.channel.send("This command can only be executed inside a guild!");
      return;
    }

    try {
      if (command.settings?.permissions) {
        if (!message.member?.hasPermission(command.settings.permissions)) {
          message.channel.send(`Missing permissions! Required: \`${command.settings.permissions}\``);
          return;
        }
      }

      if (command.settings?.maximumArgs && command.settings?.maximumArgs < args.length) {
        message.channel.send(`Too many arguments!\nMax: ${command.settings.maximumArgs}\nProvided: ${args.length}`);
        return;
      }

      if (command.settings?.minimumArgs && command.settings?.minimumArgs > args.length) {
        message.channel.send(`Too little arguments!\nMin: ${command.settings.minimumArgs}\nProvided: ${args.length}`);
        return;
      }

      command.run(this, message, args);
    } catch (e) {
      message.channel.send("An unexpected error occured while trying to run that command!");
      logger.error(e);
      return;
    }
  }

  registerCommands(commandsDir: string, inheritCategoryFromDirectory?: boolean) {
    this.registerCommandOptions.dir = commandsDir;
    if (!inheritCategoryFromDirectory) inheritCategoryFromDirectory = false;
    this.registerCommandOptions.inheritCategoryFromDirectory = inheritCategoryFromDirectory;

    let parentName: string | undefined = undefined;

    if (inheritCategoryFromDirectory) {
      fs.readdirSync(commandsDir).forEach((directory) => {
        const commands = walk(path.join(commandsDir, directory), directory);
        commands.forEach((v, k) => {
          this.commands.set(k, v);
        });
      });
    } else this.commands = walk(commandsDir);

    function walk(dir: string, category?: string): Collection<string, ICommand> {
      const files = fs.readdirSync(dir);
      const commands: Collection<string, ICommand> = new Collection();

      files.forEach((file) => {
        const stats = fs.statSync(path.join(dir, file));
        const name = file.split(".")[0]?.toLowerCase() as string;
        if (stats.isFile()) {
          if (name.toLowerCase() == "subcommandsettings") return;

          const cmd: ICommand = require(path.join(dir, file)).default;
          let commandCategory: string | undefined = undefined;
          if (cmd.category) commandCategory = cmd.category;
          else if (category) commandCategory = category;

          const command: ICommand = {
            run: cmd.run,
            settings: cmd.settings,
            category: commandCategory,
          };

          if (!files.includes(name)) commands.set(name, command);
        } else if (stats.isDirectory()) {
          parentName = name;

          const subcommands = walk(path.join(dir, file));

          let options: ISubCommandSettings = defaultSettings;
          try {
            options = require(path.join(dir, parentName, "subcommandSettings.ts")).default;
          } catch (e) {
            logger.warn(`No subcommandSettings.ts file found for subcommand: ${name}, using default settings!`);
          }

          let defaultSubCommand: string | undefined;
          if (files.includes(name + ".ts")) {
            defaultSubCommand = name;
            subcommands.set(name, require(path.join(dir, name)).default);
          } else {
            defaultSubCommand = options.defaultSubCommand;
          }

          const command: ICommand = {
            settings: undefined,
            category: category,
            subCommandSettings: {
              guildOnly: options.guildOnly,
              maximumArgs: options.maximumArgs,
              minimumArgs: options.minimumArgs,
              permissions: options.permissions,
              defaultSubCommand: defaultSubCommand,
            },
            subCommands: subcommands,
            run: (client, message, args) => {
              const subcommandName = args.shift()?.toLowerCase();
              let subcommand: ICommand | undefined = undefined;

              let options = command.subCommandSettings;

              try {
                if (options?.guildOnly && !message.guild) {
                  message.channel.send("You must be in a guild to run this command!");
                  return;
                }

                if (options?.permissions) {
                  if (!message.member?.hasPermission(options.permissions)) {
                    message.channel.send(`Missing permissions! Required: \`${options.permissions}\``);
                    return;
                  }
                }

                if (options?.maximumArgs && options?.maximumArgs < args.length) {
                  message.channel.send(`Too many arguments!\nMax: ${options.maximumArgs}\nProvided: ${args.length}`);
                  return;
                }

                if (options?.minimumArgs && options?.minimumArgs > args.length) {
                  message.channel.send(`Too little arguments!\nMin: ${options.minimumArgs}\nProvided: ${args.length}`);
                  return;
                }
              } catch (e) {
                logger.error(e);
              }

              if (subcommandName) {
                subcommand = subcommands.get(subcommandName);
              } else if (options?.defaultSubCommand) {
                subcommand = subcommands.get(options.defaultSubCommand);
              }

              if (subcommand) {
                client.executeCommand(subcommand, message, args);
              } else {
                message.channel.send(`Invalid args.`);
              }
            },
          };

          commands.set(name, command);
        }
      });

      return commands;
    }
  }

  registerEvents(eventsDir: string) {
    // Get files in event directory
    const files = fs.readdirSync(eventsDir);

    // Loop through files
    files.forEach((file: string) => {
      // Make sure file isn't a directory
      const stats = fs.statSync(path.join(eventsDir, file));
      if (!stats.isDirectory()) {
        // Get event name
        const eventName = file.split(".")[0] as string;

        // Get event function
        const event: () => void = require(path.join(eventsDir, file)).default;

        // Bind event
        this.on(eventName, event.bind(null, this));
      }
    });
  }

  reloadCommands() {
    this.commands.clear();
    this.registerCommands(this.registerCommandOptions.dir, this.registerCommandOptions.inheritCategoryFromDirectory);
  }

  say(channel: Channel, content: APIMessageContentResolvable | (MessageOptions & { split?: false }) | MessageAdditions) {
    if (channel instanceof VoiceChannel) return;
    (channel as TextChannel).send(content).catch((e) => {
      logger.warn(e);
    });
  }
}

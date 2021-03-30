import { Message, PermissionResolvable } from "discord.js";
import Client from "./Client";

export type RunCallback = (client: Client, message: Message, args: string[]) => void;

export interface ICommand {
  settings: ICommandSettings | undefined;
  run: RunCallback;
  category?: string;
  subCommandSettings?: ISubCommandSettings;
  subCommands?: Map<String, ICommand>;
}

export interface ICommandSettings {
  description: string;
  usage: string;
  guildOnly?: boolean;
  permissions?: PermissionResolvable;
  minimumArgs?: number;
  maximumArgs?: number;
}

export interface ISubCommandSettings {
  defaultSubCommand?: string;
  guildOnly?: boolean;
  minimumArgs?: number;
  maximumArgs?: number;
  permissions?: PermissionResolvable;
}

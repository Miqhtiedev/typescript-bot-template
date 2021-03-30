# Custom Command Handler

This bot uses a custom handler for commands designed by me.

When registering the bot you can either input true or false for: `inheritCategoryFromDirectory`

**If that value is true then you will have to nest all your commands in sub folders that are named the category you want them to have instead of just putting them in the command directory.**

A simple command without any sub commands would look like this

```ts
function ExampleCommand(): ICommand {
  const run: RunCallback = async (client: Client, message: Message, args: string[]) => {
    client.say(message.channel, "Hello");
  };

  return {
    run: run,
    settings: {
      description: "Example Command",
      usage: "example [test]",
    },
  };
}
```
**NOTE: Use `client.say` instead of `message.channel.send(...)` to avoid Discord API errors**

Creating a command with subcommands is a bit more advanced.
<br>An example command directory tree would look like this:

![Example command tree](https://i.imgur.com/NEJ1R3M.png)

## **Example code for commands with subcommands can be found within the info directory**
**(this repo > src > commands > info)**
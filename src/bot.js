import { Telegraf } from "telegraf";

export class Bot {
  bot = null;
  userIDs = new Set([...global.config.admin_ids]);

  constructor(token) {
    this.bot = new Telegraf(token);

    this.initActions();
    this.launchBot();
  }

  initActions() {
    this.bot.command("me", (ctx) => {
      ctx.reply('ID: ' + ctx.message.from.id);
      this.userIDs.add(ctx.message.from.id);
    });

    this.bot.command("ping", (ctx) => {
      ctx.reply("pong");
    });

    this.bot.command("mute", () => {
      global.config.silent = !global.config.silent;
    });
  }

  launchBot() {
    this.bot.launch();
    console.log("🚀 Bot has been started -", this.bot.telegram.token);
  }

  notifyUser(userID, content) {
    try {
      this.bot.telegram.sendMessage(userID, content);
    } catch (err) {
      console.error(err);
    }
  }

  notifyUsers(content) {
    if (!content.length) {
      return;
    }

    this.userIDs.forEach((id) => this.notifyUser(id, content));
  }
}

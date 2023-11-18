import { Bot } from "./src/bot.js";
import { CheckStatuses } from "./src/constants.js";
import { NotifyService } from "./src/notify-service.js";

import config from './config.json' assert { type: 'json' };

const createResourceObj = (url) => {
  return {
    url,
    status: CheckStatuses.UNCHECKED,
    reason: null,
    isUnavailable: false,
  }
}

const pingResource = async (resource) => {
  try {
      const data = await fetch(resource.url);

      if (data.status !== 200) {
          resource.status = CheckStatuses.FAILED;
          resource.reason = data.status;
      } 
      else {
        resource.status = CheckStatuses.ACTIVE;
        resource.reason = null;
      }
  } catch (err) {
      resource.status = CheckStatuses.FAILED;
      resource.reason = err.code ?? err.cause.code ?? '-';
  }

  if (!global.config.silent) {
    console.log(`> Ping resource: ${resource.url} | Status: ${resource.status} | Reason: ${resource.reason}`)
  }
}


const main = () => {
  global.config = config;

  const bot = new Bot(global.config.bot_token);
  const notifyService = new NotifyService((c) => bot.notifyUsers(c));
  
  const watchedResources = global.config.resources_list.map((url) => createResourceObj(url));
  
  const intervalID = setInterval(async () => {
    const promises = watchedResources.map(r => pingResource(r));
    
    await Promise.all(promises);

      for (const resource of watchedResources) {
          const isFailed = resource.status === CheckStatuses.FAILED;
          const isUnavailable = resource.isUnavailable;

          // Service is unavailable now
          if (isFailed && !isUnavailable) {
              resource.failTimeshatmp = new Date().toISOString();
              
              notifyService.notifyAboutFailedResource(resource);
          } 
          // Service was unavailable and now woke up
          else if (!isFailed && isUnavailable) {
              notifyService.notifyAboutWokenResource(resource);
          }

          resource.isUnavailable = isFailed;
      }
  }, global.config.interval_timeout);

  console.log('🏓 Ping Service started with intervalID ' + intervalID + ' at ' + new Date().toISOString());
}

main();
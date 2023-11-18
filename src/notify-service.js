import humanizeDuration from "humanize-duration";

export class NotifyService {
  notifyFn = console.log;

  constructor(notifyCb) {
    if (notifyCb instanceof Function) {
      this.notifyFn = notifyCb;
    }
  }

  notifyAboutWokenResource = (res) => {
    const downtimeMs = new Date() - new Date(res.failTimeshatmp); 
    const downtimeDur = humanizeDuration(downtimeMs, { language: 'ru' }); 

    const msg = `🟢 ${res.url} снова доступен \nОн был недоступен ${downtimeDur}`
  
    this.notifyFn(msg);
  };
  
  notifyAboutFailedResource = (res) => {    
    const msg = `🔴 ${res.url} - недоступен \nПричина: ${res.reason}`
  
    this.notifyFn(msg);
  }

  notify() {
    return this.notifyFn;
  }
}

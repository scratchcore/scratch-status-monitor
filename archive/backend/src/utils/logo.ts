import figlet from "figlet";
import { fruit, morning } from "gradient-string";
import { makeLog } from "@/utils/logger.js";

const log = makeLog();

export const LogoText = (text: string, test?: boolean) => {
  return new Promise<void>((resolve, reject) => {
    figlet(text, (err, data) => {
      if (err) {
        log.error("Something went wrong...");
        log.debug(err);
        return reject(err);
      }
      if (data && !test) {
        console.log(morning(data));
      }
      resolve();
    });
  });
};

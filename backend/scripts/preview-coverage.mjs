import { execSync } from "child_process";
import { platform } from "os";

const filePath = "coverage/lcov-report/index.html";

switch (platform()) {
  case "darwin":
    execSync(`open ${filePath}`);
    break;
  case "win32":
    execSync(`start "" ${filePath}`);
    break;
  case "linux":
    execSync(`xdg-open ${filePath}`);
    break;
  default:
    console.error("Unsupported OS");
    process.exit(1);
}
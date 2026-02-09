#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { Command } from "commander";
import inquirer from "inquirer";

interface IconOptions {
  input: string;
  outputDir: string;
  circle?: boolean;
  apple?: boolean;
}

interface AppleIcon {
  size: number;
  name: string;
}

const program: Command = new Command()
  .name("gen-icon:magick")
  .description("Generate icon assets from a source image using ImageMagick")
  .argument("[input]", "Input image file path")
  .argument("[output-dir]", "Output directory for generated icons")
  .option("--circle", "Generate circular icon variants")
  .option("--apple", "Generate Apple-specific icons (touch icons)")
  .option("--interactive", "Use interactive mode to select options")
  .showHelpAfterError()
  .action(
    async (
      input: string | undefined,
      outputDir: string | undefined,
      opts: Record<string, boolean | undefined>
    ) => {
      await main(input, outputDir, opts);
    }
  );

program.parse();

async function main(
  inputArg: string | undefined,
  outputDirArg: string | undefined,
  opts: Record<string, boolean | undefined>
): Promise<void> {
  let options: IconOptions = {
    input: inputArg || "",
    outputDir: outputDirArg || "",
    circle: opts.circle,
    apple: opts.apple,
  };

  // Validate required arguments
  if (!options.input || !options.outputDir) {
    console.error("❌ Error: Both <input> and <output-dir> arguments are required\n");
    console.error("Usage examples:");
    console.error("  gen-icon:magick input.png output --circle --apple");
    console.error("  gen-icon:magick src/logo.svg ./dist");
    console.error("  gen-icon:magick image.png output --interactive\n");
    program.help();
    process.exit(1);
  }

  // Interactive mode: prompt user for options
  if (opts.interactive) {
    const answers: Record<string, boolean> = await inquirer.prompt([
      {
        type: "confirm",
        name: "circle",
        message: "Generate circular icon variants?",
        default: options.circle || false,
      },
      {
        type: "confirm",
        name: "apple",
        message: "Generate Apple-specific icons (touch icons)?",
        default: options.apple || false,
      },
    ]);

    options = {
      ...options,
      circle: answers.circle,
      apple: answers.apple,
    };
  }

  const inputPath: string = resolve(options.input);
  const outDir: string = resolve(options.outputDir);

  // Validate input file exists
  if (!existsSync(inputPath)) {
    console.error(`❌ Input file not found: ${inputPath}`);
    process.exit(1);
  }

  mkdirSync(outDir, { recursive: true });

  function magick(cmdArgs: string[]): void {
    const r = spawnSync("magick", cmdArgs, {
      stdio: "inherit",
      shell: process.platform === "win32",
    });
    if (r.error) process.exit(1);
  }

  /* ---------- Base PNG icons ---------- */

  const pngSizes: number[] = [48, 64, 128, 192, 256, 512];

  console.log("📦 Generating base PNG icons...");
  for (const size of pngSizes) {
    magick([
      inputPath,
      "-background",
      "none",
      "-gravity",
      "center",
      "-resize",
      `${size}x${size}`,
      "-extent",
      `${size}x${size}`,
      join(outDir, `icon.${size}x${size}.png`),
    ]);
  }

  /* ---------- Circle icons (SAFE) ---------- */

  if (options.circle) {
    console.log("⭕ Generating circular icon variants...");
    for (const size of pngSizes) {
      magick([
        "(",
        inputPath,
        "-resize",
        `${size}x${size}`,
        "-gravity",
        "center",
        "-extent",
        `${size}x${size}`,
        ")",
        "(",
        "-size",
        `${size}x${size}`,
        "radial-gradient:white-black",
        "-threshold",
        "0%",
        ")",
        "-compose",
        "CopyOpacity",
        "-composite",
        join(outDir, `icon-circle.${size}x${size}.png`),
      ]);
    }
    // favicon circle version
    console.log("📌 Generating circular favicon...");
    magick([
      `${outDir}/icon-circle.256x256.png`,
      "-background",
      "none",
      "-gravity",
      "center",
      "-resize",
      "256x256",
      "-extent",
      "256x256",
      "-define",
      "icon:auto-resize=16,24,32,48,64,128,256",
      join(outDir, "favicon-circle.ico"),
    ]);
  }

  /* ---------- favicon ---------- */

  console.log("🔖 Generating favicon...");
  magick([
    inputPath,
    "-background",
    "none",
    "-gravity",
    "center",
    "-resize",
    "256x256",
    "-extent",
    "256x256",
    "-define",
    "icon:auto-resize=16,24,32,48,64,128,256",
    join(outDir, "favicon.ico"),
  ]);

  /* ---------- Apple icons ---------- */

  if (options.apple) {
    console.log("🍎 Generating Apple-specific icons...");
    const appleIcons: AppleIcon[] = [
      { size: 180, name: "apple-touch-icon.png" },
      { size: 152, name: "apple-touch-icon-152.png" },
      { size: 167, name: "apple-touch-icon-167.png" },
    ];

    for (const { size, name } of appleIcons) {
      magick([
        inputPath,
        "-background",
        "white",
        "-gravity",
        "center",
        "-resize",
        `${size}x${size}`,
        "-extent",
        `${size}x${size}`,
        join(outDir, name),
      ]);
    }
  }

  console.log("✅ Icon assets generated successfully!");
}

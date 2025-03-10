// Made by Tom16 to generate index.json

const { readdir, readFile, writeFile } = require("fs/promises");
const crypto = require("crypto");
const path = require("path");

console.log("ARGV:", process.argv);

if (!process.argv[0].endsWith("node") && !process.argv[0].endsWith("node.exe"))
  __dirname = path.dirname(process.execPath);

console.log("DIRNAME:", __dirname);

const oldIndex = require("../../index.json");

(async () => {
  //modules
  const modules = await readdir(path.join(__dirname, "../../Modules"));
  const moduleIndex = await Promise.all(
    modules.map(async (moduleFile) => {
      const oldModule = oldIndex.modules.find((x) => x.file === moduleFile);

      const moduleContent = await readFile(path.join(__dirname, "../../Modules", moduleFile)).then((x) => x.toString());
      const moduleName = moduleContent.match(/name( *?)=( *?)(.+?)(\r|\n)/g)[0].match(/(('|")(.+?)('|"))/)[3];
      const moduleDesc = moduleContent.match(/description( *?)=( *?)(.+?)(\r|\n)/g)[0].match(/(('|")(.+?)('|"))/)?.[3];
      const moduleDeps =
        moduleContent
          .match(/importLib( *?)\(( *?)("|')(.+?)("|')\)/g)
          ?.map?.((x) => x.match(/(('|")(.+?)('|"))/)[3].replace(/\.lua$/, "")) ?? [];
      const moduleCommands =
        moduleContent.match(/registerCommand( *?)\(('|")(.+?)('|")/g)?.map?.((x) => x.match(/(('|")(.+?)('|"))/)[3]) ??
        [];
      const moduleHash = crypto.createHash("md5").update(moduleContent).digest().toString("hex");
      const moduleLastUpdated = oldModule?.hash === moduleHash ? oldModule?.lastUpdated ?? new Date() : new Date();
      return {
        name: moduleName,
        file: moduleFile,
        description: moduleDesc,
        url: "https://raw.githubusercontent.com/OnixClient-Scripts/OnixClient_Scripts/master/Modules/" + moduleFile,
        libs: moduleDeps,
        commands: moduleCommands,
        hash: moduleHash,
        lastUpdated: moduleLastUpdated,
      };
    })
  );

  //commands
  const commands = await readdir(path.join(__dirname, "../../Commands"));
  const commandIndex = await Promise.all(
    commands.map(async (commandFile) => {
      const oldCommand = oldIndex.commands.find((x) => x.file === commandFile);

      const commandContent = await readFile(path.join(__dirname, "../../Commands", commandFile)).then((x) =>
        x.toString()
      );
      const commandName = commandContent.match(/command( *?)=( *?)(.+?)(\r|\n)/g)[0].match(/(('|")(.+?)('|"))/)[3];
      const commandDesc = commandContent
        .match(/help_message( *?)=( *?)(.+?)(\r|\n)/g)[0]
        .match(/(('|")(.+?)('|"))/)?.[3];
      const commandDeps =
        commandContent
          .match(/importLib( *?)\(( *?)("|')(.+?)("|')\)/g)
          ?.map?.((x) => x.match(/(('|")(.+?)('|"))/)[3].replace(/\.lua$/, "")) ?? [];
      const commandHash = crypto.createHash("md5").update(commandContent).digest().toString("hex");
      const commandLastUpdated = oldCommand?.hash === commandHash ? oldCommand?.lastUpdated ?? new Date() : new Date();
      return {
        name: commandName,
        file: commandFile,
        description: commandDesc,
        url: "https://raw.githubusercontent.com/OnixClient-Scripts/OnixClient_Scripts/master/Commands/" + commandFile,
        libs: commandDeps,
        hash: commandHash,
        lastUpdated: commandLastUpdated,
      };
    })
  );

  //libs
  const libs = await readdir(path.join(__dirname, "../../Libs"));
  const libIndex = await Promise.all(
    libs.map(async (libFile) => {
      const oldLib = oldIndex.libs.find((x) => x.file === libFile);
      const libContent = await readFile(path.join(__dirname, "../../Libs", libFile));
      const libHash = crypto.createHash("md5").update(libContent).digest().toString("hex");
      const libLastUpdated = oldLib?.hash === libHash ? oldLib?.lastUpdated ?? new Date() : new Date();
      return {
        name: libFile.replace(/\.lua$/, ""),
        file: libFile,
        url: "https://raw.githubusercontent.com/OnixClient-Scripts/OnixClient_Scripts/master/Libs/" + libFile,
        hash: libHash,
        lastUpdated: libLastUpdated,
      };
    })
  );

  //autocomplete
  const acConfigHash = crypto
    .createHash("md5")
    .update(await readFile(path.join(__dirname, "../../AutoComplete/config.lua")))
    .digest()
    .toString("hex");

  const acConfigLastUpdated =
    oldIndex.autocomplete.config.hash === acConfigHash
      ? oldIndex.autocomplete.config.lastUpdated ?? new Date()
      : new Date();

  const autocompleteConfig = {
    file: "config.lua",
    url: "https://raw.githubusercontent.com/OnixClient-Scripts/OnixClient_Scripts/master/AutoComplete/config.lua",
    hash: acConfigHash,
    lastUpdated: acConfigLastUpdated,
  };
  const autocomplete = await readdir(path.join(__dirname, "../../AutoComplete/library"));
  const autocompleteIndex = await Promise.all(
    autocomplete.map(async (acFile) => {
      const oldACFile = oldIndex.autocomplete.library.find((x) => x.file === acFile);
      const acContent = await readFile(path.join(__dirname, "../../AutoComplete/library", acFile));
      const acHash = crypto.createHash("md5").update(acContent).digest().toString("hex");
      const acLastUpdated = oldACFile?.hash === acHash ? oldACFile?.lastUpdated ?? new Date() : new Date();
      return {
        file: acFile,
        url:
          "https://raw.githubusercontent.com/OnixClient-Scripts/OnixClient_Scripts/master/AutoComplete/library/" +
          acFile,
        hash: acHash,
        lastUpdated: acLastUpdated,
      };
    })
  );

  const index = {
    modules: moduleIndex.sort((a, b) => a.name.localeCompare(b.name)),
    commands: commandIndex.sort((a, b) => a.name.localeCompare(b.name)),
    libs: libIndex.sort((a, b) => a.name.localeCompare(b.name)),
    autocomplete: {
      config: autocompleteConfig,
      library: autocompleteIndex.sort((a, b) => a.file.localeCompare(b.file)),
    },
  };

  await writeFile(path.join(__dirname, "../../index.json"), JSON.stringify(index, null, 2));

  return console.dir(index, { depth: null });
})();

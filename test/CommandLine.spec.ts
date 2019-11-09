import { CommandLine } from "../src/CommandLine";

describe("CommandLine", () => {
  it("turns a command into a string", () => {
    expect(CommandLine.forCommand("node").toString()).toEqual("node");
  });

  it("can assemble complex commands", () => {
    const commandLine = CommandLine.forCommand("command-with-options")
      .withEnvironmentVariable("LOCAL", "true")
      .withFlag("-v")
      .withOption("--opt1", "val1")
      .withArgument("path/to/file.txt");

    expect(commandLine.toString()).toEqual(
      "LOCAL=true command-with-options -v --opt1 val1 path/to/file.txt"
    );
  });

  describe("withOption", () => {
    it("includes options after the command separated by a space", () => {
      const commandLine = CommandLine.forCommand("command-with-options")
        .withOption("--opt1", "val1")
        .withOption("--opt2", "val2");

      expect(commandLine.toString()).toEqual(
        "command-with-options --opt1 val1 --opt2 val2"
      );
    });

    it("includes options with a custom separator", () => {
      const commandLine = CommandLine.forCommand("command-with-options")
        .withOptionSeparator("=")
        .withOption("--opt1", "val1")
        .withOption("--opt2", "val2");

      expect(commandLine.toString()).toEqual(
        "command-with-options --opt1=val1 --opt2=val2"
      );
    });

    it("includes options with mixed separators", () => {
      const commandLine = CommandLine.forCommand("command-with-options")
        .withOption("--opt1", "val1", { separator: "=" })
        .withOption("--opt2", "val2");

      expect(commandLine.toString()).toEqual(
        "command-with-options --opt1=val1 --opt2 val2"
      );
    });

    it("includes options with a custom separator and mixed separators", () => {
      const commandLine = CommandLine.forCommand("command-with-options")
        .withOptionSeparator("=")
        .withOption("--opt1", "val1", { separator: " " })
        .withOption("--opt2", "val2");

      expect(commandLine.toString()).toEqual(
        "command-with-options --opt1 val1 --opt2=val2"
      );
    });
  });

  describe("withFlag", () => {
    it("includes flags after the command", () => {
      const commandLine = CommandLine.forCommand("command-with-options")
        .withFlag("--verbose")
        .withFlag("-h");

      expect(commandLine.toString()).toEqual(
        "command-with-options --verbose -h"
      );
    });
  });

  describe("withArgument", () => {
    it("includes arguments after the command", () => {
      const commandLine = CommandLine.forCommand(
        "command-with-options"
      ).withArgument("path/to/file.txt");

      expect(commandLine.toString()).toEqual(
        "command-with-options path/to/file.txt"
      );
    });

    it("wraps in quotes when specified", () => {
      const commandLine = CommandLine.forCommand(
        "command-with-options"
      ).withArgument("path/to/file.txt", { wrap: true });

      expect(commandLine.toString()).toEqual(
        'command-with-options "path/to/file.txt"'
      );
    });
  });

  describe("withEnvironmentVariable", () => {
    it("includes environment variables before the command", () => {
      const commandLine = CommandLine.forCommand("command-with-options")
        .withEnvironmentVariable("ENV_VAR1", "VAL1")
        .withEnvironmentVariable("ENV_VAR2", "VAL2");

      expect(commandLine.toString()).toEqual(
        "ENV_VAR1=VAL1 ENV_VAR2=VAL2 command-with-options"
      );
    });
  });

  describe("execute", () => {
    it("executes the command", async () => {
      const commandLine = CommandLine.forCommand(
        "echo"
      ).withArgument("Hello, world!", { wrap: true });

      const result = await commandLine.execute();

      expect(result.stdout).toEqual("Hello, world!");
    });

    it("executes the command", async () => {
      const commandLine = CommandLine.forCommand("echo")
        .withArgument("Hello, world!", { wrap: true })
        .withArgument(">&2");

      const result = await commandLine.execute();

      expect(result.stderr).toEqual("Hello, world!");
    });
  });
});

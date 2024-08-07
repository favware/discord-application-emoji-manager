#!/usr/bin/env node

import '#lib/root';

import process from 'node:process';
import { container } from '@sapphire/pieces';
import { envParseString } from '@skyra/env-utilities';
import { Command as CommanderCommand, type Options as CommanderOptions } from 'commander';
import { CommandStore } from '#lib/structures/CommandStore';
import { checkOptions } from '#lib/utils/checks';
import { packageJson } from '#lib/utils/constants';
import { setupLoggerAndLogOptions } from '#lib/utils/setup-logger';
import { setupREST } from '#lib/utils/setup-rest';
import { isOptionsObject } from '#lib/utils/type-guards';

const token = envParseString('DISCORD_TOKEN', '');
const appId = envParseString('APPLICATION_ID', '');

container.stores.register(new CommandStore());

await container.stores.get('commands').loadAll();

const rootCommand = new CommanderCommand() //
	.version(packageJson.version)
	.command('discord-application-emojis-manager');

const commanderCommands: CommanderCommand[] = [];

for (const command of container.stores.get('commands').values()) {
	const subcommand = new CommanderCommand() //
		.command(command.name)
		.description(command.description)
		.copyInheritedSettings(rootCommand)
		.option(
			'--token <string>',
			'The token of your Discord bot to authenticate with. You can also provide this with the DISCORD_TOKEN environment variable.',
			token
		)
		.option(
			'--application-id <string>',
			'The ID of the Discord application for which to manage the emojis. You can also provide this with the APPLICATION_ID environment variable.',
			appId
		)
		.option('-v, --verbose', 'Whether to print verbose information', false)
		.action(
			async (
				arg1: CommanderOptions | string,
				arg2: CommanderCommand | CommanderOptions | string,
				commandOrOptions?: CommanderCommand | CommanderOptions,
				commanderCommand?: CommanderCommand
			) => {
				if (isOptionsObject(arg1)) {
					const runArgs = {
						args: {},
						options: arg1
					};

					setupLoggerAndLogOptions(runArgs);
					checkOptions(runArgs.options);
					setupREST(runArgs.options);
					return command.run(runArgs);
				} else if (isOptionsObject(arg2)) {
					const arg1Name = (commandOrOptions as CommanderCommand).registeredArguments[0].name();
					const runArgs = {
						args: {
							[arg1Name]: arg1
						},
						options: arg2
					};

					setupLoggerAndLogOptions(runArgs);
					checkOptions(runArgs.options);
					setupREST(runArgs.options);
					return command.run(runArgs);
				}

				const arg1Name = (commanderCommand as CommanderCommand).registeredArguments[0].name();
				const arg2Name = (commanderCommand as CommanderCommand).registeredArguments[1].name();
				const runArgs = {
					args: {
						[arg1Name]: arg1,
						[arg2Name]: arg2
					},
					options: commandOrOptions as CommanderOptions
				};

				setupLoggerAndLogOptions(runArgs);
				checkOptions(runArgs.options);
				setupREST(runArgs.options);
				return command.run(runArgs);
			}
		);

	for (const arg of command.arguments) {
		subcommand.argument(`<${arg.name}>`, arg.description);
	}

	commanderCommands.push(subcommand);
}

for (const commanderCommand of commanderCommands) {
	rootCommand.addCommand(commanderCommand);
}

rootCommand.parse(process.argv);

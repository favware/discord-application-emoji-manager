import { container } from '@sapphire/pieces';
import type { Snowflake } from 'discord-api-types/globals';
import { Routes } from 'discord-api-types/v10';
import { Command } from '#lib/structures/Command';
import { checksIdIsInArgs } from '#lib/utils/checks';
import { handleError } from '#lib/utils/error-handler';

type Args = [['id', Snowflake]];

export class GetEmojis extends Command<Args> {
	public constructor(context: Command.LoaderContext) {
		super(context, {
			description: 'Gets a single emojis from the server in JSON format',
			arguments: [
				{
					name: 'id',
					description: 'The id of the emoji to get'
				}
			]
		});
	}

	public override async run({ args, options }: Command.Run<Args>) {
		checksIdIsInArgs('get', args.id);

		try {
			const response = await this.container.rest.get(Routes.applicationEmoji(options.applicationId, args.id));

			this.container.logger.info(`Requested emoji data:`);
			console.log(JSON.stringify(response, null, 4));
		} catch (error) {
			handleError(error as Error);
		}
	}
}

void container.stores.loadPiece({
	name: 'get',
	piece: GetEmojis,
	store: 'commands'
});

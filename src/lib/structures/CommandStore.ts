import { Store } from '@sapphire/pieces';
import { Command } from '#lib/structures/Command';

/**
 * Stores all Command pieces
 */
export class CommandStore extends Store<Command<[string, unknown][]>, 'commands'> {
	public constructor() {
		super(Command, { name: 'commands' });
	}
}

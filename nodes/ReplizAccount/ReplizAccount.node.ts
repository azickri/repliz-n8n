import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { replizApiRequest, replizApiRequestAllItems } from '../GenericFunctions';

export class ReplizAccount implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Repliz Account',
		name: 'replizAccount',
		icon: 'file:repliz.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Manage connected social media accounts in Repliz (Standard+)',
		defaults: { name: 'Repliz Account' },
		inputs: ['main'],
		outputs: ['main'],
		credentials: [{ name: 'replizApi', required: true }],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Get All', value: 'getAll', description: 'Retrieve all connected accounts', action: 'Get all accounts' },
					{ name: 'Count', value: 'count', description: 'Get account usage statistics per platform', action: 'Count accounts' },
					{ name: 'Get', value: 'get', description: 'Retrieve detailed info of a specific account', action: 'Get an account' },
					{ name: 'Get Statistics', value: 'getStatistic', description: 'Retrieve statistics for a specific account (Facebook Page, Instagram, Threads, TikTok, Pinterest, YouTube, LinkedIn organization)', action: 'Get account statistics' },
					{ name: 'Update Automation', value: 'updateAutomation', description: 'Update content automation settings for a connected account', action: 'Update account automation' },
					{ name: 'Get Tags', value: 'getTags', description: 'Retrieve every tag used to group accounts, with how many accounts have it per platform', action: 'Get account tags' },
					{ name: 'Update Tags', value: 'updateTags', description: 'Replace every tag of a connected account', action: 'Update account tags' },
					{ name: 'Rename Tag', value: 'renameTag', description: 'Rename a tag on every account that has it', action: 'Rename an account tag' },
					{ name: 'Remove Tag', value: 'removeTag', description: 'Remove a tag from every account that has it', action: 'Remove an account tag' },
					{ name: 'Delete', value: 'delete', description: 'Disconnect and remove an account', action: 'Delete an account' },
				],
				default: 'getAll',
			},
			// Get All
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				displayOptions: { show: { operation: ['getAll'] } },
				default: false,
				description: 'Whether to return all results or only up to a limit',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				displayOptions: { show: { operation: ['getAll'], returnAll: [false] } },
				typeOptions: { minValue: 1, maxValue: 100 },
				default: 20,
				description: 'Max number of results to return',
			},
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				displayOptions: { show: { operation: ['getAll'] } },
				options: [
					{
						displayName: 'Platform Types',
						name: 'types',
						type: 'multiOptions',
						options: [
							{ name: 'Facebook', value: 'facebook' },
							{ name: 'Instagram', value: 'instagram' },
							{ name: 'Threads', value: 'threads' },
							{ name: 'TikTok', value: 'tiktok' },
							{ name: 'LinkedIn', value: 'linkedin' },
							{ name: 'YouTube', value: 'youtube' },
							{ name: 'Shopee', value: 'shopee' },
							{ name: 'X (Twitter)', value: 'twitter' },
							{ name: 'WhatsApp', value: 'whatsapp' },
							{ name: 'Telegram', value: 'telegram' },
							{ name: 'Pinterest', value: 'pinterest' },
						],
						default: [],
						description: 'Filter by platform type',
					},
					{
						displayName: 'Search',
						name: 'search',
						type: 'string',
						default: '',
						description: 'Search accounts by name or username',
					},
					{
						displayName: 'Status',
						name: 'status',
						type: 'options',
						options: [
							{ name: 'All', value: '' },
							{ name: 'Connected', value: 'connected' },
							{ name: 'Disconnected', value: 'disconnected' },
						],
						default: '',
						description: 'Only connected accounts, or only disconnected ones that have to be reconnected first',
					},
					{
						displayName: 'Tags',
						name: 'tags',
						type: 'string',
						default: '',
						placeholder: 'Brand A, Brand B',
						description: 'Comma-separated tags. Only accounts with at least one of them are returned, case-insensitive.',
					},
				],
			},
			// Get / Delete / Get Statistics / Update Automation
			{
				displayName: 'Account ID',
				name: 'accountId',
				type: 'string',
				required: true,
				displayOptions: { show: { operation: ['get', 'delete', 'getStatistic', 'updateAutomation', 'updateTags'] } },
				default: '',
				description: 'The unique identifier of the account',
			},
			// Update Tags
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'string',
				displayOptions: { show: { operation: ['updateTags'] } },
				default: '',
				placeholder: 'Brand A, Jakarta',
				description: 'Comma-separated list of every tag of the account, replacing the current tags. At most 10, of up to 30 characters each. Leave empty to remove all tags. A tag another account already has takes its spelling.',
			},
			// Rename Tag / Remove Tag
			{
				displayName: 'Tag',
				name: 'tag',
				type: 'string',
				required: true,
				displayOptions: { show: { operation: ['renameTag', 'removeTag'] } },
				default: '',
				placeholder: 'Brand A',
				description: 'The tag to change, case-insensitive. Fails when no account has it.',
			},
			{
				displayName: 'New Name',
				name: 'name',
				type: 'string',
				required: true,
				displayOptions: { show: { operation: ['renameTag'] } },
				default: '',
				placeholder: 'Brand Alpha',
				description: 'The new name, up to 30 characters. When another tag already has this name, the two are merged.',
			},
			// Update Automation Config
			{
				displayName: 'Automation Config (JSON)',
				name: 'configJson',
				type: 'json',
				required: true,
				displayOptions: { show: { operation: ['updateAutomation'] } },
				default: '{"delete":{},"reply":{},"like":{},"message":{},"chat":{},"story":{}}',
				description:
					'Automation configuration object including delete, reply, like, message, chat, story, storyMention, and starter rules. Keywords in message, story and chat (Instagram and Facebook) can answer with buttons: give a keyword.values item "type": "opening" and its own "opening" object, and send the "id" Repliz returns on it back unchanged when updating. Set opening.webUrl.isTrackLink to true to send the links of an opening as rplz.link short links and count their clicks. Set opening.webUrl.followUp { isActive, delay, text } to send one reminder with the same links when none was tapped after delay seconds (600, 1800, 3600, 10800, 21600, 43200 or 82800; needs isTrackLink; a DM to a commenter needs a first message with a button). Set opening.input { isActive, type: "email" or "phone", text, retryText, tag } to ask for an email or phone number after a button tap and before webUrl (needs postback or additional active): a valid answer is saved to the contact (plus tag), then webUrl is sent; after 3 invalid answers webUrl is sent anyway. story and storyMention (Instagram) take react { isActive, emoji } to react to the story reply or mention with one of ❤️ 🔥 😍 😂 👍 🙏, together with the answer. See <a href="https://docs.repliz.com/api/guides/automation-config#link-reminder" target="_blank">Link Reminder</a>. See <a href="https://docs.repliz.com/api/guides/automation-config#keyword-with-buttons" target="_blank">Keyword with Buttons</a>. Add "storyMention" (Instagram only, optional) to DM people who mention the account in their own story: { isActive, type: "text" | "ai" | "opening", text, prompt, opening, delay }, without keyword or condition. Left out, the saved setting is kept. See <a href="https://docs.repliz.com/api/guides/automation-config#_7-story-mention-module" target="_blank">Story Mention Module</a>. Add "pause" (optional) to pause the DM automation of a chat when the account replies to it by hand: { isActive, value }, value in seconds 1800, 3600, 21600, 86400 or 0 until resumed. Left out, the saved setting is kept. Add "starter" (Instagram and Facebook only, optional) for DM Starters: { isActive, questions, links }. questions holds up to 4 { id, question, type: "text" | "opening", text, opening } shown in an empty chat (ice breakers), replacing the FAQ set in the app; links holds up to 20 { id, ref, type, text, opening }, answered when someone opens https://ig.me/m/<username>?ref=<ref> or https://m.me/<page id>?ref=<ref>. On Instagram a link opens the chat only when tapped inside the Instagram app. Send the "id" values back unchanged. Left out, the saved setting is kept. See <a href="https://docs.repliz.com/api/guides/automation-config#dm-starters" target="_blank">DM Starters</a>. Every reply, message, chat, story and storyMention can also take "limit" { isActive, value, count } to answer the same person at most count times (1-100, default 1) per value seconds, counted from their first answer (value: 3600, 21600, 86400, 604800 or 2592000; per post for comments, per account for DMs), and "knowledgeIds", up to 5 IDs from Repliz Knowledge that the AI reads when type is "ai". Left out, the saved limit and knowledgeIds are kept. See <a href="https://docs.repliz.com/api/guides/automation-config#limit-and-knowledge" target="_blank">Limit and Knowledge</a>.',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;
				let responseData: any;

				if (operation === 'getAll') {
					const returnAll = this.getNodeParameter('returnAll', i) as boolean;
					const filters = this.getNodeParameter('filters', i) as any;
					const qs: any = {};
					if (filters.types?.length) qs.types = filters.types;
					if (filters.search) qs.search = filters.search;
					if (filters.status) qs.status = filters.status;
					if (filters.tags) qs.tags = String(filters.tags).split(',').map((s: string) => s.trim()).filter(Boolean);

					if (returnAll) {
						responseData = await replizApiRequestAllItems.call(this, 'GET', '/public/account', {}, qs);
					} else {
						const limit = this.getNodeParameter('limit', i) as number;
						const res = await replizApiRequest.call(this, 'GET', '/public/account', {}, { ...qs, page: 1, limit });
						responseData = res
					}
				} else if (operation === 'count') {
					responseData = await replizApiRequest.call(this, 'GET', '/public/account/count');
				} else if (operation === 'get') {
					const accountId = this.getNodeParameter('accountId', i) as string;
					responseData = await replizApiRequest.call(this, 'GET', `/public/account/${accountId}`);
				} else if (operation === 'getStatistic') {
					const accountId = this.getNodeParameter('accountId', i) as string;
					responseData = await replizApiRequest.call(this, 'GET', `/public/account/${accountId}/statistic`);
				} else if (operation === 'updateAutomation') {
					const accountId = this.getNodeParameter('accountId', i) as string;
					const configRaw = this.getNodeParameter('configJson', i);
					const config = typeof configRaw === 'string' ? JSON.parse(configRaw) : configRaw;
					responseData = await replizApiRequest.call(this, 'PUT', `/public/account/${accountId}/automation`, config);
				} else if (operation === 'getTags') {
					responseData = await replizApiRequest.call(this, 'GET', '/public/account/tag');
				} else if (operation === 'updateTags') {
					const accountId = this.getNodeParameter('accountId', i) as string;
					const tags = String(this.getNodeParameter('tags', i) || '').split(',').map((s: string) => s.trim()).filter(Boolean);
					await replizApiRequest.call(this, 'PUT', `/public/account/${accountId}/tag`, { tags });
					responseData = { success: true, accountId, tags };
				} else if (operation === 'renameTag') {
					const tag = this.getNodeParameter('tag', i) as string;
					const name = this.getNodeParameter('name', i) as string;
					await replizApiRequest.call(this, 'PUT', '/public/account/tag', { tag, name });
					responseData = { success: true, tag, name };
				} else if (operation === 'removeTag') {
					const tag = this.getNodeParameter('tag', i) as string;
					await replizApiRequest.call(this, 'DELETE', '/public/account/tag', {}, { tag });
					responseData = { success: true, tag };
				} else if (operation === 'delete') {
					const accountId = this.getNodeParameter('accountId', i) as string;
					responseData = await replizApiRequest.call(this, 'DELETE', `/public/account/${accountId}`);
				}

				returnData.push(...this.helpers.returnJsonArray(responseData));
			} catch (error) {
				if (this.continueOnFail()) { returnData.push({ json: { error: (error as Error).message } }); continue; }
				throw error;
			}
		}
		return [returnData];
	}
}

import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { replizApiRequest, replizApiRequestAllItems } from '../GenericFunctions';

const BROADCAST_OPERATIONS = ['get', 'getRecipients', 'cancel', 'delete'];

function splitIds(value: string): string[] {
	return (value || '')
		.split(',')
		.map((item) => item.trim())
		.filter(Boolean);
}

export class ReplizBroadcast implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Repliz Broadcast',
		name: 'replizBroadcast',
		icon: 'file:repliz.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Send one message to many chats of an account, for example to follow up the unanswered ones (Premium+)',
		defaults: { name: 'Repliz Broadcast' },
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
					{ name: 'Get All', value: 'getAll', description: 'Retrieve the broadcasts', action: 'Get all broadcasts' },
					{ name: 'Get Audience', value: 'getAudience', description: 'Retrieve the chats a broadcast can go to now', action: 'Get the audience of a broadcast' },
					{ name: 'Get', value: 'get', description: 'Retrieve one broadcast with its counts', action: 'Get a broadcast' },
					{ name: 'Get Recipients', value: 'getRecipients', description: 'Retrieve the recipients of a broadcast with what happened to each one', action: 'Get the recipients of a broadcast' },
					{ name: 'Create', value: 'create', description: 'Send one message to many chats', action: 'Create a broadcast' },
					{ name: 'Cancel', value: 'cancel', description: 'Stop a broadcast that is still sending', action: 'Cancel a broadcast' },
					{ name: 'Delete', value: 'delete', description: 'Remove a broadcast that is done or canceled', action: 'Delete a broadcast' },
				],
				default: 'getAll',
			},

			// IDs
			{
				displayName: 'Broadcast ID',
				name: 'broadcastId',
				type: 'string',
				required: true,
				displayOptions: { show: { operation: BROADCAST_OPERATIONS } },
				default: '',
				description: 'The ID of the broadcast, the broadcastId from Create or the _id from Get All',
			},

			// Get All / Get Audience / Get Recipients
			{ displayName: 'Return All', name: 'returnAll', type: 'boolean', displayOptions: { show: { operation: ['getAll', 'getAudience', 'getRecipients'] } }, default: false, description: 'Whether to return all results or only up to a limit' },
			{ displayName: 'Limit', name: 'limit', type: 'number', displayOptions: { show: { operation: ['getAll', 'getAudience', 'getRecipients'], returnAll: [false] } }, typeOptions: { minValue: 1, maxValue: 100 }, default: 50, description: 'Max number of results to return' },
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				displayOptions: { show: { operation: ['getAll'] } },
				options: [
					{ displayName: 'Account IDs', name: 'accountIds', type: 'string', default: '', placeholder: 'id1,id2', description: 'Only broadcasts of these accounts, comma-separated' },
					{
						displayName: 'Status',
						name: 'status',
						type: 'options',
						options: [
							{ name: 'Sending', value: 'process' },
							{ name: 'Done', value: 'done' },
							{ name: 'Canceled', value: 'canceled' },
						],
						default: 'process',
						description: 'Only broadcasts with this status',
					},
				],
			},
			{
				displayName: 'Filters',
				name: 'recipientFilters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				displayOptions: { show: { operation: ['getRecipients'] } },
				options: [
					{
						displayName: 'Status',
						name: 'status',
						type: 'options',
						options: [
							{ name: 'Waiting (Pending, Queued or Sending)', value: 'waiting' },
							{ name: 'Sent', value: 'sent' },
							{ name: 'Skipped', value: 'skipped' },
							{ name: 'Failed', value: 'failed' },
						],
						default: 'sent',
						description: 'Only recipients with this status',
					},
				],
			},

			// Get Audience / Create
			{
				displayName: 'Account ID',
				name: 'accountId',
				type: 'string',
				required: true,
				displayOptions: { show: { operation: ['getAudience', 'create'] } },
				default: '',
				description: 'The Facebook, Instagram, TikTok, or Telegram account _id from Repliz Account',
			},
			{
				displayName: 'Audience',
				name: 'audience',
				type: 'options',
				displayOptions: { show: { operation: ['getAudience', 'create'] } },
				options: [
					{ name: 'Unreplied', value: 'unreplied', description: 'Chats whose last message came from the other person, so nobody answered yet' },
					{ name: 'All Chats', value: 'all', description: 'Every chat that can still get a message' },
				],
				default: 'unreplied',
				description: 'On Facebook, Instagram, and TikTok only chats whose last message from the person is under 24 hours old are listed, as the platforms require. Telegram has no such window.',
			},
			{
				displayName: 'Search',
				name: 'search',
				type: 'string',
				displayOptions: { show: { operation: ['getAudience'] } },
				default: '',
				description: 'Matches the name of the person',
			},

			// Create
			{
				displayName: 'Recipients',
				name: 'recipients',
				type: 'options',
				displayOptions: { show: { operation: ['create'] } },
				options: [
					{ name: 'Whole Audience', value: 'all', description: 'Send to the whole audience (its 1,000 newest chats), except the Excluded Chat IDs' },
					{ name: 'Picked Chats', value: 'picked', description: 'Send only to the Chat IDs' },
				],
				default: 'all',
			},
			{
				displayName: 'Chat IDs',
				name: 'chatIds',
				type: 'string',
				required: true,
				displayOptions: { show: { operation: ['create'], recipients: ['picked'] } },
				default: '',
				placeholder: 'id1,id2',
				description: 'Up to 1,000 chat _id values from Get Audience, comma-separated',
			},
			{
				displayName: 'Excluded Chat IDs',
				name: 'excludedChatIds',
				type: 'string',
				displayOptions: { show: { operation: ['create'], recipients: ['all'] } },
				default: '',
				placeholder: 'id1,id2',
				description: 'Chats to leave out, comma-separated',
			},
			{
				displayName: 'Text',
				name: 'text',
				type: 'string',
				typeOptions: { rows: 3 },
				displayOptions: { show: { operation: ['create'] } },
				default: '',
				placeholder: '{Hi|Hello} {name}, sorry for the late reply. Can we help with anything?',
				description: 'Up to 1,000 characters. {name} becomes each person\'s name and {Hi|Hello} picks one at random. Required when there is no media.',
			},
			{
				displayName: 'Delay',
				name: 'delay',
				type: 'options',
				displayOptions: { show: { operation: ['create'] } },
				options: [
					{ name: '5 Seconds', value: 5 },
					{ name: '10 Seconds', value: 10 },
					{ name: '15 Seconds', value: 15 },
					{ name: '30 Seconds', value: 30 },
					{ name: '1 Minute', value: 60 },
					{ name: '2 Minutes', value: 120 },
					{ name: '5 Minutes', value: 300 },
					{ name: '10 Minutes', value: 600 },
					{ name: '15 Minutes', value: 900 },
					{ name: '30 Minutes', value: 1800 },
					{ name: '1 Hour', value: 3600 },
				],
				default: 5,
				description: 'Time between two messages. Repliz sends to one chat at a time and checks each chat again just before: a chat whose 24-hour window closed, or that was answered before its turn with Unreplied, is skipped.',
			},
			{
				displayName: 'Media',
				name: 'media',
				type: 'collection',
				placeholder: 'Add Media',
				default: {},
				displayOptions: { show: { operation: ['create'] } },
				description: 'One image or video sent right after the text, as its own message. Facebook, Instagram, and Telegram only.',
				options: [
					{
						displayName: 'Type',
						name: 'type',
						type: 'options',
						options: [
							{ name: 'Image', value: 'image' },
							{ name: 'Video', value: 'video' },
						],
						default: 'image',
					},
					{ displayName: 'URL', name: 'url', type: 'string', default: '', description: 'Public URL of the file, for example from Repliz Storage' },
					{ displayName: 'MIME Type', name: 'mimetype', type: 'string', default: 'image/jpeg', placeholder: 'image/jpeg', description: 'For example image/jpeg or video/mp4' },
					{ displayName: 'Thumbnail URL', name: 'thumbnail', type: 'string', default: '', description: 'Preview shown in Repliz, and the video cover on Telegram' },
					{ displayName: 'Duration', name: 'duration', type: 'number', default: 0, description: 'Video length in seconds' },
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;
				const broadcastId = BROADCAST_OPERATIONS.includes(operation) ? (this.getNodeParameter('broadcastId', i) as string) : '';
				let responseData: any;

				if (operation === 'getAll') {
					const returnAll = this.getNodeParameter('returnAll', i) as boolean;
					const filters = this.getNodeParameter('filters', i) as any;
					const qs: any = {};
					if (filters.status) qs.status = filters.status;
					if (filters.accountIds) qs.accountIds = splitIds(filters.accountIds);

					if (returnAll) {
						responseData = await replizApiRequestAllItems.call(this, 'GET', '/public/broadcast', {}, qs);
					} else {
						const limit = this.getNodeParameter('limit', i) as number;
						responseData = await replizApiRequest.call(this, 'GET', '/public/broadcast', {}, { ...qs, page: 1, limit });
					}
				} else if (operation === 'getAudience') {
					const returnAll = this.getNodeParameter('returnAll', i) as boolean;
					const qs: any = {
						accountId: this.getNodeParameter('accountId', i) as string,
						audience: this.getNodeParameter('audience', i) as string,
					};
					const search = this.getNodeParameter('search', i, '') as string;
					if (search) qs.search = search;

					if (returnAll) {
						responseData = await replizApiRequestAllItems.call(this, 'GET', '/public/broadcast/audience', {}, qs);
					} else {
						const limit = this.getNodeParameter('limit', i) as number;
						responseData = await replizApiRequest.call(this, 'GET', '/public/broadcast/audience', {}, { ...qs, page: 1, limit });
					}
				} else if (operation === 'get') {
					responseData = await replizApiRequest.call(this, 'GET', `/public/broadcast/${broadcastId}`);
				} else if (operation === 'getRecipients') {
					const returnAll = this.getNodeParameter('returnAll', i) as boolean;
					const filters = this.getNodeParameter('recipientFilters', i) as any;
					const qs: any = {};
					if (filters.status) qs.status = filters.status;
					const endpoint = `/public/broadcast/${broadcastId}/recipient`;

					if (returnAll) {
						responseData = await replizApiRequestAllItems.call(this, 'GET', endpoint, {}, qs);
					} else {
						const limit = this.getNodeParameter('limit', i) as number;
						responseData = await replizApiRequest.call(this, 'GET', endpoint, {}, { ...qs, page: 1, limit });
					}
				} else if (operation === 'create') {
					const recipients = this.getNodeParameter('recipients', i) as string;
					const media = this.getNodeParameter('media', i) as any;
					const body: any = {
						accountId: this.getNodeParameter('accountId', i) as string,
						audience: this.getNodeParameter('audience', i) as string,
						delay: this.getNodeParameter('delay', i) as number,
						text: this.getNodeParameter('text', i) as string,
					};

					if (recipients === 'all') {
						body.isAll = true;
						body.excludedChatIds = splitIds(this.getNodeParameter('excludedChatIds', i, '') as string);
					} else {
						body.chatIds = splitIds(this.getNodeParameter('chatIds', i) as string);
					}

					if (media?.url) {
						body.media = {
							type: media.type || 'image',
							url: media.url,
							mimetype: media.mimetype || (media.type === 'video' ? 'video/mp4' : 'image/jpeg'),
							...(media.thumbnail ? { thumbnail: media.thumbnail } : {}),
							...(media.duration ? { duration: media.duration } : {}),
						};
					}

					responseData = await replizApiRequest.call(this, 'POST', '/public/broadcast', body);
				} else if (operation === 'cancel') {
					await replizApiRequest.call(this, 'PUT', `/public/broadcast/${broadcastId}/cancel`, {});
					responseData = { success: true, broadcastId };
				} else if (operation === 'delete') {
					await replizApiRequest.call(this, 'DELETE', `/public/broadcast/${broadcastId}`);
					responseData = { success: true, broadcastId };
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

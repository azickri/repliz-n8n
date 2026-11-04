import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { replizApiRequest, replizApiRequestAllItems } from '../GenericFunctions';

const stageOptions = [
	{ name: 'New', value: 'new' },
	{ name: 'Contacted', value: 'contacted' },
	{ name: 'Interested', value: 'interested' },
	{ name: 'Won', value: 'won' },
	{ name: 'Lost', value: 'lost' },
];

const filterOptions = [
	{
		displayName: 'Tag',
		name: 'tag',
		type: 'string' as const,
		default: '',
		description: 'Only contacts that have this exact tag',
	},
	{
		displayName: 'Follow-up',
		name: 'followUp',
		type: 'options' as const,
		options: [
			{ name: 'Scheduled', value: 'scheduled', description: 'Contacts with a follow-up' },
			{ name: 'Due', value: 'due', description: 'Follow-ups whose time has passed' },
		],
		default: 'scheduled',
		description: 'Only contacts with a follow-up. With this set, contacts are sorted by the nearest follow-up.',
	},
	{
		displayName: 'Account IDs',
		name: 'accountIds',
		type: 'string' as const,
		default: '',
		placeholder: 'id1,id2,id3',
		description: 'Comma-separated list of account IDs to filter by',
	},
	{
		displayName: 'Search',
		name: 'search',
		type: 'string' as const,
		default: '',
		description: 'Search contacts by name or note',
	},
];

function toQuery(filters: any): any {
	const qs: any = {};
	if (filters.stage) qs.stage = filters.stage;
	if (filters.tag) qs.tag = filters.tag;
	if (filters.followUp) qs.followUp = filters.followUp;
	if (filters.search) qs.search = filters.search;
	if (filters.accountIds) qs.accountIds = filters.accountIds.split(',').map((s: string) => s.trim()).filter(Boolean);
	return qs;
}

export class ReplizContact implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Repliz Contact',
		name: 'replizContact',
		icon: 'file:repliz.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Manage the contacts Repliz collects from comments and messages: funnel stage, tags, notes and follow-ups (Standard+)',
		defaults: { name: 'Repliz Contact' },
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
					{ name: 'Get All', value: 'getAll', description: 'Retrieve contacts, newest interaction first', action: 'Get all contacts' },
					{ name: 'Count', value: 'count', description: 'Count contacts per funnel stage and the follow-ups that are due', action: 'Count contacts' },
					{ name: 'Get Tags', value: 'getTags', description: 'Retrieve every tag used on contacts', action: 'Get contact tags' },
					{ name: 'Get', value: 'get', description: 'Retrieve one contact', action: 'Get a contact' },
					{ name: 'Get by Comment', value: 'getByComment', description: 'Retrieve the contact of the person who wrote a comment, creating it if needed', action: 'Get the contact of a comment' },
					{ name: 'Get by Chat', value: 'getByChat', description: 'Retrieve the contact of the person in a chat, creating it if needed', action: 'Get the contact of a chat' },
					{ name: 'Update', value: 'update', description: 'Change the funnel stage, tags or note of a contact', action: 'Update a contact' },
					{ name: 'Set Follow-up', value: 'setFollowUp', description: 'Plan a follow-up reminder for a contact', action: 'Set a contact follow up' },
					{ name: 'Remove Follow-up', value: 'removeFollowUp', description: 'Clear the follow-up of a contact', action: 'Remove a contact follow up' },
					{ name: 'Delete', value: 'delete', description: 'Delete a contact with its stage, tags, note and follow-up', action: 'Delete a contact' },
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
						displayName: 'Stage',
						name: 'stage',
						type: 'options',
						options: stageOptions,
						default: 'new',
						description: 'Only contacts in this funnel stage',
					},
					...filterOptions,
				],
			},
			// Count
			{
				displayName: 'Filters',
				name: 'countFilters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				displayOptions: { show: { operation: ['count'] } },
				options: filterOptions,
			},
			// Get / Update / Follow-up / Delete
			{
				displayName: 'Contact ID',
				name: 'contactId',
				type: 'string',
				required: true,
				displayOptions: { show: { operation: ['get', 'update', 'setFollowUp', 'removeFollowUp', 'delete'] } },
				default: '',
				description: 'The _id of the contact from Get All',
			},
			// Get by Comment
			{
				displayName: 'Comment ID',
				name: 'commentId',
				type: 'string',
				required: true,
				displayOptions: { show: { operation: ['getByComment'] } },
				default: '',
				description: 'The _id of the comment from Repliz Comment, not the platform comment ID',
			},
			// Get by Chat
			{
				displayName: 'Chat ID',
				name: 'chatId',
				type: 'string',
				required: true,
				displayOptions: { show: { operation: ['getByChat'] } },
				default: '',
				description: 'The _id of the chat from Repliz Chat (Gold+), not the platform conversation ID',
			},
			// Update
			{
				displayName: 'Update Fields',
				name: 'updateFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { operation: ['update'] } },
				description: 'Fields left out keep their current value',
				options: [
					{
						displayName: 'Stage',
						name: 'stage',
						type: 'options',
						options: stageOptions,
						default: 'contacted',
						description: 'The new funnel stage',
					},
					{
						displayName: 'Tags',
						name: 'tags',
						type: 'string',
						default: '',
						placeholder: 'reseller,jakarta',
						description: 'Comma-separated list of every tag of the contact, replacing the current tags. At most 20, of up to 30 characters each. Leave empty to remove all tags.',
					},
					{
						displayName: 'Note',
						name: 'note',
						type: 'string',
						typeOptions: { rows: 3 },
						default: '',
						description: 'The new note, up to 2000 characters, replacing the current one',
					},
				],
			},
			// Set Follow-up
			{
				displayName: 'Follow-up At',
				name: 'at',
				type: 'dateTime',
				required: true,
				displayOptions: { show: { operation: ['setFollowUp'] } },
				default: '',
				description: 'When to follow up, in the future (ISO 8601 format). Replaces the current follow-up.',
			},
			{
				displayName: 'Follow-up Note',
				name: 'note',
				type: 'string',
				typeOptions: { rows: 2 },
				displayOptions: { show: { operation: ['setFollowUp'] } },
				default: '',
				description: 'What to follow up on, up to 500 characters. The follow-up is a reminder in Repliz and sends nothing to the contact.',
			},
			{
				displayName: 'Follow-up Message',
				name: 'message',
				type: 'string',
				typeOptions: { rows: 3 },
				displayOptions: { show: { operation: ['setFollowUp'] } },
				default: '',
				description: 'Optional message drafted for the follow-up, up to 1000 characters. Repliz does not send it by itself; send it with Repliz Chat (Send Message) or Repliz Comment (Reply).',
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
					const qs = toQuery(this.getNodeParameter('filters', i) as any);

					if (returnAll) {
						responseData = await replizApiRequestAllItems.call(this, 'GET', '/public/contact', {}, qs);
					} else {
						const limit = this.getNodeParameter('limit', i) as number;
						responseData = await replizApiRequest.call(this, 'GET', '/public/contact', {}, { ...qs, page: 1, limit });
					}
				} else if (operation === 'count') {
					const qs = toQuery(this.getNodeParameter('countFilters', i) as any);
					responseData = await replizApiRequest.call(this, 'GET', '/public/contact/count', {}, qs);
				} else if (operation === 'getTags') {
					const tags = (await replizApiRequest.call(this, 'GET', '/public/contact/tag')) as string[];
					responseData = { tags };
				} else if (operation === 'get') {
					const contactId = this.getNodeParameter('contactId', i) as string;
					responseData = await replizApiRequest.call(this, 'GET', `/public/contact/${contactId}`);
				} else if (operation === 'getByComment') {
					const commentId = this.getNodeParameter('commentId', i) as string;
					responseData = await replizApiRequest.call(this, 'PUT', `/public/contact/comment/${commentId}`);
				} else if (operation === 'getByChat') {
					const chatId = this.getNodeParameter('chatId', i) as string;
					responseData = await replizApiRequest.call(this, 'PUT', `/public/contact/chat/${chatId}`);
				} else if (operation === 'update') {
					const contactId = this.getNodeParameter('contactId', i) as string;
					const fields = this.getNodeParameter('updateFields', i) as any;
					const current = await replizApiRequest.call(this, 'GET', `/public/contact/${contactId}`);
					const body = {
						stage: fields.stage ?? current.stage,
						tags:
							fields.tags !== undefined
								? String(fields.tags).split(',').map((s: string) => s.trim()).filter(Boolean)
								: current.tags || [],
						note: fields.note ?? current.note ?? '',
					};
					await replizApiRequest.call(this, 'PUT', `/public/contact/${contactId}`, body);
					responseData = await replizApiRequest.call(this, 'GET', `/public/contact/${contactId}`);
				} else if (operation === 'setFollowUp') {
					const contactId = this.getNodeParameter('contactId', i) as string;
					const at = this.getNodeParameter('at', i) as string;
					const note = this.getNodeParameter('note', i) as string;
					const message = this.getNodeParameter('message', i) as string;
					await replizApiRequest.call(this, 'PUT', `/public/contact/${contactId}/follow-up`, { at, note, ...(message ? { message } : {}) });
					responseData = await replizApiRequest.call(this, 'GET', `/public/contact/${contactId}`);
				} else if (operation === 'removeFollowUp') {
					const contactId = this.getNodeParameter('contactId', i) as string;
					await replizApiRequest.call(this, 'DELETE', `/public/contact/${contactId}/follow-up`);
					responseData = await replizApiRequest.call(this, 'GET', `/public/contact/${contactId}`);
				} else if (operation === 'delete') {
					const contactId = this.getNodeParameter('contactId', i) as string;
					await replizApiRequest.call(this, 'DELETE', `/public/contact/${contactId}`);
					responseData = { success: true, contactId };
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

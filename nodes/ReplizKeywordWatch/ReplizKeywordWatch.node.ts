import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { replizApiRequest, replizApiRequestAllItems } from '../GenericFunctions';

const SAVE_OPERATIONS = ['create', 'update'];
const WATCHER_OPERATIONS = ['get', 'update', 'updateStatus', 'delete', 'getPosts', 'updateDraft', 'sendReply', 'skipPost'];
const MATCH_OPERATIONS = ['updateDraft', 'sendReply', 'skipPost'];

function splitIds(value: string): string[] {
	return (value || '')
		.split(',')
		.map((item) => item.trim())
		.filter(Boolean);
}

function buildReply(params: { replyType?: string; replyText?: string; replyPrompt?: string; knowledgeIds?: string; approval?: string }): any {
	const type = params.replyType || 'none';
	if (type === 'text') {
		return { type, text: params.replyText || '', approval: params.approval || '' };
	}
	if (type === 'ai') {
		return {
			type,
			prompt: params.replyPrompt || '',
			knowledgeIds: splitIds(params.knowledgeIds || ''),
			approval: params.approval || '',
		};
	}
	return { type: 'none' };
}

export class ReplizKeywordWatch implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Repliz Keyword Watch',
		name: 'replizKeywordWatch',
		icon: 'file:repliz.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Find new Threads posts by a keyword and a description, and reply to them (Gold+)',
		defaults: { name: 'Repliz Keyword Watch' },
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
					{ name: 'Get All', value: 'getAll', description: 'Retrieve the keyword watches', action: 'Get all keyword watches' },
					{ name: 'Get', value: 'get', description: 'Retrieve one keyword watch', action: 'Get a keyword watch' },
					{ name: 'Create', value: 'create', description: 'Start watching Threads for a keyword', action: 'Create a keyword watch' },
					{ name: 'Update', value: 'update', description: 'Replace the settings of a keyword watch', action: 'Update a keyword watch' },
					{ name: 'Update Status', value: 'updateStatus', description: 'Pause or resume a keyword watch', action: 'Update a keyword watch status' },
					{ name: 'Delete', value: 'delete', description: 'Remove a keyword watch with the posts it found', action: 'Delete a keyword watch' },
					{ name: 'Get Posts', value: 'getPosts', description: 'Retrieve the posts a keyword watch found', action: 'Get the posts of a keyword watch' },
					{ name: 'Update Draft', value: 'updateDraft', description: 'Change the reply of a found post without sending it', action: 'Update a keyword watch draft' },
					{ name: 'Send Reply', value: 'sendReply', description: 'Send the reply of a found post', action: 'Send a keyword watch reply' },
					{ name: 'Skip Post', value: 'skipPost', description: 'Skip a found post so it gets no reply', action: 'Skip a keyword watch post' },
				],
				default: 'getAll',
			},

			// IDs
			{
				displayName: 'Watcher ID',
				name: 'watcherId',
				type: 'string',
				required: true,
				displayOptions: { show: { operation: WATCHER_OPERATIONS } },
				default: '',
				description: 'The ID of the keyword watch, the watcherId from Create or the _id from Get All',
			},
			{
				displayName: 'Match ID',
				name: 'matchId',
				type: 'string',
				required: true,
				displayOptions: { show: { operation: MATCH_OPERATIONS } },
				default: '',
				description: 'The ID of the found post, the _id from Get Posts',
			},

			// Get All
			{ displayName: 'Return All', name: 'returnAll', type: 'boolean', displayOptions: { show: { operation: ['getAll', 'getPosts'] } }, default: false, description: 'Whether to return all results or only up to a limit' },
			{ displayName: 'Limit', name: 'limit', type: 'number', displayOptions: { show: { operation: ['getAll', 'getPosts'], returnAll: [false] } }, typeOptions: { minValue: 1, maxValue: 100 }, default: 20, description: 'Max number of results to return' },
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				displayOptions: { show: { operation: ['getAll'] } },
				options: [
					{ displayName: 'Account IDs', name: 'accountIds', type: 'string', default: '', placeholder: 'id1,id2', description: 'Only watches that use one of these accounts, comma-separated' },
					{ displayName: 'Search', name: 'search', type: 'string', default: '', description: 'Matches the keyword or the criteria' },
				],
			},
			{
				displayName: 'Filters',
				name: 'postFilters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				displayOptions: { show: { operation: ['getPosts'] } },
				options: [
					{
						displayName: 'Status',
						name: 'status',
						type: 'options',
						options: [
							{ name: 'Found (No Reply)', value: 'found' },
							{ name: 'Draft', value: 'draft' },
							{ name: 'Queued', value: 'queued' },
							{ name: 'Replied', value: 'replied' },
							{ name: 'Failed', value: 'failed' },
							{ name: 'Skipped', value: 'skipped' },
						],
						default: 'draft',
						description: 'Only posts with this status',
					},
				],
			},

			// Create / Update
			{
				displayName: 'Keyword',
				name: 'keyword',
				type: 'string',
				required: true,
				displayOptions: { show: { operation: SAVE_OPERATIONS } },
				default: '',
				placeholder: 'rekomendasi kopi',
				description: 'One keyword or phrase to search Threads for, up to 100 characters. In Keyword mode a post must contain every word of it. Only posts published after an account is added are picked up.',
			},
			{
				displayName: 'Criteria',
				name: 'criteria',
				type: 'string',
				typeOptions: { rows: 3 },
				displayOptions: { show: { operation: SAVE_OPERATIONS } },
				default: '',
				placeholder: 'People asking for a coffee shop recommendation in Jakarta, not ads or news.',
				description: 'Optional. Which of the found posts to keep, in plain words, up to 1,000 characters. Read by the AI of Setting AI in Repliz (own key or Repliz tokens, set up first), up to 2,000 posts per account a day. Empty keeps every post with the keyword, and then Sending can only be Review First.',
			},
			{
				displayName: 'Excluded Words',
				name: 'excludes',
				type: 'string',
				displayOptions: { show: { operation: SAVE_OPERATIONS } },
				default: '',
				placeholder: 'lowongan, giveaway',
				description: 'Comma-separated words or phrases (up to 20). A post that contains one of them is skipped, without AI.',
			},
			{
				displayName: 'Account ID',
				name: 'accountId',
				type: 'string',
				required: true,
				displayOptions: { show: { operation: SAVE_OPERATIONS } },
				default: '',
				description: 'The Threads account _id from Repliz Account that searches and replies. One account per watch: to watch the same keyword with another account, create another watch. Replies are paced per account: at most 10 an hour and 50 a day, 3 to 10 minutes apart.',
			},
			{
				displayName: 'Reply Type',
				name: 'replyType',
				type: 'options',
				displayOptions: { show: { operation: SAVE_OPERATIONS } },
				options: [
					{ name: 'No Reply', value: 'none', description: 'Only collect the posts and send the keyword_match webhook' },
					{ name: 'Text', value: 'text', description: 'Reply with Reply Text' },
					{ name: 'AI', value: 'ai', description: 'Write a reply from AI Prompt with the AI setting of the Repliz account' },
				],
				default: 'none',
			},
			{
				displayName: 'Reply Text',
				name: 'replyText',
				type: 'string',
				typeOptions: { rows: 2 },
				displayOptions: { show: { operation: SAVE_OPERATIONS, replyType: ['text'] } },
				default: '',
				description: 'Up to 500 characters. {name} becomes the author\'s username and {Hi|Hello} picks one at random.',
			},
			{
				displayName: 'AI Prompt',
				name: 'replyPrompt',
				type: 'string',
				typeOptions: { rows: 3 },
				displayOptions: { show: { operation: SAVE_OPERATIONS, replyType: ['ai'] } },
				default: '',
				description: 'How the AI writes the reply, up to 2,000 characters',
			},
			{
				displayName: 'Knowledge IDs',
				name: 'knowledgeIds',
				type: 'string',
				displayOptions: { show: { operation: SAVE_OPERATIONS, replyType: ['ai'] } },
				default: '',
				placeholder: 'id1,id2',
				description: 'Up to 5 knowledge IDs from Repliz Knowledge, comma-separated',
			},
			{
				displayName: 'Sending',
				name: 'approval',
				type: 'options',
				displayOptions: { show: { operation: SAVE_OPERATIONS, replyType: ['text', 'ai'] } },
				options: [
					{ name: 'Review First', value: 'review', description: 'Keep each reply as a draft until you send it with Send Reply. Drafts are kept for 90 days.' },
					{ name: 'Automatic', value: 'auto', description: 'Send each reply by itself. Needs Criteria.' },
				],
				default: '',
				description: 'Required for Reply Type Text and AI. There is no default on purpose.',
			},
			{
				displayName: 'Filter',
				name: 'filter',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				displayOptions: { show: { operation: SAVE_OPERATIONS } },
				description: 'Narrows the search. The newest posts are always used.',
				options: [
					{
						displayName: 'Mode',
						name: 'mode',
						type: 'options',
						options: [
							{ name: 'Keyword', value: 'KEYWORD', description: 'Search the text' },
							{ name: 'Tag', value: 'TAG', description: 'Search topic tags' },
						],
						default: 'KEYWORD',
					},
					{
						displayName: 'Media Type',
						name: 'type',
						type: 'options',
						options: [
							{ name: 'Text', value: 'TEXT' },
							{ name: 'Image', value: 'IMAGE' },
							{ name: 'Video', value: 'VIDEO' },
						],
						default: 'TEXT',
					},
					{ displayName: 'Username', name: 'username', type: 'string', default: '', description: 'Only posts by this Threads username' },
					{ displayName: 'Include Replies', name: 'isIncludeReplies', type: 'boolean', default: false, description: 'Whether to also keep posts that are replies inside someone else\'s thread. Off keeps only main posts.' },
				],
			},

			// Update Status
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				required: true,
				displayOptions: { show: { operation: ['updateStatus'] } },
				options: [
					{ name: 'Pause', value: 'paused', description: 'Stop searching; automatic replies still waiting are skipped' },
					{ name: 'Resume', value: 'active', description: 'Search again right away' },
				],
				default: 'paused',
			},

			// Update Draft / Send Reply
			{
				displayName: 'Text',
				name: 'text',
				type: 'string',
				required: true,
				typeOptions: { rows: 3 },
				displayOptions: { show: { operation: ['updateDraft'] } },
				default: '',
				description: 'The reply, up to 500 characters',
			},
			{
				displayName: 'Text',
				name: 'sendText',
				type: 'string',
				typeOptions: { rows: 3 },
				displayOptions: { show: { operation: ['sendReply'] } },
				default: '',
				description: 'Replaces the reply before sending, up to 500 characters. Empty sends the saved draft. The reply is queued and goes out at sendAt; over the limit of the account it fails with 429 and retryAt.',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;
				const watcherId = WATCHER_OPERATIONS.includes(operation) ? (this.getNodeParameter('watcherId', i) as string) : '';
				const matchId = MATCH_OPERATIONS.includes(operation) ? (this.getNodeParameter('matchId', i) as string) : '';
				let responseData: any;

				if (operation === 'getAll') {
					const returnAll = this.getNodeParameter('returnAll', i) as boolean;
					const filters = this.getNodeParameter('filters', i) as any;
					const qs: any = {};
					if (filters.search) qs.search = filters.search;
					if (filters.accountIds) qs.accountIds = splitIds(filters.accountIds);

					if (returnAll) {
						responseData = await replizApiRequestAllItems.call(this, 'GET', '/public/watcher', {}, qs);
					} else {
						const limit = this.getNodeParameter('limit', i) as number;
						responseData = await replizApiRequest.call(this, 'GET', '/public/watcher', {}, { ...qs, page: 1, limit });
					}
				} else if (operation === 'get') {
					responseData = await replizApiRequest.call(this, 'GET', `/public/watcher/${watcherId}`);
				} else if (operation === 'create' || operation === 'update') {
					const filter = this.getNodeParameter('filter', i) as any;
					const body = {
						keyword: this.getNodeParameter('keyword', i) as string,
						criteria: this.getNodeParameter('criteria', i) as string,
						excludes: splitIds(this.getNodeParameter('excludes', i) as string),
						filter: {
							mode: filter.mode || '',
							type: filter.type || '',
							username: filter.username || '',
							isIncludeReplies: Boolean(filter.isIncludeReplies),
						},
						accountId: this.getNodeParameter('accountId', i) as string,
						reply: buildReply({
							replyType: this.getNodeParameter('replyType', i, 'none') as string,
							replyText: this.getNodeParameter('replyText', i, '') as string,
							replyPrompt: this.getNodeParameter('replyPrompt', i, '') as string,
							knowledgeIds: this.getNodeParameter('knowledgeIds', i, '') as string,
							approval: this.getNodeParameter('approval', i, '') as string,
						}),
					};

					if (operation === 'create') {
						responseData = await replizApiRequest.call(this, 'POST', '/public/watcher', body);
					} else {
						await replizApiRequest.call(this, 'PUT', `/public/watcher/${watcherId}`, body);
						responseData = { success: true, watcherId };
					}
				} else if (operation === 'updateStatus') {
					const status = this.getNodeParameter('status', i) as string;
					await replizApiRequest.call(this, 'PUT', `/public/watcher/${watcherId}/status`, { status });
					responseData = { success: true, watcherId, status };
				} else if (operation === 'delete') {
					await replizApiRequest.call(this, 'DELETE', `/public/watcher/${watcherId}`);
					responseData = { success: true, watcherId };
				} else if (operation === 'getPosts') {
					const returnAll = this.getNodeParameter('returnAll', i) as boolean;
					const filters = this.getNodeParameter('postFilters', i) as any;
					const qs: any = {};
					if (filters.status) qs.status = filters.status;
					const endpoint = `/public/watcher/${watcherId}/match`;

					if (returnAll) {
						responseData = await replizApiRequestAllItems.call(this, 'GET', endpoint, {}, qs);
					} else {
						const limit = this.getNodeParameter('limit', i) as number;
						responseData = await replizApiRequest.call(this, 'GET', endpoint, {}, { ...qs, page: 1, limit });
					}
				} else if (operation === 'updateDraft') {
					const text = this.getNodeParameter('text', i) as string;
					await replizApiRequest.call(this, 'PUT', `/public/watcher/${watcherId}/match/${matchId}`, { text });
					responseData = { success: true, watcherId, matchId };
				} else if (operation === 'sendReply') {
					const text = this.getNodeParameter('sendText', i) as string;
					responseData = await replizApiRequest.call(
						this,
						'POST',
						`/public/watcher/${watcherId}/match/${matchId}/send`,
						text ? { text } : {},
					);
				} else if (operation === 'skipPost') {
					await replizApiRequest.call(this, 'POST', `/public/watcher/${watcherId}/match/${matchId}/skip`, {});
					responseData = { success: true, watcherId, matchId };
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

import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { replizApiRequest, replizApiRequestAllItems } from '../GenericFunctions';

export class ReplizCommentSync implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Repliz Comment Sync',
		name: 'replizCommentSync',
		icon: 'file:repliz.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Run the Repliz automation on the old and missed comments of a post (Gold+)',
		defaults: { name: 'Repliz Comment Sync' },
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
					{ name: 'Get All', value: 'getAll', description: 'Retrieve the active comment syncs', action: 'Get all comment syncs' },
					{ name: 'Create', value: 'create', description: 'Start syncing the old and missed comments of a post', action: 'Create a comment sync' },
					{ name: 'Update Status', value: 'updateStatus', description: 'Pause or resume a comment sync', action: 'Update a comment sync status' },
					{ name: 'Delete', value: 'delete', description: 'Stop a comment sync', action: 'Delete a comment sync' },
				],
				default: 'getAll',
			},
			// Get All
			{ displayName: 'Return All', name: 'returnAll', type: 'boolean', displayOptions: { show: { operation: ['getAll'] } }, default: false, description: 'Whether to return all results or only up to a limit' },
			{ displayName: 'Limit', name: 'limit', type: 'number', displayOptions: { show: { operation: ['getAll'], returnAll: [false] } }, typeOptions: { minValue: 1, maxValue: 100 }, default: 20, description: 'Max number of results to return' },
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				displayOptions: { show: { operation: ['getAll'] } },
				options: [
					{ displayName: 'Account IDs', name: 'accountIds', type: 'string', default: '', placeholder: 'id1,id2', description: 'Comma-separated list of account IDs' },
					{ displayName: 'Search', name: 'search', type: 'string', default: '', description: 'Matches the title, caption or URL of the post' },
				],
			},
			// Create
			{
				displayName: 'Content ID',
				name: 'contentId',
				type: 'string',
				required: true,
				displayOptions: { show: { operation: ['create'] } },
				default: '',
				description:
					'The ID of the post on the platform, from Repliz Content. The automation runs on its old and missed top-level comments. A post has one comment sync.',
			},
			{
				displayName: 'Account ID',
				name: 'accountId',
				type: 'string',
				required: true,
				displayOptions: { show: { operation: ['create'] } },
				default: '',
				description: 'The connected account that published the post: Instagram, Facebook, Threads, TikTok, YouTube or LinkedIn',
			},
			// Update Status / Delete
			{ displayName: 'Listener ID', name: 'listenerId', type: 'string', required: true, displayOptions: { show: { operation: ['updateStatus', 'delete'] } }, default: '', description: 'The ID of the comment sync, the listenerId from Create or the _id from Get All' },
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				required: true,
				displayOptions: { show: { operation: ['updateStatus'] } },
				options: [
					{ name: 'Pause', value: 'paused', description: 'Stop checking the post and keep its progress' },
					{ name: 'Resume', value: 'active', description: 'Continue checking the post right away' },
				],
				default: 'paused',
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
					if (filters.search) qs.search = filters.search;
					if (filters.accountIds) qs.accountIds = filters.accountIds.split(',').map((s: string) => s.trim()).filter(Boolean);

					if (returnAll) {
						responseData = await replizApiRequestAllItems.call(this, 'GET', '/public/listener', {}, qs);
					} else {
						const limit = this.getNodeParameter('limit', i) as number;
						responseData = await replizApiRequest.call(this, 'GET', '/public/listener', {}, { ...qs, page: 1, limit });
					}
				} else if (operation === 'create') {
					const contentId = this.getNodeParameter('contentId', i) as string;
					const accountId = this.getNodeParameter('accountId', i) as string;
					responseData = await replizApiRequest.call(this, 'POST', '/public/listener', { contentId, accountId });
				} else if (operation === 'updateStatus') {
					const listenerId = this.getNodeParameter('listenerId', i) as string;
					const status = this.getNodeParameter('status', i) as string;
					await replizApiRequest.call(this, 'PUT', `/public/listener/${listenerId}/status`, { status });
					responseData = { success: true, listenerId, status };
				} else if (operation === 'delete') {
					const listenerId = this.getNodeParameter('listenerId', i) as string;
					await replizApiRequest.call(this, 'DELETE', `/public/listener/${listenerId}`);
					responseData = { success: true, listenerId };
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

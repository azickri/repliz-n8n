import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { replizApiRequest, replizApiRequestAllItems } from '../GenericFunctions';

export class ReplizComment implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Repliz Comment',
		name: 'replizComment',
		icon: 'file:repliz.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Manage and moderate comments collected in Repliz (Standard+)',
		defaults: { name: 'Repliz Comment' },
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
					{ name: 'Get All', value: 'getAll', description: 'Retrieve all stored comments', action: 'Get all comments' },
					{ name: 'Get', value: 'get', description: 'Retrieve detailed info of a specific comment', action: 'Get a comment' },
					{ name: 'Reply', value: 'reply', description: 'Send a reply to a stored comment on the original platform', action: 'Reply to comment' },
					{ name: 'Update Status', value: 'updateStatus', description: 'Update comment status (pending, resolved, ignored)', action: 'Update comment status' },
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
						displayName: 'Status',
						name: 'status',
						type: 'options',
						options: [
							{ name: 'Pending', value: 'pending' },
							{ name: 'Resolved', value: 'resolved' },
							{ name: 'Ignored', value: 'ignored' },
						],
						default: '',
						description: 'Filter by comment status',
					},
					{
						displayName: 'Account IDs',
						name: 'accountIds',
						type: 'string',
						default: '',
						placeholder: 'id1,id2,id3',
						description: 'Comma-separated list of account IDs to filter by',
					},
					{
						displayName: 'Search',
						name: 'search',
						type: 'string',
						default: '',
						description: 'Search comments by content text',
					},
				],
			},
			// Get / Reply / Update Status
			{
				displayName: 'Comment ID',
				name: 'commentId',
				type: 'string',
				required: true,
				displayOptions: { show: { operation: ['get', 'reply', 'updateStatus'] } },
				default: '',
				description: 'The unique identifier of the comment',
			},
			// Reply
			{
				displayName: 'Reply Text',
				name: 'text',
				type: 'string',
				required: true,
				typeOptions: { rows: 3 },
				displayOptions: { show: { operation: ['reply'] } },
				default: '',
				description: 'The text to send as a reply to the comment',
			},
			// Update Status
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				required: true,
				displayOptions: { show: { operation: ['updateStatus'] } },
				options: [
					{ name: 'Pending', value: 'pending' },
					{ name: 'Resolved', value: 'resolved' },
					{ name: 'Ignored', value: 'ignored' },
				],
				default: 'resolved',
				description: 'The new status to set for the comment',
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
					if (filters.status) qs.status = filters.status;
					if (filters.search) qs.search = filters.search;
					if (filters.accountIds) qs.accountIds = filters.accountIds.split(',').map((s: string) => s.trim()).filter(Boolean);

					if (returnAll) {
						responseData = await replizApiRequestAllItems.call(this, 'GET', '/public/comment', {}, qs);
					} else {
						const limit = this.getNodeParameter('limit', i) as number;
						const res = await replizApiRequest.call(this, 'GET', '/public/comment', {}, { ...qs, page: 1, limit });
						responseData = res.docs || [];
					}
				} else if (operation === 'get') {
					const commentId = this.getNodeParameter('commentId', i) as string;
					responseData = await replizApiRequest.call(this, 'GET', `/public/comment/${commentId}`);
				} else if (operation === 'reply') {
					const commentId = this.getNodeParameter('commentId', i) as string;
					const text = this.getNodeParameter('text', i) as string;
					responseData = await replizApiRequest.call(this, 'POST', `/public/comment/${commentId}`, { text });
				} else if (operation === 'updateStatus') {
					const commentId = this.getNodeParameter('commentId', i) as string;
					const status = this.getNodeParameter('status', i) as string;
					responseData = await replizApiRequest.call(this, 'PUT', `/public/comment/${commentId}/status`, { status });
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

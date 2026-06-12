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
				],
			},
			// Get / Delete
			{
				displayName: 'Account ID',
				name: 'accountId',
				type: 'string',
				required: true,
				displayOptions: { show: { operation: ['get', 'delete'] } },
				default: '',
				description: 'The unique identifier of the account',
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

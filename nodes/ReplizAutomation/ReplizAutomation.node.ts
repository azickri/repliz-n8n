import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { replizApiRequest, replizApiRequestAllItems } from '../GenericFunctions';

export class ReplizAutomation implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Repliz Automation',
		name: 'replizAutomation',
		icon: 'file:repliz.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Create and manage content automation rules in Repliz (Gold+)',
		defaults: { name: 'Repliz Automation' },
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
					{ name: 'Get All', value: 'getAll', description: 'Retrieve all automations', action: 'Get all automations' },
					{ name: 'Create', value: 'create', description: 'Create a new content automation', action: 'Create an automation' },
					{ name: 'Get', value: 'get', description: 'Retrieve detailed info of a specific automation', action: 'Get an automation' },
					{ name: 'Update', value: 'update', description: 'Update an existing automation configuration', action: 'Update an automation' },
					{ name: 'Delete', value: 'delete', description: 'Delete a content automation', action: 'Delete an automation' },
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
					{ displayName: 'Search', name: 'search', type: 'string', default: '', description: 'Search automations by content name' },
				],
			},
			// Get / Update / Delete
			{ displayName: 'Automation ID', name: 'automationId', type: 'string', required: true, displayOptions: { show: { operation: ['get', 'update', 'delete'] } }, default: '', description: 'The unique identifier of the automation' },
			// Create
			{ displayName: 'Content ID', name: 'contentId', type: 'string', required: true, displayOptions: { show: { operation: ['create'] } }, default: '', description: 'The unique identifier of the content item to automate' },
			{ displayName: 'Account ID', name: 'accountId', type: 'string', required: true, displayOptions: { show: { operation: ['create'] } }, default: '', description: 'The connected social account ID' },
			// Create / Update Config
			{
				displayName: 'Automation Config (JSON)',
				name: 'configJson',
				type: 'json',
				required: true,
				displayOptions: { show: { operation: ['create', 'update'] } },
				default: '{"delete":{},"reply":{},"like":{},"message":{},"story":{}}',
				description: 'Configuration rules object (delete, reply, like, message, story)',
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
						responseData = await replizApiRequestAllItems.call(this, 'GET', '/public/automation', {}, qs);
					} else {
						const limit = this.getNodeParameter('limit', i) as number;
						const res = await replizApiRequest.call(this, 'GET', '/public/automation', {}, { ...qs, page: 1, limit });
						responseData = res;
					}
				} else if (operation === 'create') {
					const contentId = this.getNodeParameter('contentId', i) as string;
					const accountId = this.getNodeParameter('accountId', i) as string;
					const configRaw = this.getNodeParameter('configJson', i);
					const config = typeof configRaw === 'string' ? JSON.parse(configRaw) : configRaw;
					responseData = await replizApiRequest.call(this, 'POST', '/public/automation', { contentId, accountId, config });
				} else if (operation === 'get') {
					const automationId = this.getNodeParameter('automationId', i) as string;
					responseData = await replizApiRequest.call(this, 'GET', `/public/automation/${automationId}`);
				} else if (operation === 'update') {
					const automationId = this.getNodeParameter('automationId', i) as string;
					const configRaw = this.getNodeParameter('configJson', i);
					const config = typeof configRaw === 'string' ? JSON.parse(configRaw) : configRaw;
					responseData = await replizApiRequest.call(this, 'PUT', `/public/automation/${automationId}`, { config });
				} else if (operation === 'delete') {
					const automationId = this.getNodeParameter('automationId', i) as string;
					responseData = await replizApiRequest.call(this, 'DELETE', `/public/automation/${automationId}`);
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

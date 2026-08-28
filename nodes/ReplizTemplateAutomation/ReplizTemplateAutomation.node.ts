import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { replizApiRequest, replizApiRequestAllItems } from '../GenericFunctions';

export class ReplizTemplateAutomation implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Repliz Template Automation',
		name: 'replizTemplateAutomation',
		icon: 'file:repliz.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Create and manage automation templates in Repliz (Gold+)',
		defaults: { name: 'Repliz Template Automation' },
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
					{ name: 'Get All', value: 'getAll', description: 'Retrieve all automation templates', action: 'Get all templates' },
					{ name: 'Create', value: 'create', description: 'Create a new automation template', action: 'Create a template' },
					{ name: 'Get', value: 'get', description: 'Retrieve detailed info of a specific automation template', action: 'Get a template' },
					{ name: 'Update', value: 'update', description: 'Update an existing automation template', action: 'Update a template' },
					{ name: 'Delete', value: 'delete', description: 'Delete an automation template', action: 'Delete a template' },
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
					{ displayName: 'Search', name: 'search', type: 'string', default: '', description: 'Search templates by name' },
				],
			},
			// Get / Update / Delete
			{ displayName: 'Template ID', name: 'templateId', type: 'string', required: true, displayOptions: { show: { operation: ['get', 'update', 'delete'] } }, default: '', description: 'The unique identifier of the automation template' },
			// Create / Update
			{ displayName: 'Name', name: 'name', type: 'string', required: true, displayOptions: { show: { operation: ['create', 'update'] } }, default: '', description: 'The name of the automation template' },
			// Create / Update Config
			{
				displayName: 'Template Config (JSON)',
				name: 'configJson',
				type: 'json',
				required: true,
				displayOptions: { show: { operation: ['create', 'update'] } },
				default: '{"delete":{},"reply":{},"like":{},"message":{},"story":{},"chat":{}}',
				description: 'Configuration rules object (delete, reply, like, message, story, chat)',
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

					if (returnAll) {
						responseData = await replizApiRequestAllItems.call(this, 'GET', '/public/template', {}, qs);
					} else {
						const limit = this.getNodeParameter('limit', i) as number;
						const res = await replizApiRequest.call(this, 'GET', '/public/template', {}, { ...qs, page: 1, limit });
						responseData = res;
					}
				} else if (operation === 'create') {
					const name = this.getNodeParameter('name', i) as string;
					const configRaw = this.getNodeParameter('configJson', i);
					const config = typeof configRaw === 'string' ? JSON.parse(configRaw) : configRaw;
					responseData = await replizApiRequest.call(this, 'POST', '/public/template', { name, config });
				} else if (operation === 'get') {
					const templateId = this.getNodeParameter('templateId', i) as string;
					responseData = await replizApiRequest.call(this, 'GET', `/public/template/${templateId}`);
				} else if (operation === 'update') {
					const templateId = this.getNodeParameter('templateId', i) as string;
					const name = this.getNodeParameter('name', i) as string;
					const configRaw = this.getNodeParameter('configJson', i);
					const config = typeof configRaw === 'string' ? JSON.parse(configRaw) : configRaw;
					responseData = await replizApiRequest.call(this, 'PUT', `/public/template/${templateId}`, { name, config });
				} else if (operation === 'delete') {
					const templateId = this.getNodeParameter('templateId', i) as string;
					responseData = await replizApiRequest.call(this, 'DELETE', `/public/template/${templateId}`);
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

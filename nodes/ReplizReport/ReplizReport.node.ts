import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { replizApiRequest, replizApiRequestAllItems } from '../GenericFunctions';

export class ReplizReport implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Repliz Report',
		name: 'replizReport',
		icon: 'file:repliz.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'View and manage background job execution reports in Repliz (Gold+)',
		defaults: { name: 'Repliz Report' },
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
					{ name: 'Get All', value: 'getAll', description: 'Retrieve background job reports', action: 'Get all reports' },
					{ name: 'Get', value: 'get', description: 'Retrieve details of a specific report', action: 'Get a report' },
					{ name: 'Retry', value: 'retry', description: 'Retry execution of a failed report', action: 'Retry a report' },
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
					{ displayName: 'Report Type', name: 'type', type: 'string', default: '', description: 'Filter by report job type' },
					{ displayName: 'Status', name: 'status', type: 'string', default: '', description: 'Filter by report execution status' },
					{ displayName: 'Account IDs', name: 'accountIds', type: 'string', default: '', placeholder: 'id1,id2', description: 'Comma-separated list of account IDs' },
					{ displayName: 'Search', name: 'search', type: 'string', default: '', description: 'Search term filter' },
				],
			},
			// Get / Retry
			{ displayName: 'Report ID', name: 'reportId', type: 'string', required: true, displayOptions: { show: { operation: ['get', 'retry'] } }, default: '', description: 'The unique identifier of the report' },
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
					if (filters.type) qs.type = filters.type;
					if (filters.status) qs.status = filters.status;
					if (filters.search) qs.search = filters.search;
					if (filters.accountIds) qs.accountIds = filters.accountIds.split(',').map((s: string) => s.trim()).filter(Boolean);

					if (returnAll) {
						responseData = await replizApiRequestAllItems.call(this, 'GET', '/public/report', {}, qs);
					} else {
						const limit = this.getNodeParameter('limit', i) as number;
						const res = await replizApiRequest.call(this, 'GET', '/public/report', {}, { ...qs, page: 1, limit });
						responseData = res;
					}
				} else if (operation === 'get') {
					const reportId = this.getNodeParameter('reportId', i) as string;
					responseData = await replizApiRequest.call(this, 'GET', `/public/report/${reportId}`);
				} else if (operation === 'retry') {
					const reportId = this.getNodeParameter('reportId', i) as string;
					responseData = await replizApiRequest.call(this, 'PUT', `/public/report/${reportId}/retry`);
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

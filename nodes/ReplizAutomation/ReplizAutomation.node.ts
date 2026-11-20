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
				description:
					'Configuration rules object (delete, reply, like, message, story). Keywords in message and story can answer with buttons: give a keyword.values item "type": "opening" and its own "opening" object, and send the "id" Repliz returns on it back unchanged when updating. Set opening.webUrl.isTrackLink to true to send the links of an opening as rplz.link short links and count their clicks. Set opening.webUrl.followUp { isActive, delay, text } to send one reminder with the same links when none was tapped after delay seconds (600, 1800, 3600, 10800, 21600, 43200 or 82800; needs isTrackLink; a DM to a commenter needs a first message with a button). Set opening.input { isActive, type: "email" or "phone", text, retryText, tag } to ask for an email or phone number after a button tap and before webUrl (needs postback or additional active): a valid answer is saved to the contact (plus tag), then webUrl is sent; after 3 invalid answers webUrl is sent anyway. See <a href="https://docs.repliz.com/api/guides/automation-config#link-reminder" target="_blank">Link Reminder</a>. See <a href="https://docs.repliz.com/api/guides/automation-config#keyword-with-buttons" target="_blank">Keyword with Buttons</a>. Every reply, message, chat, story and storyMention can also take "limit" { isActive, value, count } to answer the same person at most count times (1-100, default 1) per value seconds, counted from their first answer (value: 3600, 21600, 86400, 604800 or 2592000; per post for comments, per account for DMs), and "knowledgeIds", up to 5 IDs from Repliz Knowledge that the AI reads when type is "ai". Left out, the saved limit and knowledgeIds are kept. See <a href="https://docs.repliz.com/api/guides/automation-config#limit-and-knowledge" target="_blank">Limit and Knowledge</a>.',
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

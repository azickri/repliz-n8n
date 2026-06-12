import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { replizApiRequest, replizApiRequestAllItems } from '../GenericFunctions';

export class ReplizSchedule implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Repliz Schedule',
		name: 'replizSchedule',
		icon: 'file:repliz.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Create and manage scheduled social media posts in Repliz (Premium+)',
		defaults: { name: 'Repliz Schedule' },
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
					{ name: 'Get All', value: 'getAll', description: 'Retrieve all scheduled posts', action: 'Get all schedules' },
					{ name: 'Get', value: 'get', description: 'Retrieve detailed info of a specific schedule', action: 'Get a schedule' },
					{ name: 'Create', value: 'create', description: 'Create a new scheduled post', action: 'Create a schedule' },
					{ name: 'Update', value: 'update', description: 'Update an existing scheduled post', action: 'Update a schedule' },
					{ name: 'Delete', value: 'delete', description: 'Delete a single scheduled post', action: 'Delete a schedule' },
					{ name: 'Delete Many', value: 'deleteMany', description: 'Delete multiple scheduled posts at once', action: 'Delete many schedules' },
					{ name: 'Retry', value: 'retry', description: 'Retry a failed scheduled post', action: 'Retry a schedule' },
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
					{ displayName: 'Status', name: 'status', type: 'options', options: [{ name: 'Pending', value: 'pending' }, { name: 'Process', value: 'process' }, { name: 'Error', value: 'error' }, { name: 'Success', value: 'success' }], default: '', description: 'Filter by schedule status' },
					{ displayName: 'Account IDs', name: 'accountIds', type: 'string', default: '', placeholder: 'id1,id2,id3', description: 'Comma-separated list of account IDs' },
					{ displayName: 'From Date', name: 'fromDate', type: 'dateTime', default: '', description: 'Start date filter (ISO 8601 format)' },
					{ displayName: 'To Date', name: 'toDate', type: 'dateTime', default: '', description: 'End date filter (ISO 8601 format)' },
				],
			},
			// Get / Delete / Retry
			{ displayName: 'Schedule ID', name: 'scheduleId', type: 'string', required: true, displayOptions: { show: { operation: ['get', 'update', 'delete', 'retry'] } }, default: '', description: 'The unique identifier of the schedule' },
			// Delete Many
			{ displayName: 'Schedule IDs', name: 'scheduleIds', type: 'string', required: true, displayOptions: { show: { operation: ['deleteMany'] } }, default: '', placeholder: 'id1,id2,id3', description: 'Comma-separated list of schedule IDs to delete' },
			// Create
			{ displayName: 'Account ID', name: 'accountId', type: 'string', required: true, displayOptions: { show: { operation: ['create'] } }, default: '', description: 'The connected account ID to publish the post from' },
			{ displayName: 'Schedule At', name: 'scheduleAt', type: 'dateTime', required: true, displayOptions: { show: { operation: ['create', 'update'] } }, default: '', description: 'The date and time to publish the post (ISO 8601 format)' },
			{ displayName: 'Title', name: 'title', type: 'string', displayOptions: { show: { operation: ['create', 'update'] } }, default: '', description: 'Optional title for the post (used for videos)' },
			{ displayName: 'Description / Caption', name: 'description', type: 'string', typeOptions: { rows: 4 }, displayOptions: { show: { operation: ['create', 'update'] } }, default: '', description: 'The main caption or description of the post' },
			{ displayName: 'Topic', name: 'topic', type: 'string', displayOptions: { show: { operation: ['create', 'update'] } }, default: '', description: 'Optional topic or category tag for this post' },
			{
				displayName: 'Post Type',
				name: 'postType',
				type: 'options',
				required: true,
				displayOptions: { show: { operation: ['create', 'update'] } },
				options: [
					{ name: 'Text', value: 'text' },
					{ name: 'Image', value: 'image' },
					{ name: 'Video', value: 'video' },
					{ name: 'Reel', value: 'reel' },
					{ name: 'Album', value: 'album' },
					{ name: 'Link', value: 'link' },
					{ name: 'Story', value: 'story' },
				],
				default: 'text',
				description: 'The type of post to publish',
			},
			{ displayName: 'Template ID', name: 'templateId', type: 'string', displayOptions: { show: { operation: ['create', 'update'] } }, default: '', description: 'Optional automation template ID to attach to this post' },
			{
				displayName: 'Medias (JSON)',
				name: 'mediasJson',
				type: 'json',
				displayOptions: { show: { operation: ['create', 'update'] } },
				default: '[]',
				description: 'Array of media objects. Each item: { "type": "image"|"video", "url": "...", "thumbnail": "...", "alt": "..." }',
			},
			{
				displayName: 'Link Meta (JSON)',
				name: 'metaJson',
				type: 'json',
				displayOptions: { show: { operation: ['create', 'update'] } },
				default: '{"title":"","description":"","url":""}',
				description: 'Link preview metadata: { "title": "...", "description": "...", "url": "..." }',
			},
			{
				displayName: 'Additional Info (JSON)',
				name: 'additionalInfoJson',
				type: 'json',
				displayOptions: { show: { operation: ['create', 'update'] } },
				default: '{"isAiGenerated":false,"isDraft":false,"tags":[],"mentions":[],"collaborators":[],"products":[],"music":{},"link":""}',
				description: 'Extra metadata: tags, mentions, collaborators, music, products, link',
			},
			{
				displayName: 'Replies (JSON)',
				name: 'repliesJson',
				type: 'json',
				displayOptions: { show: { operation: ['create', 'update'] } },
				default: '[]',
				description: 'Array of auto-reply comment objects to post after publishing: [{ "type": "text", "description": "..." }]',
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
					if (filters.fromDate) qs.fromDate = filters.fromDate;
					if (filters.toDate) qs.toDate = filters.toDate;
					if (filters.accountIds) qs.accountIds = filters.accountIds.split(',').map((s: string) => s.trim()).filter(Boolean);

					if (returnAll) {
						responseData = await replizApiRequestAllItems.call(this, 'GET', '/public/schedule', {}, qs);
					} else {
						const limit = this.getNodeParameter('limit', i) as number;
						const res = await replizApiRequest.call(this, 'GET', '/public/schedule', {}, { ...qs, page: 1, limit });
						responseData = res
					}
				} else if (operation === 'get') {
					const scheduleId = this.getNodeParameter('scheduleId', i) as string;
					responseData = await replizApiRequest.call(this, 'GET', `/public/schedule/${scheduleId}`);
				} else if (operation === 'create' || operation === 'update') {
					const scheduleAt = this.getNodeParameter('scheduleAt', i) as string;
					const title = this.getNodeParameter('title', i) as string;
					const description = this.getNodeParameter('description', i) as string;
					const topic = this.getNodeParameter('topic', i) as string;
					const type = this.getNodeParameter('postType', i) as string;
					const templateId = this.getNodeParameter('templateId', i) as string;
					const mediasRaw = this.getNodeParameter('mediasJson', i);
					const metaRaw = this.getNodeParameter('metaJson', i);
					const additionalInfoRaw = this.getNodeParameter('additionalInfoJson', i);
					const repliesRaw = this.getNodeParameter('repliesJson', i);

					const medias = typeof mediasRaw === 'string' ? JSON.parse(mediasRaw) : mediasRaw;
					const meta = typeof metaRaw === 'string' ? JSON.parse(metaRaw) : metaRaw;
					const additionalInfo = typeof additionalInfoRaw === 'string' ? JSON.parse(additionalInfoRaw) : additionalInfoRaw;
					const replies = typeof repliesRaw === 'string' ? JSON.parse(repliesRaw) : repliesRaw;

					const body: any = { scheduleAt, title, description, topic, type, medias, meta, additionalInfo, replies };
					if (templateId) body.templateId = templateId;

					if (operation === 'create') {
						body.accountId = this.getNodeParameter('accountId', i) as string;
						responseData = await replizApiRequest.call(this, 'POST', '/public/schedule', body);
					} else {
						const scheduleId = this.getNodeParameter('scheduleId', i) as string;
						responseData = await replizApiRequest.call(this, 'PUT', `/public/schedule/${scheduleId}`, body);
					}
				} else if (operation === 'delete') {
					const scheduleId = this.getNodeParameter('scheduleId', i) as string;
					responseData = await replizApiRequest.call(this, 'DELETE', `/public/schedule/${scheduleId}`);
				} else if (operation === 'deleteMany') {
					const scheduleIds = (this.getNodeParameter('scheduleIds', i) as string).split(',').map((s: string) => s.trim()).filter(Boolean);
					responseData = await replizApiRequest.call(this, 'DELETE', '/public/schedule/mass', {}, { scheduleIds });
				} else if (operation === 'retry') {
					const scheduleId = this.getNodeParameter('scheduleId', i) as string;
					responseData = await replizApiRequest.call(this, 'PUT', `/public/schedule/${scheduleId}/retry`);
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

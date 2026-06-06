import { INodeProperties } from 'n8n-workflow';

export const scheduleOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: [
					'schedule',
				],
			},
		},
		options: [
			{
				name: 'Get Many',
				value: 'getMany',
				description: 'Retrieve a list of scheduled posts',
				action: 'Get many scheduled posts',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve detailed information of a specific schedule',
				action: 'Get a scheduled post',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new scheduled post',
				action: 'Create a scheduled post',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update an existing scheduled post',
				action: 'Update a scheduled post',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Remove a scheduled post',
				action: 'Delete a scheduled post',
			},
			{
				name: 'Delete Many',
				value: 'deleteMany',
				description: 'Delete multiple scheduled posts at once',
				action: 'Delete multiple scheduled posts',
			},
			{
				name: 'Retry',
				value: 'retry',
				description: 'Retry a failed scheduled post',
				action: 'Retry a failed scheduled post',
			},
		],
		default: 'getMany',
	},
];

export const scheduleFields: INodeProperties[] = [
	// ----------------------------------
	//         Get Many
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['getMany'],
			},
		},
		default: false,
		description: 'Whether to return all results or only up to a limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['getMany'],
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		default: 20,
		description: 'Max number of results to return',
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['getMany'],
			},
		},
		options: [
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'Pending', value: 'pending' },
					{ name: 'Process', value: 'process' },
					{ name: 'Error', value: 'error' },
					{ name: 'Success', value: 'success' },
				],
				default: 'pending',
				description: 'Filter schedules by execution status',
			},
			{
				displayName: 'Account IDs',
				name: 'accountIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list of account IDs to filter schedules',
			},
			{
				displayName: 'From Date',
				name: 'fromDate',
				type: 'dateTime',
				default: '',
				description: 'Retrieve schedules starting from this date-time',
			},
			{
				displayName: 'To Date',
				name: 'toDate',
				type: 'dateTime',
				default: '',
				description: 'Retrieve schedules up to this date-time',
			},
		],
	},

	// ----------------------------------
	//         Schedule ID
	// ----------------------------------
	{
		displayName: 'Schedule ID',
		name: 'scheduleId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: [
					'get',
					'update',
					'delete',
					'retry',
				],
			},
		},
		default: '',
		description: 'The unique identifier of the scheduled post',
	},

	// ----------------------------------
	//         Delete Many
	// ----------------------------------
	{
		displayName: 'Schedule IDs',
		name: 'scheduleIds',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['deleteMany'],
			},
		},
		default: '',
		placeholder: 'e.g. 680affa5ce12f2f72916f67e, 680affa5ce12f2f72916f67a',
		description: 'Comma-separated list of schedule IDs to delete',
	},

	// ----------------------------------
	//         Create / Update Properties
	// ----------------------------------
	{
		displayName: 'Account ID',
		name: 'accountId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'The unique identifier of the account to publish this schedule on',
	},
	{
		displayName: 'Schedule At',
		name: 'scheduleAt',
		type: 'dateTime',
		required: true,
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['create', 'update'],
			},
		},
		default: '',
		description: 'The date and time when the post should be published',
	},
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['create', 'update'],
			},
		},
		default: '',
		description: 'The title of the scheduled post',
	},
	{
		displayName: 'Description / Caption',
		name: 'description',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['create', 'update'],
			},
		},
		default: '',
		description: 'The description or caption of the post',
	},
	{
		displayName: 'Topic',
		name: 'topic',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['create', 'update'],
			},
		},
		default: '',
		description: 'The topic category of the post',
	},
	{
		displayName: 'Post Type',
		name: 'postType',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['create', 'update'],
			},
		},
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
		description: 'The format type of the post',
	},
	{
		displayName: 'Template ID',
		name: 'templateId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['create', 'update'],
			},
		},
		default: '',
		description: 'Optional template ID to apply to this schedule',
	},

	// Complex fields using JSON editor
	{
		displayName: 'Medias (JSON)',
		name: 'mediasJson',
		type: 'json',
		required: true,
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['create', 'update'],
			},
		},
		default: '[]',
		description: 'List of media files. Example: [{"type": 0, "url": "https://url.com/image.jpg", "alt": "alt text"}] (0 = image, 1 = video).',
	},
	{
		displayName: 'Meta (JSON)',
		name: 'metaJson',
		type: 'json',
		required: true,
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['create', 'update'],
			},
		},
		default: '{}',
		description: 'Metadata for link post. Example: {"title": "Title", "description": "desc", "url": "https://url.com"}.',
	},
	{
		displayName: 'Additional Info (JSON)',
		name: 'additionalInfoJson',
		type: 'json',
		required: true,
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['create', 'update'],
			},
		},
		default: '{}',
		description: 'Additional info (isAiGenerated, isDraft, tags, mentions, collaborators, music, products, link).',
	},
	{
		displayName: 'Replies (JSON)',
		name: 'repliesJson',
		type: 'json',
		required: true,
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['create', 'update'],
			},
		},
		default: '[]',
		description: 'Comments/replies to post automatically. Example: [{"title": "title", "description": "desc", "topic": "topic", "type": "text", "medias": []}].',
	},
];

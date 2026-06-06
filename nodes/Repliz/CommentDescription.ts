import { INodeProperties } from 'n8n-workflow';

export const commentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: [
					'comment',
				],
			},
		},
		options: [
			{
				name: 'Get Many',
				value: 'getMany',
				description: 'Retrieve a list of comments stored in the system',
				action: 'Get many comments',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve detailed information of a specific stored comment',
				action: 'Get a comment',
			},
			{
				name: 'Reply',
				value: 'reply',
				description: 'Send a reply to a stored comment',
				action: 'Reply to a comment',
			},
			{
				name: 'Update Status',
				value: 'updateStatus',
				description: 'Update the status of a stored comment',
				action: 'Update status of a comment',
			},
		],
		default: 'getMany',
	},
];

export const commentFields: INodeProperties[] = [
	// ----------------------------------
	//         Get Many
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['comment'],
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
				resource: ['comment'],
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
				resource: ['comment'],
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
					{ name: 'Resolved', value: 'resolved' },
					{ name: 'Ignored', value: 'ignored' },
				],
				default: 'pending',
				description: 'Filter comments by status',
			},
			{
				displayName: 'Account IDs',
				name: 'accountIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list of account IDs to filter comments',
			},
			{
				displayName: 'Search',
				name: 'search',
				type: 'string',
				default: '',
				description: 'Search term to filter comments by content',
			},
		],
	},

	// ----------------------------------
	//         Comment ID
	// ----------------------------------
	{
		displayName: 'Comment ID',
		name: 'commentId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['comment'],
				operation: [
					'get',
					'reply',
					'updateStatus',
				],
			},
		},
		default: '',
		description: 'The unique identifier of the comment',
	},

	// ----------------------------------
	//         Reply Parameters
	// ----------------------------------
	{
		displayName: 'Text',
		name: 'text',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['comment'],
				operation: [
					'reply',
				],
			},
		},
		default: '',
		description: 'The response message text to post',
	},

	// ----------------------------------
	//         Update Status Parameters
	// ----------------------------------
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['comment'],
				operation: [
					'updateStatus',
				],
			},
		},
		options: [
			{ name: 'Pending', value: 'pending' },
			{ name: 'Resolved', value: 'resolved' },
			{ name: 'Ignored', value: 'ignored' },
		],
		default: 'pending',
		description: 'The updated status of the comment',
	},
];

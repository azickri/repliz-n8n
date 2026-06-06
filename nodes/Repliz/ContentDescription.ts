import { INodeProperties } from 'n8n-workflow';

export const contentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: [
					'content',
				],
			},
		},
		options: [
			{
				name: 'Get Many',
				value: 'getMany',
				description: 'Retrieve a list of content published on connected platforms',
				action: 'Get many content items',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve detailed information of a specific content',
				action: 'Get a content item',
			},
			{
				name: 'Get Comments',
				value: 'getComments',
				description: 'Retrieve comments associated with a specific content',
				action: 'Get comments on content',
			},
			{
				name: 'Create Comment',
				value: 'createComment',
				description: 'Create/post a new comment or reply to an existing comment under a post',
				action: 'Create a comment on content',
			},
			{
				name: 'Get Statistics',
				value: 'getStatistics',
				description: 'Retrieve engagement statistics for a specific content',
				action: 'Get content statistics',
			},
			{
				name: 'Message Comment',
				value: 'messageComment',
				description: 'Send a direct message or button response to a comment on a post',
				action: 'Send direct message to a comment',
			},
			{
				name: 'Delete Comment',
				value: 'deleteComment',
				description: 'Remove a comment from a specific content on the platform',
				action: 'Delete a comment',
			},
		],
		default: 'getMany',
	},
];

export const contentFields: INodeProperties[] = [
	// ----------------------------------
	//         Account ID (Common query parameter)
	// ----------------------------------
	{
		displayName: 'Account ID',
		name: 'accountId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['content'],
				operation: [
					'getMany',
					'get',
					'getComments',
					'createComment',
					'getStatistics',
					'messageComment',
					'deleteComment',
				],
			},
		},
		default: '',
		description: 'The unique identifier of the connected account',
	},

	// ----------------------------------
	//         Content ID
	// ----------------------------------
	{
		displayName: 'Content ID',
		name: 'contentId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['content'],
				operation: [
					'get',
					'getComments',
					'createComment',
					'getStatistics',
					'messageComment',
					'deleteComment',
				],
			},
		},
		default: '',
		description: 'The unique identifier of the content/post',
	},

	// ----------------------------------
	//         Get Many Options
	// ----------------------------------
	{
		displayName: 'Type',
		name: 'contentType',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['content'],
				operation: ['getMany'],
			},
		},
		options: [
			{ name: 'Media', value: 'media' },
			{ name: 'Story', value: 'story' },
		],
		default: 'media',
		description: 'Filter content list by type (e.g. Media or Story)',
	},
	{
		displayName: 'Next Token',
		name: 'nextToken',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['content'],
				operation: ['getMany', 'getComments'],
			},
		},
		default: '',
		description: 'Cursor token for pagination to retrieve next batch of results',
	},

	// ----------------------------------
	//         Get Comments Options
	// ----------------------------------
	{
		displayName: 'Comment ID Filter',
		name: 'commentIdFilter',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['content'],
				operation: ['getComments'],
			},
		},
		default: '',
		description: 'Retrieve replies of a specific comment ID',
	},

	// ----------------------------------
	//         Create Comment Parameters
	// ----------------------------------
	{
		displayName: 'Text',
		name: 'text',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['content'],
				operation: ['createComment'],
			},
		},
		default: '',
		description: 'The text content of the comment to post',
	},
	{
		displayName: 'Reply to Comment ID',
		name: 'replyToCommentId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['content'],
				operation: ['createComment'],
			},
		},
		default: '',
		description: 'If replying to an existing comment, specify its unique comment ID',
	},

	// ----------------------------------
	//         Delete Comment Parameters
	// ----------------------------------
	{
		displayName: 'Comment ID',
		name: 'commentId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['content'],
				operation: ['deleteComment'],
			},
		},
		default: '',
		description: 'The unique identifier of the comment to delete',
	},

	// ----------------------------------
	//         Message Comment Parameters
	// ----------------------------------
	{
		displayName: 'Comment ID',
		name: 'targetCommentId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['content'],
				operation: ['messageComment'],
			},
		},
		default: '',
		description: 'The unique identifier of the comment to reply/message to',
	},
	{
		displayName: 'Message Type',
		name: 'messageType',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['content'],
				operation: ['messageComment'],
			},
		},
		options: [
			{ name: 'Text Only', value: 'text' },
			{ name: 'Button Message', value: 'button' },
		],
		default: 'text',
		description: 'The type of comment message to send',
	},
	{
		displayName: 'Text',
		name: 'messageText',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['content'],
				operation: ['messageComment'],
			},
		},
		default: '',
		description: 'The text message content',
	},
	{
		displayName: 'Button Image URL',
		name: 'buttonImageUrl',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['content'],
				operation: ['messageComment'],
				messageType: ['button'],
			},
		},
		default: '',
		description: 'Optional image URL for the button message',
	},
	{
		displayName: 'Buttons',
		name: 'buttons',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				resource: ['content'],
				operation: ['messageComment'],
				messageType: ['button'],
			},
		},
		placeholder: 'Add Button',
		default: {},
		options: [
			{
				name: 'buttonItems',
				displayName: 'Button Item',
				values: [
					{
						displayName: 'Type',
						name: 'type',
						type: 'options',
						options: [
							{ name: 'Web URL', value: 'web_url' },
						],
						default: 'web_url',
					},
					{
						displayName: 'Title',
						name: 'title',
						type: 'string',
						required: true,
						default: '',
						description: 'The display label of the button',
					},
					{
						displayName: 'URL',
						name: 'url',
						type: 'string',
						required: true,
						default: '',
						description: 'The link URL the button redirects to',
					},
				],
			},
		],
	},
];

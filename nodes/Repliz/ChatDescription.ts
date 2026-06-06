import { INodeProperties } from 'n8n-workflow';

export const chatOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: [
					'chat',
				],
			},
		},
		options: [
			{
				name: 'Get Many',
				value: 'getMany',
				description: 'Retrieve a list of chats associated with your account',
				action: 'Get many chats',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve detailed information of a specific chat',
				action: 'Get a chat',
			},
			{
				name: 'Get Messages',
				value: 'getMessages',
				description: 'Retrieve messages from a specific chat',
				action: 'Get messages in a chat',
			},
			{
				name: 'Send Message',
				value: 'sendMessage',
				description: 'Send a message to a specific chat',
				action: 'Send message in a chat',
			},
			{
				name: 'Mark Read',
				value: 'markRead',
				description: 'Mark a chat as read',
				action: 'Mark chat as read',
			},
		],
		default: 'getMany',
	},
];

export const chatFields: INodeProperties[] = [
	// ----------------------------------
	//         Get Many
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['chat'],
				operation: ['getMany', 'getMessages'],
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
				resource: ['chat'],
				operation: ['getMany', 'getMessages'],
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
				resource: ['chat'],
				operation: ['getMany'],
			},
		},
		options: [
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'Unread', value: 'unread' },
					{ name: 'Unreplied', value: 'unreplied' },
				],
				default: 'unread',
				description: 'Filter chats by status',
			},
			{
				displayName: 'Account IDs',
				name: 'accountIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list of account IDs to filter chats',
			},
			{
				displayName: 'Search',
				name: 'search',
				type: 'string',
				default: '',
				description: 'Search term to filter chats by participant name',
			},
		],
	},

	// ----------------------------------
	//         Chat ID
	// ----------------------------------
	{
		displayName: 'Chat ID',
		name: 'chatId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['chat'],
				operation: [
					'get',
					'getMessages',
					'sendMessage',
					'markRead',
				],
			},
		},
		default: '',
		description: 'The unique identifier of the chat',
	},

	// ----------------------------------
	//         Send Message Properties
	// ----------------------------------
	{
		displayName: 'Message Type',
		name: 'messageType',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['chat'],
				operation: ['sendMessage'],
			},
		},
		options: [
			{ name: 'Text', value: 'text' },
			{ name: 'Image', value: 'image' },
			{ name: 'Video', value: 'video' },
			{ name: 'Audio', value: 'audio' },
			{ name: 'Document', value: 'document' },
			{ name: 'Button', value: 'button' },
		],
		default: 'text',
		description: 'The type of message to send',
	},
	{
		displayName: 'Text',
		name: 'text',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['chat'],
				operation: ['sendMessage'],
				messageType: ['text', 'image', 'video', 'audio', 'document'],
			},
		},
		default: '',
		description: 'The text content of the message',
	},

	// Media properties (Image/Video/Audio/Document)
	{
		displayName: 'Media URL',
		name: 'mediaUrl',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['chat'],
				operation: ['sendMessage'],
				messageType: ['image', 'video', 'audio', 'document'],
			},
		},
		default: '',
		description: 'The URL of the media file',
	},
	{
		displayName: 'Mime Type',
		name: 'mimeType',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['chat'],
				operation: ['sendMessage'],
				messageType: ['image', 'video', 'audio', 'document'],
			},
		},
		placeholder: 'e.g. image/jpeg, video/mp4, audio/mp3, application/pdf',
		default: '',
		description: 'The mimetype of the media file',
	},
	{
		displayName: 'Thumbnail URL',
		name: 'thumbnailUrl',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['chat'],
				operation: ['sendMessage'],
				messageType: ['image', 'video'],
			},
		},
		default: '',
		description: 'The URL of the thumbnail image',
	},
	{
		displayName: 'Duration (seconds)',
		name: 'duration',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['chat'],
				operation: ['sendMessage'],
				messageType: ['video', 'audio'],
			},
		},
		default: 0,
		description: 'The duration of the video or audio in seconds',
	},
	{
		displayName: 'Document Name',
		name: 'documentName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['chat'],
				operation: ['sendMessage'],
				messageType: ['document'],
			},
		},
		default: '',
		description: 'The filename of the document',
	},
	{
		displayName: 'Document Size (bytes)',
		name: 'documentSize',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['chat'],
				operation: ['sendMessage'],
				messageType: ['document'],
			},
		},
		default: 0,
		description: 'The size of the document in bytes',
	},

	// Button properties
	{
		displayName: 'Button Text',
		name: 'buttonText',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['chat'],
				operation: ['sendMessage'],
				messageType: ['button'],
			},
		},
		default: '',
		description: 'The main text that goes along with the button',
	},
	{
		displayName: 'Button Image URL',
		name: 'buttonImageUrl',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['chat'],
				operation: ['sendMessage'],
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
				resource: ['chat'],
				operation: ['sendMessage'],
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

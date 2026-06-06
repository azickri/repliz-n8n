import { INodeProperties } from 'n8n-workflow';

export const accountOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: [
					'account',
				],
			},
		},
		options: [
			{
				name: 'Get Many',
				value: 'getMany',
				description: 'Retrieve a list of accounts associated with your workspace',
				action: 'Get many accounts',
			},
			{
				name: 'Get Statistics',
				value: 'count',
				description: 'Retrieve account usage statistics across all connected platforms',
				action: 'Get account statistics',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve detailed information for a specific account',
				action: 'Get an account',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Remove a connected account from the system',
				action: 'Delete an account',
			},
			// Facebook
			{
				name: 'Facebook Authorize',
				value: 'facebookAuthorize',
				description: 'Initiate Facebook authorization process',
				action: 'Facebook authorize',
			},
			{
				name: 'Facebook Get Pages',
				value: 'facebookPage',
				description: 'Retrieve Facebook pages associated with the authorized account',
				action: 'Facebook get pages',
			},
			{
				name: 'Facebook Exchange Code',
				value: 'facebookExchange',
				description: 'Exchange authorization code for an access token',
				action: 'Facebook exchange code',
			},
			{
				name: 'Facebook Connect',
				value: 'facebookConnect',
				description: 'Connect a Facebook page to the system',
				action: 'Facebook connect',
			},
			{
				name: 'Facebook Reconnect',
				value: 'facebookReconnect',
				description: 'Reconnect an existing Facebook account',
				action: 'Facebook reconnect',
			},
			// Instagram
			{
				name: 'Instagram Authorize',
				value: 'instagramAuthorize',
				description: 'Initiate Instagram authorization process',
				action: 'Instagram authorize',
			},
			{
				name: 'Instagram Connect',
				value: 'instagramConnect',
				description: 'Connect an Instagram account to the system',
				action: 'Instagram connect',
			},
			{
				name: 'Instagram Reconnect',
				value: 'instagramReconnect',
				description: 'Reconnect an existing Instagram account',
				action: 'Instagram reconnect',
			},
			// Threads
			{
				name: 'Threads Authorize',
				value: 'threadsAuthorize',
				description: 'Initiate Threads authorization process',
				action: 'Threads authorize',
			},
			{
				name: 'Threads Connect',
				value: 'threadsConnect',
				description: 'Connect a Threads account to the system',
				action: 'Threads connect',
			},
			{
				name: 'Threads Reconnect',
				value: 'threadsReconnect',
				description: 'Reconnect an existing Threads account',
				action: 'Threads reconnect',
			},
			// YouTube
			{
				name: 'YouTube Authorize',
				value: 'youtubeAuthorize',
				description: 'Initiate YouTube authorization process',
				action: 'YouTube authorize',
			},
			{
				name: 'YouTube Get Channels',
				value: 'youtubeChannel',
				description: 'Retrieve YouTube channels associated with the authorized account',
				action: 'YouTube get channels',
			},
			{
				name: 'YouTube Exchange Code',
				value: 'youtubeExchange',
				description: 'Exchange authorization code for an access token',
				action: 'YouTube exchange code',
			},
			{
				name: 'YouTube Connect',
				value: 'youtubeConnect',
				description: 'Connect a YouTube channel to the system',
				action: 'YouTube connect',
			},
			{
				name: 'YouTube Reconnect',
				value: 'youtubeReconnect',
				description: 'Reconnect an existing YouTube account',
				action: 'YouTube reconnect',
			},
			// LinkedIn
			{
				name: 'LinkedIn Authorize',
				value: 'linkedinAuthorize',
				description: 'Initiate LinkedIn authorization process',
				action: 'LinkedIn authorize',
			},
			{
				name: 'LinkedIn Get Organizations',
				value: 'linkedinOrganization',
				description: 'Retrieve LinkedIn organizations associated with the authorized account',
				action: 'LinkedIn get organizations',
			},
			{
				name: 'LinkedIn Exchange Code',
				value: 'linkedinExchange',
				description: 'Exchange authorization code for an access token',
				action: 'LinkedIn exchange code',
			},
			{
				name: 'LinkedIn Connect',
				value: 'linkedinConnect',
				description: 'Connect a LinkedIn organization to the system',
				action: 'LinkedIn connect',
			},
			{
				name: 'LinkedIn Reconnect',
				value: 'linkedinReconnect',
				description: 'Reconnect an existing LinkedIn account',
				action: 'LinkedIn reconnect',
			},
			// TikTok
			{
				name: 'TikTok Authorize',
				value: 'tiktokAuthorize',
				description: 'Initiate TikTok authorization process',
				action: 'TikTok authorize',
			},
			{
				name: 'TikTok Connect',
				value: 'tiktokConnect',
				description: 'Connect a TikTok account to the system',
				action: 'TikTok connect',
			},
			{
				name: 'TikTok Reconnect',
				value: 'tiktokReconnect',
				description: 'Reconnect an existing TikTok account',
				action: 'TikTok reconnect',
			},
			// Shopee
			{
				name: 'Shopee Authorize',
				value: 'shopeeAuthorize',
				description: 'Initiate Shopee authorization process',
				action: 'Shopee authorize',
			},
			{
				name: 'Shopee Connect',
				value: 'shopeeConnect',
				description: 'Connect a Shopee account to the system',
				action: 'Shopee connect',
			},
			{
				name: 'Shopee Reconnect',
				value: 'shopeeReconnect',
				description: 'Reconnect an existing Shopee account',
				action: 'Shopee reconnect',
			},
		],
		default: 'getMany',
	},
];

export const accountFields: INodeProperties[] = [
	// ----------------------------------
	//         Get Many
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['account'],
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
				resource: ['account'],
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
				resource: ['account'],
				operation: ['getMany'],
			},
		},
		options: [
			{
				displayName: 'Type',
				name: 'type',
				type: 'options',
				options: [
					{ name: 'Facebook', value: 'facebook' },
					{ name: 'Instagram', value: 'instagram' },
					{ name: 'LinkedIn', value: 'linkedin' },
					{ name: 'Threads', value: 'threads' },
					{ name: 'TikTok', value: 'tiktok' },
					{ name: 'YouTube', value: 'youtube' },
				],
				default: 'facebook',
				description: 'Filter accounts by social platform type',
			},
			{
				displayName: 'Search',
				name: 'search',
				type: 'string',
				default: '',
				description: 'Search term to filter accounts by username or name',
			},
		],
	},

	// ----------------------------------
	//         Get / Delete / Reconnect
	// ----------------------------------
	{
		displayName: 'Account ID',
		name: 'accountId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['account'],
				operation: [
					'get',
					'delete',
					'facebookReconnect',
					'instagramReconnect',
					'threadsReconnect',
					'youtubeReconnect',
					'linkedinReconnect',
					'tiktokReconnect',
					'shopeeReconnect',
				],
			},
		},
		default: '',
		description: 'The unique identifier of the account',
	},

	// ----------------------------------
	//         Authorize Parameters
	// ----------------------------------
	{
		displayName: 'Redirect URL',
		name: 'redirect',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['account'],
				operation: [
					'facebookAuthorize',
					'instagramAuthorize',
					'threadsAuthorize',
					'youtubeAuthorize',
					'linkedinAuthorize',
					'tiktokAuthorize',
					'shopeeAuthorize',
				],
			},
		},
		default: '',
		description: 'The URL to redirect to after successful authorization',
	},

	// ----------------------------------
	//         Get Pages / Exchange / Connect / Reconnect Parameters
	// ----------------------------------
	{
		displayName: 'Token',
		name: 'token',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['account'],
				operation: [
					'facebookPage',
					'facebookConnect',
					'facebookReconnect',
					'youtubeConnect',
					'youtubeReconnect',
					'linkedinConnect',
					'linkedinReconnect',
				],
			},
		},
		default: '',
		description: 'The token obtained from authorization/exchange',
	},
	{
		displayName: 'Code',
		name: 'code',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['account'],
				operation: [
					'facebookExchange',
					'instagramConnect',
					'instagramReconnect',
					'threadsConnect',
					'threadsReconnect',
					'youtubeExchange',
					'linkedinExchange',
					'tiktokConnect',
					'tiktokReconnect',
					'shopeeConnect',
					'shopeeReconnect',
				],
			},
		},
		default: '',
		description: 'The authorization code',
	},
	{
		displayName: 'Page ID',
		name: 'pageId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['account'],
				operation: [
					'facebookConnect',
					'facebookReconnect',
				],
			},
		},
		default: '',
		description: 'The Facebook page ID to connect',
	},
	{
		displayName: 'Channel ID',
		name: 'channelId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['account'],
				operation: [
					'youtubeConnect',
					'youtubeReconnect',
				],
			},
		},
		default: '',
		description: 'The YouTube channel ID to connect',
	},
	{
		displayName: 'Organization ID',
		name: 'organizationId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['account'],
				operation: [
					'linkedinConnect',
					'linkedinReconnect',
				],
			},
		},
		default: '',
		description: 'The LinkedIn organization URN ID to connect',
	},
];

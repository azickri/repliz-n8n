import { INodeProperties } from 'n8n-workflow';

export const tiktokOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: [
					'tiktok',
				],
			},
		},
		options: [
			{
				name: 'Get Trending Music',
				value: 'getTrendingMusic',
				description: 'Retrieve trending or popular audio tracks from TikTok',
				action: 'Get TikTok trending music',
			},
		],
		default: 'getTrendingMusic',
	},
];

export const tiktokFields: INodeProperties[] = [
	// ----------------------------------
	//         Get Trending Music Parameters
	// ----------------------------------
	{
		displayName: 'Genre',
		name: 'genre',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['tiktok'],
				operation: ['getTrendingMusic'],
			},
		},
		default: 'ALL',
		placeholder: 'e.g. ALL, POP, ROCK, HIP_HOP/RAP, EDM',
		description: 'The music genre to filter trending tracks',
	},
	{
		displayName: 'Country Code',
		name: 'countryCode',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['tiktok'],
				operation: ['getTrendingMusic'],
			},
		},
		default: 'ID',
		placeholder: 'e.g. ID, US, SG, GB',
		description: 'The two-letter ISO country code to filter trending tracks',
	},
];

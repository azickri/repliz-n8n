import { INodeProperties } from 'n8n-workflow';

export const linkOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: [
					'link',
				],
			},
		},
		options: [
			{
				name: 'Get Metadata',
				value: 'getMetadata',
				description: 'Extract metadata information (title, description, thumbnail) from a target URL',
				action: 'Get metadata from link',
			},
		],
		default: 'getMetadata',
	},
];

export const linkFields: INodeProperties[] = [
	// ----------------------------------
	//         Get Metadata Parameters
	// ----------------------------------
	{
		displayName: 'URL',
		name: 'url',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['link'],
				operation: ['getMetadata'],
			},
		},
		default: '',
		placeholder: 'https://repliz.com',
		description: 'The target URL to extract metadata from',
	},
];

import { INodeProperties } from 'n8n-workflow';

export const shopeeOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: [
					'shopee',
				],
			},
		},
		options: [
			{
				name: 'Get Products',
				value: 'getProducts',
				description: 'Retrieve a list of products associated with your connected Shopee account',
				action: 'Get Shopee products',
			},
		],
		default: 'getProducts',
	},
];

export const shopeeFields: INodeProperties[] = [
	// ----------------------------------
	//         Get Products Parameters
	// ----------------------------------
	{
		displayName: 'Account ID',
		name: 'accountId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['shopee'],
				operation: ['getProducts'],
			},
		},
		default: '',
		description: 'The unique identifier of the connected Shopee account',
	},
	{
		displayName: 'Next Token',
		name: 'nextToken',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['shopee'],
				operation: ['getProducts'],
			},
		},
		default: '',
		description: 'Cursor token for pagination to retrieve the next batch of products',
	},
];

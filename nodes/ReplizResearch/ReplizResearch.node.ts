import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { replizApiRequest } from '../GenericFunctions';

export class ReplizResearch implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Repliz Research',
		name: 'replizResearch',
		icon: 'file:repliz.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Research and discover content and users from social media platforms via Repliz (Gold+)',
		defaults: { name: 'Repliz Research' },
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
					{
						name: 'Search Threads Content by Keyword',
						value: 'searchThreadsContent',
						description: 'Search Threads posts by a keyword or hashtag',
						action: 'Search Threads content by keyword',
					},
					{
						name: 'Search Threads Content by User',
						value: 'searchThreadsContentByUser',
						description: "Retrieve all posts from a specific Threads user's profile",
						action: "Search Threads content by user's profile",
					},
					{
						name: 'Search Threads User',
						value: 'searchThreadsUser',
						description: 'Look up a Threads user profile by username',
						action: 'Search Threads user profile',
					},
				],
				default: 'searchThreadsContent',
			},
			// Shared: Account ID
			{
				displayName: 'Account ID',
				name: 'accountId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['searchThreadsContent', 'searchThreadsContentByUser', 'searchThreadsUser'],
					},
				},
				default: '',
				description: 'The ID of your connected Threads account used to perform the research',
			},
			// Search Threads Content by Keyword
			{
				displayName: 'Search Keyword',
				name: 'search',
				type: 'string',
				required: true,
				displayOptions: { show: { operation: ['searchThreadsContent'] } },
				default: '',
				placeholder: 'e.g. digital marketing',
				description: 'The keyword or hashtag to search for in Threads posts',
			},
			{
				displayName: 'Next Token',
				name: 'nextToken',
				type: 'string',
				displayOptions: { show: { operation: ['searchThreadsContent'] } },
				default: '',
				description: 'Pagination cursor token from a previous response to fetch the next page of results',
			},
			// Search Threads Content by User / Search Threads User
			{
				displayName: 'Username',
				name: 'username',
				type: 'string',
				required: true,
				displayOptions: { show: { operation: ['searchThreadsContentByUser', 'searchThreadsUser'] } },
				default: '',
				placeholder: 'e.g. meta',
				description: "The Threads username to look up (without the '@' prefix)",
			},
			{
				displayName: 'Next Token',
				name: 'nextToken',
				type: 'string',
				displayOptions: { show: { operation: ['searchThreadsContentByUser'] } },
				default: '',
				description: 'Pagination cursor token from a previous response to fetch the next page of results',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;
				const accountId = this.getNodeParameter('accountId', i) as string;
				let responseData: any;

				if (operation === 'searchThreadsContent') {
					const search = this.getNodeParameter('search', i) as string;
					const nextToken = this.getNodeParameter('nextToken', i) as string;
					const qs: any = { accountId, search };
					if (nextToken) qs.nextToken = nextToken;
					responseData = await replizApiRequest.call(this, 'GET', '/public/research/threads/content/search', {}, qs);
				} else if (operation === 'searchThreadsContentByUser') {
					const username = this.getNodeParameter('username', i) as string;
					const nextToken = this.getNodeParameter('nextToken', i) as string;
					const qs: any = { accountId, username };
					if (nextToken) qs.nextToken = nextToken;
					responseData = await replizApiRequest.call(this, 'GET', '/public/research/threads/content/user', {}, qs);
				} else if (operation === 'searchThreadsUser') {
					const username = this.getNodeParameter('username', i) as string;
					responseData = await replizApiRequest.call(this, 'GET', '/public/research/threads/user', {}, { accountId, username });
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

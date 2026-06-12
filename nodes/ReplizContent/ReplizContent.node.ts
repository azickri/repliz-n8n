import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { replizApiRequest } from '../GenericFunctions';

export class ReplizContent implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Repliz Content',
		name: 'replizContent',
		icon: 'file:repliz.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Retrieve and interact with published social media content (Gold+)',
		defaults: { name: 'Repliz Content' },
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
					{ name: 'Get All', value: 'getAll', description: 'Retrieve all published content from an account', action: 'Get all content' },
					{ name: 'Get', value: 'get', description: 'Retrieve detailed info of a specific content', action: 'Get content' },
					{ name: 'Get Comments', value: 'getComments', description: 'Retrieve all comments on a content post', action: 'Get content comments' },
					{ name: 'Create Comment', value: 'createComment', description: 'Post a comment on a content item', action: 'Create content comment' },
					{ name: 'Delete Comment', value: 'deleteComment', description: 'Delete a comment from a content item', action: 'Delete content comment' },
					{ name: 'Get Statistics', value: 'getStatistics', description: 'Retrieve engagement statistics for a content item', action: 'Get content statistics' },
					{ name: 'Message Comment Author', value: 'messageComment', description: 'Send a direct message to a comment author', action: 'Message comment author' },
				],
				default: 'getAll',
			},
			// Shared account + content IDs
			{ displayName: 'Account ID', name: 'accountId', type: 'string', required: true, displayOptions: { show: { operation: ['getAll', 'get', 'getComments', 'createComment', 'deleteComment', 'getStatistics', 'messageComment'] } }, default: '', description: 'The ID of the connected account to fetch content from' },
			{ displayName: 'Content ID', name: 'contentId', type: 'string', required: true, displayOptions: { show: { operation: ['get', 'getComments', 'createComment', 'deleteComment', 'getStatistics', 'messageComment'] } }, default: '', description: 'The unique identifier of the content item' },
			// Get All
			{ displayName: 'Content Type', name: 'contentType', type: 'string', displayOptions: { show: { operation: ['getAll'] } }, default: '', placeholder: 'e.g. video, image', description: 'Filter content by type (optional)' },
			{ displayName: 'Next Token', name: 'nextToken', type: 'string', displayOptions: { show: { operation: ['getAll', 'getComments'] } }, default: '', description: 'Pagination cursor token from previous response' },
			// Get Comments
			{ displayName: 'Comment ID Filter', name: 'commentIdFilter', type: 'string', displayOptions: { show: { operation: ['getComments'] } }, default: '', description: 'Filter comments by a specific comment ID (optional)' },
			// Create Comment
			{ displayName: 'Text', name: 'text', type: 'string', required: true, typeOptions: { rows: 3 }, displayOptions: { show: { operation: ['createComment'] } }, default: '', description: 'The text of the comment to post' },
			{ displayName: 'Reply To Comment ID', name: 'replyToCommentId', type: 'string', displayOptions: { show: { operation: ['createComment'] } }, default: '', description: 'Optional: ID of the comment to reply to' },
			// Delete Comment
			{ displayName: 'Comment ID', name: 'commentId', type: 'string', required: true, displayOptions: { show: { operation: ['deleteComment'] } }, default: '', description: 'The unique identifier of the comment to delete' },
			// Message Comment Author
			{ displayName: 'Target Comment ID', name: 'targetCommentId', type: 'string', required: true, displayOptions: { show: { operation: ['messageComment'] } }, default: '', description: 'ID of the comment whose author will receive the DM' },
			{
				displayName: 'Message Type',
				name: 'messageType',
				type: 'options',
				required: true,
				displayOptions: { show: { operation: ['messageComment'] } },
				options: [{ name: 'Text', value: 'text' }, { name: 'Button', value: 'button' }],
				default: 'text',
				description: 'Type of the direct message to send',
			},
			{ displayName: 'Message Text', name: 'messageText', type: 'string', typeOptions: { rows: 3 }, displayOptions: { show: { operation: ['messageComment'] } }, default: '', description: 'Text content of the direct message' },
			{ displayName: 'Button Image URL', name: 'buttonImageUrl', type: 'string', displayOptions: { show: { operation: ['messageComment'], messageType: ['button'] } }, default: '', description: 'Optional image URL shown above the buttons' },
			{
				displayName: 'Buttons',
				name: 'buttons',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				displayOptions: { show: { operation: ['messageComment'], messageType: ['button'] } },
				default: {},
				options: [{
					displayName: 'Button Item',
					name: 'buttonItems',
					values: [
						{ displayName: 'Type', name: 'type', type: 'options', options: [{ name: 'Web URL', value: 'web_url' }, { name: 'Postback', value: 'postback' }], default: 'web_url' },
						{ displayName: 'Title', name: 'title', type: 'string', default: '' },
						{ displayName: 'URL', name: 'url', type: 'string', default: '' },
					],
				}],
				description: 'Buttons to include in the message',
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

				if (operation === 'getAll') {
					const contentType = this.getNodeParameter('contentType', i) as string;
					const nextToken = this.getNodeParameter('nextToken', i) as string;
					const qs: any = { accountId };
					if (contentType) qs.type = contentType;
					if (nextToken) qs.nextToken = nextToken;
					responseData = await replizApiRequest.call(this, 'GET', '/public/content', {}, qs);
				} else if (operation === 'get') {
					const contentId = this.getNodeParameter('contentId', i) as string;
					responseData = await replizApiRequest.call(this, 'GET', `/public/content/${contentId}`, {}, { accountId });
				} else if (operation === 'getComments') {
					const contentId = this.getNodeParameter('contentId', i) as string;
					const nextToken = this.getNodeParameter('nextToken', i) as string;
					const commentIdFilter = this.getNodeParameter('commentIdFilter', i) as string;
					const qs: any = { accountId };
					if (nextToken) qs.nextToken = nextToken;
					if (commentIdFilter) qs.commentId = commentIdFilter;
					responseData = await replizApiRequest.call(this, 'GET', `/public/content/${contentId}/comment`, {}, qs);
				} else if (operation === 'createComment') {
					const contentId = this.getNodeParameter('contentId', i) as string;
					const text = this.getNodeParameter('text', i) as string;
					const replyToCommentId = this.getNodeParameter('replyToCommentId', i) as string;
					const body: any = { accountId, text };
					if (replyToCommentId) body.commentId = replyToCommentId;
					responseData = await replizApiRequest.call(this, 'POST', `/public/content/${contentId}/comment`, body);
				} else if (operation === 'deleteComment') {
					const contentId = this.getNodeParameter('contentId', i) as string;
					const commentId = this.getNodeParameter('commentId', i) as string;
					responseData = await replizApiRequest.call(this, 'DELETE', `/public/content/${contentId}/comment/${commentId}`, {}, { accountId });
				} else if (operation === 'getStatistics') {
					const contentId = this.getNodeParameter('contentId', i) as string;
					responseData = await replizApiRequest.call(this, 'GET', `/public/content/${contentId}/statistic`, {}, { accountId });
				} else if (operation === 'messageComment') {
					const contentId = this.getNodeParameter('contentId', i) as string;
					const targetCommentId = this.getNodeParameter('targetCommentId', i) as string;
					const messageType = this.getNodeParameter('messageType', i) as string;
					const body: any = { accountId, commentId: targetCommentId };
					if (messageType === 'text') {
						body.text = this.getNodeParameter('messageText', i) as string;
					} else if (messageType === 'button') {
						const btnObj: any = { text: this.getNodeParameter('messageText', i) as string };
						const img = this.getNodeParameter('buttonImageUrl', i) as string;
						if (img) btnObj.image = img;
						const buttonsData = this.getNodeParameter('buttons.buttonItems', i, []) as any[];
						btnObj.buttons = buttonsData.map((btn: any) => ({ type: btn.type, title: btn.title, url: btn.url }));
						body.button = btnObj;
					}
					responseData = await replizApiRequest.call(this, 'POST', `/public/content/${contentId}/message`, body);
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

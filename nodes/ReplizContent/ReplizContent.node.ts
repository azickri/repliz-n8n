import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { replizApiRequest, replizButtons, replizCarousel, replizQuickReply } from '../GenericFunctions';

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
					{ name: 'Delete', value: 'delete', description: 'Remove a published content item', action: 'Delete content' },
					{ name: 'Get Comments', value: 'getComments', description: 'Retrieve all comments on a content post', action: 'Get content comments' },
					{ name: 'Create Comment', value: 'createComment', description: 'Post a comment on a content item', action: 'Create content comment' },
					{ name: 'Delete Comment', value: 'deleteComment', description: 'Delete a comment from a content item', action: 'Delete content comment' },
					{ name: 'Like Comment', value: 'likeComment', description: 'Add a like to a specific comment on a content item', action: 'Like a comment' },
					{ name: 'Get Statistics', value: 'getStatistics', description: 'Retrieve engagement statistics for a content item', action: 'Get content statistics' },
					{ name: 'Message Comment Author', value: 'messageComment', description: 'Send a direct message to a comment author', action: 'Message comment author' },
				],
				default: 'getAll',
			},
			// Shared account + content IDs
			{ displayName: 'Account ID', name: 'accountId', type: 'string', required: true, displayOptions: { show: { operation: ['getAll', 'get', 'delete', 'getComments', 'createComment', 'deleteComment', 'likeComment', 'getStatistics', 'messageComment'] } }, default: '', description: 'The ID of the connected account to fetch content from' },
			{ displayName: 'Content ID', name: 'contentId', type: 'string', required: true, displayOptions: { show: { operation: ['get', 'delete', 'getComments', 'createComment', 'deleteComment', 'likeComment', 'getStatistics', 'messageComment'] } }, default: '', description: 'The unique identifier of the content item' },
			// Get All
			{ displayName: 'Content Type', name: 'contentType', type: 'string', displayOptions: { show: { operation: ['getAll'] } }, default: '', placeholder: 'e.g. video, image', description: 'Filter content by type (optional)' },
			{ displayName: 'Channel ID', name: 'channelId', type: 'string', displayOptions: { show: { operation: ['getAll'] } }, default: '', placeholder: 'e.g. 120363413774168194@newsletter', description: 'Required for WhatsApp and Telegram accounts: the channel to read posts from, from Repliz Addon > Get WhatsApp Channels / Get Telegram Channels. Optional for Pinterest: a board ID from Repliz Addon > Get Pinterest Boards, to read only that board' },
			{ displayName: 'Next Token', name: 'nextToken', type: 'string', displayOptions: { show: { operation: ['getAll', 'getComments'] } }, default: '', description: 'Pagination cursor token from previous response' },
			// Get Comments
			{ displayName: 'Comment ID Filter', name: 'commentIdFilter', type: 'string', displayOptions: { show: { operation: ['getComments'] } }, default: '', description: 'Filter comments by a specific comment ID (optional)' },
			// Create Comment
			{ displayName: 'Text', name: 'text', type: 'string', required: true, typeOptions: { rows: 3 }, displayOptions: { show: { operation: ['createComment'] } }, default: '', description: 'The text of the comment to post' },
			{ displayName: 'Reply To Comment ID', name: 'replyToCommentId', type: 'string', displayOptions: { show: { operation: ['createComment'] } }, default: '', description: 'Optional: ID of the comment to reply to' },
			{ displayName: 'Image URL', name: 'imageUrl', type: 'string', displayOptions: { show: { operation: ['createComment'] } }, default: '', description: 'Optional: public URL of an image sent along with the text. Supported on Facebook, Threads, TikTok, LinkedIn and X (Twitter), ignored on other platforms.' },
			{ displayName: 'Image MIME Type', name: 'imageMimeType', type: 'string', displayOptions: { show: { operation: ['createComment'] } }, default: '', placeholder: 'e.g. image/jpeg, image/png', description: 'The MIME type of the image. Required when Image URL is set.' },
			{ displayName: 'Image Thumbnail URL', name: 'imageThumbnailUrl', type: 'string', displayOptions: { show: { operation: ['createComment'] } }, default: '', description: 'Optional: smaller preview of the image shown in Repliz' },
			// Delete Comment / Like Comment
			{ displayName: 'Comment ID', name: 'commentId', type: 'string', required: true, displayOptions: { show: { operation: ['deleteComment', 'likeComment'] } }, default: '', description: 'The unique identifier of the comment' },
			// Message Comment Author
			{ displayName: 'Target Comment ID', name: 'targetCommentId', type: 'string', required: true, displayOptions: { show: { operation: ['messageComment'] } }, default: '', description: 'ID of the comment whose author will receive the DM' },
			{
				displayName: 'Message Type',
				name: 'messageType',
				type: 'options',
				required: true,
				displayOptions: { show: { operation: ['messageComment'] } },
				options: [
					{ name: 'Text', value: 'text' },
					{ name: 'Button', value: 'button' },
					{ name: 'Carousel', value: 'carousel' },
					{ name: 'Quick Reply', value: 'quick_reply' },
				],
				default: 'text',
				description: 'Type of the direct message to send',
			},
			{ displayName: 'Message Text', name: 'messageText', type: 'string', typeOptions: { rows: 3 }, displayOptions: { show: { operation: ['messageComment'], messageType: ['text', 'button', 'quick_reply'] } }, default: '', description: 'Text content of the direct message. With Button it is the text above the buttons, with Quick Reply the text above the quick replies' },
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
						{ displayName: 'URL', name: 'url', type: 'string', default: '', description: 'The URL to open when the button is clicked (for web_url type)' },
						{ displayName: 'Payload', name: 'payload', type: 'string', default: '', description: 'For postback type: your own value, up to 1000 characters. When the button is tapped, your Repliz webhook gets a postback event with it in message.payload' },
					],
				}],
				description: '1 to 3 buttons to include in the message',
			},
			{
				displayName: 'Quick Replies',
				name: 'quickReplies',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				displayOptions: { show: { operation: ['messageComment'], messageType: ['quick_reply'] } },
				default: {},
				options: [{
					displayName: 'Quick Reply',
					name: 'quickReplyItems',
					values: [
						{ displayName: 'Title', name: 'title', type: 'string', default: '', description: 'Label of the quick reply, up to 20 characters. It is also the text the person sends when tapping it' },
						{ displayName: 'Payload', name: 'payload', type: 'string', default: '', description: 'Your own value, up to 1000 characters, sent back in message.payload' },
					],
				}],
				description: 'Facebook and Instagram only. 1 to 13 quick replies. A tapped quick reply is sent to your Repliz webhook as a chat event with its payload in message.payload',
			},
			{ displayName: 'Cards (JSON)', name: 'carouselElements', type: 'json', displayOptions: { show: { operation: ['messageComment'], messageType: ['carousel'] } }, default: '[\n  {\n    "title": "Ebook Content Creator",\n    "subtitle": "Bangun aset digital!",\n    "image": "https://storage.repliz.com/image.png",\n    "url": "https://repliz.com",\n    "buttons": [\n      { "type": "postback", "title": "Order Now", "payload": "ORDER_EBOOK" },\n      { "type": "web_url", "title": "Read More", "url": "https://repliz.com" }\n    ]\n  }\n]', description: 'Facebook and Instagram only. 1 to 10 cards, sent as carousel.elements. Each card: { "title", "subtitle"?, "image"?, "url"?, "buttons"?: up to 3 of { "type": "web_url", "title", "url" } or { "type": "postback", "title", "payload" } }. Title and subtitle are cut to 80 characters, and a card needs at least one of subtitle, image or buttons.' },
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
					const channelId = this.getNodeParameter('channelId', i, '') as string;
					const nextToken = this.getNodeParameter('nextToken', i) as string;
					const qs: any = { accountId };
					if (contentType) qs.type = contentType;
					if (channelId) qs.channelId = channelId;
					if (nextToken) qs.nextToken = nextToken;
					responseData = await replizApiRequest.call(this, 'GET', '/public/content', {}, qs);
				} else if (operation === 'get') {
					const contentId = this.getNodeParameter('contentId', i) as string;
					responseData = await replizApiRequest.call(this, 'GET', `/public/content/${contentId}`, {}, { accountId });
				} else if (operation === 'delete') {
					const contentId = this.getNodeParameter('contentId', i) as string;
					responseData = await replizApiRequest.call(this, 'DELETE', `/public/content/${contentId}`, {}, { accountId });
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
					const imageUrl = this.getNodeParameter('imageUrl', i) as string;
					const body: any = { accountId, text };
					if (replyToCommentId) body.commentId = replyToCommentId;
					if (imageUrl) {
						body.image = { url: imageUrl, mimetype: this.getNodeParameter('imageMimeType', i) as string };
						const thumbnail = this.getNodeParameter('imageThumbnailUrl', i) as string;
						if (thumbnail) body.image.thumbnail = thumbnail;
					}
					responseData = await replizApiRequest.call(this, 'POST', `/public/content/${contentId}/comment`, body);
				} else if (operation === 'deleteComment') {
					const contentId = this.getNodeParameter('contentId', i) as string;
					const commentId = this.getNodeParameter('commentId', i) as string;
					responseData = await replizApiRequest.call(this, 'DELETE', `/public/content/${contentId}/comment/${commentId}`, {}, { accountId });
				} else if (operation === 'likeComment') {
					const contentId = this.getNodeParameter('contentId', i) as string;
					const commentId = this.getNodeParameter('commentId', i) as string;
					responseData = await replizApiRequest.call(this, 'POST', `/public/content/${contentId}/like/${commentId}`, {}, { accountId });
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
						btnObj.buttons = replizButtons(buttonsData);
						body.button = btnObj;
					} else if (messageType === 'carousel') {
						body.carousel = replizCarousel(this.getNodeParameter('carouselElements', i));
					} else if (messageType === 'quick_reply') {
						const quickReplies = this.getNodeParameter('quickReplies.quickReplyItems', i, []) as any[];
						body.quickReply = replizQuickReply(this.getNodeParameter('messageText', i) as string, quickReplies);
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

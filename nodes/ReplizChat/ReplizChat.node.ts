import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { replizApiRequest, replizApiRequestAllItems } from '../GenericFunctions';

export class ReplizChat implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Repliz Chat',
		name: 'replizChat',
		icon: 'file:repliz.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Manage live chat conversations and messages in Repliz (Gold+)',
		defaults: { name: 'Repliz Chat' },
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
					{ name: 'Get All', value: 'getAll', description: 'Retrieve all chat conversations', action: 'Get all chats' },
					{ name: 'Get', value: 'get', description: 'Retrieve detailed info of a specific chat', action: 'Get a chat' },
					{ name: 'Get Messages', value: 'getMessages', description: 'Retrieve message history of a chat', action: 'Get chat messages' },
					{ name: 'Send Message', value: 'sendMessage', description: 'Send a message to a conversation', action: 'Send a message' },
					{ name: 'Mark as Read', value: 'markRead', description: 'Mark all messages in a chat as read', action: 'Mark chat as read' },
				],
				default: 'getAll',
			},
			// Get All
			{ displayName: 'Return All', name: 'returnAll', type: 'boolean', displayOptions: { show: { operation: ['getAll'] } }, default: false, description: 'Whether to return all results or only up to a limit' },
			{ displayName: 'Limit', name: 'limit', type: 'number', displayOptions: { show: { operation: ['getAll', 'getMessages'], returnAll: [false] } }, typeOptions: { minValue: 1, maxValue: 100 }, default: 20, description: 'Max number of results to return' },
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				displayOptions: { show: { operation: ['getAll'] } },
				options: [
					{ displayName: 'Status', name: 'status', type: 'options', options: [{ name: 'Unread', value: 'unread' }, { name: 'Unreplied', value: 'unreplied' }], default: '', description: 'Filter chats by status' },
					{ displayName: 'Account IDs', name: 'accountIds', type: 'string', default: '', placeholder: 'id1,id2,id3', description: 'Comma-separated list of account IDs to filter by' },
					{ displayName: 'Search', name: 'search', type: 'string', default: '', description: 'Search chats by sender name' },
				],
			},
			// Get / Get Messages / Send Message / Mark Read
			{ displayName: 'Chat ID', name: 'chatId', type: 'string', required: true, displayOptions: { show: { operation: ['get', 'getMessages', 'sendMessage', 'markRead'] } }, default: '', description: 'The unique identifier of the chat' },
			// Get Messages
			{ displayName: 'Return All', name: 'returnAll', type: 'boolean', displayOptions: { show: { operation: ['getMessages'] } }, default: false, description: 'Whether to return all messages or only up to a limit' },
			// Send Message
			{
				displayName: 'Message Type',
				name: 'messageType',
				type: 'options',
				required: true,
				displayOptions: { show: { operation: ['sendMessage'] } },
				options: [
					{ name: 'Text', value: 'text' },
					{ name: 'Image', value: 'image' },
					{ name: 'Video', value: 'video' },
					{ name: 'Audio', value: 'audio' },
					{ name: 'Document', value: 'document' },
					{ name: 'Button', value: 'button' },
				],
				default: 'text',
				description: 'Type of message to send',
			},
			{ displayName: 'Text', name: 'text', type: 'string', typeOptions: { rows: 3 }, displayOptions: { show: { operation: ['sendMessage'], messageType: ['text', 'image', 'video', 'audio', 'document'] } }, default: '', description: 'The text content of the message' },
			{ displayName: 'Media URL', name: 'mediaUrl', type: 'string', displayOptions: { show: { operation: ['sendMessage'], messageType: ['image', 'video', 'audio', 'document'] } }, default: '', description: 'URL of the media file to send' },
			{ displayName: 'MIME Type', name: 'mimeType', type: 'string', displayOptions: { show: { operation: ['sendMessage'], messageType: ['image', 'video', 'audio', 'document'] } }, default: '', placeholder: 'e.g. image/jpeg, video/mp4', description: 'The MIME type of the media file' },
			{ displayName: 'Thumbnail URL', name: 'thumbnailUrl', type: 'string', displayOptions: { show: { operation: ['sendMessage'], messageType: ['image', 'video'] } }, default: '', description: 'Optional thumbnail image URL for the media' },
			{ displayName: 'Duration (seconds)', name: 'duration', type: 'number', displayOptions: { show: { operation: ['sendMessage'], messageType: ['video', 'audio'] } }, default: 0, description: 'Duration of the video or audio in seconds' },
			{ displayName: 'Document Name', name: 'documentName', type: 'string', displayOptions: { show: { operation: ['sendMessage'], messageType: ['document'] } }, default: '', description: 'Display name of the document file' },
			{ displayName: 'Document Size (bytes)', name: 'documentSize', type: 'number', displayOptions: { show: { operation: ['sendMessage'], messageType: ['document'] } }, default: 0, description: 'File size of the document in bytes' },
			{ displayName: 'Button Text', name: 'buttonText', type: 'string', displayOptions: { show: { operation: ['sendMessage'], messageType: ['button'] } }, default: '', description: 'Main text displayed in the button message' },
			{ displayName: 'Button Image URL', name: 'buttonImageUrl', type: 'string', displayOptions: { show: { operation: ['sendMessage'], messageType: ['button'] } }, default: '', description: 'Optional image URL shown above the button text' },
			{
				displayName: 'Buttons',
				name: 'buttons',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				displayOptions: { show: { operation: ['sendMessage'], messageType: ['button'] } },
				default: {},
				options: [{
					displayName: 'Button Item',
					name: 'buttonItems',
					values: [
						{ displayName: 'Type', name: 'type', type: 'options', options: [{ name: 'Web URL', value: 'web_url' }, { name: 'Postback', value: 'postback' }], default: 'web_url' },
						{ displayName: 'Title', name: 'title', type: 'string', default: '', description: 'Label displayed on the button' },
						{ displayName: 'URL', name: 'url', type: 'string', default: '', description: 'The URL to open when the button is clicked (for web_url type)' },
					],
				}],
				description: 'List of buttons to display in the message',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;
				let responseData: any;

				if (operation === 'getAll') {
					const returnAll = this.getNodeParameter('returnAll', i) as boolean;
					const filters = this.getNodeParameter('filters', i) as any;
					const qs: any = {};
					if (filters.status) qs.status = filters.status;
					if (filters.search) qs.search = filters.search;
					if (filters.accountIds) qs.accountIds = filters.accountIds.split(',').map((s: string) => s.trim()).filter(Boolean);

					if (returnAll) {
						responseData = await replizApiRequestAllItems.call(this, 'GET', '/public/chat', {}, qs);
					} else {
						const limit = this.getNodeParameter('limit', i) as number;
						const res = await replizApiRequest.call(this, 'GET', '/public/chat', {}, { ...qs, page: 1, limit });
						responseData = res.docs || [];
					}
				} else if (operation === 'get') {
					const chatId = this.getNodeParameter('chatId', i) as string;
					responseData = await replizApiRequest.call(this, 'GET', `/public/chat/${chatId}`);
				} else if (operation === 'getMessages') {
					const chatId = this.getNodeParameter('chatId', i) as string;
					const returnAll = this.getNodeParameter('returnAll', i) as boolean;
					if (returnAll) {
						responseData = await replizApiRequestAllItems.call(this, 'GET', `/public/chat/${chatId}/message`);
					} else {
						const limit = this.getNodeParameter('limit', i) as number;
						const res = await replizApiRequest.call(this, 'GET', `/public/chat/${chatId}/message`, {}, { page: 1, limit });
						responseData = res.docs || [];
					}
				} else if (operation === 'sendMessage') {
					const chatId = this.getNodeParameter('chatId', i) as string;
					const messageType = this.getNodeParameter('messageType', i) as string;
					const body: any = { type: messageType };

					if (messageType === 'text') {
						body.text = this.getNodeParameter('text', i) as string;
					} else if (['image', 'video', 'audio', 'document'].includes(messageType)) {
						body.text = this.getNodeParameter('text', i) as string;
						const mediaObj: any = { url: this.getNodeParameter('mediaUrl', i) as string, mimetype: this.getNodeParameter('mimeType', i) as string };
						const thumb = this.getNodeParameter('thumbnailUrl', i) as string;
						if (thumb) mediaObj.thumbnail = thumb;
						const dur = this.getNodeParameter('duration', i) as number;
						if (dur && ['video', 'audio'].includes(messageType)) mediaObj.duration = dur;
						if (messageType === 'document') {
							mediaObj.name = this.getNodeParameter('documentName', i) as string;
							const size = this.getNodeParameter('documentSize', i) as number;
							if (size) mediaObj.size = size;
						}
						body[messageType] = mediaObj;
					} else if (messageType === 'button') {
						const btnObj: any = { text: this.getNodeParameter('buttonText', i) as string };
						const img = this.getNodeParameter('buttonImageUrl', i) as string;
						if (img) btnObj.image = img;
						const buttonsData = this.getNodeParameter('buttons.buttonItems', i, []) as any[];
						btnObj.buttons = buttonsData.map((btn: any) => ({ type: btn.type, title: btn.title, url: btn.url }));
						body.button = btnObj;
					}

					responseData = await replizApiRequest.call(this, 'POST', `/public/chat/${chatId}/message`, body);
				} else if (operation === 'markRead') {
					const chatId = this.getNodeParameter('chatId', i) as string;
					responseData = await replizApiRequest.call(this, 'POST', `/public/chat/${chatId}/read`);
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

import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import { accountOperations, accountFields } from './AccountDescription';
import { commentOperations, commentFields } from './CommentDescription';
import { chatOperations, chatFields } from './ChatDescription';
import { contentOperations, contentFields } from './ContentDescription';
import { scheduleOperations, scheduleFields } from './ScheduleDescription';
import { linkOperations, linkFields } from './LinkDescription';
import { shopeeOperations, shopeeFields } from './ShopeeDescription';
import { tiktokOperations, tiktokFields } from './TikTokDescription';

import { replizApiRequest, replizApiRequestAllItems } from './GenericFunctions';

export class Repliz implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Repliz',
		name: 'repliz',
		icon: 'file:repliz.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
		description: 'Consume Repliz APIs',
		defaults: {
			name: 'Repliz',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'replizApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Account', value: 'account' },
					{ name: 'Chat', value: 'chat' },
					{ name: 'Comment', value: 'comment' },
					{ name: 'Content', value: 'content' },
					{ name: 'Link', value: 'link' },
					{ name: 'Schedule', value: 'schedule' },
					{ name: 'Shopee', value: 'shopee' },
					{ name: 'TikTok', value: 'tiktok' },
				],
				default: 'account',
			},
			...accountOperations,
			...accountFields,
			...commentOperations,
			...commentFields,
			...chatOperations,
			...chatFields,
			...contentOperations,
			...contentFields,
			...scheduleOperations,
			...scheduleFields,
			...linkOperations,
			...linkFields,
			...shopeeOperations,
			...shopeeFields,
			...tiktokOperations,
			...tiktokFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const length = items.length;

		for (let i = 0; i < length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;

				let responseData: any;

				if (resource === 'account') {
					if (operation === 'getMany') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const filters = this.getNodeParameter('filters', i) as any;
						const qs: any = {};
						if (filters.type) qs.type = filters.type;
						if (filters.search) qs.search = filters.search;

						if (returnAll) {
							responseData = await replizApiRequestAllItems.call(this, 'GET', '/public/account', {}, qs);
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							qs.limit = limit;
							qs.page = 1;
							const res = await replizApiRequest.call(this, 'GET', '/public/account', {}, qs);
							responseData = res.docs || [];
						}
					} else if (operation === 'count') {
						responseData = await replizApiRequest.call(this, 'GET', '/public/account/count');
					} else if (operation === 'get') {
						const accountId = this.getNodeParameter('accountId', i) as string;
						responseData = await replizApiRequest.call(this, 'GET', `/public/account/${accountId}`);
					} else if (operation === 'delete') {
						const accountId = this.getNodeParameter('accountId', i) as string;
						responseData = await replizApiRequest.call(this, 'DELETE', `/public/account/${accountId}`);
					} else if (operation === 'facebookAuthorize') {
						const redirect = this.getNodeParameter('redirect', i) as string;
						responseData = await replizApiRequest.call(this, 'GET', '/public/account/facebook/authorize', {}, { redirect });
					} else if (operation === 'facebookPage') {
						const token = this.getNodeParameter('token', i) as string;
						responseData = await replizApiRequest.call(this, 'GET', '/public/account/facebook/page', {}, { token });
					} else if (operation === 'facebookExchange') {
						const code = this.getNodeParameter('code', i) as string;
						responseData = await replizApiRequest.call(this, 'POST', '/public/account/facebook/exchange', { code });
					} else if (operation === 'facebookConnect') {
						const token = this.getNodeParameter('token', i) as string;
						const pageId = this.getNodeParameter('pageId', i) as string;
						responseData = await replizApiRequest.call(this, 'POST', '/public/account/facebook/connect', { token, pageId });
					} else if (operation === 'facebookReconnect') {
						const accountId = this.getNodeParameter('accountId', i) as string;
						const token = this.getNodeParameter('token', i) as string;
						const pageId = this.getNodeParameter('pageId', i) as string;
						responseData = await replizApiRequest.call(this, 'POST', `/public/account/facebook/connect/${accountId}`, { token, pageId });
					} else if (operation === 'instagramAuthorize') {
						const redirect = this.getNodeParameter('redirect', i) as string;
						responseData = await replizApiRequest.call(this, 'GET', '/public/account/instagram/authorize', {}, { redirect });
					} else if (operation === 'instagramConnect') {
						const code = this.getNodeParameter('code', i) as string;
						responseData = await replizApiRequest.call(this, 'POST', '/public/account/instagram/connect', { code });
					} else if (operation === 'instagramReconnect') {
						const accountId = this.getNodeParameter('accountId', i) as string;
						const code = this.getNodeParameter('code', i) as string;
						responseData = await replizApiRequest.call(this, 'POST', `/public/account/instagram/connect/${accountId}`, { code });
					} else if (operation === 'threadsAuthorize') {
						const redirect = this.getNodeParameter('redirect', i) as string;
						responseData = await replizApiRequest.call(this, 'GET', '/public/account/threads/authorize', {}, { redirect });
					} else if (operation === 'threadsConnect') {
						const code = this.getNodeParameter('code', i) as string;
						responseData = await replizApiRequest.call(this, 'POST', '/public/account/threads/connect', { code });
					} else if (operation === 'threadsReconnect') {
						const accountId = this.getNodeParameter('accountId', i) as string;
						const code = this.getNodeParameter('code', i) as string;
						responseData = await replizApiRequest.call(this, 'POST', `/public/account/threads/connect/${accountId}`, { code });
					} else if (operation === 'youtubeAuthorize') {
						const redirect = this.getNodeParameter('redirect', i) as string;
						responseData = await replizApiRequest.call(this, 'GET', '/public/account/youtube/authorize', {}, { redirect });
					} else if (operation === 'youtubeChannel') {
						const token = this.getNodeParameter('token', i) as string;
						responseData = await replizApiRequest.call(this, 'GET', '/public/account/youtube/channel', {}, { token });
					} else if (operation === 'youtubeExchange') {
						const code = this.getNodeParameter('code', i) as string;
						responseData = await replizApiRequest.call(this, 'POST', '/public/account/youtube/exchange', { code });
					} else if (operation === 'youtubeConnect') {
						const token = this.getNodeParameter('token', i) as string;
						const channelId = this.getNodeParameter('channelId', i) as string;
						responseData = await replizApiRequest.call(this, 'POST', '/public/account/youtube/connect', { token, channelId });
					} else if (operation === 'youtubeReconnect') {
						const accountId = this.getNodeParameter('accountId', i) as string;
						const token = this.getNodeParameter('token', i) as string;
						const channelId = this.getNodeParameter('channelId', i) as string;
						responseData = await replizApiRequest.call(this, 'POST', `/public/account/youtube/connect/${accountId}`, { token, channelId });
					} else if (operation === 'linkedinAuthorize') {
						const redirect = this.getNodeParameter('redirect', i) as string;
						responseData = await replizApiRequest.call(this, 'GET', '/public/account/linkedin/authorize', {}, { redirect });
					} else if (operation === 'linkedinOrganization') {
						const token = this.getNodeParameter('token', i) as string;
						responseData = await replizApiRequest.call(this, 'GET', '/public/account/linkedin/organization', {}, { token });
					} else if (operation === 'linkedinExchange') {
						const code = this.getNodeParameter('code', i) as string;
						responseData = await replizApiRequest.call(this, 'POST', '/public/account/linkedin/exchange', { code });
					} else if (operation === 'linkedinConnect') {
						const token = this.getNodeParameter('token', i) as string;
						const organizationId = this.getNodeParameter('organizationId', i) as string;
						responseData = await replizApiRequest.call(this, 'POST', '/public/account/linkedin/connect', { token, organizationId });
					} else if (operation === 'linkedinReconnect') {
						const accountId = this.getNodeParameter('accountId', i) as string;
						const token = this.getNodeParameter('token', i) as string;
						const organizationId = this.getNodeParameter('organizationId', i) as string;
						responseData = await replizApiRequest.call(this, 'POST', `/public/account/linkedin/connect/${accountId}`, { token, organizationId });
					} else if (operation === 'tiktokAuthorize') {
						const redirect = this.getNodeParameter('redirect', i) as string;
						responseData = await replizApiRequest.call(this, 'GET', '/public/account/tiktok/authorize', {}, { redirect });
					} else if (operation === 'tiktokConnect') {
						const code = this.getNodeParameter('code', i) as string;
						responseData = await replizApiRequest.call(this, 'POST', '/public/account/tiktok/connect', { code });
					} else if (operation === 'tiktokReconnect') {
						const accountId = this.getNodeParameter('accountId', i) as string;
						const code = this.getNodeParameter('code', i) as string;
						responseData = await replizApiRequest.call(this, 'POST', `/public/account/tiktok/connect/${accountId}`, { code });
					} else if (operation === 'shopeeAuthorize') {
						const redirect = this.getNodeParameter('redirect', i) as string;
						responseData = await replizApiRequest.call(this, 'GET', '/public/account/shopee/authorize', {}, { redirect });
					} else if (operation === 'shopeeConnect') {
						const code = this.getNodeParameter('code', i) as string;
						responseData = await replizApiRequest.call(this, 'POST', '/public/account/shopee/connect', { code });
					} else if (operation === 'shopeeReconnect') {
						const accountId = this.getNodeParameter('accountId', i) as string;
						const code = this.getNodeParameter('code', i) as string;
						responseData = await replizApiRequest.call(this, 'POST', `/public/account/shopee/connect/${accountId}`, { code });
					}
				} else if (resource === 'comment') {
					if (operation === 'getMany') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const filters = this.getNodeParameter('filters', i) as any;
						const qs: any = {};
						if (filters.status) qs.status = filters.status;
						if (filters.search) qs.search = filters.search;
						if (filters.accountIds) {
							qs.accountIds = filters.accountIds.split(',').map((id: string) => id.trim());
						}

						if (returnAll) {
							responseData = await replizApiRequestAllItems.call(this, 'GET', '/public/comment', {}, qs);
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							qs.limit = limit;
							qs.page = 1;
							const res = await replizApiRequest.call(this, 'GET', '/public/comment', {}, qs);
							responseData = res.docs || [];
						}
					} else if (operation === 'get') {
						const commentId = this.getNodeParameter('commentId', i) as string;
						responseData = await replizApiRequest.call(this, 'GET', `/public/comment/${commentId}`);
					} else if (operation === 'reply') {
						const commentId = this.getNodeParameter('commentId', i) as string;
						const text = this.getNodeParameter('text', i) as string;
						responseData = await replizApiRequest.call(this, 'POST', `/public/comment/${commentId}`, { text });
					} else if (operation === 'updateStatus') {
						const commentId = this.getNodeParameter('commentId', i) as string;
						const status = this.getNodeParameter('status', i) as string;
						responseData = await replizApiRequest.call(this, 'PUT', `/public/comment/${commentId}/status`, { status });
					}
				} else if (resource === 'chat') {
					if (operation === 'getMany') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const filters = this.getNodeParameter('filters', i) as any;
						const qs: any = {};
						if (filters.status) qs.status = filters.status;
						if (filters.search) qs.search = filters.search;
						if (filters.accountIds) {
							qs.accountIds = filters.accountIds.split(',').map((id: string) => id.trim());
						}

						if (returnAll) {
							responseData = await replizApiRequestAllItems.call(this, 'GET', '/public/chat', {}, qs);
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							qs.limit = limit;
							qs.page = 1;
							const res = await replizApiRequest.call(this, 'GET', '/public/chat', {}, qs);
							responseData = res.docs || [];
						}
					} else if (operation === 'get') {
						const chatId = this.getNodeParameter('chatId', i) as string;
						responseData = await replizApiRequest.call(this, 'GET', `/public/chat/${chatId}`);
					} else if (operation === 'getMessages') {
						const chatId = this.getNodeParameter('chatId', i) as string;
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const qs: any = {};

						if (returnAll) {
							responseData = await replizApiRequestAllItems.call(this, 'GET', `/public/chat/${chatId}/message`, {}, qs);
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							qs.limit = limit;
							qs.page = 1;
							const res = await replizApiRequest.call(this, 'GET', `/public/chat/${chatId}/message`, {}, qs);
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
							const mediaObj: any = {
								url: this.getNodeParameter('mediaUrl', i) as string,
								mimetype: this.getNodeParameter('mimeType', i) as string,
							};
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
							const btnObj: any = {
								text: this.getNodeParameter('buttonText', i) as string,
							};
							const img = this.getNodeParameter('buttonImageUrl', i) as string;
							if (img) btnObj.image = img;

							const buttonsData = this.getNodeParameter('buttons.buttonItems', i, []) as any[];
							btnObj.buttons = buttonsData.map((btn: any) => ({
								type: btn.type,
								title: btn.title,
								url: btn.url,
							}));

							body.button = btnObj;
						}

						responseData = await replizApiRequest.call(this, 'POST', `/public/chat/${chatId}/message`, body);
					} else if (operation === 'markRead') {
						const chatId = this.getNodeParameter('chatId', i) as string;
						responseData = await replizApiRequest.call(this, 'POST', `/public/chat/${chatId}/read`);
					}
				} else if (resource === 'content') {
					if (operation === 'getMany') {
						const accountId = this.getNodeParameter('accountId', i) as string;
						const contentType = this.getNodeParameter('contentType', i) as string;
						const nextToken = this.getNodeParameter('nextToken', i) as string;
						const qs: any = { accountId };
						if (contentType) qs.type = contentType;
						if (nextToken) qs.nextToken = nextToken;

						responseData = await replizApiRequest.call(this, 'GET', '/public/content', {}, qs);
					} else if (operation === 'get') {
						const contentId = this.getNodeParameter('contentId', i) as string;
						const accountId = this.getNodeParameter('accountId', i) as string;
						responseData = await replizApiRequest.call(this, 'GET', `/public/content/${contentId}`, {}, { accountId });
					} else if (operation === 'getComments') {
						const contentId = this.getNodeParameter('contentId', i) as string;
						const accountId = this.getNodeParameter('accountId', i) as string;
						const nextToken = this.getNodeParameter('nextToken', i) as string;
						const commentIdFilter = this.getNodeParameter('commentIdFilter', i) as string;
						const qs: any = { accountId };
						if (nextToken) qs.nextToken = nextToken;
						if (commentIdFilter) qs.commentId = commentIdFilter;

						responseData = await replizApiRequest.call(this, 'GET', `/public/content/${contentId}/comment`, {}, qs);
					} else if (operation === 'createComment') {
						const contentId = this.getNodeParameter('contentId', i) as string;
						const accountId = this.getNodeParameter('accountId', i) as string;
						const text = this.getNodeParameter('text', i) as string;
						const replyToCommentId = this.getNodeParameter('replyToCommentId', i) as string;
						const body: any = { accountId, text };
						if (replyToCommentId) body.commentId = replyToCommentId;

						responseData = await replizApiRequest.call(this, 'POST', `/public/content/${contentId}/comment`, body);
					} else if (operation === 'getStatistics') {
						const contentId = this.getNodeParameter('contentId', i) as string;
						const accountId = this.getNodeParameter('accountId', i) as string;
						responseData = await replizApiRequest.call(this, 'GET', `/public/content/${contentId}/statistic`, {}, { accountId });
					} else if (operation === 'messageComment') {
						const contentId = this.getNodeParameter('contentId', i) as string;
						const accountId = this.getNodeParameter('accountId', i) as string;
						const targetCommentId = this.getNodeParameter('targetCommentId', i) as string;
						const messageType = this.getNodeParameter('messageType', i) as string;
						const body: any = { accountId, commentId: targetCommentId };

						if (messageType === 'text') {
							body.text = this.getNodeParameter('messageText', i) as string;
						} else if (messageType === 'button') {
							const btnObj: any = {
								text: this.getNodeParameter('messageText', i) as string,
							};
							const img = this.getNodeParameter('buttonImageUrl', i) as string;
							if (img) btnObj.image = img;

							const buttonsData = this.getNodeParameter('buttons.buttonItems', i, []) as any[];
							btnObj.buttons = buttonsData.map((btn: any) => ({
								type: btn.type,
								title: btn.title,
								url: btn.url,
							}));

							body.button = btnObj;
						}

						responseData = await replizApiRequest.call(this, 'POST', `/public/content/${contentId}/message`, body);
					} else if (operation === 'deleteComment') {
						const contentId = this.getNodeParameter('contentId', i) as string;
						const commentId = this.getNodeParameter('commentId', i) as string;
						const accountId = this.getNodeParameter('accountId', i) as string;
						responseData = await replizApiRequest.call(this, 'DELETE', `/public/content/${contentId}/comment/${commentId}`, {}, { accountId });
					}
				} else if (resource === 'schedule') {
					if (operation === 'getMany') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const filters = this.getNodeParameter('filters', i) as any;
						const qs: any = {};
						if (filters.status) qs.status = filters.status;
						if (filters.fromDate) qs.fromDate = filters.fromDate;
						if (filters.toDate) qs.toDate = filters.toDate;
						if (filters.accountIds) {
							qs.accountIds = filters.accountIds.split(',').map((id: string) => id.trim());
						}

						if (returnAll) {
							responseData = await replizApiRequestAllItems.call(this, 'GET', '/public/schedule', {}, qs);
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							qs.limit = limit;
							qs.page = 1;
							const res = await replizApiRequest.call(this, 'GET', '/public/schedule', {}, qs);
							responseData = res.docs || [];
						}
					} else if (operation === 'get') {
						const scheduleId = this.getNodeParameter('scheduleId', i) as string;
						responseData = await replizApiRequest.call(this, 'GET', `/public/schedule/${scheduleId}`);
					} else if (operation === 'create') {
						const accountId = this.getNodeParameter('accountId', i) as string;
						const scheduleAt = this.getNodeParameter('scheduleAt', i) as string;
						const title = this.getNodeParameter('title', i) as string;
						const description = this.getNodeParameter('description', i) as string;
						const topic = this.getNodeParameter('topic', i) as string;
						const type = this.getNodeParameter('postType', i) as string;
						const templateId = this.getNodeParameter('templateId', i) as string;

						const medias = typeof this.getNodeParameter('mediasJson', i) === 'string' ? JSON.parse(this.getNodeParameter('mediasJson', i) as string) : this.getNodeParameter('mediasJson', i);
						const meta = typeof this.getNodeParameter('metaJson', i) === 'string' ? JSON.parse(this.getNodeParameter('metaJson', i) as string) : this.getNodeParameter('metaJson', i);
						const additionalInfo = typeof this.getNodeParameter('additionalInfoJson', i) === 'string' ? JSON.parse(this.getNodeParameter('additionalInfoJson', i) as string) : this.getNodeParameter('additionalInfoJson', i);
						const replies = typeof this.getNodeParameter('repliesJson', i) === 'string' ? JSON.parse(this.getNodeParameter('repliesJson', i) as string) : this.getNodeParameter('repliesJson', i);

						const body: any = {
							accountId,
							scheduleAt,
							title,
							description,
							topic,
							type,
							medias,
							meta,
							additionalInfo,
							replies,
						};
						if (templateId) body.templateId = templateId;

						responseData = await replizApiRequest.call(this, 'POST', '/public/schedule', body);
					} else if (operation === 'update') {
						const scheduleId = this.getNodeParameter('scheduleId', i) as string;
						const scheduleAt = this.getNodeParameter('scheduleAt', i) as string;
						const title = this.getNodeParameter('title', i) as string;
						const description = this.getNodeParameter('description', i) as string;
						const topic = this.getNodeParameter('topic', i) as string;
						const type = this.getNodeParameter('postType', i) as string;
						const templateId = this.getNodeParameter('templateId', i) as string;

						const medias = typeof this.getNodeParameter('mediasJson', i) === 'string' ? JSON.parse(this.getNodeParameter('mediasJson', i) as string) : this.getNodeParameter('mediasJson', i);
						const meta = typeof this.getNodeParameter('metaJson', i) === 'string' ? JSON.parse(this.getNodeParameter('metaJson', i) as string) : this.getNodeParameter('metaJson', i);
						const additionalInfo = typeof this.getNodeParameter('additionalInfoJson', i) === 'string' ? JSON.parse(this.getNodeParameter('additionalInfoJson', i) as string) : this.getNodeParameter('additionalInfoJson', i);
						const replies = typeof this.getNodeParameter('repliesJson', i) === 'string' ? JSON.parse(this.getNodeParameter('repliesJson', i) as string) : this.getNodeParameter('repliesJson', i);

						const body: any = {
							scheduleAt,
							title,
							description,
							topic,
							type,
							medias,
							meta,
							additionalInfo,
							replies,
						};
						if (templateId) body.templateId = templateId;

						responseData = await replizApiRequest.call(this, 'PUT', `/public/schedule/${scheduleId}`, body);
					} else if (operation === 'delete') {
						const scheduleId = this.getNodeParameter('scheduleId', i) as string;
						responseData = await replizApiRequest.call(this, 'DELETE', `/public/schedule/${scheduleId}`);
					} else if (operation === 'deleteMany') {
						const scheduleIdsRaw = this.getNodeParameter('scheduleIds', i) as string;
						const scheduleIds = scheduleIdsRaw.split(',').map((id: string) => id.trim());
						responseData = await replizApiRequest.call(this, 'DELETE', '/public/schedule/mass', {}, { scheduleIds });
					} else if (operation === 'retry') {
						const scheduleId = this.getNodeParameter('scheduleId', i) as string;
						responseData = await replizApiRequest.call(this, 'PUT', `/public/schedule/${scheduleId}/retry`);
					}
				} else if (resource === 'link') {
					if (operation === 'getMetadata') {
						const url = this.getNodeParameter('url', i) as string;
						responseData = await replizApiRequest.call(this, 'GET', '/public/link/metadata', {}, { url });
					}
				} else if (resource === 'shopee') {
					if (operation === 'getProducts') {
						const accountId = this.getNodeParameter('accountId', i) as string;
						const nextToken = this.getNodeParameter('nextToken', i) as string;
						const qs: any = { accountId };
						if (nextToken) qs.nextToken = nextToken;
						responseData = await replizApiRequest.call(this, 'GET', '/public/shopee/product', {}, qs);
					}
				} else if (resource === 'tiktok') {
					if (operation === 'getTrendingMusic') {
						const genre = this.getNodeParameter('genre', i) as string;
						const countryCode = this.getNodeParameter('countryCode', i) as string;
						responseData = await replizApiRequest.call(this, 'GET', '/public/tiktok/music', {}, { genre, countryCode });
					}
				}

				const executionData = this.helpers.returnJsonArray(responseData);
				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (error as Error).message } });
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}

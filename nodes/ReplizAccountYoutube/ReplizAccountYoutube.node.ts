import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { replizApiRequest } from '../GenericFunctions';

export class ReplizAccountYoutube implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Repliz Account YouTube',
		name: 'replizAccountYoutube',
		icon: 'file:repliz.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Connect and manage YouTube accounts in Repliz (Gold+)',
		defaults: { name: 'Repliz Account YouTube' },
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
					{ name: 'Authorize', value: 'authorize', description: 'Get YouTube OAuth authorization URL', action: 'Authorize YouTube' },
					{ name: 'Get Channels', value: 'getChannel', description: 'Retrieve available YouTube channels for a token', action: 'Get YouTube channels' },
					{ name: 'Exchange Token', value: 'exchange', description: 'Exchange auth code for a YouTube access token', action: 'Exchange YouTube token' },
					{ name: 'Connect', value: 'connect', description: 'Connect a YouTube channel to your workspace', action: 'Connect YouTube channel' },
					{ name: 'Reconnect', value: 'reconnect', description: 'Re-authenticate an existing YouTube account', action: 'Reconnect YouTube account' },
				],
				default: 'authorize',
			},
			{ displayName: 'Redirect URL', name: 'redirect', type: 'string', required: true, displayOptions: { show: { operation: ['authorize'] } }, default: '', description: 'The URL to redirect to after OAuth authorization' },
			{ displayName: 'Access Token', name: 'token', type: 'string', typeOptions: { password: true }, required: true, displayOptions: { show: { operation: ['getChannel'] } }, default: '', description: 'YouTube access token to list available channels' },
			{ displayName: 'Authorization Code', name: 'code', type: 'string', required: true, displayOptions: { show: { operation: ['exchange'] } }, default: '', description: 'The authorization code from YouTube OAuth callback' },
			{ displayName: 'Access Token', name: 'token', type: 'string', typeOptions: { password: true }, required: true, displayOptions: { show: { operation: ['connect'] } }, default: '', description: 'YouTube long-lived access token' },
			{ displayName: 'Channel ID', name: 'channelId', type: 'string', required: true, displayOptions: { show: { operation: ['connect'] } }, default: '', description: 'The YouTube Channel ID to connect' },
			{ displayName: 'Account ID', name: 'accountId', type: 'string', required: true, displayOptions: { show: { operation: ['reconnect'] } }, default: '', description: 'The existing Repliz account ID to reconnect' },
			{ displayName: 'Access Token', name: 'token', type: 'string', typeOptions: { password: true }, required: true, displayOptions: { show: { operation: ['reconnect'] } }, default: '', description: 'New YouTube access token' },
			{ displayName: 'Channel ID', name: 'channelId', type: 'string', required: true, displayOptions: { show: { operation: ['reconnect'] } }, default: '', description: 'The YouTube Channel ID' },
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;
				let responseData: any;

				if (operation === 'authorize') {
					const redirect = this.getNodeParameter('redirect', i) as string;
					responseData = await replizApiRequest.call(this, 'GET', '/public/account/youtube/authorize', {}, { redirect });
				} else if (operation === 'getChannel') {
					const token = this.getNodeParameter('token', i) as string;
					responseData = await replizApiRequest.call(this, 'GET', '/public/account/youtube/channel', {}, { token });
				} else if (operation === 'exchange') {
					const code = this.getNodeParameter('code', i) as string;
					responseData = await replizApiRequest.call(this, 'POST', '/public/account/youtube/exchange', { code });
				} else if (operation === 'connect') {
					const token = this.getNodeParameter('token', i) as string;
					const channelId = this.getNodeParameter('channelId', i) as string;
					responseData = await replizApiRequest.call(this, 'POST', '/public/account/youtube/connect', { token, channelId });
				} else if (operation === 'reconnect') {
					const accountId = this.getNodeParameter('accountId', i) as string;
					const token = this.getNodeParameter('token', i) as string;
					const channelId = this.getNodeParameter('channelId', i) as string;
					responseData = await replizApiRequest.call(this, 'POST', `/public/account/youtube/connect/${accountId}`, { token, channelId });
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

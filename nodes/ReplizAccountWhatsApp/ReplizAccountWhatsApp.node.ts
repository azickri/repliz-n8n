import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { replizApiRequest } from '../GenericFunctions';

export class ReplizAccountWhatsApp implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Repliz Account WhatsApp',
		name: 'replizAccountWhatsApp',
		icon: 'file:repliz.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Connect and manage WhatsApp accounts in Repliz (Gold+)',
		defaults: { name: 'Repliz Account WhatsApp' },
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
					{ name: 'Create Session', value: 'createSession', description: 'Create a new WhatsApp session to start the QR code login', action: 'Create WhatsApp session' },
					{ name: 'Get Session', value: 'getSession', description: 'Get session status and the latest QR code (poll until connected)', action: 'Get WhatsApp session' },
					{ name: 'Get Channels', value: 'getChannel', description: 'Retrieve available WhatsApp accounts, channels and groups for a session', action: 'Get WhatsApp channels' },
					{ name: 'Connect', value: 'connect', description: 'Connect a WhatsApp account, channel or group to your workspace', action: 'Connect WhatsApp' },
					{ name: 'Reconnect', value: 'reconnect', description: 'Re-authenticate an existing WhatsApp account', action: 'Reconnect WhatsApp' },
				],
				default: 'createSession',
			},
			{ displayName: 'Session Token', name: 'token', type: 'string', typeOptions: { password: true }, required: true, displayOptions: { show: { operation: ['getSession'] } }, default: '', description: 'The WhatsApp session token returned by Create Session' },
			{ displayName: 'Session Token', name: 'token', type: 'string', typeOptions: { password: true }, required: true, displayOptions: { show: { operation: ['getChannel'] } }, default: '', description: 'The WhatsApp session token returned by Create Session' },
			{ displayName: 'Session Token', name: 'token', type: 'string', typeOptions: { password: true }, required: true, displayOptions: { show: { operation: ['connect'] } }, default: '', description: 'The WhatsApp session token returned by Create Session (also included in each Get Channels item)' },
			{ displayName: 'Channel ID', name: 'channelId', type: 'string', required: true, displayOptions: { show: { operation: ['connect'] } }, default: '', description: 'The WhatsApp account, channel or group ID to connect (e.g. 120363215489146584@newsletter)' },
			{ displayName: 'Account ID', name: 'accountId', type: 'string', required: true, displayOptions: { show: { operation: ['reconnect'] } }, default: '', description: 'The existing Repliz account ID to reconnect' },
			{ displayName: 'Session Token', name: 'token', type: 'string', typeOptions: { password: true }, required: true, displayOptions: { show: { operation: ['reconnect'] } }, default: '', description: 'The WhatsApp session token returned by Create Session (also included in each Get Channels item)' },
			{ displayName: 'Channel ID', name: 'channelId', type: 'string', required: true, displayOptions: { show: { operation: ['reconnect'] } }, default: '', description: 'The WhatsApp account, channel or group ID' },
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;
				let responseData: any;

				if (operation === 'createSession') {
					responseData = await replizApiRequest.call(this, 'POST', '/public/account/whatsapp/session');
				} else if (operation === 'getSession') {
					const token = this.getNodeParameter('token', i) as string;
					responseData = await replizApiRequest.call(this, 'GET', '/public/account/whatsapp/session', {}, { token });
				} else if (operation === 'getChannel') {
					const token = this.getNodeParameter('token', i) as string;
					responseData = await replizApiRequest.call(this, 'GET', '/public/account/whatsapp/channel', {}, { token });
				} else if (operation === 'connect') {
					const token = this.getNodeParameter('token', i) as string;
					const channelId = this.getNodeParameter('channelId', i) as string;
					responseData = await replizApiRequest.call(this, 'POST', '/public/account/whatsapp/connect', { token, channelId });
				} else if (operation === 'reconnect') {
					const accountId = this.getNodeParameter('accountId', i) as string;
					const token = this.getNodeParameter('token', i) as string;
					const channelId = this.getNodeParameter('channelId', i) as string;
					responseData = await replizApiRequest.call(this, 'POST', `/public/account/whatsapp/connect/${accountId}`, { token, channelId });
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

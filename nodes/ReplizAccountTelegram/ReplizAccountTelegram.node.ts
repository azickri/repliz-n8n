import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { replizApiRequest } from '../GenericFunctions';

export class ReplizAccountTelegram implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Repliz Account Telegram',
		name: 'replizAccountTelegram',
		icon: 'file:repliz.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Connect and manage Telegram accounts in Repliz (Gold+)',
		defaults: { name: 'Repliz Account Telegram' },
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
					{ name: 'Create Session', value: 'createSession', description: 'Create a new Telegram session to start the QR code login', action: 'Create Telegram session' },
					{ name: 'Get Session', value: 'getSession', description: 'Get session status and the latest QR code (loop until isConnected is true)', action: 'Get Telegram session' },
					{ name: 'Send Password', value: 'sendPassword', description: 'Send the two-step verification password when Get Session returns isPasswordRequired true', action: 'Send Telegram password' },
					{ name: 'Connect', value: 'connect', description: 'Connect the Telegram account of a connected session to your workspace', action: 'Connect Telegram' },
					{ name: 'Reconnect', value: 'reconnect', description: 'Re-authenticate an existing Telegram account with a connected session', action: 'Reconnect Telegram' },
				],
				default: 'createSession',
			},
			{ displayName: 'Account ID', name: 'accountId', type: 'string', required: true, displayOptions: { show: { operation: ['reconnect'] } }, default: '', description: 'The existing Repliz account ID to reconnect. The scanned Telegram account must be the same as this account.' },
			{ displayName: 'Session Token', name: 'token', type: 'string', typeOptions: { password: true }, required: true, displayOptions: { show: { operation: ['getSession', 'sendPassword', 'connect', 'reconnect'] } }, default: '', description: 'The Telegram session token returned by Create Session' },
			{ displayName: 'Password', name: 'password', type: 'string', typeOptions: { password: true }, required: true, displayOptions: { show: { operation: ['sendPassword'] } }, default: '', description: 'The two-step verification (cloud) password of the Telegram account. Get Session returns its passwordHint.' },
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
					responseData = await replizApiRequest.call(this, 'POST', '/public/account/telegram/session');
				} else if (operation === 'getSession') {
					const token = this.getNodeParameter('token', i) as string;
					responseData = await replizApiRequest.call(this, 'GET', '/public/account/telegram/session', {}, { token });
				} else if (operation === 'sendPassword') {
					const token = this.getNodeParameter('token', i) as string;
					const password = this.getNodeParameter('password', i) as string;
					responseData = await replizApiRequest.call(this, 'POST', '/public/account/telegram/session/password', { token, password });
				} else if (operation === 'connect') {
					const token = this.getNodeParameter('token', i) as string;
					responseData = await replizApiRequest.call(this, 'POST', '/public/account/telegram/connect', { token });
				} else if (operation === 'reconnect') {
					const accountId = this.getNodeParameter('accountId', i) as string;
					const token = this.getNodeParameter('token', i) as string;
					responseData = await replizApiRequest.call(this, 'POST', `/public/account/telegram/connect/${accountId}`, { token });
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

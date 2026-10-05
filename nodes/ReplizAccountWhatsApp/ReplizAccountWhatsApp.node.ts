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
					{ name: 'Get Session', value: 'getSession', description: 'Get session status and the latest QR code (loop until isConnected is true)', action: 'Get WhatsApp session' },
					{ name: 'Connect', value: 'connect', description: 'Connect the WhatsApp number of a connected session to your workspace', action: 'Connect WhatsApp' },
					{ name: 'Reconnect', value: 'reconnect', description: 'Re-authenticate an existing WhatsApp account with a connected session', action: 'Reconnect WhatsApp' },
				],
				default: 'createSession',
			},
			{ displayName: 'Account ID', name: 'accountId', type: 'string', required: true, displayOptions: { show: { operation: ['reconnect'] } }, default: '', description: 'The existing Repliz account ID to reconnect. The scanned WhatsApp number must be the same as this account.' },
			{ displayName: 'Session Token', name: 'token', type: 'string', typeOptions: { password: true }, required: true, displayOptions: { show: { operation: ['getSession', 'connect', 'reconnect'] } }, default: '', description: 'The WhatsApp session token returned by Create Session' },
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
				} else if (operation === 'connect') {
					const token = this.getNodeParameter('token', i) as string;
					responseData = await replizApiRequest.call(this, 'POST', '/public/account/whatsapp/connect', { token });
				} else if (operation === 'reconnect') {
					const accountId = this.getNodeParameter('accountId', i) as string;
					const token = this.getNodeParameter('token', i) as string;
					responseData = await replizApiRequest.call(this, 'POST', `/public/account/whatsapp/connect/${accountId}`, { token });
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

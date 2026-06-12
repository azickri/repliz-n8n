import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { replizApiRequest } from '../GenericFunctions';

export class ReplizAccountFacebook implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Repliz Account Facebook',
		name: 'replizAccountFacebook',
		icon: 'file:repliz.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Connect and manage Facebook accounts in Repliz (Gold+)',
		defaults: { name: 'Repliz Account Facebook' },
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
					{ name: 'Authorize', value: 'authorize', description: 'Get Facebook OAuth authorization URL', action: 'Authorize Facebook' },
					{ name: 'Get Pages', value: 'getPage', description: 'Retrieve available Facebook pages for a token', action: 'Get Facebook pages' },
					{ name: 'Exchange Token', value: 'exchange', description: 'Exchange auth code for a long-lived token', action: 'Exchange Facebook token' },
					{ name: 'Connect', value: 'connect', description: 'Connect a Facebook page to your workspace', action: 'Connect Facebook page' },
					{ name: 'Reconnect', value: 'reconnect', description: 'Re-authenticate an existing Facebook account', action: 'Reconnect Facebook account' },
				],
				default: 'authorize',
			},
			// Authorize
			{ displayName: 'Redirect URL', name: 'redirect', type: 'string', required: true, displayOptions: { show: { operation: ['authorize'] } }, default: '', description: 'The URL to redirect to after OAuth authorization' },
			// Get Pages
			{ displayName: 'Access Token', name: 'token', type: 'string', typeOptions: { password: true }, required: true, displayOptions: { show: { operation: ['getPage'] } }, default: '', description: 'Facebook access token to list available pages' },
			// Exchange
			{ displayName: 'Authorization Code', name: 'code', type: 'string', required: true, displayOptions: { show: { operation: ['exchange'] } }, default: '', description: 'The authorization code returned by Facebook OAuth callback' },
			// Connect
			{ displayName: 'Access Token', name: 'token', type: 'string', typeOptions: { password: true }, required: true, displayOptions: { show: { operation: ['connect'] } }, default: '', description: 'Facebook long-lived access token' },
			{ displayName: 'Page ID', name: 'pageId', type: 'string', required: true, displayOptions: { show: { operation: ['connect'] } }, default: '', description: 'The Facebook Page ID to connect' },
			// Reconnect
			{ displayName: 'Account ID', name: 'accountId', type: 'string', required: true, displayOptions: { show: { operation: ['reconnect'] } }, default: '', description: 'The existing Repliz account ID to reconnect' },
			{ displayName: 'Access Token', name: 'token', type: 'string', typeOptions: { password: true }, required: true, displayOptions: { show: { operation: ['reconnect'] } }, default: '', description: 'New Facebook long-lived access token' },
			{ displayName: 'Page ID', name: 'pageId', type: 'string', required: true, displayOptions: { show: { operation: ['reconnect'] } }, default: '', description: 'The Facebook Page ID' },
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
					responseData = await replizApiRequest.call(this, 'GET', '/public/account/facebook/authorize', {}, { redirect });
				} else if (operation === 'getPage') {
					const token = this.getNodeParameter('token', i) as string;
					responseData = await replizApiRequest.call(this, 'GET', '/public/account/facebook/page', {}, { token });
				} else if (operation === 'exchange') {
					const code = this.getNodeParameter('code', i) as string;
					responseData = await replizApiRequest.call(this, 'POST', '/public/account/facebook/exchange', { code });
				} else if (operation === 'connect') {
					const token = this.getNodeParameter('token', i) as string;
					const pageId = this.getNodeParameter('pageId', i) as string;
					responseData = await replizApiRequest.call(this, 'POST', '/public/account/facebook/connect', { token, pageId });
				} else if (operation === 'reconnect') {
					const accountId = this.getNodeParameter('accountId', i) as string;
					const token = this.getNodeParameter('token', i) as string;
					const pageId = this.getNodeParameter('pageId', i) as string;
					responseData = await replizApiRequest.call(this, 'POST', `/public/account/facebook/connect/${accountId}`, { token, pageId });
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

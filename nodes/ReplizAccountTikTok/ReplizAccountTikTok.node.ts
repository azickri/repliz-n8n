import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { replizApiRequest } from '../GenericFunctions';

export class ReplizAccountTikTok implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Repliz Account TikTok',
		name: 'replizAccountTikTok',
		icon: 'file:repliz.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Connect and manage TikTok accounts in Repliz (Gold+)',
		defaults: { name: 'Repliz Account TikTok' },
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
					{ name: 'Authorize', value: 'authorize', description: 'Get TikTok OAuth authorization URL', action: 'Authorize TikTok' },
					{ name: 'Connect', value: 'connect', description: 'Connect TikTok account using auth code', action: 'Connect TikTok' },
					{ name: 'Reconnect', value: 'reconnect', description: 'Re-authenticate an existing TikTok account', action: 'Reconnect TikTok' },
				],
				default: 'authorize',
			},
			{ displayName: 'Redirect URL', name: 'redirect', type: 'string', required: true, displayOptions: { show: { operation: ['authorize'] } }, default: '', description: 'The URL to redirect to after OAuth authorization' },
			{ displayName: 'Authorization Code', name: 'code', type: 'string', required: true, displayOptions: { show: { operation: ['connect'] } }, default: '', description: 'The authorization code from TikTok OAuth callback' },
			{ displayName: 'Account ID', name: 'accountId', type: 'string', required: true, displayOptions: { show: { operation: ['reconnect'] } }, default: '', description: 'The existing Repliz account ID to reconnect' },
			{ displayName: 'Authorization Code', name: 'code', type: 'string', required: true, displayOptions: { show: { operation: ['reconnect'] } }, default: '', description: 'New authorization code from TikTok OAuth' },
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
					responseData = await replizApiRequest.call(this, 'GET', '/public/account/tiktok/authorize', {}, { redirect });
				} else if (operation === 'connect') {
					const code = this.getNodeParameter('code', i) as string;
					responseData = await replizApiRequest.call(this, 'POST', '/public/account/tiktok/connect', { code });
				} else if (operation === 'reconnect') {
					const accountId = this.getNodeParameter('accountId', i) as string;
					const code = this.getNodeParameter('code', i) as string;
					responseData = await replizApiRequest.call(this, 'POST', `/public/account/tiktok/connect/${accountId}`, { code });
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

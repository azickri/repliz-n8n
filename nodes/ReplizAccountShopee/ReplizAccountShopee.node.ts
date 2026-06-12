import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { replizApiRequest } from '../GenericFunctions';

export class ReplizAccountShopee implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Repliz Account Shopee',
		name: 'replizAccountShopee',
		icon: 'file:repliz.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Connect and manage Shopee accounts in Repliz (Gold+)',
		defaults: { name: 'Repliz Account Shopee' },
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
					{ name: 'Authorize', value: 'authorize', description: 'Get Shopee OAuth authorization URL', action: 'Authorize Shopee' },
					{ name: 'Connect', value: 'connect', description: 'Connect Shopee account using auth code', action: 'Connect Shopee' },
					{ name: 'Reconnect', value: 'reconnect', description: 'Re-authenticate an existing Shopee account', action: 'Reconnect Shopee' },
				],
				default: 'authorize',
			},
			{ displayName: 'Redirect URL', name: 'redirect', type: 'string', required: true, displayOptions: { show: { operation: ['authorize'] } }, default: '', description: 'The URL to redirect to after OAuth authorization' },
			{ displayName: 'Authorization Code', name: 'code', type: 'string', required: true, displayOptions: { show: { operation: ['connect'] } }, default: '', description: 'The authorization code from Shopee OAuth callback' },
			{ displayName: 'Account ID', name: 'accountId', type: 'string', required: true, displayOptions: { show: { operation: ['reconnect'] } }, default: '', description: 'The existing Repliz account ID to reconnect' },
			{ displayName: 'Authorization Code', name: 'code', type: 'string', required: true, displayOptions: { show: { operation: ['reconnect'] } }, default: '', description: 'New authorization code from Shopee OAuth' },
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
					responseData = await replizApiRequest.call(this, 'GET', '/public/account/shopee/authorize', {}, { redirect });
				} else if (operation === 'connect') {
					const code = this.getNodeParameter('code', i) as string;
					responseData = await replizApiRequest.call(this, 'POST', '/public/account/shopee/connect', { code });
				} else if (operation === 'reconnect') {
					const accountId = this.getNodeParameter('accountId', i) as string;
					const code = this.getNodeParameter('code', i) as string;
					responseData = await replizApiRequest.call(this, 'POST', `/public/account/shopee/connect/${accountId}`, { code });
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

import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { replizApiRequest } from '../GenericFunctions';

export class ReplizAccountInstagram implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Repliz Account Instagram',
		name: 'replizAccountInstagram',
		icon: 'file:repliz.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Connect and manage Instagram accounts in Repliz (Gold+)',
		defaults: { name: 'Repliz Account Instagram' },
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
					{ name: 'Authorize', value: 'authorize', description: 'Get Instagram OAuth authorization URL', action: 'Authorize Instagram' },
					{ name: 'Connect', value: 'connect', description: 'Connect Instagram account using auth code', action: 'Connect Instagram' },
					{ name: 'Reconnect', value: 'reconnect', description: 'Re-authenticate an existing Instagram account', action: 'Reconnect Instagram' },
				],
				default: 'authorize',
			},
			{ displayName: 'Redirect URL', name: 'redirect', type: 'string', required: true, displayOptions: { show: { operation: ['authorize'] } }, default: '', description: 'The URL to redirect to after OAuth authorization' },
			{ displayName: 'Authorization Code', name: 'code', type: 'string', required: true, displayOptions: { show: { operation: ['connect'] } }, default: '', description: 'The authorization code from Instagram OAuth callback' },
			{ displayName: 'Account ID', name: 'accountId', type: 'string', required: true, displayOptions: { show: { operation: ['reconnect'] } }, default: '', description: 'The existing Repliz account ID to reconnect' },
			{ displayName: 'Authorization Code', name: 'code', type: 'string', required: true, displayOptions: { show: { operation: ['reconnect'] } }, default: '', description: 'New authorization code from Instagram OAuth' },
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
					responseData = await replizApiRequest.call(this, 'GET', '/public/account/instagram/authorize', {}, { redirect });
				} else if (operation === 'connect') {
					const code = this.getNodeParameter('code', i) as string;
					responseData = await replizApiRequest.call(this, 'POST', '/public/account/instagram/connect', { code });
				} else if (operation === 'reconnect') {
					const accountId = this.getNodeParameter('accountId', i) as string;
					const code = this.getNodeParameter('code', i) as string;
					responseData = await replizApiRequest.call(this, 'POST', `/public/account/instagram/connect/${accountId}`, { code });
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

import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { replizApiRequest } from '../GenericFunctions';

export class ReplizAccountLinkedIn implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Repliz Account LinkedIn',
		name: 'replizAccountLinkedIn',
		icon: 'file:repliz.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Connect and manage LinkedIn accounts in Repliz (Gold+)',
		defaults: { name: 'Repliz Account LinkedIn' },
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
					{ name: 'Authorize', value: 'authorize', description: 'Get LinkedIn OAuth authorization URL', action: 'Authorize LinkedIn' },
					{ name: 'Get Organization', value: 'getOrganization', description: 'Retrieve available LinkedIn organizations for a token', action: 'Get LinkedIn organizations' },
					{ name: 'Exchange Token', value: 'exchange', description: 'Exchange auth code for a LinkedIn access token', action: 'Exchange LinkedIn token' },
					{ name: 'Connect', value: 'connect', description: 'Connect a LinkedIn organization to your workspace', action: 'Connect LinkedIn organization' },
					{ name: 'Reconnect', value: 'reconnect', description: 'Re-authenticate an existing LinkedIn account', action: 'Reconnect LinkedIn account' },
				],
				default: 'authorize',
			},
			{ displayName: 'Redirect URL', name: 'redirect', type: 'string', required: true, displayOptions: { show: { operation: ['authorize'] } }, default: '', description: 'The URL to redirect to after OAuth authorization' },
			{ displayName: 'Access Token', name: 'token', type: 'string', typeOptions: { password: true }, required: true, displayOptions: { show: { operation: ['getOrganization'] } }, default: '', description: 'LinkedIn access token to list available organizations' },
			{ displayName: 'Authorization Code', name: 'code', type: 'string', required: true, displayOptions: { show: { operation: ['exchange'] } }, default: '', description: 'The authorization code from LinkedIn OAuth callback' },
			{ displayName: 'Access Token', name: 'token', type: 'string', typeOptions: { password: true }, required: true, displayOptions: { show: { operation: ['connect'] } }, default: '', description: 'LinkedIn long-lived access token' },
			{ displayName: 'Organization ID', name: 'organizationId', type: 'string', required: true, displayOptions: { show: { operation: ['connect'] } }, default: '', description: 'The LinkedIn Organization ID to connect' },
			{ displayName: 'Account ID', name: 'accountId', type: 'string', required: true, displayOptions: { show: { operation: ['reconnect'] } }, default: '', description: 'The existing Repliz account ID to reconnect' },
			{ displayName: 'Access Token', name: 'token', type: 'string', typeOptions: { password: true }, required: true, displayOptions: { show: { operation: ['reconnect'] } }, default: '', description: 'New LinkedIn access token' },
			{ displayName: 'Organization ID', name: 'organizationId', type: 'string', required: true, displayOptions: { show: { operation: ['reconnect'] } }, default: '', description: 'The LinkedIn Organization ID' },
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
					responseData = await replizApiRequest.call(this, 'GET', '/public/account/linkedin/authorize', {}, { redirect });
				} else if (operation === 'getOrganization') {
					const token = this.getNodeParameter('token', i) as string;
					responseData = await replizApiRequest.call(this, 'GET', '/public/account/linkedin/organization', {}, { token });
				} else if (operation === 'exchange') {
					const code = this.getNodeParameter('code', i) as string;
					responseData = await replizApiRequest.call(this, 'POST', '/public/account/linkedin/exchange', { code });
				} else if (operation === 'connect') {
					const token = this.getNodeParameter('token', i) as string;
					const organizationId = this.getNodeParameter('organizationId', i) as string;
					responseData = await replizApiRequest.call(this, 'POST', '/public/account/linkedin/connect', { token, organizationId });
				} else if (operation === 'reconnect') {
					const accountId = this.getNodeParameter('accountId', i) as string;
					const token = this.getNodeParameter('token', i) as string;
					const organizationId = this.getNodeParameter('organizationId', i) as string;
					responseData = await replizApiRequest.call(this, 'POST', `/public/account/linkedin/connect/${accountId}`, { token, organizationId });
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

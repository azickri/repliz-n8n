import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class ReplizApi implements ICredentialType {
	name = 'replizApi';
	displayName = 'Repliz API';
	documentationUrl = 'https://repliz.com';
	properties: INodeProperties[] = [
		{
			displayName: 'Access Key',
			name: 'accessKey',
			type: 'string',
			default: '',
			required: true,
			description: 'The Access Key generated from your Repliz settings page.',
		},
		{
			displayName: 'Secret Key',
			name: 'secretKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'The Secret Key generated from your Repliz settings page.',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.repliz.com',
			required: true,
			description: 'The URL used to access the Repliz API endpoints.',
		},
	];
}

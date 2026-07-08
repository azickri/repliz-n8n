import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { replizApiRequest, replizApiRequestAllItems } from '../GenericFunctions';

export class ReplizStorage implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Repliz Storage',
		name: 'replizStorage',
		icon: 'file:repliz.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Manage files in Repliz cloud storage — upload, retrieve, and delete media assets (Storage+)',
		defaults: { name: 'Repliz Storage' },
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
					{
						name: 'Get Statistics',
						value: 'getStatistics',
						description: 'Retrieve storage usage statistics for your workspace',
						action: 'Get storage statistics',
					},
					{
						name: 'Get All Files',
						value: 'getAll',
						description: 'List all uploaded files in your storage',
						action: 'Get all files',
					},
					{
						name: 'Get File',
						value: 'get',
						description: 'Retrieve detailed info of a specific file',
						action: 'Get a file',
					},
					{
						name: 'Delete File',
						value: 'delete',
						description: 'Permanently delete a file from storage',
						action: 'Delete a file',
					},
					{
						name: 'Initialize Upload',
						value: 'initUpload',
						description: 'Register a new file upload and get an upload URL. Call this before uploading the actual file binary.',
						action: 'Initialize file upload',
					},
					{
						name: 'Complete Upload',
						value: 'completeUpload',
						description: 'Mark a file upload as completed after the binary has been uploaded to the returned URL',
						action: 'Complete file upload',
					},
					{
						name: 'Delete Many Files',
						value: 'deleteMany',
						description: 'Permanently delete multiple files from storage at once',
						action: 'Delete many files',
					},
				],
				default: 'getAll',
			},

			// ── Get All Files ──────────────────────────────────────────────
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				displayOptions: { show: { operation: ['getAll'] } },
				default: false,
				description: 'Whether to return all results or only up to a limit',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				displayOptions: { show: { operation: ['getAll'], returnAll: [false] } },
				typeOptions: { minValue: 1, maxValue: 100 },
				default: 20,
				description: 'Max number of files to return',
			},
			{
				displayName: 'Search',
				name: 'search',
				type: 'string',
				displayOptions: { show: { operation: ['getAll'] } },
				default: '',
				placeholder: 'e.g. video.mp4',
				description: 'Filter files by name (optional)',
			},

			// ── Get / Delete / Complete ────────────────────────────────────
			{
				displayName: 'File ID',
				name: 'fileId',
				type: 'string',
				required: true,
				displayOptions: { show: { operation: ['get', 'delete', 'completeUpload'] } },
				default: '',
				description: 'The unique identifier of the file',
			},

			// ── Initialize Upload ──────────────────────────────────────────
			{
				displayName: 'Filename',
				name: 'filename',
				type: 'string',
				required: true,
				displayOptions: { show: { operation: ['initUpload'] } },
				default: '',
				placeholder: 'e.g. video.mp4',
				description: 'The name of the file to upload, including extension',
			},
			{
				displayName: 'File Size (bytes)',
				name: 'size',
				type: 'number',
				required: true,
				displayOptions: { show: { operation: ['initUpload'] } },
				default: 0,
				description: 'The exact size of the file in bytes',
			},
			{
				displayName: 'MIME Type',
				name: 'mimetype',
				type: 'string',
				required: true,
				displayOptions: { show: { operation: ['initUpload'] } },
				default: '',
				placeholder: 'e.g. video/mp4, image/jpeg, audio/mpeg',
				description: 'The MIME type of the file (e.g. video/mp4, image/jpeg)',
			},

			// ── Delete Many ────────────────────────────────────────────────
			{
				displayName: 'File IDs',
				name: 'fileIds',
				type: 'string',
				required: true,
				displayOptions: { show: { operation: ['deleteMany'] } },
				default: '',
				placeholder: 'id1,id2,id3',
				description: 'Comma-separated list of file IDs to delete',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;
				let responseData: any;

				if (operation === 'getStatistics') {
					responseData = await replizApiRequest.call(this, 'GET', '/public/storage/statistic');

				} else if (operation === 'getAll') {
					const returnAll = this.getNodeParameter('returnAll', i) as boolean;
					const search = this.getNodeParameter('search', i) as string;
					const qs: any = {};
					if (search) qs.search = search;

					if (returnAll) {
						responseData = await replizApiRequestAllItems.call(this, 'GET', '/public/storage/file', {}, qs);
					} else {
						const limit = this.getNodeParameter('limit', i) as number;
						const res = await replizApiRequest.call(this, 'GET', '/public/storage/file', {}, { ...qs, page: 1, limit });
						responseData = res.docs || [];
					}

				} else if (operation === 'get') {
					const fileId = this.getNodeParameter('fileId', i) as string;
					responseData = await replizApiRequest.call(this, 'GET', `/public/storage/file/${fileId}`);

				} else if (operation === 'delete') {
					const fileId = this.getNodeParameter('fileId', i) as string;
					responseData = await replizApiRequest.call(this, 'DELETE', `/public/storage/file/${fileId}`);

				} else if (operation === 'initUpload') {
					const filename = this.getNodeParameter('filename', i) as string;
					const size = this.getNodeParameter('size', i) as number;
					const mimetype = this.getNodeParameter('mimetype', i) as string;
					responseData = await replizApiRequest.call(this, 'POST', '/public/storage/file/init', { filename, size, mimetype });

				} else if (operation === 'completeUpload') {
					const fileId = this.getNodeParameter('fileId', i) as string;
					responseData = await replizApiRequest.call(this, 'POST', `/public/storage/file/${fileId}/complete`);

				} else if (operation === 'deleteMany') {
					const fileIds = (this.getNodeParameter('fileIds', i) as string)
						.split(',')
						.map((s: string) => s.trim())
						.filter(Boolean);
					responseData = await replizApiRequest.call(this, 'DELETE', '/public/storage/file/mass', {}, { fileIds });
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

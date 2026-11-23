import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { replizApiRequest, replizApiRequestAllItems } from '../GenericFunctions';

function splitIds(value: string): string[] {
	return (value || '').split(',').map((s) => s.trim()).filter(Boolean);
}

export class ReplizStorage implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Repliz Storage',
		name: 'replizStorage',
		icon: 'file:repliz.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Manage files in Repliz cloud storage — upload, retrieve, organize in folders, and delete media assets (Storage+)',
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
					{
						name: 'Move Files',
						value: 'moveFiles',
						description: 'Move files into a folder, or out of their folder. File URLs stay the same.',
						action: 'Move files',
					},
					{
						name: 'Get All Folders',
						value: 'getFolders',
						description: 'List every folder with the number and size of its files',
						action: 'Get all folders',
					},
					{
						name: 'Create Folder',
						value: 'createFolder',
						description: 'Create a folder, for example one per brand or social media account',
						action: 'Create a folder',
					},
					{
						name: 'Rename Folder',
						value: 'updateFolder',
						description: 'Rename a folder',
						action: 'Rename a folder',
					},
					{
						name: 'Delete Folder',
						value: 'deleteFolder',
						description: 'Delete a folder. Its files are kept and moved out of it.',
						action: 'Delete a folder',
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
			{
				displayName: 'Folder ID',
				name: 'filterFolderId',
				type: 'string',
				displayOptions: { show: { operation: ['getAll'] } },
				default: '',
				placeholder: 'e.g. 6a4c3b580afd72bb342c3886 or none',
				description: 'Only files in this folder, from Get All Folders. Use none for files outside any folder. Leave empty for all files.',
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
			{
				displayName: 'Folder ID',
				name: 'uploadFolderId',
				type: 'string',
				displayOptions: { show: { operation: ['initUpload'] } },
				default: '',
				description: 'Folder to put the file in, from Get All Folders. Leave empty to keep it outside any folder.',
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

			// ── Move Files ─────────────────────────────────────────────────
			{
				displayName: 'File IDs',
				name: 'moveFileIds',
				type: 'string',
				required: true,
				displayOptions: { show: { operation: ['moveFiles'] } },
				default: '',
				placeholder: 'id1,id2,id3',
				description: 'Comma-separated list of file IDs to move, up to 100',
			},
			{
				displayName: 'Target Folder ID',
				name: 'targetFolderId',
				type: 'string',
				displayOptions: { show: { operation: ['moveFiles'] } },
				default: '',
				description: 'Folder to move the files into, from Get All Folders. Leave empty to take the files out of their folder.',
			},

			// ── Folders ────────────────────────────────────────────────────
			{
				displayName: 'Folder ID',
				name: 'folderId',
				type: 'string',
				required: true,
				displayOptions: { show: { operation: ['updateFolder', 'deleteFolder'] } },
				default: '',
				description: 'The folder ID, from Get All Folders',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				required: true,
				displayOptions: { show: { operation: ['createFolder', 'updateFolder'] } },
				default: '',
				placeholder: 'e.g. Brand A',
				description: 'Folder name, up to 50 characters and unique (case-insensitive)',
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
					const folderId = this.getNodeParameter('filterFolderId', i, '') as string;
					const qs: any = {};
					if (search) qs.search = search;
					if (folderId) qs.folderId = folderId;

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
					const folderId = this.getNodeParameter('uploadFolderId', i, '') as string;
					const body: any = { filename, size, mimetype };
					if (folderId) body.folderId = folderId;
					responseData = await replizApiRequest.call(this, 'POST', '/public/storage/file/init', body);

				} else if (operation === 'completeUpload') {
					const fileId = this.getNodeParameter('fileId', i) as string;
					responseData = await replizApiRequest.call(this, 'POST', `/public/storage/file/${fileId}/complete`);

				} else if (operation === 'deleteMany') {
					const fileIds = (this.getNodeParameter('fileIds', i) as string)
						.split(',')
						.map((s: string) => s.trim())
						.filter(Boolean);
					responseData = await replizApiRequest.call(this, 'DELETE', '/public/storage/file/mass', {}, { fileIds });

				} else if (operation === 'moveFiles') {
					const fileIds = splitIds(this.getNodeParameter('moveFileIds', i) as string);
					const folderId = this.getNodeParameter('targetFolderId', i, '') as string;
					responseData = await replizApiRequest.call(this, 'PUT', '/public/storage/file/folder', { fileIds, folderId: folderId || null });

				} else if (operation === 'getFolders') {
					const res = await replizApiRequest.call(this, 'GET', '/public/storage/folder');
					responseData = res.docs || [];

				} else if (operation === 'createFolder') {
					const name = this.getNodeParameter('name', i) as string;
					responseData = await replizApiRequest.call(this, 'POST', '/public/storage/folder', { name });

				} else if (operation === 'updateFolder') {
					const folderId = this.getNodeParameter('folderId', i) as string;
					const name = this.getNodeParameter('name', i) as string;
					responseData = await replizApiRequest.call(this, 'PUT', `/public/storage/folder/${folderId}`, { name });

				} else if (operation === 'deleteFolder') {
					const folderId = this.getNodeParameter('folderId', i) as string;
					responseData = await replizApiRequest.call(this, 'DELETE', `/public/storage/folder/${folderId}`);
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

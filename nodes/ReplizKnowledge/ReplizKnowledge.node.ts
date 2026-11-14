import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { replizApiRequest } from '../GenericFunctions';

const knowledgeOperations = ['get', 'update', 'delete', 'addSource', 'getSource', 'updateSource', 'refreshSource', 'deleteSource'];
const sourceOperations = ['getSource', 'updateSource', 'refreshSource', 'deleteSource'];

function parseFaqs(raw: unknown): unknown[] {
	const value = typeof raw === 'string' ? (raw.trim() ? JSON.parse(raw) : []) : raw;
	if (!Array.isArray(value)) throw new Error('FAQs (JSON) must be an array of { "question", "answer" }');
	return value;
}

export class ReplizKnowledge implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Repliz Knowledge',
		name: 'replizKnowledge',
		icon: 'file:repliz.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Manage what the AI replies know about your business: texts, FAQs, website pages and files (Standard+)',
		defaults: { name: 'Repliz Knowledge' },
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
					{ name: 'Get All', value: 'getAll', description: 'Retrieve every knowledge, newest first', action: 'Get all knowledge' },
					{ name: 'Get', value: 'get', description: 'Retrieve a knowledge with its sources and where it is used', action: 'Get a knowledge' },
					{ name: 'Create', value: 'create', description: 'Create an empty knowledge', action: 'Create a knowledge' },
					{ name: 'Update', value: 'update', description: 'Change the name or description of a knowledge', action: 'Update a knowledge' },
					{ name: 'Delete', value: 'delete', description: 'Delete a knowledge and its sources, and take it out of every automation', action: 'Delete a knowledge' },
					{ name: 'Add Source', value: 'addSource', description: 'Add a text, FAQ, website page or file to a knowledge', action: 'Add a knowledge source' },
					{ name: 'Get Source', value: 'getSource', description: 'Retrieve a source with its full text or FAQs and its status', action: 'Get a knowledge source' },
					{ name: 'Update Source', value: 'updateSource', description: 'Rename a source, or change the text or FAQs it holds', action: 'Update a knowledge source' },
					{ name: 'Refresh Source', value: 'refreshSource', description: 'Read a website page source again', action: 'Refresh a knowledge source' },
					{ name: 'Delete Source', value: 'deleteSource', description: 'Delete a source from a knowledge', action: 'Delete a knowledge source' },
				],
				default: 'getAll',
			},
			{
				displayName: 'Knowledge ID',
				name: 'knowledgeId',
				type: 'string',
				required: true,
				displayOptions: { show: { operation: knowledgeOperations } },
				default: '',
				description: 'The _id of the knowledge from Get All. Use it in "knowledgeIds" of an AI reply in Repliz Account, Repliz Automation or Repliz Template Automation.',
			},
			{
				displayName: 'Source ID',
				name: 'sourceId',
				type: 'string',
				required: true,
				displayOptions: { show: { operation: sourceOperations } },
				default: '',
				description: 'The _id of a source, from the sources of Get or from Add Source',
			},
			// Create
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				required: true,
				displayOptions: { show: { operation: ['create'] } },
				default: '',
				placeholder: 'Product catalog',
				description: 'Name of the knowledge, up to 100 characters',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				displayOptions: { show: { operation: ['create'] } },
				default: '',
				description: 'What the knowledge is about, up to 500 characters',
			},
			// Update
			{
				displayName: 'Update Fields',
				name: 'updateFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { operation: ['update'] } },
				description: 'Fields left out keep their current value',
				options: [
					{ displayName: 'Name', name: 'name', type: 'string', default: '', description: 'The new name, up to 100 characters' },
					{ displayName: 'Description', name: 'description', type: 'string', default: '', description: 'The new description, up to 500 characters. Empty clears it.' },
				],
			},
			// Add Source
			{
				displayName: 'Source Type',
				name: 'sourceType',
				type: 'options',
				displayOptions: { show: { operation: ['addSource'] } },
				options: [
					{ name: 'Text', value: 'text', description: 'Text you write or paste, up to 200,000 characters' },
					{ name: 'FAQ', value: 'faq', description: 'Questions and answers' },
					{ name: 'Website Page', value: 'url', description: 'One public page, read once without its links' },
					{ name: 'File', value: 'file', description: 'A PDF, DOCX, TXT or MD of up to 10 MB uploaded with Repliz Storage' },
				],
				default: 'text',
			},
			{
				displayName: 'Source Name',
				name: 'sourceName',
				type: 'string',
				displayOptions: { show: { operation: ['addSource'] } },
				default: '',
				description: 'Optional name, cut to 60 characters. Left empty: the first line of the text, "FAQ", the file name or the page title.',
			},
			{
				displayName: 'Text',
				name: 'text',
				type: 'string',
				typeOptions: { rows: 6 },
				required: true,
				displayOptions: { show: { operation: ['addSource'], sourceType: ['text'] } },
				default: '',
				description: 'The text, up to 200,000 characters',
			},
			{
				displayName: 'FAQs (JSON)',
				name: 'faqsJson',
				type: 'json',
				required: true,
				displayOptions: { show: { operation: ['addSource'], sourceType: ['faq'] } },
				default: '[{"question":"Do you ship abroad?","answer":"Yes, to most countries."}]',
				description: 'An array of 1 to 300 { "question", "answer" }. Questions up to 500 characters, answers up to 5000.',
			},
			{
				displayName: 'URL',
				name: 'url',
				type: 'string',
				required: true,
				displayOptions: { show: { operation: ['addSource'], sourceType: ['url'] } },
				default: '',
				placeholder: 'https://example.com/shipping',
				description: 'A public http or https page. Use Refresh Source to read it again after it changes.',
			},
			{
				displayName: 'File ID',
				name: 'fileId',
				type: 'string',
				required: true,
				displayOptions: { show: { operation: ['addSource'], sourceType: ['file'] } },
				default: '',
				description: 'The ID of a file uploaded with Repliz Storage (Init File, upload, then Complete File). The file stays in storage after it is read.',
			},
			// Update Source
			{
				displayName: 'Update Fields',
				name: 'sourceUpdateFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { operation: ['updateSource'] } },
				description: 'A new Text or FAQs is read again, so the source goes back to "process". A source still in "process" cannot be changed.',
				options: [
					{ displayName: 'Name', name: 'name', type: 'string', default: '', description: 'The new name, cut to 60 characters' },
					{ displayName: 'Text', name: 'text', type: 'string', typeOptions: { rows: 6 }, default: '', description: 'The new text of a Text source' },
					{ displayName: 'FAQs (JSON)', name: 'faqsJson', type: 'json', default: '[]', description: 'Every question and answer of an FAQ source, replacing the current ones' },
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;
				const base = '/public/knowledge';
				let responseData: any;

				if (operation === 'getAll') {
					const response = await replizApiRequest.call(this, 'GET', base);
					responseData = response.docs || [];
				} else if (operation === 'create') {
					const name = this.getNodeParameter('name', i) as string;
					const description = this.getNodeParameter('description', i) as string;
					responseData = await replizApiRequest.call(this, 'POST', base, { name, ...(description ? { description } : {}) });
				} else {
					const knowledgeId = this.getNodeParameter('knowledgeId', i) as string;
					const knowledgePath = `${base}/${knowledgeId}`;

					if (operation === 'get') {
						responseData = await replizApiRequest.call(this, 'GET', knowledgePath);
					} else if (operation === 'update') {
						const fields = this.getNodeParameter('updateFields', i) as any;
						const current = await replizApiRequest.call(this, 'GET', knowledgePath);
						const body = {
							name: fields.name || current.knowledge.name,
							description: fields.description ?? current.knowledge.description ?? '',
						};
						await replizApiRequest.call(this, 'PUT', knowledgePath, body);
						responseData = await replizApiRequest.call(this, 'GET', knowledgePath);
					} else if (operation === 'delete') {
						await replizApiRequest.call(this, 'DELETE', knowledgePath);
						responseData = { success: true, knowledgeId };
					} else if (operation === 'addSource') {
						const type = this.getNodeParameter('sourceType', i) as string;
						const name = this.getNodeParameter('sourceName', i) as string;
						const body: any = { type, ...(name ? { name } : {}) };

						if (type === 'text') body.text = this.getNodeParameter('text', i) as string;
						if (type === 'faq') body.faqs = parseFaqs(this.getNodeParameter('faqsJson', i));
						if (type === 'url') body.url = this.getNodeParameter('url', i) as string;
						if (type === 'file') body.fileId = this.getNodeParameter('fileId', i) as string;

						responseData = await replizApiRequest.call(this, 'POST', `${knowledgePath}/source`, body);
					} else {
						const sourceId = this.getNodeParameter('sourceId', i) as string;
						const sourcePath = `${knowledgePath}/source/${sourceId}`;

						if (operation === 'getSource') {
							responseData = await replizApiRequest.call(this, 'GET', sourcePath);
						} else if (operation === 'updateSource') {
							const fields = this.getNodeParameter('sourceUpdateFields', i) as any;
							const body: any = {};
							if (fields.name) body.name = fields.name;
							if (fields.text !== undefined) body.text = fields.text;
							if (fields.faqsJson !== undefined) body.faqs = parseFaqs(fields.faqsJson);
							responseData = await replizApiRequest.call(this, 'PUT', sourcePath, body);
						} else if (operation === 'refreshSource') {
							responseData = await replizApiRequest.call(this, 'POST', `${sourcePath}/refresh`);
						} else if (operation === 'deleteSource') {
							await replizApiRequest.call(this, 'DELETE', sourcePath);
							responseData = { success: true, knowledgeId, sourceId };
						}
					}
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

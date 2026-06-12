import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { replizApiRequest } from '../GenericFunctions';

const GENRE_OPTIONS = [
	'ALL','ROCK','POP','LATIN','METAL','ELECTRONIC','HIP_HOP/RAP','ALTERNATIVE/INDIE','FOLK',
	'R&B/SOUL','COUNTRY','CLASSICAL','JAZZ','REGGAE','CHILDHOOD','BLUES','EASY_LISTENING',
	'NEW_AGE','WORLD_MUSIC','EXPERIMENTAL','DEVOTIONAL','K-POP','J-POP','EDM','LO-FI',
	'DANCE_POP','INDIE_POP','INDIE_ROCK','HOUSE','TECHNO','TRANCE','TRAP_RAP','FUTURE_BASS',
	'SYNTH_POP','SOUL','FUNK','DISCO','GOSPEL','AMBIENT','OTHERS',
].map(g => ({ name: g.replace(/_/g, ' '), value: g }));

export class ReplizAddon implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Repliz Addon',
		name: 'replizAddon',
		icon: 'file:repliz.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Access premium Repliz addons: TikTok trending music, Shopee products, and link metadata (Premium+)',
		defaults: { name: 'Repliz Addon' },
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
					{ name: 'Get TikTok Trending Music', value: 'getTrendingMusic', description: 'Retrieve trending music tracks from TikTok by genre and country', action: 'Get TikTok trending music' },
					{ name: 'Get Shopee Products', value: 'getShopeeProducts', description: 'Fetch product listings from a connected Shopee shop', action: 'Get Shopee products' },
					{ name: 'Get Link Metadata', value: 'getLinkMetadata', description: 'Extract preview metadata (title, description, image) from a URL', action: 'Get link metadata' },
				],
				default: 'getTrendingMusic',
			},
			// TikTok Trending Music
			{
				displayName: 'Genre',
				name: 'genre',
				type: 'options',
				required: true,
				displayOptions: { show: { operation: ['getTrendingMusic'] } },
				options: GENRE_OPTIONS,
				default: 'ALL',
				description: 'Music genre to filter trending tracks',
			},
			{
				displayName: 'Country Code',
				name: 'countryCode',
				type: 'string',
				required: true,
				displayOptions: { show: { operation: ['getTrendingMusic'] } },
				default: 'ID',
				placeholder: 'e.g. ID, US, GB, JP',
				description: 'ISO 3166-1 alpha-2 country code to filter trending music by region',
			},
			{
				displayName: 'Date Range',
				name: 'dateRange',
				type: 'options',
				required: true,
				displayOptions: { show: { operation: ['getTrendingMusic'] } },
				options: [
					{ name: 'Last 1 Day', value: '1DAY' },
					{ name: 'Last 7 Days', value: '7DAY' },
					{ name: 'Last 30 Days', value: '30DAY' },
					{ name: 'Last 90 Days', value: '90DAY' },
				],
				default: '7DAY',
				description: 'Time range for trending music data',
			},
			// Shopee Products
			{
				displayName: 'Account ID',
				name: 'accountId',
				type: 'string',
				required: true,
				displayOptions: { show: { operation: ['getShopeeProducts'] } },
				default: '',
				description: 'The Repliz account ID of the connected Shopee shop',
			},
			{
				displayName: 'Next Token',
				name: 'nextToken',
				type: 'string',
				displayOptions: { show: { operation: ['getShopeeProducts'] } },
				default: '',
				description: 'Pagination cursor from a previous response to fetch the next page',
			},
			// Link Metadata
			{
				displayName: 'URL',
				name: 'url',
				type: 'string',
				required: true,
				displayOptions: { show: { operation: ['getLinkMetadata'] } },
				default: '',
				placeholder: 'https://repliz.com',
				description: 'The target URL to extract metadata from',
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

				if (operation === 'getTrendingMusic') {
					const genre = this.getNodeParameter('genre', i) as string;
					const countryCode = this.getNodeParameter('countryCode', i) as string;
					const dateRange = this.getNodeParameter('dateRange', i) as string;
					responseData = await replizApiRequest.call(this, 'GET', '/public/tiktok/music', {}, { genre, countryCode, dateRange });
				} else if (operation === 'getShopeeProducts') {
					const accountId = this.getNodeParameter('accountId', i) as string;
					const nextToken = this.getNodeParameter('nextToken', i) as string;
					const qs: any = { accountId };
					if (nextToken) qs.nextToken = nextToken;
					responseData = await replizApiRequest.call(this, 'GET', '/public/shopee/product', {}, qs);
				} else if (operation === 'getLinkMetadata') {
					const url = this.getNodeParameter('url', i) as string;
					responseData = await replizApiRequest.call(this, 'GET', '/public/link/metadata', {}, { url });
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

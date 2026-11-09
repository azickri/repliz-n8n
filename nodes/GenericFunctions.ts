import {
	IExecuteFunctions,
	IHttpRequestOptions,
	IDataObject,
} from 'n8n-workflow';

export async function replizApiRequest(
	this: IExecuteFunctions,
	method: string,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<any> {
	const credentials = await this.getCredentials('replizApi');
	const baseUrl = (credentials.baseUrl as string || 'https://api.repliz.com').replace(/\/$/, '');
	const accessKey = credentials.accessKey as string;
	const secretKey = credentials.secretKey as string;
	const authHeader = 'Basic ' + Buffer.from(`${accessKey}:${secretKey}`).toString('base64');

	const options: IHttpRequestOptions = {
		method: method as any,
		url: `${baseUrl}${endpoint}`,
		headers: {
			Authorization: authHeader,
			'Content-Type': 'application/json',
		},
		qs,
		body: Object.keys(body).length ? body : undefined,
		json: true,
	};

	return this.helpers.httpRequest(options);
}

export async function replizApiRequestAllItems(
	this: IExecuteFunctions,
	method: string,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<any[]> {
	const results: any[] = [];
	let page = 1;

	while (true) {
		const response = await replizApiRequest.call(this, method, endpoint, body, { ...qs, page, limit: 100 });
		const docs = response.docs || [];
		results.push(...docs);
		if (!response.hasNextPage) break;
		page++;
	}

	return results;
}

export function replizButtons(items: any[]): IDataObject[] {
	return (items || []).map((btn: any) =>
		btn.type === 'postback'
			? { type: 'postback', title: btn.title, payload: btn.payload }
			: { type: 'web_url', title: btn.title, url: btn.url },
	);
}

export function replizQuickReply(text: string, items: any[]): IDataObject {
	return {
		text,
		buttons: (items || []).map((item: any) => ({ title: item.title, payload: item.payload })),
	};
}

export function replizCarousel(raw: unknown): IDataObject {
	const value = typeof raw === 'string' ? JSON.parse(raw || '[]') : raw;
	const elements = Array.isArray(value) ? value : (value as IDataObject)?.elements;
	return { elements: elements || [] };
}

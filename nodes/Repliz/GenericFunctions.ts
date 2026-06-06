import {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	IWebhookFunctions,
} from 'n8n-workflow';

export async function replizApiRequest(
	this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions | IWebhookFunctions,
	method: string,
	path: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<any> {
	const credentials = await this.getCredentials('replizApi');
	if (credentials === undefined) {
		throw new Error('No credentials found!');
	}

	const accessKey = credentials.accessKey as string;
	const secretKey = credentials.secretKey as string;
	const baseUrl = (credentials.baseUrl as string || 'https://api.repliz.com').replace(/\/$/, '');

	const authHeader = 'Basic ' + Buffer.from(`${accessKey}:${secretKey}`).toString('base64');

	const options: IDataObject = {
		headers: {
			'Authorization': authHeader,
			'Accept': 'application/json',
			'Content-Type': 'application/json',
		},
		method,
		url: `${baseUrl}${path}`,
		json: true,
	};

	if (Object.keys(body).length > 0) {
		options.body = body;
	}

	if (Object.keys(qs).length > 0) {
		options.qs = qs;
	}

	try {
		return await this.helpers.httpRequest(options as any);
	} catch (error) {
		throw error;
	}
}

export async function replizApiRequestAllItems(
	this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions | IWebhookFunctions,
	method: string,
	path: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<any[]> {
	const returnData: any[] = [];
	let page = 1;
	const limit = 50;
	let hasNextPage = true;

	while (hasNextPage) {
		const response = await replizApiRequest.call(this, method, path, body, {
			...qs,
			page,
			limit,
		});

		if (response && response.docs && Array.isArray(response.docs)) {
			returnData.push(...response.docs);
			hasNextPage = response.hasNextPage === true;
			page++;
		} else {
			if (Array.isArray(response)) {
				return response;
			}
			return [response];
		}
	}

	return returnData;
}

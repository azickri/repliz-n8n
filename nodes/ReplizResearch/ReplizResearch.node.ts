import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';
import { replizApiRequest } from '../GenericFunctions';

const tiktokOperations = [
  'searchTikTokHashtag',
  'searchTikTokVideo',
  'searchTikTokPhoto',
  'searchTikTokContentByUser',
  'listTikTokComments',
  'listTikTokCommentReplies',
];

export class ReplizResearch implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Repliz Research',
    name: 'replizResearch',
    icon: 'file:repliz.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description:
      'Research and discover content and users from social media platforms via Repliz (Gold+)',
    defaults: { name: 'Repliz Research' },
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
            name: 'List TikTok Comment Replies',
            value: 'listTikTokCommentReplies',
            description: 'List the replies to a comment on a TikTok post (TikWM key)',
            action: 'List TikTok comment replies',
          },
          {
            name: 'List TikTok Comments',
            value: 'listTikTokComments',
            description: 'List the comments of a public TikTok post (TikWM key)',
            action: 'List TikTok comments',
          },
          {
            name: 'Search Threads Content by Keyword',
            value: 'searchThreadsContent',
            description: 'Search Threads posts by a keyword or hashtag',
            action: 'Search Threads content by keyword',
          },
          {
            name: 'Search Threads Content by User',
            value: 'searchThreadsContentByUser',
            description:
              "Retrieve all posts from a specific Threads user's profile",
            action: "Search Threads content by user's profile",
          },
          {
            name: 'Search Threads User',
            value: 'searchThreadsUser',
            description: 'Look up a Threads user profile by username',
            action: 'Search Threads user profile',
          },
          {
            name: 'Search TikTok Content by User',
            value: 'searchTikTokContentByUser',
            description:
              'List the public posts of a TikTok user by username (TikWM key)',
            action: 'Search TikTok content by user',
          },
          {
            name: 'Search TikTok Hashtags',
            value: 'searchTikTokHashtag',
            description: 'Search TikTok hashtags by keyword (TikWM key)',
            action: 'Search TikTok hashtags',
          },
          {
            name: 'Search TikTok Photo Posts',
            value: 'searchTikTokPhoto',
            description: 'Search public TikTok photo posts by keyword (TikWM key)',
            action: 'Search TikTok photo posts',
          },
          {
            name: 'Search TikTok Videos',
            value: 'searchTikTokVideo',
            description: 'Search public TikTok videos by keyword (TikWM key)',
            action: 'Search TikTok videos',
          },
        ],
        default: 'searchThreadsContent',
      },
      {
        displayName:
          'TikTok research runs through TikWM with the TikWM API key saved in Repliz (Setting → TikWM key). Without one, the request fails with "invalid tikwm key".',
        name: 'tikwmNotice',
        type: 'notice',
        default: '',
        displayOptions: { show: { operation: tiktokOperations } },
      },
      // Shared: Account ID
      {
        displayName: 'Account ID',
        name: 'accountId',
        type: 'string',
        required: true,
        displayOptions: {
          show: {
            operation: [
              'searchThreadsContent',
              'searchThreadsContentByUser',
              'searchThreadsUser',
            ],
          },
        },
        default: '',
        description:
          'The ID of your connected Threads account used to perform the research',
      },
      // Search Threads Content by Keyword
      {
        displayName: 'Search Keyword',
        name: 'search',
        type: 'string',
        required: true,
        displayOptions: { show: { operation: ['searchThreadsContent'] } },
        default: '',
        placeholder: 'e.g. digital marketing',
        description: 'The keyword or hashtag to search for in Threads posts',
      },
      {
        displayName: 'Next Token',
        name: 'nextToken',
        type: 'string',
        displayOptions: { show: { operation: ['searchThreadsContent'] } },
        default: '',
        description:
          'Pagination cursor token from a previous response to fetch the next page of results',
      },
      {
        displayName: 'Filters',
        name: 'filters',
        type: 'collection',
        placeholder: 'Add Filter',
        default: {},
        displayOptions: { show: { operation: ['searchThreadsContent'] } },
        options: [
          {
            displayName: 'Author Username',
            name: 'username',
            type: 'string',
            default: '',
            placeholder: 'e.g. replizofficial',
            description: 'Filter posts by specific author Threads username',
          },
          {
            displayName: 'Media Type',
            name: 'type',
            type: 'options',
            options: [
              { name: 'All', value: '' },
              { name: 'Image', value: 'IMAGE' },
              { name: 'Text', value: 'TEXT' },
              { name: 'Video', value: 'VIDEO' },
            ],
            default: '',
            description: 'Filter content by media type',
          },
          {
            displayName: 'Mode',
            name: 'mode',
            type: 'options',
            options: [
              { name: 'Keyword', value: 'KEYWORD' },
              { name: 'Tag', value: 'TAG' },
            ],
            default: 'KEYWORD',
            description:
              'Search mode: keyword search or hashtag/topic tag search',
          },
          {
            displayName: 'Since (Unix Timestamp)',
            name: 'since',
            type: 'number',
            default: 0,
            description:
              'Start date/time as a Unix timestamp in seconds (must be used together with Until)',
          },
          {
            displayName: 'Sort',
            name: 'sort',
            type: 'options',
            options: [
              { name: 'Top', value: 'TOP' },
              { name: 'Recent', value: 'RECENT' },
            ],
            default: 'TOP',
            description: 'Sort posts by top/relevance or most recent',
          },
          {
            displayName: 'Until (Unix Timestamp)',
            name: 'until',
            type: 'number',
            default: 0,
            description:
              'End date/time as a Unix timestamp in seconds (must be used together with Since)',
          },
        ],
      },
      // Search Threads Content by User / Search Threads User
      {
        displayName: 'Username',
        name: 'username',
        type: 'string',
        required: true,
        displayOptions: {
          show: {
            operation: ['searchThreadsContentByUser', 'searchThreadsUser'],
          },
        },
        default: '',
        placeholder: 'e.g. meta',
        description: "The Threads username to look up (without the '@' prefix)",
      },
      {
        displayName: 'Next Token',
        name: 'nextToken',
        type: 'string',
        displayOptions: { show: { operation: ['searchThreadsContentByUser'] } },
        default: '',
        description:
          'Pagination cursor token from a previous response to fetch the next page of results',
      },
      // TikTok: keyword searches
      {
        displayName: 'Keywords',
        name: 'keywords',
        type: 'string',
        required: true,
        displayOptions: {
          show: {
            operation: [
              'searchTikTokHashtag',
              'searchTikTokVideo',
              'searchTikTokPhoto',
            ],
          },
        },
        default: '',
        placeholder: 'e.g. cat',
        description: 'The keyword to search for on TikTok',
      },
      {
        displayName: 'Filters',
        name: 'tiktokFilters',
        type: 'collection',
        placeholder: 'Add Filter',
        default: {},
        displayOptions: { show: { operation: ['searchTikTokVideo'] } },
        options: [
          {
            displayName: 'Publish Time',
            name: 'publishTime',
            type: 'options',
            options: [
              { name: 'Any Time', value: 0 },
              { name: 'Last 24 Hours', value: 1 },
              { name: 'Last 7 Days', value: 7 },
              { name: 'Last 30 Days', value: 30 },
              { name: 'Last 90 Days', value: 90 },
              { name: 'Last 180 Days', value: 180 },
            ],
            default: 0,
            description: 'Only videos published within this period',
          },
          {
            displayName: 'Sort',
            name: 'sortType',
            type: 'options',
            options: [
              { name: 'Relevance', value: 0 },
              { name: 'Most Liked', value: 1 },
              { name: 'Newest', value: 3 },
            ],
            default: 0,
            description: 'Sort videos by relevance, likes, or publish date',
          },
        ],
      },
      // TikTok: content by user
      {
        displayName: 'Username',
        name: 'uniqueId',
        type: 'string',
        required: true,
        displayOptions: { show: { operation: ['searchTikTokContentByUser'] } },
        default: '',
        placeholder: 'e.g. tiktok',
        description: "The TikTok username whose posts to list (without the '@' prefix)",
      },
      // TikTok: comments
      {
        displayName: 'Post ID',
        name: 'videoId',
        type: 'string',
        required: true,
        displayOptions: {
          show: {
            operation: ['listTikTokComments', 'listTikTokCommentReplies'],
          },
        },
        default: '',
        placeholder: 'e.g. 7612965843596479751',
        description:
          'The ID of the TikTok post, the "id" from the TikTok search operations',
      },
      {
        displayName: 'Comment ID',
        name: 'commentId',
        type: 'string',
        required: true,
        displayOptions: { show: { operation: ['listTikTokCommentReplies'] } },
        default: '',
        description: 'The ID of the comment whose replies to list',
      },
      {
        displayName: 'Next Token',
        name: 'nextToken',
        type: 'string',
        displayOptions: { show: { operation: tiktokOperations } },
        default: '',
        description:
          'Pagination cursor token from a previous response to fetch the next page of results',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      try {
        const operation = this.getNodeParameter('operation', i) as string;
        const accountId = this.getNodeParameter('accountId', i, '') as string;
        let responseData: any;

        if (operation === 'searchThreadsContent') {
          const search = this.getNodeParameter('search', i) as string;
          const nextToken = this.getNodeParameter('nextToken', i, '') as string;
          const filters = this.getNodeParameter('filters', i, {}) as any;
          const qs: any = { accountId, search };
          if (nextToken) qs.nextToken = nextToken;
          if (filters.sort) qs.sort = filters.sort;
          if (filters.mode) qs.mode = filters.mode;
          if (filters.type) qs.type = filters.type;
          if (filters.since) qs.since = filters.since;
          if (filters.until) qs.until = filters.until;
          if (filters.username) qs.username = filters.username;
          responseData = await replizApiRequest.call(
            this,
            'GET',
            '/public/research/threads/content/search',
            {},
            qs,
          );
        } else if (operation === 'searchThreadsContentByUser') {
          const username = this.getNodeParameter('username', i) as string;
          const nextToken = this.getNodeParameter('nextToken', i) as string;
          const qs: any = { accountId, username };
          if (nextToken) qs.nextToken = nextToken;
          responseData = await replizApiRequest.call(
            this,
            'GET',
            '/public/research/threads/content/user',
            {},
            qs,
          );
        } else if (operation === 'searchThreadsUser') {
          const username = this.getNodeParameter('username', i) as string;
          responseData = await replizApiRequest.call(
            this,
            'GET',
            '/public/research/threads/user',
            {},
            { accountId, username },
          );
        } else if (tiktokOperations.includes(operation)) {
          const nextToken = this.getNodeParameter('nextToken', i, '') as string;
          let path = '';
          const qs: any = {};

          if (operation === 'searchTikTokHashtag') {
            path = '/public/research/tiktok/hashtag/search';
            qs.keywords = this.getNodeParameter('keywords', i) as string;
          } else if (operation === 'searchTikTokVideo') {
            path = '/public/research/tiktok/content/video';
            qs.keywords = this.getNodeParameter('keywords', i) as string;
            const filters = this.getNodeParameter('tiktokFilters', i, {}) as any;
            if (filters.publishTime !== undefined) {
              qs.publishTime = filters.publishTime;
            }
            if (filters.sortType !== undefined) qs.sortType = filters.sortType;
          } else if (operation === 'searchTikTokPhoto') {
            path = '/public/research/tiktok/content/photo';
            qs.keywords = this.getNodeParameter('keywords', i) as string;
          } else if (operation === 'searchTikTokContentByUser') {
            path = '/public/research/tiktok/content/user';
            qs.uniqueId = this.getNodeParameter('uniqueId', i) as string;
          } else if (operation === 'listTikTokComments') {
            path = '/public/research/tiktok/comment';
            qs.videoId = this.getNodeParameter('videoId', i) as string;
          } else {
            path = '/public/research/tiktok/comment/reply';
            qs.videoId = this.getNodeParameter('videoId', i) as string;
            qs.commentId = this.getNodeParameter('commentId', i) as string;
          }

          if (nextToken) qs.nextToken = nextToken;
          responseData = await replizApiRequest.call(this, 'GET', path, {}, qs);
        }

        returnData.push(...this.helpers.returnJsonArray(responseData));
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({ json: { error: (error as Error).message } });
          continue;
        }
        throw error;
      }
    }
    return [returnData];
  }
}

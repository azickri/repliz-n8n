import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';
import {
  replizApiRequest,
  replizApiRequestAllItems,
} from '../GenericFunctions';

export class ReplizSchedule implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Repliz Schedule',
    name: 'replizSchedule',
    icon: 'file:repliz.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description:
      'Create and manage scheduled social media posts in Repliz (Premium+)',
    defaults: { name: 'Repliz Schedule' },
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
            name: 'Get All',
            value: 'getAll',
            description: 'Retrieve all scheduled posts',
            action: 'Get all schedules',
          },
          {
            name: 'Get',
            value: 'get',
            description: 'Retrieve detailed info of a specific schedule',
            action: 'Get a schedule',
          },
          {
            name: 'Create',
            value: 'create',
            description: 'Create a new scheduled post',
            action: 'Create a schedule',
          },
          {
            name: 'Update',
            value: 'update',
            description: 'Update an existing scheduled post',
            action: 'Update a schedule',
          },
          {
            name: 'Delete',
            value: 'delete',
            description: 'Delete a single scheduled post',
            action: 'Delete a schedule',
          },
          {
            name: 'Delete Many',
            value: 'deleteMany',
            description: 'Delete multiple scheduled posts at once',
            action: 'Delete many schedules',
          },
          {
            name: 'Retry',
            value: 'retry',
            description:
              'Retry a failed scheduled post, or only the failed reply of a thread whose main post is published',
            action: 'Retry a schedule',
          },
        ],
        default: 'getAll',
      },
      // Get All
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
        description: 'Max number of results to return',
      },
      {
        displayName: 'Filters',
        name: 'filters',
        type: 'collection',
        placeholder: 'Add Filter',
        default: {},
        displayOptions: { show: { operation: ['getAll'] } },
        options: [
          {
            displayName: 'Status',
            name: 'status',
            type: 'options',
            options: [
              { name: 'Pending', value: 'pending' },
              { name: 'Process', value: 'process' },
              { name: 'Error', value: 'error' },
              { name: 'Success', value: 'success' },
            ],
            default: '',
            description: 'Filter by schedule status',
          },
          {
            displayName: 'Account IDs',
            name: 'accountIds',
            type: 'string',
            default: '',
            placeholder: 'id1,id2,id3',
            description: 'Comma-separated list of account IDs',
          },
          {
            displayName: 'From Date',
            name: 'fromDate',
            type: 'dateTime',
            default: '',
            description: 'Start date filter (ISO 8601 format)',
          },
          {
            displayName: 'To Date',
            name: 'toDate',
            type: 'dateTime',
            default: '',
            description: 'End date filter (ISO 8601 format)',
          },
        ],
      },
      // Get / Delete / Retry
      {
        displayName: 'Schedule ID',
        name: 'scheduleId',
        type: 'string',
        required: true,
        displayOptions: {
          show: { operation: ['get', 'update', 'delete', 'retry'] },
        },
        default: '',
        description: 'The unique identifier of the schedule',
      },
      // Delete Many
      {
        displayName: 'Schedule IDs',
        name: 'scheduleIds',
        type: 'string',
        required: true,
        displayOptions: { show: { operation: ['deleteMany'] } },
        default: '',
        placeholder: 'id1,id2,id3',
        description: 'Comma-separated list of schedule IDs to delete',
      },
      // Create
      {
        displayName: 'Account ID',
        name: 'accountId',
        type: 'string',
        required: true,
        displayOptions: { show: { operation: ['create'] } },
        default: '',
        description: 'The connected account ID to publish the post from',
      },
      {
        displayName: 'Schedule At',
        name: 'scheduleAt',
        type: 'dateTime',
        required: true,
        displayOptions: { show: { operation: ['create', 'update'] } },
        default: '',
        description: 'The date and time to publish the post (ISO 8601 format)',
      },
      {
        displayName: 'Title',
        name: 'title',
        type: 'string',
        displayOptions: { show: { operation: ['create', 'update'] } },
        default: '',
        description: 'Optional title for the post (used by YouTube videos and as the Pinterest pin title, max 100 characters)',
      },
      {
        displayName: 'Description / Caption',
        name: 'description',
        type: 'string',
        typeOptions: { rows: 4 },
        displayOptions: { show: { operation: ['create', 'update'] } },
        default: '',
        description: 'The main caption or description of the post',
      },
      {
        displayName: 'Topic',
        name: 'topic',
        type: 'string',
        displayOptions: { show: { operation: ['create', 'update'] } },
        default: '',
        description: 'Optional topic or category tag for this post',
      },
      {
        displayName: 'Post Type',
        name: 'postType',
        type: 'options',
        required: true,
        displayOptions: { show: { operation: ['create', 'update'] } },
        options: [
          { name: 'Text', value: 'text' },
          { name: 'Image', value: 'image' },
          { name: 'Video', value: 'video' },
          { name: 'Reel', value: 'reel' },
          { name: 'Album', value: 'album' },
          { name: 'Link', value: 'link' },
          { name: 'Story', value: 'story' },
        ],
        default: 'text',
        description: 'The type of post to publish',
      },
      {
        displayName: 'Share to Feed (Instagram)',
        name: 'isShareToFeed',
        type: 'boolean',
        displayOptions: {
          show: {
            operation: ['create', 'update'],
            postType: ['video'],
          },
        },
        default: false,
        description:
          'Whether to share the video to Instagram feed. Specifically applies to Instagram schedules with post type video.',
      },
      {
        displayName: 'Privacy (YouTube)',
        name: 'privacy',
        type: 'options',
        displayOptions: {
          show: {
            operation: ['create', 'update'],
            postType: ['video'],
          },
        },
        options: [
          { name: 'Public', value: 'public' },
          { name: 'Unlisted', value: 'unlisted' },
          { name: 'Private', value: 'private' },
        ],
        default: 'public',
        description:
          'Who can watch the video. Specifically applies to YouTube schedules with post type video. Unlisted videos can be watched only by link, private videos only by the channel owner. Private videos are not listed in Repliz Content, so their automation and statistics do not run.',
      },
      {
        displayName: 'Trial Reel (Instagram)',
        name: 'graduationStrategy',
        type: 'options',
        displayOptions: {
          show: {
            operation: ['create', 'update'],
            postType: ['video'],
          },
        },
        options: [
          { name: 'Off', value: '' },
          { name: 'Manual', value: 'MANUAL' },
          { name: 'Automatic (Performance)', value: 'SS_PERFORMANCE' },
        ],
        default: '',
        description:
          'Post the Reel as a trial reel, shown to non-followers first. Specifically applies to Instagram schedules with post type video. Manual: you share it with your followers from the Instagram app. Automatic (Performance): Instagram shares it with your followers if it performs well. Sent as additionalInfo.trialParams.graduationStrategy.',
      },
      {
        displayName: 'Text Attachment (Threads)',
        name: 'textAttachment',
        type: 'string',
        typeOptions: { rows: 6 },
        displayOptions: {
          show: {
            operation: ['create', 'update'],
            postType: ['text'],
          },
        },
        default: '',
        description:
          'A long text, up to 10,000 characters, attached under the post and opened like an article. Specifically applies to Threads schedules with post type text, on the main post. A text reply can have its own in Replies (JSON). Posted as plain text. Leave empty for no attachment. Sent as additionalInfo.textAttachment.text.',
      },
      {
        displayName: 'Text Attachment Link (Threads)',
        name: 'textAttachmentLink',
        type: 'string',
        displayOptions: {
          show: {
            operation: ['create', 'update'],
            postType: ['text'],
          },
        },
        default: '',
        description:
          'Optional link shown at the end of the text attachment. A Threads post can have at most 5 links, counting the ones in the caption. Sent as additionalInfo.textAttachment.link.',
      },
      {
        displayName: 'WhatsApp / Telegram Channel / Pinterest Board (JSON)',
        name: 'channelJson',
        type: 'json',
        displayOptions: {
          show: {
            operation: ['create', 'update'],
            postType: ['text', 'image', 'video', 'album'],
          },
        },
        default: '{}',
        description:
          'Specifically applies to WhatsApp, Telegram and Pinterest schedules. The channel, group or board to post to, as returned by Repliz Addon > Get WhatsApp Channels / Get Telegram Channels / Get Pinterest Boards: { "id": "...", "name": "...", "picture": "...", "type": "channel"|"group"|"board" }. "type" is required for Telegram and Pinterest. Sent as additionalInfo.channel. Leave {} to post as WhatsApp Status / Telegram Story; Pinterest always needs a board.',
      },
      {
        displayName: 'Template ID',
        name: 'templateId',
        type: 'string',
        displayOptions: { show: { operation: ['create', 'update'] } },
        default: '',
        description: 'Optional automation template ID to attach to this post',
      },
      {
        displayName: 'Medias (JSON)',
        name: 'mediasJson',
        type: 'json',
        displayOptions: { show: { operation: ['create', 'update'] } },
        default: '[]',
        description:
          'Array of media objects. Each item: { "type": "image"|"video", "url": "...", "thumbnail": "...", "alt": "..." }',
      },
      {
        displayName: 'Link Meta (JSON)',
        name: 'metaJson',
        type: 'json',
        displayOptions: { show: { operation: ['create', 'update'] } },
        default: '{"title":"","description":"","url":""}',
        description:
          'Link preview metadata: { "title": "...", "description": "...", "url": "..." }',
      },
      {
        displayName: 'Additional Info (JSON)',
        name: 'additionalInfoJson',
        type: 'json',
        displayOptions: { show: { operation: ['create', 'update'] } },
        default:
          '{"isAiGenerated":false,"isDraft":false,"isAutoAddMusic":false,"link":"","targetCountries":[],"tags":[],"mentions":[],"collaborators":[],"products":[],"music":{}}',
        description:
          'Extra metadata: isAiGenerated (AI label: TikTok and YouTube video, Facebook reel, Pinterest, Threads post and its replies), isAutoAddMusic, isShareToFeed (Instagram video), privacy (YouTube video: public, unlisted or private), trialParams (Instagram video: { "graduationStrategy": "MANUAL"|"SS_PERFORMANCE" }), link (Pinterest destination URL), textAttachment (Threads text: { "text": "...", "link": "..." }), targetCountries, tags, mentions, collaborators, music (with volume: video, music), products',
      },
      {
        displayName: 'Replies (JSON)',
        name: 'repliesJson',
        type: 'json',
        displayOptions: { show: { operation: ['create', 'update'] } },
        default: '[]',
        description:
          'Array of reply posts for a Threads or X thread, in order: [{ "type": "text", "description": "...", "delay": 100, "textAttachment": { "text": "...", "link": "" } }]. delay is the minutes a reply waits after the post before it (0 or left out posts it right away). It can\'t be less than the delay of the reply before it, and all delays together can\'t exceed 1440 (24 hours). textAttachment is optional, for Threads text replies only: a long text, up to 10,000 characters, attached under the reply like an article.',
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

        if (operation === 'getAll') {
          const returnAll = this.getNodeParameter('returnAll', i) as boolean;
          const filters = this.getNodeParameter('filters', i) as any;
          const qs: any = {};
          if (filters.status) qs.status = filters.status;
          if (filters.fromDate) qs.fromDate = filters.fromDate;
          if (filters.toDate) qs.toDate = filters.toDate;
          if (filters.accountIds)
            qs.accountIds = filters.accountIds
              .split(',')
              .map((s: string) => s.trim())
              .filter(Boolean);

          if (returnAll) {
            responseData = await replizApiRequestAllItems.call(
              this,
              'GET',
              '/public/schedule',
              {},
              qs,
            );
          } else {
            const limit = this.getNodeParameter('limit', i) as number;
            const res = await replizApiRequest.call(
              this,
              'GET',
              '/public/schedule',
              {},
              { ...qs, page: 1, limit },
            );
            responseData = res;
          }
        } else if (operation === 'get') {
          const scheduleId = this.getNodeParameter('scheduleId', i) as string;
          responseData = await replizApiRequest.call(
            this,
            'GET',
            `/public/schedule/${scheduleId}`,
          );
        } else if (operation === 'create' || operation === 'update') {
          const scheduleAt = this.getNodeParameter('scheduleAt', i) as string;
          const title = this.getNodeParameter('title', i) as string;
          const description = this.getNodeParameter('description', i) as string;
          const topic = this.getNodeParameter('topic', i) as string;
          const type = this.getNodeParameter('postType', i) as string;
          const templateId = this.getNodeParameter('templateId', i) as string;
          const mediasRaw = this.getNodeParameter('mediasJson', i);
          const metaRaw = this.getNodeParameter('metaJson', i);
          const additionalInfoRaw = this.getNodeParameter(
            'additionalInfoJson',
            i,
          );
          const repliesRaw = this.getNodeParameter('repliesJson', i);

          const medias =
            typeof mediasRaw === 'string' ? JSON.parse(mediasRaw) : mediasRaw;
          const meta =
            typeof metaRaw === 'string' ? JSON.parse(metaRaw) : metaRaw;
          const additionalInfo =
            typeof additionalInfoRaw === 'string'
              ? JSON.parse(additionalInfoRaw)
              : additionalInfoRaw || {};
          const replies =
            typeof repliesRaw === 'string'
              ? JSON.parse(repliesRaw)
              : repliesRaw;

          if (type === 'video') {
            const isShareToFeed = this.getNodeParameter(
              'isShareToFeed',
              i,
              false,
            ) as boolean;
            additionalInfo.isShareToFeed = isShareToFeed;

            const privacy = this.getNodeParameter(
              'privacy',
              i,
              'public',
            ) as string;
            additionalInfo.privacy = privacy;

            const graduationStrategy = this.getNodeParameter(
              'graduationStrategy',
              i,
              '',
            ) as string;
            additionalInfo.trialParams = { graduationStrategy };
          }

          if (type === 'text') {
            const textAttachment = this.getNodeParameter(
              'textAttachment',
              i,
              '',
            ) as string;
            if (textAttachment) {
              const textAttachmentLink = this.getNodeParameter(
                'textAttachmentLink',
                i,
                '',
              ) as string;
              additionalInfo.textAttachment = {
                text: textAttachment,
                link: textAttachmentLink,
              };
            }
          }

          if (['text', 'image', 'video', 'album'].includes(type)) {
            const channelRaw = this.getNodeParameter('channelJson', i, '{}');
            const channel =
              typeof channelRaw === 'string'
                ? JSON.parse(channelRaw || '{}')
                : channelRaw;
            if (channel?.id) {
              // WhatsApp ids carry their type, Telegram channel and group ids and Pinterest board ids don't
              let channelType = channel.type;
              if (!channelType && channel.id.endsWith('@g.us')) channelType = 'group';
              if (!channelType && channel.id.endsWith('@newsletter')) channelType = 'channel';
              if (!channelType) {
                throw new Error(
                  'Channel "type" ("channel", "group" or "board") is required for Telegram channels and Pinterest boards',
                );
              }

              additionalInfo.channel = {
                id: channel.id,
                name: channel.name || '',
                picture: channel.picture || '',
                type: channelType,
              };
            }
          }

          const body: any = {
            scheduleAt,
            title,
            description,
            topic,
            type,
            medias,
            meta,
            additionalInfo,
            replies,
          };
          if (templateId) body.templateId = templateId;

          if (operation === 'create') {
            body.accountId = this.getNodeParameter('accountId', i) as string;
            responseData = await replizApiRequest.call(
              this,
              'POST',
              '/public/schedule',
              body,
            );
          } else {
            const scheduleId = this.getNodeParameter('scheduleId', i) as string;
            responseData = await replizApiRequest.call(
              this,
              'PUT',
              `/public/schedule/${scheduleId}`,
              body,
            );
          }
        } else if (operation === 'delete') {
          const scheduleId = this.getNodeParameter('scheduleId', i) as string;
          responseData = await replizApiRequest.call(
            this,
            'DELETE',
            `/public/schedule/${scheduleId}`,
          );
        } else if (operation === 'deleteMany') {
          const scheduleIds = (
            this.getNodeParameter('scheduleIds', i) as string
          )
            .split(',')
            .map((s: string) => s.trim())
            .filter(Boolean);
          responseData = await replizApiRequest.call(
            this,
            'DELETE',
            '/public/schedule/mass',
            {},
            { scheduleIds },
          );
        } else if (operation === 'retry') {
          const scheduleId = this.getNodeParameter('scheduleId', i) as string;
          responseData = await replizApiRequest.call(
            this,
            'PUT',
            `/public/schedule/${scheduleId}/retry`,
          );
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

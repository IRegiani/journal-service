const { CUSTOM_HEADERS } = require('../../utils/constants');

module.exports = ({
    creationDate: {
        name: CUSTOM_HEADERS.creationDate,
        in: 'header',
        description: 'The original file creation date (if available), custom header',
        schema: {
            type: 'string',
            format: 'date-time',
            example: '2021-05-05T00:44:10.714Z',
        },
    },
    range: {
        name: 'range',
        in: 'header',
        description: 'Indicates a part of the document to return. If not present the whole document is returned. Format: `<unit>=<range-start>-<range-end>`',
        schema: {
            type: 'string',
            example: 'bytes=0-499',
        },
    },

    // Responses

    totalCount: {
        name: 'total-count',
        description: 'The total amount of resources available to query',
        schema: { type: 'integer' },
    },
    totalPages: {
        name: 'total-pages',
        description: 'The total number of pages considering the limit query parameter',
        schema: { type: 'integer' },
    },
    previousOffset: {
        name: 'prev-offset',
        description: 'The necessary offset query parameter in order to get the previous set of resources, considering the same limit and input query',
        schema: { type: 'integer' },
    },
    nextOffset: {
        name: 'next-offset',
        description: 'The necessary offset query parameter in order to get the next set of resources, considering the same limit and input query',
        schema: { type: 'integer' },
    },
    acceptRanges: {
        name: 'accept-ranges',
        description: 'Signals that partial requests are supported, in the specified unit to define the range',
        schema: { type: 'string', enum: ['bytes'], example: 'bytes' },
    },
    contentDisposition: {
        name: 'content-disposition',
        description: 'Informs the filename when a file is downloaded',
        schema: { type: 'string', example: 'attachment; filename="test.txt"' },
    },
    contentRange: {
        name: 'content-range',
        description: 'Indicates where in a full body message a partial message belongs.\n\nFormat: `<unit> <range-start>-<range-end>/<size>`',
        schema: { type: 'string', example: 'bytes 200-1000/67589' },
    },
    mediaInfo: {
        name: CUSTOM_HEADERS.mediaInfo,
        description: 'Custom header with a summary of codec, duration and encoded date.\n\nFormat: `<codec>,<durationSeconds>,<encodedUTCDate>`',
        schema: { type: 'string', example: 'AVC,5316.800,UTC 2019-05-21 00:34:26' },
    },
});

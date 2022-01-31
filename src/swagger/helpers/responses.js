const { getReasonPhrase, StatusCodes } = require('http-status-codes');

const { headerParameters } = require('../parameters');
const { CUSTOM_RESPONSES } = require('../../utils/constants');

class ResponseBuilder {
    constructor(responseCode) {
        this.code = responseCode;
        // eslint-disable-next-line security/detect-object-injection
        this.description = CUSTOM_RESPONSES.DESCRIPTION[responseCode] || getReasonPhrase(responseCode);
    }

    withDescription(description) {
        this.description = description;
        return this;
    }

    withJsonContent(schema) {
        this.content = { 'application/json': schema };
        return this;
    }

    withMessage(message) {
        this.description = CUSTOM_RESPONSES.DESCRIPTION[this.code] ? this.description : message;
        this.content = {
            ...this.content,
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            example: message,
                        },
                    },
                },
            },
        };

        return this;
    }

    withPagination() {
        this.headers = {
            ...this.headers,
            'total-count': headerParameters.totalCount,
            'total-pages': headerParameters.totalPages,
            'prev-offset': headerParameters.previousOffset,
            'next-offset': headerParameters.nextOffset,
        };
        return this;
    }

    withCustomContent(content) {
        this.content = content;
        return this;
    }

    withHeaders(headerArray) {
        const extraHeaders = headerArray.reduce((acc, header) => ({ ...acc, [header.name]: header }), {});
        this.headers = {
            ...this.headers,
            ...extraHeaders,
        };
        return this;
    }
}

// TODO: Add forbidden and unauthorized when auth is available
const defaultResponses = { [StatusCodes.INTERNAL_SERVER_ERROR]: new ResponseBuilder(StatusCodes.INTERNAL_SERVER_ERROR) };

module.exports = {
    buildResponse: (code) => new ResponseBuilder(code),
    organizeResponses: (...arr) => arr.reduce((acc, response) => ({ ...acc, [response.code]: response }), defaultResponses),
};

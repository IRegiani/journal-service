// this should use 'onyOf' in items....
module.exports = () => ({
    schema: {
        type: 'array',
        items: {
            type: 'object',
            properties: {
                '@type': {
                    type: 'string',
                    example: 'General',
                    enum: ['General', 'Audio', 'Video'],
                },
                Format: {
                    type: 'string',
                    example: 'MPEG Audio',
                    enum: ['MPEG Audio', 'MPEG-4', 'AVC', 'HEVC'],
                },
                FrameRate: {
                    type: 'string',
                    example: '30.000',
                },
                Encoded_Date: {
                    type: 'string',
                    example: 'UTC 2019-05-21 00:34:26',
                },
                Encoded_Library: {
                    type: 'string',
                    example: 'iTunes 10.5.3.3',
                },
                Title: {
                    type: 'string',
                    example: 'ISO Media file produced by Google Inc.',
                },
                Duration: {
                    type: 'string',
                    example: '1605',
                },
                BitRate: {
                    type: 'string',
                    example: '47874930',
                },
                OverallBitRate_Mode: {
                    type: 'string',
                    example: 'VBR',
                },
                Width: {
                    type: 'string',
                    example: '1920',
                },
                Height: {
                    type: 'string',
                    example: '1080',
                },
                ChromaSubsampling: {
                    type: 'string',
                    example: '4:2:0',
                },
                FrameRate_Mode: {
                    type: 'string',
                    enum: ['VFR', 'CFR'],
                    example: 'VFR',
                },
                ColorSpace: {
                    type: 'string',
                    example: 'YUV',
                },
                BitDepth: {
                    type: 'string',
                    example: '8',
                },
                ChannelPositions: {
                    type: 'string',
                    example: 'Front: L R',
                },
                extra: {
                    type: 'object',
                    properties: {
                        xyz: {
                            type: 'string',
                            example: '-23.5467-46.6368',
                            description: 'Where the video was recorded',
                        },
                        com_android_version: {
                            type: 'string',
                            example: '10',
                            description: 'Android version',
                        },
                        mdhd_Duration: {
                            type: 'string',
                            example: '277',
                        },
                        CodecConfigurationBox: {
                            type: 'string',
                            example: 'hvcC',
                        },
                    },
                },
            },
        },
    },
});

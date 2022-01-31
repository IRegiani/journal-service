module.exports = () => ({
    // '/login': require('./authorization/login')(),

    // TODO: Add search query params to this endpoint
    '/journal': require('./journal/journal')(),
    '/journal/{uid}': require('./journal/journal-uid')(),
    '/journal/{uid}/entry': require('./journal/journal-uid-entry')(),
    '/journal/{uid}/entry/{index}': require('./journal/journal-uid-entry-index')(),
    '/journal/{uid}/entry/{index}/attachment': require('./journal/journal-uid-entry-index-attachment')(),

    '/tag/{type}': require('./tag/tag-type')(),
    '/tag/{type}/{tag}': require('./tag/tag-type-tag')(),

    '/file/{uid}': require('./file/file-uid')(),
    '/file/{uid}/mediaInfo': require('./file/file-uid-mediaInfo')(),

    // '/statistics': require()(),
});

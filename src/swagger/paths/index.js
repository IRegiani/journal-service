module.exports = () => ({
  // '/login': require('./authorization/login')(),
  '/journal': require('./journal/journal')(),
  '/journal/{uid}': require('./journal/journal-uid')(),
  // POST '/journal/{uid}/entry': require('./journal/journal-uid')(),
  '/journal/{uid}/entry': require('./journal/journal-uid-attachment')(),

  '/tag/{tag}': require('./tag/index')(),

  '/attachment/{uid}/journal': require('./attachment/attachment-uid-journal')(),
  // POST '/attachment': require('./attachment/attachment')(), // should receive and attach to journal/entry

});

module.exports = () => ({
  // '/login': require('./authorization/login')(),

  // WIP
  '/journal': require('./journal/journal')(),
  '/journal/{uid}': require('./journal/journal-uid')(),
  '/journal/{uid}/entry': require('./journal/journal-uid-entry')(),
  '/journal/{uid}/entry/{index}': require('./journal/journal-uid-entry')(),
  '/journal/{uid}/entry/{index}/attachment': require('./journal/journal-uid-entry')(),

  '/tag/{type}': require('./tag/index')(),
  '/tag/{type}/{tag}': require('./tag/index')(),

  // '/attachment/{uid}/journal': require('./attachment/attachment-uid-journal')(),
  // POST '/attachment': require('./attachment/attachment')(), // should receive and attach to journal/entry

  // '/statistics': require()(),
});

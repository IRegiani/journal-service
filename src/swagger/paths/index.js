module.exports = () => ({
  // '/login': require('./authorization/login')(),
  '/journal': require('./journal/index')(),
  '/journal/{uid}': require('./journal/journal-uid')(),
  '/journal/{uid}/attachment': require('./journal/journal-uid-attachment')(),

  '/tag/{tag}': require('./tag/index')(),

  '/attachment/{uid}/journal': require('./attachment/attachment-uid-journal')(),
  // '/attachment/{uid}/journal/{tag}': require('./attachment/attachment-uid-journals')(),

});

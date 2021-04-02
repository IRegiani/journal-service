module.exports = () => ({
  // '/login': require('./authorization/login')(),
  '/journal': require('./journal/index')(),
  '/journal/{uid}': require('./journal/journal-uid')(),
  '/journal/{uid}/attachment': require('./journal/journal-uid')(),

  '/tag/{tag}': require('./tag/index')(),

  '/attachment/{uid}/journals': require('./attachment/attachment-uid-journals')(),

});

module.exports = () => {
  const JournalRouter = require('express').Router();
  const JournalController = require('../controllers/journalController')();

  // JournalRouter.use('/journal', AuthorizationController.authorize);

  JournalRouter.route('/journal').post(JournalController.create);
  // JournalRouter.route('/journal:uid').get(JournalController.retrieve);
  JournalRouter.route('/journal/:uid/entry')
    .put(JournalController.addEntry);
  //  .get(JournalController.getAttachments);

  return JournalRouter;
};

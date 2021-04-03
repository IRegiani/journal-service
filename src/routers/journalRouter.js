module.exports = () => {
  const JournalRouter = require('express').Router();
  const JournalController = require('../controllers/journalController')();

  JournalRouter.route('/journal').post(JournalController.create);
  // JournalRouter.route('/journal:uid').get(JournalController.retrieve);
  // JournalRouter.route('/journal:uid/attachment')
  //  .put(JournalController.addAttachment)
  //  .get(JournalController.getAttachments);

  return JournalRouter;
};

const JournalRouter = require('express').Router();
const JournalController = require('../controllers/journalController')();
const AuthorizationController = require('../controllers/authorizationController')();

module.exports = () => {
  JournalRouter.use('/journal', AuthorizationController.authorize);

  JournalRouter.route('/journal')
    .post(JournalController.createJournal);
  // TODO: .get(JournalController.search); // retrieves all journals within date range, with tags and/or entry tags
  JournalRouter.route('/journal/:uid')
    .get(JournalController.retrieve)
    .patch(JournalController.updateJournalEntry);
  JournalRouter.route('/journal/:uid/entry/:index/attachment')
    .post(JournalController.addAttachmentToEntry);
  JournalRouter.route('/journal/:uid/entry/:index')
    .patch(JournalController.updateEntry);
  JournalRouter.route('/journal/:uid/entry')
    .post(JournalController.addEntry)
    .get(JournalController.retrieveEntries);

  return JournalRouter;
};

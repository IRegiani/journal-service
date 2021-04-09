// const { createHash } = require('../utils/utils');
// const { FILE_EXTENSIONS, FILE_TYPES, FILES_DIRECTORY, MAX_FILE_BYTES } = require('../utils/constants');

module.exports = ({ db }) => {
  // if journal has no entry and fileEntry = true, updateHistory mantains since its the first entry
  // this request happens within seconds of jounral creation, it has no update history
  const addEntry = async (uid, newEntry) => {
    const journal = db.get('journals').value().find((jrl) => jrl.uid === uid);

    journal.entries.push(newEntry);
    // journal.updateHistory.push();

    await db.save();
    return journal;
  };

  return {
    addEntry,
  };
};

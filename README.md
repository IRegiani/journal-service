# journal-service

A way to organize my journal

## Inspiration

During the 2020 Covid Pandemic, sometimes I would record how I was and how my day was. 

It started with the cellphone, on Telegram Saved Messages, and evolved to write longer entries on an actual keyboard when had lots things happening. Then, things got more elaborated, with files and eventually the journal entry became video logs with eventual attachments.

I was without programming for a few time and wanted todo something on node.js, combined with some specific requirements, this project was started in order to organize all my journal entries (almost one year later, they are a bigger mess). The idea her is to provide a way to catalog, store, search, journal entries and process them outside of my cellphone, not being limited to create an entry on it (sometime in the future I'll finish this service and start an web application)

## Features (upcoming)

  - Add addends to previous entry (very useful when you forgot a detail about the same subject) 
  - Categorize entries and addends into different categories
  - Filter entries by category, file type, date, etc
  - Supports text, video and audio entries and attachments
  - Video entries can be streamed to the client
  - Hook to later pos-processing on videos  - eg, encode it with a more efficient codec
  - All entries are signed in order to avoid tampering
  - Any modification on a entry is registered
  - In memory cache is used when offloading a large entry

## Routes

All routes are available at `/documentation`.


## Roadmap

The original milestones are still available on the project. However, after this commit, the project will undergo a major refactor to use Mongo. Not sure how long  it will take and if I'll ever finish it. The current version is supposed to be usable, but... not really.
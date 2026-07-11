---
name: add-book-review
description: Refine a book review draft, download the book cover image, and register the book's metadata in books/reviews/reviews.yml. Use when the user asks to add, refine, or publish a book review.
---

TASK 1: refine the book review draft
REQUIREMENTS:
- fix spelling, grammatical, and language issues; apply standard English capitalization: first word of every sentence, the pronoun "I", and other words that are normally capitalized (e.g. "Chapter 6" when followed by a number)
- try to stay as close as possible to the original style and tone
- the draft likely contains randomly ordered, scattered thoughts — actively propose a reorganization and restructuring that gives the review a clear flow, then apply it
- when finished, save the refined version in books/reviews/ with a filename format of "yyyy-title.md" where yyyy is the current year and the book title is contained in the draft file name. if unsure, ask for the title info.

TASK 2: download a book cover image
REQUIREMENTS:
- based on the book title, search for an image of the book's cover
- the image should have a medium size
- save the image in books/reviews/images/ with a naming convention of "title.jpg/png" where the title is the book title with words connected by "-"
- if unsure, ask for more info.

TASK 3: add the book's meta data
REQUIREMENTS: in books/reviews/reviews.yml, add a new entry that consists of
- file: the filename of the book review .md
- cover: the file name of the book cover image
- title: the book's title in Title Case
- author: the book's author(s)
- pubdate: the date/time that the book review is created
- url: in the format of yyyy-title with title being its words connected by "-"
- if unsure, ask for more info.

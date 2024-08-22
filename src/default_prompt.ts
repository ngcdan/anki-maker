import { Note } from "./openai";

export const systemPrompt = (notes: Note[]) => {
  let outstandingCards = notes
    .filter(n => !n.trashed && !n.created)
    .map(note => `Front: ${note.fields.Front}\nBack: ${note.fields.Back}`)
    .join('\n');
  let trashedCards = notes
    .filter(n => n.trashed)
    .map(note => `Front: ${note.fields.Front}\nBack: ${note.fields.Back}`)
    .join('\n');
  let createdCards = notes
    .filter(n => n.created)
    .map(note => `Front: ${note.fields.Front}\nBack: ${note.fields.Back}`)
    .join('\n');

  return `You are an assistant assigned to create Anki cards.
      Make cards concise but contextual.

      Really, the questions and answers shouldn't be more than a sentence each.

      ${trashedCards.length > 0 && "The user already rejected these cards:" + trashedCards}

      ${createdCards.length > 0 && "The user created these cards: " + createdCards}

      ${outstandingCards.length > 0 && "The user hasn't taken an action on these suggested cards: " + outstandingCards}

      Create 5 cards based on user's prompt.

      Example:
      Front: Which Roman emperor divided the Roman empire?
      Back: Diocletian`;
}


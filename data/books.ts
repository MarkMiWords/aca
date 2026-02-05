import { Book } from '../types';

/**
 * SOVEREIGN REGISTRY - Hardcoded Book Data
 * Single source of truth for all published books.
 */

export const BOOKS: Book[] = [
  {
    id: 'ivo-trap-001',
    title: 'The IVO Trap',
    subtitle: 'Intervention Orders: From the Inside Out',
    author: 'Mark Mi Words',
    description: `In Victoria, police now respond to a family violence incident every five minutes.
More than 100,000 incidents last year alone — a record.

Breaches of Intervention Orders reached 61,000. The imprisonment rate for those breaches has almost tripled in ten years — from 14% to 40%. Ninety-two percent of those sentenced are men.

Divorced men are nine times more likely to die by suicide than divorced women.
1.1 million Australian children are growing up without their fathers.

To me, these are more than numbers.
They're blokes I've met.
Blokes I ate with, talked to, watched fall apart.

I never set out to write a book about Intervention Orders. I was in prison, recovering from surgery in the hospital wing, and I started writing to pass the time. I wrote about the men around me — their stories, how they got there. I filled notebooks with their yarns, scribbled in biro on whatever paper I could get.

When I got out and began typing those handwritten pages into my computer, something became impossible to ignore. Almost every man I'd written about had received an IVO. Fresh charges. Different backgrounds. Different lives. But the same piece of paper had helped put them on a path to my cell.

Then the police knocked on my door and handed me one.

This book does not chase answers or offer solutions. It examines a system through a memoir written inside a hospital in a maximum-security prison. Within its pages are the stories of thirteen men who did not believe that breaching an order — a text message, a phone call, a chance encounter — would lead them to prison.

They were wrong.

Some of these stories will make you laugh at the men's stupidity. Others will shock with their violence. Every one of them exposes a system that is indifferent to whether the men who pass through it come out better than when they went in.

Between these stories are unedited extracts from my personal diary — the day-to-day reality of prison life that binds these men together.

The language is colourful.
The crimes are regrettable.
The lessons are unforgettable.

Part comedy. Part tragedy. All heart.
— Mark Mi Words`,
    coverUrl: '/covers/The IVO Trap Final.jpg',
    slug: 'the-ivo-trap',
    releaseYear: '2025',
    buyUrl: 'https://www.ingramspark.com/'
  }
];

// Helper to find a book by slug
export const getBookBySlug = (slug: string): Book | undefined => {
  return BOOKS.find(book => book.slug === slug);
};

// Get featured book (first in list, or specific slug)
export const getFeaturedBook = (): Book => {
  return BOOKS[0];
};

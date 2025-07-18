import { Note, NoteResponse } from '../../types/api';
import { createMockDate } from '../utils/mockUtils';
import { mockUser } from './users';

export const mockNotesData: NoteResponse[] = [
  {
    id: 1,
    title: 'Welcome to PrismaNote! 📝',
    content: `# Welcome to PrismaNote!

Welcome to your new note-taking app! Here are some features you can explore:

## ✨ Features
- **Markdown Support** - Write notes with rich formatting
- **Real-time Sync** - Your notes are saved automatically
- **Search** - Find your notes quickly
- **Dark Mode** - Easy on the eyes

## 📱 Getting Started
1. Create new notes by tapping the + button
2. Use markdown syntax for formatting
3. Preview your notes by tapping the eye icon
4. Search through all your notes

Enjoy taking notes! 🚀`,
    timeCreated: createMockDate(5),
    lastModified: createMockDate(5),
    ownerName: mockUser.fullName,
    ownerEmail: mockUser.email
  },
  {
    id: 2,
    title: 'Meeting Notes - Project Planning',
    content: `# Project Planning Meeting
**Date:** ${new Date().toLocaleDateString()}
**Attendees:** Team Alpha

## Agenda
- [ ] Review current progress
- [x] Discuss next sprint goals
- [ ] Assign new tasks
- [x] Set deadlines

## Action Items
1. **Frontend Team** - Complete UI mockups by Friday
2. **Backend Team** - API documentation review
3. **QA Team** - Test plan preparation

## Next Meeting
📅 Next week, same time
🎯 Focus: Sprint review and retrospective`,
    timeCreated: createMockDate(3),
    lastModified: createMockDate(2),
    ownerName: mockUser.fullName,
    ownerEmail: mockUser.email
  },
  {
    id: 3,
    title: 'Recipe: Perfect Chocolate Chip Cookies 🍪',
    content: `# Chocolate Chip Cookies Recipe

## Ingredients
- 2¼ cups all-purpose flour
- 1 tsp baking soda
- 1 tsp salt
- 1 cup butter, softened
- ¾ cup granulated sugar
- ¾ cup packed brown sugar
- 2 large eggs
- 2 tsp vanilla extract
- 2 cups chocolate chips

## Instructions
1. **Preheat** oven to 375°F (190°C)
2. **Mix** flour, baking soda, and salt in bowl
3. **Cream** butter and sugars until fluffy
4. **Add** eggs and vanilla, mix well
5. **Combine** with flour mixture
6. **Fold in** chocolate chips
7. **Bake** 9-11 minutes until golden

*Makes about 48 cookies* 🍪

> **Pro Tip:** Chill dough for 30 minutes for thicker cookies!`,
    timeCreated: createMockDate(7),
    lastModified: createMockDate(6),
    ownerName: mockUser.fullName,
    ownerEmail: mockUser.email
  },
  {
    id: 4,
    title: 'Book Notes: The Art of Learning',
    content: `# The Art of Learning - Josh Waitzkin

## Key Concepts

### The Learning Zone
- Focus on the process, not just results
- Embrace the beginner's mind
- Learn from mistakes and failures

### Incremental Theory vs Entity Theory
- **Incremental:** Intelligence can be developed
- **Entity:** Intelligence is fixed
- Growth mindset leads to better learning

### The Soft Zone
- Maintain focus despite distractions
- Build mental resilience
- Practice under pressure

## Personal Takeaways
1. 🎯 Focus on fundamentals first
2. 🧘 Stay calm under pressure
3. 📈 Celebrate small improvements
4. 🔄 Iterate and refine constantly

**Rating:** ⭐⭐⭐⭐⭐
**Would recommend:** Yes, especially for students and professionals`,
    timeCreated: createMockDate(10),
    lastModified: createMockDate(8),
    ownerName: mockUser.fullName,
    ownerEmail: mockUser.email
  },
  {
    id: 5,
    title: 'Travel Bucket List 🌍',
    content: `# Travel Bucket List

## Europe 🇪🇺
- [ ] Northern Lights in Iceland ❄️
- [x] Eiffel Tower, Paris 🗼
- [ ] Swiss Alps, Switzerland 🏔️
- [ ] Santorini, Greece 🏛️

## Asia 🌏
- [ ] Cherry Blossoms, Japan 🌸
- [ ] Great Wall of China 🏯
- [ ] Temples of Angkor Wat, Cambodia
- [ ] Bali, Indonesia 🏝️

## Americas 🌎
- [ ] Machu Picchu, Peru 🦙
- [ ] Grand Canyon, USA 🏜️
- [x] Niagara Falls, Canada 💦
- [ ] Patagonia, Argentina

## Africa 🌍
- [ ] Safari in Kenya 🦁
- [ ] Pyramids of Egypt 🔺
- [ ] Victoria Falls, Zambia 💧

*Updated: ${new Date().toLocaleDateString()}*`,
    timeCreated: createMockDate(15),
    lastModified: createMockDate(1),
    ownerName: mockUser.fullName,
    ownerEmail: mockUser.email
  },
  {
    id: 6,
    title: 'Quick Ideas & Thoughts 💭',
    content: `# Random Ideas

## App Ideas 📱
- Weather app with mood suggestions
- Habit tracker with plant growth metaphor
- Recipe app that suggests based on ingredients

## Business Ideas 💼
- Local food delivery for healthy meals
- Virtual study group platform
- Eco-friendly packaging service

## Personal Goals 🎯
- Learn Spanish by end of year
- Read 2 books per month
- Exercise 4x per week
- Learn to cook 5 new dishes

## Quotes to Remember 📝
> "The best time to plant a tree was 20 years ago. The second best time is now." - Chinese Proverb

> "Innovation distinguishes between a leader and a follower." - Steve Jobs`,
    timeCreated: createMockDate(1),
    lastModified: createMockDate(0),
    ownerName: mockUser.fullName,
    ownerEmail: mockUser.email
  }
];

// Convert to frontend Note format
export const convertToFrontendNotes = (noteResponses: NoteResponse[]): Note[] => {
  return noteResponses.map(note => ({
    ...note,
    timeCreated: new Date(note.timeCreated),
    lastModified: new Date(note.lastModified)
  }));
};

export const mockNotes = convertToFrontendNotes(mockNotesData);

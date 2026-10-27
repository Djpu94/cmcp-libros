import { PrismaClient, type Prisma } from '@prisma/client';

type SeedBook = Omit<Prisma.BookCreateManyInput, 'price'> & { price: string };

const POP_CULTURE_BOOKS: SeedBook[] = [
  { title: "Harry Potter and the Philosopher's Stone", author: 'J.K. Rowling', publisher: 'Salamandra', price: '18.90', available: true, genre: 'Fantasy' },
  { title: 'Harry Potter and the Chamber of Secrets', author: 'J.K. Rowling', publisher: 'Salamandra', price: '18.90', available: true, genre: 'Fantasy' },
  { title: 'Harry Potter and the Prisoner of Azkaban', author: 'J.K. Rowling', publisher: 'Salamandra', price: '18.90', available: false, genre: 'Fantasy' },
  { title: "The Hitchhiker's Guide to the Galaxy", author: 'Douglas Adams', publisher: 'Anagrama', price: '12.50', available: true, genre: 'Science Fiction' },
  { title: 'Dune', author: 'Frank Herbert', publisher: 'Nova', price: '14.00', available: true, genre: 'Science Fiction' },
  { title: 'Neuromancer', author: 'William Gibson', publisher: 'Minotauro', price: '13.90', available: true, genre: 'Science Fiction' },
  { title: 'Ready Player One', author: 'Ernest Cline', publisher: 'Ediciones B', price: '16.90', available: true, genre: 'Science Fiction' },
  { title: 'Snow Crash', author: 'Neal Stephenson', publisher: 'Gigamesh', price: '17.50', available: false, genre: 'Science Fiction' },
  { title: 'The Martian', author: 'Andy Weir', publisher: 'Ediciones B', price: '15.90', available: true, genre: 'Science Fiction' },
  { title: 'Fahrenheit 451', author: 'Ray Bradbury', publisher: 'Minotauro', price: '9.90', available: true, genre: 'Fiction' },
  { title: '1984', author: 'George Orwell', publisher: 'Debolsillo', price: '9.50', available: true, genre: 'Fiction' },
  { title: 'A Clockwork Orange', author: 'Anthony Burgess', publisher: 'Minotauro', price: '11.00', available: true, genre: 'Fiction' },
  { title: 'Watchmen', author: 'Alan Moore', publisher: 'ECC Ediciones', price: '25.00', available: true, genre: 'Fiction' },
  { title: 'Fear and Loathing in Las Vegas', author: 'Hunter S. Thompson', publisher: 'Mondadori', price: '12.00', available: false, genre: 'Fiction' },
  { title: 'The Catcher in the Rye', author: 'J.D. Salinger', publisher: 'Alianza', price: '10.50', available: true, genre: 'Fiction' },
  { title: 'The Fellowship of the Ring', author: 'J.R.R. Tolkien', publisher: 'Minotauro', price: '22.00', available: true, genre: 'Fantasy' },
  { title: 'The Hobbit', author: 'J.R.R. Tolkien', publisher: 'Minotauro', price: '14.90', available: true, genre: 'Fantasy' },
  { title: 'A Game of Thrones', author: 'George R. R. Martin', publisher: 'Gigamesh', price: '21.90', available: true, genre: 'Fantasy' },
  { title: 'Good Omens', author: 'Terry Pratchett, Neil Gaiman', publisher: 'Plaza & Janés', price: '16.90', available: true, genre: 'Fantasy' },
  { title: 'The Last Wish', author: 'Andrzej Sapkowski', publisher: 'Alamut', price: '15.90', available: true, genre: 'Fantasy' },
  { title: 'The Final Empire', author: 'Brandon Sanderson', publisher: 'Nova', price: '17.90', available: false, genre: 'Fantasy' },
  { title: 'Preludes & Nocturnes', author: 'Neil Gaiman', publisher: 'ECC Ediciones', price: '19.95', available: true, genre: 'Fantasy' },
  { title: 'The Lightning Thief', author: 'Rick Riordan', publisher: 'Salamandra', price: '11.90', available: true, genre: 'Children' },
  { title: "Diary of a Wimpy Kid", author: 'Jeff Kinney', publisher: 'Molino', price: '9.90', available: true, genre: 'Children' },
  { title: 'The Hunger Games', author: 'Suzanne Collins', publisher: 'Molino', price: '13.90', available: true, genre: 'Thriller' },
  { title: 'It', author: 'Stephen King', publisher: 'Plaza & Janés', price: '19.90', available: true, genre: 'Thriller' },
  { title: 'Gone Girl', author: 'Gillian Flynn', publisher: 'Ediciones B', price: '12.90', available: false, genre: 'Thriller' },
  { title: 'The Girl with the Dragon Tattoo', author: 'Stieg Larsson', publisher: 'Destino', price: '13.50', available: true, genre: 'Mystery' },
  { title: 'Me Before You', author: 'Jojo Moyes', publisher: 'Suma', price: '13.90', available: true, genre: 'Romance' },
  { title: 'Steve Jobs', author: 'Walter Isaacson', publisher: 'Debate', price: '22.90', available: true, genre: 'Biography' },
  { title: 'Born to Run', author: 'Bruce Springsteen', publisher: 'Ediciones B', price: '24.00', available: true, genre: 'Biography' },
  { title: 'Sapiens', author: 'Yuval Noah Harari', publisher: 'Debate', price: '19.90', available: true, genre: 'History' },
];

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const existing = await prisma.book.findMany({
    where: { deletedAt: null },
    select: { title: true, author: true },
  });
  const seen = new Set(existing.map((book) => `${book.title}::${book.author}`));

  const toCreate = POP_CULTURE_BOOKS.filter((book) => !seen.has(`${book.title}::${book.author}`));

  if (toCreate.length === 0) {
    console.log('Books seed: nothing to insert, all pop culture books already exist.');
    return;
  }

  const result = await prisma.book.createMany({ data: toCreate });
  console.log(`Books seed: inserted ${result.count} of ${POP_CULTURE_BOOKS.length} books.`);
}

main()
  .catch((error: unknown) => {
    console.error('Failed to seed books:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

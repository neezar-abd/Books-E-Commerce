-- =============================================
-- SEED DATA - CATEGORIES
-- =============================================
INSERT INTO categories (name, slug, description) VALUES
('Fiction', 'fiction', 'Discover worlds beyond imagination, from classics to contemporary hits.'),
('Non-Fiction', 'non-fiction', 'Real stories, biographies, history, and self-help books.'),
('Art & Design', 'art-design', 'Photography, architecture, and graphic design books.'),
('Business', 'business', 'Business strategy, entrepreneurship, and management books.'),
('Science', 'science', 'Scientific discoveries, physics, biology, and more.'),
('Technology', 'technology', 'Programming, AI, web development, and tech trends.');

-- =============================================
-- SEED DATA - PRODUCTS
-- =============================================
INSERT INTO products (
  title, author, category_id, description, price, original_price, discount, 
  stock, rating, review_count, image, isbn, publisher, publication_year, pages
) VALUES
-- Fiction Books
(
  'The Midnight Library',
  'Matt Haig',
  (SELECT id FROM categories WHERE slug = 'fiction'),
  'Between life and death there is a library. Nora Seed finds herself faced with the possibility of changing her life for a new one.',
  155000,
  200000,
  25,
  45,
  4.8,
  1250,
  'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80',
  '9780525559474',
  'Viking',
  2020,
  304
),
(
  'Where the Crawdads Sing',
  'Delia Owens',
  (SELECT id FROM categories WHERE slug = 'fiction'),
  'A stunning novel about isolation, nature, and the power of human connection.',
  165000,
  220000,
  25,
  32,
  4.7,
  2100,
  'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80',
  '9780735219090',
  'Putnam',
  2018,
  384
),
(
  'The Silent Patient',
  'Alex Michaelides',
  (SELECT id FROM categories WHERE slug = 'fiction'),
  'A psychological thriller about a woman who shoots her husband and never speaks again.',
  145000,
  190000,
  24,
  28,
  4.6,
  1800,
  'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&q=80',
  '9781250301697',
  'Celadon Books',
  2019,
  336
),
(
  'The Seven Husbands of Evelyn Hugo',
  'Taylor Jenkins Reid',
  (SELECT id FROM categories WHERE slug = 'fiction'),
  'A reclusive Hollywood icon tells the story of her glamorous and scandalous life.',
  158000,
  210000,
  25,
  38,
  4.9,
  2500,
  'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=400&q=80',
  '9781501161933',
  'Atria Books',
  2017,
  400
),

-- Non-Fiction Books
(
  'Atomic Habits',
  'James Clear',
  (SELECT id FROM categories WHERE slug = 'non-fiction'),
  'An easy and proven way to build good habits and break bad ones.',
  175000,
  230000,
  24,
  55,
  4.9,
  3200,
  'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=80',
  '9780735211292',
  'Avery',
  2018,
  320
),
(
  'Sapiens',
  'Yuval Noah Harari',
  (SELECT id FROM categories WHERE slug = 'non-fiction'),
  'A brief history of humankind from the Stone Age to modern times.',
  195000,
  260000,
  25,
  42,
  4.7,
  2800,
  'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400&q=80',
  '9780062316097',
  'Harper',
  2015,
  464
),
(
  'Educated',
  'Tara Westover',
  (SELECT id FROM categories WHERE slug = 'non-fiction'),
  'A memoir about a young woman who grows up in a survivalist family and goes on to earn a PhD.',
  168000,
  220000,
  24,
  35,
  4.8,
  2200,
  'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=400&q=80',
  '9780399590504',
  'Random House',
  2018,
  334
),

-- Art & Design Books
(
  'The Art Book',
  'Phaidon Editors',
  (SELECT id FROM categories WHERE slug = 'art-design'),
  'A comprehensive guide to 500 of the greatest artists and their works.',
  285000,
  380000,
  25,
  18,
  4.6,
  450,
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80',
  '9780714867366',
  'Phaidon',
  2020,
  512
),
(
  'Steal Like an Artist',
  'Austin Kleon',
  (SELECT id FROM categories WHERE slug = 'art-design'),
  '10 things nobody told you about being creative.',
  145000,
  190000,
  24,
  48,
  4.5,
  1100,
  'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&q=80',
  '9780761169253',
  'Workman',
  2012,
  160
),

-- Business Books
(
  'The Lean Startup',
  'Eric Ries',
  (SELECT id FROM categories WHERE slug = 'business'),
  'How constant innovation creates radically successful businesses.',
  185000,
  245000,
  24,
  40,
  4.6,
  1600,
  'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400&q=80',
  '9780307887894',
  'Crown Business',
  2011,
  336
),
(
  'Zero to One',
  'Peter Thiel',
  (SELECT id FROM categories WHERE slug = 'business'),
  'Notes on startups, or how to build the future.',
  165000,
  220000,
  25,
  35,
  4.5,
  1400,
  'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&q=80',
  '9780804139298',
  'Crown Business',
  2014,
  224
),

-- Science Books
(
  'A Brief History of Time',
  'Stephen Hawking',
  (SELECT id FROM categories WHERE slug = 'science'),
  'From the Big Bang to black holes, a landmark volume in science writing.',
  178000,
  235000,
  24,
  30,
  4.7,
  1900,
  'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&q=80',
  '9780553380163',
  'Bantam',
  1988,
  256
),

-- Technology Books
(
  'Clean Code',
  'Robert C. Martin',
  (SELECT id FROM categories WHERE slug = 'technology'),
  'A handbook of agile software craftsmanship.',
  195000,
  260000,
  25,
  38,
  4.8,
  2100,
  'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&q=80',
  '9780132350884',
  'Prentice Hall',
  2008,
  464
);

-- Update some products to be featured/bestseller
UPDATE products SET is_featured = true 
WHERE title IN ('The Midnight Library', 'Atomic Habits', 'Sapiens', 'Clean Code');

UPDATE products SET is_bestseller = true 
WHERE title IN ('The Seven Husbands of Evelyn Hugo', 'Atomic Habits', 'Where the Crawdads Sing', 'The Silent Patient');

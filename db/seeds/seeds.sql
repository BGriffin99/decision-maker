INSERT INTO users (email)
VALUES ('email@gmail.com');
INSERT INTO polls (user_id, title)
VALUES (1, 'Rank these food items from best to worst');
INSERT INTO choices (poll_id, choice, description)
VALUES (1, 'Pizza', ''),
  (1, 'Chicken', ''),
  (1, 'Steak', ''),
  (1, 'Salad', ''),
  (1, 'Sushi', ''),
  (1, 'Pasta', 'Any kind');
INSERT INTO submissions (poll_id, choices_rank, name)
VALUES (1, '{1,2,3,4,5,6}', 'Bob'),
  (1, '{6,5,4,3,2,1}', 'Joe'),
  (1, '{2,1,3,5,6,4}', 'Ted'),
  (1, '{4,5,6,3,2,1}', 'Rebecca'),
  (1, '{5,2,3,1,4,6}', 'Mary'),
  (1, '{4,6,3,2,5,1}', 'Jane'),
  (1, '{3,2,6,4,5,1}', 'Bill'),
  (1, '{5,3,2,4,1,6}', 'Theo'),
  (1, '{3,4,5,6,1,2}', 'Brie'),
  (1, '{4,5,6,3,1,2}', 'Stefanie'),
  (1, '{3,1,5,4,6,2}', 'Mike'),
  (1, '{5,6,1,3,4,2}', 'Will'),
  (1, '{6,1,3,2,4,5}', 'March'),
  (1, '{1,3,5,4,6,2}', 'Selena'),
  (1, '{2,1,4,6,5,3}', 'Taylor'),
  (1, '{4,1,3,2,5,6}', 'Gary'),
  (1, '{2,3,1,4,5,6}', ''),
  (1, '{5,6,1,4,3,2}', 'A B C'),
  (1, '{4,2,6,1,5,3}', 'Brad'),
  (1, '{5,4,6,3,2,1}', 'Melody');
INSERT INTO users (email)
VALUES ('email@icloud.com');
INSERT INTO polls (user_id, title)
VALUES (2, 'Rank these Harry Potter books/movies from best to worst');
INSERT INTO choices (poll_id, choice, description)
VALUES (2, 'Harry Potter and the Philosopher''s Stone', ''),
  (2, 'Harry Potter and the Chamber of Secrets', ''),
  (2, 'Harry Potter and the Prisoner of Azkaban', ''),
  (2, 'Harry Potter and the Goblet of Fire', ''),
  (2, 'Harry Potter and the Order of the Phoenix', ''),
  (2, 'Harry Potter and the Half-Blood Prince', ''),
  (2, 'Harry Potter and the Deathly Hallows', '');
INSERT INTO submissions (poll_id, choices_rank, name)
VALUES (2, '{7,8,9,10,11,12,13}', 'Steve'),
  (2, '{13,12,11,10,9,8,7}', 'John'),
  (2, '{8,13,7,9,11,12,10}', 'Teddy'),
  (2, '{10,11,12,13,9,8,7}', 'Becca'),
  (2, '{11,8,9,7,13,10,12}', 'Maryanne'),
  (2, '{13,11,9,8,10,7,12}', 'Liv'),
  (2, '{9,13,10,11,12,7,8}', 'Dan'),
  (2, '{9,7,11,10,12,13,8}', 'Olive'),
  (2, '{11,12,7,9,10,8,13}', 'Austin'),
  (2, '{12,7,13,9,8,10,11}', 'Cher'),
  (2, '{7,13,9,11,10,12,8}', 'Rachel'),
  (2, '{8,7,10,12,13,11,9}', 'Lee'),
  (2, '{10,7,13,9,8,11,12}', 'Nana'),
  (2, '{8,9,7,10,11,13,12}', 'Johnson'),
  (2, '{10,8,12,7,11,13,9}', 'Connie'),
  (2, '{11,10,12,13,9,8,7}', 'Grace');

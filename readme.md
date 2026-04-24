🐶🦴 Find My Bones (Terminal Game)
A JS Logic & OOP Playground

This is my personal project to practice Object-Oriented Programming (OOP) and JavaScript logic. I transformed the classic "Find Your Hat" game into a Turn-Based Strategy / Minesweeper-style puzzle featuring my dog finding its way back to the owner.

Getting Started
Prerequisite: npm install prompt-sync (Check package.json to ensure it's there).
Run the game: node game-app.js (or whatever the main file is named).
Controls: W (Up), A (Left), S (Down), D (Right).

---

Game Mechanics: What's happening?
🐶 The Dog (Me): Navigates the map to find the Owner.
👦 The Owner (Goal): The ultimate destination. Finding him = Win!
🦴 Bone: Collectibles. The more I get, the higher my rank at the end (1-4 = Normal, 5-8 = Good, 9+ = Super Dog).

💣 Bomb: Instant Game Over (unless I have an Angel).
🪽 Angel: A one-time shield against a bomb.
🔳 Hole: Teleports the dog to a random safe location.
Fog of War: Unexplored areas are ⬜️, explored trails are ⬛️.

---

My Thought Process:
Whenever I felt stuck staring at a blank screen, I realized I needed to break things down. Here is my mental model and how I translated human logic into JavaScript.

##Step 0: The "Before Coding" Phase (Decomposition)
Before writing a single line of JS, I had to ask myself: What exactly am I building?

The Stage: A 2D grid (X, Y axis).

The Actors: Hidden items (bombs, holes, bones, angels) vs. Visible items (the dog, the owner).

The State: I need variables to remember the dog's current [y][x] position, bones collected, and if the angel shield is active.

The Actions: WASD inputs to change X and Y coordinates. (Note to self: W means Y-1, S means Y+1, A means X-1, D means X+1).

The Rules: Stepping on a tile triggers a specific event (switch...case logic).

The Loop: The game must ask for input continuously until I win or die (while loop).

##Step 1: The Setup & Toolkit
Goal: Import tools and store reusable assets.

I required prompt-sync for user inputs.

Clean Code Decision: I stored all emojis in an icon object. If I want to change the dog emoji later, I only change it here, not in 300 different places.

##Step 2: The Factory (Class Blueprint)
Goal: Avoid global variable chaos.

I created class Field. This acts as a blueprint. Every game state (map, positions, scores) is isolated inside this class. If I want to restart, I just instantiate a new Field().

##Step 3: The Brain (Constructor)
Goal: What does the game need to remember when a new round starts?

It takes the generated field (the real map with all hidden items).

Sets starting positions (playerX = 0, playerY = 0) and base stats.

The "Aha!" Moment (Fog of War): I can't just print the real field or players will see the bombs. I created a dual-layer system:

this.field = Data Layer (The truth).

this.displayGrid = Presentation Layer (The illusion). I mapped over the real field and replaced everything with ⬜️ (except the owner) to show to the player.

##Step 4: UI & "Dog Senses" (The View)
Goal: Render the map and give the player a fighting chance.

printMap(): Clears the console, prints the stats, and joins the 2D array into a string.

Dynamic Rendering: The dog isn't hardcoded into the map. While rendering the grid, I added an if statement: If the current rendering x, y matches playerX, playerY, print the dog emoji here.

##Step 5: The Controller
Goal: Handle player input.

askQuestion() takes the WASD input.

Why does Up (W) mean Y - 1? Because in 2D Arrays, the top row is index 0. Moving "up" means going from index 1 to index 0.

##Step 6: The Judge (Collision Logic)
Goal: What happens when I step on something?

processMove() checks this.field[y][x].

I used a switch...case statement.

Crucial Logic: When I collect a bone/angel, I engrave its icon permanently onto this.displayGrid (so the player sees it), but I erase it from this.field (so the dog doesn't smell it or collect it twice).

##Step 7: Safety Nets (Teleports & Boundaries)
Goal: Prevent bugs and unfair deaths.

isOutOfBounds(): A math check. If Y < 0 or X > map width, Game Over.

teleportPlayer(): When falling into a hole, I can't just teleport the dog randomly because it might land directly on a bomb (unfair!). I wrote a while(!isSafe) loop to keep generating random X, Y coordinates until it lands on an empty, safe tile.

##Step 8: The Grand Reveal (Endings)
Goal: Provide closure.

Whether it's a win (winGame) or a loss (endGame), I flip isGameOver = true to break the game loop.

revealFinalMap(): If the player dies, they deserve to know where the bombs were. I overlay the hidden items from this.field onto the screen and replace the dog with an explosion 💥 at the death coordinates.

Finally, the game calculates the title (Normal/Good/Super Dog) based on the bonesCollected state.

---

End of notes. Keep practicing! Happy Coding.

const prompt = require("prompt-sync")({ sigint: true });

const icon = {
  dog: "🐶",
  bone: "🦴",
  bomb: "💣",
  hole: "🕳️",
  angel: "🪽",
  owner: "👦",
  unopened: "⬜️",
  opened: "⬛️",
};

class Field {
  constructor(field) {
    this.field = field;
    this.playerX = 0;
    this.playerY = 0;
    this.bonesCollected = 0;
    this.hasAngel = false;
    this.isGameOver = false;
    this.stats = { holesFallen: 0, bombsHit: 0, angelsFound: 0, totalMoves: 0 };

    this.displayGrid = this.field.map((row) =>
      row.map((tile) => (tile === icon.owner ? icon.owner : icon.unopened)),
    );

    this.displayGrid[0][0] = icon.opened;
  }

  printMap() {
    console.clear();
    console.log("=== FIND MY BONES 𐂯 ੯·̀͡⬮ ===");
    console.log(
      `Bones: ${this.bonesCollected} | Angel: ${this.hasAngel ? "Active" : "None"} | Falls: ${this.stats.holesFallen}`,
    );
    console.log("------------------------------------------");

    const displayMap = this.displayGrid
      .map((row, y) => {
        return row
          .map((tile, x) => {
            if (x === this.playerX && y === this.playerY) return icon.dog;
            return tile;
          })
          .join("");
      })
      .join("\n");

    console.log(displayMap);
    console.log("------------------------------------------");

    this.checkDogSenses();

    console.log("Control: W(Up), A(Left), S(Down), D(Right)");
    console.log("Command: 're', 'quit', or 'magic' for Devs");
  }

  // ปรับปรุง: ลบการตรวจจับหลุมออกตามคำขอ
  checkDogSenses() {
    const adjacentPositions = [
      { hints: ["Uptown", "12 o'clock", "The High Ground"], x: 0, y: -1 },
      { hints: ["Underground", "6 o'clock", "The Basement"], x: 0, y: 1 },
      { hints: ["Sunset Beach", "9 o'clock", "The West Coast"], x: -1, y: 0 },
      { hints: ["Sushi Restaurant", "3 o'clock", "The East End"], x: 1, y: 0 },
    ];

    let bombDirs = [];
    let boneDirs = [];

    for (let pos of adjacentPositions) {
      const checkX = this.playerX + pos.x;
      const checkY = this.playerY + pos.y;

      if (
        checkX >= 0 &&
        checkX < this.field[0].length &&
        checkY >= 0 &&
        checkY < this.field.length
      ) {
        // ใช้ this.field ในการดมกลิ่น เพราะมันคือข้อมูลจริงที่ยังไม่ได้เก็บ
        const tile = this.field[checkY][checkX];

        // ถ้าเจอระเบืด ให้ทำการ random หยิบคำใบ้ 1 คำจาก Array ของทิศนั้นๆ
        if (tile === icon.bomb || tile === icon.bone) {
          const randomIndex = Math.floor(Math.random() * pos.hints.length);
          const selectedHint = pos.hints[randomIndex];

          if (tile === icon.bomb) bombDirs.push(selectedHint);
          if (tile === icon.bone) boneDirs.push(selectedHint);
        }
      }
    }

    if (bombDirs.length > 0)
      console.log(`[Warning] Smell gunpowder from.. ${bombDirs.join(" and ")}`);
    if (boneDirs.length > 0)
      console.log(
        `[Hint] Smell something tasty from.. ${boneDirs.join(" and ")}`,
      );

    if (bombDirs.length > 0 || boneDirs.length > 0) {
      console.log("------------------------------------------");
    }
  }

  askQuestion() {
    const input = prompt("Move: ").toLowerCase();

    if (input === "quit") {
      console.log("Goodbye!");
      process.exit();
    }
    if (input === "re") return "RESTART";
    if (input === "magic") {
      this.revealFinalMap(false, true);
      prompt("Cheat Active! Press Enter to continue...");
      return;
    }

    switch (input) {
      case "w":
        this.playerY -= 1;
        break;
      case "s":
        this.playerY += 1;
        break;
      case "a":
        this.playerX -= 1;
        break;
      case "d":
        this.playerX += 1;
        break;
      default:
        return;
    }

    this.stats.totalMoves++;
    this.processMove();
  }

  processMove() {
    if (this.isOutOfBounds()) {
      this.endGame("Went out of bounds!");
      return;
    }

    const currentTile = this.field[this.playerY][this.playerX];

    switch (currentTile) {
      case icon.owner:
        this.winGame();
        break;

      case icon.bomb:
        this.stats.bombsHit++;
        if (this.hasAngel) {
          this.hasAngel = false;
          this.field[this.playerY][this.playerX] = icon.opened;
          this.displayGrid[this.playerY][this.playerX] = icon.opened;
        } else {
          this.endGame("Hit a bomb!");
          return;
        }
        break;

      case icon.hole:
        this.stats.holesFallen++;
        // ปรับปรุง: ข้อความเมื่อตกหลุมตามคำขอ
        console.log(
          "\n!!! ตกหลุม underground และโผล่มาอีกที่นึงที่นี่ที่ไหนเนี่ย !!!",
        );
        prompt("Press Enter to continue...");

        this.field[this.playerY][this.playerX] = icon.opened;
        this.displayGrid[this.playerY][this.playerX] = icon.opened;
        this.teleportPlayer();
        return;

      case icon.bone:
        this.bonesCollected++;
        this.displayGrid[this.playerY][this.playerX] = icon.bone;
        this.field[this.playerY][this.playerX] = icon.opened;
        break;

      case icon.angel:
        this.stats.angelsFound++;
        this.hasAngel = true;
        this.displayGrid[this.playerY][this.playerX] = icon.angel;
        this.field[this.playerY][this.playerX] = icon.opened;
        break;

      default:
        this.displayGrid[this.playerY][this.playerX] = icon.opened;
        break;
    }
  }

  isOutOfBounds() {
    return (
      this.playerY < 0 ||
      this.playerY >= this.field.length ||
      this.playerX < 0 ||
      this.playerX >= this.field[0].length
    );
  }

  teleportPlayer() {
    let isSafe = false;
    while (!isSafe) {
      let newY = Math.floor(Math.random() * this.field.length);
      let newX = Math.floor(Math.random() * this.field[0].length);
      const destinationTile = this.field[newY][newX];
      if (destinationTile !== icon.bomb && destinationTile !== icon.hole) {
        this.playerY = newY;
        this.playerX = newX;
        isSafe = true;
      }
    }
    this.processMove();
  }

  winGame() {
    this.isGameOver = true;
    console.clear();
    this.revealFinalMap();
    console.log("\nSUCCESS! You found the owner.");
    this.showSummary();
  }

  endGame(message) {
    this.isGameOver = true;
    console.clear();
    this.revealFinalMap(true);
    console.log(`\nGAME OVER: ${message}`);
    this.showSummary();
  }

  revealFinalMap(isDeath = false, isPeek = false) {
    if (isPeek) console.log("\n--- MAGIC PEEK MODE (DEVELOPER) ---");

    const finalMap = this.field
      .map((row, y) =>
        row
          .map((tile, x) => {
            if (isDeath && x === this.playerX && y === this.playerY)
              return "💥";
            if (!isDeath && x === this.playerX && y === this.playerY)
              return icon.dog;
            if (
              tile === icon.bomb ||
              tile === icon.hole ||
              tile === icon.bone ||
              tile === icon.angel ||
              tile === icon.owner
            ) {
              return tile;
            }
            return this.displayGrid[y][x] === icon.unopened
              ? "🔹"
              : this.displayGrid[y][x];
          })
          .join(""),
      )
      .join("\n");

    console.log(finalMap);
  }

  showSummary() {
    let rank = "";
    if (this.bonesCollected >= 9) {
      rank = "SUPER DOG (ฉลาดระดับ Weimaraner อย่าง Cereal เลย!)";
    } else if (this.bonesCollected >= 5) {
      rank = "GOOD DOG (เก่งและซนเหมือน Dalmatian อย่าง Biscuit)";
    } else {
      rank = "NORMAL DOG (ฝึกฝนต่อไปนะเจ้าตูบ)";
    }

    console.log("------------------------------------------");
    console.log(`RANK: ${rank}`);
    console.log(`Bones Collected: ${this.bonesCollected} / 12`);
    console.log(`Bombs Hit: ${this.stats.bombsHit}`);
    console.log(`Holes Fallen: ${this.stats.holesFallen}`);
    console.log("==========================================");

    const playAgain = prompt("Play again? (y/n): ").toLowerCase();
    if (playAgain === "y") startGame();
    else process.exit();
  }

  runGame() {
    while (!this.isGameOver) {
      this.printMap();
      const action = this.askQuestion();
      if (action === "RESTART") return "RESTART";
    }
  }

  static generateField(height, width) {
    const field = new Array(height)
      .fill(0)
      .map(() => new Array(width).fill(icon.unopened));
    const placeItem = (item, amount, minDistance = 0) => {
      let placed = 0;
      while (placed < amount) {
        const y = Math.floor(Math.random() * height);
        const x = Math.floor(Math.random() * width);
        if (
          x + y >= minDistance &&
          field[y][x] === icon.unopened &&
          (x !== 0 || y !== 0)
        ) {
          field[y][x] = item;
          placed++;
        }
      }
    };
    placeItem(icon.owner, 1, Math.floor((width + height) / 2));
    placeItem(icon.angel, 1, 3);
    placeItem(icon.bomb, Math.floor(height * width * 0.25), 3);
    placeItem(icon.hole, Math.floor(height * width * 0.05), 3);
    placeItem(icon.bone, 12, 1);
    return field;
  }
}

function startGame() {
  const myMap = Field.generateField(10, 10);
  const myGame = new Field(myMap);
  const result = myGame.runGame();
  if (result === "RESTART") startGame();
}

startGame();

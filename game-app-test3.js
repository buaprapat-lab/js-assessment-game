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
    // แผนที่ข้อมูลจริง (Data Layer)
    this.field = field;
    this.playerX = 0;
    this.playerY = 0;
    this.bonesCollected = 0;
    this.hasAngel = false;
    this.isGameOver = false;
    this.stats = { holesFallen: 0, bombsHit: 0, angelsFound: 0, totalMoves: 0 };

    // แผนที่แสดงผล (Presentation Layer)
    // คัดลอกพิกัดมาสร้างใหม่ โดยซ่อนทุกอย่างเป็น unopened ยกเว้น owner
    this.displayGrid = this.field.map((row) =>
      row.map((tile) => (tile === icon.owner ? icon.owner : icon.unopened)),
    );

    // ตั้งค่าให้จุดเกิดเป็นรอยเท้าทางเดินไว้ก่อน
    this.displayGrid[0][0] = icon.opened;
  }

  printMap() {
    console.clear();
    console.log("=== FIND MY BONES (Strategy Edition) ===");
    console.log(
      `Bones: ${this.bonesCollected} | Angel: ${this.hasAngel ? "Active" : "None"} | Falls: ${this.stats.holesFallen}`,
    );
    console.log("------------------------------------------");

    // ดึงแผนที่แสดงผลมาวาด โดยเช็คแค่ว่าตัวละครยืนอยู่ตรงไหน
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
    console.log("Command: 're' (Restart), 'quit' (Exit)");
  }

  checkDogSenses() {
    const adjacentPositions = [
      { hint: "Uptown", x: 0, y: -1 },
      { hint: "Underground", x: 0, y: 1 },
      { hint: "Sunset Beach", x: -1, y: 0 },
      { hint: "Sushi Restaurant", x: 1, y: 0 },
    ];

    let bombDirs = [];
    let holeDirs = [];
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

        if (tile === icon.bomb) bombDirs.push(pos.hint);
        if (tile === icon.hole) holeDirs.push(pos.hint);
        if (tile === icon.bone) boneDirs.push(pos.hint);
      }
    }

    if (bombDirs.length > 0) {
      console.log(
        `[Warning] Smell gunpowder from... ${bombDirs.join(" and ")}`,
      );
    }
    if (holeDirs.length > 0) {
      console.log(
        `[Warning] Hear wind blowing from... ${holeDirs.join(" and ")}`,
      );
    }
    if (boneDirs.length > 0) {
      console.log(
        `[Hint] Smell something tasty from... ${boneDirs.join(" and ")}`,
      );
    }

    if (bombDirs.length > 0 || holeDirs.length > 0 || boneDirs.length > 0) {
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

    // ไม่ต้องทิ้งรอยเท้าในฟังก์ชันนี้แล้ว เพราะ processMove จะเป็นตัวจัดการ State บนจอแทน
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

    // อ่านค่าว่าเหยียบอะไรจากแผนที่จริง
    const currentTile = this.field[this.playerY][this.playerX];

    switch (currentTile) {
      case icon.owner:
        this.winGame();
        break;

      case icon.bomb:
        this.stats.bombsHit++;
        if (this.hasAngel) {
          this.hasAngel = false;
          // รอดมาได้ ลบระเบิดออกจากระบบ และทิ้งรอยเท้าไว้บนหน้าจอ
          this.field[this.playerY][this.playerX] = icon.opened;
          this.displayGrid[this.playerY][this.playerX] = icon.opened;
        } else {
          // ตายทันที เกมจะไปเรียก endGame เพื่อเฉลยแผนที่
          this.endGame("Hit a bomb!");
          return;
        }
        break;

      case icon.hole:
        this.stats.holesFallen++;
        // ลบหลุมทิ้งเพื่อไม่ให้วาร์ปซ้ำ และใส่รอยเท้าไว้บนหน้าจอ
        this.field[this.playerY][this.playerX] = icon.opened;
        this.displayGrid[this.playerY][this.playerX] = icon.opened;
        this.teleportPlayer();
        return;

      case icon.bone:
        this.bonesCollected++;
        // เปลี่ยนช่องนี้บนหน้าจอให้เป็นไอคอนกระดูกถาวร
        this.displayGrid[this.playerY][this.playerX] = icon.bone;
        // ลบกระดูกออกจาก Data Layer เพื่อกันเก็บซ้ำและกันดมกลิ่นเจออีก
        this.field[this.playerY][this.playerX] = icon.opened;
        break;

      case icon.angel:
        this.stats.angelsFound++;
        this.hasAngel = true;
        // เปลี่ยนช่องนี้บนหน้าจอให้เป็นไอคอนนางฟ้าถาวร
        this.displayGrid[this.playerY][this.playerX] = icon.angel;
        // ลบออกจาก Data Layer
        this.field[this.playerY][this.playerX] = icon.opened;
        break;

      case icon.unopened:
      case icon.opened:
        // เดินบนทางปกติ ทิ้งรอยเท้าบนหน้าจอ
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
    this.playerY = Math.floor(Math.random() * this.field.length);
    this.playerX = Math.floor(Math.random() * this.field[0].length);
    this.processMove();
  }

  winGame() {
    this.isGameOver = true;
    console.clear();
    // เฉลยแผนที่ให้ดูความเทพตอนจบ
    this.revealFinalMap();
    console.log("\nSUCCESS! You found the owner.");
    this.showSummary();
  }

  endGame(message) {
    this.isGameOver = true;
    console.clear();
    // เฉลยแผนที่พร้อมแสดงจุดจบ
    this.revealFinalMap(true);
    console.log(`\nGAME OVER: ${message}`);
    this.showSummary();
  }

  // ฟังก์ชันใหม่สำหรับเฉลยแผนที่ทั้งหมด (ระเบิดทั้งหมดจะโผล่มาตอนนี้)
  revealFinalMap(isDeath = false) {
    const finalMap = this.field
      .map((row, y) =>
        row
          .map((tile, x) => {
            // หากตาย ให้แสดงสัญลักษณ์ที่จุดตาย
            if (isDeath && x === this.playerX && y === this.playerY)
              return "💥";
            if (!isDeath && x === this.playerX && y === this.playerY)
              return icon.dog;

            // บังคับโชว์ระเบิดที่ยังไม่ได้เหยียบ
            if (tile === icon.bomb) return icon.bomb;

            // ช่องอื่นๆ ให้โชว์ตามสิ่งที่ผู้เล่นเปิดไว้แล้ว ถ้ายังไม่เปิดให้ใช้สัญลักษณ์จุด
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
    if (this.bonesCollected >= 9) rank = "SUPER DOG";
    else if (this.bonesCollected >= 5) rank = "GOOD DOG";
    else rank = "NORMAL DOG";

    console.log("------------------------------------------");
    console.log(`RANK: ${rank}`);
    console.log(`Bones Collected: ${this.bonesCollected}`);
    console.log(`Bombs Hit: ${this.stats.bombsHit}`);
    console.log(`Holes Fallen: ${this.stats.holesFallen}`);
    console.log(`Total Moves: ${this.stats.totalMoves}`);
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
        const dist = x + y;

        if (
          dist >= minDistance &&
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

const prompt = require("prompt-sync")({ sigint: true });

// กำหนดตัวแปรเก็บสัญลักษณ์ต่างๆ เพื่อให้เรียกใช้ได้ง่ายและแก้ไขจากจุดเดียว
const icon = {
  dog: "🐶",
  bone: "🦴",
  bomb: "💣",
  hole: "🕳️",
  angel: "🪽",
  owner: "👦", // ใช้สัญลักษณ์เด็กผู้ชายธรรมดาเพื่อป้องกันปัญหาความกว้างตัวอักษรใน Terminal แล้วแมป row นั้นเพิ่มมาอีกช่อง
  unopened: "⬜️",
  opened: "⬛️",
};

class Field {
  // 1. Constructor: กำหนดค่าเริ่มต้นของเกม (State Management)
  constructor(field) {
    this.field = field;
    this.playerX = 0; // ตำแหน่งแนวนอนเริ่มต้น
    this.playerY = 0; // ตำแหน่งแนวตั้งเริ่มต้น
    this.bonesCollected = 0;
    this.hasAngel = false;
    this.isGameOver = false;

    // Object สำหรับเก็บสถิติผู้เล่น
    this.stats = { holesFallen: 0, bombsHit: 0, angelsFound: 0, totalMoves: 0 };

    // วางตัวละครลงที่จุดเริ่มต้น
    this.field[0][0] = icon.dog;
  }

  // 2. printMap: ฟังก์ชันแสดงผลหน้าจอแบบซ่อนแผนที่ (Fog of War)
  printMap() {
    console.clear();
    console.log("=== FIND MY BONES (Strategy Edition) ===");
    console.log(
      `Bones: ${this.bonesCollected} | Angel: ${this.hasAngel ? "Active" : "None"} | Falls: ${this.stats.holesFallen}`,
    );
    console.log("------------------------------------------");

    const displayMap = this.field
      .map((row, y) => {
        return row
          .map((tile, x) => {
            // โชว์ตัวละครถ้าพิกัดตรงกัน
            if (x === this.playerX && y === this.playerY) return icon.dog;
            // โชว์เป้าหมายหรือรอยเท้าที่เคยเดินไปแล้ว
            if (tile === icon.owner || tile === icon.opened) return tile;
            // ซ่อนไอเทมอื่นๆ ไว้หลังสัญลักษณ์แผนที่ที่ยังไม่เปิด
            return icon.unopened;
          })
          .join("");
      })
      .join("\n");

    console.log(displayMap);
    console.log("------------------------------------------");

    // เรียกใช้ระบบบอกใบ้ก่อนให้ผู้เล่นตัดสินใจเดิน
    this.checkDogSenses();

    console.log("Control: W(Up), A(Left), S(Down), D(Right)");
    console.log("Command: 're' (Restart), 'quit' (Exit)");
  }

  // 3. checkDogSenses: ระบบคำนวณและบอกใบ้ทิศทาง (Logic Puzzle)
  // 3. checkDogSenses: ระบบคำนวณและบอกใบ้ทิศทาง (Randomized Cryptic Hints)
  checkDogSenses() {
    // เปลี่ยนจากคำใบ้เดี่ยวๆ เป็น Array ของคำใบ้ เพื่อให้ระบบสุ่มหยิบไปใช้
    const adjacentPositions = [
      {
        // ทิศขึ้น (W / North)
        hints: ["Uptown", "12 o'clock", "The High Ground"],
        x: 0,
        y: -1,
      },
      {
        // ทิศลง (S / South)
        hints: ["Underground", "6 o'clock", "The Basement"],
        x: 0,
        y: 1,
      },
      {
        // ทิศซ้าย (A / West)
        hints: ["Sunset Beach", "9 o'clock", "The West Coast"],
        x: -1,
        y: 0,
      },
      {
        // ทิศขวา (D / East)
        hints: ["Sushi Restaurant", "3 o'clock", "The East End"],
        x: 1,
        y: 0,
      },
    ];

    let bombDirs = [];
    let holeDirs = [];
    let boneDirs = [];

    // เช็คทีละทิศทาง
    for (let pos of adjacentPositions) {
      const checkX = this.playerX + pos.x;
      const checkY = this.playerY + pos.y;

      if (
        checkX >= 0 &&
        checkX < this.field[0].length &&
        checkY >= 0 &&
        checkY < this.field.length
      ) {
        const tile = this.field[checkY][checkX];

        // ถ้าเจอไอเทม ให้ทำการ "สุ่ม" หยิบคำใบ้ 1 คำจาก Array ของทิศนั้นๆ
        if (tile === icon.bomb || tile === icon.hole || tile === icon.bone) {
          const randomIndex = Math.floor(Math.random() * pos.hints.length);
          const selectedHint = pos.hints[randomIndex];

          if (tile === icon.bomb) bombDirs.push(selectedHint);
          if (tile === icon.hole) holeDirs.push(selectedHint);
          if (tile === icon.bone) boneDirs.push(selectedHint);
        }
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

  // 4. askQuestion: รับค่าจากคีย์บอร์ดและเปลี่ยนตำแหน่งพิกัด
  askQuestion() {
    const input = prompt("Move: ").toLowerCase();

    // จัดการคำสั่งพิเศษ
    if (input === "quit") {
      console.log("Goodbye!");
      process.exit();
    }
    if (input === "re") return "RESTART";

    const oldX = this.playerX;
    const oldY = this.playerY;

    // เปลี่ยนพิกัดตามปุ่มที่กด
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
        return; // กรณีพิมพ์ผิดให้ข้ามไปรับค่าใหม่
    }

    this.stats.totalMoves++;
    // ทิ้งรอยเท้าไว้ที่จุดเดิมก่อนเดิน
    this.field[oldY][oldX] = icon.opened;
    // ส่งไปเช็คว่าจุดใหม่ที่เดินไปเจอกับอะไร
    this.processMove();
  }

  // 5. processMove: ตรวจสอบการชนและเงื่อนไขของเกม
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
          // ถ้ารอดจากระเบิดเพราะนางฟ้า ให้ล้างสถานะนางฟ้าทิ้ง
          this.hasAngel = false;
        } else {
          // ถ้าไม่มีนางฟ้า คือตายและจบเกม
          this.endGame("Hit a bomb!");
          return;
        }
        break;
      case icon.hole:
        this.stats.holesFallen++;
        this.teleportPlayer();
        return; // ต้อง return ออกไปเลย เพื่อไม่ให้ระบบวาดตัวละครทับจุดที่เป็นหลุม
      case icon.bone:
        this.bonesCollected++;
        break;
      case icon.angel:
        this.stats.angelsFound++;
        this.hasAngel = true;
        break;
    }

    // ถ้าเกมยังดำเนินต่อ ให้วาดตัวละครในตำแหน่งปัจจุบัน
    if (!this.isGameOver) {
      this.field[this.playerY][this.playerX] = icon.dog;
    }
  }

  // ตรวจสอบว่าพิกัดทะลุกำแพงแผนที่หรือไม่
  isOutOfBounds() {
    return (
      this.playerY < 0 ||
      this.playerY >= this.field.length ||
      this.playerX < 0 ||
      this.playerX >= this.field[0].length
    );
  }

  // สุ่มพิกัดใหม่บนแผนที่ทั้งหมด แล้วสั่งตรวจสอบการชนอีกครั้ง
  teleportPlayer() {
    this.playerY = Math.floor(Math.random() * this.field.length);
    this.playerX = Math.floor(Math.random() * this.field[0].length);
    this.processMove();
  }

  // จัดการเมื่อชนะเกม
  winGame() {
    this.isGameOver = true;
    console.clear();
    console.log("==========================================");
    console.log("SUCCESS! You found the owner.");
    this.showSummary();
  }

  // จัดการเมื่อแพ้เกม พร้อมโชว์แผนที่เฉลย
  endGame(message) {
    this.isGameOver = true;
    console.clear();

    // นำแผนที่ทั้งหมดมาแปลงจุดที่ยังไม่เปิด ให้เป็นสัญลักษณ์อื่น เพื่อให้เห็นสิ่งของที่ซ่อนอยู่ทั้งหมด
    const revealMap = this.field
      .map((row) =>
        row.map((tile) => (tile === icon.unopened ? "-" : tile)).join(""),
      )
      .join("\n");

    console.log(revealMap);
    console.log(`\nGAME OVER: ${message}`);
    this.showSummary();
  }

  // 6. showSummary: แสดงสถิติและคำนวณระดับ (Rank)
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

  // 7. runGame: วงจรหลักของเกม (Game Loop)
  runGame() {
    while (!this.isGameOver) {
      this.printMap();
      const action = this.askQuestion();
      if (action === "RESTART") return "RESTART";
    }
  }

  // 8. generateField: สร้างแผนที่ 2 มิติแบบสุ่ม
  static generateField(height, width) {
    // สร้าง Array 2 มิติ เติมข้อมูลตั้งต้นด้วยแผนที่ที่ยังไม่เปิด
    const field = new Array(height)
      .fill(0)
      .map(() => new Array(width).fill(icon.unopened));

    // ฟังก์ชันเสริมสำหรับสุ่มวางสิ่งของ
    const placeItem = (item, amount, minDistance = 0) => {
      let placed = 0;
      while (placed < amount) {
        const y = Math.floor(Math.random() * height);
        const x = Math.floor(Math.random() * width);
        // คำนวณระยะห่างเพื่อทำระบบ Safe Zone ตอนเริ่มเกม
        const dist = x + y;

        // เงื่อนไข: ระยะต้องเกินกำหนด, ช่องต้องว่าง, และห้ามทับจุดเริ่มต้น (0,0)
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

    // วางเป้าหมายให้อยู่ครึ่งหลังของแผนที่เสมอ
    placeItem(icon.owner, 1, Math.floor((width + height) / 2));
    // วางนางฟ้า
    placeItem(icon.angel, 1, 3);
    // วางระเบิดจำนวน 25% ของพื้นที่ทั้งหมด (ท้าทายมากขึ้น) และห้ามอยู่ในระยะ 3 ก้าวแรก
    placeItem(icon.bomb, Math.floor(height * width * 0.25), 3);
    // วางหลุม 5% ของพื้นที่
    placeItem(icon.hole, Math.floor(height * width * 0.05), 3);
    // วางกระดูก 12 ชิ้น
    placeItem(icon.bone, 12, 1);

    return field;
  }
}

// 9. startGame: จุดเริ่มต้นการทำงานของโปรแกรม
function startGame() {
  const myMap = Field.generateField(10, 10);
  const myGame = new Field(myMap);
  // ถ้าระบบส่งค่ากลับมาว่า RESTART ให้เรียกฟังก์ชันตัวเองซ้ำเพื่อเริ่มเกมใหม่ (Recursion)
  const result = myGame.runGame();
  if (result === "RESTART") startGame();
}

// รันคำสั่ง
startGame();

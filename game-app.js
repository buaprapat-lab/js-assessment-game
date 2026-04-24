const prompt = require("prompt-sync")({ sigint: true });

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

    this.displayGrid = this.field.map((row) =>
      row.map((tile) => (tile === icon.owner ? icon.owner : icon.unopened)),
    );

    // ตั้งค่าให้จุดเกิดเป็นรอยเท้าทางเดินไว้ก่อน
    this.displayGrid[0][0] = icon.opened;
  }

  // 2. printMap: ฟังก์ชันแสดงผลหน้าจอแบบซ่อนแผนที่ (Fog of War)

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
        // โชว์ตัวละครถ้าพิกัดตรงกัน
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

    // 3. checkDogSenses เรียกใช้ระบบบอกใบ้ก่อนให้ผู้เล่นตัดสินใจเดิน
    this.checkDogSenses();

    console.log("Control: W(Up), A(Left), S(Down), D(Right)");
    console.log("Command: 're', 'quit', or 'magic' for Devs");
  }

  // Logic Puzzle ทิศทางของระเบิดของ checkDogSenses
  // คำนวณและบอกใบ้ทิศทางเก็บเป็น arrays ให้ระบบสุ่มหยิบไปใช้ได้
  checkDogSenses() {
    const adjacentPositions = [
      { hints: ["Uptown", "12 o'clock", "The High Ground"], x: 0, y: -1 }, // ทิศขึ้น (W / North)
      { hints: ["Underground", "6 o'clock", "The Basement"], x: 0, y: 1 }, // ทิศใต้ (S / Sorth)
      { hints: ["Sunset Beach", "9 o'clock", "The West Coast"], x: -1, y: 0 }, // ทิศซ้าย (A / West)
      { hints: ["Sushi Restaurant", "3 o'clock", "The East End"], x: 1, y: 0 }, // ทิศขวา (D / East)
    ];

    let bombDirs = [];
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

        // เช็คแค่ระเบิดและกระดูกเท่านั้น
        if (tile === icon.bomb || tile === icon.bone) {
          const randomIndex = Math.floor(Math.random() * pos.hints.length);
          const selectedHint = pos.hints[randomIndex];

          if (tile === icon.bomb) bombDirs.push(selectedHint);
          if (tile === icon.bone) boneDirs.push(selectedHint);
        }
      }
    }

    if (bombDirs.length > 0)
      console.log(
        `[Warning] Smell gunpowder from... ${bombDirs.join(" and ")}`,
      );
    if (boneDirs.length > 0)
      console.log(
        `[Hint] Smell something tasty from... ${boneDirs.join(" and ")}`,
      );

    if (bombDirs.length > 0 || boneDirs.length > 0) {
      console.log("------------------------------------------");
    }
  }

  //มาต่ออันที่ 4
}

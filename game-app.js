// step 1
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

//----------------------------------------------------------

class Field {
  // step 2 class field
  // step 3 Constructor: กำหนดค่าเริ่มต้นของเกม (State Management)
  constructor(field) {
    this.field = field; // แผนที่จริง (ให้สมองเกมเก็บไว้)
    this.playerX = 0; // ตำแหน่งแนวนอนเริ่มต้น
    this.playerY = 0; // ตำแหน่งแนวตั้งเริ่มต้น
    this.bonesCollected = 0;
    this.hasAngel = false;
    this.isGameOver = false;

    // Object สำหรับเก็บสถิติผู้เล่น
    this.stats = { holesFallen: 0, bombsHit: 0, angelsFound: 0, totalMoves: 0 };

    // ถ่ายเอกสารแผนที่ แล้วเปลี่ยนทุกอย่างให้เป็นช่องว่าง (ยกเว้นรูปเจ้าของ)
    this.displayGrid = this.field.map((row) =>
      row.map((tile) => (tile === icon.owner ? icon.owner : icon.unopened)),
    );

    // ตั้งค่าให้จุดเกิดเป็นรอยเท้าทางเดินไว้ก่อน
    this.displayGrid[0][0] = icon.opened;
  }

  //----------------------------------------------------------

  // step 4 printMap: ฟังก์ชันแสดงผลหน้าจอแบบซ่อนแผนที่ (Fog of War)

  printMap() {
    console.clear(); // ล้างกระดานเกมก่อนหน้าออก
    console.log("=== FIND MY BONES 𐂯  ੯·̀͡⬮ ===");
    console.log(
      `Bones: ${this.bonesCollected} | Angel: ${this.hasAngel ? "Active" : "None"} | Falls: ${this.stats.holesFallen}`,
    );
    console.log("------------------------------------------");

    // ดึงแผนที่แสดงผลมาวาดตารางแมป โดยเช็คแค่ว่าตัวละครยืนอยู่ตรงไหน
    const displayMap = this.displayGrid
      .map((row, y) => {
        return (
          row
            // เช็คว่าช่องที่กำลังวาด ตรงกับจุดที่หมายืนอยู่ไหม? ถ้าตรงใส่ไอคอนหมาทับ
            .map((tile, x) => {
              if (x === this.playerX && y === this.playerY) return icon.dog;
              return tile; // ถ้าไม่ใช่หมา ก็วาดช่องปกติ (⬜️ หรือ ⬛️)
            })
            .join("")
        );
      })
      .join("\n");

    console.log(displayMap); //แสดงผลออกมา
    console.log("------------------------------------------");

    // วาดแมป + ไอคอนหมา เสร็จแล้ว สั่งให้หมาดมกลิ่นบอกใบ้คนเล่น
    // checkDogSenses เรียกใช้ระบบบอกใบ้ก่อนให้ผู้เล่นตัดสินใจเดิน
    this.checkDogSenses();

    console.log("Control: W(Up), A(Left), S(Down), D(Right)");
    console.log("Command: 're' = restart, 'quit', or the secret code..");
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
      console.log(`[Warning] Smell gunpowder from.. ${bombDirs.join(" and ")}`);
    if (boneDirs.length > 0)
      console.log(
        `[Hint] Smell something tasty from.. ${boneDirs.join(" and ")}`,
      );

    if (bombDirs.length > 0 || boneDirs.length > 0) {
      console.log("------------------------------------------");
    }
  }

  //----------------------------------------------------------

  // 5. askQuestion: รับค่าจากคีย์บอร์ดและเปลี่ยนตำแหน่งพิกัด

  askQuestion() {
    const input = prompt("Move: ").toLowerCase();

    // จัดการคำสั่งพิเศษ
    if (input === "quit") {
      console.log("Goodbye!");
      process.exit(); // ปิดโปรแกรม
    }
    if (input === "re") return "RESTART";
    if (input === "magic") {
      this.revealFinalMap(false, true); // สั่งโชว์แมปจริง
      prompt("Cheat Active! Press Enter to continue...");
      return;
    }

    // แปลงปุ่มกด ให้กลายเป็นการขยับพิกัด
    switch (input) {
      case "w":
        this.playerY -= 1;
        break; // เดินขึ้น (Y ลดลง เพราะบรรทัดบนสุดคือ Y=0)
      case "s":
        this.playerY += 1;
        break; // เดินลง (Y เพิ่มขึ้น)
      case "a":
        this.playerX -= 1;
        break; // เดินซ้าย (X ลดลง)
      case "d":
        this.playerX += 1;
        break; // เดินขวา (X เพิ่มขึ้น)
      default:
        return; // // ถ้าพิมพ์มั่วๆ มา (เช่น พิมพ์ 'z') ก็ให้ข้ามไปเลย ไม่ต้องเดิน
    }

    this.stats.totalMoves++; // นับว่าเดินไปแล้วกี่ก้าว
    this.processMove(); // // ขยับเสร็จแล้ว ส่ง processMove เช็คผลลัพธ์
  }

  //----------------------------------------------------------

  // 6. processMove: ตรวจสอบการชนและเงื่อนไขของเกม
  processMove() {
    //เช็คว่าเดินตกขอบจอไหม
    if (this.isOutOfBounds()) {
      this.endGame("Went out of bounds!");
      return; // จบการทำงานฟังก์ชันนี้ทันทีไม่ต้องทำโค้ดข้างล่างต่อ
    }

    // ดูว่าพื้นตรงนั้นคืออะไร (อ่านค่าจาก แมปจริง ที่ซ่อนของไว้)
    const currentTile = this.field[this.playerY][this.playerX];

    // ใช้ Switch-Case แยกกรณีเหมือนแยกทางแยก
    switch (currentTile) {
      case icon.owner:
        this.winGame();
        break;

      //ถ้าเจอ bomb
      case icon.bomb:
        this.stats.bombsHit++; // เก็บสถิติว่าโดนระเบิด
        if (this.hasAngel) {
          // ถ้ารอดจากระเบิดเพราะนางฟ้า ให้ล้างสถานะนางฟ้าทิ้ง
          this.hasAngel = false;
          this.field[this.playerY][this.playerX] = icon.opened;
          this.displayGrid[this.playerY][this.playerX] = icon.opened;
        } else {
          // ถ้าไม่มีนางฟ้า คือตายและจบเกม
          this.endGame("Hit a bomb!");
          return;
        }
        break;

      //ถ้าเจอ hole
      case icon.hole:
        this.stats.holesFallen++;
        // ข้อความเมื่อตกหลุม
        console.log(
          "\n Whoa! Fell into an underground hole! Wait... where am I!!??",
        );
        prompt("Press Enter to continue...");

        this.field[this.playerY][this.playerX] = icon.opened;
        this.displayGrid[this.playerY][this.playerX] = icon.opened;
        this.teleportPlayer();
        return;

      //ถ้าเจอ bone
      case icon.bone:
        this.bonesCollected++; // บวกคะแนน
        // เปลี่ยนช่องนี้บนหน้าจอให้เป็นไอคอนกระดูกถาวร
        this.displayGrid[this.playerY][this.playerX] = icon.bone; // วาดกระดูกค้างไว้บนจอ
        // ลบกระดูกออกจาก Data Layer เพื่อกันเก็บซ้ำและกันดมกลิ่นเจออีก
        this.field[this.playerY][this.playerX] = icon.opened; // ลบออกจากแมปจริงเพื่อกันเก็บซ้ำ
        break;

      //ถ้าเจอ Angel
      case icon.angel:
        this.stats.angelsFound++;
        this.hasAngel = true;
        // เปลี่ยนช่องนี้บนหน้าจอให้เป็นไอคอนนางฟ้าถาวร
        this.displayGrid[this.playerY][this.playerX] = icon.angel;
        // ลบออกจาก Data Layer
        this.field[this.playerY][this.playerX] = icon.opened;
        break;

      default:
        this.displayGrid[this.playerY][this.playerX] = icon.opened;
        break;
    }
  }

  //----------------------------------------------------------
  // 7. processMove: ตรวจสอบการชนและเงื่อนไขของเกม

  // ถ้าแกน Y ติดลบ หรือ Y ทะลุขอบล่าง หรือ X ติดลบ หรือ X ทะลุขอบขวา -> ถือว่าตกขอบ
  isOutOfBounds() {
    return (
      this.playerY < 0 ||
      this.playerY >= this.field.length ||
      this.playerX < 0 ||
      this.playerX >= this.field[0].length
    );
  }

  // พอเจอหลุม สุ่มพิกัดใหม่บนแผนที่ทั้งหมด แล้วสั่งตรวจสอบการชนอีกครั้ง
  teleportPlayer() {
    let isSafe = false;

    // ตราบใดที่ยังไม่เจอที่ปลอดภัย (isSafe ยังเป็น false) ก็ให้สุ่มต่อไป
    while (!isSafe) {
      let newY = Math.floor(Math.random() * this.field.length);
      let newX = Math.floor(Math.random() * this.field[0].length);
      const destinationTile = this.field[newY][newX];

      // ถ้าช่องใหม่ที่สุ่มได้ ไม่ใช่ระเบิด และไม่ใช่หลุม
      if (destinationTile !== icon.bomb && destinationTile !== icon.hole) {
        this.playerY = newY; // ย้ายหมามาที่นี่
        this.playerX = newX;
        isSafe = true; // หยุดลูป
      }
    }
    this.processMove(); // ย้ายเสร็จแล้ว สั่งให้กรรมการเช็คช่องใหม่นี้ด้วย
  }

  //----------------------------------------------------------
  // 8. The Endings & Reveal

  // จัดการเมื่อชนะเกม
  winGame() {
    this.isGameOver = true;
    console.clear();
    this.revealFinalMap(); // เฉลยแผนที่ให้ดูความเทพตอนจบ
    console.log("\nSUCCESS! You found Mary!");
    this.showSummary();
  }

  // จัดการเมื่อแพ้เกม พร้อมโชว์แผนที่เฉลย
  endGame(message) {
    this.isGameOver = true;
    console.clear();
    this.revealFinalMap(true); // ตายทันที เกมจะไปเรียก endGame เพื่อเฉลยแผนที่
    console.log(`\nGAME OVER: ${message}`);
    this.showSummary();
  }

  // ฟังก์ชันสำหรับเฉลยแผนที่ทั้งหมด (ไอเทมทั้งหมดอยู่ตรงไหนจะโผล่มาตอนนี้)
  revealFinalMap(isDeath = false, isPeek = false) {
    if (isPeek) console.log("\n--- MAGIC PEEK MODE (DEVELOPER) ---");

    const finalMap = this.field
      .map((row, y) =>
        row
          .map((tile, x) => {
            // หากตาย ให้แสดงสัญลักษณ์ที่จุดตายเป็นระเบิดแตก
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
            // ช่องอื่นๆ ให้โชว์ตามสิ่งที่ผู้เล่นเปิดไว้แล้ว ถ้ายังไม่เปิดให้ใช้สัญลักษณ์ unopened
            return this.displayGrid[y][x] === icon.unopened
              ? "⬜️"
              : this.displayGrid[y][x];
          })
          .join(""),
      )
      .join("\n");

    console.log(finalMap);
  }

  // สรุป stats ท้ายเกม
  showSummary() {
    let rank = "";
    if (this.bonesCollected >= 9) {
      rank = "SUPER DOG (Epic job! You're the only last one standing.)";
    } else if (this.bonesCollected >= 5) {
      rank = "GOOD DOG (Well done!)";
    } else {
      rank = "NORMAL DOG (Keep practicing!)";
    }

    console.log("------------------------------------------");
    console.log(`RANK: ${rank}`);
    console.log(`Bones Collected: ${this.bonesCollected} / 12`);
    console.log(`Bombs Hit: ${this.stats.bombsHit}`);
    console.log(`Holes Fallen: ${this.stats.holesFallen}`);
    console.log("==========================================");

    // ถามว่าจะเล่นต่อมั้ย
    const playAgain = prompt("Play again? (y/n): ").toLowerCase();
    if (playAgain === "y") startGame();
    else process.exit();
  }

  // ฟังค์ชัน restart เริ่มใหม่ได้ระหว่างเกม
  runGame() {
    while (!this.isGameOver) {
      this.printMap();
      const action = this.askQuestion();
      if (action === "RESTART") return "RESTART";
    }
  }

  // โรงงานสร้างแผนที่แบบสุ่ม
  static generateField(height, width) {
    //สร้างพื้นที่ว่างขึ้นมาแบบ 2D array ขนาด 10 x 10 และเอาไอคอน unopened ไปใส่ทุกช่อง
    const field = new Array(height)
      .fill(0)
      .map(() => new Array(width).fill(icon.unopened));
    // ฟังก์ชันช่วยสุ่มวางของใช้ while loop สุ่มตำแหน่ง x และ y ไปเรื่อยๆ จนกว่าจะวางของครบตามจำนวน
    const placeItem = (item, amount, minDistance = 0) => {
      let placed = 0;
      while (placed < amount) {
        const y = Math.floor(Math.random() * height);
        const x = Math.floor(Math.random() * width);
        //ก่อนจะวางของ มันต้องเช็คเงื่อนไข 3 ข้อนี้ให้ผ่านทั้งหมด
        if (
          x + y >= minDistance && // ระบบ Safe Zone
          field[y][x] === icon.unopened && // ช่องนั้นต้องว่างอยู่ ห้ามวางของทับกัน
          (x !== 0 || y !== 0) //ห้ามวางทับจุดที่น้องหมาเกิด (0,0)
        ) {
          field[y][x] = item;
          placed++;
        }
      }
    };

    placeItem(icon.owner, 1, Math.floor((width + height) / 2)); // เป้าหมายอยู่ไกลสุด
    placeItem(icon.angel, 1, 3); // นางฟ้าอยู่ห่างอย่างน้อย 3 ก้าว
    placeItem(icon.bomb, Math.floor(height * width * 0.25), 3); // ระเบิด 25% (25 ลูก) ห่าง 3 ก้าว
    placeItem(icon.hole, Math.floor(height * width * 0.05), 3);
    placeItem(icon.bone, 12, 1);
    return field;
  }
}

// startGame() = ผู้คุมเกม
//จุดเริ่มต้นที่โปรแกรมจะทำงาน ที่ประกอบร่างทุกอย่างเข้าด้วยกัน

function startGame() {
  const myMap = Field.generateField(10, 10); // สั่งโรงงานให้สร้างแมป 10x10
  const myGame = new Field(myMap); // เอา map ไปใส่ในระบบเกม (สร้างน้องหมา)
  const result = myGame.runGame(); // สั่งให้เกมเริ่มเล่น (เข้าสู่ Loop จนกว่าจะตาย/ชนะ)
  if (result === "RESTART") startGame(); //ระบบเริ่มเกมใหม่ (Recursion)
}

startGame(); // เรียกทำงาน เริ่มเกม!

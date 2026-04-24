Find my bones (aka. Find my hats)
skills req. -> Object-Oriented Programming (OOP) + basic Logic in JS

ฺFIRST OF ALL:
check if prompt-sync is working?
package.json: ต้องมีชื่อ "prompt-sync"
node_modules: ต้องมีโฟลเดอร์ชื่อ prompt-sync

---

== Find my bones: what is this game about?
น้องหมา 🐶 เดินในแผนที่ เปิดไอคอนแต่ละจุดในแผนที่แล้วเจอดังนี้แบบสุ่ม
🦴 Bone = เก็บไปมอบให้เจ้าของ ยิ่งเก็บได้เยอะเลเวลจะขึ้นเยอะ จำนวนกระดูกเป็นตัววัด Level
เมื่อจบเกม1-3 ชิ้น = Normal Dog, 5-8 ชิ้น = Good dog, 9+ = Super Dog
💣 Bomb = game over
🕳️ Hole - ตกหลุมจะสุ่มน้องหมาไปเกิดในจุดแผนที่ใหม่ อาจใกล้หรือไกลกว่าจุด goal
🪽 Angel = นางฟ้าที่จะชุบชีวิตถ้าเจอ bomb ไม่ให้ game over
🧒🏻 Owner = เจ้าของอยู่ที่จุดนึงของ map แบบสุ่ม เป็น goal สุดท้ายที่ต้องเดินไปหาเพื่อชนะ

อื่นๆ
unopened-map ⬜️
opened-map ⬛️

---

Step 1: Understanding the Game State (ว่าต้องเก็บข้อมูลอะไรบ้าง?)
สมองของเกมที่ต้องจำค่าตลอดเวลา
Map Data: ตาราง 2D Array ที่เก็บไอคอนต่างๆ
Player Position: ค่า position x และ y ปัจจุบันของน้องหมา
Inventory/Status: จำนวนกระดูกที่เก็บได้ (bones), สถานะนางฟ้า (hasAngel), และสถานะเกมว่าจบหรือยัง (isGameOver)

Step 2: Input & Movement Logic (เดินยังไง?)
รับ Input (U, D, L, R) แล้วไปเปลี่ยนค่าแกน x หรือ y
ก่อนจะขยับจริงต้องเช็คก่อนว่า ออกนอกแมปไหม? ถ้าออกต้อง Game over ทันที isOutOfBounds()

Step 3: Collision Logic (เหยียบแล้วเจออะไร?)
check-in question: เมื่อเดินไปที่จุดใหม่ ต้องใช้ switch-case หรือ if-else เช็คคอนเทนต์ในช่องนั้น:
ถ้าเจอ Owner: ชนะ!
ถ้าเจอ Bone: bones++ และเปลี่ยนช่องนั้นเป็น opened-map
ถ้าเจอ Bomb: เช็ค hasAngel ถ้ามีให้รอด (ใช้แต้มบุญหมดไป) ถ้าไม่มีคือ Game Over
ถ้าเจอ Hole: สุ่มค่า x, y ใหม่ให้น้องหมาทันที (Teleport)
ในตอนที่ teleportPlayer() ทำงาน ให้ใส่ console.log บอก User ด้วย เดี๋ยวงงว่าเกิดอะไรขึ้น

Step 4: Map presentation
เริ่มต้น ⬜️
ใน this.field ยังคงมี 💣, 🦴 ซ่อนอยู่
ใช้ .map() สร้าง displayMap และเขียนเงื่อนไขดักไว้ว่า "ถ้าไม่ใช่หมา ไม่ใช่เจ้าของ และยังไม่เคยเดินผ่าน ให้โชว์ ⬜️ ทั้งหมด"

ระหว่างเกม จะใช้ opened-map (⬛️) ทับจุดที่เคยเดินผ่านแล้ว
พอตอนน้องหมาเดินไปเหยียบ ฟังก์ชัน processMove() จะไปอ่านค่าจาก this.field ที่เก็บของจริงไว้ ทำให้ระบบคำนวณถูกว่าโดนระเบิดหรือได้กระดูก และพอเดินออกไป ช่องนั้นก็จะถูกเปลี่ยนเป็นรอยเท้า ⬛️

วิธีรันเกม: node game-app.js

Step 5: คำสั่ง
user ควบคุม map ด้วย W/A/S/D
W = บน, A = ซ้าย, S = ล่าง, D = ขวา เพื่อให้รู้สึกคุ้นเคยเหมือนการควบคุมตัวละครในเกมอื่นๆ

พิมพ์ quit -> ออกจากเกม (Ctrl+C)
พิมพ์ re -> restart map ใหม่

Step 6: Stats
แถบสถานะนับ bone, angel, hole ว่าตกไปกี่ครั้ง, เจอ angel
จบเกมมีสรุป stats เหล่านี้ และ title ว่าเป็น normal / good / super dog

Step 7: Game Journey = Strategy + Dog senses
แนวเกมเป็น Turn-Based Strategy (แนววางแผนสลับตาเดิน) ผสมกับ Minesweeper
มี Fog of War (ซ่อนแมป) + ระบบคำใบ้ (Hint System)
ทำให้การพิมพ์ W, A, S, D ทีละก้าว เป็นการ วางแผน logic แทนที่การสุ่มดวง

Dog Senses คือคำใบ้ทิศทาง + ระบบเตือนภัย (Hints)
สร้างฟังก์ชันให้ระบบเช็ครอบๆ ตัวน้องหมา (บน ล่าง ซ้าย ขวา) ว่ามีอะไรซ่อนอยู่ไหม แล้วโชว์ข้อความเตือนก่อนที่ User จะเลือกเดิน

ทิศขึ้น (W / North)
hints: ["Uptown", "12 o'clock", "The High Ground"],
ทิศลง (S / South)
hints: ["Underground", "6 o'clock", "The Basement"],
ทิศซ้าย (A / West)
hints: ["Sunset Beach", "9 o'clock", "The West Coast"],
ทิศขวา (D / East)
hints: ["Sushi Restaurant", "3 o'clock", "The East End"],

Safe Zone (ระยะปลอดภัย): ในฟังก์ชัน generateField ระยะ 3 ก้าวแรกจากจุด (0,0) ไม่มีระเบิดและหลุม 100% ให้ผู้เล่นได้เปิดแมปตั้งตัวก่อน

สร้างแผนที่ขึ้นมา 2 แผ่นซ้อนกัน:
this.field (Data Layer): เก็บข้อมูลของจริงที่ซ่อนอยู่ (สมองเกม)
this.displayGrid (Presentation Layer): เก็บภาพหน้าจอที่เราจะพิมพ์ให้ผู้เล่นดู
เมื่อเดินไปเก็บ Bone, Angel เราจะลบของออกจาก this.field (เพื่อไม่ให้ดมกลิ่นเจอซ้ำและกันเก็บซ้ำ) แต่เราจะสลักไอคอนนั้นไว้บน this.displayGrid ถาวรแทน

ตายแล้วเฉลยแมป: ตอนจบเกม (Game Over) เพิ่มโค้ดเปิดแมปที่เหลือทั้งหมดให้ดูด้วยว่าจริงๆ แล้วระเบิดซ่อนอยู่ไหนบ้าง จะได้หายคาใจ

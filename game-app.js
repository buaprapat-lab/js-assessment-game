const prompt = require("prompt-sync")({ sigint: true });
// sigint: true ให้กด Ctrl+C ออกเกมได้

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

const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('data/mocktest.db');
db.prepare("DELETE FROM sections WHERE id != 'sec-mba'").run();
db.prepare("DELETE FROM exams WHERE id NOT IN ('exam-cat-2026', 'exam-xat-2026', 'exam-nmat-2026', 'exam-snap-2026')").run();
console.log('=== EXAMS IN DATABASE ===');
console.log(db.prepare('SELECT id, title, is_active FROM exams').all());
console.log('\n=== SECTIONS IN DATABASE ===');
console.log(db.prepare('SELECT id, name, is_active FROM sections').all());

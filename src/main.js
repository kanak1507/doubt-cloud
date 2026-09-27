import './style.css';
import { renderHome } from './views/home.js';
import { renderTeacherCreate } from './views/teacherCreate.js';
import { renderTeacherView } from './views/teacherView.js';
import { renderStudent } from './views/student.js';

const params = new URLSearchParams(window.location.search);
const sessionId = params.get('session');
const teacherMode = params.get('teacher');

if (teacherMode === 'create') {
  renderTeacherCreate();
} else if (teacherMode === 'view' && sessionId) {
  renderTeacherView(sessionId);
} else if (sessionId) {
  renderStudent(sessionId);
} else {
  renderHome();
}

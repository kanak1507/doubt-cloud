export function renderHome() {
  document.querySelector('#app').innerHTML = `
    <main class="page narrow">
      <div class="brand">DOUBT CLOUD</div>
      <section class="card hero">
        <span class="eyebrow">Anonymous classroom questions</span>
        <h1>See what the whole class is stuck on.</h1>
        <p>Students ask without judgment. Similar doubts merge into live bubbles for the teacher.</p>
        <div class="actions">
          <a class="button primary" href="/?teacher=create">Create teacher session</a>
          <p class="muted">Students should scan their teacher's QR code.</p>
        </div>
      </section>
    </main>
  `;
}

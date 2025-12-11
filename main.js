//------------------------------------------------------------
// 저장소 구조
//------------------------------------------------------------

// 전체 음성 저장소 (녹음/업로드/샘플)
function loadAllVoices() {
  return JSON.parse(localStorage.getItem("allVoices") || "[]");
}
function saveAllVoices(list) {
  localStorage.setItem("allVoices", JSON.stringify(list));
}

// 홈화면 즐겨찾기 저장소
function loadFavorites() {
  return JSON.parse(localStorage.getItem("favoriteVoices") || "[]");
}
function saveFavorites(list) {
  localStorage.setItem("favoriteVoices", JSON.stringify(list));
}

//------------------------------------------------------------
// 태그 변환 함수
//------------------------------------------------------------
function displayFromWhom(value) {
  const map = {
    mom: "엄마",
    dad: "아빠",
    lover: "연인",
    wife: "아내",
    husband: "남편",
    friend: "친구",
    child: "아이",
    me: "나"
  };
  return map[value] || value;
}

//------------------------------------------------------------
// 샘플 음성 (add.html에서 전체 리스트에 자동 추가 X)
// add.html 실행 시 처음 1회 자동 주입
//------------------------------------------------------------
const sampleVoices = [
  { title: "사랑해1", fileUrl: "assets/sample1.mp3", fromWhom: "아빠" },
  { title: "사랑해2", fileUrl: "assets/sample2.mp3", fromWhom: "엄마" }
];

function injectSamplesOnce() {
  const all = loadAllVoices();
  if (all.some(v => v.fromWhom === "샘플")) return; // 중복 방지

  sampleVoices.forEach(s => {
    all.push({
      id: crypto.randomUUID(),
      title: s.title,
      fileUrl: s.fileUrl,
      fromWhom: s.fromWhom,
      createdAt: Date.now()
    });
  });

  saveAllVoices(all);
}

//------------------------------------------------------------
// 녹음 / 업로드 파일 저장
//------------------------------------------------------------

async function blobToBase64(blob) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

async function saveRecordedVoice(blob, fromWhom) {
  const base64 = await blobToBase64(blob);
  addVoice("내 녹음", base64, fromWhom);
}

async function saveUploadedFile(file, fromWhom) {
  const base64 = await blobToBase64(file);
  addVoice(file.name, base64, fromWhom);
}

//------------------------------------------------------------
// 전체 음성 추가하기
//------------------------------------------------------------
function addVoice(title, fileUrl, fromWhom) {
  let all = loadAllVoices();

  all.push({
    id: crypto.randomUUID(),
    title,
    fileUrl,
    fromWhom,
    createdAt: Date.now()
  });

  saveAllVoices(all);
  alert("추가되었습니다!");
}

//------------------------------------------------------------
// 즐겨찾기 추가 / 삭제
//------------------------------------------------------------
function addToFavorite(id) {
  let fav = loadFavorites();
  if (!fav.includes(id)) fav.push(id);
  saveFavorites(fav);
  alert("홈화면 즐겨찾기에 추가되었습니다.");
}

function removeFavorite(id) {
  let fav = loadFavorites();
  fav = fav.filter(v => v !== id);
  saveFavorites(fav);
  renderFavoriteList();
}

//------------------------------------------------------------
// 전체 음성 삭제 (add.html 전용)
//------------------------------------------------------------
function deleteVoice(id) {
  let all = loadAllVoices();
  all = all.filter(v => v.id !== id);
  saveAllVoices(all);

  // 즐겨찾기에도 있으면 제거
  let fav = loadFavorites();
  fav = fav.filter(v => v !== id);
  saveFavorites(fav);

  renderAllVoices();
}

//------------------------------------------------------------
// 리스트 렌더링 — 홈(index.html)
//------------------------------------------------------------
function renderFavoriteList() {
  const fav = loadFavorites();
  const all = loadAllVoices();
  const container = document.getElementById("list");
  if (!container) return;

  container.innerHTML = "";

  fav.forEach(id => {
    const item = all.find(v => v.id === id);
    if (!item) return;

    const div = document.createElement("div");
    div.className = "list-item-card";

    div.innerHTML = `
      <div class="list-title">${item.title}</div>
      <div class="list-from">${displayFromWhom(item.fromWhom)}가 나에게…</div>
      <button class="primary small" onclick="new Audio('${item.fileUrl}').play()">▶ 재생</button>
      <button class="delete" onclick="removeFavorite('${item.id}')">🗑 삭제</button>
    `;

    container.appendChild(div);
  });
}

//------------------------------------------------------------
// 리스트 렌더링 — 추가하기(add.html)
//------------------------------------------------------------
function renderAllVoices() {
  const all = loadAllVoices();
  const container = document.getElementById("allList");
  if (!container) return;

  container.innerHTML = "";

  all.forEach(item => {
    const div = document.createElement("div");
    div.className = "list-item-card";

    div.innerHTML = `
      <div class="list-title">${item.title}</div>
      <div class="list-from">${displayFromWhom(item.fromWhom)}가 나에게…</div>
      <button class="primary small" onclick="addToFavorite('${item.id}')">★ 즐겨찾기</button>
      <button class="primary small" onclick="new Audio('${item.fileUrl}').play()">▶ 재생</button>
      <button class="delete" onclick="deleteVoice('${item.id}')">🗑 삭제</button>
    `;

    container.appendChild(div);
  });
}

//------------------------------------------------------------
// 랜덤 재생
//------------------------------------------------------------
function playRandomOne() {
  const fav = loadFavorites();
  const all = loadAllVoices();
  if (fav.length === 0) {
    alert("즐겨찾기가 비어 있습니다.");
    return;
  }
  const id = fav[Math.floor(Math.random() * fav.length)];
  const item = all.find(v => v.id === id);
  new Audio(item.fileUrl).play();
}

function playRandomLoop() {
  const fav = loadFavorites();
  const all = loadAllVoices();
  if (fav.length === 0) {
    alert("즐겨찾기가 비어 있습니다.");
    return;
  }

  function loop() {
    const id = fav[Math.floor(Math.random() * fav.length)];
    const item = all.find(v => v.id === id);
    const audio = new Audio(item.fileUrl);
    audio.play();
    audio.onended = loop;
  }
  loop();
}

//------------------------------------------------------------
// 초기 실행
//------------------------------------------------------------
window.onload = () => {
  injectSamplesOnce();
  renderFavoriteList();
  renderAllVoices();
};

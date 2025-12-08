//------------------------------------------------------------
// 샘플 음성
//------------------------------------------------------------
const samples = [
  { title: "따뜻한 사랑해", fileUrl: "assets/sample1.mp3", fromWhom: "샘플" },
  { title: "밝은 사랑해", fileUrl: "assets/sample2.mp3", fromWhom: "샘플" },
];

//------------------------------------------------------------
// 로컬 저장
//------------------------------------------------------------
function loadLoveList() {
  return JSON.parse(localStorage.getItem("loveList") || "[]");
}

function saveLoveList(list) {
  localStorage.setItem("loveList", JSON.stringify(list));
}

//------------------------------------------------------------
// 태그 변환
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
// 샘플 리스트 표시(add.html 전용)
//------------------------------------------------------------
if (document.getElementById("sampleList")) {
  const container = document.getElementById("sampleList");
  samples.forEach((item) => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <b>${item.title}</b><br>
      <button onclick="new Audio('${item.fileUrl}').play()">▶ 듣기</button>
      <button class="primary" onclick="addLove('${item.title}', '${item.fileUrl}', '샘플')">+ 추가</button>
    `;

    container.appendChild(div);
  });
}

//------------------------------------------------------------
// 저장 함수 (샘플 + 녹음 + 업로드)
//------------------------------------------------------------
function addLove(title, fileUrl, fromWhom) {
  let list = loadLoveList();

  list.push({
    id: crypto.randomUUID(),
    title,
    fileUrl,
    fromWhom,
    createdAt: Date.now()
  });

  saveLoveList(list);
  alert("추가되었습니다!");
}

//------------------------------------------------------------
// 녹음 기능(add.html 전용)
//------------------------------------------------------------
let mediaRecorder;
let audioChunks = [];
let recordedBlob = null;

function startRecording() {
  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.start();

    mediaRecorder.ondataavailable = e => audioChunks.push(e.data);

    mediaRecorder.onstop = () => {
      recordedBlob = new Blob(audioChunks, { type: "audio/mp3" });
      const url = URL.createObjectURL(recordedBlob);
      document.getElementById("previewAudio").src = url;
      document.getElementById("previewAudio").style.display = "block";
    };
  });
}

function stopRecording() {
  if (mediaRecorder) mediaRecorder.stop();
}

//------------------------------------------------------------
// 저장하기 버튼(add.html)
//------------------------------------------------------------
function saveVoice() {
  const fromWhom = getFromWhom();

  // 녹음 파일 우선
  if (recordedBlob) {
    const url = URL.createObjectURL(recordedBlob);
    addLove("내 녹음", url, fromWhom);
    return;
  }

  // 업로드 파일
  const file = document.getElementById("fileUpload").files[0];
  if (file) {
    const url = URL.createObjectURL(file);
    addLove(file.name, url, fromWhom);
    return;
  }

  alert("녹음 또는 파일 업로드를 먼저 해주세요.");
}

//------------------------------------------------------------
// 랜덤 재생 (홈 화면)
//------------------------------------------------------------
function playRandomOne() {
  const list = loadLoveList();
  if (list.length === 0) {
    alert("저장된 사랑해가 없습니다.");
    return;
  }
  const pick = list[Math.floor(Math.random() * list.length)];
  new Audio(pick.fileUrl).play();
}

function playRandomLoop() {
  const list = loadLoveList();
  if (list.length === 0) {
    alert("저장된 사랑해가 없습니다.");
    return;
  }

  function loop() {
    const pick = list[Math.floor(Math.random() * list.length)];
    const audio = new Audio(pick.fileUrl);
    audio.play();
    audio.onended = loop;
  }
  loop();
}

//------------------------------------------------------------
// 태그 선택(add.html)
//------------------------------------------------------------
function getFromWhom() {
  const checked = document.querySelector("input[name='fromWhom']:checked");

  if (!checked) return "나";

  if (checked.value === "custom") {
    const text = document.getElementById("customInput").value.trim();
    return text !== "" ? text : "나";
  }

  return checked.value;
}

//------------------------------------------------------------
// 삭제 기능
//------------------------------------------------------------
function deleteLoveVoice(id) {
  let list = loadLoveList();
  list = list.filter(item => item.id !== id);
  saveLoveList(list);
  renderLoveList();
}

//------------------------------------------------------------
// 리스트 렌더링(index.html 전용)
//------------------------------------------------------------
function renderLoveList() {
  const list = loadLoveList();
  const container = document.getElementById("list");
  if (!container) return;

  container.innerHTML = "";

  list
    .sort((a, b) => b.createdAt - a.createdAt)
    .forEach(item => {
      const div = document.createElement("div");
      div.className = "list-item-card";

      div.innerHTML = `
        <div class="list-title">${item.title}</div>
        <div class="list-from">${displayFromWhom(item.fromWhom)}가 나에게…</div>
        <button class="primary small" onclick="new Audio('${item.fileUrl}').play()">▶ 재생</button>
        <button class="delete" onclick="deleteLoveVoice('${item.id}')">🗑 삭제</button>
      `;

      container.appendChild(div);
    });
}

window.onload = renderLoveList;

// 샘플 음성
const samples = [
  { title: "따뜻한 사랑해", file: "assets/sample1.mp3" },
  { title: "밝은 사랑해", file: "assets/sample2.mp3" },
];

// 오늘의 랜덤 사랑해
function playToday() {
  const random = samples[Math.floor(Math.random() * samples.length)];
  const audio = new Audio(random.file);
  audio.play();
}

// 샘플 리스트 표시
if (document.getElementById("sampleList")) {
  const container = document.getElementById("sampleList");
  samples.forEach((item) => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <b>${item.title}</b><br>
      <button onclick="new Audio('${item.file}').play()">▶ 듣기</button>
      <button class='primary' onclick="addLove('${item.title}', '${item.file}')">+ 추가</button>
    `;
    container.appendChild(div);
  });
}

// 저장 리스트
function addLove(title, file) {
  let list = JSON.parse(localStorage.getItem("loveList") || "[]");
  list.push({ title, file });
  localStorage.setItem("loveList", JSON.stringify(list));
  alert("추가되었습니다!");
}

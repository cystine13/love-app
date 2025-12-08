//------------------------------------------------------------
// 로컬 저장 로직
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

function getFromWhom() {
    const checked = document.querySelector("input[name='fromWhom']:checked");

    if (!checked) return "me";

    if (checked.value === "custom") {
        const text = document.getElementById("customInput").value.trim();
        return text !== "" ? text : "나";
    }

    return checked.value;
}

//------------------------------------------------------------
// 음성 추가
//------------------------------------------------------------
function addLoveVoice(title, fileUrl, fromWhom) {
    const list = loadLoveList();

    list.push({
        id: crypto.randomUUID(),
        title,
        fileUrl,
        fromWhom,
        createdAt: Date.now()
    });

    saveLoveList(list);
    alert("저장되었습니다!");
    window.location.href = "index.html";
}

//------------------------------------------------------------
// 녹음 기능
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
// 저장하기
//------------------------------------------------------------
function saveVoice() {
    const fromWhom = getFromWhom();

    // 녹음된 음성 우선
    if (recordedBlob) {
        const url = URL.createObjectURL(recordedBlob);
        addLoveVoice("내 녹음", url, fromWhom);
        return;
    }

    // 업로드된 파일
    const file = document.getElementById("fileUpload").files[0];
    if (file) {
        const url = URL.createObjectURL(file);
        addLoveVoice(file.name, url, fromWhom);
        return;
    }

    alert("녹음 또는 파일 업로드를 먼저 해주세요.");
}

//------------------------------------------------------------
// 삭제
//------------------------------------------------------------
function deleteLoveVoice(id) {
    let list = loadLoveList();
    list = list.filter(item => item.id !== id);
    saveLoveList(list);
    renderLoveList();
}

//------------------------------------------------------------
// 랜덤 재생
//------------------------------------------------------------
function playRandomOne() {
    const list = loadLoveList();
    if (list.length === 0) return alert("저장된 음성이 없습니다.");
    const pick = list[Math.floor(Math.random() * list.length)];
    new Audio(pick.fileUrl).play();
}

function playRandomLoop() {
    const list = loadLoveList();
    if (list.length === 0) return alert("저장된 음성이 없습니다.");

    function loop() {
        const pick = list[Math.floor(Math.random() * list.length)];
        const audio = new Audio(pick.fileUrl);
        audio.play();
        audio.onended = loop;
    }
    loop();
}

//------------------------------------------------------------
// 리스트 렌더링
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
            div.className = "card";

            div.innerHTML = `
                <b>${item.title}</b><br>
                <small>${displayFromWhom(item.fromWhom)}가 나에게…</small><br>
                <button onclick="new Audio('${item.fileUrl}').play()">▶ 재생</button>
                <button class="delete" onclick="deleteLoveVoice('${item.id}')">🗑 삭제</button>
            `;
            container.appendChild(div);
        });
}

window.onload = renderLoveList;

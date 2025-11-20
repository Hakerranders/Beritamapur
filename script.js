let beritaData = [];
const body = document.body;
const origin = location.origin + location.pathname.replace(/\/[^/]*$/, ""); // base path

// load data
fetch("data.json")
  .then(r => r.json())
  .then(data => {
    beritaData = data;
    initPage();
  })
  .catch(e => console.error(e));

function initPage(){
  // headline
  if (document.getElementById("headline-title")){
    const first = beritaData[0];
    document.getElementById("headline-title").innerText = first.judul;
    document.getElementById("headline-date").innerText = first.tanggal;
    // set hero image if available
    if (first.gambar) document.querySelector(".hero").style.backgroundImage =
      `linear-gradient(rgba(0,0,0,0.35),rgba(0,0,0,0.35)), url('${first.gambar}')`;
  }

  // news list
  if (document.getElementById("news-list")){
    tampilkanBerita(beritaData);
    // trending
    const trending = beritaData.slice(0,5).map((b,i)=> `<li onclick="openDetail(${i})">${b.judul}</li>`).join("");
    document.getElementById("trendingList").innerHTML = trending;
  }
}

// render cards
function tampilkanBerita(list){
  const container = document.getElementById("news-list");
  container.innerHTML = "";
  list.forEach((item, i) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <img src="${item.gambar || 'https://via.placeholder.com/1000x600'}" alt="">
      <div class="inner">
        <h2>${item.judul}</h2>
        <div class="tgl">${item.tanggal}</div>
        <p>${item.isi.substring(0,140).replace(/\n/g,' ') }...</p>
        <div style="margin-top:10px;display:flex;gap:8px">
          <button class="share-btn" onclick="shareArticle(${i})">Share</button>
          <a class="back-btn" style="background:#06b" onclick="openDetail(${i})">Baca</a>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// open detail
function openDetail(id){
  window.location.href = `detail.html?id=${id}`;
}

// search
function searchNews(){
  const q = (document.getElementById("searchInput") || {value:""}).value.toLowerCase();
  const filtered = beritaData.filter(b => (b.judul + " " + b.isi).toLowerCase().includes(q));
  tampilkanBerita(filtered);
}

/* ---------- SHARE FEATURES ---------- */

// build article url (works for local files: use location.href base)
function articleUrl(id){
  // if running as file:// detail links may not work perfectly; here we build relative link
  return `${location.origin}${location.pathname.replace(/\/[^/]*$/, "/") }detail.html?id=${id}`;
}

// primary share function for card
function shareArticle(id){
  const url = articleUrl(id);
  const item = beritaData[id];
  const text = `${item.judul} - ${url}`;

  // Web Share API
  if (navigator.share){
    navigator.share({title: item.judul, text: item.judul, url}).catch(()=>{});
    return;
  }

  // fallback: open WhatsApp web
  const wa = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(wa, "_blank");
}

// share from detail page (device / fallback)
function shareCurrent(){
  const params = new URLSearchParams(location.search);
  const id = params.get("id") || 0;
  const url = articleUrl(id);
  const item = beritaData[id] || {};
  const text = `${item.judul}\n\n${item.isi?.substring(0,180) || ""}\n\n${url}`;

  if (navigator.share){
    navigator.share({title:item.judul, text, url}).catch(()=>{});
    return;
  }
  // fallback: copy
  copyToClipboard(url);
  alert("Link disalin. Kamu bisa paste di Instagram atau aplikasi lain.");
}

function shareWhatsApp(){
  const params = new URLSearchParams(location.search);
  const id = params.get("id") || 0;
  const url = articleUrl(id);
  const item = beritaData[id] || {};
  const text = `${item.judul} - ${url}`;
  const wa = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(wa, "_blank");
}

function copyLink(){
  const params = new URLSearchParams(location.search);
  const id = params.get("id") || 0;
  const url = articleUrl(id);
  copyToClipboard(url);
  alert("Link artikel disalin ke clipboard.");
}

function copyToClipboard(text){
  if (navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).catch(()=>{});
  } else {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }
}

/* DARK MODE */
function toggleDark(){
  body.classList.toggle("dark");
  localStorage.setItem("theme", body.classList.contains("dark") ? "dark" : "light");
}
if (localStorage.getItem("theme")==="dark") body.classList.add("dark");
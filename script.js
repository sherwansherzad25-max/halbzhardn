/* ─── FIREBASE SETUP ─── */
const firebaseConfig = {
    apiKey: "AIzaSyDej86q1Zs-MX6WSC8V_TXor9fCpf8ew9A",
    authDomain: "malband-halbzhardn.firebaseapp.com",
    projectId: "malband-halbzhardn",
    storageBucket: "malband-halbzhardn.firebasestorage.app",
    messagingSenderId: "691254032539",
    appId: "1:691254032539:web:99e64360e0c9887a322e3e"
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// بەردەوام گوێگرتن لە فایربەیس و نوێکردنەوەی لۆکاڵ ستۆراج بۆ ئەوەی سیستەمەکە ڕاستەوخۆ (لایڤ) بێت
database.ref('electionDB').on('value', (snapshot) => {
    const data = snapshot.val() || {};
    localStorage.setItem('electionDB', JSON.stringify(data));
    // ئەگەر ئەدمین لەناو داشبۆردە، با ڕاستەوخۆ شاشەکەی بۆ نوێ ببێتەوە بێ ڕیفرێش
    if(currentUser && currentUser.role === 'dashboard'){
        updateDashboardFromLocal();
    }
});

/* ─── DATA ─── */
let partiesData=[
  {name:"یەکێتی نیشتمانی",votes:0,color:"#00ffd5"},
  {name:"پارتی دیموکرات",  votes:0,color:"#ffab00"},
  {name:"بزووتنەوەی گۆڕان",votes:0,color:"#2979ff"},
  {name:"یەکگرتووی ئیسلامی",votes:0,color:"#00bcd4"},
  {name:"نەوەی نوێ",       votes:0,color:"#ff6d00"},
  {name:"کۆمەڵی دادگەری",  votes:0,color:"#90a4ae"},
  {name:"بەرەی گەل",       votes:0,color:"#7c4dff"},
  {name:"ڕەوتی هەڵوێست",   votes:0,color:"#e91e63"},
  {name:"لایەنەکانی تر",   votes:0,color:"#607d8b"}
];
let candidatesData=[];
for(let i=1;i<=50;i++) candidatesData.push({num:i,votes:0});

const electionData={
  "1":[
    {id:"127901",name:"مدرسە رۆز الاساسیە (127901)",stations:5},
    {id:"127902",name:"مدرسە فقی قادر الاساسیە (127902)",stations:5},
    {id:"127903",name:"مدرسە اردلان الاساسیە (127903)",stations:5},
    {id:"127904",name:"كلیە التربیە (127904)",stations:5},
    {id:"127905",name:"اعدادیە توار للبنات (127905)",stations:5},
    {id:"127906",name:"متوسطە زانیاری (127906)",stations:5},
    {id:"127907",name:"مدرسە خاك الاساسیە (127907)",stations:5}
  ],
  "2":[
    {id:"227901",name:"مدرسە چمچمال الاساسیە (227901)",stations:5},
    {id:"227902",name:"مدرسە الاختر الاساسیە (227902)",stations:5},
    {id:"127903",name:"مدرسە شهید الاساسیە (127903)",stations:5},
    {id:"227904",name:"مدرسە سپی حسار الاساسیە (227904)",stations:5},
    {id:"227905",name:"اعدادیە چمچمال (227905)",stations:5},
    {id:"227906",name:"متوسطە چەمی ڕێزان (227906)",stations:5},
    {id:"227907",name:"متوسطە رەنگین للبنات (227907)",stations:5}
  ],
  "3":[
    {id:"128001",name:"مدرسە بیشەوا الاساسیە (128001)",stations:5},
    {id:"128002",name:"مدرسە باباكوركور الاساسیە (128002)",stations:5},
    {id:"128003",name:"مدرسە رزگاری الاساسیە (128003)",stations:5},
    {id:"128004",name:"مدرسە ئاریا الاساسیە (128004)",stations:5},
    {id:"128005",name:"مدرسە بلند الاساسیە (128005)",stations:5},
    {id:"128006",name:"مدرسە خالخالان الاساسیە (128006)",stations:5},
    {id:"128007",name:"متوسطە نیشتیمان (128007)",stations:5},
    {id:"128008",name:"مدرسە ریباز الاساسیە (128008)",stations:5},
    {id:"128009",name:"مدرسە زیرك الاساسیە (128009)",stations:5},
    {id:"228001",name:"متوسطە سنكاو للبنین (228001)",stations:5}
  ],
  "4":[
    {id:"129401",name:"مدرسە بوتان الاساسیە (129401)",stations:5},
    {id:"129402",name:"مدرسە دابان الاساسیە (129402)",stations:5},
    {id:"129403",name:"مدرسە درسیم الاساسیە (129403)",stations:5},
    {id:"129404",name:"مدرسە ماردین الاساسیە (129404)",stations:5},
    {id:"129405",name:"متوسطە تەكیە (129405)",stations:5},
    {id:"129406",name:"مدرسە بەردەقارەمان الاساسیە (129406)",stations:5},
    {id:"227908",name:"مدرسە قەرەناو الاساسیە (227908)",stations:5},
    {id:"229401",name:"مدرسە ئاغجلر الاساسیە (229401)",stations:5},
    {id:"229402",name:"مدرسە قەلاسیوكە بنەرەتی (229402)",stations:5}
  ]
};

/* ─── RBAC ─── */
const RBAC_USERS={
  'supervisor':     {pass:'2026', role:'dashboard'},
  'karmand1':       {pass:'1111', role:'form', zones:['1']},
  'karmand2':       {pass:'2222', role:'form', zones:['2']},
  'karmand3':       {pass:'3333', role:'form', zones:['3'], exclude:['228001']},
  'karmand3_sangaw':{pass:'3333s',role:'form', zones:['3'], include:['228001']},
  'karmand4':       {pass:'4444', role:'form', zones:['4'], exclude:['227908','229401','229402']},
  'karmand4_taybat':{pass:'4444t',role:'form', zones:['4'], include:['227908','229401','229402']}
};
let currentUser=null;

/* ─── LOGIN & DASHBOARD CONNECTIONS ─── */
function attemptLogin(){
  const u=document.getElementById('username').value.trim();
  const p=document.getElementById('password').value;
  const e=document.getElementById('loginError');
  if(RBAC_USERS[u]&&RBAC_USERS[u].pass===p){
    e.style.display='none';
    document.getElementById('login-section').style.display='none';
    currentUser=RBAC_USERS[u];
    if(currentUser.role==='dashboard'){
      document.getElementById('dashboard-section').style.display='block';
      updateDashboardFromLocal();
      startLiveTimer(); 
    } else {
      document.getElementById('app-section').style.display='block';
      setupFormAccess(currentUser);
    }
  } else { e.style.display='block'; }
}
function logout(){ if(confirm('دەتەوێت دەربچیت؟')) location.reload(); }

/* ── تایمەری زیندوو ── */
function startLiveTimer() {
  setInterval(() => {
    const now = new Date();
    document.getElementById('liveTimerDisplay').innerHTML = `<i class="fas fa-clock"></i> ${now.toLocaleTimeString('en-US', {hour12: false})}`;
  }, 1000);
}

/* ── پێشکەوتوو: پاراستن و پاڵاوتنی (فلتەرکردنی) داتاکان بەپێی هەڵبژاردن ── */
function updateDashboardFromLocal() {
    let localDB = JSON.parse(localStorage.getItem('electionDB')) || {};
    let keys = Object.keys(localDB);

    // هێنانی بەهاکانی فلتەرەکان
    let selZone = document.getElementById('baznaSelect').value;
    let selCenter = document.getElementById('binkaSelect').value;
    let selStation = document.getElementById('westgaSelect').value;

    let totalValid = 0, totalInvalid = 0, totalPuk = 0;
    partiesData.forEach(p => p.votes = 0);
    candidatesData.forEach(c => c.votes = 0);

    keys.forEach(key => {
        let parts = key.split('_'); // zone_centerId_station
        let kZone = parts[0];
        let kCenter = parts[1];
        let kStation = parts[2];

        // مەرجەکانی فلتەرکردن (ئەگەر گشتی نەبوو و یەکسان نەبوو بە هەڵبژێردراوەکە، بەسەریدا بپەڕەوە)
        if (selZone !== 'all' && kZone !== selZone) return;
        if (selCenter !== 'all' && kCenter !== selCenter) return;
        if (selStation !== 'all' && kStation !== selStation) return;

        let d = localDB[key];
        totalValid += parseInt(d.validVotes) || 0;
        totalInvalid += parseInt(d.invalidVotes) || 0;
        totalPuk += parseInt(d.puk) || 0;

        let partyMap = {
            "یەکێتی نیشتمانی": d.puk, "پارتی دیموکرات": d.pdk, "بزووتنەوەی گۆڕان": d.gorran,
            "یەکگرتووی ئیسلامی": d.kiu, "نەوەی نوێ": d.neway, "کۆمەڵی دادگەری": d.komal,
            "بەرەی گەل": d.baray, "ڕەوتی هەڵوێست": d.halwest, "لایەنەکانی تر": d.other
        };
        partiesData.forEach(p => { p.votes += parseInt(partyMap[p.name]) || 0; });

        for (let i = 1; i <= 50; i++) {
            let candVote = parseInt(d.candidates[i]) || 0;
            let candObj = candidatesData.find(c => c.num === i);
            if (candObj) candObj.votes += candVote;
        }
    });

    document.getElementById('totalVoters').innerText = (totalValid + totalInvalid).toLocaleString();
    document.getElementById('validVotesDash').innerText = totalValid.toLocaleString();
    document.getElementById('invalidVotesDash').innerText = totalInvalid.toLocaleString();
    document.getElementById('pukVotesDash').innerText = totalPuk.toLocaleString();

    renderParties();
    renderCandidates();
    renderStationsStatus(localDB, selZone, selCenter, selStation); 
}

/* ── لیستی ڕەوشی وێستگەکان بە فلتەرکراوی ── */
function renderStationsStatus(localDB, selZone, selCenter, selStation) {
    let container = document.getElementById('stationsStatusContainer');
    let html = '';
    
    for (let zone in electionData) {
        if (selZone !== 'all' && zone !== selZone) continue; // فلتەری بازنە

        electionData[zone].forEach(center => {
            if (selCenter !== 'all' && center.id !== selCenter) return; // فلتەری بنکە

            for (let i = 1; i <= center.stations; i++) {
                if (selStation !== 'all' && i.toString() !== selStation) continue; // فلتەری وێستگە

                let key = `${zone}_${center.id}_${i}`;
                if (localDB[key]) {
                    html += `<div class="station-status-row st-ok">
                                <div>بازنەی ${zone} — ${center.name} — وێستگەی ${i}</div>
                                <span><i class="fas fa-check-circle"></i> تۆمارکراوە</span>
                             </div>`;
                } else {
                    html += `<div class="station-status-row st-bad">
                                <div>بازنەی ${zone} — ${center.name} — وێستگەی ${i}</div>
                                <span><i class="fas fa-times-circle"></i> هێشتا نەنووسراوە</span>
                             </div>`;
                }
            }
        });
    }
    container.innerHTML = html || '<div style="text-align:center; color:gray; font-size:0.85rem; padding:10px;">هیچ وێستگەیەک نەدۆزرایەوە بۆ ئەم فلتەرە.</div>';
}

/* ── پاراستنی داتا (Backup JSON) ── */
function exportBackupJSON() {
    const db = localStorage.getItem('electionDB');
    if (!db) { alert("هیچ داتایەک نییە بۆ پاراستن!"); return; }
    const blob = new Blob([db], { type: "application/json" });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Election_Backup_${new Date().getTime()}.json`;
    a.click();
}

function importBackupJSON(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const json = JSON.parse(e.target.result);
            
            // گۆڕانکاری: کاتێک باکئەپ دەهێنیتەوە، یەکسەر دەینێرێت بۆ فایربەیس!
            firebase.database().ref('electionDB').set(json).then(() => {
                alert("داتاکان بە سەرکەوتوویی هێنرانەوە و خرانە سەر فایربەیس!");
                updateDashboardFromLocal();
            });
            
        } catch (err) {
            alert("فایلەکە هەڵەیە یان نەخوێندراوەتەوە.");
        }
    };
    reader.readAsText(file);
}

/* ─── DASHBOARD FILTERS ─── */
function updateCenters(){
  const b=document.getElementById('baznaSelect').value;
  const bs=document.getElementById('binkaSelect');
  const ws=document.getElementById('westgaSelect');
  bs.innerHTML='<option value="all">گشتی</option>';
  ws.innerHTML='<option value="all">گشتی</option>';
  if(b!=='all'&&electionData[b]) electionData[b].forEach(c=>bs.innerHTML+=`<option value="${c.id}" data-stations="${c.stations}">${c.name}</option>`);
  
  updateDashboardFromLocal(); // نوێکردنەوەی داتاکان کاتی گۆڕینی بازنە
}
function updateStations(){
  const sel=document.getElementById('binkaSelect');
  const ws=document.getElementById('westgaSelect');
  ws.innerHTML='<option value="all">گشتی</option>';
  const opt=sel.options[sel.selectedIndex];
  if(opt&&opt.value!=='all'){
    const cnt=parseInt(opt.getAttribute('data-stations'))||0;
    for(let i=1;i<=cnt;i++) ws.innerHTML+=`<option value="${i}">وێستگەی ${i}</option>`;
  }

  updateDashboardFromLocal(); // نوێکردنەوەی داتاکان کاتی گۆڕینی بنکە
}

/* ─── DASHBOARD RENDER ─── */
function renderParties(){
  partiesData.sort((a,b)=>b.votes-a.votes);
  const total=partiesData.reduce((s,p)=>s+p.votes,0);
  document.getElementById('partiesContainer').innerHTML=partiesData.map(p=>{
    const pct=total>0?(p.votes/total)*100:0;
    const isPuk=p.name.includes('یەکێتی');
    return `<div class="prow">
      <div class="pnm ${isPuk?'puk':''}">${p.name}</div>
      <div class="ptrack"><div class="pfill" style="width:${pct}%;background:${p.color};"></div></div>
      <div class="pct ${isPuk?'puk':''}">${p.votes.toLocaleString()}</div>
    </div>`;
  }).join('');
}
function renderCandidates(){
  const q=document.getElementById('candidateSearch').value.trim();
  let filtered=candidatesData;
  if(q){
    const allowed=new Set();
    q.split(',').forEach(part=>{
      if(part.includes('-')){const[a,b]=part.split('-').map(Number);if(!isNaN(a)&&!isNaN(b))for(let i=Math.min(a,b);i<=Math.max(a,b);i++)allowed.add(i);}
      else{const n=parseInt(part);if(!isNaN(n))allowed.add(n);}
    });
    if(allowed.size>0) filtered=candidatesData.filter(c=>allowed.has(c.num));
  }
  filtered.sort((a,b)=>b.votes-a.votes);
  document.getElementById('candidatesContainer').innerHTML=filtered.map((c,i)=>{
    const bc=i===0?'g1':i===1?'g2':i===2?'g3':'';
    return `<div class="crow">
      <div class="crow-l">
        <div class="cbadge ${bc}">${i+1}</div>
        <div class="cnm">کاندیدی ژمارە <strong>${c.num}</strong></div>
      </div>
      <div class="cscore">${c.votes.toLocaleString()}</div>
    </div>`;
  }).join('');
}

/* ─── FORM ACCESS ─── */
function setupFormAccess(u){
  const z=document.getElementById('formZoneSelect');
  z.innerHTML='<option value="">بازنە هەڵبژێرە...</option>';
  u.zones.forEach(v=>{
    const names={'1':'بازنەی ١ — ڕۆژهەڵاتی چەمچەماڵ','2':'بازنەی ٢ — ڕۆژئاوای چەمچەماڵ','3':'بازنەی ٣ — شۆڕش','4':'بازنەی ٤ — تەکیە و ئاغجەلەر'};
    z.innerHTML+=`<option value="${v}">${names[v]}</option>`;
  });
  if(u.zones.length===1){z.value=u.zones[0];z.disabled=true;updateFormCenters();}
}
function updateFormCenters(){
  const z=document.getElementById('formZoneSelect');
  const c=document.getElementById('formCenterSelect');
  const s=document.getElementById('formStationSelect');
  c.innerHTML='<option value="">بنکە هەڵبژێرە...</option>';
  s.innerHTML='<option value="">...</option>';s.disabled=true;clearForm();
  const zone=z.value;if(!zone)return;
  let centers=electionData[zone]||[];
  if(currentUser.include)centers=centers.filter(c=>currentUser.include.includes(c.id));
  if(currentUser.exclude)centers=centers.filter(c=>!currentUser.exclude.includes(c.id));
  centers.forEach(cx=>c.innerHTML+=`<option value="${cx.id}" data-stations="${cx.stations}">${cx.name}</option>`);
  c.disabled=false;
}
function updateFormStations(){
  const c=document.getElementById('formCenterSelect');
  const s=document.getElementById('formStationSelect');
  s.innerHTML='<option value="">وێستگە...</option>';clearForm();
  const opt=c.options[c.selectedIndex];
  if(opt&&opt.value){
    const cnt=parseInt(opt.getAttribute('data-stations'))||0;
    for(let i=1;i<=cnt;i++)s.innerHTML+=`<option value="${i}">وێستگەی ${i}</option>`;
    s.disabled=false;
  }else s.disabled=true;
}
function onStationChange(){
  clearForm();
  const zone=document.getElementById('formZoneSelect').value;
  const center=document.getElementById('formCenterSelect').value;
  const station=document.getElementById('formStationSelect').value;
  if(!zone||!center||!station)return;
  const key=zone+'_'+center+'_'+station;
  const db=JSON.parse(localStorage.getItem('electionDB'))||{};
  const btn=document.getElementById('mainSubmitBtn');
  if(db[key]){fillFormWithData(db[key]);btn.innerHTML='<i class="fas fa-edit"></i> نوێکردنەوەی زانیارییەکان';btn.classList.add('upd');}
  else{btn.innerHTML='<i class="fas fa-save"></i> تۆمارکردنی داتاکان';btn.classList.remove('upd');}
  checkFormTotals();
}

/* ─── CANDIDATE INPUTS ─── */
const fcc=document.getElementById('formCandidatesContainer');
for(let i=1;i<=50;i++){
  const d=document.createElement('div');d.className='ccell';
  d.innerHTML=`<span class="ccell-lbl">${i}</span><input type="number" class="fcand-input formClearable" id="fcand_${i}" oninput="checkFormCandidates()">`;
  fcc.appendChild(d);
}
fcc.addEventListener('keydown',e=>{
  if(e.target.classList.contains('fcand-input')){
    const cur=parseInt(e.target.id.split('_')[1]);
    if(e.key==='Enter'||e.key==='ArrowDown'){e.preventDefault();if(cur<50)document.getElementById('fcand_'+(cur+1)).focus();}
    else if(e.key==='ArrowUp'){e.preventDefault();if(cur>1)document.getElementById('fcand_'+(cur-1)).focus();}
  }
});

/* ─── FORM HELPERS ─── */
function clearForm(){
  document.querySelectorAll('.formClearable').forEach(i=>i.value='');
  const btn=document.getElementById('mainSubmitBtn');
  btn.innerHTML='<i class="fas fa-save"></i> تۆمارکردنی داتاکان';btn.classList.remove('upd');
  checkFormTotals();
}
function fillFormWithData(d){
  document.getElementById('fValidVotes').value=d.validVotes||'';
  document.getElementById('fInvalidVotes').value=d.invalidVotes||'';
  document.getElementById('fPukVotes').value=d.puk||'';
  document.getElementById('fPdkVotes').value=d.pdk||'';
  document.getElementById('fGorranVotes').value=d.gorran||'';
  document.getElementById('fKiuVotes').value=d.kiu||'';
  document.getElementById('fNewayVotes').value=d.neway||'';
  document.getElementById('fKomalVotes').value=d.komal||'';
  document.getElementById('fBarayVotes').value=d.baray||'';
  document.getElementById('fHalwestVotes').value=d.halwest||'';
  document.getElementById('fOtherVotes').value=d.other||'';
  for(let i=1;i<=50;i++)document.getElementById('fcand_'+i).value=d.candidates[i]||'';
}
function gatherFormData(){
  const d={
    validVotes:document.getElementById('fValidVotes').value,
    invalidVotes:document.getElementById('fInvalidVotes').value,
    puk:document.getElementById('fPukVotes').value,pdk:document.getElementById('fPdkVotes').value,
    gorran:document.getElementById('fGorranVotes').value,kiu:document.getElementById('fKiuVotes').value,
    neway:document.getElementById('fNewayVotes').value,komal:document.getElementById('fKomalVotes').value,
    baray:document.getElementById('fBarayVotes').value,halwest:document.getElementById('fHalwestVotes').value,
    other:document.getElementById('fOtherVotes').value,candidates:{}
  };
  for(let i=1;i<=50;i++)d.candidates[i]=document.getElementById('fcand_'+i).value;
  return d;
}
function v(id){return parseInt(document.getElementById(id).value)||0;}
function checkFormTotals(){
  const valid=v('fValidVotes'),invalid=v('fInvalidVotes'),puk=v('fPukVotes');
  const total=puk+v('fPdkVotes')+v('fGorranVotes')+v('fKiuVotes')+v('fNewayVotes')+v('fKomalVotes')+v('fBarayVotes')+v('fHalwestVotes')+v('fOtherVotes');
  document.getElementById('fTotalVotes').value=valid+invalid;
  document.getElementById('fPukListReference').innerText=puk;
  document.getElementById('fRemainingVotes').innerText=valid-total;
  document.getElementById('fPartyError').style.display=total>valid?'block':'none';
  checkFormCandidates();
}
function checkFormCandidates(){
  const puk=v('fPukVotes');let tc=0;
  document.querySelectorAll('.fcand-input').forEach(i=>tc+=parseInt(i.value)||0);
  document.getElementById('fTotalCandidateVotes').innerText=tc;
  document.getElementById('fCandidateError').style.display=tc>puk?'block':'none';
}

/* ─── MODAL (زیادکردنی ئاگادارکردنەوەی زیاتر) ─── */
function showReviewModal(){
  const valid=v('fValidVotes'),invalid=v('fInvalidVotes'),puk=v('fPukVotes');
  const ps=puk+v('fPdkVotes')+v('fGorranVotes')+v('fKiuVotes')+v('fNewayVotes')+v('fKomalVotes')+v('fBarayVotes')+v('fHalwestVotes')+v('fOtherVotes');
  const cs=parseInt(document.getElementById('fTotalCandidateVotes').innerText)||0;
  const cs2=document.getElementById('formCenterSelect');
  const st=document.getElementById('formStationSelect').value;
  
  if(!cs2.value||!st){alert('تکایە سەرەتا بنکە و وێستگە دیاری بکە!');return;}
  if(valid === 0 && invalid === 0){alert('تکایە دڵنیابە فۆڕمەکەت بەتاڵ نییە پێش ناردن!');return;}
  if(ps>valid){alert('تکایە هەڵەی ژمارەی لایەنەکان چاک بکە!');return;}
  if(cs>puk){alert('تکایە هەڵەی ژمارەی کاندیدەکان چاک بکە!');return;}
  if(puk>0 && cs===0){
      if(!confirm('ئاگاداربە: دەنگی یەکێتیت نووسیوە بەڵام هیچ دەنگێکت بۆ کاندیدەکان نەنووسیوە. دەتەوێت بەردەوام بیت؟')) return;
  }
  
  document.getElementById('modalCenter').innerText=cs2.options[cs2.selectedIndex].text;
  document.getElementById('modalStation').innerText=st;
  document.getElementById('modalTotal').innerText=valid+invalid;
  document.getElementById('modalInvalid').innerText=invalid;
  document.getElementById('modalPuk').innerText=puk;
  document.getElementById('reviewModal').style.display='flex';
}

function closeModal(){document.getElementById('reviewModal').style.display='none';}

function confirmSave(){
  closeModal();
  const zone=document.getElementById('formZoneSelect').value;
  const center=document.getElementById('formCenterSelect').value;
  const station=document.getElementById('formStationSelect').value;
  const key=zone+'_'+center+'_'+station;
  const data=gatherFormData();
  const cs=document.getElementById('formCenterSelect');
  data.centerName=cs.options[cs.selectedIndex].text;data.stationNum=station;
  
  // گۆڕانکاری سەرەکی فایربەیس: ناردنی داتا بۆ ئینتەرنێت لەبری تەنها کۆمپیوتەر
  firebase.database().ref('electionDB/' + key).set(data).then(() => {
      alert('سەرکەوتووە! داتاکانی ئەم وێستگەیە بە سەرکەوتوویی چوونە سەر فایربەیس.');
      onStationChange();
  }).catch(err => {
      alert('هەڵەیەک هەیە لە ناردنی داتا بۆ فایربەیس، دڵنیابە لە ئینتەرنێتەکەت: ' + err.message);
  });
}

/* ─── DASHBOARD EXCEL EXPORT ─── */
function exportDashboardExcel(){
  const db=JSON.parse(localStorage.getItem('electionDB'))||{};
  const keys=Object.keys(db);
  if(!keys.length){alert('هیچ داتایەک نەدۆزرایەوە! تکایە سەرەتا کارمەندەکان داتا داخڵ بکەن.');return;}

  const partyNames=['یەکێتی','پارتی','گۆڕان','یەکگرتوو','نەوەی نوێ','کۆمەڵ','بەرەی گەل','هەڵوێست','تر'];
  const partyKeys =['puk','pdk','gorran','kiu','neway','komal','baray','halwest','other'];
  const zoneNames={'1':'بازنەی ١ — ڕۆژهەڵات','2':'بازنەی ٢ — ڕۆژئاوا','3':'بازنەی ٣ — شۆڕش','4':'بازنەی ٤ — تەکیە'};

  let rows=[];
  keys.forEach(key=>{
    const parts=key.split('_'); 
    const zone=parts[0];
    const centerId=parts[1];
    const station=parts[2];
    const d=db[key];
    let centerName=d.centerName||centerId;
    let row={
      zone: zoneNames[zone]||'—',
      center: centerName,
      station: 'وێستگەی '+station,
      valid: parseInt(d.validVotes)||0,
      invalid: parseInt(d.invalidVotes)||0,
      total: (parseInt(d.validVotes)||0)+(parseInt(d.invalidVotes)||0),
      candidates: d.candidates||{}
    };
    partyKeys.forEach(pk=>{ row[pk]=parseInt(d[pk])||0; });
    rows.push(row);
  });

  const totals={valid:0,invalid:0,total:0};
  partyKeys.forEach(pk=>totals[pk]=0);
  for(let i=1;i<=50;i++) totals['c'+i]=0;
  rows.forEach(r=>{
    totals.valid+=r.valid; totals.invalid+=r.invalid; totals.total+=r.total;
    partyKeys.forEach(pk=>totals[pk]+=r[pk]);
    for(let i=1;i<=50;i++) totals['c'+i]+=(parseInt(r.candidates[i])||0);
  });

  const totalCols=6+partyNames.length+50;
  let html=`<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"><style>body{font-family:Arial;direction:rtl;}table{border-collapse:collapse;width:100%;font-size:11px;}th,td{border:1px solid #ccc;padding:5px 7px;}.fz{font-size:13px;}.hd1{background:#1a472a;color:#fff;font-weight:bold;text-align:center;}.hd2{background:#2d6a4f;color:#fff;font-weight:bold;text-align:center;}.hd3{background:#40916c;color:#fff;font-weight:bold;text-align:center;}.tot{background:#e8f5e9;font-weight:bold;}.num{text-align:center;}.zone1{background:#e3f2fd;}.zone2{background:#f3e5f5;}.zone3{background:#fff3e0;}.zone4{background:#fce4ec;}</style></head><body><table>`;
  html+=`<tr><th colspan="${totalCols}" class="hd1 fz">📊 ڕاپۆرتی گشتی هەڵبژاردن — مەڵبەندی ١٢ی ڕێکخستنی چەمچەماڵ</th></tr>`;
  html+=`<tr><th colspan="${totalCols}" class="hd2">کۆی وێستگەکان: ${rows.length} | سەرجەمی بەشداربووان: ${totals.total.toLocaleString()} | دەنگی دروست: ${totals.valid.toLocaleString()} | دەنگی یەکێتی: ${totals.puk.toLocaleString()}</th></tr><tr><th class="hd3">بازنە</th><th class="hd3">ناوی بنکە</th><th class="hd3">وێستگە</th><th class="hd3">دەنگی دروست</th><th class="hd3">دەنگی پووچەڵ</th><th class="hd3">کۆی گشتی</th>`;
  partyNames.forEach((n,i)=>html+=`<th class="hd3 ${partyKeys[i]}">${n}</th>`);
  for(let i=1;i<=50;i++) html+=`<th class="hd3">کاندیدی ${i}</th>`;
  html+=`</tr>`;

  rows.forEach(r=>{
    const zClass='zone'+(r.zone.includes('ڕۆژهەڵات')?'1':r.zone.includes('ڕۆژئاوا')?'2':r.zone.includes('شۆڕش')?'3':'4');
    html+=`<tr><td class="${zClass} num">${r.zone}</td><td>${r.center}</td><td class="num">${r.station}</td><td class="num" style="color:green;font-weight:bold;">${r.valid}</td><td class="num" style="color:red;">${r.invalid}</td><td class="num" style="font-weight:bold;">${r.total}</td>`;
    partyKeys.forEach(pk=>html+=`<td class="num ${pk}">${r[pk]}</td>`);
    for(let i=1;i<=50;i++) html+=`<td class="num">${parseInt(r.candidates[i])||0}</td>`;
    html+=`</tr>`;
  });

  html+=`<tr><td colspan="3" class="tot" style="text-align:center;">📌 کۆی گشتی هەموو وێستگەکان</td><td class="tot num" style="color:green;">${totals.valid}</td><td class="tot num" style="color:red;">${totals.invalid}</td><td class="tot num">${totals.total}</td>`;
  partyKeys.forEach(pk=>html+=`<td class="tot num">${totals[pk]}</td>`);
  for(let i=1;i<=50;i++) html+=`<td class="tot num">${totals['c'+i]}</td>`;
  html+=`</tr></table></body></html>`;

  const b=new Blob(['\ufeff'+html],{type:'application/vnd.ms-excel;charset=utf-8'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(b);
  a.download='ڕاپۆرتی_هەڵبژاردن.xls';
  a.click();
}

/* ── تۆمارکردنی Service Worker بۆ PWA ── */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').catch(err => {
        console.log('Service Worker تۆمار نەکرا:', err);
    });
  });
}

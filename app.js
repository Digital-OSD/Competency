const app=document.getElementById('app');
const state={tab:'home',role:null,profile:{firstName:'',lastName:'',branchNumber:''},answers:{},first:{},mission:null,phase:'map',pick:null,order:[],pitch:'',hint:false,run:'',finished:null,mapOrder:[],search:'',filter:'all',notice:'',cleared:{},attempts:{},mapScroll:0};
const colors={DJC:'#0067b9',Website:'#007396',SOA:'#485cc7',Routing:'#008578'};
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const role=()=>CONTENT[state.role],items=()=>role()?.questions||[],mission=()=>items().find(q=>q.id===state.mission),count=()=>items().filter(q=>state.first[q.id]).length,complete=()=>items().length>0&&count()===items().length;
function score(){return Math.round(Object.entries(role().groups).reduce((s,[cat,w])=>{const qs=items().filter(q=>q.category===cat&&q.type!=='write');return s+w*qs.filter(q=>state.first[q.id]?.correct).length/qs.length},0))}
const MAX_PARTICIPATION_POINTS=1000;
const missionPoints=()=>items().length?MAX_PARTICIPATION_POINTS/items().length:0;
const participationPoints=()=>Math.round(count()*missionPoints()*0.10);
function accuracyFraction(){return Object.entries(role().groups).reduce((sum,[cat,w])=>{const qs=items().filter(q=>q.category===cat&&q.type!=='write');return sum+(qs.length?w/100*qs.filter(q=>state.first[q.id]?.correct).length/qs.length:0)},0)}
const correctAnswerPoints=()=>Math.round(MAX_PARTICIPATION_POINTS*0.90*accuracyFraction());
const totalPoints=()=>Math.round(count()*missionPoints()*0.10+MAX_PARTICIPATION_POINTS*0.90*accuracyFraction());
const allPowered=()=>items().length>0&&items().every(q=>state.cleared[q.id]);
const grade=()=>score()>=85?'Proficient':score()>=70?'Competent':'Needs work';
function rng(seed){let n=2166136261;for(const c of seed)n=Math.imul(n^c.charCodeAt(0),16777619)>>>0;return ()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296}}
function mix(qs,seed){const random=rng(seed),pool=[...qs];for(let i=pool.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]]}const result=[];while(pool.length){const prev=result.at(-1)?.tool;let i=pool.findIndex(q=>q.tool!==prev);if(i<0)i=0;result.push(pool.splice(i,1)[0])}return result.map(q=>q.id)}
function selectRole(k){state.role=k;state.tab='entry';state.run='';state.answers={};state.first={};state.cleared={};state.attempts={};state.notice='';render()}
function play(id){const q=items().find(q=>q.id===id);if(!q)return;state.mapScroll=window.scrollY;state.mission=id;state.phase='play';state.pick=null;state.order=q.type==='order'?[2,0,3,1]:[];state.pitch=state.answers[id]?.response||'';state.hint=false;render();window.scrollTo(0,0)}
function back(){state.phase='map';state.mission=null;render();requestAnimationFrame(()=>window.scrollTo({top:state.mapScroll||0,behavior:'instant'}))}
function submit(){const q=mission();const wasComplete=complete();if(state.phase!=='play'||(q.type==='choice'&&state.pick===null)||(q.type==='write'&&state.pitch.trim().split(/\s+/).filter(Boolean).length<20))return;const correct=q.type==='write'?null:q.type==='order'?state.order.join(',')==='0,1,2,3':String.fromCharCode(65+state.pick)===q.key;const a={questionId:q.id,type:q.type,correct,assisted:false,...(q.type==='write'?{response:state.pitch.trim(),reviewStatus:'pending-human-review'}:{selected:q.type==='order'?[...state.order]:state.pick})};state.attempts[q.id]=(state.attempts[q.id]||0)+1;a.answeredAt=new Date().toISOString();a.seq=state.first[q.id]?state.first[q.id].seq:count()+1;state.answers[q.id]=a;if(correct||q.type==='write')state.cleared[q.id]=true;if(!state.first[q.id])state.first[q.id]={...a};if(complete()&&!state.finished)state.finished=new Date().toISOString();state.phase='feedback';if(complete()&&(!wasComplete||allPowered())){finish();return}render()}
function equipmentFor(q){
 if(['w2','lists_vs_fpp','s10'].includes(q.id))return 'reel';
 if(['access_form','payment_permission','w3','w5','d4','s5'].includes(q.id))return 'disconnect';
 if(['web_issue','pricing_causes','s4','s6','support_email'].includes(q.id))return 'junction';
 if(['d1','d5','e1','e2','integration_handoff','w6','s2','s3','s12'].includes(q.id))return 'conduit';
 if(q.tool==='DJC'||q.type==='write')return 'panel';
 if(q.tool==='SOA')return 'junction';
 return 'luminaire';
}
function equipmentMarkup(kind){return `<span class="equipment-art art-${kind}" aria-hidden="true"><span class="hardware"><i class="part p1"></i><i class="part p2"></i><i class="part p3"></i><i class="part p4"></i><i class="part p5"></i><i class="part p6"></i></span></span>`}
function branchReveal(full=false){const n=items().filter(q=>state.cleared[q.id]).length,ratio=full?1:n/items().length;return `<div class="branch-display ${ratio===1?'fully-powered':''}" style="--power:${ratio}" aria-label="Branch display, ${Math.round(ratio*100)} percent powered"><div class="branch-sky"><span class="star star1"></span><span class="star star2"></span><span class="star star3"></span></div><div class="branch-building"><div class="roof-canopy"></div><div class="service-inlet" aria-hidden="true"></div><div class="branch-sign facade-brand"><img src="osd-logo.png" alt="OneSource Distributors" class="branch-logo"></div><div class="branch-windows">${Array.from({length:6},(_,i)=>`<span class="branch-window ${ratio>i/6?'lit':''}"></span>`).join('')}</div><div class="branch-door"></div></div><div class="branch-ground"></div><div class="branch-caption">${ratio===1?'BRANCH ONLINE':n===0?'Ready to power up':Math.round(ratio*100)+'% powered'}</div></div>`}
function map(){const on=items().filter(q=>state.cleared[q.id]).length;return `<section class="breaker-map"><div class="heading"><div><h2>Power the Branch</h2><p>Clear a mission. Flip a breaker. Bring the branch to life.</p></div>${complete()?'<button class="gold" data-action="results">View final result</button>':''}</div><div class="breaker-layout"><svg class="power-cable" aria-hidden="true"><path class="cable-jacket"></path><path class="cable-highlight"></path><path class="cable-energy"></path></svg><div class="panel-cabinet"><div class="panel-nameplate"><strong>MISSION PANEL</strong><span>${on} / ${items().length} ON</span></div><div class="breaker-grid">${state.mapOrder.map((id,i)=>{const q=items().find(x=>x.id===id),cleared=!!state.cleared[id],played=!!state.first[id];return `<button class="breaker-row ${cleared?'breaker-on':''}" data-mission="${esc(id)}" aria-label="${esc(q.title)}, breaker ${cleared?'on, replay available':'off'}"><span class="circuit-number">${String(i+1).padStart(2,'0')}</span><span class="breaker-switch" aria-hidden="true"><span class="switch-position">${cleared?'ON':'OFF'}</span><span class="switch-handle"></span></span><span class="breaker-title"><strong>${esc(q.title)}</strong>${cleared?'<span class="replay-label">↻ Replay</span>':''}</span>${cleared?'<span class="breaker-status">Cleared</span>':played?'<span class="breaker-status retry-status">Try again</span>':''}</button>`}).join('')}</div><div class="panel-footer">Every breaker is available. Choose any mission.</div></div><aside class="power-preview">${branchReveal()}<p>Each cleared breaker lights another part of the branch.</p></aside></div></section>`}
function question(){const q=mission(),f=state.phase==='feedback';return `<section class="card mission"><button class="back" data-action="map">← Back to mission map</button><h2>${esc(q.title)}</h2><p>${esc(q.prompt)}</p><div class="options">${q.type==='write'?`<label for="pitch">Your customer pitch</label><textarea id="pitch" rows="6" maxlength="1500" ${f?'disabled':''}>${esc(state.pitch)}</textarea><small id="word-count">${state.pitch.trim().split(/\s+/).filter(Boolean).length} words • Minimum 20 • Maximum 1,500 characters</small>`:q.type==='order'?state.order.map((n,i)=>`<div class="option"><b>${i+1}</b><span style="flex:1">${esc(q.options[n])}</span>${f?'':`<div class="order-buttons"><button aria-label="Move up" data-move="${i},-1" ${i===0?'disabled':''}>↑</button><button aria-label="Move down" data-move="${i},1" ${i===state.order.length-1?'disabled':''}>↓</button></div>`}</div>`).join(''):q.options.map((t,i)=>`<button class="option ${state.pick===i?'selected':''} ${f&&String.fromCharCode(65+i)===q.key?'correct':''} ${f&&state.pick===i&&!state.answers[q.id].correct?'wrong':''}" data-pick="${i}" aria-pressed="${state.pick===i}" ${f?'disabled':''}><b>${String.fromCharCode(65+i)}</b><span>${esc(t)}</span></button>`).join('')}</div>${f?`<div class="feedback"><h2>${q.type==='write'?'Pitch captured':state.answers[q.id].correct?'Mission cleared!':'A useful learning moment'}</h2><p>${esc(q.why)}</p>${q.type==='order'&&!state.answers[q.id].correct?`<p>Correct sequence: ${esc(q.options.join(' → '))}</p>`:''}</div><div class="actions"><button class="blue" data-action="map">Choose another mission</button>${!complete()?'<button class="gold" data-action="next">Play next mission →</button>':''}${complete()?'<button class="gold" data-action="results">Reveal final result</button>':''}</div>`:`<div class="actions"><button id="submit" class="blue" data-action="submit" ${(q.type==='choice'&&state.pick===null)||(q.type==='write'&&state.pitch.trim().split(/\s+/).filter(Boolean).length<20)?'disabled':''}>${q.type==='write'?'Save pitch':'Lock in your move'}</button></div>`}</section>`}
function finish(){recordCompletion();state.phase='victory';render();window.scrollTo(0,0);setTimeout(()=>{if(state.phase==='victory'){state.phase='results';render();window.scrollTo(0,0)}},1400)}
function results(){return `<section class="results endgame"><div class="endgame-kicker">QUEST COMPLETE</div>${branchReveal()}<h1>Nice Work!</h1><p class="endgame-player">${esc(state.profile.firstName)} ${esc(state.profile.lastName)} • ${esc(role().name)}</p><div class="final-stats"><div><small>FINAL RESULT</small><strong>${grade()}</strong></div><div><small>ACCURACY</small><strong>${score()}%</strong></div><div><small>POINTS</small><strong>${totalPoints()}</strong></div></div>${!allPowered()?'<div class="power-replay"><p>Your score is locked. Replay missed missions to switch on every breaker.</p><button class="blue" data-action="map">Power the remaining breakers →</button></div>':''}<div class="send-result"><h2>Leaderboard</h2><p id="sync-status" role="status"></p><div id="sync-actions" class="actions" hidden><button class="blue" data-action="sync">Retry save</button><button class="gold" data-action="export">Download backup</button></div></div></section>`}
function drawPowerCable(){const layout=document.querySelector('.breaker-layout'),panel=document.querySelector('.panel-cabinet'),inlet=document.querySelector('.service-inlet'),svg=document.querySelector('.power-cable');if(!layout||!panel||!inlet||!svg)return;const l=layout.getBoundingClientRect(),p=panel.getBoundingClientRect(),t=inlet.getBoundingClientRect();const stacked=t.left<p.right;let x1,y1,x2=t.left-l.left+t.width/2,y2=t.top-l.top+t.height/2,d;if(stacked){x1=p.left-l.left+p.width*.82;y1=p.bottom-l.top;const bend=y1+24;d=`M ${x1} ${y1} L ${x1} ${bend} Q ${x1} ${bend+16} ${x1-16} ${bend+16} L ${x2+20} ${bend+16} Q ${x2} ${bend+16} ${x2} ${bend+36} L ${x2} ${y2}`;}else{x1=p.right-l.left;y1=Math.min(150,p.height*.3);const mid=x1+Math.max(16,(x2-x1)*.4);d=`M ${x1} ${y1} L ${mid-16} ${y1} Q ${mid} ${y1} ${mid} ${y1+16} L ${mid} ${y2-18} Q ${mid} ${y2} ${mid+18} ${y2} L ${x2} ${y2}`;}svg.setAttribute('viewBox',`0 0 ${l.width} ${l.height}`);svg.querySelectorAll('path').forEach(path=>path.setAttribute('d',d));svg.classList.toggle('energized',items().some(q=>state.cleared[q.id]));}
window.addEventListener('resize',()=>requestAnimationFrame(drawPowerCable));
function render(){let body='';if(state.tab==='home')body=`<div class="hero"><span class="pill">CHOOSE YOUR ROLE. START YOUR JOURNEY.</span><h1>Digital Competency <span>2027</span></h1></div><div class="cards">${Object.entries(CONTENT).map(([k,r])=>`<article class="card character-card character-${k}"><div class="character-top"><span class="role-symbol" aria-hidden="true">${k==='am'?'⚡':k==='inside'?'🔌':'💡'}</span><span class="character-class">${k==='am'?'PROJECT CONNECTOR':k==='inside'?'ORDER POWERHOUSE':'FRONTLINE SPARK'}</span></div><h2>${r.name}</h2><div class="attribute-label">DIGITAL ATTRIBUTES</div><div class="character-attributes">${Object.entries(r.groups).map(([c,w])=>`<div class="attribute"><div class="attribute-caption"><span>${esc(c)}</span><b>${w}%</b></div><div class="attribute-meter" role="img" aria-label="${esc(c)} training weight ${w} percent"><span style="width:${w}%"></span></div></div>`).join('')}</div><div class="role-ability"><small>SIGNATURE MOVE</small><strong>${k==='am'?'Find the right fit':k==='inside'?'Turn documents into orders':'Spot the digital opportunity'}</strong></div><button class="blue" data-role="${k}">Start your journey →</button></article>`).join('')}</div>`;
else if(state.tab==='entry')body=`<form id="entry" class="card entry"><button type="button" class="back" data-tab="home">← Choose another role</button><h2>Join the quest</h2><p>${role().name} • ${items().length} missions</p>${[['firstName','First name'],['lastName','Last name'],['branchNumber','Branch number']].map(([k,l])=>`<label>${l}<input name="${k}" required maxlength="${k==='branchNumber'?20:80}" ${k==='branchNumber'?'pattern="[0-9]+" inputmode="numeric"':''} autocomplete="${k==='firstName'?'given-name':k==='lastName'?'family-name':'off'}" value="${esc(state.profile[k])}"></label>`).join('')}<p class="fine">Your name, branch, role and points appear on the shared leaderboard. Your answers and written pitch are saved privately for competency review and are not shown to other players. Progress is not saved on this device, so finish in one session.</p><button class="blue" type="submit">Start quest</button></form>`;
else if(state.tab==='board')body=`<div class="arcade-heading"><h1>LEADERBOARD</h1><span class="arcade-line" aria-hidden="true"></span></div><div class="actions" style="margin-bottom:24px"><input id="board-search" aria-label="Search name or branch" placeholder="Search name or branch" value="${esc(state.search)}"><select id="board-filter" aria-label="Filter role"><option value="all">All roles</option>${Object.entries(CONTENT).map(([k,r])=>`<option value="${k}" ${state.filter===k?'selected':''}>${r.name}</option>`).join('')}</select><button class="blue" data-action="refresh-board">Refresh</button></div><p id="live-board-status" class="fine" role="status"></p><div id="board-rows"></div>`;
else if(state.phase==='victory')body='<section class="victory-flash" role="status"><h1>Nice Work!</h1><p>Quest complete</p></section>';
else if(state.phase==='results'&&complete())body=results();
else body=`<h2>${role().name} Quest</h2><p>${esc(state.profile.firstName)} ${esc(state.profile.lastName)} • Branch ${esc(state.profile.branchNumber)}</p><div class="hud"><div><small>Total points</small><br><strong>${totalPoints()}</strong></div><div><small>Missions submitted</small><br><strong>${count()}/${items().length}</strong></div><div style="flex:1;min-width:160px"><small>System progress</small><div class="progress"><div style="width:${count()/items().length*100}%"></div></div></div></div>${state.notice?`<p class="notice" role="status">${esc(state.notice)}</p>`:''}${state.phase==='map'?map():state.phase==='results'&&complete()?results():question()}`;
app.innerHTML=`<header><div class="wrap nav"><div class="brand"><img class="logo" src="osd-logo.png" alt="OneSource Distributors"><div class="brand-note"><span>Digital Competency</span></div></div><nav><button data-tab="home" class="${state.tab==='home'?'active':''}">Play</button><button data-tab="board" class="${state.tab==='board'?'active':''}">Leaderboard</button>${state.tab!=='game'&&state.run?'<button data-tab="game">Return to quest</button>':''}</nav></div></header><main class="wrap">${body}</main>`;
requestAnimationFrame(drawPowerCable);
LiveBoard.paint();
if(state.tab==='entry')document.getElementById('entry').addEventListener('submit',entry);if(state.tab==='board'){drawBoard();LiveBoard.refresh();document.getElementById('board-search').addEventListener('input',e=>{state.search=e.target.value;drawBoard()});document.getElementById('board-filter').addEventListener('change',e=>{state.filter=e.target.value;drawBoard()})}const p=document.getElementById('pitch');if(p&&!p.disabled)p.addEventListener('input',e=>{state.pitch=e.target.value;const n=state.pitch.trim().split(/\s+/).filter(Boolean).length;document.getElementById('word-count').textContent=n+' words • Minimum 20 • Maximum 1,500 characters';document.getElementById('submit').disabled=n<20})}
function nextMission(){const index=state.mapOrder.indexOf(state.mission);const ids=[...state.mapOrder.slice(index+1),...state.mapOrder.slice(0,index)];const id=ids.find(id=>!state.first[id]);if(id){const y=state.mapScroll;play(id);state.mapScroll=y}else if(complete())finish();else back()}
app.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled)return;if(b.dataset.role){selectRole(b.dataset.role);return}if(b.dataset.tab){state.tab=b.dataset.tab;if(state.tab==='game')state.phase='map';render();return}if(b.dataset.mission){play(b.dataset.mission);return}if(b.dataset.pick!==undefined){state.pick=Number(b.dataset.pick);render();return}if(b.dataset.move){const [i,d]=b.dataset.move.split(',').map(Number);[state.order[i],state.order[i+d]]=[state.order[i+d],state.order[i]];render();return}switch(b.dataset.action){case 'map':back();break;case 'next':nextMission();break;case 'results':if(complete())finish();break;case 'submit':submit();break;case 'sync':LiveBoard.flush();break;case 'refresh-board':LiveBoard.refresh(true);break;case 'export':download();break}});

// v7.9: Supabase is the only permanent store. Remove every legacy local save once.
(function clearLegacyLocalData(){
  try{
    const legacy=[];
    for(let i=0;i<localStorage.length;i++){
      const k=localStorage.key(i);
      if(/^dc2027-(site-|completions-|board-reset-|live-saved-)/.test(k))legacy.push(k);
    }
    legacy.forEach(k=>localStorage.removeItem(k));
  }catch{}
})();

function entry(e){
  e.preventDefault();
  const f=new FormData(e.target);
  state.profile={firstName:f.get('firstName').trim(),lastName:f.get('lastName').trim(),branchNumber:f.get('branchNumber').trim()};
  if(!state.profile.firstName||!state.profile.lastName||!/^\d+$/.test(state.profile.branchNumber))return;
  state.answers={};state.first={};state.cleared={};state.attempts={};state.finished=null;
  state.run='run-'+Date.now()+'-'+Math.random().toString(36).slice(2,8);
  state.mapOrder=mix(items(),state.run);
  state.tab='game';state.phase='map';state.mission=null;state.notice='';
  render();
}

function completionRecord(){
  return {runId:state.run,firstName:state.profile.firstName,lastName:state.profile.lastName,branchNumber:state.profile.branchNumber,roleKey:state.role,totalPoints:totalPoints(),accuracy:score(),completedAt:state.finished};
}

// One row per question. Always the FIRST scored attempt; replays only add to the attempts count.
function answerRows(){
  const L=n=>String.fromCharCode(65+n);
  return items().map(q=>{
    const f=state.first[q.id]||{},opts=q.options||[];
    const row={question_id:q.id,answer_seq:f.seq??null,role_key:state.role,category:q.category??null,tool:q.tool??null,question_type:q.type,
      question_title:q.title??null,question_prompt:q.prompt??null,options:opts,attempts:state.attempts[q.id]||1,answered_at:f.answeredAt??null,
      selected_answer:null,selected_text:null,correct_answer:null,correct_text:null,is_correct:null,pitch_response:null,pitch_word_count:null};
    if(q.type==='write'){
      row.pitch_response=f.response??null;
      row.pitch_word_count=f.response?f.response.trim().split(/\s+/).filter(Boolean).length:null;
    }else if(q.type==='order'){
      const sel=Array.isArray(f.selected)?f.selected:[];
      row.selected_answer=sel.map(L).join(' > ');row.selected_text=sel.map(n=>opts[n]).join(' > ');
      row.correct_answer=opts.map((_,i)=>L(i)).join(' > ');row.correct_text=opts.join(' > ');row.is_correct=f.correct===true;
    }else{
      row.selected_answer=Number.isInteger(f.selected)?L(f.selected):null;row.selected_text=Number.isInteger(f.selected)?opts[f.selected]:null;
      row.correct_answer=q.key??null;row.correct_text=q.key?opts[q.key.charCodeAt(0)-65]??null:null;row.is_correct=f.correct===true;
    }
    return row;
  });
}

function recordCompletion(){if(complete())LiveBoard.queue(completionRecord(),answerRows())}

// Backup download is offered only when the live save has failed.
function download(){
  if(!complete())return;
  const result={app:'Digital Competency 2027',gameVersion:'7.9',scoringVersion:'7.0',...completionRecord(),role:role().name,grade:grade(),answers:answerRows()};
  const u=URL.createObjectURL(new Blob([JSON.stringify(result,null,2)],{type:'application/json'})),a=document.createElement('a');
  a.href=u;a.download='Digital-Competency-2027-v7.9-backup-'+state.role+'-'+state.run+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);
}

function drawBoard(){
  const el=document.getElementById('board-rows');if(!el)return;
  const q=state.search.toLowerCase();
  const rows=LiveBoard.rows.filter(x=>(state.filter==='all'||x.roleKey===state.filter)&&[x.firstName,x.lastName,x.branchNumber].join(' ').toLowerCase().includes(q));
  el.innerHTML=rows.length?`<section class="arcade-board"><div class="arcade-columns"><span>PLAYER</span><span>LOCATION / ROLE</span><span>POINTS</span></div>${rows.map(x=>`<article class="arcade-row"><div class="arcade-player"><span class="player-marker" aria-hidden="true">◆</span><strong>${esc(x.firstName)} ${esc(x.lastName)}</strong></div><div class="arcade-details"><span>Branch ${esc(x.branchNumber)}</span><small>${esc(CONTENT[x.roleKey]?.name||x.roleKey)}</small></div><strong class="arcade-score">${esc(x.totalPoints)}</strong></article>`).join('')}</section>`
    :`<section class="arcade-board arcade-empty"><h2>${LiveBoard.loaded?'No matching players':'Loading leaderboard…'}</h2></section>`;
}

// Warn before leaving mid-quest (progress is not saved on the device) or with an unsent result.
window.addEventListener('beforeunload',e=>{
  const midQuest=state.run&&!complete()&&count()>0;
  if(midQuest||LiveBoard.hasPending()){e.preventDefault();e.returnValue=''}
});

render();

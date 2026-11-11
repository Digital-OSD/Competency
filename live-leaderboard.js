// Digital Competency 2027 v7.9 - Supabase live leaderboard + private answer capture.
// Summary and per-question answers are saved together in ONE database call (submit_run),
// so a result is never stored without its answers. The browser keeps only unsent results.
const LiveBoard=(()=>{
  const GAME_VERSION='7.9',SCORING_VERSION='7.0',QUEUE='dc2027-live-pending-v2';
  const cfg=window.SUPABASE_CONFIG||{},enabled=cfg.enabled===true;
  let client=null,busy=false,loading=false,loaded=false,rows=[],lastRead=0,failed=false;
  let message=enabled?'Connecting to the live leaderboard…':'Live leaderboard is not configured.';
  const saved=new Set();

  try{localStorage.removeItem('dc2027-live-pending-v1')}catch{} // v7.8 queue format (no answers)
  function readQueue(){try{const q=JSON.parse(localStorage.getItem(QUEUE)||'{}');return q&&typeof q==='object'?q:{}}catch{return {}}}
  let pending=readQueue();
  function writeQueue(){try{Object.keys(pending).length?localStorage.setItem(QUEUE,JSON.stringify(pending)):localStorage.removeItem(QUEUE)}catch{}}

  function paint(){
    const runSaved=typeof state!=='undefined'&&saved.has(state.run);
    const s=document.getElementById('sync-status');
    if(s)s.textContent=runSaved?'✓ Result saved':(failed?'Saving… retrying automatically. Keep this page open.':'Saving…');
    const b=document.getElementById('live-board-status');
    if(b)b.textContent=message;
  }

  async function connect(){
    if(!enabled)throw Error('live leaderboard is not configured');
    if(!cfg.url||!cfg.publishableKey||!window.supabase)throw Error('Supabase settings or library missing');
    if(!client)client=window.supabase.createClient(cfg.url,cfg.publishableKey);
    const {data,error}=await client.auth.getSession();
    if(error)throw error;
    if(!data.session){const r=await client.auth.signInAnonymously();if(r.error)throw r.error}
    return client;
  }

  async function flush(){
    if(busy||!enabled||!Object.keys(pending).length){paint();return}
    busy=true;message='Saving your result…';paint();
    try{
      const c=await connect();
      for(const [id,item] of Object.entries(pending)){
        const r=item.run;
        const p_run={run_id:id,first_name:r.firstName,last_name:r.lastName,branch_number:r.branchNumber,role_key:r.roleKey,total_points:r.totalPoints,accuracy:r.accuracy,completed_at:r.completedAt,game_version:GAME_VERSION,scoring_version:SCORING_VERSION};
        const {error}=await c.rpc('submit_run',{p_run,p_answers:item.answers});
        if(error)throw error; // the function returns 'already_saved' for a retried run
        saved.add(id);delete pending[id];writeQueue();
      }
      failed=false;message='Result saved to the live leaderboard.';
      await refresh(true);
    }catch(e){
      failed=true;console.warn('Save failed',e);message='Saving… retrying automatically.';
    }finally{busy=false;paint()}
  }

  function queue(run,answers){
    if(saved.has(run.runId)){paint();return}
    if(!enabled){failed=true;message='Live leaderboard is not configured.';paint();return}
    pending[run.runId]={run,answers};writeQueue();flush();
  }

  async function refresh(force=false){
    if(!enabled){loaded=true;paint();if(typeof drawBoard==='function')drawBoard();return}
    if(loading||(!force&&Date.now()-lastRead<10000))return;
    loading=true;
    try{
      const c=await connect();let all=[],offset=0;
      while(true){
        const {data,error}=await c.from('game_results').select('run_id,first_name,last_name,branch_number,role_key,total_points,completed_at').eq('scoring_version',SCORING_VERSION).order('total_points',{ascending:false}).order('completed_at',{ascending:true}).range(offset,offset+499);
        if(error)throw error;all.push(...data);if(data.length<500)break;offset+=500;
      }
      rows=all.map(r=>({runId:r.run_id,firstName:r.first_name,lastName:r.last_name,branchNumber:r.branch_number,roleKey:r.role_key,totalPoints:r.total_points,completedAt:r.completed_at}));
      lastRead=Date.now();loaded=true;
      if(!failed)message='Live leaderboard • updated '+new Date().toLocaleTimeString([], {hour:'numeric',minute:'2-digit'});
    }catch(e){
      loaded=true;message='Live leaderboard unavailable ('+(e.message||e)+').';
    }finally{
      loading=false;
      if(typeof state!=='undefined'&&state.tab==='board'&&typeof drawBoard==='function')drawBoard();
      paint();
    }
  }

  window.addEventListener('online',()=>{flush();refresh(true)});
  setInterval(()=>{if(!enabled)return;flush();if(typeof state!=='undefined'&&state.tab==='board')refresh(true)},30000);
  setTimeout(flush,0);

  return {queue,flush,refresh,paint,hasPending:()=>Object.keys(pending).length>0,get rows(){return rows},get loaded(){return loaded}};
})();

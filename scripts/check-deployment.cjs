const {spawnSync}=require('node:child_process');
(async()=>{
 const result=spawnSync('git',['credential','fill'],{input:'protocol=https\nhost=github.com\n\n',encoding:'utf8',windowsHide:true,timeout:15000});
 const credential=Object.fromEntries((result.stdout||'').split('\n').filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i),l.slice(i+1)]}));
 const sha=process.argv[2]||spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).stdout.trim();
 const headers={'Accept':'application/vnd.github+json','User-Agent':'CareerIntel-release-check'};
 if(credential.password)headers.Authorization=`Bearer ${credential.password}`;
 const res=await fetch(`https://api.github.com/repos/Sabelo-K/career-intel-sa/commits/${sha}/status`,{headers});
 if(!res.ok){console.log(JSON.stringify({httpStatus:res.status}));return;}
 const data=await res.json();console.log(JSON.stringify({sha,state:data.state,statuses:data.statuses.map(s=>({state:s.state,context:s.context,description:s.description,url:s.target_url}))},null,2));
})().catch(()=>{console.error('Deployment status unavailable. No credentials printed.');process.exitCode=1});

import { useEffect, useMemo, useState } from 'react';
import './GitHubExplorer.css';

const API = 'https://api.github.com';
const QUICK = ['Balu-Nagireddy', 'torvalds', 'sindresorhus', 'gaearon', 'ThePrimeagen'];
const number = n => new Intl.NumberFormat().format(n || 0);
const date = s => s ? new Date(s).toLocaleDateString(undefined, {year:'numeric',month:'short',day:'numeric'}) : '—';
const ago = s => { const n = Math.max(0, (Date.now() - new Date(s).getTime()) / 1000); return n < 60 ? 'just now' : n < 3600 ? Math.floor(n/60)+'m ago' : n < 86400 ? Math.floor(n/3600)+'h ago' : Math.floor(n/86400)+'d ago'; };
const eventTitle = e => ({PushEvent:'Pushed to',PullRequestEvent:'Pull request in',IssuesEvent:'Issue activity in',WatchEvent:'Starred',CreateEvent:'Created in',ReleaseEvent:'Released in',ForkEvent:'Forked',PublicEvent:'Made public'}[e.type] || e.type.replace(/Event$/, '') + ' in');
const eventText = e => e.type === 'PushEvent' ? ((e.payload.commits || []).map(c=>c.message).filter(Boolean).slice(0,3).join(' · ') || 'Pushed commits') : e.type === 'PullRequestEvent' ? ((e.payload.action || 'Updated')+' pull request: '+((e.payload.pull_request || {}).title || '')) : e.type === 'IssuesEvent' ? ((e.payload.action || 'Updated')+' issue: '+((e.payload.issue || {}).title || '')) : e.type === 'WatchEvent' ? 'Starred this repository' : e.type === 'CreateEvent' ? ('Created '+(e.payload.ref_type || 'repository')+' '+(e.payload.ref || '')) : e.type === 'ReleaseEvent' ? (((e.payload.release || {}).name) || 'Published a release') : e.type === 'ForkEvent' ? 'Forked repository' : (e.payload.action || e.payload.ref || 'Public activity');

function Readme({text}) {
  if (!text) return <p className="gx-muted">No README was found.</p>;
  return <div className="gx-readme">{text.split('\n').map((line,i)=>{ const s=line.trim(); if(!s) return <div key={i} className="gx-gap"/>; if(/^#{1,4} /.test(s)){const n=s.match(/^#+/)[0].length;const T='h'+n;return <T key={i}>{s.replace(/^#+\s*/,'')}</T>;} if(/^[-*] /.test(s)) return <p key={i}>• {s.slice(2)}</p>; if(/^> /.test(s)) return <blockquote key={i}>{s.slice(2)}</blockquote>; if(/^\x60{3}/.test(s)) return <div key={i} className="gx-code-label">Code block</div>; return <p key={i}>{s.replace(/\*\*/g,'').replace(/\x60/g,'')}</p>;})}</div>;
}

export default function GitHubExplorer() {
 const initial = new URLSearchParams(window.location.search).get('user') || 'Balu-Nagireddy';
 const [input,setInput] = useState(initial), [token,setToken] = useState(''), [showToken,setShowToken] = useState(false);
 const [theme,setTheme] = useState(()=>localStorage.getItem('gx-theme') || 'dark');
 const [profile,setProfile] = useState(null), [repos,setRepos] = useState([]), [events,setEvents] = useState([]);
 const [loading,setLoading] = useState(false), [error,setError] = useState('');
 const [search,setSearch] = useState(''), [language,setLanguage] = useState('All languages'), [sort,setSort] = useState('updated');
 const [detail,setDetail] = useState(null), [readme,setReadme] = useState(''), [readmeLoading,setReadmeLoading] = useState(false);
 const [recent,setRecent] = useState(()=>{try{return JSON.parse(localStorage.getItem('gx-recent')||'[]')}catch{return []}});
 async function api(path) {
   const headers = {Accept:'application/vnd.github+json'};
   if(token.trim()) headers.Authorization = 'Bearer '+token.trim();
   const res = await fetch(API+path,{headers});
   if(res.status===404) throw new Error('NOT_FOUND');
   if(res.status===403 || res.status===429) throw new Error('RATE_LIMIT');
   if(!res.ok) throw new Error('HTTP_'+res.status);
   return res.json();
 }
 async function load(name) {
   const user = name.trim().replace(/^@/,'');
   if(!/^[a-zA-Z0-9-]{1,39}$/.test(user)){setError('Enter a valid GitHub username.');return;}
   setLoading(true);setError('');setProfile(null);setRepos([]);setEvents([]);setDetail(null);
   try {
     const data = await Promise.all([api('/users/'+encodeURIComponent(user)),api('/users/'+encodeURIComponent(user)+'/repos?per_page=100&sort=updated&type=owner'),api('/users/'+encodeURIComponent(user)+'/events/public?per_page=100')]);
     const all = data[1];
     if(all.length===100){for(let page=2;page<=3;page++){const more=await api('/users/'+encodeURIComponent(user)+'/repos?per_page=100&page='+page+'&sort=updated&type=owner');all.push(...more);if(more.length<100)break;}}
     setProfile(data[0]);setRepos(all);setEvents(data[2]);
     const history=[data[0].login,...recent.filter(x=>x.toLowerCase()!==data[0].login.toLowerCase())].slice(0,6);
     setRecent(history);localStorage.setItem('gx-recent',JSON.stringify(history));
     const params=new URLSearchParams(window.location.search);params.set('user',data[0].login);window.history.replaceState({},'',window.location.pathname+'?'+params.toString());
   } catch(e) {setError(e.message==='NOT_FOUND'?'User not found. Check the username and try again.':e.message==='RATE_LIMIT'?'GitHub API rate limit reached. Wait and retry, or add an optional token to raise the limit.':'Could not load GitHub data. Check your connection and try again.');}
   finally {setLoading(false);}
 }
 useEffect(()=>{load(initial);},[]);
 useEffect(()=>{localStorage.setItem('gx-theme',theme);},[theme]);
 const languages=useMemo(()=>[...new Set(repos.map(r=>r.language).filter(Boolean))].sort(),[repos]);
 const filtered=useMemo(()=>repos.filter(r=>(language==='All languages'||r.language===language)&&(r.name+' '+(r.description||'')+' '+(r.topics||[]).join(' ')).toLowerCase().includes(search.toLowerCase())).sort((a,b)=>sort==='stars'?b.stargazers_count-a.stargazers_count:sort==='name'?a.name.localeCompare(b.name):new Date(b.pushed_at||0)-new Date(a.pushed_at||0)),[repos,language,search,sort]);
 const stats=useMemo(()=>repos.reduce((a,r)=>({stars:a.stars+r.stargazers_count,forks:a.forks+r.forks_count,watchers:a.watchers+r.subscribers_count,issues:a.issues+r.open_issues_count}),{stars:0,forks:0,watchers:0,issues:0}),[repos]);
 const langs=useMemo(()=>{const m={};repos.forEach(r=>{if(r.language)m[r.language]=(m[r.language]||0)+1});return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,8)},[repos]);
 const heat=useMemo(()=>{const m={};events.forEach(e=>{if(e.created_at){const k=e.created_at.slice(0,10);m[k]=(m[k]||0)+1}});return Array.from({length:91},(_,i)=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-90+i);const k=d.toISOString().slice(0,10);return {key:k,count:m[k]||0}})},[events]);
 async function openRepo(repo) {setDetail(repo);setReadme('');setReadmeLoading(true);try{const d=await api('/repos/'+repo.full_name+'/readme');const raw=atob((d.content||'').replace(/\n/g,''));const bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));setReadme(new TextDecoder().decode(bytes));}catch{setReadme('')}finally{setReadmeLoading(false)}}
 const sortedTop=[...repos].sort((a,b)=>b.stargazers_count-a.stargazers_count).slice(0,5);
 return <div className={'gx '+(theme==='light'?'gx-light':'')}>
  <header className="gx-nav"><a href="?user=Balu-Nagireddy" className="gx-brand"><span>GH</span> Profile<span>Scope</span></a><div><small>● LIVE PUBLIC DATA</small><button aria-label="Toggle theme" onClick={()=>setTheme(theme==='dark'?'light':'dark')}>{theme==='dark'?'☼':'☾'}</button><a href="https://github.com" target="_blank" rel="noreferrer">GitHub ↗</a></div></header>
  <main className="gx-main"><section className="gx-hero"><small>OPEN SOURCE INTELLIGENCE</small><h1>Explore any <em>GitHub profile.</em></h1><p>A live snapshot of developer work, community traction, and open-source activity.</p>
   <form onSubmit={e=>{e.preventDefault();load(input)}}><span>⌕</span><input aria-label="GitHub username" value={input} onChange={e=>setInput(e.target.value)} placeholder="Enter GitHub username"/><button disabled={loading}>{loading?'Loading…':'Explore profile ↗'}</button></form>
   <div className="gx-chips"><b>QUICK EXPLORE</b>{QUICK.map(q=><button key={q} onClick={()=>{setInput(q);load(q)}}>{q}</button>)}</div>
   {recent.length>0&&<div className="gx-chips"><b>RECENT SEARCHES</b>{recent.map(q=><button key={q} onClick={()=>{setInput(q);load(q)}}>{q} ↻</button>)}</div>}
   <details className="gx-token"><summary>Optional GitHub token for higher API limits</summary><p>Token stays in page memory only and is not saved. Use a fine-grained token with public read-only access; avoid shared devices.</p><div><input aria-label="Optional GitHub token" type={showToken?'text':'password'} value={token} onChange={e=>setToken(e.target.value)} placeholder="github_pat_…"/><button type="button" onClick={()=>setShowToken(!showToken)}>{showToken?'Hide':'Show'}</button><button type="button" onClick={()=>load(input)}>Apply & reload</button></div></details>
  </section>
  {error&&<div className="gx-error" role="alert"><b>{error.includes('not found')?'User not found':error.includes('rate limit')?'Rate limit reached':'Unable to load profile'}</b><p>{error}</p><button onClick={()=>load(input)}>Try again</button></div>}
  {loading&&!profile&&<div className="gx-skeleton"><i/><i/><i/><i/></div>}
  {profile&&!loading&&<>
   <section className="gx-profile"><img src={profile.avatar_url} alt={profile.login+' avatar'}/><div className="gx-profile-info"><h2>{profile.name||profile.login} <a href={profile.html_url} target="_blank" rel="noreferrer">@{profile.login} ↗</a></h2><p>{profile.bio||'No public bio provided.'}</p><div className="gx-meta">{profile.company&&<span>▦ {profile.company}</span>}{profile.location&&<span>⌖ {profile.location}</span>}{profile.blog&&<a href={profile.blog.startsWith('http')?profile.blog:'https://'+profile.blog} target="_blank" rel="noreferrer">↗ {profile.blog}</a>}{profile.twitter_username&&<a href={'https://twitter.com/'+profile.twitter_username} target="_blank" rel="noreferrer">𝕏 @{profile.twitter_username}</a>}<span>Joined {date(profile.created_at)}</span></div><div className="gx-follow"><span><b>{number(profile.followers)}</b> followers</span><span><b>{number(profile.following)}</b> following</span><span><b>{number(profile.public_repos)}</b> public repos</span></div></div><a className="gx-outline" href={profile.html_url} target="_blank" rel="noreferrer">View profile ↗</a></section>
   <section className="gx-stats">{[['Stars',stats.stars,'☆'],['Forks',stats.forks,'⑂'],['Watchers',stats.watchers,'◉'],['Open issues',stats.issues,'◎']].map(x=><article key={x[0]}><span>{x[0]} <b>{x[2]}</b></span><strong>{number(x[1])}</strong><small>Across loaded public repositories</small></article>)}</section>
   <div className="gx-heading"><div><small>SIGNALS & TRENDS</small><h2>Developer analytics</h2></div><span>Public repository metadata</span></div>
   <section className="gx-analytics"><article className="gx-panel"><h3>Language distribution</h3><p>Repositories by primary language</p>{langs.length?langs.map(([l,n])=><div className="gx-lang" key={l}><div><span>{l}</span><small>{n} repos</small></div><div><i style={{width:(n/Math.max(...langs.map(x=>x[1]))*100)+'%'}}/></div></div>):<p>No language data reported.</p>}</article><article className="gx-panel"><h3>Top repositories</h3><p>Ranked by stars</p>{sortedTop.map(r=><button className="gx-toprepo" key={r.id} onClick={()=>openRepo(r)}><span><b>{r.name}</b><small>{r.language||'Language not reported'}</small></span><strong>☆ {number(r.stargazers_count)}</strong></button>)}</article></section>
   <section className="gx-panel gx-heatpanel"><h3>Public activity heatmap</h3><p>Last 91 days, derived from returned public events ({events.length} loaded)</p><div className="gx-heat">{heat.map(d=><i key={d.key} className={'gx-level-'+Math.min(4,d.count)} title={d.key+': '+d.count+' public events'}/>)}</div><div className="gx-legend">Less <i className="gx-level-0"/><i className="gx-level-1"/><i className="gx-level-2"/><i className="gx-level-3"/><i className="gx-level-4"/> More</div><p className="gx-note">Approximation only: GitHub's public events API exposes a limited recent window. Missing days do not prove there was no contribution; this is not the official contribution graph.</p></section>
   <section className="gx-panel"><div className="gx-heading"><div><h2>Recent public activity</h2><p>Latest events returned by GitHub</p></div><a href={profile.html_url+'?tab=overview'} target="_blank" rel="noreferrer">Profile activity ↗</a></div>{events.length?events.slice(0,30).map((e,i)=><article className="gx-event" key={e.id||i}><span>{e.type==='PushEvent'?'↥':e.type==='WatchEvent'?'☆':e.type==='PullRequestEvent'?'⑂':'·'}</span><div><b>{eventTitle(e)}</b> <a href={'https://github.com/'+e.repo.name} target="_blank" rel="noreferrer">{e.repo.name}</a><p>{eventText(e)}</p><small>{ago(e.created_at)} · {date(e.created_at)}</small></div></article>):<p>No public events returned.</p>}</section>
   <section className="gx-repos"><div className="gx-heading"><div><small>OPEN SOURCE</small><h2>Repositories <sup>{repos.length}</sup></h2></div><a href={profile.html_url+'?tab=repositories'} target="_blank" rel="noreferrer">View all on GitHub ↗</a></div><div className="gx-filters"><input aria-label="Search repositories" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, description, topics…"/><select aria-label="Filter by language" value={language} onChange={e=>setLanguage(e.target.value)}><option>All languages</option>{languages.map(l=><option key={l}>{l}</option>)}</select><select aria-label="Sort repositories" value={sort} onChange={e=>setSort(e.target.value)}><option value="updated">Recently updated</option><option value="stars">Most stars</option><option value="name">Name A–Z</option></select></div><p className="gx-muted">Showing {filtered.length} of {repos.length} repositories</p><div className="gx-repo-grid">{filtered.map(r=><article className="gx-repo" key={r.id}><div><button className="gx-reponame" onClick={()=>openRepo(r)}>{r.name}</button>{r.fork&&<small>fork</small>}</div><p>{r.description||'No description provided.'}</p>{r.topics?.length>0&&<div className="gx-topics">{r.topics.slice(0,5).map(t=><span key={t}>{t}</span>)}</div>}<div className="gx-repometa"><span>{r.language||'Other'}</span><span>☆ {number(r.stargazers_count)}</span><span>⑂ {number(r.forks_count)}</span><span>{ago(r.pushed_at||r.updated_at)}</span></div><button className="gx-repo-open" onClick={()=>openRepo(r)}>Read README and details ↗</button></article>)}</div>{!filtered.length&&<div className="gx-empty"><b>No matching repositories</b><p>Try another keyword or language.</p><button onClick={()=>{setSearch('');setLanguage('All languages')}}>Clear filters</button></div>}</section>
  </>}
  <footer className="gx-footer">ProfileScope · Public GitHub API · Data may be rate-limited</footer></main>
  {detail&&<div className="gx-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setDetail(null)}}><aside className="gx-drawer" role="dialog" aria-modal="true" aria-labelledby="gx-drawer-title"><div className="gx-drawer-head"><div><small>REPOSITORY DETAILS</small><h2 id="gx-drawer-title">{detail.full_name}</h2></div><button onClick={()=>setDetail(null)} aria-label="Close details">×</button></div><p>{detail.description||'No description provided.'}</p><p>☆ {number(detail.stargazers_count)} stars · ⑂ {number(detail.forks_count)} forks · {number(detail.open_issues_count)} open issues</p><div className="gx-drawer-links"><a href={detail.html_url} target="_blank" rel="noreferrer">Open on GitHub ↗</a><a href={detail.html_url+'/archive/refs/heads/'+detail.default_branch+'.zip'}>Download ZIP ↓</a></div><h3>README <small>{readmeLoading?'Loading…':''}</small></h3>{readmeLoading?<div className="gx-skeleton"><i/></div>:<Readme text={readme}/>}</aside></div>}
 </div>;
}

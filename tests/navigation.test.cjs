const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {createRequire} = require('node:module');
const esbuild = require('esbuild');
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');
const root = path.resolve(__dirname, '..');
let rendered;

test.before(async () => {
  const bundle = await esbuild.build({
    absWorkingDir: root, write:false, bundle:true, platform:'node', format:'cjs', jsx:'automatic',
    external:['react','react/jsx-runtime'],
    stdin:{contents:`export {JourneyHeader} from './components/journey/chrome'; export {MemberActionLink} from './components/journey/account-controls'; export {setSession} from '@clerk/nextjs';`,resolveDir:root,loader:'tsx'},
    plugins:[{name:'session-fixture',setup(build){
      build.onResolve({filter:/^(@clerk\/nextjs|next\/link)$/},args=>({path:args.path,namespace:'session-fixture'}));
      build.onLoad({filter:/.*/,namespace:'session-fixture'},args=>({loader:'js',contents:args.path==='next/link'
        ? `import React from 'react'; export default function Link({children,...props}){return React.createElement('a',props,children)}`
        : `import React from 'react'; let state={isLoaded:false,isSignedIn:undefined}; export function setSession(value){state=value};export function useAuth(){return state};export function UserButton(){return React.createElement('button',{'aria-label':'Account menu'},'Account')}`
      }));
    }}],
  });
  const module={exports:{}};
  vm.runInNewContext(bundle.outputFiles[0].text,{module,exports:module.exports,require:createRequire(path.join(root,'package.json')),console,process});
  rendered=module.exports;
});

test('signed-in public header offers workspace and account menu, never sign in',()=>{
  rendered.setSession({isLoaded:true,isSignedIn:true});
  const html=renderToStaticMarkup(React.createElement(rendered.JourneyHeader));
  assert.match(html,/My workspace/);assert.match(html,/Account menu/);assert.doesNotMatch(html,/href="\/sign-in"/);
});
test('signed-out header retains a working sign-in link',()=>{
  rendered.setSession({isLoaded:true,isSignedIn:false});
  const html=renderToStaticMarkup(React.createElement(rendered.JourneyHeader));
  assert.match(html,/href="\/sign-in"/);assert.doesNotMatch(html,/Account menu/);
});
test('session loading does not flash a misleading sign-in button',()=>{
  rendered.setSession({isLoaded:false,isSignedIn:undefined});
  const html=renderToStaticMarkup(React.createElement(rendered.JourneyHeader));
  assert.match(html,/Loading account/);assert.doesNotMatch(html,/href="\/sign-in"|Account menu/);
});
test('public tool actions send members to the tool and guests to registration',()=>{
  const element=React.createElement(rendered.MemberActionLink,{signedInHref:'/career-coach',signedInLabel:'Get guidance'},'Create account');
  for(const [state,expected] of [[{isLoaded:true,isSignedIn:true},'/career-coach'],[{isLoaded:true,isSignedIn:false},'/sign-up'],[{isLoaded:false},'/career-coach']]){
    rendered.setSession(state);const html=renderToStaticMarkup(element);assert.ok(html.includes(`href="${expected}"`));
    if(state.isSignedIn)assert.doesNotMatch(html,/Create account/);
  }
});
test('every fixed sidebar, header, and journey-step destination has a page',()=>{
  function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
  const routes=new Set(walk(path.join(root,'app')).filter(f=>f.endsWith('page.tsx')).map(f=>'/'+path.relative(path.join(root,'app'),path.dirname(f)).split(path.sep).filter(s=>s&&!s.startsWith('(')).join('/')));
  routes.add('/sign-in');routes.add('/sign-up'); // Clerk catch-all pages.
  const sources=['components/layout/sidebar.tsx','components/journey/chrome.tsx','lib/journey.ts'].map(f=>fs.readFileSync(path.join(root,f),'utf8')).join('\n');
  const links=[...new Set([...sources.matchAll(/["'](\/[a-z][a-z0-9/-]*)["']/g)].map(m=>m[1]))];
  assert.ok(links.length>=25);
  assert.deepEqual(links.filter(link=>!routes.has(link)),[]);
});

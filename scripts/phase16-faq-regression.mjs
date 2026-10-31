import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { ROOT,startStaticServer,launchChromium,blockExternalTraffic } from './seo-runtime.mjs';
const require=createRequire(import.meta.url),server=await startStaticServer(),browser=await launchChromium(),rows=[],failures=[];
try{
 for(const width of [390,1440])for(const javaScriptEnabled of [true,false]){
  const context=await browser.newContext({viewport:{width,height:900},javaScriptEnabled,reducedMotion:'reduce'}),page=await context.newPage();await blockExternalTraffic(page,server.base);
  try{
   await page.goto(server.base+'/faq',{waitUntil:'domcontentloaded'});await page.locator('details').nth(1).waitFor();
   const count=await page.locator('details').count();assert.ok(count>1);
   const schemaCount=await page.evaluate(()=>{const data=JSON.parse(document.getElementById('faq-jsonld').textContent);return data.mainEntity.length;});assert.equal(count,schemaCount);
   const panel=page.locator('details').nth(1),summary=panel.locator('summary'),answer=panel.locator('p');
   assert.equal(await answer.isVisible(),false);await summary.focus();await summary.press('Enter');await answer.waitFor({state:'visible'});await summary.press('Enter');await answer.waitFor({state:'hidden'});
   let violations=null;
   if(javaScriptEnabled){await page.addScriptTag({path:require.resolve('axe-core/axe.min.js')});violations=await page.evaluate(async()=>{const result=await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}});return result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}));});assert.equal(violations.length,0);}
   rows.push({width,javaScriptEnabled,questions:count,schemaCount,keyboardToggle:'PASS',axe:violations===null?'NOT RUN in no-JS context':'PASS',status:'PASS'});
  }catch(error){failures.push({width,javaScriptEnabled,message:error.message});}
  await context.close();
 }
}finally{await browser.close();await server.close();}
const result={at:new Date().toISOString(),scope:'Local native FAQ disclosures; no submissions; external traffic blocked',rows,failures};fs.writeFileSync(path.join(ROOT,'reports/seo-phase16/DOM_REGRESSION.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));if(failures.length)process.exitCode=1;

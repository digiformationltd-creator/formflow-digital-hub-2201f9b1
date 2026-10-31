import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import assert from 'node:assert/strict';
import { ROOT, SITE, startStaticServer, launchChromium, blockExternalTraffic } from './seo-runtime.mjs';
import { blogTopicFor } from '../src/data/blogTopics.ts';
const source=ts.createSourceFile('blog.ts',fs.readFileSync(path.join(ROOT,'src/data/blog.ts'),'utf8'),ts.ScriptTarget.Latest,true),posts=[];
for(const statement of source.statements)if(ts.isVariableStatement(statement))for(const declaration of statement.declarationList.declarations)if(declaration.name.getText(source)==='blogPosts')for(const post of declaration.initializer.elements){const value=key=>post.properties.find(p=>(ts.isIdentifier(p.name)||ts.isStringLiteral(p.name))&&p.name.text===key)?.initializer.text;posts.push({slug:value('slug'),category:value('category')});}
const samples=['UK Formation','USA Formation','Stripe','PayPal','UK Compliance','Banking','Software Engineering','Open Source AI','Web Development','Compliance'].map(category=>posts.find(p=>p.category===category));
assert.equal(samples.filter(Boolean).length,10);
const server=await startStaticServer(),browser=await launchChromium(),rows=[],failures=[];
try{
  for(const width of [390,1440]){
    const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'}),page=await context.newPage();await blockExternalTraffic(page,server.base);
    for(const post of samples){
      const expected=blogTopicFor(post).links[0].path;
      try{
        await page.goto(server.base+'/blog/'+post.slug,{waitUntil:'domcontentloaded'});
        await page.waitForFunction(()=>document.documentElement.dataset.routeReady===location.pathname);
        const anchor=page.locator('section[aria-labelledby="topic-services-heading"] a').first();
        assert.equal(await anchor.getAttribute('href'),expected);await anchor.click();
        await page.waitForURL(url=>url.pathname===expected);
        await page.waitForFunction(target=>document.documentElement.dataset.routeReady===target,expected);
        assert.equal(await page.locator('h1').count(),1);
        assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),SITE+expected);
        rows.push({width,source:'/blog/'+post.slug,target:expected,status:'PASS'});
      }catch(error){failures.push({width,source:post.slug,target:expected,message:error.message});}
    }
    await context.close();
  }
}finally{await browser.close();await server.close();}
const result={at:new Date().toISOString(),scope:'20 local non-submitting topic journeys; checkout handoffs tested separately; all external traffic blocked',rows,failures};
fs.writeFileSync(path.join(ROOT,'reports/seo/phase-14/TOPIC_JOURNEYS.json'),JSON.stringify(result,null,2));console.log(JSON.stringify({passed:rows.length,failures},null,2));if(failures.length)process.exitCode=1;

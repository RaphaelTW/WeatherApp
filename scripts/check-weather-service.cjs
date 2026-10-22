// Testes sem internet, usando o TypeScript já instalado em devDependencies.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Module=require('node:module');
const ts=require('typescript');
const filename=path.resolve(__dirname,'../services/weather.ts');
const source=fs.readFileSync(filename,'utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const mod=new Module(filename,module);mod.filename=filename;mod.paths=module.paths;mod._compile(compiled,filename);
const service=mod.exports;
const time=Array.from({length:384},(_,i)=>`2026-10-${String(21+Math.floor(i/24)).padStart(2,'0')}T${String(i%24).padStart(2,'0')}:00`);
const dtime=Array.from({length:16},(_,i)=>`2026-11-${String(i+1).padStart(2,'0')}`);
function forecast(){return {
 current:{temperature_2m:20,relative_humidity_2m:73,apparent_temperature:21,is_day:1,precipitation:0,weather_code:3,wind_speed_10m:11,wind_direction_10m:160,visibility:10000,time:'2026-10-21T12:00'},
 hourly:{time,temperature_2m:time.map(()=>20),apparent_temperature:time.map(()=>21),precipitation_probability:time.map(()=>70),wind_speed_10m:time.map(()=>11),weather_code:time.map(()=>3)},
 daily:{time:dtime,weather_code:dtime.map(()=>3),temperature_2m_min:dtime.map(()=>17),temperature_2m_max:dtime.map(()=>22),precipitation_probability_max:dtime.map(()=>70),precipitation_sum:dtime.map(()=>2.5),uv_index_max:dtime.map(()=>7),sunrise:dtime.map(x=>x+'T05:31'),sunset:dtime.map(x=>x+'T18:11')},
}}
async function main(){
 assert.equal(service.kindOf(0),'sun');assert.equal(service.kindOf(95),'storm');assert.equal(service.kindOf(73),'snow');
 assert.equal(service.labelOf(3),'Nublado');assert.equal(service.uvLabel(12),'Extremo');assert.equal(service.compass(160),'S');
 const original=global.fetch;
 global.fetch=async(url)=>({ok:true,json:async()=>url.includes('air-quality')?{current:{us_aqi:32}}:url.includes('geocoding')?{results:[{name:'São Paulo',latitude:-23.55,longitude:-46.63}]}:url.includes('earthquake.usgs.gov')?{features:[{id:'us-test',properties:{place:'10 km de São Paulo',mag:3.2,time:1761048000000},geometry:{coordinates:[-46.7,-23.5]}}]}:forecast()});
 try{
  const geo=await service.geocodeCity('São Paulo');assert.equal(geo[0].name,'São Paulo');
  const data=await service.getWeather(-23.55,-46.63,'São Paulo','Brasil');
  assert.equal(data.city,'São Paulo');assert.equal(data.hourly.length,384);assert.equal(data.daily.length,16);assert.equal(data.current.aqi,32);
  assert.equal(data.current.humidity,73);assert.equal(data.daily[0].uv,7);assert.equal(data.earthquakes.length,1);assert.equal(data.earthquakes[0].magnitude,3.2);
  const advice=service.personalizedAdvice(data,['correr']);assert.ok(advice.includes('atividades ao ar livre'));
  assert.ok(service.activeAlerts(data,['chuva']).length>=1);
  console.log('✓ Weather service tests: conditions, geocoding, 16 days, air quality, nearby earthquakes, advice and alerts.');
 }finally{global.fetch=original;}
}
main().catch(err=>{console.error(err);process.exitCode=1});

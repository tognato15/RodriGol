import assert from "node:assert/strict";
import { describe,it } from "node:test";
import { MatchMinute, Score, ShirtNumber, TeamName } from "../dist/index.js";
describe("Objetos de valor",()=>{
  it("formata placar e acréscimos",()=>{ assert.equal(Score.create(2,1).toString(),"2 x 1"); assert.equal(MatchMinute.create(90,4).toString(),"90+4'"); });
  it("valida nome e camisa",()=>{ assert.equal(TeamName.create("Palmeiras").toString(),"Palmeiras"); assert.equal(ShirtNumber.create(10).value,10); assert.throws(()=>ShirtNumber.create(0)); });
});

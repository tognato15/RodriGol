import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  Formation, GroupId, Lineup, MatchDiscipline, PenaltyShootout, PlayerId,
  Standings, StatLine, TeamId, TieBreakerRules
} from "../dist/index.js";

class FixedGenerator { constructor(value){this.value=value;} generate(){return this.value;} }
const make=(factory,value)=>factory.create(new FixedGenerator(value));
const players = Array.from({length: 18}, (_, i) => make(PlayerId,`p${i+1}`));

describe("Football Engine completo", () => {
  it("cria escalação completa com titulares, reservas, capitão e goleiro", () => {
    const lineup = Lineup.create({ starters: players.slice(0,11), substitutes: players.slice(11), captainId: players[0], goalkeeperId: players[0], formation: Formation.create("4-3-3") });
    assert.equal(lineup.starters.length, 11);
    assert.equal(lineup.substitutes.length, 7);
  });
  it("controla disciplina e expulsão pelo segundo amarelo", () => {
    const discipline = new MatchDiscipline();
    const record = discipline.forPlayer(players[1]);
    record.registerYellow(); record.registerYellow();
    assert.equal(record.isSentOff, true);
    assert.equal(record.redCards, 1);
  });
  it("registra disputa de pênaltis cobrança por cobrança", () => {
    const shootout = new PenaltyShootout();
    for(let i=0;i<5;i++){ shootout.register("home",players[i],"scored"); shootout.register("away",players[i+5],i===4?"missed":"scored"); }
    assert.equal(shootout.score("home"),5); assert.equal(shootout.score("away"),4); assert.equal(shootout.winner,"home");
  });
  it("ordena classificação por pontos, vitórias e saldo", () => {
    const a=make(TeamId,"a"), b=make(TeamId,"b");
    const table=new Standings();
    table.update({teamId:a,played:2,wins:1,draws:1,losses:0,goalsFor:3,goalsAgainst:1,points:4});
    table.update({teamId:b,played:2,wins:1,draws:1,losses:0,goalsFor:2,goalsAgainst:1,points:4});
    const rules=new TieBreakerRules(["points","wins","goal-difference","goals-for"]);
    assert.equal(table.ranked(rules.criteria)[0].teamId.equals(a),true);
  });
  it("valida estatísticas consistentes", () => {
    const line=StatLine.create({shots:10,shotsOnTarget:4,possession:55,corners:5,fouls:8,offsides:2,passes:430,accuratePasses:380,saves:3});
    assert.equal(line.value.possession,55);
  });
});

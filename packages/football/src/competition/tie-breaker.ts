export type TieBreakerCriterion="points"|"wins"|"goal-difference"|"goals-for"|"head-to-head"|"fair-play"|"drawing-lots";
export class TieBreakerRules { public constructor(public readonly criteria:readonly TieBreakerCriterion[]){if(criteria.length===0)throw new Error("Ao menos um critério de desempate é necessário.");} }

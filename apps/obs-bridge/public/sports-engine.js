export const SPORTS = Object.freeze([
['FOOTBALL','Futebol'],['BASKETBALL','Basquete'],['BASEBALL','Beisebol'],['BOXING','Boxe'],['CRICKET','Críquete'],['GRIDIRON','Football'],['FUTSAL','Futsal'],['HANDBALL','Handebol'],['ICE_HOCKEY','Hockey'],['FIELD_HOCKEY','Hóquei Sobre Grama'],['ROLLER_HOCKEY','Hóquei Sobre Patins'],['JUDO','Judô'],['NETBALL','Netball'],['WATER_POLO','Polo Aquático'],['RUGBY','Rugby'],['RUGBY_LEAGUE','Rugby League'],['TENNIS','Tênis'],['TABLE_TENNIS','Tênis de Mesa'],['VOLLEYBALL','Vôlei'],['BEACH_VOLLEYBALL','Vôlei de Praia']
]);
const common=[['PRE_GAME','Pré-evento'],['LIVE_UNKNOWN','Em andamento — sem relógio'],['FINAL','Finalizada']];
export const SPORT_PROFILES=Object.freeze({
FOOTBALL:{unit:'gol',periods:[['FIRST_HALF','1º tempo'],['HALFTIME','Intervalo'],['SECOND_HALF','2º tempo'],['EXTRA_TIME_FIRST_HALF','1º tempo da prorrogação'],['EXTRA_TIME_HALFTIME','Intervalo da prorrogação'],['EXTRA_TIME_SECOND_HALF','2º tempo da prorrogação'],['PENALTIES','Pênaltis']],events:['GOAL','PENALTY_SCORED','PENALTY_MISSED','YELLOW_CARD','RED_CARD','SUBSTITUTION','VAR','INFORMATION','REVIEW']},
FUTSAL:{unit:'gol',periods:[['FIRST_HALF','1º tempo'],['HALFTIME','Intervalo'],['SECOND_HALF','2º tempo']],events:['GOAL','YELLOW_CARD','RED_CARD','INFORMATION','REVIEW']},
BASKETBALL:{unit:'ponto',clock:{mode:'countdown',seconds:600},periods:[['Q1','1º quarto'],['Q2','2º quarto'],['HALFTIME','Intervalo'],['Q3','3º quarto'],['Q4','4º quarto'],['OVERTIME','Prorrogação']],events:['POINT_1','POINT_2','POINT_3','INFORMATION','REVIEW']},
BASEBALL:{clock:{mode:'none'},unit:'corrida',periods:[['INNING_1','1º inning'],['INNING_2','2º inning'],['INNING_3','3º inning'],['INNING_4','4º inning'],['INNING_5','5º inning'],['INNING_6','6º inning'],['INNING_7','7º inning'],['INNING_8','8º inning'],['INNING_9','9º inning']],events:['RUN','INFORMATION','REVIEW']},
BOXING:{unit:'ponto',periods:Array.from({length:12},(_,i)=>[`ROUND_${i+1}`,`${i+1}º round`]),events:['INFORMATION','REVIEW']},
CRICKET:{clock:{mode:'none'},unit:'run',periods:[['INNINGS_1','1º innings'],['INNINGS_2','2º innings']],events:['CRICKET_RUN','WICKET','INFORMATION','REVIEW']},
GRIDIRON:{unit:'ponto',clock:{mode:'countdown',seconds:900},periods:[['Q1','1º quarto'],['Q2','2º quarto'],['HALFTIME','Intervalo'],['Q3','3º quarto'],['Q4','4º quarto'],['OVERTIME','Prorrogação']],events:['TOUCHDOWN','EXTRA_POINT','TWO_POINT_CONVERSION','FIELD_GOAL','SAFETY','INFORMATION','REVIEW']},
HANDBALL:{unit:'gol',periods:[['FIRST_HALF','1º tempo'],['HALFTIME','Intervalo'],['SECOND_HALF','2º tempo']],events:['GOAL','INFORMATION','REVIEW']},
ICE_HOCKEY:{unit:'gol',clock:{mode:'countdown',seconds:1200},periods:[['P1','1º período'],['P2','2º período'],['P3','3º período'],['OVERTIME','Prorrogação']],events:['GOAL','INFORMATION','REVIEW']},
FIELD_HOCKEY:{unit:'gol',clock:{mode:'countdown',seconds:900},periods:[['Q1','1º quarto'],['Q2','2º quarto'],['Q3','3º quarto'],['Q4','4º quarto']],events:['GOAL','INFORMATION','REVIEW']},
ROLLER_HOCKEY:{unit:'gol',periods:[['FIRST_HALF','1º tempo'],['HALFTIME','Intervalo'],['SECOND_HALF','2º tempo']],events:['GOAL','INFORMATION','REVIEW']},
JUDO:{unit:'pontuação',periods:[['BOUT','Combate']],events:['IPPON','WAZA_ARI','PENALTY','INFORMATION','REVIEW']},
NETBALL:{unit:'gol',clock:{mode:'countdown',seconds:900},periods:[['Q1','1º quarto'],['Q2','2º quarto'],['Q3','3º quarto'],['Q4','4º quarto']],events:['GOAL','INFORMATION','REVIEW']},
WATER_POLO:{unit:'gol',clock:{mode:'countdown',seconds:480},periods:[['Q1','1º quarto'],['Q2','2º quarto'],['Q3','3º quarto'],['Q4','4º quarto']],events:['GOAL','INFORMATION','REVIEW']},
RUGBY:{unit:'ponto',periods:[['FIRST_HALF','1º tempo'],['HALFTIME','Intervalo'],['SECOND_HALF','2º tempo']],events:['RUGBY_TRY','RUGBY_CONVERSION','RUGBY_PENALTY','RUGBY_DROP_GOAL','INFORMATION','REVIEW']},
RUGBY_LEAGUE:{unit:'ponto',periods:[['FIRST_HALF','1º tempo'],['HALFTIME','Intervalo'],['SECOND_HALF','2º tempo']],events:['LEAGUE_TRY','LEAGUE_CONVERSION','LEAGUE_PENALTY','LEAGUE_DROP_GOAL','INFORMATION','REVIEW']},
TENNIS:{clock:{mode:'none'},unit:'ponto',periods:[['SET_1','1º set'],['SET_2','2º set'],['SET_3','3º set'],['SET_4','4º set'],['SET_5','5º set']],events:['TENNIS_POINT','INFORMATION','REVIEW']},
TABLE_TENNIS:{clock:{mode:'none'},unit:'ponto',periods:Array.from({length:7},(_,i)=>[`SET_${i+1}`,`${i+1}º set`]),events:['TABLE_TENNIS_POINT','INFORMATION','REVIEW']},
VOLLEYBALL:{clock:{mode:'none'},unit:'ponto',periods:Array.from({length:5},(_,i)=>[`SET_${i+1}`,`${i+1}º set`]),events:['VOLLEY_POINT','INFORMATION','REVIEW']},
BEACH_VOLLEYBALL:{clock:{mode:'none'},unit:'ponto',periods:Array.from({length:3},(_,i)=>[`SET_${i+1}`,`${i+1}º set`]),events:['VOLLEY_POINT','INFORMATION','REVIEW']}
});
export function sportProfile(sport='FOOTBALL'){return SPORT_PROFILES[String(sport||'FOOTBALL').toUpperCase()]||SPORT_PROFILES.FOOTBALL;}
export function phaseOptions(sport){const p=sportProfile(sport);return [common[0],...p.periods,common[1],common[2]];}
export function sportOptions(){return SPORTS.map(([value,label])=>`<option value="${value}">${label}</option>`).join('');}

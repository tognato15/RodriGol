import json,sqlite3,os,re
ROOT=os.path.dirname(os.path.dirname(__file__))
PUB=os.path.join(ROOT,'apps/obs-bridge/public/data'); DB=os.path.join(ROOT,'apps/obs-bridge/data')
B='''
Botafogo-SP|Fortaleza;Novorizontino|Londrina;Athletic|Ponte Preta;Operário-PR|Atlético-GO;Ceará|São Bernardo;Goiás|América-MG;Avaí|Juventude;Náutico|Criciúma;Cuiabá|Sport;Vila Nova|CRB
Ponte Preta|Ceará;São Bernardo|Operário-PR;América-MG|Botafogo-SP;Londrina|Goiás;Fortaleza|Cuiabá;Atlético-GO|Náutico;Criciúma|Athletic;Sport|Vila Nova;CRB|Avaí;Juventude|Novorizontino
Botafogo-SP|São Bernardo;Novorizontino|CRB;Athletic|América-MG;Londrina|Sport;Fortaleza|Juventude;Goiás|Criciúma;Avaí|Operário-PR;Náutico|Ponte Preta;Cuiabá|Ceará;Vila Nova|Atlético-GO
Ponte Preta|Vila Nova;São Bernardo|Fortaleza;América-MG|Novorizontino;Operário-PR|Cuiabá;Ceará|Náutico;Atlético-GO|Londrina;Criciúma|Botafogo-SP;Sport|Avaí;CRB|Athletic;Juventude|Goiás
Botafogo-SP|Atlético-GO;Novorizontino|Athletic;América-MG|Sport;Londrina|Ceará;Fortaleza|Criciúma;Goiás|Cuiabá;Avaí|Ponte Preta;Náutico|São Bernardo;CRB|Juventude;Vila Nova|Operário-PR
Ponte Preta|América-MG;São Bernardo|Goiás;Athletic|Náutico;Operário-PR|Fortaleza;Ceará|Vila Nova;Atlético-GO|Avaí;Criciúma|CRB;Sport|Novorizontino;Cuiabá|Botafogo-SP;Juventude|Londrina
Botafogo-SP|Náutico;São Bernardo|Ponte Preta;América-MG|CRB;Operário-PR|Londrina;Fortaleza|Goiás;Atlético-GO|Juventude;Avaí|Novorizontino;Sport|Ceará;Cuiabá|Criciúma;Vila Nova|Athletic
Ponte Preta|Sport;Novorizontino|Botafogo-SP;Athletic|Cuiabá;Londrina|São Bernardo;Ceará|Atlético-GO;Goiás|Vila Nova;Avaí|Fortaleza;Náutico|América-MG;CRB|Operário-PR;Juventude|Criciúma
Ponte Preta|Londrina;São Bernardo|América-MG;Athletic|Juventude;Operário-PR|Náutico;Ceará|Fortaleza;Goiás|Botafogo-SP;Criciúma|Atlético-GO;Sport|CRB;Cuiabá|Novorizontino;Vila Nova|Avaí
Botafogo-SP|Athletic;Novorizontino|Ceará;América-MG|Vila Nova;Operário-PR|Criciúma;Fortaleza|Londrina;Atlético-GO|São Bernardo;Avaí|Goiás;Náutico|Cuiabá;CRB|Ponte Preta;Juventude|Sport
Ponte Preta|Botafogo-SP;São Bernardo|Novorizontino;Athletic|Fortaleza;Londrina|Vila Nova;Ceará|Operário-PR;Atlético-GO|Goiás;Avaí|Criciúma;Sport|Náutico;Cuiabá|CRB;Juventude|América-MG
Ponte Preta|Cuiabá;Sport|Athletic;América-MG|Atlético-GO;Operário-PR|Juventude;Ceará|Avaí;Goiás|Novorizontino;Criciúma|Londrina;Náutico|Fortaleza;CRB|São Bernardo;Vila Nova|Botafogo-SP
Botafogo-SP|Operário-PR;São Bernardo|Sport;Athletic|Goiás;Londrina|Avaí;Fortaleza|América-MG;Atlético-GO|CRB;Criciúma|Ceará;Novorizontino|Náutico;Cuiabá|Vila Nova;Juventude|Ponte Preta
Ponte Preta|Novorizontino;São Bernardo|Juventude;América-MG|Criciúma;Londrina|Athletic;Ceará|Botafogo-SP;Goiás|Operário-PR;Avaí|Cuiabá;Sport|Atlético-GO;CRB|Fortaleza;Vila Nova|Náutico
Botafogo-SP|CRB;Novorizontino|Vila Nova;Athletic|Avaí;Operário-PR|América-MG;Fortaleza|Sport;Atlético-GO|Ponte Preta;Criciúma|São Bernardo;Náutico|Goiás;Cuiabá|Londrina;Juventude|Ceará
Botafogo-SP|Avaí;Novorizontino|Atlético-GO;Athletic|Operário-PR;Londrina|CRB;Fortaleza|Ponte Preta;Goiás|Ceará;Criciúma|Sport;Náutico|Juventude;Cuiabá|América-MG;Vila Nova|São Bernardo
Ponte Preta|Criciúma;São Bernardo|Cuiabá;América-MG|Londrina;Operário-PR|Novorizontino;Ceará|Athletic;Atlético-GO|Fortaleza;Avaí|Náutico;Sport|Botafogo-SP;CRB|Goiás;Juventude|Vila Nova
Ponte Preta|Goiás;São Bernardo|Avaí;América-MG|Ceará;Londrina|Botafogo-SP;Fortaleza|Novorizontino;Atlético-GO|Athletic;Criciúma|Vila Nova;Sport|Operário-PR;CRB|Náutico;Juventude|Cuiabá
Botafogo-SP|Juventude;Novorizontino|Criciúma;Athletic|São Bernardo;Operário-PR|Ponte Preta;Ceará|CRB;Goiás|Sport;Avaí|América-MG;Náutico|Londrina;Cuiabá|Atlético-GO;Vila Nova|Fortaleza
'''
C='''
Inter de Limeira|Floresta;Ituano|Anápolis;Brusque|Caxias;Confiança|Amazonas;Maranhão|Guarani;Volta Redonda|Paysandu;Maringá|Ferroviária;Ypiranga|Figueirense;Santa Cruz|Itabaiana;Botafogo-PB|Barra
Ferroviária|Botafogo-PB;Guarani|Volta Redonda;Figueirense|Maringá;Itabaiana|Ypiranga;Floresta|Santa Cruz;Anápolis|Inter de Limeira;Caxias|Confiança;Barra|Maranhão;Paysandu|Brusque;Amazonas|Ituano
Inter de Limeira|Ituano;Guarani|Itabaiana;Figueirense|Botafogo-PB;Confiança|Santa Cruz;Floresta|Ferroviária;Volta Redonda|Caxias;Maringá|Brusque;Ypiranga|Anápolis;Paysandu|Barra;Amazonas|Maranhão
Ferroviária|Guarani;Ituano|Maringá;Brusque|Confiança;Itabaiana|Paysandu;Maranhão|Volta Redonda;Anápolis|Figueirense;Caxias|Ypiranga;Barra|Inter de Limeira;Santa Cruz|Amazonas;Botafogo-PB|Floresta
Ferroviária|Anápolis;Guarani|Santa Cruz;Figueirense|Barra;Confiança|Inter de Limeira;Floresta|Maranhão;Volta Redonda|Brusque;Maringá|Itabaiana;Ypiranga|Ituano;Paysandu|Botafogo-PB;Amazonas|Caxias
Inter de Limeira|Santa Cruz;Ituano|Confiança;Brusque|Ypiranga;Itabaiana|Floresta;Maranhão|Botafogo-PB;Volta Redonda|Ferroviária;Maringá|Guarani;Barra|Caxias;Paysandu|Anápolis;Amazonas|Figueirense
Ferroviária|Brusque;Guarani|Ituano;Figueirense|Itabaiana;Confiança|Maranhão;Floresta|Amazonas;Anápolis|Barra;Caxias|Paysandu;Ypiranga|Maringá;Santa Cruz|Volta Redonda;Botafogo-PB|Inter de Limeira
Inter de Limeira|Itabaiana;Ituano|Botafogo-PB;Brusque|Anápolis;Confiança|Figueirense;Maranhão|Caxias;Volta Redonda|Ypiranga;Maringá|Santa Cruz;Barra|Guarani;Paysandu|Floresta;Amazonas|Ferroviária
Inter de Limeira|Ypiranga;Guarani|Amazonas;Figueirense|Paysandu;Itabaiana|Volta Redonda;Floresta|Confiança;Anápolis|Maranhão;Caxias|Ituano;Barra|Brusque;Santa Cruz|Ferroviária;Botafogo-PB|Maringá
Ferroviária|Barra;Guarani|Caxias;Brusque|Santa Cruz;Itabaiana|Ituano;Floresta|Figueirense;Volta Redonda|Confiança;Maringá|Maranhão;Ypiranga|Botafogo-PB;Paysandu|Inter de Limeira;Amazonas|Anápolis
Ferroviária|Inter de Limeira;Ituano|Figueirense;Brusque|Floresta;Confiança|Guarani;Maranhão|Paysandu;Anápolis|Itabaiana;Caxias|Maringá;Barra|Amazonas;Santa Cruz|Ypiranga;Botafogo-PB|Volta Redonda
Inter de Limeira|Maringá;Ituano|Maranhão;Figueirense|Guarani;Itabaiana|Ferroviária;Floresta|Barra;Volta Redonda|Amazonas;Caxias|Anápolis;Ypiranga|Confiança;Paysandu|Santa Cruz;Botafogo-PB|Brusque
Ferroviária|Caxias;Guarani|Floresta;Brusque|Figueirense;Confiança|Barra;Maranhão|Inter de Limeira;Anápolis|Botafogo-PB;Maringá|Volta Redonda;Ypiranga|Paysandu;Santa Cruz|Ituano;Amazonas|Itabaiana
Inter de Limeira|Amazonas;Ituano|Ferroviária;Figueirense|Volta Redonda;Itabaiana|Brusque;Maranhão|Ypiranga;Anápolis|Maringá;Caxias|Floresta;Barra|Santa Cruz;Paysandu|Guarani;Botafogo-PB|Confiança
Ferroviária|Maranhão;Guarani|Inter de Limeira;Brusque|Ituano;Confiança|Itabaiana;Floresta|Maringá;Volta Redonda|Anápolis;Caxias|Botafogo-PB;Ypiranga|Barra;Santa Cruz|Figueirense;Amazonas|Paysandu
Inter de Limeira|Volta Redonda;Ituano|Barra;Figueirense|Ferroviária;Itabaiana|Caxias;Maranhão|Brusque;Anápolis|Guarani;Maringá|Amazonas;Ypiranga|Floresta;Paysandu|Confiança;Botafogo-PB|Santa Cruz
Ferroviária|Paysandu;Guarani|Ypiranga;Brusque|Inter de Limeira;Confiança|Maringá;Floresta|Anápolis;Volta Redonda|Ituano;Caxias|Figueirense;Barra|Itabaiana;Santa Cruz|Maranhão;Amazonas|Botafogo-PB
Inter de Limeira|Figueirense;Ituano|Paysandu;Brusque|Amazonas;Confiança|Anápolis;Maranhão|Itabaiana;Volta Redonda|Floresta;Maringá|Barra;Ypiranga|Ferroviária;Santa Cruz|Caxias;Botafogo-PB|Guarani
Ferroviária|Confiança;Guarani|Brusque;Figueirense|Maranhão;Itabaiana|Botafogo-PB;Floresta|Ituano;Anápolis|Santa Cruz;Caxias|Inter de Limeira;Barra|Volta Redonda;Paysandu|Maringá;Amazonas|Ypiranga
'''
def parse(s): return [[tuple(x.split('|')) for x in line.split(';')] for line in s.strip().splitlines()]

def fill(comp, rounds, reverse=False):
 p=os.path.join(PUB,f'brasileirao-serie-{comp}-2026.json'); d=json.load(open(p,encoding='utf8')); ids={x['name']:x['id'] for x in d['clubs']}
 fixtures=list(rounds)
 if reverse: fixtures += [[(b,a) for a,b in r] for r in rounds]
 # preserve C second phase
 keep=[]
 if comp=='c': keep=[m for m in d['matches'] if m.get('stageId')!='brasileirao-c-first-phase']
 ms=[]
 stage='brasileirao-b-league-1' if comp=='b' else 'brasileirao-c-first-phase'; cid='brasileirao-b' if comp=='b' else 'brasileirao-c'
 for rn,r in enumerate(fixtures,1):
  for i,(a,b) in enumerate(r,1):
   ms.append({'id':f'{cid}-2026-r{rn:02d}-m{i:02d}','competitionId':cid,'season':'2026','stageId':stage,'groupId':'' if comp=='b' else 'A','roundId':f'{cid}-2026-r{rn:02d}' if comp=='b' else f'brasileirao-c-2026-f1-r{rn:02d}','round':f'{rn}ª Rodada','homeClubId':ids[a],'awayClubId':ids[b],'status':'SCHEDULED','date':'','time':'','venue':'','city':'','source':'CBF - Tabela Básica 2026','sourceUpdatedAt':'2026-09-23T00:00:00-03:00','homeScore':None,'awayScore':None,'resultSource':'','resultUpdatedAt':''})
 d['matches']=ms+keep
 d.setdefault('meta',{})['fixturesCompletedAt']='2026-09-23T00:00:00-03:00'; d['meta']['fixturesSource']='CBF - Tabela Básica 2026'
 json.dump(d,open(p,'w',encoding='utf8'),ensure_ascii=False,indent=2)
 # sqlite replace first/main phase only
 dbp=os.path.join(DB,f'brasileirao-serie-{comp}-2026.sqlite'); c=sqlite3.connect(dbp)
 if comp=='b': c.execute('delete from matches')
 else: c.execute("delete from matches where stage_id='brasileirao-c-first-phase'")
 for m in ms:
  c.execute('''insert into matches(id,competition_id,season,stage_id,group_id,round_no,home_club_id,away_club_id,status,date,time,venue,city,source,source_updated_at,home_score,away_score,result_source,result_updated_at) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)''',(m['id'],m['competitionId'],m['season'],m['stageId'],m['groupId'],m['round'],m['homeClubId'],m['awayClubId'],m['status'],m['date'],m['time'],m['venue'],m['city'],m['source'],m['sourceUpdatedAt'],None,None,'',''))
 c.commit(); c.close(); return len(ms)+len(keep)
print('B',fill('b',parse(B),True)); print('C',fill('c',parse(C),False))
# publish complete databases
mp=os.path.join(PUB,'databases.json'); man=json.load(open(mp));
for item in [
 {'id':'brasileirao-serie-b-2026','name':'Campeonato Brasileiro Série B 2026','path':'/data/brasileirao-serie-b-2026.json'},
 {'id':'brasileirao-serie-c-2026','name':'Campeonato Brasileiro Série C 2026','path':'/data/brasileirao-serie-c-2026.json'}]:
 if not any(x['id']==item['id'] for x in man['databases']): man['databases'].append(item)
man['version']='2.1.6'; json.dump(man,open(mp,'w'),ensure_ascii=False,indent=2)

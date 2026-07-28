export enum EditorialPriority { LOW = 10, NORMAL = 20, HIGH = 30, URGENT = 40, BREAKING = 50 }
export const priorityLabel = (priority: EditorialPriority): string => ({10:"Baixa",20:"Normal",30:"Alta",40:"Urgente",50:"Plantão"})[priority];

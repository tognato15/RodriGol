import { InvalidArgumentError, ValueObject } from "@rodrigol/core";
export interface MatchSettingsValue { readonly regulationMinutes: number; readonly allowsExtraTime: boolean; readonly allowsPenaltyShootout: boolean; }
export class MatchSettings extends ValueObject<MatchSettingsValue> {
  private constructor(value: MatchSettingsValue) { super(value); }
  public static standard(): MatchSettings { return new MatchSettings({regulationMinutes:90,allowsExtraTime:false,allowsPenaltyShootout:false}); }
  public static knockout(allowsExtraTime = true, allowsPenaltyShootout = true): MatchSettings { return new MatchSettings({regulationMinutes:90,allowsExtraTime,allowsPenaltyShootout}); }
  public static create(value: MatchSettingsValue): MatchSettings {
    if (!Number.isInteger(value.regulationMinutes) || value.regulationMinutes < 1) throw new InvalidArgumentError("A duração regulamentar é inválida.", "INVALID_REGULATION_MINUTES");
    return new MatchSettings(value);
  }
}

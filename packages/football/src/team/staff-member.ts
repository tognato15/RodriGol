import { Entity, InvalidArgumentError } from "@rodrigol/core";
import type { StaffMemberId } from "../identity/index.js";
export type StaffRole = "head-coach" | "assistant-coach" | "goalkeeper-coach" | "fitness-coach" | "doctor" | "physiotherapist" | "analyst" | "manager";
export class StaffMember extends Entity<StaffMemberId> {
  private constructor(id: StaffMemberId, public readonly name: string, public readonly role: StaffRole) { super(id); }
  public static create(id: StaffMemberId, name: string, role: StaffRole): StaffMember {
    const normalized=name.trim(); if(normalized.length<2) throw new InvalidArgumentError("Nome de membro da comissão inválido.","INVALID_STAFF_NAME");
    return new StaffMember(id, normalized, role);
  }
}

"use client";
import { RolesActions } from "./Actions";

export function RolesEditCell({ name }:{ name:string }){
  return <RolesActions roleName={name}/>;
}

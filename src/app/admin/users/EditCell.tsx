"use client";
import { UsersActions } from "./Actions";

export function UsersEditCell({ id }:{ id:string }){
  return <UsersActions userId={id}/>;
}

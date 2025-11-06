"use client";
import { ResellersActions } from "./Actions";

export function ResellersEditCell({ id }:{ id:string }){
  return <ResellersActions resellerId={id}/>;
}

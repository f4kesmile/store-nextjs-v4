"use client";
import { TransactionsActions } from "./Actions";

export function TransactionsEditCell({ id }:{ id:string }){
  return <TransactionsActions orderId={id}/>;
}

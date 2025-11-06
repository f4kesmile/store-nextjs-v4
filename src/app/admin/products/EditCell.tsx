"use client";
import { ProductsActions } from "./Actions";

export function ProductsEditCell({ id }:{ id:string }){
  return <ProductsActions productId={id}/>;
}

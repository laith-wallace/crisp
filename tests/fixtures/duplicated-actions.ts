// Fixture for /crisp-structure - a small app with three actions, one service, one component.
// Do not fix this file. It exists to be audited.

import Stripe from "stripe";
import { db } from "./db";
import { useEffect, useState } from "react";

// ---------- actions/checkout.ts ----------
export async function checkout(userId: string, plan: string) {
  const user = await db.user.find(userId);
  const stripe = new Stripe(process.env.STRIPE_KEY!);
  const customer = await stripe.customers.create({ email: user.email, name: user.name });
  await db.user.update(userId, { stripeId: customer.id, status: "active" });
  return { ok: true };
}

// ---------- actions/upgrade.ts ----------
export async function upgrade(userId: string, plan: string) {
  const user = await db.user.find(userId);
  const stripe = new Stripe(process.env.STRIPE_KEY!);
  const customer = await stripe.customers.create({ email: user.email, name: user.name });
  await db.user.update(userId, { stripeId: customer.id, plan });
  return { ok: true };
}

// ---------- actions/trial.ts ----------
export async function startTrial(userId: string) {
  const user = await db.user.find(userId);
  const stripe = new Stripe(process.env.STRIPE_KEY!);
  const customer = await stripe.customers.create({ email: user.email }); // name missing - diverged copy
  await db.user.update(userId, { stripeId: customer.id, status: "trial" });
  return { ok: true };
}

// ---------- services/billing.ts ----------
export async function syncSubscription(userId: string, mode: "strict" | "relaxed") {
  const user = await db.user.find(userId);
  const stripe = new Stripe(process.env.STRIPE_KEY!);
  const subs = await stripe.subscriptions.list({ customer: user.stripeId });
  if (mode === "strict" && subs.data.length === 0) throw new Error("No subscription");
  await db.user.update(userId, { status: subs.data.length ? "active" : "lapsed" });
  return subs.data[0];
}

export async function prepareInvoicePdf(invoiceId: string) {
  // only called from one place: actions/invoice.ts
  return { ok: true, path: `/tmp/${invoiceId}.pdf` };
}

// ---------- components/Cart.tsx ----------
export function Cart({ userId }: { userId: string }) {
  const [items, setItems] = useState<{ price: number }[]>([]);
  useEffect(() => {
    fetch(`/api/cart/${userId}`).then(r => r.json()).then(setItems);
  }, [userId]);
  const formatMoney = (n: number) => `£${(n / 100).toFixed(2)}`;
  return <ul>{items.map((i, k) => <li key={k}>{formatMoney(i.price)}</li>)}</ul>;
}

// ---------- components/Invoice.tsx ----------
export function Invoice({ total }: { total: number }) {
  const formatMoney = (n: number) => `£${(n / 100).toFixed(2)}`;
  return <strong>{formatMoney(total)}</strong>;
}

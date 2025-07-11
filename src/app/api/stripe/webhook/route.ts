import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/db";
import { usersTable } from "@/db/schema";

export const POST = async (request: Request) => {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error("Stripe secret key or webhook secret not found");
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    throw new Error("Stripe signature not found");
  }

  const text = await request.text();
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-05-28.basil",
  });

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      text,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new NextResponse("Webhook Error", { status: 400 });
  }

  switch (event.type) {
    case "invoice.paid": {
      const invoice = event.data.object as any;

      const subscriptionId = invoice.parent?.subscription_details?.subscription;
      const userId = invoice.parent?.subscription_details?.metadata?.userId;

      if (!subscriptionId || typeof subscriptionId !== "string") {
        throw new Error(
          "Subscription ID not found in invoice parent.subscription_details",
        );
      }

      if (!userId || typeof userId !== "string") {
        throw new Error(
          "User ID not found in invoice parent.subscription_details.metadata",
        );
      }

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      if (!subscription) {
        throw new Error("Subscription not found");
      }

      await db
        .update(usersTable)
        .set({
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer as string,
          plan: "essential",
        })
        .where(eq(usersTable.id, userId));

      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;

      if (!subscription.id) {
        throw new Error("Subscription ID not found in deleted event");
      }

      const userId = subscription.metadata?.userId;

      if (!userId) {
        throw new Error("User ID not found in subscription metadata");
      }

      await db
        .update(usersTable)
        .set({
          stripeSubscriptionId: null,
          stripeCustomerId: null,
          plan: null,
        })
        .where(eq(usersTable.id, userId));

      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
};

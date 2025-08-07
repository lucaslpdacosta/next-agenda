import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { db } from "@/db";
import { usersTable, sessionsTable } from "@/db/schema";

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

  console.log("Webhook event received:", event.type, event.id);

  switch (event.type) {
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      console.log("Invoice paid event:", {
        invoiceId: invoice.id,
        subscription: (invoice as Stripe.Invoice & { subscription?: string })
          .subscription,
        customer: invoice.customer,
        metadata: invoice.metadata,
      });

      const subscriptionId =
        "subscription" in invoice
          ? (invoice as Stripe.Invoice & { subscription?: string }).subscription
          : undefined;

      if (!subscriptionId || typeof subscriptionId !== "string") {
        console.log("No subscription ID found in invoice, skipping...");
        return NextResponse.json({ received: true });
      }

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const userId = subscription.metadata?.userId;
      if (!userId || typeof userId !== "string") {
        console.error(
          "User ID not found in subscription metadata:",
          subscription.metadata,
        );
        throw new Error("User ID not found in subscription metadata");
      }

      console.log("Updating user subscription:", { userId, subscriptionId });

      await db
        .update(usersTable)
        .set({
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer as string,
          plan: "essential",
        })
        .where(eq(usersTable.id, userId));

      await db.delete(sessionsTable).where(eq(sessionsTable.userId, userId));

      console.log("User subscription updated successfully");
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

      await db.delete(sessionsTable).where(eq(sessionsTable.userId, userId));

      break;
    }
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("Checkout session completed:", {
        sessionId: session.id,
        customerId: session.customer,
        subscriptionId: session.subscription,
        metadata: session.metadata,
      });

      if (session.subscription && typeof session.subscription === "string") {
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription,
        );
        const userId = subscription.metadata?.userId;

        if (userId && typeof userId === "string") {
          console.log("Updating user subscription from checkout:", {
            userId,
            subscriptionId: session.subscription,
          });

          await db
            .update(usersTable)
            .set({
              stripeSubscriptionId: subscription.id,
              stripeCustomerId: subscription.customer as string,
              plan: "essential",
            })
            .where(eq(usersTable.id, userId));

          await db
            .delete(sessionsTable)
            .where(eq(sessionsTable.userId, userId));

          console.log("User subscription updated from checkout successfully");
        } else {
          console.error(
            "User ID not found in subscription metadata from checkout",
          );
        }
      }
      break;
    }
    case "customer.subscription.created": {
      const subscription = event.data.object as Stripe.Subscription;
      console.log("Subscription created:", {
        subscriptionId: subscription.id,
        customerId: subscription.customer,
        metadata: subscription.metadata,
      });

      const userId = subscription.metadata?.userId;
      if (userId && typeof userId === "string") {
        console.log("Updating user subscription from created event:", {
          userId,
          subscriptionId: subscription.id,
        });

        await db
          .update(usersTable)
          .set({
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: subscription.customer as string,
            plan: "essential",
          })
          .where(eq(usersTable.id, userId));

        await db.delete(sessionsTable).where(eq(sessionsTable.userId, userId));

        console.log(
          "User subscription updated from created event successfully",
        );
      } else {
        console.error(
          "User ID not found in subscription metadata from created event",
        );
      }
      break;
    }
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      console.log("Subscription updated:", {
        subscriptionId: subscription.id,
        customerId: subscription.customer,
        metadata: subscription.metadata,
      });
      break;
    }

    default:
      console.log("Unhandled webhook event type:", event.type);
      break;
  }

  return NextResponse.json({ received: true });
};

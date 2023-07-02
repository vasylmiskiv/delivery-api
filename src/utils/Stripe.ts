import stripe from "stripe";
import { getEnvironmentVariables } from "../environments/environment";

export class Stripe {
  private static _stripe = new stripe(
    getEnvironmentVariables().stripe.secret_key,
    { apiVersion: "2022-11-15" }
  );

  static async checkout(data: { items: any[]; deliveryCharge: number }) {
    try {
      const session = await Stripe._stripe.checkout.sessions.create({
        line_items: [
          ...data.items.map((item) => ({
            price_data: {
              currency: "inr",
              product_data: {
                name: item.name,
                // images: ['http://localhost:8080/' + item.cover]
              },
              unit_amount: item.price * 100,
            },
            quantity: item.quantity,
          })),
          {
            price_data: {
              currency: "inr",
              product_data: {
                name: "Delivery charge",
              },
              unit_amount: data.deliveryCharge * 100,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: "http://localhost:4200/success",
        cancel_url: "http://localhost:4200/cancel",
      });
      return session;
    } catch (e) {
      throw e;
    }
  }

  static async createCustomer(name: string, email: string) {
    try {
      const params: stripe.CustomerCreateParams = {
        email: email,
        name: name,
        // source: '',
        // address: {
        //     line1: 'ABC',
        //     postal_code: '',
        //     city: '',
        //     state: '',
        //     country: ''
        // }
        // description: 'test customer',
      };

      const customer: stripe.Customer = await Stripe._stripe.customers.create(
        params
      );
      console.log(customer.id);
      return customer;
    } catch (e) {
      throw e;
    }
  }
}

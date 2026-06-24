declare module "midtrans-client" {
  interface MidtransConfig {
    isProduction: boolean;
    serverKey: string;
    clientKey?: string;
  }

  interface TransactionDetails {
    order_id: string;
    gross_amount: number;
  }

  interface CustomerDetails {
    first_name: string;
    email: string;
    phone?: string;
  }

  interface ItemDetail {
    id: string;
    price: number;
    quantity: number;
    name: string;
  }

  interface SnapParameter {
    transaction_details: TransactionDetails;
    customer_details: CustomerDetails;
    item_details?: ItemDetail[];
    callbacks?: {
      finish?: string;
    };
  }

  interface SnapTransaction {
    token: string;
    redirect_url: string;
  }

  interface MidtransNotification {
    order_id: string;
    transaction_id: string;
    transaction_status: string;
    fraud_status?: string;
    status_code: string;
    gross_amount: string;
    signature_key: string;
    payment_type: string;
  }

  class Snap {
    constructor(config: MidtransConfig);
    createTransaction(parameter: SnapParameter): Promise<SnapTransaction>;
  }

  class CoreApi {
    constructor(config: MidtransConfig);
    transaction: {
      notification(notification: unknown): Promise<MidtransNotification>;
    };
  }
}
